# Architecture Documentation

## Executive Summary

**stream-gen-ui** is a proof-of-concept Next.js application that compares three approaches for rendering custom React components within streaming LLM responses. The project demonstrates how different parsing strategies handle real-time token streaming with embedded structured data (contact cards, calendar events).

## Technology Stack

| Category | Technology | Version | Purpose |
|----------|------------|---------|---------|
| **Framework** | Next.js | 16.1.4 | App Router, SSR, API Routes |
| **Runtime** | React | 19.2.3 | UI rendering |
| **Language** | TypeScript | 5.x | Type safety |
| **Styling** | Tailwind CSS | 4.x | Utility-first CSS |
| **Icons** | Lucide React | 0.562.0 | Icon components |
| **AI SDK** | Vercel AI SDK | 6.0.41 | `useChat` hook, streaming infrastructure |
| **Streaming: FlowToken** | flowtoken | 1.0.40 | XML-based component streaming |
| **Streaming: llm-ui** | @llm-ui/react | 0.13.3 | Delimiter-based block parsing |
| **Streaming: Streamdown** | streamdown | 2.1.0 | Markdown streaming |
| **Testing** | Vitest | 4.0.17 | Test runner |
| **Testing** | Testing Library | 16.3.2 | React component testing |
| **Testing** | jsdom | 27.4.0 | DOM simulation |

## Architecture Pattern

**Component-Based Architecture** with **Strategy Pattern** for streaming implementations.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App Router                       │
├─────────────────────────────────────────────────────────────────┤
│  app/layout.tsx (ViewRawProvider)                               │
│       │                                                          │
│       ├── app/flowtoken/page.tsx  ─┐                            │
│       ├── app/llm-ui/page.tsx     ─┼── Implementation Pages     │
│       └── app/streamdown/page.tsx ─┘                            │
│                    │                                             │
│                    ▼                                             │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                   Shared Components                       │   │
│  │  Header │ ChatInput │ MessageBubble │ TypingIndicator    │   │
│  │  ContactCard │ CalendarEvent │ RawOutputView             │   │
│  └──────────────────────────────────────────────────────────┘   │
│                    │                                             │
│                    ▼                                             │
│  ┌─────────────────┬─────────────────┬─────────────────────┐    │
│  │  FlowToken      │  llm-ui         │  Streamdown         │    │
│  │  Renderer       │  Renderer       │  Renderer           │    │
│  │  (XML tags)     │  (Delimiters)   │  (Custom XML)       │    │
│  └─────────────────┴─────────────────┴─────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Layer                                  │
│  POST /api/chat?format={flowtoken|llm-ui|streamdown}            │
│       │                                                          │
│       ▼                                                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  Mock Stream Provider                                     │   │
│  │  - getTestContent() → Format-aware content selection     │   │
│  │  - createUIMessageStream() → Token-by-token streaming    │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
User Input → ChatInput → useChat (AI SDK) → POST /api/chat?format=X
                                                    │
                                          Mock Stream Provider
                                          (format-aware content)
                                                    │
                                          SSE tokens to client
                                                    │
                                          useChat.messages update
                                                    │
                                          {Impl}Renderer parses
                                                    │
                         ┌──────────────────────────┴──────────────────────────┐
                         │                                                      │
                    Markdown text                                    Custom components
                    (rendered as HTML)                               (ContactCard, CalendarEvent)
```

## Implementation Strategies

### 1. FlowToken (XML-based)

**Markup Format:**
```xml
<contactcard name="John" email="john@example.com"></contactcard>
<calendarevent title="Meeting" date="2026-01-25"></calendarevent>
```

**Implementation:**
- Uses `AnimatedMarkdown` component from flowtoken
- Custom components registered via `customComponents` prop
- Built-in animation support for streaming
- Error boundary for graceful degradation

**Key Files:**
- `components/flowtoken/FlowTokenRenderer.tsx`
- `app/flowtoken/page.tsx`

### 2. llm-ui (Delimiter-based)

**Markup Format:**
```
【CONTACT:{"name":"John","email":"john@example.com"}】
【CALENDAR:{"title":"Meeting","date":"2026-01-25"}】
```

**Implementation:**
- Uses `useLLMOutput` hook with custom block matchers
- Block matchers define `findCompleteMatch`, `findPartialMatch`, `lookBack`
- Frame-rate throttling for smooth streaming UX
- ReactMarkdown for fallback text content

**Key Files:**
- `components/llm-ui/LLMUIRenderer.tsx`
- `app/llm-ui/page.tsx`

### 3. Streamdown (Custom XML)

**Markup Format:**
```xml
<contactcard name="John" email="john@example.com"></contactcard>
<calendarevent title="Meeting" date="2026-01-25"></calendarevent>
```

**Implementation:**
- Custom regex-based XML parser (`parseContent()`)
- Separates content into markdown segments and component segments
- Uses Streamdown for markdown rendering with `isAnimating` prop
- Handles incomplete tags gracefully during streaming

**Key Files:**
- `components/streamdown/StreamdownRenderer.tsx`
- `app/streamdown/page.tsx`

## State Management

**Approach:** React Context API (lightweight, no external state library)

### ViewRawContext
- **Purpose:** Global state for "View Raw" debug toggle
- **Provider:** `ViewRawProvider` wraps entire app in `layout.tsx`
- **Consumer Hook:** `useViewRaw()` returns `{ viewRaw, setViewRaw }`
- **Scope:** Persists across route changes

### Local State (per page)
- `input`: Controlled input value for chat input
- `userHasScrolled`: Auto-scroll behavior tracking
- All managed via `useState` hooks in page components

### Chat State (AI SDK)
- `messages`: Managed by `useChat` hook from `@ai-sdk/react`
- `status`: Connection state (`'idle' | 'submitted' | 'streaming'`)
- `sendMessage`: Function to send new messages

## API Design

### POST /api/chat

**Endpoint:** `/api/chat?format={flowtoken|llm-ui|streamdown}`

**Request Body:**
```typescript
{
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content?: string;        // AI SDK v5
    parts?: { type: string; text?: string }[];  // AI SDK v6
  }>
}
```

**Response:** Server-Sent Events (SSE) via AI SDK `createUIMessageStreamResponse`

**Content Selection Logic:**
1. Extract last user message
2. Detect content preset via keyword matching (`detectPreset()`)
3. Return format-specific content from `CONTENT_BY_FORMAT_AND_PRESET`

**Supported Keywords:**
| Keywords | Preset | Content |
|----------|--------|---------|
| contact, email, phone | contact | ContactCard only |
| meeting, schedule, calendar | calendar | CalendarEvent only |
| everything | both | Both components |
| text, markdown, plain | text | Markdown only |
| multiple, several, many | multi | Multiple of each |

## Component Architecture

### Shared Components (9 total)

All shared components follow these patterns:
- TypeScript with strict typing
- Props interfaces defined in `types/index.ts`
- Tailwind CSS for styling via `cn()` utility
- Accessibility attributes (`role`, `aria-*`)
- Co-located tests (`*.test.tsx`)

### Renderer Components (3 total)

All renderers follow these patterns:
- Error boundary for graceful degradation
- `React.memo` for streaming performance
- `isStreaming` prop for animation control
- Fallback to raw text on parse errors

## Testing Strategy

**Framework:** Vitest + React Testing Library + jsdom

**Test Locations:** Co-located with source files

**Coverage Areas:**
- Component rendering and props
- User interactions (click, input)
- Accessibility attributes
- API request/response validation
- Content detection logic
- Mock stream behavior

**Running Tests:**
```bash
npm run test        # Single run
npm run test:watch  # Watch mode
```

## Performance Considerations

1. **React.memo** on renderer components prevents unnecessary re-renders
2. **useMemo** for expensive operations (message formatting, content parsing)
3. **useCallback** for event handlers to maintain referential equality
4. **Streaming throttling** in llm-ui via `lookBack` functions
5. **Auto-scroll optimization** with `userHasScrolled` state

## Error Handling

- **Parse Errors:** Error boundaries catch and display raw content fallback
- **API Errors:** Displayed in red alert box below chat
- **Validation Errors:** Descriptive error messages returned from API
- **Console Logging:** All errors logged with `[Implementation]` prefix

## Security

- No authentication required (demo app)
- No external API calls (mock data only)
- No user data persistence
- Environment variables not required
