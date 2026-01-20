# Story 2.1: llm-ui Implementation

Status: ready-for-dev

## Story

As an **evaluator**,
I want **the llm-ui streaming approach working on `/llm-ui`**,
so that **I can compare its delimiter-based block parsing with FlowToken**.

## Acceptance Criteria

1. **Given** I navigate to `/llm-ui` **When** I send a message requesting contact info **Then** the response streams with frame-rate throttling for smooth UX **And** when `【CONTACT:{...}】` delimiter is detected, ContactCard renders **And** the component receives parsed JSON props from within the delimiter **And** text before and after the delimiter renders as markdown

2. **Given** the message contains `【CALENDAR:{...}】` delimiter **When** rendered via llm-ui **Then** the CalendarEvent component appears with the same behavior

3. **Given** the LLM output has variable token speed **When** streaming via llm-ui **Then** the frame-rate throttling smooths out pauses for consistent UX

## Tasks / Subtasks

- [ ] Task 1: Create LLMUIRenderer component (AC: #1, #2, #3)
  - [ ] Create `components/llm-ui/LLMUIRenderer.tsx`
  - [ ] Implement `useLLMOutput` hook with proper block configuration
  - [ ] Create CONTACT block matcher for `【CONTACT:{...}】` delimiter
  - [ ] Create CALENDAR block matcher for `【CALENDAR:{...}】` delimiter
  - [ ] Create markdown fallback block for regular text
  - [ ] Parse JSON from delimiter content and pass to ContactCard/CalendarEvent
  - [ ] Implement error boundary with raw text fallback
  - [ ] Frame-rate throttling is automatic via useLLMOutput

- [ ] Task 2: Implement llm-ui page with chat functionality (AC: #1, #2, #3)
  - [ ] Replace placeholder `app/llm-ui/page.tsx` with full implementation
  - [ ] Use pattern from `app/flowtoken/page.tsx` as template
  - [ ] Configure useChat with `?format=llm-ui` query param
  - [ ] Integrate LLMUIRenderer for assistant messages
  - [ ] Implement auto-scroll with user scroll detection
  - [ ] Add error display and typing indicator

- [ ] Task 3: Create component tests (AC: #1, #2)
  - [ ] Create `components/llm-ui/LLMUIRenderer.test.tsx`
  - [ ] Test CONTACT delimiter parsing and ContactCard rendering
  - [ ] Test CALENDAR delimiter parsing and CalendarEvent rendering
  - [ ] Test mixed content (text + components)
  - [ ] Test incomplete/malformed delimiter handling (graceful fallback)
  - [ ] Test markdown rendering for plain text

- [ ] Task 4: Verify integration and run tests (AC: #1, #2, #3)
  - [ ] Run `npm run build` - no TypeScript errors
  - [ ] Run `npm run lint` - no ESLint warnings
  - [ ] Run `npm test` - all tests pass
  - [ ] Manual testing: verify streaming UX is smooth
  - [ ] Manual testing: verify components render correctly
  - [ ] Manual testing: verify navigation works from header tabs

## Dev Notes

### Critical Implementation Requirements

**llm-ui Library API (@llm-ui/react v0.13.3)**

The `useLLMOutput` hook is the core of llm-ui. It processes streamed LLM output and identifies blocks.

```typescript
import { useLLMOutput } from '@llm-ui/react';

const { blockMatches } = useLLMOutput({
  llmOutput: content,           // Current streamed content string
  blocks: [contactBlock, calendarBlock], // Block matchers (priority order)
  fallbackBlock: markdownBlock, // Default for non-matched text
  isStreamFinished: !isStreaming,
});
```

**Block Matcher Structure:**

Each block matcher needs:
- `component` - React component to render
- `findCompleteMatch(output)` - Find complete delimited block, return match info
- `findPartialMatch(output)` - Find incomplete block during streaming
- `lookBack(output)` - Extract visible text for user display

**Delimiter Format (from test-content.ts):**

```
【CONTACT:{"name":"John Smith","email":"john.smith@example.com","phone":"+1-555-123-4567"}】
【CALENDAR:{"title":"Meeting with John","date":"2026-01-25","startTime":"2:00 PM","endTime":"3:00 PM","location":"Conference Room A"}】
```

### LLMUIRenderer Implementation Pattern

```typescript
// components/llm-ui/LLMUIRenderer.tsx
'use client';

import { Component } from 'react';
import type { ReactElement, ReactNode, ErrorInfo } from 'react';

import { useLLMOutput } from '@llm-ui/react';
import ReactMarkdown from 'react-markdown';

import { ContactCard } from '@/components/shared/ContactCard';
import { CalendarEvent } from '@/components/shared/CalendarEvent';

import type { ContactCardProps, CalendarEventProps } from '@/types';

export interface LLMUIRendererProps {
  content: string;
  isStreaming?: boolean;
}

// Block matchers for delimiter detection
const START_DELIMITER = '【';
const END_DELIMITER = '】';

function parseBlockType(content: string): { type: string; data: unknown } | null {
  // Parse 【TYPE:{json}】 format
  const match = content.match(/^([A-Z]+):(.+)$/s);
  if (!match) return null;

  try {
    return {
      type: match[1],
      data: JSON.parse(match[2]),
    };
  } catch {
    return null;
  }
}

function createBlockMatcher(blockType: string, BlockComponent: React.ComponentType<unknown>) {
  const regex = new RegExp(`【${blockType}:(\\{[^】]+\\})】`, 'g');

  return {
    component: ({ blockMatch }: { blockMatch: { output: string } }) => {
      const innerMatch = blockMatch.output.match(/【[A-Z]+:(\{[^】]+\})】/);
      if (!innerMatch) return null;

      try {
        const props = JSON.parse(innerMatch[1]);
        return <BlockComponent {...props} />;
      } catch {
        return <span>{blockMatch.output}</span>;
      }
    },
    findCompleteMatch: (output: string) => {
      const match = output.match(new RegExp(`【${blockType}:\\{[^】]+\\}】`));
      if (match && match.index !== undefined) {
        return {
          startIndex: match.index,
          endIndex: match.index + match[0].length,
          output: match[0],
        };
      }
      return undefined;
    },
    findPartialMatch: (output: string) => {
      // Find incomplete delimiter at end of stream
      const partialStart = output.lastIndexOf(`【${blockType}:`);
      if (partialStart === -1) return undefined;

      const afterStart = output.slice(partialStart);
      if (!afterStart.includes('】')) {
        return {
          startIndex: partialStart,
          endIndex: output.length,
          output: afterStart,
        };
      }
      return undefined;
    },
    lookBack: () => ({ output: '', visibleText: '' }),
  };
}

// Create block matchers for each component type
const contactBlock = createBlockMatcher('CONTACT', ContactCard as React.ComponentType<unknown>);
const calendarBlock = createBlockMatcher('CALENDAR', CalendarEvent as React.ComponentType<unknown>);

// Markdown fallback block
const markdownBlock = {
  component: ({ blockMatch }: { blockMatch: { output: string } }) => (
    <ReactMarkdown>{blockMatch.output}</ReactMarkdown>
  ),
  findCompleteMatch: () => undefined,
  findPartialMatch: () => undefined,
  lookBack: (output: string) => ({ output, visibleText: output }),
};

// Error boundary for graceful degradation
class LLMUIErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: ReactNode; children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('[llm-ui] Render error:', error, errorInfo);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function LLMUIRenderer({
  content,
  isStreaming = false,
}: LLMUIRendererProps): ReactElement {
  const { blockMatches } = useLLMOutput({
    llmOutput: content,
    blocks: [contactBlock, calendarBlock],
    fallbackBlock: markdownBlock,
    isStreamFinished: !isStreaming,
  });

  return (
    <LLMUIErrorBoundary
      fallback={<pre className="whitespace-pre-wrap text-sm text-gray-600">{content}</pre>}
    >
      <div className="llm-ui-output">
        {blockMatches.map((match, index) => {
          const Component = match.block.component;
          return <Component key={index} blockMatch={match} />;
        })}
      </div>
    </LLMUIErrorBoundary>
  );
}
```

**Note:** The above is a starting pattern. The actual llm-ui API may require adjustments based on testing. Consult https://llm-ui.com/docs/llm-output-hook for authoritative documentation.

### Page Implementation Pattern

Follow `app/flowtoken/page.tsx` exactly, replacing:
- Import: `LLMUIRenderer` instead of `FlowTokenRenderer`
- Transport API: `'/api/chat?format=llm-ui'`
- Renderer usage: `<LLMUIRenderer content={m.content} isStreaming={m.isStreaming} />`

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
| Mock stream | `lib/mock-stream.ts` | Already handles llm-ui format |
| Test content | `lib/test-content.ts` | LLM_UI_CONTENT already defined |

### Dependencies Required

```typescript
// Already installed, just import:
import { useLLMOutput } from '@llm-ui/react';
import ReactMarkdown from 'react-markdown'; // May need to install: npm i react-markdown
```

Check if react-markdown is installed:
```bash
npm list react-markdown || npm i react-markdown
```

### File Structure

```
components/
└── llm-ui/
    ├── LLMUIRenderer.tsx      # NEW: Block renderer using useLLMOutput
    └── LLMUIRenderer.test.tsx # NEW: Component tests

app/
└── llm-ui/
    └── page.tsx               # MODIFY: Replace placeholder with full implementation
```

### Anti-Patterns to Avoid

- **DO NOT** create new ContactCard/CalendarEvent components - use shared ones
- **DO NOT** use useState for messages - useChat manages all message state
- **DO NOT** use default exports for components - named exports only
- **DO NOT** block on incomplete stream content - handle gracefully
- **DO NOT** forget `'use client'` directive when using hooks
- **DO NOT** use string concatenation for Tailwind classes - use `cn()`

### Import Order Standard (MUST FOLLOW)

```typescript
// 1. 'use client' directive
'use client';

// 2. React/Next.js imports
import { useState, useCallback, useMemo } from 'react';
import type { ReactElement, FormEvent, ChangeEvent } from 'react';

// 3. Third-party libraries
import { useChat } from '@ai-sdk/react';
import { useLLMOutput } from '@llm-ui/react';
import ReactMarkdown from 'react-markdown';

// 4. Internal components
import { ContactCard } from '@/components/shared/ContactCard';
import { Header } from '@/components/shared/Header';

// 5. Utilities
import { cn } from '@/lib/utils';

// 6. Types
import type { ContactCardProps } from '@/types';
```

### Previous Story Learnings (Story 1.5, 1.6)

**From FlowToken Implementation (1.5):**
- Error boundary pattern works well for graceful fallback
- `isStreaming` prop needed for animation control
- FlowToken lowercases tag names - llm-ui uses block matchers instead
- Message filtering: use `.filter()` for user/assistant roles only
- Text extraction: use `parts` array to get text content

**From Header Navigation (1.6):**
- Header auto-detects route via `usePathname()` - no props needed
- All routes must include Header component for consistent navigation
- Tab navigation is instant (client-side Link)

### Git Intelligence

Recent commit patterns:
- `728679a` - Header with accessibility, responsive design
- `59f1955` - FlowToken with error handling
- Pattern: Component + tests + build verification + code review

### Testing Strategy

**Unit Tests (LLMUIRenderer):**
- Test CONTACT delimiter parsing → ContactCard rendered with props
- Test CALENDAR delimiter parsing → CalendarEvent rendered with props
- Test mixed content: "text 【CONTACT:{...}】 more text"
- Test malformed JSON → graceful fallback to raw text
- Test incomplete delimiter during streaming → wait gracefully

**Integration Tests (page):**
- Test message submission and streaming response
- Test auto-scroll behavior
- Test error display

### Performance Considerations

1. **Frame-rate throttling:** Built into `useLLMOutput` - no extra work needed
2. **Memoization:** `useMemo` for transport and formattedMessages (see flowtoken/page.tsx)
3. **Minimal re-renders:** blockMatches only update when content changes
4. **Error isolation:** Error boundary prevents cascade failures

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.1: llm-ui Implementation]
- [Source: _bmad-output/planning-artifacts/architecture.md#LLM Output Formats by Route]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/project-context.md#Streaming UI Rules]
- [Source: lib/test-content.ts#LLM_UI_CONTENT - delimiter format]
- [Source: components/flowtoken/FlowTokenRenderer.tsx - error boundary pattern]
- [Source: app/flowtoken/page.tsx - useChat integration pattern]
- [Docs: https://llm-ui.com/docs/llm-output-hook]
- [Docs: https://llm-ui.com/docs/custom-blocks]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

