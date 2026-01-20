---
source: /root/wks/stream-gen-ui/app/flowtoken/page.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# page.tsx (flowtoken)

## Purpose

FlowToken implementation page that demonstrates streaming UI with XML-based custom component syntax. Uses the FlowToken library's approach where components like `<contactcard>` and `<calendarevent>` are embedded as XML tags in the streamed text and parsed/rendered in real-time.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| default (FlowTokenPage) | function (React component) | Page component implementing the FlowToken streaming demo |

## Dependencies

| Import | Purpose |
|--------|---------|
| useState, useCallback, useMemo, useRef, useEffect (react) | React hooks for state, memoization, refs, and side effects |
| FormEvent, ChangeEvent, ReactElement (react) | TypeScript types for event handlers and return type |
| useChat (@ai-sdk/react) | Vercel AI SDK hook for managing chat state and streaming |
| DefaultChatTransport (ai) | Transport layer for configuring API endpoint |
| FlowTokenRenderer (@/components/flowtoken/FlowTokenRenderer) | Renders streamed content with XML component parsing |
| Header (@/components/shared/Header) | Navigation header with format selector |
| MessageBubble (@/components/shared/MessageBubble) | Container for individual chat messages |
| ChatInput (@/components/shared/ChatInput) | Input field with preset buttons |
| TypingIndicator (@/components/shared/TypingIndicator) | Loading indicator during streaming |

## Used By

Entry point - This is a Next.js page accessible at `/flowtoken` route.
