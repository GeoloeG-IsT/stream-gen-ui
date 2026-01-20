---
source: /root/wks/stream-gen-ui/components/shared/MessageBubble.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# MessageBubble.tsx

## Purpose

Renders a single chat message with role-based styling (user messages right-aligned blue, assistant messages left-aligned white). Supports streaming state visual feedback and optionally displays raw markup output below assistant messages when debug mode is active.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| MessageBubble | function | React component for displaying a styled chat message bubble with optional children and raw output |

## Dependencies

| Import | Purpose |
|--------|---------|
| react (ReactElement) | TypeScript type for component return value |
| @/contexts/ViewRawContext (useViewRaw) | Check if raw output debug mode is enabled |
| @/lib/utils (cn) | Conditional className composition |
| @/types (MessageBubbleProps) | TypeScript props interface |
| ./RawOutputView | Displays raw streamed markup when viewRaw is active |

## Used By

- `components/shared/MessageList.tsx` - Renders each message in the conversation
- `components/flowtoken/FlowTokenChatMessage.tsx` - Wraps FlowToken-rendered content
- `components/llmui/LlmUiChatMessage.tsx` - Wraps llm-ui-rendered content
- `components/streamdown/StreamdownChatMessage.tsx` - Wraps Streamdown-rendered content
