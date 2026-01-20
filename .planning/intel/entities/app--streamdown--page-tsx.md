---
source: /root/wks/stream-gen-ui/app/streamdown/page.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# page.tsx (streamdown)

## Purpose

Streamdown implementation page that demonstrates streaming UI with XML-based custom component syntax (same format as FlowToken). Uses the Streamdown library's approach for parsing and rendering custom components like `<contactcard>` and `<calendarevent>` embedded in streamed markdown text.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| default (StreamdownPage) | function (React component) | Page component implementing the Streamdown streaming demo |

## Dependencies

| Import | Purpose |
|--------|---------|
| useState, useCallback, useMemo, useRef, useEffect (react) | React hooks for state, memoization, refs, and side effects |
| FormEvent, ChangeEvent, ReactElement (react) | TypeScript types for event handlers and return type |
| useChat (@ai-sdk/react) | Vercel AI SDK hook for managing chat state and streaming |
| DefaultChatTransport (ai) | Transport layer for configuring API endpoint |
| StreamdownRenderer (@/components/streamdown/StreamdownRenderer) | Renders streamed content with XML component parsing (Streamdown approach) |
| Header (@/components/shared/Header) | Navigation header with format selector |
| MessageBubble (@/components/shared/MessageBubble) | Container for individual chat messages |
| ChatInput (@/components/shared/ChatInput) | Input field with preset buttons |
| TypingIndicator (@/components/shared/TypingIndicator) | Loading indicator during streaming |

## Used By

Entry point - This is a Next.js page accessible at `/streamdown` route.
