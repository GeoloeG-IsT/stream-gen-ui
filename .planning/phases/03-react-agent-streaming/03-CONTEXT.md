# Phase 3: ReAct Agent + Streaming Integration - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Intelligent ReAct agent that streams formatted responses via SSE to the existing frontend. The agent executes Thought-Action-Observation cycles, invokes RAG tools, and emits structured Contact/CalendarEvent entities. Multi-turn conversation context and error handling included. Frontend rendering is already implemented — this phase focuses on backend agent behavior and streaming output format.

</domain>

<decisions>
## Implementation Decisions

### Streaming Presentation
- Token-by-token streaming (like ChatGPT) — each word/token appears as generated
- Agent reasoning streams during RAG retrieval (not silent)
- Reasoning appears in a separate visual block (distinct from response text)

### Entity Output Format
- Markdown with markers for entities (e.g., `:::contact{...}:::`) — frontend parses these
- Top 3 matches shown when multiple entities are relevant, with mention if there are more
- Can mix Contact and CalendarEvent entities freely in a single response
- Show entities even with incomplete data (display available fields, omit missing)

### Agent Visibility
- Full ReAct cycle visible to users (Thought → Action → Observation)
- Concise reasoning — brief thoughts ("Looking up Parks contacts..."), minimal tokens
- Detailed server-side logging for debugging (full ReAct cycle, retrieval results, timing)
- Debug mode via optional query param/header exposes more internals to frontend

### Error Handling
- RAG retrieval failures: Admit and suggest alternatives ("I couldn't find specific info about that. Try asking about [related topics]...")
- Retry strategy: Exponential backoff, 5 retries on transient failures
- Timeout: 30 seconds for RAG retrieval and LLM calls
- Partial failures: Abort entirely, return clean error (no partial results)

### Claude's Discretion
- Exact markdown marker syntax for entities
- Specific exponential backoff timing intervals
- Debug mode parameter naming convention

</decisions>

<specifics>
## Specific Ideas

- Frontend already handles entity card rendering — backend just needs to emit structured markers
- Frontend already handles error display — backend streams appropriate error messages

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-react-agent-streaming*
*Context gathered: 2026-01-20*
