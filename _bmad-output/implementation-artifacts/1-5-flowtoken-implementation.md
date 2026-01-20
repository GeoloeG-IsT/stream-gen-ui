# Story 1.5: FlowToken Implementation

Status: ready-for-dev

## Story

As an **evaluator**,
I want **the FlowToken streaming approach working on `/flowtoken`**,
so that **I can experience the first implementation of custom component rendering**.

## Acceptance Criteria

1. **Given** I navigate to `/flowtoken` **When** I send a message requesting contact info **Then** the response streams text progressively **And** when `<ContactCard>` tag is detected, a skeleton component appears immediately **And** as props stream in, the component populates progressively **And** when the tag closes, the component becomes fully interactive **And** text continues streaming after the component

2. **Given** the message contains `<CalendarEvent>` markup **When** rendered via FlowToken **Then** the CalendarEvent component appears inline with the same progressive behavior

## Tasks / Subtasks

- [ ] Task 1: Create FlowTokenRenderer component (AC: #1, #2)
  - [ ] Create `components/flowtoken/FlowTokenRenderer.tsx`
  - [ ] Import `AnimatedMarkdown` from `flowtoken` package
  - [ ] Configure `customComponents` prop to map ContactCard and CalendarEvent
  - [ ] Configure `htmlComponents` prop for standard markdown elements if needed
  - [ ] Props: content (string), isStreaming (boolean)
  - [ ] Use `animation="fadeIn"` when streaming, `null` when complete (memory optimization)
  - [ ] Export as named export

- [ ] Task 2: Create FlowTokenRenderer tests (AC: #1, #2)
  - [ ] Create `components/flowtoken/FlowTokenRenderer.test.tsx`
  - [ ] Test renders plain markdown content
  - [ ] Test renders ContactCard when XML tag present
  - [ ] Test renders CalendarEvent when XML tag present
  - [ ] Test applies animation prop during streaming
  - [ ] Test disables animation when not streaming

- [ ] Task 3: Update FlowToken page to use FlowTokenRenderer (AC: #1, #2)
  - [ ] Modify `app/flowtoken/page.tsx`
  - [ ] Replace current MessageList content rendering with FlowTokenRenderer
  - [ ] Pass `isStreaming` prop based on message position (only last assistant message streams)
  - [ ] Ensure progressive rendering of custom components works

- [ ] Task 4: Update MessageBubble to support custom content renderer (AC: #1, #2)
  - [ ] Modify `components/shared/MessageBubble.tsx` to accept optional `children` prop
  - [ ] When children provided, render children instead of raw content text
  - [ ] Maintain backward compatibility with existing content prop usage

- [ ] Task 5: Verify integration and run tests (AC: #1, #2)
  - [ ] Run `npm run build` - no TypeScript errors
  - [ ] Run `npm run lint` - no ESLint warnings
  - [ ] Run `npm test` - all tests pass
  - [ ] Manual testing: send message, verify ContactCard renders inline
  - [ ] Manual testing: verify CalendarEvent renders inline
  - [ ] Manual testing: verify text continues streaming after components

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
