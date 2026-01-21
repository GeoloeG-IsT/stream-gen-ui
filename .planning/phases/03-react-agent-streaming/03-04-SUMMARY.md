---
phase: 03-react-agent-streaming
plan: 04
subsystem: api
tags: [fastapi, sse, streaming, langgraph, ai-sdk-v6, agent]

# Dependency graph
requires:
  - phase: 03-03
    provides: LangGraph agent graph with ReAct loop and streaming support
  - phase: 03-02
    provides: SSE formatting utilities with AI SDK v6 protocol
  - phase: 03-01
    provides: Agent state, tools, and prompts
  - phase: 02-03
    provides: RAG pipeline with hybrid retrieval
provides:
  - Streaming POST /api/chat endpoint accepting messages array
  - SSE response with AI SDK v6 protocol (text-delta events)
  - Message format conversion (AI SDK to LangChain)
  - Backwards compatible /api/retrieve endpoint for raw retrieval
  - Agent graph initialization in FastAPI lifespan
  - Graceful error handling for GraphRecursionError
affects: [frontend-integration, ui-streaming, agent-testing]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Streaming endpoint pattern: StreamingResponse with async generator"
    - "Message format conversion: AI SDK MessageItem to LangChain messages"
    - "SSE headers with x-vercel-ai-ui-message-stream: v1 for AI SDK v6"
    - "Agent initialization in FastAPI lifespan for startup validation"

key-files:
  created: []
  modified:
    - backend/models/schemas.py
    - backend/main.py

key-decisions:
  - "Renamed /api/chat to /api/retrieve for backwards compatibility with Phase 2 retrieval-only endpoint"
  - "New streaming /api/chat uses AgentChatRequest with messages array (AI SDK format)"
  - "stream_mode='messages' required for token-by-token streaming visibility"
  - "GraphRecursionError handled with user-friendly message"
  - "Agent pre-initialization in lifespan validates API key on startup"

patterns-established:
  - "SSE streaming pattern: async generator yielding format_text_delta() events"
  - "Message conversion: MessageItem (role/content) to LangChain HumanMessage/AIMessage/SystemMessage"
  - "Error handling: GraphRecursionError caught with helpful feedback"
  - "Endpoint versioning: Legacy endpoint renamed rather than broken"

# Metrics
duration: 3min
completed: 2026-01-21
---

# Phase 3 Plan 4: Streaming Chat Endpoint Summary

**Streaming /api/chat endpoint bridges LangGraph agent to AI SDK frontend with SSE protocol, token-by-token visibility, and backwards-compatible /api/retrieve for raw retrieval**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-21T00:13:09Z
- **Completed:** 2026-01-21T00:15:42Z
- **Tasks:** 3
- **Files modified:** 2

## Accomplishments
- Streaming POST /api/chat endpoint accepts messages array (AI SDK format) and streams SSE response
- Message format conversion from AI SDK MessageItem to LangChain message types
- GraphRecursionError handling with user-friendly fallback message
- Backwards compatibility: Phase 2 endpoint moved to /api/retrieve with ChatRequest schema intact
- Agent graph pre-initialization in FastAPI lifespan for startup validation

## Task Commits

Each task was committed atomically:

1. **Task 1: Add agent request schema to models** - `8f46a6eb` (feat)
2. **Task 2: Create streaming agent endpoint in main.py** - `7618e862` (feat)
3. **Task 3: Verify /api/retrieve backwards compatibility** - `f8b3b5c0` (test)

## Files Created/Modified
- `backend/models/schemas.py` - Added AgentChatRequest, MessageItem, AgentChatError schemas for Phase 3 streaming
- `backend/main.py` - Added streaming /api/chat endpoint, renamed old endpoint to /api/retrieve, added agent initialization in lifespan

## Decisions Made

**Endpoint versioning strategy:**
- Renamed Phase 2 /api/chat to /api/retrieve rather than breaking backwards compatibility
- New streaming /api/chat uses AgentChatRequest (messages array) vs old ChatRequest (single message)
- Both endpoints coexist for gradual migration

**Streaming implementation:**
- Uses `stream_mode="messages"` with LangGraph for token-by-token streaming (critical for SSE)
- SSE_HEADERS includes `x-vercel-ai-ui-message-stream: v1` required for AI SDK v6
- format_text_delta() wraps each chunk in SSE event format

**Error handling:**
- GraphRecursionError caught separately from generic exceptions
- User-friendly messages: "I've reached the maximum number of steps" vs stack traces
- Errors streamed as text-delta events (not HTTP errors, since stream already started)

**Agent initialization:**
- get_agent_graph() called in lifespan to pre-compile graph and validate API key
- Graceful degradation: missing API key logs warning but doesn't crash server
- Prevents cold-start delays on first request

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - all imports, schemas, and endpoints worked as expected. Agent graph and streaming utilities from prior plans integrated cleanly.

## User Setup Required

None - no external service configuration required.

Agent requires MISTRAL_API_KEY in .env (set in Phase 2). If missing, server logs warning but still serves /api/retrieve endpoint.

## Next Phase Readiness

**Ready for frontend integration:**
- POST /api/chat endpoint live with SSE streaming
- AI SDK v6 protocol headers and event format
- Message format matches useChat hook expectations
- Error handling prevents frontend crashes

**Backend streaming complete:**
- Agent invocation with stream_mode="messages" ✓
- SSE formatting with AI SDK v6 protocol ✓
- Backwards compatible raw retrieval ✓

**Next plan (03-05):**
- Frontend chat UI with useChat hook
- SSE stream consumption
- Entity parsing for Contact/Calendar cards

**Potential concerns:**
- TODO comment in code: "Distinguish reasoning using metadata.langgraph_node" - all agent output currently streams as text-delta
- May need separate reasoning-delta events for Thought-Action-Observation visibility (can be added in future refinement)

---
*Phase: 03-react-agent-streaming*
*Completed: 2026-01-21*
