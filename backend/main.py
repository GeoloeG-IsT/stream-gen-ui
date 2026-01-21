# Load .env BEFORE any LangChain imports (tracing checks env vars at import time)
from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from contextlib import asynccontextmanager
from pathlib import Path
import logging
import uuid

from langchain_core.messages import HumanMessage, AIMessage, AIMessageChunk, SystemMessage
from langgraph.errors import GraphRecursionError

from config import get_settings
from models.schemas import (
    HealthResponse,
    ChatRequest,
    RetrievalResponse,
    RetrievalResult,
    AgentChatRequest,
    MarkerStrategy,
)
from rag import get_vectorstore, get_hybrid_retriever
from rag.retriever import retrieve_with_scores, deduplicate_results
from rag.chunking import chunk_all_knowledge
from rag.vectorstore import init_vectorstore
from rag.retriever import init_hybrid_retriever
from agent import get_agent_graph, get_recursion_limit
from streaming import format_text_start, format_text_delta, format_done, SSE_HEADERS

settings = get_settings()
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize RAG system on startup."""
    print("Initializing RAG system...")
    knowledge_dir = Path(__file__).parent / "knowledge"

    if knowledge_dir.exists() and any(knowledge_dir.rglob("*.md")):
        # Check if vector store already populated
        vs = get_vectorstore()
        if vs._collection.count() == 0:
            print("Vector store empty, running ingestion...")
            documents = chunk_all_knowledge(knowledge_dir)
            init_vectorstore(documents)
            init_hybrid_retriever(documents)
            print(f"Ingested {len(documents)} chunks")
        else:
            # Still need to init hybrid retriever with documents
            documents = chunk_all_knowledge(knowledge_dir)
            init_hybrid_retriever(documents)
            print(f"Loaded existing vector store with {vs._collection.count()} vectors")
    else:
        print("Warning: No knowledge base found. Run scripts/ingest.py first.")

    # Pre-initialize agent graph (validates API key)
    try:
        get_agent_graph()
        print("Agent graph initialized")
    except Exception as e:
        print(f"Warning: Agent not initialized - {e}")
        print("Set MISTRAL_API_KEY in .env to enable agent features")

    yield

    print("Shutting down...")

app = FastAPI(
    title="Berlin City Chatbot API",
    description="RAG-powered chatbot with ReAct agent for Berlin city information",
    version="0.2.0",
    lifespan=lifespan
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://188.245.108.179:3000",
        "https://stream-gen-ui.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="0.2.0")


# --- Phase 2 legacy endpoint (raw retrieval) ---

@app.post("/api/retrieve", response_model=RetrievalResponse)
async def retrieve(request: ChatRequest):
    """
    Process a chat message and return relevant knowledge base results.

    This is the Phase 2 retrieval-only endpoint. Use /api/chat for
    the full agent experience with streaming.
    """
    query = request.message.strip()

    if not query:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    retriever = get_hybrid_retriever()
    if retriever is None:
        return RetrievalResponse(
            query=query,
            results=[],
            message="Knowledge base not initialized. Run scripts/ingest.py first."
        )

    # Retrieve with scores
    raw_results = retrieve_with_scores(query, k=settings.retrieval_k)

    # Deduplicate
    unique_results = deduplicate_results(raw_results)

    if not unique_results:
        return RetrievalResponse(
            query=query,
            results=[],
            message="No relevant information found for your query."
        )

    # Format results
    results = [
        RetrievalResult(
            content=doc.page_content,
            source=doc.metadata.get("attribution", "Unknown"),
            score=round(score, 3),
            type=doc.metadata.get("type", "general")
        )
        for doc, score in unique_results
    ]

    return RetrievalResponse(query=query, results=results)


# --- Phase 3 streaming agent endpoint ---

async def stream_agent_response(messages: list, message_id: str):
    """Stream agent response token-by-token.

    Args:
        messages: List of LangChain message objects
        message_id: Unique ID for the streamed message

    Yields:
        SSE formatted events compatible with AI SDK v6
    """
    graph = get_agent_graph()
    recursion_limit = get_recursion_limit()

    # REQUIRED by AI SDK v6: Send text-start before any text-delta events
    yield format_text_start(message_id)

    try:
        # Stream with messages mode for token visibility
        # CRITICAL: stream_mode="messages" is required for token-by-token streaming
        async for event in graph.astream(
            {"messages": messages},
            config={"recursion_limit": recursion_limit},
            stream_mode="messages"
        ):
            # event is a tuple: (message_chunk, metadata)
            if isinstance(event, tuple) and len(event) == 2:
                message_chunk, metadata = event

                # Only stream AIMessageChunk content (not tool calls or tool messages)
                # ToolMessage contains raw search results - don't send to user
                if isinstance(message_chunk, AIMessageChunk) and message_chunk.content:
                    # Skip if this is a tool call (no text content for user)
                    if not message_chunk.tool_calls:
                        yield format_text_delta(message_chunk.content, message_id)

    except GraphRecursionError:
        logger.warning(f"Agent hit recursion limit ({recursion_limit})")
        yield format_text_delta(
            "\n\nI've reached the maximum number of steps. Please try rephrasing your question.",
            message_id
        )
    except Exception as e:
        logger.error(f"Agent stream error: {e}", exc_info=True)
        yield format_text_delta(
            "\n\nI encountered an error processing your request. Please try again.",
            message_id
        )

    yield format_done()


@app.post("/api/chat")
async def chat_stream(
    request: AgentChatRequest,
    marker: str = "xml"
):
    """
    Streaming chat endpoint with ReAct agent.

    Accepts messages array matching AI SDK format, streams response via SSE.

    The response uses AI SDK v6 stream protocol:
    - text-delta events for streaming content
    - [DONE] marker to signal completion

    Headers include x-vercel-ai-ui-message-stream: v1 for AI SDK compatibility.

    Args:
        request: Chat request with messages array
        marker: Output format strategy ("xml" or "llm-ui"), defaults to "xml"
    """
    # Validate marker parameter
    valid_markers = [m.value for m in MarkerStrategy]
    if marker not in valid_markers:
        raise HTTPException(
            status_code=400,
            detail={"error": "Invalid marker", "valid_values": valid_markers}
        )

    logger.info(f"Chat request with marker={marker}")

    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages array cannot be empty")

    # Convert to LangChain message format
    lc_messages = []
    for msg in request.messages:
        if msg.role == "user":
            lc_messages.append(HumanMessage(content=msg.content))
        elif msg.role == "assistant":
            lc_messages.append(AIMessage(content=msg.content))
        elif msg.role == "system":
            lc_messages.append(SystemMessage(content=msg.content))

    if not lc_messages:
        raise HTTPException(status_code=400, detail="No valid messages found")

    # Generate message ID for this response
    message_id = f"msg-{uuid.uuid4().hex[:8]}"

    # Return streaming response with AI SDK headers
    return StreamingResponse(
        stream_agent_response(lc_messages, message_id),
        media_type="text/event-stream",
        headers={**SSE_HEADERS, "X-Marker-Strategy": marker},
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
