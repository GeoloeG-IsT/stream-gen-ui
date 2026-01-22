---
phase: 04-backend-marker-strategy
plan: 01
subsystem: api
tags: [fastapi, pydantic, enum, query-params, http-headers]

# Dependency graph
requires:
  - phase: 03-agent-streaming
    provides: /api/chat streaming endpoint with AgentChatRequest
provides:
  - MarkerStrategy enum for output format validation
  - marker query parameter on /api/chat endpoint
  - X-Marker-Strategy response header
affects: [05-backend-prompt-adaptation, frontend-renderer]

# Tech tracking
tech-stack:
  added: []
  patterns: [Query parameter validation with enums, Response header metadata]

key-files:
  created: []
  modified: [backend/models/schemas.py, backend/main.py]

key-decisions:
  - "Default marker strategy is xml for backward compatibility"
  - "Use str, Enum inheritance for FastAPI auto-documentation"
  - "Return 400 with valid_values hint for invalid markers"

patterns-established:
  - "Enum-based query parameter validation pattern"
  - "Response headers include strategy metadata for client coordination"

# Metrics
duration: 1m 33s
completed: 2026-01-21
---

# Phase 04 Plan 01: Backend Marker Strategy Summary

**Added marker query parameter to /api/chat with enum validation and response header tracking**

## Performance

- **Duration:** 1m 33s
- **Started:** 2026-01-21T19:36:36Z
- **Completed:** 2026-01-21T19:38:09Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments
- Created MarkerStrategy enum with xml and llm-ui values
- Added marker query parameter to /api/chat endpoint with validation
- Response includes X-Marker-Strategy header for client coordination
- Default marker is xml for backward compatibility

## Task Commits

Each task was committed atomically:

1. **Task 1: Add MarkerStrategy enum to schemas** - `c111e94a` (feat)
2. **Task 2: Update /api/chat to accept marker query param** - `8c8c253f` (feat)

## Files Created/Modified
- `backend/models/schemas.py` - Added MarkerStrategy enum with XML and LLM_UI values
- `backend/main.py` - Added marker query param, validation, logging, and response header

## Decisions Made

1. **Default marker is xml** - Maintains backward compatibility with existing Streamdown renderer. Clients can opt into llm-ui explicitly.

2. **Use str, Enum inheritance** - Enables FastAPI to auto-document valid values in OpenAPI schema and ensures clean JSON serialization.

3. **Return 400 with valid_values** - Helpful error messages guide API consumers to correct usage.

4. **Log marker at INFO level** - Enables monitoring of which renderers are being requested in production.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - implementation was straightforward.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for Plan 02 (Prompt Adaptation):**
- marker query parameter accepted and validated
- X-Marker-Strategy header included in response
- Plan 02 can now read marker value and adapt system prompt accordingly

**Implementation notes:**
- marker parameter not yet passed to stream_agent_response (intentional - Plan 02's job)
- Validation ensures only valid strategies reach prompt adaptation layer
- Error responses guide API consumers to correct usage

**Testing verification needed:**
- Backend server should start without errors
- /api/chat?marker=xml should return 200 with X-Marker-Strategy: xml
- /api/chat?marker=llm-ui should return 200 with X-Marker-Strategy: llm-ui
- /api/chat (no marker) should default to xml
- /api/chat?marker=invalid should return 400 with valid_values

---
*Phase: 04-backend-marker-strategy*
*Completed: 2026-01-21*
