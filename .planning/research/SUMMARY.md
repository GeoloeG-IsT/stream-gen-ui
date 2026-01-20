# Project Research Summary

**Project:** Stream Gen UI — City Chatbot Backend
**Domain:** FastAPI backend with LangGraph ReAct agent, RAG over markdown files, SSE streaming
**Researched:** 2026-01-20
**Confidence:** HIGH

## Executive Summary

This is a FastAPI backend for a city government chatbot that uses a ReAct agent pattern with RAG to answer queries about city contacts, events, and services. The recommended approach is LangGraph (v1.0+) for production-grade agent orchestration, ChromaDB for vector storage at PoC scale, and Mistral LLM with native structured output for entity formatting. The system streams responses via Server-Sent Events (SSE) to a Next.js frontend, with the agent dynamically deciding when to query the RAG tool versus answering conversationally.

The architecture follows an "agentic RAG" pattern where RAG is wrapped as a tool rather than always executing. This enables natural conversation flow while maintaining factual grounding when needed. The stack is mature and well-documented, with LangGraph's v1.0 milestone (Jan 2026) providing production-ready agent capabilities that surpass legacy LangChain agents. ChromaDB is optimal for 0-200k vectors with built-in persistence and metadata filtering, avoiding the complexity of FAISS for PoC.

Key risks center on streaming implementation (using `.astream()` not `.invoke()`), embedding dimension consistency across indexing and querying, and proper markdown chunking that preserves code blocks. These are well-documented pitfalls with clear mitigation strategies. The research confidence is high across all areas, with all core packages verified via PyPI as of January 2026 and implementation patterns sourced from official documentation and recent production guides.

## Key Findings

### Recommended Stack

**LangGraph v1.0.6 reached production stability** in January 2026 and is explicitly designed for stateful, production-grade ReAct agents. It supersedes legacy LangChain agents with superior state management, native streaming support, and cyclic workflow capabilities. The combination of FastAPI's native async/await, LangGraph's streaming agent execution, and ChromaDB's zero-configuration embedded mode provides a clear prototype-to-production path.

**Core technologies:**
- **LangGraph 1.0.6** — ReAct agent orchestration with checkpointing and streaming — production-stable, surpasses legacy LangChain agents
- **FastAPI 0.128.0** — Backend framework with native SSE streaming — industry standard for async Python APIs
- **ChromaDB 1.4.1** — Vector store for RAG — developer-friendly, built-in persistence, optimal for 0-200k vectors
- **Mistral via langchain-mistralai 1.1.1** — LLM with tool calling and structured output — European data residency, cost-effective
- **sentence-transformers 5.2.0** — Embeddings with all-mpnet-base-v2 model — best quality among sentence-transformers (768d, 87-88% STS-B)
- **AsyncSqliteSaver 3.0.3** — Conversation memory persistence — zero-config for PoC, upgrade path to Postgres
- **Pydantic Settings 2.12.0** — Type-safe configuration management — FastAPI-native, .env file loading

**Avoid for PoC:**
- FAISS (no persistence layer, requires custom wrapper)
- Legacy LangChain agents (streaming limitations)
- all-MiniLM-L6-v2 (lower accuracy than all-mpnet-base-v2)
- WebSockets for streaming (SSE is simpler for uni-directional)

### Expected Features

Research identified 11 table stakes features (must-have), 11 differentiators (nice-to-have), and 8 anti-features (explicitly avoid for PoC).

**Must have (table stakes):**
- Vector-based document retrieval — semantic search over city knowledge base
- Hybrid retrieval (keyword + semantic) — city use case needs both "permit #123" and "where to read books"
- ReAct agent loop — thought-action-observation cycle with max iteration limit
- Tool calling for retrieval — agent decides when to query RAG vs answer conversationally
- Structured output (Contact, CalendarEvent entities) — frontend expects JSON for component rendering
- Source attribution — cite document references for credibility and hallucination reduction
- Message history tracking — session-scoped conversation memory for multi-turn dialogue
- Basic error handling — graceful degradation when retrieval/tools fail

**Should have (competitive):**
- Streaming responses — your UI already supports this; LangGraph provides native streaming via `.astream()`
- Agent trace logging — essential for debugging; easy with LangSmith/Langfuse integration
- Hybrid retrieval — improves recall for city-specific queries

**Defer (v2+):**
- Query rewriting — optimize retrieval accuracy post-PoC
- Reranking — initial retrieval quality may suffice
- Clarification questions — high complexity, test simpler approach first
- All personalization/user preference features — stateless chatbot acceptable for PoC
- Multi-language support — English-only for validation phase

**Anti-features (do NOT build):**
- Multi-language support — massive scope increase (translation, multilingual embeddings)
- Advanced personalization — requires auth, persistent storage, privacy considerations
- Complex dialogue management — ReAct agent handles multi-turn naturally through history
- Voice/speech interface — orthogonal to testing RAG+ReAct capabilities
- Custom fine-tuned models — foundation models handle city queries well via RAG

### Architecture Approach

The architecture follows a clear separation: Next.js frontend → FastAPI router → Agent service → RAG tool → Vector store. The ReAct agent uses LangGraph's prebuilt `create_react_agent` with a RAG tool wrapped via `@tool` decorator, enabling the agent to decide when retrieval is necessary versus conversational responses. SSE streaming is achieved through FastAPI's `StreamingResponse` combined with LangGraph's `.astream()` method, which yields token-by-token chunks.

**Major components:**
1. **FastAPI Router Layer** (`routers/chat.py`) — HTTP endpoint handling, request validation, SSE StreamingResponse setup
2. **Agent Service** (`services/agent.py`) — ReAct agent orchestration using LangGraph, streaming via `.astream()`, structured output formatting
3. **RAG Tool** (`tools/rag.py`) — Vector store query wrapped in `@tool` decorator with clear docstring for agent reasoning
4. **Vector Store Service** (`services/vector_store.py`) — ChromaDB initialization, markdown loading with `MarkdownHeaderTextSplitter`, similarity search
5. **LLM Service** (`services/llm.py`) — Mistral client configuration with streaming enabled, structured output binding for Contact/CalendarEvent entities
6. **Knowledge Base** (`data/knowledge/`) — Markdown files organized by domain (contacts/, events/, general/) with consistent header structure

**Key architectural patterns:**
- **Agentic RAG (tool-based)** — RAG as tool enables agent to skip retrieval for "hello" but use it for "who is the mayor?"
- **Streaming with `.astream()`** — Token-by-token streaming for perceived latency reduction
- **Structured output with Pydantic** — Type-safe entity generation matching frontend TypeScript interfaces
- **Module-based backend structure** — Organize by feature (services/, tools/) not file type for scalability

### Critical Pitfalls

From 15 identified pitfalls, the top 5 most likely to block PoC:

1. **Using `.invoke()` instead of `.astream()` for streaming** — `.invoke()` returns only final output, completely blocking SSE implementation. Must use `.astream()` for token-by-token streaming. (Phase 1)

2. **CORS misconfiguration for streaming** — Wildcard `origins=["*"]` blocks credentials; Safari buffers SSE even with correct CORS. Explicitly specify `origins=["http://localhost:3000"]` and test in Chrome first. (Phase 1)

3. **Embedding dimension mismatch** — Vector DB expects one dimension (768) but receives another (3072), causing RAG to silently fail or return zero results. Choose ONE embedding model and verify dimensions before indexing: `len(embeddings.embed_query("test"))`. (Phase 2)

4. **Markdown chunking breaks code blocks** — Generic text splitters destroy whitespace/indentation in code examples. Use `MarkdownHeaderTextSplitter` or `ExperimentalMarkdownSyntaxTextSplitter` to preserve structure and code blocks. (Phase 2)

5. **ReAct agent cannot output structured data** — Pre-built agents return unstructured text by default. Use `.with_structured_output()` to bind Pydantic models or add structured output as a separate tool. (Phase 3)

## Implications for Roadmap

Based on research, suggested 6-phase structure following bottom-up component testing to reduce integration risk:

### Phase 1: FastAPI Foundation + SSE Streaming
**Rationale:** Establish backend structure and validate SSE streaming works before agent complexity. Risk reduction by testing streaming early.
**Delivers:** Working FastAPI app with mock `/api/chat` endpoint streaming hardcoded chunks to frontend
**Addresses:** Basic infrastructure, streaming responses (table stakes feature)
**Avoids:** Pitfall #1 (invoke vs astream), #2 (CORS), #6 (callback reuse)
**Research needed:** No — FastAPI + SSE is well-documented pattern

### Phase 2: Knowledge Base + RAG (No Agent)
**Rationale:** Vector store is independent of agent complexity and testable in isolation. Validate retrieval quality before combining with LLM.
**Delivers:** Indexed markdown knowledge base with working similarity search
**Addresses:** Vector-based retrieval (table stakes), document chunking
**Avoids:** Pitfall #3 (embedding dimensions), #4 (markdown chunking), #12 (chunk overlap)
**Research needed:** No — ChromaDB + LangChain loaders are standard

### Phase 3: LLM Integration (No RAG)
**Rationale:** Isolate LLM streaming before combining with RAG. Verify Mistral integration and SSE end-to-end.
**Delivers:** Streaming LLM responses from `/api/chat` endpoint to frontend
**Addresses:** Basic conversational responses
**Avoids:** Pitfall #7 (missing await), #11 (Mistral tool calling)
**Research needed:** No — langchain-mistralai package is official

### Phase 4: ReAct Agent with RAG Tool
**Rationale:** Now combine all validated components. Agent can reason about when to use RAG tool.
**Delivers:** Full agentic RAG with thought-action-observation cycle, dynamic tool calling
**Addresses:** ReAct loop, tool calling, source attribution (all table stakes)
**Avoids:** Pitfall #10 (timeouts on large docs)
**Research needed:** Maybe — test agent reasoning quality with city-specific queries; may need prompt tuning

### Phase 5: Structured Output & Entity Formatting
**Rationale:** Build on working agent to add structured JSON for frontend components.
**Delivers:** Contact and CalendarEvent entities rendering correctly in UI
**Addresses:** Structured output (table stakes), entity formatting for ContactCard/CalendarEvent components
**Avoids:** Pitfall #5 (structured output configuration)
**Research needed:** No — Pydantic models with `.with_structured_output()` is documented

### Phase 6: Format Support & Polish
**Rationale:** Nice-to-have features after core functionality works.
**Delivers:** Support for flowtoken/llm-ui/streamdown formats, error handling, documentation
**Addresses:** Format-aware rendering, graceful degradation
**Avoids:** N/A
**Research needed:** No — format-specific syntax is implementation detail

### Phase Ordering Rationale

- **Bottom-up validation:** Each phase produces independently testable component before integration
- **Risk reduction early:** Test risky integrations (SSE streaming, LangChain) in Phases 1-3 before agent complexity
- **Incremental complexity:** Mock version → real components → combined system
- **Always shippable:** Each phase leaves working system with subset of functionality
- **Dependencies respected:** RAG tool requires vector store (Phase 2), agent requires LLM (Phase 3), structured output requires working agent (Phase 4)

### Research Flags

Phases likely needing deeper research during planning:
- **Phase 4 (Agent integration):** Agent reasoning quality with city-specific queries may need prompt engineering iteration. Test with representative queries: contact lookups, event searches, multi-step reasoning.

Phases with standard patterns (skip research-phase):
- **Phase 1:** FastAPI + SSE is well-documented, official docs sufficient
- **Phase 2:** ChromaDB + LangChain loaders have extensive examples
- **Phase 3:** langchain-mistralai is official integration package
- **Phase 5:** Pydantic structured output is native FastAPI pattern

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | HIGH | All packages verified via PyPI (Jan 2026); LangGraph v1.0 production-stable; FastAPI industry standard |
| Features | HIGH | ReAct + RAG patterns well-documented; table stakes vs differentiators clear from government chatbot research |
| Architecture | HIGH | Multiple production examples of FastAPI + LangGraph + SSE; official LangChain docs for ReAct agents |
| Pitfalls | MEDIUM-HIGH | Top 5 pitfalls verified with multiple sources; Mistral-specific issues have some conflicting information |

**Overall confidence:** HIGH

All core recommendations verified with official documentation (LangChain, LangGraph, FastAPI, Pydantic) and PyPI package pages as of January 2026. LangGraph v1.0 milestone provides production-ready foundation. Architecture patterns sourced from recent production guides (2025-2026) and official tutorials.

### Gaps to Address

Research was comprehensive but identified areas needing validation during implementation:

- **Mistral model selection (large vs small):** Exact pricing and quality trade-off not tested. Benchmark both models in Phase 3 with sample city queries. (Impact: LOW — both models supported)

- **Embedding model final choice:** all-mpnet-base-v2 is proven but Qwen3 (2026) offers multilingual support. A/B test retrieval quality if German language support needed post-PoC. (Impact: MEDIUM — affects retrieval quality)

- **Chunk size optimization:** Optimal markdown chunk size for city contacts/events not predetermined. Experiment with header-based splitting + recursive splitting in Phase 2. (Impact: MEDIUM — affects retrieval precision)

- **SSE message format contract:** Exact JSON schema for entity streaming between backend and frontend needs definition based on existing frontend expectations. Validate in Phase 1. (Impact: LOW — frontend likely specifies format)

- **Agent prompt engineering:** System prompt for city chatbot role will require iteration based on query testing in Phase 4. Not a research gap but implementation tuning. (Impact: MEDIUM — affects answer quality)

## Sources

### Primary (HIGH confidence)
- **Official Documentation:** LangChain, LangGraph, FastAPI, Pydantic (all verified Jan 2026)
- **PyPI Package Pages:** Version verification for all packages (Jan 14-19, 2026)
- **LangChain 1.0 Announcement:** [blog.langchain.com](https://www.blog.langchain.com/langchain-langgraph-1dot0/) — LangGraph production readiness
- **FastAPI Production Best Practices:** [render.com](https://render.com/articles/fastapi-production-deployment-best-practices)
- **LangGraph ReAct Agent Tutorial:** [langchain-ai.github.io](https://langchain-ai.github.io/langgraph/how-tos/react-agent-from-scratch/)

### Secondary (MEDIUM confidence)
- **ChromaDB vs FAISS Comparison:** Medium article with benchmark data
- **Top Embedding Models 2026:** bentoml.com guide with MTEB leaderboard references
- **FastAPI + LangGraph Templates:** Multiple GitHub production templates (2025-2026)
- **ReAct Agent Structured Output:** LangGraph how-to guides with working examples
- **RAG Best Practices 2026:** AWS, Azure, and community guides

### Tertiary (LOW confidence)
- **Mistral-specific tool calling issues:** GitHub issues with evolving solutions
- **Browser-specific SSE buffering:** Anecdotal reports, limited recent data

---
*Research completed: 2026-01-20*
*Ready for roadmap: yes*
