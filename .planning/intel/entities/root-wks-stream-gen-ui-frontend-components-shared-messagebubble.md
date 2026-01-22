---
path: /root/wks/stream-gen-ui/frontend/components/shared/MessageBubble.tsx
type: component
updated: 2026-01-21
status: active
---

# MessageBubble.tsx

## Purpose

A reusable chat message bubble component that renders user and assistant messages with distinct styling. Supports streaming state with visual feedback (pulse animation and cursor indicator).

## Exports

- **MessageBubble**: React component that displays a styled message bubble with role-based styling (blue for user, white bordered for assistant), streaming indicators, and flexible content via children or content prop.

## Dependencies

- [[root-wks-stream-gen-ui-lib-utils]]: `cn` utility for conditional classNames
- `@/types`: MessageBubbleProps type definition (external type import)

## Used By

TBD

## Notes

- Uses ARIA attributes for accessibility (`role="article"`, `aria-label`)
- Children prop takes precedence over content prop when both provided
- Streaming state shows pulse animation on the bubble and a cursor indicator when no content is present