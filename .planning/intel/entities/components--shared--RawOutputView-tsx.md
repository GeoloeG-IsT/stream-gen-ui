---
source: /root/wks/stream-gen-ui/components/shared/RawOutputView.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# RawOutputView.tsx

## Purpose

Debug display component showing raw streamed markup in a monospace dark-themed code block. Enables evaluation of what each parser actually receives, helping developers understand streaming behavior and debug custom component markup. Activated via the Header's "View Raw" toggle.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| RawOutputView | function | React component displaying raw content in a scrollable pre/code block with streaming cursor |

## Dependencies

| Import | Purpose |
|--------|---------|
| react (ReactElement) | TypeScript type for component return value |
| @/lib/utils (cn) | Conditional className composition |
| @/types (RawOutputViewProps) | TypeScript interface for content string and isStreaming boolean |

## Used By

- `components/shared/MessageBubble.tsx` - Conditionally rendered below assistant message content when viewRaw context is true
- Shows the unparsed markup that the streaming library receives before rendering
