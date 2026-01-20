---
source: /root/wks/stream-gen-ui/components/flowtoken/FlowTokenRenderer.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# FlowTokenRenderer.tsx

## Purpose

Wrapper component for the FlowToken library's AnimatedMarkdown component with error boundary protection. Renders streamed markdown content with custom component support (ContactCard, CalendarEvent) and graceful fallback to raw text on parse errors. Core rendering layer for the FlowToken implementation.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| FlowTokenRenderer | function | React component wrapping AnimatedMarkdown with error boundary and custom components |
| FlowTokenRendererProps | interface | TypeScript interface for content string and optional isStreaming boolean |

## Dependencies

| Import | Purpose |
|--------|---------|
| react (Component, ReactElement, ReactNode, ErrorInfo) | Class component for error boundary, types |
| flowtoken (AnimatedMarkdown) | Core streaming markdown renderer from FlowToken library |
| @/components/shared/CalendarEvent | Custom component for `<calendarevent>` tags |
| @/components/shared/ContactCard | Custom component for `<contactcard>` tags |

## Used By

- `components/flowtoken/FlowTokenChatMessage.tsx` - Renders assistant message content
- Provides the FlowToken-specific rendering with fadeIn animation during streaming
