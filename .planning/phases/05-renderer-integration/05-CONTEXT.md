# Phase 5: Renderer Integration - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Wire llm-ui and Streamdown pages to live /api/chat backend with appropriate marker params. Fix transient markup display issues so no incomplete delimiters or tags are visible during streaming.

</domain>

<decisions>
## Implementation Decisions

### Transient markup hiding
- Show skeleton loader placeholder while markup is incomplete (not buffering)
- Fade transition (150-200ms) when component is ready to render
- Each renderer uses its native loading patterns — llm-ui and Streamdown may differ

### Error handling
- Show error toast notification, preserve partial response visible in chat
- Inline retry prompt below the partial response (not in toast)
- Differentiate error types: network error vs server error vs timeout show distinct messages
- Remove skeleton if error occurs while component was loading (don't show failed state)

### Loading states
- Initial loading already handled by frontend — no changes needed
- **Investigate:** Interaction sluggishness during streaming (both scrolling and clicks feel blocked/slow)
  - Fix if straightforward, defer if complex root cause

### Stream interruption
- Stop button visible during streaming to abort request
- Partial response marked with "(stopped)" indicator when user interrupts
- Remove incomplete components (skeletons) when stopped — only complete content remains
- Abort request on page navigation (don't persist in background)

### Claude's Discretion
- Exact skeleton component sizing and styling
- Toast positioning and duration
- Stop button placement and styling
- Error message wording

</decisions>

<specifics>
## Specific Ideas

- Fade transition should feel smooth, not jarring — 150-200ms range
- Error messages should be specific enough to help user understand what happened (network issue vs server problem)

</specifics>

<deferred>
## Deferred Ideas

- Background response continuation — let response complete when user navigates away, show full response when they return (requires chat state persistence)

</deferred>

---

*Phase: 05-renderer-integration*
*Context gathered: 2026-01-21*
