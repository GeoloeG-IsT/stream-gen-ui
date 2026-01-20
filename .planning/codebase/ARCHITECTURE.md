# Architecture

**Analysis Date:** 2026-01-20

## Pattern Overview

**Overall:** Next.js App Router with streaming UI comparison framework. Multi-page demo application comparing three streaming implementations (FlowToken, llm-ui, Streamdown) with shared components and centralized API handling.

**Key Characteristics:**
- Three independent page implementations at `/flowtoken`, `/llm-ui`, `/streamdown` that share common UI layer
- Streaming-first design using AI SDK v6 `useChat` hook with custom transport layer
- Format-aware content generation based on URL query parameters
- Error boundaries for graceful degradation of custom component rendering
- Global context for cross-cutting state (ViewRaw toggle)

## Layers

**Page Layer (Routes):**
- Purpose: UI entry points that orchestrate chat and rendering for each streaming implementation
- Location: `app/flowtoken/page.tsx`, `app/llm-ui/page.tsx`, `app/streamdown/page.tsx`
- Contains: React page components with state management, message formatting, scroll behavior
- Depends on: `@ai-sdk/react` useChat hook, shared components, renderer components
- Used by: Next.js routing system, browser entry points

**API Layer:**
- Purpose: Server-side request handling and mock stream generation
- Location: `app/api/chat/route.ts`
- Contains: POST handler, request validation, format-aware content selection, mock streaming with delays
- Depends on: `ai` SDK for stream creation, content generation library, types
- Used by: Page components via DefaultChatTransport

**Renderer Layer:**
- Purpose: Format-specific parsing and component rendering
- Location: `components/flowtoken/FlowTokenRenderer.tsx`, `components/llm-ui/LLMUIRenderer.tsx`, `components/streamdown/StreamdownRenderer.tsx`
- Contains: Format-specific parsers (XML for FlowToken/Streamdown, delimiter-based for llm-ui), error boundaries, custom component registration
- Depends on: Format libraries (flowtoken, @llm-ui/react, streamdown), shared UI components
- Used by: Page components to render assistant messages

**Shared Component Layer:**
- Purpose: UI components used across all implementations
- Location: `components/shared/`
- Contains: MessageBubble, ChatInput, Header, TypingIndicator, MessageList, RawOutputView, custom components (ContactCard, CalendarEvent, PresetSelector)
- Depends on: React, Tailwind CSS, context providers, types
- Used by: All page components

**Context/State Layer:**
- Purpose: Global state management for features affecting multiple pages
- Location: `contexts/ViewRawContext.tsx`
- Contains: React Context provider for ViewRaw toggle state
- Depends on: React hooks (createContext, useState, useContext)
- Used by: Layout (provider), MessageBubble, Header

**Utility/Library Layer:**
- Purpose: Shared logic and data
- Location: `lib/` (test-content.ts, mock-stream.ts, utils.ts)
- Contains: Content preset detection, mock stream delays, utility functions (cn for classname merging)
- Depends on: Types, basic utilities
- Used by: API route, components

## Data Flow

**Chat Stream Flow:**

1. User types message in ChatInput component → state updates in page component
2. User submits form → `handleSubmit` calls `sendMessage()` from useChat hook
3. Message sent to `/api/chat?format=[format]` via DefaultChatTransport
4. API route validates request, extracts last user message
5. Content selection: `detectPreset()` analyzes message content → selects content template
6. Content generation: `getTestContent()` returns format-specific content (FlowToken XML, llm-ui delimiters, Streamdown XML)
7. Mock stream creation: Content split into tokens, wrapped in createUIMessageStream
8. Stream delays applied (initial 500ms, then 50ms per token)
9. Stream response sent back to client as SSE
10. Page component receives streamed message parts via useChat hook
11. Message formatting: Parts extracted and combined into format-specific string
12. isStreaming flag set for last assistant message
13. Renderer component parses format-specific markup and renders custom components
14. MessageBubble wraps renderer with user/assistant styling
15. RawOutputView optionally shown when ViewRaw toggle is ON

**State Management:**
- Local state per page (input, messages, scroll position)
- Transport layer manages chat state (messages, status, error)
- Global ViewRaw context affects all MessageBubble rendering

## Key Abstractions

**Message Format (Type System):**
- Purpose: Isolate format differences and enable runtime validation
- Examples: `types/index.ts` defines MessageFormat type and MESSAGE_FORMATS array
- Pattern: Union type + const array + type guard function for compile-time and runtime safety

**Renderer Components (Strategy Pattern):**
- Purpose: Encapsulate format-specific parsing logic while maintaining consistent interface
- Examples: FlowTokenRenderer, LLMUIRenderer, StreamdownRenderer all accept `{ content, isStreaming }`
- Pattern: Error boundaries + format-specific parsing + shared component rendering

**Content Presets (Template Pattern):**
- Purpose: Generate consistent, category-based content across formats
- Examples: `lib/test-content.ts` maintains separate content maps for each format (FLOWTOKEN_PRESETS, LLM_UI_PRESETS)
- Pattern: Keyword detection → preset selection → format lookup

**Error Boundaries (Resilience Pattern):**
- Purpose: Graceful fallback when custom component parsing fails
- Examples: FlowTokenErrorBoundary, LLMUIErrorBoundary, StreamdownErrorBoundary
- Pattern: Class component error boundary → log error → render fallback (raw text)

## Entry Points

**Root Entry Point:**
- Location: `app/page.tsx`
- Triggers: Initial navigation to `/`
- Responsibilities: Redirects to default implementation (`/flowtoken`)

**Page Entries (User Visible):**
- Location: `app/flowtoken/page.tsx`, `app/llm-ui/page.tsx`, `app/streamdown/page.tsx`
- Triggers: Direct URL navigation or Header link clicks
- Responsibilities: Initialize useChat hook with format-specific transport, manage local state, coordinate message rendering

**API Entry:**
- Location: `app/api/chat/route.ts`
- Triggers: POST requests from page components
- Responsibilities: Validate input, select content based on last user message, generate mock stream

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: Every page load
- Responsibilities: Provide global ViewRawContext provider, set up fonts and metadata, compose child pages

## Error Handling

**Strategy:** Error boundaries at renderer level with fallback to raw text, console logging, and user-facing error messages

**Patterns:**

- Renderer parse errors: Class component error boundaries catch React errors and render `<pre>` fallback with raw content
- API validation errors: 400 status with descriptive error messages (field-specific hints)
- Chat hook errors: `onError` callbacks log to console, error displayed in UI error alert
- Missing required fields: Component silently skips rendering or logs warning (e.g., ContactCard without name)
- Invalid message format: Defaults to 'flowtoken' format

## Cross-Cutting Concerns

**Logging:**
- Pattern: Console logging with component name prefix (e.g., `console.error('[FlowToken] Parse error')`)
- When: Errors during rendering, API issues, chat hook errors
- Tools: Native console (dev environment), could integrate monitoring service

**Validation:**
- Request validation: Type guards + explicit field checks in API route
- Runtime format validation: `isValidMessageFormat()` type guard
- Component prop validation: TypeScript types (strict mode enabled)
- Content validation: Preset detection via keyword matching

**Authentication:**
- Not currently implemented (demo/PoC state)
- No auth layer, API endpoints publicly accessible

**Performance:**
- Memoization: LLMUIRenderer and StreamdownRenderer wrapped with React.memo()
- Message transformation: useMemo() for message formatting on both page and renderer
- Content parsing: useMemo() for segment parsing in StreamdownRenderer
- Scroll: Manual scroll management to avoid expensive auto-scroll on every change

**Accessibility:**
- Semantic HTML: role attributes (log, article, alert, switch, region)
- ARIA labels: aria-label for chat containers, toggle, navigation
- Live regions: aria-live="polite" on message container for screen reader updates
- Keyboard support: Focus visible rings, min touch targets (44px)
- Color contrast: Tailwind classes ensure WCAG compliance

**Styling:**
- Framework: Tailwind CSS with PostCSS v4
- Utilities: clsx and tailwind-merge imported but not systematically used; `cn()` utility in `lib/utils.ts` wraps merge for consistency
- Theme: Dark blue header (#1E3A5F), light grays, blue accents
