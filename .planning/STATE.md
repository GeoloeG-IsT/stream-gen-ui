# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-20)

**Core value:** The chatbot returns accurate, well-formatted responses with Contact cards and Calendar events rendered as rich UI components when relevant.
**Current focus:** Phase 1: Frontend Reorganization

## Current Position

Phase: 1 of 3 (Frontend Reorganization)
Plan: Not started yet
Status: Ready to plan
Last activity: 2026-01-20 — Roadmap created with 3 phases covering all 28 v1 requirements

Progress: [░░░░░░░░░░] 0%

## Performance Metrics

**Velocity:**
- Total plans completed: 0
- Average duration: N/A
- Total execution time: 0.0 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| - | - | - | - |

**Recent Trend:**
- Last 5 plans: None yet
- Trend: N/A

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

### Pending Todos

None yet.

### Blockers/Concerns

**Research-identified risks:**
- Phase 3: Streaming implementation must use `.astream()` not `.invoke()` (critical for SSE)
- Phase 3: CORS configuration for localhost:3000 must be explicit (not wildcard)
- Phase 2: Embedding dimension consistency between indexing and querying (768d for all-mpnet-base-v2)
- Phase 2: Markdown chunking must preserve code blocks (use MarkdownHeaderTextSplitter)
- Phase 3: Structured output requires `.with_structured_output()` binding

## Session Continuity

Last session: 2026-01-20 (roadmap creation)
Stopped at: Roadmap and STATE.md initialized, ready for Phase 1 planning
Resume file: None
