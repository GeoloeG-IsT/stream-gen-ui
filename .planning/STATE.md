# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-20)

**Core value:** The chatbot returns accurate, well-formatted responses with Contact cards and Calendar events rendered as rich UI components when relevant.
**Current focus:** Phase 3: ReAct Agent + Streaming Integration

## Current Position

Phase: 3 of 3 (ReAct Agent + Streaming Integration)
Plan: 04 of 06 completed
Status: In progress
Last activity: 2026-01-21 — Completed 03-04-PLAN.md (Streaming Chat Endpoint)

Progress: [████████░░] 67% (4/6 plans completed)

## Performance Metrics

**Velocity:**
- Total plans completed: 8
- Average duration: 4 min
- Total execution time: 0.6 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-frontend-reorganization | 1 | 10 min | 10 min |
| 02-backend-foundation-rag | 3 | 17 min | 6 min |
| 03-react-agent-streaming | 4 | 9 min | 2 min |

**Recent Trend:**
- Last 3 plans: 2min, 2min, 3min
- Trend: Consistent fast execution for infrastructure setup

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

- Frontend reorganization first: Clean separation before adding backend
- Mistral LLM: User preference for European data residency
- FastAPI backend: User preference, good SSE support
- LangChain/LangGraph: User preference, ReAct agent support
- Fictional city data: PoC doesn't need real data

**From 02-01 (Backend Foundation):**
- pydantic-settings for environment configuration with .env file support
- CORS explicitly configured for http://localhost:3000 (no wildcards)
- Backend directory structure: rag/, models/, scripts/, knowledge/
- Python virtual environment and build artifacts added to .gitignore

**From 02-02 (Knowledge Base Creation):**
- Fictional Berlin city data: Rich, realistic content without using real government information
- Markdown header structure: Consistent H1/H2/H3 hierarchy for RAG chunking compatibility
- 60 contacts across 10 departments with structured fields and rich bios
- 65 events (Q1, Q2, recurring) with structured fields and descriptions
- German naming conventions: Mix of traditional and diverse names for authenticity

**From 02-03 (RAG Pipeline):**
- Singleton pattern for vectorstore/retriever - avoids re-initialization overhead
- Semantic-heavy weights (0.8 semantic, 0.2 BM25) - optimizes for meaning over keywords
- Lifespan auto-initialization - ensures RAG ready on server start
- 400 chunks created from knowledge base with source attribution

**From 03-01 (Agent Foundation):**
- add_messages annotation for AgentState - enables proper message accumulation across ReAct cycles
- 30-second timeout on tool execution - prevents hanging queries
- Detailed tool descriptions with when to use/NOT to use - reduces tool misuse
- Top 5 results with source attribution - balances context quality vs token cost

**From 03-02 (SSE Streaming Utilities):**
- SSE protocol uses text-delta/reasoning-delta event types for AI SDK v6
- x-vercel-ai-ui-message-stream: v1 header required for frontend integration
- Entity markers use :::type syntax with JSON code blocks
- TOP 3 entity limit to prevent overwhelming responses
- Prompt-parser synchronization: identical marker syntax in system prompt and parser

**From 03-03 (LangGraph Agent Graph):**
- Mistral LLM with streaming=True is CRITICAL for token-by-token visibility
- Recursion limit formula: 2 * max_iterations + 1 (LangGraph counts each step)
- Agent temperature 0.0 for deterministic responses
- Singleton pattern for agent graph instance (get_agent_graph())
- Conditional routing checks tool_calls to decide tools vs end

**From 03-04 (Streaming Chat Endpoint):**
- Renamed /api/chat to /api/retrieve for backwards compatibility with Phase 2
- New streaming /api/chat uses AgentChatRequest with messages array (AI SDK format)
- stream_mode='messages' required for token-by-token streaming visibility
- GraphRecursionError handled with user-friendly message
- Agent pre-initialization in lifespan validates API key on startup

### Pending Todos

None yet.

### Blockers/Concerns

**Research-identified risks:**
- ~~Phase 3: Streaming implementation must use `.astream()` not `.invoke()` (critical for SSE)~~ Addressed in 03-04
- ~~Phase 3: CORS configuration for localhost:3000 must be explicit (not wildcard)~~ Addressed in 02-01
- ~~Phase 2: Embedding dimension consistency between indexing and querying (768d for all-mpnet-base-v2)~~ Addressed in 02-03
- ~~Phase 2: Markdown chunking must preserve code blocks (use MarkdownHeaderTextSplitter)~~ Addressed in 02-03
- Phase 3: Structured output requires `.with_structured_output()` binding

**From 02-01 execution:**
- .env.example requires force-add (git add -f) due to .gitignore .env* pattern
- python3-venv system package required for virtual environment creation

## Session Continuity

Last session: 2026-01-21 00:15:42 UTC
Stopped at: Completed 03-04-PLAN.md - Streaming Chat Endpoint complete
Resume file: .planning/phases/03-react-agent-streaming/03-04-SUMMARY.md
