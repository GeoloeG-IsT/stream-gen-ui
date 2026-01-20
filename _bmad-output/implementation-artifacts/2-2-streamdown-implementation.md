# Story 2.2: Streamdown Implementation

Status: done

## Story

As an **evaluator**,
I want **the Streamdown + custom parser approach working on `/streamdown`**,
so that **I can compare the most flexible implementation option**.

## Acceptance Criteria

1. **Given** I navigate to `/streamdown` **When** I send a message requesting contact info **Then** the response streams using Streamdown's streaming-optimized markdown **And** when `<ContactCard>` XML tag is detected, the custom parser extracts it **And** the ContactCard component renders with parsed props **And** remaining markdown content renders via Streamdown

2. **Given** incomplete XML tags are streaming **When** the parser encounters partial markup like `<ContactCard name="` **Then** it waits gracefully without breaking the UI **And** displays the component when the tag is complete

## Tasks / Subtasks

- [x] Task 1: Create StreamdownRenderer component (AC: #1, #2)
  - [x] Create `components/streamdown/StreamdownRenderer.tsx`
  - [x] Import and use `Streamdown` component from `streamdown` package
  - [x] Use `components` prop to map lowercase custom tags to React components
  - [x] Map `contactcard` -> `ContactCard` and `calendarevent` -> `CalendarEvent`
  - [x] Set `isAnimating` prop based on streaming state
  - [x] Add error boundary for graceful degradation on parse errors
  - [x] Wrap in React.memo per project context requirements

- [x] Task 2: Implement Streamdown page with chat functionality (AC: #1, #2)
  - [x] Replace placeholder `app/streamdown/page.tsx` with full implementation
  - [x] Use exact pattern from `app/flowtoken/page.tsx` as template
  - [x] Configure useChat with `?format=streamdown` query param
  - [x] Integrate StreamdownRenderer for assistant messages
  - [x] Implement auto-scroll with user scroll detection
  - [x] Add error display and typing indicator

- [x] Task 3: Create component tests (AC: #1, #2)
  - [x] Create `components/streamdown/StreamdownRenderer.test.tsx`
  - [x] Test custom tag parsing and ContactCard rendering
  - [x] Test custom tag parsing and CalendarEvent rendering
  - [x] Test mixed content (text + components)
  - [x] Test incomplete tag handling (graceful wait)
  - [x] Test markdown rendering for plain text
  - [x] Test error boundary fallback behavior
  - [x] Test React.memo memoization
  - [x] Test accessibility attributes

- [x] Task 4: Verify integration and run tests (AC: #1, #2)
  - [x] Run `npm run build` - no TypeScript errors
  - [x] Run `npm run lint` - no ESLint warnings
  - [x] Run `npm test` - all tests pass
  - [ ] Manual testing: verify streaming UX is smooth *(requires human verification)*
  - [ ] Manual testing: verify components render correctly *(requires human verification)*
  - [ ] Manual testing: verify navigation works from header tabs *(requires human verification)*

## Dev Notes

### Critical Implementation Requirements

**Streamdown Library API (streamdown v2.1.0)**

Streamdown is a drop-in replacement for react-markdown, optimized for AI streaming. Key API:

```typescript
import { Streamdown } from 'streamdown';

interface StreamdownProps {
  children?: string;              // Markdown content to render
  components?: Components;        // Custom component mapping
  isAnimating?: boolean;          // Streaming state (shows caret, handles incomplete blocks)
  mode?: 'static' | 'streaming';  // Render mode (optional, inferred from isAnimating)
  plugins?: PluginConfig;         // Optional plugins (code, mermaid, math, cjk)
  className?: string;             // Container class
  // ...other react-markdown compatible props
}
```

**Custom Components Mapping:**

The `components` prop uses lowercase HTML element names as keys. Since our XML uses `<contactcard>` and `<calendarevent>` (HTML5 custom elements are lowercase), the mapping is straightforward:

```typescript
components={{
  contactcard: ContactCard,
  calendarevent: CalendarEvent,
}}
```

**CRITICAL:** HTML5 custom elements (like `<contactcard>`) get lowercase tag names in the DOM. Streamdown passes attributes as props, so ensure components receive props correctly.

### StreamdownRenderer Implementation Pattern

```typescript
// components/streamdown/StreamdownRenderer.tsx
'use client';

import { Component, memo } from 'react';
import type { ReactElement, ReactNode, ErrorInfo } from 'react';

import { Streamdown } from 'streamdown';

import { CalendarEvent } from '@/components/shared/CalendarEvent';
import { ContactCard } from '@/components/shared/ContactCard';

export interface StreamdownRendererProps {
  content: string;
  isStreaming?: boolean;
}

/**
 * Error boundary for graceful degradation when Streamdown parsing fails.
 * Per project context: "Fallback to raw text on parse errors"
 */
interface ErrorBoundaryState {
  hasError: boolean;
}

interface ErrorBoundaryProps {
  fallback: ReactNode;
  children: ReactNode;
}

class StreamdownErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[Streamdown] Render error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

/**
 * StreamdownRenderer component using Streamdown for streaming markdown with custom components.
 *
 * Parses content containing XML-style custom elements (<contactcard>, <calendarevent>)
 * and renders corresponding React components. Optimized for AI streaming.
 */
function StreamdownRendererInner({
  content,
  isStreaming = false,
}: StreamdownRendererProps): ReactElement {
  return (
    <StreamdownErrorBoundary
      key={content.length}
      fallback={<pre className="whitespace-pre-wrap text-sm text-gray-600">{content}</pre>}
    >
      <div className="streamdown-output" role="region" aria-label="Streamdown generated content">
        <Streamdown
          isAnimating={isStreaming}
          components={{
            // Map lowercase custom elements to React components
            // HTML5 custom elements are case-insensitive and normalized to lowercase
            contactcard: ContactCard,
            calendarevent: CalendarEvent,
          }}
        >
          {content}
        </Streamdown>
      </div>
    </StreamdownErrorBoundary>
  );
}

/**
 * Memoized StreamdownRenderer for performance during streaming.
 * Per project context: "React.memo on streaming message blocks"
 */
export const StreamdownRenderer = memo(StreamdownRendererInner);
```

### Content Format (from test-content.ts)

Streamdown uses the same XML format as FlowToken:

```
Here's the contact information you requested:

<contactcard name="John Smith" email="john.smith@example.com" phone="+1-555-123-4567"></contactcard>

I found John's details in our database. He's a senior developer based in San Francisco.

<calendarevent title="Meeting with John" date="2026-01-25" startTime="2:00 PM" endTime="3:00 PM" location="Conference Room A"></calendarevent>

Let me know if you'd like to adjust the time.
```

**Note:** HTML5 custom elements require explicit closing tags (`</contactcard>`), not self-closing (`<contactcard />`). The test content already uses this format.

### Page Implementation Pattern

Follow `app/flowtoken/page.tsx` exactly, replacing:
- Import: `StreamdownRenderer` instead of `FlowTokenRenderer`
- Transport API: `'/api/chat?format=streamdown'`
- Renderer usage: `<StreamdownRenderer content={m.content} isStreaming={m.isStreaming} />`

### Existing Code to Reuse (DO NOT RECREATE)

| Component | Location | Purpose |
|-----------|----------|---------|
| `ContactCard` | `components/shared/ContactCard.tsx` | Contact display component |
| `CalendarEvent` | `components/shared/CalendarEvent.tsx` | Calendar event component |
| `MessageBubble` | `components/shared/MessageBubble.tsx` | Message container |
| `ChatInput` | `components/shared/ChatInput.tsx` | Input with submit |
| `Header` | `components/shared/Header.tsx` | Navigation tabs |
| `TypingIndicator` | `components/shared/TypingIndicator.tsx` | Loading indicator |
| `cn()` | `lib/utils.ts` | Class name utility |
| Mock stream | `lib/mock-stream.ts` | Already handles streamdown format |
| Test content | `lib/test-content.ts` | STREAMDOWN_CONTENT = FLOWTOKEN_CONTENT |

### Dependencies

```typescript
// Already installed (streamdown v2.1.0), just import:
import { Streamdown } from 'streamdown';
```

No additional packages needed - streamdown is already installed.

### File Structure

```
components/
└── streamdown/
    ├── StreamdownRenderer.tsx      # NEW: Streamdown renderer with custom components
    └── StreamdownRenderer.test.tsx # NEW: Component tests

app/
└── streamdown/
    └── page.tsx                    # MODIFY: Replace placeholder with full implementation
```

### Project Structure Notes

- **Alignment:** Follows `components/{impl}/` pattern established in architecture
- **Shared components:** Use from `components/shared/` - DO NOT duplicate
- **Test co-location:** Tests go in same directory as component

### Anti-Patterns to Avoid

- **DO NOT** create new ContactCard/CalendarEvent components - use shared ones
- **DO NOT** use useState for messages - useChat manages all message state
- **DO NOT** use default exports for components - named exports only
- **DO NOT** block on incomplete stream content - Streamdown handles gracefully via `isAnimating`
- **DO NOT** forget `'use client'` directive when using hooks
- **DO NOT** use string concatenation for Tailwind classes - use `cn()`
- **DO NOT** forget React.memo wrapper per project context requirements
- **DO NOT** forget accessibility attributes (role, aria-label)

### Import Order Standard (MUST FOLLOW)

```typescript
// 1. 'use client' directive
'use client';

// 2. React/Next.js imports
import { useState, useCallback, useMemo } from 'react';
import type { ReactElement, FormEvent, ChangeEvent } from 'react';

// 3. Third-party libraries
import { useChat } from '@ai-sdk/react';
import { Streamdown } from 'streamdown';

// 4. Internal components
import { ContactCard } from '@/components/shared/ContactCard';
import { Header } from '@/components/shared/Header';

// 5. Utilities
import { cn } from '@/lib/utils';

// 6. Types
import type { ContactCardProps } from '@/types';
```

### Previous Story Learnings (Story 2.1)

**From llm-ui Implementation (2.1):**
- Error boundary pattern with `key={content.length}` for reset on content change
- React.memo wrapper required per project context
- Accessibility: `role="region"` and `aria-label` on output container
- Stable keys prevent React reconciliation issues
- useLLMOutput vs Streamdown: Streamdown is simpler - just use `components` prop
- Manual testing tasks should NOT be marked complete by AI

**From FlowToken Implementation (1.5):**
- FlowToken's `customComponents` prop is similar to Streamdown's `components` prop
- Both use lowercase tag names as keys
- Error boundary fallback to raw pre text works well
- `isStreaming` prop controls animation behavior

### Git Intelligence

Recent commit patterns from 2-1 implementation:
- `f815339` - Complete implementation with streaming support, error handling, tests
- Pattern: Component + tests + build verification + code review
- Review process added: React.memo, stable keys, accessibility, key prop for error boundary reset

### Testing Strategy

**Unit Tests (StreamdownRenderer):**
- Test `<contactcard>` tag parsing -> ContactCard rendered with correct props
- Test `<calendarevent>` tag parsing -> CalendarEvent rendered with correct props
- Test mixed content: "text `<contactcard>...</contactcard>` more text"
- Test incomplete tag during streaming -> graceful wait (no crash)
- Test markdown rendering (headers, lists, bold, etc.)
- Test error boundary fallback on Streamdown errors
- Test React.memo memoization (component should not re-render unnecessarily)
- Test accessibility attributes present

**Integration Tests (page):**
- Test message submission and streaming response
- Test auto-scroll behavior
- Test error display

### Differences from FlowToken and llm-ui

| Aspect | FlowToken | llm-ui | Streamdown |
|--------|-----------|--------|------------|
| Library | `flowtoken` | `@llm-ui/react` | `streamdown` |
| Component | `AnimatedMarkdown` | `useLLMOutput` hook | `Streamdown` |
| Custom mapping | `customComponents` prop | Block matchers | `components` prop |
| Content format | XML tags (lowercase) | Delimiters `【...】` | XML tags (lowercase) |
| Streaming control | `animation` prop | `isStreamFinished` | `isAnimating` prop |
| Complexity | Low | Medium | Low |

**Key Streamdown Advantages:**
- Drop-in react-markdown replacement (familiar API)
- Built-in streaming optimizations (handles incomplete blocks)
- Simpler than llm-ui (no block matcher setup)
- Same content format as FlowToken (easier testing)

### Performance Considerations

1. **Streaming optimization:** Built into Streamdown - handles incomplete markdown gracefully
2. **Memoization:** Wrap in React.memo per project context
3. **Error isolation:** Error boundary prevents cascade failures
4. **No additional plugins needed:** Basic streaming works out of the box

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.2: Streamdown Implementation]
- [Source: _bmad-output/planning-artifacts/architecture.md#LLM Output Formats by Route]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/project-context.md#Streaming UI Rules]
- [Source: lib/test-content.ts#STREAMDOWN_CONTENT]
- [Source: components/flowtoken/FlowTokenRenderer.tsx - error boundary pattern]
- [Source: components/llm-ui/LLMUIRenderer.tsx - React.memo, accessibility patterns]
- [Source: app/flowtoken/page.tsx - useChat integration pattern]
- [Docs: https://streamdown.ai/]
- [Docs: https://github.com/vercel/streamdown]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None - implementation completed without issues.

### Completion Notes List

- Created `StreamdownRenderer` component with error boundary and React.memo wrapper
- **IMPORTANT FIX**: Streamdown (like react-markdown) only supports standard HTML elements in its `components` prop - it does NOT parse custom XML elements like `<contactcard>`
- Implemented custom parser (`parseContent`) to extract XML-style custom elements before passing to Streamdown
- Parser splits content into segments: markdown text (rendered via Streamdown) and custom components (rendered directly)
- Incomplete tags during streaming remain in markdown until complete (graceful handling)
- Page implementation follows exact pattern from FlowToken page with StreamdownRenderer integration
- All 19 tests pass covering: tag parsing, mixed content, incomplete tags, streaming state, error boundary, accessibility, memoization
- Full test suite of 179 tests passes with no regressions
- Build and lint pass without errors

### File List

**New Files:**
- `components/streamdown/StreamdownRenderer.tsx` - Streamdown renderer with error boundary and React.memo
- `components/streamdown/StreamdownRenderer.test.tsx` - 19 unit tests for component

**Modified Files:**
- `app/streamdown/page.tsx` - Replaced placeholder with full chat implementation

## Senior Developer Review (AI)

**Reviewer:** Claude Opus 4.5 (Adversarial Review)
**Date:** 2026-01-20

### Review Summary
- **Issues Found:** 1 HIGH, 3 MEDIUM, 2 LOW
- **Issues Fixed:** 1 HIGH, 3 MEDIUM
- **Outcome:** APPROVED

### Issues Fixed

1. **HIGH - Unsafe Type Casting** (StreamdownRenderer.tsx:111, 116)
   - Added `toContactCardProps()` and `toCalendarEventProps()` validation functions
   - Now validates required fields before rendering components
   - Logs warnings for malformed XML with missing required attributes

2. **MEDIUM - Test Mock Duplicated Component Logic** (StreamdownRenderer.test.tsx:7-72)
   - Simplified mock from 66 lines to 16 lines
   - Removed redundant XML parsing in mock (component pre-parses before Streamdown)
   - Added clarifying comment about test architecture

3. **MEDIUM - Attribute Parsing Edge Cases** (StreamdownRenderer.tsx:65-73)
   - Added documentation of parsing limitations (escaped quotes, single quotes)

4. **MEDIUM - Regex Pattern Limitations** (StreamdownRenderer.tsx:90)
   - Documented that tags must be empty (no content between opening/closing)

### Issues Not Addressed (LOW)

1. **Inconsistent error boundary key pattern** - FlowTokenRenderer difference is pre-existing
2. **Misleading comments** - Already removed/clarified in fixes above

### Verification

- ✅ Build passes (no TypeScript errors)
- ✅ Lint passes (no ESLint warnings)
- ✅ All 179 tests pass (19 Streamdown-specific)
- ✅ AC #1 verified: Streamdown streaming with ContactCard/CalendarEvent components
- ✅ AC #2 verified: Graceful handling of incomplete XML during streaming

## Change Log

- 2026-01-20: Code review fixes - type validation, test simplification, documentation (Review)
- 2026-01-20: Implemented Streamdown streaming UI with custom component parsing (AC #1, #2)
