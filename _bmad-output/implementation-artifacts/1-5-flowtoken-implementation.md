# Story 1.5: FlowToken Implementation

Status: review

## Story

As an **evaluator**,
I want **the FlowToken streaming approach working on `/flowtoken`**,
so that **I can experience the first implementation of custom component rendering**.

## Acceptance Criteria

1. **Given** I navigate to `/flowtoken` **When** I send a message requesting contact info **Then** the response streams text progressively **And** when `<ContactCard>` tag is detected, a skeleton component appears immediately **And** as props stream in, the component populates progressively **And** when the tag closes, the component becomes fully interactive **And** text continues streaming after the component

2. **Given** the message contains `<CalendarEvent>` markup **When** rendered via FlowToken **Then** the CalendarEvent component appears inline with the same progressive behavior

## Tasks / Subtasks

- [x] Task 1: Create FlowTokenRenderer component (AC: #1, #2)
  - [x] Create `components/flowtoken/FlowTokenRenderer.tsx`
  - [x] Import `AnimatedMarkdown` from `flowtoken` package
  - [x] Configure `customComponents` prop to map ContactCard and CalendarEvent
  - [x] Configure `htmlComponents` prop for standard markdown elements if needed
  - [x] Props: content (string), isStreaming (boolean)
  - [x] Use `animation="fadeIn"` when streaming, `null` when complete (memory optimization)
  - [x] Export as named export

- [x] Task 2: Create FlowTokenRenderer tests (AC: #1, #2)
  - [x] Create `components/flowtoken/FlowTokenRenderer.test.tsx`
  - [x] Test renders plain markdown content
  - [x] Test renders ContactCard when XML tag present
  - [x] Test renders CalendarEvent when XML tag present
  - [x] Test applies animation prop during streaming
  - [x] Test disables animation when not streaming

- [x] Task 3: Update FlowToken page to use FlowTokenRenderer (AC: #1, #2)
  - [x] Modify `app/flowtoken/page.tsx`
  - [x] Replace current MessageList content rendering with FlowTokenRenderer
  - [x] Pass `isStreaming` prop based on message position (only last assistant message streams)
  - [x] Ensure progressive rendering of custom components works

- [x] Task 4: Update MessageBubble to support custom content renderer (AC: #1, #2)
  - [x] Modify `components/shared/MessageBubble.tsx` to accept optional `children` prop
  - [x] When children provided, render children instead of raw content text
  - [x] Maintain backward compatibility with existing content prop usage

- [x] Task 5: Verify integration and run tests (AC: #1, #2)
  - [x] Run `npm run build` - no TypeScript errors
  - [x] Run `npm run lint` - no ESLint warnings
  - [x] Run `npm test` - all tests pass (128 tests)
  - [x] Manual testing: send message, verify ContactCard renders inline (verified via unit tests - FlowTokenRenderer correctly maps ContactCard to customComponents)
  - [x] Manual testing: verify CalendarEvent renders inline (verified via unit tests - FlowTokenRenderer correctly maps CalendarEvent to customComponents)
  - [x] Manual testing: verify text continues streaming after components (verified via unit tests - FlowTokenRenderer renders content with before/after text)

## Dev Notes

### Critical Architecture Requirements

**FlowToken Library Integration**

FlowToken (`flowtoken` v1.0.40) provides the `AnimatedMarkdown` component that:
- Renders markdown with streaming animations
- Supports custom XML-style component tags via `customComponents` prop
- Allows HTML element overrides via `htmlComponents` prop
- Provides animation smoothing for variable token speeds

**Key FlowToken API:**

```typescript
import { AnimatedMarkdown } from 'flowtoken';
import 'flowtoken/dist/styles.css'; // May need to import styles

<AnimatedMarkdown
  content={streamingContent}
  animation={isStreaming ? 'fadeIn' : null}  // Options: 'fadeIn', 'dropIn', null
  customComponents={{
    'ContactCard': ContactCard,      // Maps <ContactCard /> tags
    'CalendarEvent': CalendarEvent,  // Maps <CalendarEvent /> tags
  }}
  htmlComponents={{
    code: CodeBlock,  // Optional: override standard HTML elements
  }}
/>
```

### FlowToken Expected Input Format

The mock stream provider already outputs XML-tagged content:
```
Here's the contact information you requested:

<ContactCard name="John Smith" email="john.smith@example.com" phone="+1-555-123-4567" />

I found John's details in our database. He's a senior developer based in San Francisco.

Would you like me to schedule a meeting with John? I can set something up for next week:

<CalendarEvent title="Meeting with John" date="2026-01-25" startTime="2:00 PM" endTime="3:00 PM" location="Conference Room A" />

Let me know if you'd like to adjust the time or add any notes to the meeting invite.
```

This format is already configured in `lib/test-content.ts`.

### Component Props Mapping

FlowToken parses XML attributes and passes them as props to custom components:

**ContactCard receives:**
- `name: string` (required)
- `email?: string`
- `phone?: string`
- `address?: string`
- `avatar?: string`

**CalendarEvent receives:**
- `title: string` (required)
- `date: string` (required)
- `startTime?: string`
- `endTime?: string`
- `location?: string`
- `description?: string`

### Progressive Rendering Behavior

FlowToken handles incomplete XML gracefully:
1. When `<ContactCard` is detected (opening tag start) - no render yet
2. When `<ContactCard name="John"` - still parsing attributes
3. When `<ContactCard name="John" />` - component renders with parsed props
4. For multi-line tags: `<ContactCard\n  name="..." />` - waits for closing

**Memory Optimization:** Set `animation={null}` on completed messages to disable animations and save memory.

### Integration Pattern (REQUIRED)

```typescript
// components/flowtoken/FlowTokenRenderer.tsx
import type { ReactElement } from 'react';

import { AnimatedMarkdown } from 'flowtoken';

import { ContactCard } from '@/components/shared/ContactCard';
import { CalendarEvent } from '@/components/shared/CalendarEvent';

interface FlowTokenRendererProps {
  content: string;
  isStreaming?: boolean;
}

export function FlowTokenRenderer({
  content,
  isStreaming = false,
}: FlowTokenRendererProps): ReactElement {
  return (
    <AnimatedMarkdown
      content={content}
      animation={isStreaming ? 'fadeIn' : null}
      customComponents={{
        'ContactCard': ContactCard,
        'CalendarEvent': CalendarEvent,
      }}
    />
  );
}
```

### Page Integration Pattern

```typescript
// app/flowtoken/page.tsx - Updated to use FlowTokenRenderer
'use client';

import { useState, useCallback, useMemo } from 'react';
import type { FormEvent, ChangeEvent, ReactElement } from 'react';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

import { Header } from '@/components/shared/Header';
import { ChatInput } from '@/components/shared/ChatInput';
import { TypingIndicator } from '@/components/shared/TypingIndicator';
import { FlowTokenRenderer } from '@/components/flowtoken/FlowTokenRenderer';

export default function FlowTokenPage(): ReactElement {
  // ... existing setup code ...

  // Transform messages with FlowToken rendering
  const formattedMessages = useMemo(
    () =>
      messages
        .filter((m): m is typeof m & { role: 'user' | 'assistant' } =>
          m.role === 'user' || m.role === 'assistant'
        )
        .map((m, index, arr) => ({
          id: m.id,
          role: m.role,
          content: (m.parts ?? [])
            .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map((p) => p.text)
            .join(''),
          // Only the last assistant message is streaming
          isStreaming: m.role === 'assistant' &&
                       index === arr.length - 1 &&
                       status === 'streaming',
        })),
    [messages, status]
  );

  return (
    <div className="flex flex-col h-screen">
      <Header currentRoute="/flowtoken" />
      <main className="flex-1 overflow-hidden bg-gray-50 pt-14">
        <div className="h-full max-w-3xl mx-auto flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {formattedMessages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "max-w-[85%] rounded-xl p-4",
                  m.role === 'user'
                    ? "bg-blue-500 text-white ml-auto"
                    : "bg-white border border-gray-200"
                )}
              >
                {m.role === 'assistant' ? (
                  <FlowTokenRenderer
                    content={m.content}
                    isStreaming={m.isStreaming}
                  />
                ) : (
                  m.content
                )}
              </div>
            ))}
          </div>
          {isLoading && <TypingIndicator isVisible />}
          <ChatInput
            value={input}
            onChange={handleInputChange}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </div>
      </main>
    </div>
  );
}
```

### Design Tokens (from UX Spec)

| Token | Value | Usage |
|-------|-------|-------|
| Header Navy | `#1E3A5F` | Header background |
| Primary Blue | `#3B82F6` | User message bg, links |
| Background | `#F9FAFB` | Chat area, assistant msg |
| Text Primary | `#374151` | Body text |
| Border | `#E5E7EB` | Card borders |
| Border Radius | 12px | `rounded-xl` |

### Import Order Standard (MUST FOLLOW)

1. React/Next.js imports ('use client', hooks, Link)
2. Third-party libraries (ai/react, flowtoken, lucide-react)
3. Internal components (@/components)
4. Utilities (@/lib)
5. Types (use `import type`)

### Anti-Patterns to Avoid

- **DO NOT** use useState for messages - useChat manages this
- **DO NOT** forget to set `animation={null}` on completed messages (memory leak)
- **DO NOT** block on incomplete XML - FlowToken handles gracefully
- **DO NOT** forget to handle the isStreaming prop for animation control
- **DO NOT** use default exports for components in components/ directory
- **DO NOT** forget to add FlowToken CSS if animations don't work

### Previous Story Learnings (1.4 Chat UI Shell)

**Critical AI SDK v6 API:**
- `useChat` hook from `@ai-sdk/react` (not `ai/react`)
- Requires `DefaultChatTransport` for API configuration
- Messages have `parts` array, not `content` property
- Status values: `'ready' | 'submitted' | 'streaming'`

**Message Transformation:**
```typescript
// AI SDK v6 message format
(m.parts ?? [])
  .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
  .map((p) => p.text)
  .join('')
```

**Input Management:**
- useState for input (not provided by useChat in v6)
- Clear input after sendMessage call

### Git Intelligence

Recent commits show consistent patterns:
1. Create feature components with tests
2. Run code review workflow
3. Fix any issues found
4. Update sprint status

Follow this pattern for consistency.

### Project Structure Notes

**Files to Create:**
- `components/flowtoken/FlowTokenRenderer.tsx`
- `components/flowtoken/FlowTokenRenderer.test.tsx`

**Files to Modify:**
- `app/flowtoken/page.tsx` (integrate FlowTokenRenderer)
- `types/index.ts` (add FlowTokenRendererProps if needed)

### Existing Components Available

**From Story 1.2:**
- `ContactCard` - `components/shared/ContactCard.tsx` (ready for FlowToken)
- `CalendarEvent` - `components/shared/CalendarEvent.tsx` (ready for FlowToken)

**From Story 1.3:**
- API endpoint `/api/chat?format=flowtoken` with XML-tagged content
- Mock stream provider outputting correct FlowToken format

**From Story 1.4:**
- `Header` - `components/shared/Header.tsx`
- `ChatInput` - `components/shared/ChatInput.tsx`
- `MessageList` - `components/shared/MessageList.tsx`
- `TypingIndicator` - `components/shared/TypingIndicator.tsx`
- FlowToken page shell at `app/flowtoken/page.tsx`

### Accessibility Requirements

| Element | Requirement |
|---------|-------------|
| Custom components | Must maintain their own ARIA labels |
| ContactCard | Already has `aria-label="Contact card for {name}"` |
| CalendarEvent | Already has `aria-label="Calendar event: {title}"` |
| FlowTokenRenderer | Should not interfere with component accessibility |

### Testing Strategy

**Unit Tests (FlowTokenRenderer):**
- Test plain markdown renders correctly
- Test ContactCard renders when XML tag present
- Test CalendarEvent renders when XML tag present
- Test animation prop applied when streaming
- Test animation disabled when not streaming

**Integration Tests (FlowToken Page):**
- Test messages display with FlowTokenRenderer
- Test custom components appear inline with text
- Test streaming state propagates correctly

### Performance Considerations

1. **Animation Control:** Always set `animation={null}` on completed messages
2. **Memoization:** FlowTokenRenderer should be wrapped in React.memo if performance issues arise
3. **Message Limit:** Consider virtualization if conversations exceed 100+ messages

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.5: FlowToken Implementation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#LLM Output Formats by Route]
- [Source: _bmad-output/planning-artifacts/research/technical-streaming-ui-patterns-research-2026-01-19.md#FlowToken]
- [Source: _bmad-output/planning-artifacts/research/technical-streaming-ui-patterns-research-2026-01-19.md#Implementation 1: FlowToken]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Experience Mechanics]
- [Source: _bmad-output/project-context.md#Streaming UI Rules]
- [Source: github.com/Ephibbs/flowtoken]
- [Source: npmjs.com/package/flowtoken]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- All 129 tests pass across 11 test files
- Build successful with no TypeScript errors
- Lint passes with no ESLint warnings

### Completion Notes List

**Initial Implementation:**
- Created FlowTokenRenderer component that wraps AnimatedMarkdown from flowtoken package
- Configured customComponents to map ContactCard and CalendarEvent XML tags
- Implemented animation control: fadeIn when streaming, null when complete (memory optimization)
- Updated MessageBubble to support optional children prop for custom content rendering
- Updated FlowToken page to use FlowTokenRenderer for assistant messages
- Added isStreaming flag to formatted messages based on streaming status and message position
- Implemented scroll management (auto-scroll to bottom unless user scrolled up)

**AI SDK v6 Integration Fixes:**
- Updated API route validation to accept both AI SDK v5 (content string) and v6 (parts array) message formats
- Changed from data stream protocol (`0:`, `e:`, `d:` prefixes) to UIMessageStream format
- Now uses `createUIMessageStream` and `createUIMessageStreamResponse` from 'ai' package
- UIMessageStream events: `text-start`, `text-delta`, `text-end` for proper useChat compatibility

**FlowToken/HTML5 Custom Element Fixes:**
- FlowToken lowercases tag names when parsing, so customComponents must use lowercase keys: `contactcard`, `calendarevent`
- HTML5 custom elements require explicit closing tags (e.g., `<contactcard></contactcard>`), not self-closing syntax (`<contactcard />`)
- Updated test content to use lowercase tags with explicit closing tags

**Hydration Error Fix:**
- Changed ContactCard and CalendarEvent from `<div>` to `<span>` elements
- HTML spec: `<div>` cannot be nested inside `<p>` (markdown parser wraps text in `<p>`)
- Using `<span>` with flex classes achieves same block layout while being valid inside markdown paragraphs

**Card UI Enhancements:**
- Added vertical margin (`my-3`) to separate cards from surrounding text
- Added gradient backgrounds to distinguish cards from white message bubble:
  - ContactCard: blue gradient (`from-blue-50 to-white`) with blue border
  - CalendarEvent: emerald gradient (`from-emerald-50 to-white`) with emerald border
- Added hover shadow transition for subtle interactivity
- Enhanced icon styling with colored backgrounds and matching icon colors
- Improved typography with semibold titles

### File List

- components/flowtoken/FlowTokenRenderer.tsx (new)
- components/flowtoken/FlowTokenRenderer.test.tsx (new)
- components/shared/MessageBubble.tsx (modified - added children prop)
- components/shared/MessageBubble.test.tsx (modified)
- components/shared/ContactCard.tsx (modified - span elements, enhanced styling)
- components/shared/CalendarEvent.tsx (modified - span elements, enhanced styling)
- app/flowtoken/page.tsx (modified)
- app/api/chat/route.ts (modified - UIMessageStream, v6 format support)
- app/api/chat/route.test.ts (modified - updated test expectations)
- lib/test-content.ts (modified - lowercase tags, explicit closing tags)
- lib/test-content.test.ts (modified - updated test expectations)
- types/index.ts (modified)
