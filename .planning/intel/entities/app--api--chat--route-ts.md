---
source: /root/wks/stream-gen-ui/app/api/chat/route.ts
indexed: 2026-01-20T00:00:00.000Z
---

# route.ts

## Purpose

Next.js API route handler that receives chat messages and returns a streaming SSE response simulating LLM output. Serves as the backend for all three streaming implementations (FlowToken, llm-ui, Streamdown), selecting the appropriate content format based on the `format` query parameter.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| POST | function (async) | HTTP POST handler that validates requests and returns streaming UI message responses |

## Dependencies

| Import | Purpose |
|--------|---------|
| createUIMessageStream, createUIMessageStreamResponse (ai) | Vercel AI SDK v6 functions for creating streaming responses compatible with useChat |
| getTestContent (@/lib/test-content) | Retrieves pre-defined test content based on format and user message |
| DEFAULT_CHUNK_DELAY_MS, DEFAULT_INITIAL_DELAY_MS (@/lib/mock-stream) | Timing constants for realistic streaming delays |
| MessageFormat, isValidMessageFormat (@/types) | Type and validator for message format parameter |

## Used By

Entry point - This is an API route handler called by:
- `/app/flowtoken/page.tsx` - via useChat with `?format=flowtoken`
- `/app/llm-ui/page.tsx` - via useChat with `?format=llm-ui`
- `/app/streamdown/page.tsx` - via useChat with `?format=streamdown`
