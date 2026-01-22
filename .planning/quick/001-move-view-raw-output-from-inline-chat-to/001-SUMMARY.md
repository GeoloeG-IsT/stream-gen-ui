---
phase: quick-001
plan: 01
subsystem: ui
tags: [react, nextjs, context-api, tailwind, side-panel]

# Dependency graph
requires:
  - phase: 05-03
    provides: FlowToken, LLM-UI, and Streamdown renderers with View Raw toggle
provides:
  - Side panel component for raw output display
  - ViewRawContext extended with rawContent state
  - Clean chat UI without inline raw markup
affects: [any future raw output display features]

# Tech tracking
tech-stack:
  added: []
  patterns: [Side panel with fixed positioning, Context-based content sync]

key-files:
  created:
    - frontend/components/shared/RawOutputPanel.tsx
  modified:
    - frontend/contexts/ViewRawContext.tsx
    - frontend/components/shared/MessageBubble.tsx
    - frontend/app/flowtoken/page.tsx
    - frontend/app/llm-ui/page.tsx
    - frontend/app/streamdown/page.tsx

key-decisions:
  - "Side panel fixed at right: 0, width 400px on desktop"
  - "Chat area shrinks with mr-[400px] when panel visible"
  - "useEffect syncs rawContent from last assistant message"
  - "Close button toggles viewRaw off (closes panel)"

patterns-established:
  - "Side panel pattern: fixed position, smooth slide-in/out transition"
  - "Context-driven content: pages update context, panel reads from context"

# Metrics
duration: 4min
completed: 2026-01-21
---

# Quick Task 001: Move View Raw Output to Side Panel

**Raw LLM output moved from inline chat bubbles to collapsible 400px side panel with smooth transitions**

## Performance

- **Duration:** 4 min
- **Started:** 2026-01-21T23:48:11Z
- **Completed:** 2026-01-21T23:52:31Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments
- Side panel displays raw output when View Raw is ON
- Chat area remains clean without inline raw markup
- Smooth slide-in/out animation (300ms transition)
- Chat layout automatically adjusts when panel opens/closes

## Task Commits

Each task was committed atomically:

1. **Task 1: Extend ViewRawContext and create RawOutputPanel component** - `d237ccfa` (feat)
2. **Task 2: Remove inline raw output and integrate side panel into pages** - `2bf82ad4` (feat)

## Files Created/Modified
- `frontend/components/shared/RawOutputPanel.tsx` - Fixed position side panel with header, close button, and scrollable content area
- `frontend/contexts/ViewRawContext.tsx` - Extended with rawContent and setRawContent state
- `frontend/components/shared/MessageBubble.tsx` - Removed inline RawOutputView rendering and unused imports
- `frontend/app/flowtoken/page.tsx` - Integrated RawOutputPanel, added useEffect to sync rawContent
- `frontend/app/llm-ui/page.tsx` - Integrated RawOutputPanel, added useEffect to sync rawContent
- `frontend/app/streamdown/page.tsx` - Integrated RawOutputPanel, added useEffect to sync rawContent

## Decisions Made

**Side panel positioning and sizing:**
- Fixed position (right: 0, top: 56px below header, bottom: 0)
- Width: 400px on desktop, full-width on mobile
- Smooth transform transition (300ms ease-out) for slide-in/out

**Content synchronization:**
- Each page uses useEffect to update rawContent when last assistant message changes
- Filters formattedMessages for assistant role, pops last message
- Sets rawContent to null when no assistant messages exist

**Layout strategy:**
- Chat container uses flex layout with two areas
- Chat area (flex-1) shrinks with mr-[400px] when viewRaw is true
- Panel renders conditionally based on viewRaw && rawContent
- Maintains max-w-3xl constraint on chat content for readability

**Close interaction:**
- Close button (X) in panel header calls setViewRaw(false)
- Panel automatically hides when viewRaw toggles off
- Provides accessible aria-label for screen readers

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Raw output side panel feature complete. Clean separation between chat UI and debug/evaluation view enables:
- Future enhancements to raw output formatting
- Additional debug panels using same pattern
- Per-message raw output inspection (not currently needed)

---
*Phase: quick-001*
*Completed: 2026-01-21*
