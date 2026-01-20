# Story 1.3: Mock Stream Provider

Status: ready-for-dev

## Story

As a **developer**,
I want **a mock stream provider that simulates LLM output**,
so that **evaluators can demo the app without API keys**.

## Acceptance Criteria

1. **Given** the `/api/chat` endpoint exists **When** a POST request is received with messages **Then** it returns a streaming SSE response using Vercel AI SDK **And** tokens are delivered with configurable delay to simulate LLM speed **And** the response includes test content with embedded custom component markup

2. **Given** the format query param is set (e.g., `?format=flowtoken`) **When** the endpoint generates content **Then** it returns markup appropriate for that implementation's parser

## Tasks / Subtasks

- [ ] Task 1: Create mock stream utility (AC: #1)
  - [ ] Create `lib/mock-stream.ts` with `createMockStream` function
  - [ ] Use `simulateReadableStream` from 'ai' package for token-by-token delivery
  - [ ] Implement configurable delay parameters (initialDelayMs, chunkDelayMs)
  - [ ] Export DEFAULT_DELAY_MS constant (e.g., 50ms between tokens)
  - [ ] Return properly formatted stream compatible with Vercel AI SDK

- [ ] Task 2: Create test content library (AC: #1, #2)
  - [ ] Create `lib/test-content.ts` with content presets
  - [ ] Implement `getTestContent(messages: Message[], format: string)` function
  - [ ] Create content for FlowToken format (XML tags): `<ContactCard name="..." email="..." phone="..." />`
  - [ ] Create content for llm-ui format (delimiters): `【CONTACT:{"name":"...","email":"...","phone":"..."}】`
  - [ ] Create content for Streamdown format (same XML as FlowToken)
  - [ ] Include CalendarEvent examples in same format variations
  - [ ] Content should include narrative text around components to demo streaming

- [ ] Task 3: Create /api/chat route handler (AC: #1, #2)
  - [ ] Create `app/api/chat/route.ts` with POST handler
  - [ ] Parse `format` query param from URL (default: 'flowtoken')
  - [ ] Parse messages from request body JSON
  - [ ] Select test content based on format and user message
  - [ ] Stream response using mock stream utility
  - [ ] Return proper SSE response with headers

- [ ] Task 4: Add type definitions (AC: #1, #2)
  - [ ] Add `MessageFormat` type to `types/index.ts`: `'flowtoken' | 'llm-ui' | 'streamdown'`
  - [ ] Add `MockStreamOptions` interface: `{ initialDelayMs?: number; chunkDelayMs?: number }`
  - [ ] Add `TestContentRequest` interface if needed

- [ ] Task 5: Verify streaming works (AC: #1, #2)
  - [ ] Run `npm run build` - no TypeScript errors
  - [ ] Run `npm run lint` - no ESLint warnings
  - [ ] Manually test: `curl -X POST http://localhost:3000/api/chat?format=flowtoken -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hello"}]}'`

## Dev Notes

### Critical Architecture Requirements

**IMPORTANT: This is the CORE streaming backbone for ALL implementations. The mock stream provider MUST produce properly formatted SSE streams that work with Vercel AI SDK's `useChat` hook.**

### Vercel AI SDK Stream Protocol

The AI SDK uses a specific SSE format. For mock streams, use the `simulateReadableStream` utility:

```typescript
import { simulateReadableStream } from 'ai';

// Create a mock stream with configurable delays
const stream = simulateReadableStream({
  chunks: ['Hello', ' ', 'World'],
  initialDelayInMs: 100,  // Delay before first token
  chunkDelayInMs: 50,     // Delay between tokens
});
```

**CRITICAL**: The stream protocol format for text uses prefix `0:` for text chunks:
```
0:"Hello"\n
0:" World"\n
e:{"finishReason":"stop",...}\n
d:{"finishReason":"stop","usage":{...}}\n
```

### API Route Pattern (REQUIRED)

```typescript
// app/api/chat/route.ts
import { simulateReadableStream } from 'ai';

import { getTestContent } from '@/lib/test-content';

import type { MessageFormat } from '@/types';

export async function POST(req: Request): Promise<Response> {
  const { messages } = await req.json();
  const url = new URL(req.url);
  const format = (url.searchParams.get('format') || 'flowtoken') as MessageFormat;

  const content = getTestContent(messages, format);

  // Split content into tokens (words + spaces) for realistic streaming
  const tokens = content.match(/\S+|\s+/g) || [];

  // Format chunks for AI SDK data stream protocol
  const chunks = tokens.map(token => `0:${JSON.stringify(token)}\n`);
  chunks.push(`e:${JSON.stringify({ finishReason: 'stop', usage: { promptTokens: 10, completionTokens: tokens.length } })}\n`);
  chunks.push(`d:${JSON.stringify({ finishReason: 'stop', usage: { promptTokens: 10, completionTokens: tokens.length } })}\n`);

  const stream = simulateReadableStream({
    chunks,
    initialDelayInMs: 100,
    chunkDelayInMs: 50,
  }).pipeThrough(new TextEncoderStream());

  return new Response(stream, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Vercel-AI-Data-Stream': 'v1',
    },
  });
}
```

### Test Content Format Examples (REQUIRED)

**FlowToken Format (XML tags):**
```
Here's the contact information you requested:

<ContactCard name="John Smith" email="john.smith@example.com" phone="+1-555-123-4567" />

Would you like me to schedule a meeting with John?

<CalendarEvent title="Meeting with John" date="2026-01-25" time="2:00 PM" location="Conference Room A" />
```

**llm-ui Format (Delimiters + JSON):**
```
Here's the contact information you requested:

【CONTACT:{"name":"John Smith","email":"john.smith@example.com","phone":"+1-555-123-4567"}】

Would you like me to schedule a meeting with John?

【CALENDAR:{"title":"Meeting with John","date":"2026-01-25","time":"2:00 PM","location":"Conference Room A"}】
```

**Streamdown Format (same as FlowToken - XML tags):**
```
Here's the contact information you requested:

<ContactCard name="John Smith" email="john.smith@example.com" phone="+1-555-123-4567" />
```

### File Structure (REQUIRED)

```
lib/
├── utils.ts              # (existing) cn() utility
├── mock-stream.ts        # (create) Mock stream creation utility
└── test-content.ts       # (create) Test content presets by format

app/
└── api/
    └── chat/
        └── route.ts      # (create) POST handler for chat endpoint

types/
└── index.ts              # (update) Add MessageFormat type
```

### Constants (REQUIRED)

```typescript
// lib/mock-stream.ts
export const DEFAULT_INITIAL_DELAY_MS = 100;
export const DEFAULT_CHUNK_DELAY_MS = 50;
```

### Import Order Standard (MUST FOLLOW)

1. React/Next.js imports (none needed for these files)
2. Third-party libraries (`ai` package)
3. Internal components (@/components) - none needed
4. Utilities (@/lib)
5. Types (use `import type`)

### Anti-Patterns to Avoid

- **DO NOT** use `export default` - use named exports only
- **DO NOT** use `any` type - all parameters must be typed
- **DO NOT** hard-code delays inline - use constants
- **DO NOT** return plain text - use proper SSE format with headers
- **DO NOT** forget the `X-Vercel-AI-Data-Stream: v1` header
- **DO NOT** use real LLM calls - this is a MOCK provider

### Previous Story Learnings (from 1.2)

From Story 1.2 implementation:
- **`JSX.Element` return type** caused issues with React 19 - use `ReactElement` instead
- **Components follow named export pattern** - apply same to utility functions
- **cn() utility works** - already available in lib/utils.ts
- **Vitest setup exists** - can add tests if needed

### Project Structure Notes

**Files to Create:**
- `lib/mock-stream.ts` - Mock stream utility with simulateReadableStream wrapper
- `lib/test-content.ts` - Test content presets for all three formats
- `app/api/chat/route.ts` - API route handler

**Files to Update:**
- `types/index.ts` - Add MessageFormat type

**Directory to Create:**
- `app/api/chat/` - API route directory

### Testing Strategy

Manual testing with curl:
```bash
# Test FlowToken format
curl -N -X POST "http://localhost:3000/api/chat?format=flowtoken" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Show me a contact"}]}'

# Test llm-ui format
curl -N -X POST "http://localhost:3000/api/chat?format=llm-ui" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Show me a contact"}]}'

# Test streamdown format
curl -N -X POST "http://localhost:3000/api/chat?format=streamdown" \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"Show me a contact"}]}'
```

You should see tokens streaming with the configured delay, formatted as SSE events.

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.3: Mock Stream Provider]
- [Source: _bmad-output/planning-artifacts/architecture.md#API & Communication Patterns]
- [Source: _bmad-output/planning-artifacts/architecture.md#API Route Design]
- [Source: _bmad-output/planning-artifacts/architecture.md#LLM Output Formats by Route]
- [Source: _bmad-output/project-context.md#Streaming UI Rules]
- [Source: ai-sdk.dev/docs/reference/ai-sdk-core/simulate-readable-stream]
- [Source: ai-sdk.dev/docs/ai-sdk-ui/stream-protocol]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
