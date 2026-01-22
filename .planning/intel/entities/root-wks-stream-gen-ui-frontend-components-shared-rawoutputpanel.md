---
path: /root/wks/stream-gen-ui/frontend/components/shared/RawOutputPanel.tsx
type: component
updated: 2026-01-21
status: active
---

# RawOutputPanel.tsx

## Purpose

Fixed-position side panel component that displays raw markup content on the right side of the screen. Conditionally renders only when the viewRaw toggle is enabled AND rawContent exists in the ViewRaw context.

## Exports

- `RawOutputPanel` - React component that renders a sliding panel with header, close button, and scrollable content area for raw output display

## Dependencies

- [[root-wks-stream-gen-ui-frontend-contexts-viewrawcontext]] - useViewRaw hook for toggle state and raw content
- [[root-wks-stream-gen-ui-frontend-lib-utils]] - cn utility for className merging
- [[root-wks-stream-gen-ui-frontend-components-shared-rawoutputview]] - RawOutputView component for content rendering

## Used By

TBD

## Notes

- Panel uses CSS transform for slide-in/slide-out animation with 300ms duration
- Responsive width: full width on mobile, 400px on md breakpoint and above
- Dark theme styling (gray-900 background) contrasts with main content area