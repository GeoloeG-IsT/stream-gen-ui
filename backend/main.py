from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from pathlib import Path

from config import get_settings
from models.schemas import (
    HealthResponse,
    ChatRequest,
    RetrievalResponse,
    RetrievalResult
)
from rag import get_vectorstore, get_hybrid_retriever
from rag.retriever import retrieve_with_scores, deduplicate_results
from rag.chunking import chunk_all_knowledge
from rag.vectorstore import init_vectorstore
from rag.retriever import init_hybrid_retriever

settings = get_settings()

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

    yield

    print("Shutting down...")

app = FastAPI(
    title="Berlin City Chatbot API",
    description="RAG-powered chatbot for Berlin city information",
    version="0.1.0",
    lifespan=lifespan
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint."""
    return HealthResponse(status="healthy", version="0.1.0")

@app.post("/api/chat", response_model=RetrievalResponse)
async def chat(request: ChatRequest):
    """
    Process a chat message and return relevant knowledge base results.

    This is Phase 2 retrieval-only endpoint. Phase 3 will add the ReAct agent
    that synthesizes responses from these results.
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.host, port=settings.port)
