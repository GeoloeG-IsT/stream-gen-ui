# Story 1.3: Mock Stream Provider

Status: done

## Story

As a **developer**,
I want **a mock stream provider that simulates LLM output**,
so that **evaluators can demo the app without API keys**.

## Acceptance Criteria

1. **Given** the `/api/chat` endpoint exists **When** a POST request is received with messages **Then** it returns a streaming SSE response using Vercel AI SDK **And** tokens are delivered with configurable delay to simulate LLM speed **And** the response includes test content with embedded custom component markup

2. **Given** the format query param is set (e.g., `?format=flowtoken`) **When** the endpoint generates content **Then** it returns markup appropriate for that implementation's parser

## Tasks / Subtasks

- [x] Task 1: Create mock stream utility (AC: #1)
  - [x] Create `lib/mock-stream.ts` with `createMockStream` function
  - [x] Use `simulateReadableStream` from 'ai' package for token-by-token delivery
  - [x] Implement configurable delay parameters (initialDelayMs, chunkDelayMs)
  - [x] Export DEFAULT_DELAY_MS constant (e.g., 50ms between tokens)
  - [x] Return properly formatted stream compatible with Vercel AI SDK

- [x] Task 2: Create test content library (AC: #1, #2)
  - [x] Create `lib/test-content.ts` with content presets
  - [x] Implement `getTestContent(messages: Message[], format: string)` function
  - [x] Create content for FlowToken format (XML tags): `<ContactCard name="..." email="..." phone="..." />`
  - [x] Create content for llm-ui format (delimiters): `【CONTACT:{"name":"...","email":"...","phone":"..."}】`
  - [x] Create content for Streamdown format (same XML as FlowToken)
  - [x] Include CalendarEvent examples in same format variations
  - [x] Content should include narrative text around components to demo streaming

- [x] Task 3: Create /api/chat route handler (AC: #1, #2)
  - [x] Create `app/api/chat/route.ts` with POST handler
  - [x] Parse `format` query param from URL (default: 'flowtoken')
  - [x] Parse messages from request body JSON
  - [x] Select test content based on format and user message
  - [x] Stream response using mock stream utility
  - [x] Return proper SSE response with headers

- [x] Task 4: Add type definitions (AC: #1, #2)
  - [x] Add `MessageFormat` type to `types/index.ts`: `'flowtoken' | 'llm-ui' | 'streamdown'`
  - [x] Add `MockStreamOptions` interface: `{ initialDelayMs?: number; chunkDelayMs?: number }`
  - [x] Add `TestContentRequest` interface if needed

- [x] Task 5: Verify streaming works (AC: #1, #2)
  - [x] Run `npm run build` - no TypeScript errors
  - [x] Run `npm run lint` - no ESLint warnings
  - [x] Manually test: `curl -X POST http://localhost:3000/api/chat?format=flowtoken -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"hello"}]}'`

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

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None required.

### Completion Notes List

- Implemented mock stream provider with `createMockStream()` function using Vercel AI SDK's `simulateReadableStream`
- Created test content library with content presets for all 3 formats (FlowToken, llm-ui, Streamdown)
- Built /api/chat POST endpoint that returns SSE streams with proper headers (`X-Vercel-AI-Data-Stream: v1`)
- Added `MessageFormat` and `MockStreamOptions` types to types/index.ts
- All unit tests pass (45 tests across 5 test files)
- Build passes with no TypeScript errors
- Lint passes with no ESLint warnings
- Stream uses AI SDK data protocol format (0: prefix for text, e: for finish, d: for done)

### File List

**Created:**
- lib/mock-stream.ts
- lib/mock-stream.test.ts
- lib/test-content.ts
- lib/test-content.test.ts
- app/api/chat/route.ts
- app/api/chat/route.test.ts

**Modified:**
- types/index.ts

### Change Log

- 2026-01-20: Implemented mock stream provider (Story 1.3) - all tasks complete, all tests passing
- 2026-01-20: Code review completed - fixed 5 issues (1 HIGH, 4 MEDIUM)

## Senior Developer Review (AI)

**Review Date:** 2026-01-20
**Review Outcome:** Approved (after fixes)
**Reviewer:** Claude Opus 4.5 (code-review workflow)

### Issues Found & Resolved

| # | Severity | Issue | Resolution |
|---|----------|-------|------------|
| 1 | HIGH | No error handling in API route - `req.json()` could throw, missing validation | ✅ Added try/catch, `validateRequestBody()` function, proper 400 error responses |
| 2 | MED | Unsafe type assertion `as MessageFormat` for user input | ✅ Added `isValidMessageFormat()` type guard in types/index.ts |
| 3 | MED | Duplicate Message interface in test-content.ts and route.ts | ✅ Consolidated to shared `ChatMessage` type in types/index.ts |
| 4 | MED | Magic number `promptTokens: 10` in mock-stream.ts | ✅ Extracted to `DEFAULT_PROMPT_TOKENS` constant |
| 5 | MED | Missing error case tests for API route | ✅ Added 7 new tests for error scenarios |

### Action Items

- [x] [AI-Review][HIGH] Add error handling to API route `app/api/chat/route.ts`
- [x] [AI-Review][MED] Add proper format validation with type guard
- [x] [AI-Review][MED] Consolidate duplicate Message type definitions
- [x] [AI-Review][MED] Extract magic number to named constant
- [x] [AI-Review][MED] Add error case tests for invalid inputs

### Summary

All HIGH and MEDIUM issues have been fixed. The API route now has proper error handling, input validation, and returns appropriate 400 error responses for malformed requests. Test coverage increased from 12 to 19 tests for the route handler.
