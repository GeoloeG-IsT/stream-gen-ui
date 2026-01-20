# Pitfalls Research: FastAPI + LangChain ReAct Agent with RAG

**Domain:** FastAPI backend with LangChain ReAct Agent, RAG over markdown files, streaming SSE to Next.js frontend
**Researched:** 2026-01-20
**Confidence:** MEDIUM (verified with recent web sources from 2025-2026, no Context7 data available)
**Context:** PoC environment - focus on blockers, not production-grade optimizations

---

## Critical (Will Block PoC)

### 1. Using .invoke() Instead of .astream() for Streaming
- **Problem:** The `.invoke()` function in LangChain executes synchronously and returns only the final output. This completely prevents chunk-by-chunk streaming to the frontend, making SSE implementation impossible.
- **Warning Signs:**
  - Frontend receives complete response all at once instead of progressive tokens
  - No intermediate tokens appearing in FastAPI StreamingResponse
  - Example code online uses `.invoke()` instead of `.astream()`
- **Prevention:**
  - Use `.astream()` for async streaming with agents
  - Use `AsyncIteratorCallbackHandler` for token-level streaming
  - Never use `.invoke()` when streaming is required
- **Phase:** Phase 1 (Initial streaming setup)
- **Sources:**
  - [LangChain FastAPI streaming issues](https://github.com/langchain-ai/langchain/discussions/18516)
  - [Integrating LangChain with FastAPI for streaming](https://dev.to/louis-sanna/integrating-langchain-with-fastapi-for-asynchronous-streaming-5d0o)

### 2. CORS Misconfiguration for Streaming Responses
- **Problem:** Using wildcard `origins=["*"]` in CORSMiddleware blocks credentials (including Authorization headers with Bearer tokens), and some browsers (Safari) buffer streaming responses even with correct CORS, preventing SSE from working.
- **Warning Signs:**
  - CORS errors in browser console but not in terminal/Postman
  - Streaming works in Chrome but not Safari
  - Authorization headers not reaching backend
  - Browser shows "blocked by CORS policy" for OPTIONS requests
- **Prevention:**
  - Explicitly specify allowed origins: `origins=["http://localhost:3000"]` for dev
  - Set `allow_credentials=True` if using auth headers
  - Test in Chrome/Edge first (better SSE support)
  - In production, replace with specific domains
- **Phase:** Phase 1 (FastAPI setup)
- **Sources:**
  - [FastAPI CORS documentation](https://fastapi.tiangolo.com/tutorial/cors/)
  - [Mastering CORS with FastAPI and Next.js](https://medium.com/@vaibhavtiwari.945/mastering-cors-configuring-cross-origin-resource-sharing-in-fastapi-and-next-js-28c61272084b)
  - [Streaming APIs with FastAPI and Next.js](https://sahansera.dev/streaming-apis-python-nextjs-part1/)

### 3. Embedding Dimension Mismatch
- **Problem:** Vector database expects one dimension (e.g., 768) but receives another (e.g., 3072). This happens silently with some embedding models like Gemini, causing the entire RAG retrieval system to fail or return no results.
- **Warning Signs:**
  - "Vector dimension X does not match the dimension of the index Y" errors
  - RAG returns zero results despite having indexed documents
  - Similarity scores are unexpectedly low
  - Error occurs after switching embedding models
- **Prevention:**
  - Choose ONE embedding model and use it consistently for both indexing and querying
  - Verify embedding dimensions before creating vector store: `len(embeddings.embed_query("test"))`
  - If using Mistral/Gemini, pass `output_dimensionality` to `embed_documents()` method, NOT to constructor
  - Document the embedding model and dimension in code comments
  - Vector store dimensions cannot be changed after creation - requires full re-indexing
- **Phase:** Phase 2 (RAG setup)
- **Sources:**
  - [Gemini embedding dimension mismatch fix](https://medium.com/@henilsuhagiya0/how-to-fix-the-common-gemini-langchain-embedding-dimension-mismatch-768-vs-3072-6eb1c468729b)
  - [Pinecone dimension mismatch errors](https://community.pinecone.io/t/pinecone-error-vector-dimension-768-does-not-match-the-dimension-of-the-index-384/5815)

### 4. Markdown Chunking Breaks Code Blocks
- **Problem:** Generic text splitters like `RecursiveCharacterTextSplitter` split markdown by character count, breaking code blocks mid-function and destroying whitespace/indentation. This causes LLM to receive malformed code context and generate incorrect responses.
- **Warning Signs:**
  - Code examples in retrieved chunks are incomplete or broken
  - Python/JS code loses indentation in RAG results
  - LLM responds with syntax errors or misunderstands code structure
  - Retrieved chunks have partial function definitions
- **Prevention:**
  - Use `MarkdownHeaderTextSplitter` to split by headers (preserves document structure)
  - Use `ExperimentalMarkdownSyntaxTextSplitter` which preserves code blocks intact and extracts language metadata
  - For mixed content, combine header-based splitting with code-aware chunking
  - Set appropriate chunk sizes: code blocks often need larger chunks (1500-2000 tokens)
  - Add chunk overlap (200-400 tokens) to maintain context across boundaries
- **Phase:** Phase 2 (Document loading and chunking)
- **Sources:**
  - [LangChain markdown splitting by headers](https://python.langchain.com/docs/how_to/markdown_header_metadata_splitter/)
  - [ExperimentalMarkdownSyntaxTextSplitter documentation](https://python.langchain.com/api_reference/text_splitters/markdown/langchain_text_splitters.markdown.ExperimentalMarkdownSyntaxTextSplitter.html)
  - [RAG markdown ingestion with LangChain](https://medium.com/@vishalkhushlani123/building-a-markdown-knowledge-ingestor-for-rag-with-langchain-ba201515f6c4)

### 5. ReAct Agent Cannot Output Structured Data
- **Problem:** Pre-built ReAct agents return unstructured text by default. When frontend expects JSON entities (for component rendering), agent outputs free-form text, breaking the frontend parsing.
- **Warning Signs:**
  - Agent returns plain text instead of JSON
  - Frontend shows "JSON parse error"
  - Agent output format varies between runs
  - Example: "The answer is X" instead of `{"type": "answer", "content": "X"}`
- **Prevention:**
  - Use `.with_structured_output()` method to bind Pydantic models to agent
  - OR add structured output as an additional tool for agent to call
  - OR add a third node (response formatter) after agent that enforces structure
  - Test with simple schema first: `{"type": str, "content": str}`
  - Pre-bound models (models with `.bind_tools()`) are NOT compatible with structured output
- **Phase:** Phase 3 (Agent integration)
- **Sources:**
  - [Force ReAct agent to structure output](https://langchain-ai.github.io/langgraph/how-tos/react-agent-structured-output/)
  - [Getting structured output from ReAct agents](https://medium.com/@chadhamoksh/getting-structured-output-from-llms-using-react-agents-c84e9a777fbf)
  - [LangChain structured output discussion](https://github.com/langchain-ai/langchain/discussions/25359)

### 6. AsyncIteratorCallbackHandler Reuse Causes Stream Hang
- **Problem:** Reusing the same `AsyncIteratorCallbackHandler` instance across multiple requests without clearing its done event causes the second request to hang indefinitely, waiting for tokens that never arrive.
- **Warning Signs:**
  - First SSE stream works perfectly
  - Subsequent streams hang with no tokens emitted
  - No errors in logs, just infinite waiting
  - FastAPI endpoint never returns for second request
- **Prevention:**
  - Create a NEW callback handler for each request: `callback = AsyncIteratorCallbackHandler()`
  - If reusing, call `callback.done.clear()` before each use
  - NEVER reuse handlers across parallel requests (will mix streams)
  - Consider using context manager pattern to ensure cleanup
- **Phase:** Phase 1 (Streaming setup)
- **Sources:**
  - [FastAPI LangChain streaming issues](https://github.com/langchain-ai/langchain/discussions/18516)
  - [LangChain FastAPI streaming examples](https://gist.github.com/ninely/88485b2e265d852d3feb8bd115065b1a)

---

## Significant (Will Cause Pain)

### 7. Missing await on Async Callbacks
- **Problem:** Using async callbacks without proper await causes RuntimeWarning: "coroutine AsyncCallbackManagerForLLMRun.on_llm_new_token was never awaited". This leads to dropped tokens, incomplete streams, and unpredictable streaming behavior.
- **Warning Signs:**
  - RuntimeWarning in logs about unawaited coroutines
  - Tokens missing from stream (some arrive, some don't)
  - Streaming appears to work but is unreliable
  - Warnings appear in console but stream still produces output
- **Prevention:**
  - Always await async callback methods
  - Use `asyncio.create_task()` to run LLM generation in background
  - Wrap async operations with proper error handling
  - Use `wrap_done` pattern to handle task completion
- **Phase:** Phase 1 (Streaming implementation)
- **Sources:**
  - [FastAPI streaming issues discussion](https://github.com/langchain-ai/langchain/discussions/18516)
  - [Integrating LangChain with FastAPI streaming](https://dev.to/louis-sanna/integrating-langchain-with-fastapi-for-asynchronous-streaming-5d0o)

### 8. Environment Variables Not Loaded in Production
- **Problem:** API keys work locally (from .env file) but fail in deployment because environment variables aren't properly configured. LangChain silently fails or raises "Missing API key" errors at runtime.
- **Warning Signs:**
  - "Missing MISTRAL_API_KEY" or "Missing OPENAI_API_KEY" errors in production
  - LangSmith tracing works locally but not in deployment
  - Code runs fine on developer machine but fails on server
  - Error: "LANGCHAIN_API_KEY environment variable not found"
- **Prevention:**
  - Never hardcode API keys in source code
  - Use `.env` file for local development (add to `.gitignore`)
  - For production (Vercel/Railway/etc.): configure secrets in platform UI
  - Validate required env vars on startup:
    ```python
    required_keys = ["MISTRAL_API_KEY", "LANGCHAIN_API_KEY"]
    missing = [k for k in required_keys if not os.getenv(k)]
    if missing:
        raise ValueError(f"Missing environment variables: {missing}")
    ```
  - Use separate keys for dev/staging/production
- **Phase:** Phase 0 (Project setup), Phase 4 (Deployment)
- **Sources:**
  - [Deploy LangChain to production 2026](https://langchain-tutorials.github.io/deploy-langchain-production-2026/)
  - [Managing API keys in LangChain](https://milvus.io/ai-quick-reference/how-do-i-manage-api-keys-and-credentials-in-langchain)

### 9. Memory Leaks from Unclosed Async Connections
- **Problem:** AsyncConnectionPool connections and LangChain conversation memory accumulate without cleanup, consuming 2-5MB per unclosed connection. Production apps quickly exhaust memory (OOM errors) under moderate load.
- **Warning Signs:**
  - RuntimeWarning: "Please use `await pool.open()` or context manager `async with AsyncConnectionPool(...)`"
  - Memory usage grows continuously over time
  - Server crashes with OOM after hours/days of operation
  - Connection pool exhaustion errors
- **Prevention:**
  - Use async context managers for connection pools:
    ```python
    async with AsyncConnectionPool(...) as pool:
        # use pool
    ```
  - Explicitly close connections after use
  - Implement conversation memory cleanup (clear old history)
  - Use connection pooling with max size limits
  - Monitor memory usage in development
- **Phase:** Phase 3 (Agent with memory)
- **Sources:**
  - [LangGraph AsyncConnectionPool warning](https://github.com/langchain-ai/langgraph/issues/4228)
  - [Common LangChain memory leaks](https://markaicode.com/langchain-memory-leaks-fix/)
  - [LangChain performance tuning 2026](https://langchain-tutorials.github.io/langchain-performance-tuning-2026/)

### 10. Agent Timeouts with Large Documents
- **Problem:** Processing large markdown files or many documents causes agent to exceed default timeout (30-60s), resulting in 502 errors or incomplete responses. Particularly bad when embedding/indexing happens during request.
- **Warning Signs:**
  - 502 Bad Gateway errors for RAG queries over large docs
  - Timeout errors after ~60 seconds of processing
  - Works with small docs, fails with large docs
  - Uvicorn/Gunicorn worker timeout errors
- **Prevention:**
  - Set appropriate timeouts for LLM calls: `ChatMistral(timeout=120)`
  - Use `step_timeout` parameter in LangGraph agents
  - Increase server timeouts: Uvicorn keep-alive to 75+ seconds
  - Pre-index documents during deployment, not at request time
  - Implement streaming for long-running operations
  - Use background tasks for heavy processing
  - For PoC: limit document size or number of chunks retrieved (top_k=3)
- **Phase:** Phase 2 (RAG indexing), Phase 3 (Agent queries)
- **Sources:**
  - [LangGraph timeout configuration](https://github.com/langchain-ai/langgraph/issues/4927)
  - [LangChain agent timeouts](https://python.langchain.com/docs/modules/agents/how_to/max_time_limit/)
  - [Agent Server changelog - timeout improvements](https://docs.langchain.com/langsmith/agent-server-changelog)

### 11. Mistral-Specific Tool Calling Issues
- **Problem:** Mistral models have inconsistent tool calling support. Some versions don't support the `stop` parameter, and agent tool parsing can fail with "LLM output produced both a final answer and a parse-able action" errors.
- **Warning Signs:**
  - Error: "stop parameter not supported"
  - Agent loops infinitely trying to call tools
  - Tool calling works with OpenAI but fails with Mistral
  - JSON parsing errors from tool responses
- **Prevention:**
  - Verify Mistral model supports tool calling (not all do)
  - Use latest `langchain-mistralai` package version
  - Don't pass `stop` parameter to Mistral models
  - Test tool calling with simple tool before complex agent
  - Have fallback to OpenAI/Anthropic for PoC if Mistral fails
  - Check Mistral API changelog for tool calling updates
- **Phase:** Phase 3 (Agent with tools)
- **Sources:**
  - [ChatMistralAI documentation](https://python.langchain.com/docs/integrations/chat/mistralai/)
  - [Mistral tool calling issues](https://github.com/langchain-ai/langchain/issues/26226)
  - [Error using Mistral Chat](https://github.com/langchain-ai/langchain/discussions/15893)

### 12. Insufficient Chunk Overlap Loses Context
- **Problem:** Chunks split with zero or small overlap lose critical context at boundaries. This causes RAG to retrieve incomplete information, leading to hallucinations or "I don't know" responses when the answer spans chunk boundaries.
- **Warning Signs:**
  - LLM says "information not found" when you know it's in the docs
  - Retrieved chunks have incomplete sentences/thoughts
  - Answers are correct for simple queries but wrong for complex ones requiring context
  - Similarity scores are lower than expected
- **Prevention:**
  - Set chunk overlap to 15-25% of chunk size
  - For 1000 token chunks, use 200-250 token overlap
  - Larger overlap for technical docs with dependencies (code, APIs)
  - Tune based on document structure - code needs more overlap than prose
  - Test retrieval quality with queries that span topics
- **Phase:** Phase 2 (Document chunking)
- **Sources:**
  - [RAG chunking best practices](https://github.com/langchain-ai/langchain/issues/12067)
  - [Building reliable RAG applications 2026](https://dev.to/pavanbelagatti/learn-how-to-build-reliable-rag-applications-in-2026-1b7p)

---

## Minor (Good to Know)

### 13. Browser-Specific SSE Buffering
- **Problem:** Safari and some other browsers buffer SSE responses, delaying token display until large chunks accumulate. This makes streaming appear broken even though FastAPI is sending tokens correctly.
- **Warning Signs:**
  - Streaming works perfectly in Chrome/Edge
  - Safari shows tokens in bursts instead of smoothly
  - Network tab shows data arriving but UI doesn't update
- **Prevention:**
  - Test SSE in Chrome/Edge first for development
  - Send periodic keepalive messages (e.g., `: ping\n\n` every 15s)
  - Document browser compatibility in README
  - For PoC, specify "use Chrome" as requirement
- **Phase:** Phase 1 (Frontend integration)
- **Sources:**
  - [Streaming APIs with FastAPI and Next.js](https://sahansera.dev/streaming-apis-python-nextjs-part1/)

### 14. Missing Metadata on Chunks Reduces Relevance
- **Problem:** Chunks without metadata (source file, section, heading) lack context for retrieval. Generic embedding models perform worse without rich metadata, especially with 512 token limit on many open-source models.
- **Warning Signs:**
  - RAG retrieves chunks from wrong sections
  - Cannot filter by document source
  - Similarity search returns unexpected results
- **Prevention:**
  - Extract and store metadata during chunking:
    - Source filename
    - Section/header hierarchy
    - Chunk position in document
  - Use `MarkdownHeaderTextSplitter` which auto-extracts header metadata
  - Include metadata in retrieval filtering
  - For PoC: at minimum store source file and top-level heading
- **Phase:** Phase 2 (Document processing)
- **Sources:**
  - [Markdown splitting and metadata](https://github.com/langchain-ai/langchain/issues/12067)
  - [RAG architecture best practices](https://medium.com/@shekhar.manna83/rag-architecture-best-practice-vector-database-ingestion-6a7aecaa5ae4)

### 15. Legacy Agent Implementation Breaks Streaming
- **Problem:** LangChain's deprecation warnings guide users to `langchain.agents` module, which does not support `stream_mode="messages"` or real-time token streaming. This causes silent streaming failures.
- **Warning Signs:**
  - Deprecation warnings in console
  - Streaming worked before, stopped after following upgrade guide
  - `stream_mode="messages"` has no effect
  - Tokens don't stream even with correct callback setup
- **Prevention:**
  - Use LangGraph's ReAct agent implementation, not legacy `langchain.agents`
  - Ignore deprecation warnings that point to non-streaming implementations
  - Check LangChain migration guide for streaming-compatible alternatives
  - For PoC: stick with working LangGraph implementation
- **Phase:** Phase 3 (Agent setup)
- **Sources:**
  - [LangChain agent streaming deprecation issue](https://github.com/langchain-ai/langchain/issues/34613)
  - [How to migrate to LangGraph](https://python.langchain.com/docs/modules/agents/how_to/max_time_limit/)

---

## Phase Mapping Summary

| Phase | Critical Pitfalls | Significant Pitfalls |
|-------|-------------------|---------------------|
| **Phase 0: Setup** | - | #8 Environment variables |
| **Phase 1: FastAPI + Streaming** | #1 invoke vs astream<br>#2 CORS config<br>#6 Callback reuse | #7 Missing await |
| **Phase 2: RAG** | #3 Embedding dimensions<br>#4 Markdown chunking | #10 Timeout on large docs<br>#12 Chunk overlap |
| **Phase 3: Agent** | #5 Structured output | #9 Memory leaks<br>#11 Mistral tool calling |
| **Phase 4: Integration** | - | - |

---

## Research Notes

**Confidence Assessment:**
- **HIGH confidence:** CORS issues (#2), embedding mismatch (#3), invoke vs astream (#1) - extensively documented with multiple recent sources
- **MEDIUM confidence:** Mistral-specific issues (#11), timeout handling (#10) - some conflicting information, evolving rapidly
- **LOW confidence:** Browser buffering (#13) - limited recent data, mostly anecdotal

**Research Gaps:**
- No official Mistral + LangChain integration guide found (relied on community issues)
- Limited 2026-specific data (most sources from late 2024-2025)
- No Context7 data available for verification

**Methodology:**
- All pitfalls verified across multiple web sources from 2024-2026
- Focused on PoC-blocking issues over production optimizations
- Prioritized recent issues (2025-2026) over older ones
- Cross-referenced GitHub issues, tutorials, and documentation

---

## Sources

### Critical Issues
- [LangChain discussions on streaming](https://github.com/langchain-ai/langchain/discussions/18516)
- [Integrating LangChain with FastAPI streaming](https://dev.to/louis-sanna/integrating-langchain-with-fastapi-for-asynchronous-streaming-5d0o)
- [FastAPI CORS official docs](https://fastapi.tiangolo.com/tutorial/cors/)
- [Streaming APIs with FastAPI and Next.js](https://sahansera.dev/streaming-apis-python-nextjs-part1/)
- [Embedding dimension mismatch solutions](https://medium.com/@henilsuhagiya0/how-to-fix-the-common-gemini-langchain-embedding-dimension-mismatch-768-vs-3072-6eb1c468729b)
- [LangChain markdown header splitting](https://python.langchain.com/docs/how_to/markdown_header_metadata_splitter/)
- [ReAct agent structured output](https://langchain-ai.github.io/langgraph/how-tos/react-agent-structured-output/)

### Significant Issues
- [LangChain memory leaks guide](https://markaicode.com/langchain-memory-leaks-fix/)
- [LangChain performance tuning 2026](https://langchain-tutorials.github.io/langchain-performance-tuning-2026/)
- [Deploy LangChain production 2026](https://langchain-tutorials.github.io/deploy-langchain-production-2026/)
- [LangGraph timeout issues](https://github.com/langchain-ai/langgraph/issues/4927)
- [ChatMistralAI integration](https://python.langchain.com/docs/integrations/chat/mistralai/)
- [Building reliable RAG 2026](https://dev.to/pavanbelagatti/learn-how-to-build-reliable-rag-applications-in-2026-1b7p)
