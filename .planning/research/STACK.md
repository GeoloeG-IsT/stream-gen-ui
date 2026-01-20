# Technology Stack Research

**Project:** neuraflow.de City Chatbot
**Research Date:** January 20, 2026
**Focus:** FastAPI backend with LangChain/LangGraph ReAct agent, Mistral LLM, RAG over markdown files

## Executive Summary

This research covers the standard 2025/2026 stack for building a production-ready FastAPI backend with streaming SSE, LangChain/LangGraph ReAct agent architecture, Mistral LLM integration, and RAG over markdown documents. The recommended stack prioritizes:

1. **LangGraph over LangChain agents** for stateful, production-grade ReAct implementation
2. **ChromaDB over FAISS** for PoC/MVP vector storage with metadata filtering
3. **Modern embedding models** (Qwen3 or all-mpnet-base-v2) over older all-MiniLM-L6-v2
4. **Pydantic Settings** for configuration management
5. **Structlog** for production JSON logging
6. **Uvicorn with Gunicorn** for production deployment (future consideration)

**Overall Confidence:** HIGH (all recommendations verified with official docs and PyPI as of Jan 2026)

---

## Recommended Stack

### 1. Backend Framework: FastAPI

**Version:** 0.128.0 (released Dec 27, 2025)
**Verification:** [PyPI - FastAPI](https://pypi.org/project/fastapi/)

**Why FastAPI:**
- Native async/await support for streaming SSE responses
- Built-in Pydantic integration for structured entity output (Contact, CalendarEvent)
- StreamingResponse class designed for SSE
- Production-proven for LLM streaming applications
- Excellent developer experience with automatic OpenAPI docs

**Key Dependencies:**
- `uvicorn[standard]` 0.40.0 - ASGI server for development (released Dec 21, 2025)
- `pydantic` 2.x - Comes with FastAPI, used for settings and entity schemas
- `pydantic-settings` 2.12.0 - For environment variable management (released Nov 10, 2025)

**Production Deployment Pattern:**
```bash
# Development
uvicorn main:app --reload

# Production (future milestone)
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker
```

**Rationale:**
- FastAPI + Uvicorn is the 2026 standard for Python async APIs
- Gunicorn + Uvicorn workers enables multi-core utilization for production
- Worker count should equal available CPU cores

**Sources:**
- [FastAPI Production Best Practices](https://render.com/articles/fastapi-production-deployment-best-practices)
- [FastAPI Setup Guide 2026](https://www.zestminds.com/blog/fastapi-requirements-setup-guide-2025/)
- [GitHub - FastAPI Best Practices](https://github.com/zhanymkanov/fastapi-best-practices)

**Confidence:** HIGH

---

### 2. LLM Framework: LangGraph + LangChain

**Versions:**
- `langgraph` 1.0.6 (released Jan 12, 2026) - Production/Stable
- `langchain` 1.2.6 (released Jan 16, 2026)
- `langchain-core` - Installed with langchain
- `langchain-community` 0.4.1 (released Oct 27, 2025) - For document loaders

**Verification:** [PyPI - LangGraph](https://pypi.org/project/langgraph/), [PyPI - LangChain](https://pypi.org/project/langchain/)

**Why LangGraph for ReAct Agent:**
LangGraph reached v1.0 milestone and is explicitly designed for production-grade, stateful agents. LangChain agents are actually built on LangGraph internally as of 2026.

**Key advantages:**
1. **State Management** - Built-in checkpointing for conversation memory
2. **ReAct Pattern** - `create_react_agent` provides production-ready implementation
3. **Streaming Support** - Native async streaming for SSE integration
4. **Tool Calling** - Structured output and function calling for entity extraction
5. **Cyclic Workflows** - Agents can loop, branch, and self-correct

**When to Use Each:**
- **LangGraph:** Complex state management, multi-turn conversations, production agents (YOUR USE CASE)
- **LangChain:** Simple one-shot tasks, quick prototyping

**Architecture Pattern:**
```python
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

# Create agent with tools and checkpointing
async with AsyncSqliteSaver.from_conn_string(":memory:") as checkpointer:
    agent = create_react_agent(
        model=llm,
        tools=[retrieve_contacts_tool, retrieve_events_tool],
        checkpointer=checkpointer
    )
```

**Sources:**
- [LangGraph vs LangChain 2026](https://langchain-tutorials.github.io/langgraph-vs-langchain-2026/)
- [LangChain and LangGraph 1.0 Milestones](https://www.blog.langchain.com/langchain-langgraph-1dot0/)
- [Building ReAct Agents with LangGraph](https://dylancastillo.co/posts/react-agent-langgraph.html)
- [How to Create ReAct Agent from Scratch](https://langchain-ai.github.io/langgraph/how-tos/react-agent-from-scratch/)

**Confidence:** HIGH

---

### 3. LLM Provider: Mistral AI via LangChain Integration

**Version:** `langchain-mistralai` 1.1.1 (released Dec 12, 2025)
**Verification:** [PyPI - langchain-mistralai](https://pypi.org/project/langchain-mistralai/)

**Installation:**
```bash
pip install -U langchain-mistralai
```

**Why Mistral:**
- Native LangChain integration via official package
- Tool calling support (required for ReAct pattern)
- Structured output support for entity extraction
- Cost-effective for PoC/MVP
- European data residency option (relevant for German city use case)

**Key Features:**
- `ChatMistralAI` - Chat model integration
- `MistralAIEmbeddings` - Embedding model (alternative to sentence-transformers)
- Tool calling compatible with OpenAI API format
- Structured output via `with_structured_output()` method

**Configuration:**
```python
from langchain_mistralai import ChatMistralAI

llm = ChatMistralAI(
    model="mistral-large-latest",  # or mistral-small for cost optimization
    temperature=0,  # Deterministic for entity extraction
    api_key=os.getenv("MISTRAL_API_KEY")
)
```

**Model Recommendations:**
- **mistral-large-latest** - Best accuracy for complex entity extraction
- **mistral-small** - Cost-effective for simpler queries (consider for MVP)

**Sources:**
- [LangChain Mistral Integration Docs](https://docs.langchain.com/oss/python/integrations/chat/mistralai)
- [LangChain Mistral API Reference](https://reference.langchain.com/python/integrations/langchain_mistralai/)

**Confidence:** HIGH

---

### 4. Vector Store: ChromaDB

**Version:** `chromadb` 1.4.1 (released Jan 14, 2026)
**Verification:** [PyPI - ChromaDB](https://pypi.org/project/chromadb/)

**Why ChromaDB over FAISS:**

**ChromaDB Advantages:**
1. **Developer-friendly API** - Collections, metadata, filtering out of the box
2. **Persistence** - Built-in document storage layer (FAISS has none)
3. **Metadata Filtering** - Critical for filtering by contact type or event date
4. **Zero Configuration** - Embedded mode runs in-process, no separate server
5. **Perfect for PoC/MVP** - Fast prototype-to-production path

**FAISS Limitations:**
- No document storage (just vectors)
- No metadata management
- No REST API
- Requires custom wrapper for persistence
- Not suitable for multi-user applications without significant engineering

**Decision Framework (from research):**
- **0-200k vectors:** ChromaDB is optimal for RAG with metadata
- **200k-10M vectors:** FAISS with HNSW for performance (not your use case)
- **Learning/Prototyping:** ChromaDB (matches your PoC phase)

**Installation:**
```bash
pip install chromadb
```

**Architecture Pattern:**
```python
import chromadb
from langchain_community.vectorstores import Chroma

# Persistent client
client = chromadb.PersistentClient(path="./chroma_db")

# LangChain integration
vectorstore = Chroma(
    client=client,
    collection_name="city_knowledge",
    embedding_function=embeddings
)
```

**Sources:**
- [ChromaDB vs FAISS Comprehensive Guide](https://mohamedbakrey094.medium.com/chromadb-vs-faiss-a-comprehensive-guide-for-vector-search-and-ai-applications-39762ed1326f)
- [Vector Databases for RAG: FAISS vs Chroma vs Pinecone](https://medium.com/@priyaskulkarni/vector-databases-for-rag-faiss-vs-chroma-vs-pinecone-6797bd98277d)
- [Best Vector Databases 2025](https://www.firecrawl.dev/blog/best-vector-databases-2025)

**Confidence:** HIGH

---

### 5. Embeddings: Sentence Transformers

**Version:** `sentence-transformers` 5.2.0 (released Dec 11, 2025)
**Verification:** [PyPI - sentence-transformers](https://pypi.org/project/sentence-transformers/)

**Recommended Model:** `all-mpnet-base-v2`

**Why all-mpnet-base-v2:**
- Best quality among sentence-transformers models
- 768-dimensional embeddings (vs 384 for MiniLM)
- 87-88% accuracy on STS-B benchmark (vs 84-85% for MiniLM)
- Only 110M parameters - still fast enough for PoC
- Proven for semantic search in 2026

**Alternative: all-MiniLM-L6-v2**
- 5x faster than MPNet, 22M parameters
- Good for resource-constrained environments
- Consider for production if latency is critical

**Newer Models to Consider (2026):**
Based on MTEB leaderboard research:

1. **Qwen3-Embedding-0.6B** - Best overall (100+ languages, flexible dimensions 32-1024)
2. **EmbeddingGemma-300M** - Lightweight (200MB RAM), multilingual
3. **NVIDIA NV-Embed** - Highest MTEB score (69.32) but larger

**Recommendation for MVP:** Start with `all-mpnet-base-v2` (proven, simple). Consider Qwen3 for production if multilingual support needed.

**Installation:**
```bash
pip install sentence-transformers
```

**Usage:**
```python
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-mpnet-base-v2')
embeddings = model.encode(documents)
```

**Sources:**
- [Top Embedding Models 2026](https://artsmart.ai/blog/top-embedding-models-in-2025/)
- [Best Open-Source Embedding Models 2026](https://www.bentoml.com/blog/a-guide-to-open-source-embedding-models)
- [Sentence-Transformers all-MiniLM-L6-v2](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2)
- [MTEB Leaderboard](https://huggingface.co/spaces/mteb/leaderboard)

**Confidence:** HIGH

---

### 6. Document Processing: LangChain Text Splitters

**Version:** `langchain-text-splitters` 1.1.0 (released Dec 14, 2025)
**Verification:** [PyPI - langchain-text-splitters](https://pypi.org/project/langchain-text-splitters/)

**Why LangChain Splitters:**
- `MarkdownHeaderTextSplitter` preserves document structure
- Splits on headers (#, ##, ###) maintaining semantic boundaries
- Can combine with `RecursiveCharacterTextSplitter` for chunk size control
- Metadata preservation (header hierarchy stored in chunk metadata)

**Recommended Approach:**
```python
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_community.document_loaders import UnstructuredMarkdownLoader

# Load markdown
loader = UnstructuredMarkdownLoader("./docs/contacts.md")
docs = loader.load()

# Split by headers
headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
    ("###", "Header 3"),
]

markdown_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=headers_to_split_on
)
splits = markdown_splitter.split_text(markdown_content)
```

**Why Markdown is Optimal:**
Research shows markdown is superior to JSON/XML for embeddings because it's:
- Human-readable
- Context-rich
- LLM-friendly
- Yields better retrieval results

**Sources:**
- [How to Split Markdown by Headers](https://python.langchain.com/docs/how_to/markdown_header_metadata_splitter/)
- [LangChain Text Splitters Docs](https://docs.langchain.com/oss/python/integrations/splitters)
- [Markdown: A Smarter Choice for Embeddings](https://medium.com/@kanishk.khatter/markdown-a-smarter-choice-for-embeddings-than-json-or-xml-70791ece24df)

**Confidence:** HIGH

---

### 7. SSE Streaming: FastAPI StreamingResponse

**No Additional Package Required** - Built into FastAPI

**Implementation Pattern:**
```python
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from sse_starlette.sse import EventSourceResponse  # Optional helper

async def event_generator():
    async for chunk in agent.astream_events(...):
        if chunk["event"] == "on_chat_model_stream":
            yield {
                "event": "message",
                "data": chunk["data"]["chunk"].content
            }

@app.post("/api/chat")
async def chat(request: ChatRequest):
    return EventSourceResponse(event_generator())
```

**Alternative Package:** `sse-starlette` or `fastapi-sse`
- Consider if you need advanced SSE features
- Not required for basic streaming

**CORS Configuration:**
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**SSE Format Requirements:**
- Content-Type: `text/event-stream`
- Each message ends with `\n\n`
- Format: `event: message\ndata: {json}\n\n`

**Sources:**
- [FastAPI and SSE: Building Streamable MCP Servers](https://www.aubergine.co/insights/a-guide-to-building-streamable-mcp-servers-with-fastapi-and-sse)
- [Integrating LangChain with FastAPI for Streaming](https://dev.to/louis-sanna/integrating-langchain-with-fastapi-for-asynchronous-streaming-5d0o)
- [Streaming Responses with LangChain and FastAPI](https://medium.com/@shijotck/streaming-responses-with-langchain-and-fastapi-72e9cfd8088f)
- [FastAPI CORS Documentation](https://fastapi.tiangolo.com/tutorial/cors/)

**Confidence:** HIGH

---

### 8. Persistence: LangGraph SQLite Checkpointer

**Version:** `langgraph-checkpoint-sqlite` 3.0.3 (released Jan 19, 2026)
**Verification:** [PyPI - langgraph-checkpoint-sqlite](https://pypi.org/project/langgraph-checkpoint-sqlite/)

**Why SQLite for PoC:**
- Zero configuration
- File-based persistence (or in-memory for testing)
- Async support via aiosqlite
- Production-ready for single-instance deployments
- Upgrade path to Postgres for multi-instance

**Installation:**
```bash
pip install langgraph-checkpoint-sqlite
```

**Usage:**
```python
from langgraph.checkpoint.sqlite.aio import AsyncSqliteSaver

async with AsyncSqliteSaver.from_conn_string("./checkpoints.db") as checkpointer:
    agent = create_react_agent(model, tools, checkpointer=checkpointer)
```

**Upgrade Path:**
- PoC/MVP: SQLite (file-based or :memory:)
- Production (multi-instance): `langgraph-checkpoint-postgres`

**Sources:**
- [LangGraph Persistence Docs](https://docs.langchain.com/oss/python/langgraph/persistence)
- [Simple LangGraph with AsyncSqliteSaver](https://medium.com/@devwithll/simple-langgraph-implementation-with-memory-asyncsqlitesaver-checkpointer-fastapi-54f4e4879a2e)
- [LangGraph v0.2: Checkpointer Libraries](https://www.blog.langchain.com/langgraph-v0-2/)

**Confidence:** HIGH

---

### 9. Configuration Management: Pydantic Settings

**Version:** Included with `pydantic-settings` 2.12.0 (released Nov 10, 2025)
**Verification:** [PyPI - pydantic-settings](https://pypi.org/project/pydantic-settings/)

**Why Pydantic Settings:**
- Type-safe configuration
- Automatic .env file loading
- Validation on startup (fail fast)
- @lru_cache decorator for singleton pattern
- FastAPI-native approach

**Installation:**
```bash
pip install pydantic-settings python-dotenv
```

**Pattern:**
```python
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    mistral_api_key: str
    chroma_db_path: str = "./chroma_db"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding='utf-8'
    )

@lru_cache
def get_settings():
    return Settings()
```

**Sources:**
- [FastAPI Settings and Environment Variables](https://fastapi.tiangolo.com/advanced/settings/)
- [Pydantic Settings Management](https://docs.pydantic.dev/latest/concepts/pydantic_settings/)
- [Centralizing FastAPI Configuration](https://davidmuraya.com/blog/centralizing-fastapi-configuration-with-pydantic-settings-and-env-files/)

**Confidence:** HIGH

---

### 10. Logging: Structlog (Production)

**Version:** `structlog` (latest stable)
**Priority:** MEDIUM (defer to post-MVP)

**Why Structlog:**
- JSON logging for production
- Correlation IDs for request tracing
- Integration with Datadog, ELK, Splunk
- Performance overhead: ~4%

**Installation:**
```bash
pip install structlog
```

**When to Add:**
- Not critical for PoC
- Add before production deployment
- Required for multi-instance debugging

**Alternative:** Python's built-in `logging` module is sufficient for PoC.

**Sources:**
- [Structured JSON Logging with FastAPI](https://www.sheshbabu.com/posts/fastapi-structured-json-logging/)
- [FastAPI Middleware Patterns 2026](https://johal.in/fastapi-middleware-patterns-custom-logging-metrics-and-error-handling-2026-2/)
- [Integrating FastAPI with Structlog](https://wazaari.dev/blog/fastapi-structlog-integration)

**Confidence:** MEDIUM (feature exists, priority assessed based on project phase)

---

## Complete Package List with Versions

### Core Dependencies

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `fastapi` | 0.128.0 | Backend framework | HIGH |
| `uvicorn[standard]` | 0.40.0 | ASGI server | HIGH |
| `langgraph` | 1.0.6 | ReAct agent framework | HIGH |
| `langchain` | 1.2.6 | LLM orchestration | HIGH |
| `langchain-mistralai` | 1.1.1 | Mistral integration | HIGH |
| `langchain-community` | 0.4.1 | Document loaders | HIGH |
| `langchain-text-splitters` | 1.1.0 | Markdown splitting | HIGH |
| `chromadb` | 1.4.1 | Vector store | HIGH |
| `sentence-transformers` | 5.2.0 | Embeddings | HIGH |
| `langgraph-checkpoint-sqlite` | 3.0.3 | Agent persistence | HIGH |
| `pydantic-settings` | 2.12.0 | Configuration | HIGH |
| `python-dotenv` | latest | .env file support | HIGH |

### Development Dependencies

| Package | Version | Purpose | Confidence |
|---------|---------|---------|------------|
| `pytest` | latest | Testing framework | HIGH |
| `pytest-asyncio` | latest | Async test support | HIGH |
| `httpx` | latest | Test client | HIGH |
| `black` | latest | Code formatting | MEDIUM |
| `ruff` | latest | Linting | MEDIUM |

### Optional/Future

| Package | Version | Purpose | Priority |
|---------|---------|---------|----------|
| `structlog` | latest | JSON logging | Post-MVP |
| `gunicorn` | latest | Production server | Post-MVP |
| `sse-starlette` | latest | Advanced SSE features | If needed |

---

## Installation Commands

### Minimal PoC Installation
```bash
# Core backend
pip install fastapi==0.128.0 uvicorn[standard]==0.40.0

# LLM framework
pip install langgraph==1.0.6 langchain==1.2.6

# Mistral integration
pip install langchain-mistralai==1.1.1

# RAG components
pip install chromadb==1.4.1 sentence-transformers==5.2.0

# Document processing
pip install langchain-community==0.4.1 langchain-text-splitters==1.1.0

# Persistence and config
pip install langgraph-checkpoint-sqlite==3.0.3
pip install pydantic-settings==2.12.0 python-dotenv

# Development
pip install pytest pytest-asyncio httpx
```

### requirements.txt
```
fastapi==0.128.0
uvicorn[standard]==0.40.0
langgraph==1.0.6
langchain==1.2.6
langchain-mistralai==1.1.1
langchain-community==0.4.1
langchain-text-splitters==1.1.0
chromadb==1.4.1
sentence-transformers==5.2.0
langgraph-checkpoint-sqlite==3.0.3
pydantic-settings==2.12.0
python-dotenv
pytest
pytest-asyncio
httpx
```

---

## What NOT to Use

### Avoid: LangChain Legacy Agents
**Why:** LangChain's `create_react_agent` from `langchain.agents` has been superseded by LangGraph's implementation. LangGraph provides better state management, streaming, and production features.

**Instead:** Use `langgraph.prebuilt.create_react_agent`

**Source:** [LangGraph vs LangChain 2026](https://langchain-tutorials.github.io/langgraph-vs-langchain-2026/)

### Avoid: FAISS for PoC/MVP
**Why:**
- No persistence layer
- No metadata filtering
- Requires custom wrapper code
- Adds complexity without benefit at this scale

**Instead:** Use ChromaDB with embedded mode

**Source:** [ChromaDB vs FAISS Comparison](https://mohamedbakrey094.medium.com/chromadb-vs-faiss-a-comprehensive-guide-for-vector-search-and-ai-applications-39762ed1326f)

### Avoid: all-MiniLM-L6-v2 Unless Latency Critical
**Why:** all-mpnet-base-v2 offers significantly better accuracy (87-88% vs 84-85%) with acceptable performance for PoC.

**Instead:** Use all-mpnet-base-v2 for better retrieval quality

**Exception:** If production shows latency issues, then downgrade to MiniLM

**Source:** [Sentence Transformer Models Comparison](https://milvus.io/ai-quick-reference/what-are-some-popular-pretrained-sentence-transformer-models-and-how-do-they-differ-for-example-allminilml6v2-vs-allmpnetbasev2)

### Avoid: OpenAI Embeddings for Cost Control
**Why:** OpenAI embeddings require API calls (cost per token). Sentence-transformers run locally (zero marginal cost).

**Instead:** Use sentence-transformers for MVP, evaluate OpenAI if quality insufficient

**Exception:** If Mistral's embedding model (`MistralAIEmbeddings`) is included in your API plan, consider it for consistency

### Avoid: WebSockets for Streaming
**Why:** SSE is simpler, sufficient for uni-directional streaming (server to client). WebSockets add complexity without benefit.

**Instead:** Use FastAPI StreamingResponse with SSE

**When to Use WebSockets:** Bi-directional real-time communication (e.g., collaborative editing). Not your use case.

**Source:** [Why SSE over WebSockets](https://fictionally-irrelevant.vercel.app/posts/why-you-should-use-server-side-events-over-web-sockets-and-long-polling)

### Avoid: Synchronous Document Loading
**Why:** FastAPI is async-first. Blocking I/O in endpoints degrades performance.

**Instead:** Use async document loaders and async ChromaDB operations

**Pattern:**
```python
# Bad
docs = loader.load()  # Blocks event loop

# Good
docs = await loader.aload()  # Non-blocking
```

---

## Architecture Integration Points

### Frontend → Backend Interface

**Endpoint:** `POST /api/chat`
**Format:** SSE (text/event-stream)

**Request:**
```typescript
// Frontend sends
{
  "message": "Wann ist das nächste Stadtfest?",
  "sessionId": "uuid-v4"
}
```

**Response Stream:**
```
event: message
data: {"type": "token", "content": "Das"}

event: message
data: {"type": "token", "content": " nächste"}

event: entity
data: {"type": "CalendarEvent", "data": {...}}

event: done
data: {"sessionId": "uuid-v4"}
```

### Structured Output Integration

**Pydantic Models (Shared with Frontend):**
```python
from pydantic import BaseModel
from datetime import datetime

class Contact(BaseModel):
    id: str
    name: str
    department: str
    email: str
    phone: str

class CalendarEvent(BaseModel):
    id: str
    title: str
    date: datetime
    location: str
    description: str
```

**LangGraph Tool with Structured Output:**
```python
from langchain_core.tools import tool

@tool
def retrieve_contacts(query: str) -> list[Contact]:
    """Retrieve city contacts matching the query."""
    results = vectorstore.similarity_search(query, k=3)
    # Parse and validate with Pydantic
    return [Contact(**result.metadata) for result in results]
```

**LLM Structured Output:**
```python
llm_with_structure = llm.with_structured_output(Contact)
contact = llm_with_structure.invoke("Extract contact from: ...")
```

**Source:** [LangChain Structured Output](https://docs.langchain.com/oss/python/langchain/structured-output)

---

## Confidence Assessment

| Component | Confidence | Notes |
|-----------|------------|-------|
| FastAPI | HIGH | Industry standard, verified v0.128.0 |
| LangGraph | HIGH | v1.0 production-stable, official recommendation |
| Mistral Integration | HIGH | Official langchain-mistralai package verified |
| ChromaDB | HIGH | Proven for this scale, verified v1.4.1 |
| Embeddings | HIGH | all-mpnet-base-v2 proven, Qwen3 alternative researched |
| Text Splitters | HIGH | LangChain official tooling, markdown-optimized |
| SSE Streaming | HIGH | FastAPI native, multiple production examples |
| Checkpointing | HIGH | SQLite suitable for PoC, upgrade path clear |
| Pydantic Settings | HIGH | FastAPI-native pattern, widely adopted |
| Structlog | MEDIUM | Proven for production, not critical for PoC |

**Overall Stack Confidence:** HIGH

All core components verified with official PyPI sources as of January 2026. Package versions are current and production-stable (LangGraph v1.0, FastAPI actively maintained).

---

## Research Gaps and Future Validation

### Areas Requiring Phase-Specific Research

1. **Mistral Model Selection:**
   - **Gap:** Exact pricing and performance of mistral-large vs mistral-small not tested
   - **Validation:** Benchmark both models in Phase 2 with sample queries
   - **Impact:** LOW (both models supported, pricing publicly available)

2. **Embedding Model Final Choice:**
   - **Gap:** Trade-off between all-mpnet-base-v2 (proven) vs Qwen3 (newer, multilingual)
   - **Validation:** A/B test retrieval quality with city data
   - **Impact:** MEDIUM (affects retrieval quality)

3. **Chunk Size Optimization:**
   - **Gap:** Optimal markdown chunk size for city contacts/events
   - **Validation:** Experiment with header-based splitting + recursive splitting
   - **Impact:** MEDIUM (affects retrieval precision)

4. **SSE Message Format:**
   - **Gap:** Exact JSON schema for entity streaming not defined
   - **Validation:** Define contract between backend and existing frontend
   - **Impact:** LOW (frontend already exists, format likely specified)

5. **Production Deployment:**
   - **Gap:** Gunicorn worker count, connection pooling, container orchestration
   - **Validation:** Defer to production deployment phase
   - **Impact:** NONE for PoC/MVP

### Recommended Next Steps

1. **Phase 1 (PoC):** Implement with recommended stack as-is
2. **Phase 2 (MVP):** Benchmark embedding models and Mistral model selection
3. **Phase 3 (Production):** Add Structlog, Gunicorn, monitoring

---

## Sources Summary

All recommendations verified against:
- **Official Documentation:** FastAPI, LangChain, LangGraph, Pydantic
- **PyPI Package Pages:** Version verification for all packages (Jan 2026)
- **Production Guides:** 2025-2026 articles on FastAPI production deployment
- **Benchmark Data:** MTEB leaderboard for embeddings, ChromaDB vs FAISS comparisons

**Key Sources:**
1. [FastAPI Production Best Practices](https://render.com/articles/fastapi-production-deployment-best-practices)
2. [LangGraph vs LangChain 2026](https://langchain-tutorials.github.io/langgraph-vs-langchain-2026/)
3. [LangChain 1.0 Announcement](https://www.blog.langchain.com/langchain-langgraph-1dot0/)
4. [ChromaDB vs FAISS Guide](https://mohamedbakrey094.medium.com/chromadb-vs-faiss-a-comprehensive-guide-for-vector-search-and-ai-applications-39762ed1326f)
5. [Top Embedding Models 2026](https://www.bentoml.com/blog/a-guide-to-open-source-embedding-models)
6. [FastAPI SSE Streaming Guide](https://www.aubergine.co/insights/a-guide-to-building-streamable-mcp-servers-with-fastapi-and-sse)

**Verification Date:** January 20, 2026
**All PyPI versions verified as of:** January 2026

---

## Quick Start Reference

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Create .env File
```env
MISTRAL_API_KEY=your_api_key_here
CHROMA_DB_PATH=./chroma_db
```

### 3. Project Structure
```
backend/
├── main.py              # FastAPI app entry
├── config.py            # Pydantic settings
├── agent.py             # LangGraph ReAct agent
├── tools/
│   ├── contacts.py      # Contact retrieval tool
│   └── events.py        # Event retrieval tool
├── models/
│   └── entities.py      # Pydantic models (Contact, CalendarEvent)
├── rag/
│   ├── loader.py        # Markdown document loader
│   └── vectorstore.py   # ChromaDB setup
└── requirements.txt
```

### 4. Run Development Server
```bash
uvicorn main:app --reload
```

### 5. Test Streaming Endpoint
```bash
curl -N -X POST http://localhost:8000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Wer ist der Bürgermeister?", "sessionId": "test-123"}'
```

---

## End of Stack Research

**Status:** COMPLETE
**Confidence:** HIGH
**Ready for:** Roadmap creation, architecture design, implementation

**Next Steps:**
1. Synthesize with FEATURES.md, ARCHITECTURE.md, PITFALLS.md
2. Create roadmap with phase structure
3. Begin implementation with Phase 1 (PoC)
