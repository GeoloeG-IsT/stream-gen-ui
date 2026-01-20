---
source: /root/wks/stream-gen-ui/lib/mock-stream.ts
indexed: 2026-01-20T00:00:00.000Z
---

# mock-stream.ts

## Purpose

Creates simulated LLM streaming responses for demo purposes without requiring a real AI backend. Uses Vercel AI SDK's simulateReadableStream to produce realistic token-by-token delivery with configurable delays, enabling the application to demonstrate streaming UI behavior.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| DEFAULT_INITIAL_DELAY_MS | const | Default 100ms delay before first token starts streaming |
| DEFAULT_CHUNK_DELAY_MS | const | Default 50ms delay between each streamed token |
| DEFAULT_PROMPT_TOKENS | const | Default prompt token count (10) for mock usage statistics |
| createMockStream | function | Creates a ReadableStream that simulates LLM token-by-token output |

## Dependencies

| Import | Purpose |
|--------|---------|
| simulateReadableStream (ai) | Vercel AI SDK function to create delayed chunk streams |
| MockStreamOptions (@/types) | Type definition for stream configuration options |

## Used By

- `/app/api/chat/route.ts` - imports DEFAULT_CHUNK_DELAY_MS and DEFAULT_INITIAL_DELAY_MS for streaming timing
- Note: createMockStream itself is not currently used (the API route uses createUIMessageStream instead), but the delay constants are shared
