---
phase: quick
plan: 002
subsystem: ui
tags: [llm-ui, json, zod, react, typescript]

# Dependency graph
requires:
  - phase: 05-03
    provides: LLMUIRenderer component with custom block matchers
provides:
  - Cleaner LLMUIRenderer using official @llm-ui/json jsonBlock pattern
  - Zod validation for contact and calendar blocks
  - Separate LLMOutputComponent wrappers for better maintainability
affects: [future llm-ui format changes, renderer maintenance]

# Tech tracking
tech-stack:
  added: [@llm-ui/json]
  patterns: [jsonBlock pattern, Zod schema validation, LLMOutputComponent wrappers]

key-files:
  created:
    - frontend/components/llm-ui/schemas.ts
    - frontend/components/llm-ui/ContactBlockComponent.tsx
    - frontend/components/llm-ui/CalendarBlockComponent.tsx
  modified:
    - frontend/components/llm-ui/LLMUIRenderer.tsx
    - frontend/components/llm-ui/LLMUIRenderer.test.tsx
    - backend/agent/prompts.py

key-decisions:
  - "Use jsonBlock() from @llm-ui/json instead of custom block matchers"
  - "Change format from 【CONTACT:{...}】 to 【{\"type\":\"contact\",...}】"
  - "Separate component wrappers for cleaner error handling and validation"

patterns-established:
  - "LLMOutputComponent pattern: wrapper components that parse and validate block output"
  - "Zod schema validation: type-safe parsing with graceful error messages"

# Metrics
duration: 5.6min
completed: 2026-01-22
---

# Quick Task 002: Refactor to llm-ui JSON Blocks Pattern Summary

**Replaced hand-rolled delimiter matching with official @llm-ui/json jsonBlock pattern, reducing code by 107 lines while adding Zod validation**

## Performance

- **Duration:** 5.6 min
- **Started:** 2026-01-22T02:18:53Z
- **Completed:** 2026-01-22T02:24:28Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments
- Installed @llm-ui/json and created Zod schemas matching ContactCardProps/CalendarEventProps
- Created separate LLMOutputComponent wrappers for ContactCard and CalendarEvent
- Refactored LLMUIRenderer to use jsonBlock() pattern instead of custom createBlockMatcher
- Updated backend prompts and tests to match new 【{"type":"contact",...}】 format
- Reduced LLMUIRenderer.tsx from 213 to 106 lines (107 line reduction, 50% smaller)

## Task Commits

Each task was committed atomically:

1. **Task 1: Install @llm-ui/json and create Zod schemas** - `a3526764` (feat)
2. **Task 2: Create LLMOutputComponent wrappers** - `3672f647` (feat)
3. **Task 3: Refactor LLMUIRenderer to use jsonBlock pattern** - `fb271373` (refactor)

## Files Created/Modified
- `frontend/components/llm-ui/schemas.ts` - Zod schemas for contact and calendar blocks
- `frontend/components/llm-ui/ContactBlockComponent.tsx` - LLMOutputComponent wrapper for ContactCard
- `frontend/components/llm-ui/CalendarBlockComponent.tsx` - LLMOutputComponent wrapper for CalendarEvent
- `frontend/components/llm-ui/LLMUIRenderer.tsx` - Refactored to use jsonBlock() pattern
- `frontend/components/llm-ui/LLMUIRenderer.test.tsx` - Updated test format to match new delimiter pattern
- `backend/agent/prompts.py` - Updated llm-ui format instructions for LLM
- `frontend/package.json` - Added @llm-ui/json dependency

## Decisions Made

**1. Use jsonBlock() from @llm-ui/json instead of custom matchers**
- Rationale: Official library pattern is more maintainable and reduces custom code
- Outcome: 107 fewer lines of code, cleaner implementation

**2. Change format from 【CONTACT:{...}】 to 【{"type":"contact",...}】**
- Rationale: jsonBlock expects type field in JSON, not in delimiter prefix
- Outcome: Backend prompts and tests updated to match, all tests passing

**3. Separate component wrappers instead of inline parsing**
- Rationale: Better separation of concerns, easier error handling with Zod
- Outcome: ContactBlockComponent and CalendarBlockComponent provide clear validation errors

## Deviations from Plan

**1. [Rule 1 - Bug] Updated backend prompt format to match jsonBlock expectations**
- **Found during:** Task 3 (Refactoring LLMUIRenderer)
- **Issue:** Backend was generating 【CONTACT:{...}】 format, but jsonBlock expects 【{"type":"contact",...}】
- **Fix:** Updated LLMUI_CONTACT_FORMAT and LLMUI_EVENT_FORMAT in backend/agent/prompts.py to include "type" field
- **Files modified:** backend/agent/prompts.py
- **Verification:** Tests updated and passing (16/16)
- **Committed in:** fb271373 (Task 3 commit)

---

**Total deviations:** 1 auto-fixed (1 bug fix)
**Impact on plan:** Backend format update was necessary for jsonBlock compatibility. No scope creep.

## Issues Encountered

**parseJson5 returning undefined in tests**
- Problem: Mock was passing full delimiter string 【{...}】 instead of just JSON content
- Resolution: Updated test mock to extract JSON from regex capture group (match[1])
- All 16 tests passing after fix

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- LLMUIRenderer now uses official @llm-ui/json pattern
- Cleaner codebase with 50% fewer lines in renderer
- Better error handling with Zod validation
- Ready for additional block types if needed in future

---
*Phase: quick*
*Completed: 2026-01-22*
