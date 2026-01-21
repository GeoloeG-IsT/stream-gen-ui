---
phase: 04-backend-marker-strategy
plan: 02
subsystem: backend
tags: [langchain, langgraph, prompts, agent, streaming, xml, llm-ui]

# Dependency graph
requires:
  - phase: 04-01
    provides: MarkerStrategy enum and /api/chat marker query parameter validation
provides:
  - Marker-aware prompt templates for XML and llm-ui formats
  - Request-scoped agent graph creation with marker parameter
  - End-to-end marker flow from endpoint to agent output
affects: [05-frontend-renderer-integration]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Request-scoped agent graph creation (removed singleton pattern)"
    - "Format string templates with marker-specific entity syntax"
    - "Marker parameter threading through prompt → graph → endpoint"

key-files:
  created: []
  modified:
    - backend/agent/prompts.py
    - backend/agent/graph.py
    - backend/agent/__init__.py
    - backend/main.py

key-decisions:
  - "Template-based prompt generation enables clean format switching"
  - "Request-scoped graphs prevent marker leakage between requests"
  - "XML format: <contactcard/> and <calendarevent/> tags"
  - "llm-ui format: 【CONTACT:{...}】 and 【CALENDAR:{...}】 delimiters"

patterns-established:
  - "Entity format templates as constants (XML_CONTACT_FORMAT, LLMUI_CONTACT_FORMAT)"
  - "Base prompt with format string placeholders"
  - "Marker parameter flows: endpoint → stream function → graph creation → prompt"

# Metrics
duration: 3min
completed: 2026-01-21
---

# Phase 04 Plan 02: Backend Marker Strategy Summary

**Agent outputs XML tags `<contactcard/>` and `<calendarevent/>` for marker=xml, Chinese bracket delimiters 【CONTACT:{...}】 and 【CALENDAR:{...}】 for marker=llm-ui**

## Performance

- **Duration:** 3 min 25 sec
- **Started:** 2026-01-21T19:41:51Z
- **Completed:** 2026-01-21T19:45:16Z
- **Tasks:** 2
- **Files modified:** 4

## Accomplishments
- Created marker-aware prompt templates with XML and llm-ui entity format variants
- Removed singleton pattern - agent graphs are now request-scoped with marker parameter
- Wired marker through complete flow: /api/chat → stream_agent_response → create_agent_graph → get_agent_prompt
- Agent adapts output format based on marker query parameter

## Task Commits

Each task was committed atomically:

1. **Task 1: Create marker-aware prompt templates** - `efa5e3f0` (feat)
2. **Task 2: Wire marker through agent graph and endpoint** - `5eb7d877` (feat)

## Files Created/Modified
- `backend/agent/prompts.py` - Added marker-aware format templates and get_agent_prompt(marker)
- `backend/agent/graph.py` - Updated create_agent_graph(marker) and removed singleton pattern
- `backend/agent/__init__.py` - Removed get_agent_graph export, kept create_agent_graph
- `backend/main.py` - Updated stream_agent_response to accept marker and create request-scoped graph

## Decisions Made

**1. Template-based prompt generation**
- Base prompt has placeholders for contact_format and event_format
- Marker selects appropriate format constants
- Clean separation between shared logic and format-specific syntax

**2. Request-scoped graph creation**
- Removed global _agent_graph singleton
- Each request creates fresh graph with appropriate marker
- Prevents marker value leakage between concurrent requests
- Slight performance overhead acceptable for correctness

**3. Entity format specifications**
- **XML format:** Single-line self-closing tags with attributes
  - Contact: `<contactcard name="..." email="..." phone="..." company="..." title="..." />`
  - Event: `<calendarevent title="..." date="..." time="..." location="..." description="..." />`
- **llm-ui format:** Chinese brackets with JSON payload
  - Contact: `【CONTACT:{"name":"...","email":"...","phone":"...","company":"...","title":"..."}】`
  - Event: `【CALENDAR:{"title":"...","date":"...","time":"...","location":"...","description":"..."}】`

**4. Field naming alignment**
- Contact fields: name, email, phone, company, title (consistent across formats)
- Event fields: title, date, time, location, description (consistent across formats)
- Simplification: Single "time" field instead of startTime/endTime
- Changed from "address" to "company" for contact affiliation

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Field name standardization**
- **Found during:** Task 1 (Creating prompt templates)
- **Issue:** Plan specified "address" for contacts but knowledge base uses "company" (department affiliation). Also specified separate "startTime" and "endTime" for events but simpler to have single "time" field.
- **Fix:** Used "company" instead of "address" for contact affiliation, used single "time" field for events
- **Files modified:** backend/agent/prompts.py
- **Verification:** Aligned with actual knowledge base schema and simplified event time representation
- **Committed in:** efa5e3f0 (Task 1 commit)

---

**Total deviations:** 1 auto-fixed (1 bug - field name alignment)
**Impact on plan:** Field names now match knowledge base schema. No scope creep.

## Issues Encountered
None - implementation proceeded smoothly.

## User Setup Required
None - no external service configuration required.

## Next Phase Readiness
- Backend now produces marker-specific entity formats
- Ready for Phase 05 frontend renderer integration
- Frontend renderers can parse XML tags (Streamdown) or Chinese bracket delimiters (llm-ui)
- No blockers for next phase

---
*Phase: 04-backend-marker-strategy*
*Completed: 2026-01-21*
