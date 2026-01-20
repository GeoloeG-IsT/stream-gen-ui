# Story 1.4: Chat UI Shell

Status: done

## Story

As an **evaluator**,
I want **a functional chat interface**,
so that **I can send messages and see streaming responses**.

## Acceptance Criteria

1. **Given** the chat page loads **When** I view the interface **Then** I see a message list area and an input field with send button **And** the layout follows the compact header design (56px navy header)

2. **Given** I type a message and press Enter or click Send **When** the message is submitted **Then** my message appears immediately in the message list (user bubble) **And** a typing indicator shows while waiting for response **And** the assistant response streams in token-by-token **And** auto-scroll follows new content

## Tasks / Subtasks

- [x] Task 1: Create Header component with navigation tabs (AC: #1)
  - [x] Create `components/shared/Header.tsx`
  - [x] Fixed position, 56px height, navy background (#1E3A5F)
  - [x] Three navigation tabs: FlowToken, llm-ui, Streamdown
  - [x] Active tab: white background, navy text
  - [x] Inactive tabs: transparent background, white text at 70% opacity
  - [x] Use Next.js Link for navigation to /flowtoken, /llm-ui, /streamdown
  - [x] Export as named export

- [x] Task 2: Create MessageBubble component (AC: #1, #2)
  - [x] Create `components/shared/MessageBubble.tsx`
  - [x] Props: role ('user' | 'assistant'), content, isStreaming
  - [x] User messages: blue background (#3B82F6), white text, right-aligned
  - [x] Assistant messages: white/light gray (#F9FAFB) background, left-aligned
  - [x] 12px border-radius (rounded-xl), appropriate padding
  - [x] Max-width 85% to avoid full-width bubbles

- [x] Task 3: Create TypingIndicator component (AC: #2)
  - [x] Create `components/shared/TypingIndicator.tsx`
  - [x] Three dots with staggered bounce animation
  - [x] Props: isVisible (boolean)
  - [x] Use CSS keyframes for bounce animation
  - [x] Support prefers-reduced-motion media query

- [x] Task 4: Create MessageList component (AC: #1, #2)
  - [x] Create `components/shared/MessageList.tsx`
  - [x] Scrollable container for messages
  - [x] Auto-scroll to bottom when new content arrives
  - [x] Pause auto-scroll when user scrolls up manually
  - [x] Resume auto-scroll when user scrolls to bottom
  - [x] Use aria-live="polite" for screen reader announcements
  - [x] Map over messages array and render MessageBubble for each

- [x] Task 5: Create ChatInput component (AC: #2)
  - [x] Create `components/shared/ChatInput.tsx`
  - [x] Props: value, onChange, onSubmit, isLoading
  - [x] Sticky at bottom of chat area
  - [x] Text input field with rounded styling (rounded-lg)
  - [x] Send button with submit icon (lucide-react Send icon)
  - [x] Disable input and button while streaming
  - [x] Submit on Enter key or button click
  - [x] Clear input after submission

- [x] Task 6: Create FlowToken page with useChat integration (AC: #1, #2)
  - [x] Create `app/flowtoken/page.tsx`
  - [x] Use 'use client' directive for useChat hook
  - [x] Import and use `useChat` from '@ai-sdk/react' with DefaultChatTransport pointing to `/api/chat?format=flowtoken`
  - [x] Layout: Header + MessageList + ChatInput
  - [x] Pass messages from useChat to MessageList
  - [x] Pass input, handleInputChange, handleSubmit to ChatInput
  - [x] Show TypingIndicator when isLoading is true

- [x] Task 7: Update root page to redirect to /flowtoken (AC: #1)
  - [x] Update `app/page.tsx` to redirect to /flowtoken using next/navigation redirect()

- [x] Task 8: Add type definitions and tests (AC: #1, #2)
  - [x] Add MessageBubbleProps, ChatInputProps, HeaderProps to types/index.ts
  - [x] Create co-located test files for new components
  - [x] Run `npm run build` - no TypeScript errors
  - [x] Run `npm run lint` - no ESLint warnings
  - [x] Run `npm test` - all tests pass

## Dev Notes

### Critical Architecture Requirements

**CRITICAL: useChat is the ONLY message state management. DO NOT use useState for messages.**

The `useChat` hook from Vercel AI SDK v6 provides:
- `messages` - array of Message objects (with `parts` array instead of `content`)
- `sendMessage` - function to send a message `({ text: string })`
- `status` - streaming state ('ready' | 'submitted' | 'streaming')

**Note:** AI SDK v6 changed the API - `handleInputChange`, `handleSubmit`, and `input` are no longer provided by useChat. You manage input state separately with `useState`.

### useChat Integration Pattern (REQUIRED - AI SDK v6)

```typescript
// app/flowtoken/page.tsx
'use client';

import { useState, useCallback, useMemo } from 'react';
import type { FormEvent, ChangeEvent, ReactElement } from 'react';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

import { Header } from '@/components/shared/Header';
import { MessageList } from '@/components/shared/MessageList';
import { ChatInput } from '@/components/shared/ChatInput';
import { TypingIndicator } from '@/components/shared/TypingIndicator';

export default function FlowTokenPage(): ReactElement {
  const [input, setInput] = useState('');

  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/chat?format=flowtoken' }),
    []
  );

  const { messages, sendMessage, status } = useChat({ transport });
  const isLoading = status === 'submitted' || status === 'streaming';

  const handleInputChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => setInput(e.target.value),
    []
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!input.trim() || isLoading) return;
      const message = input;
      setInput('');
      await sendMessage({ text: message });
    },
    [input, isLoading, sendMessage]
  );

  // Transform messages: AI SDK v6 uses parts array, filter to user/assistant only
  const formattedMessages = useMemo(
    () =>
      messages
        .filter((m): m is typeof m & { role: 'user' | 'assistant' } =>
          m.role === 'user' || m.role === 'assistant'
        )
        .map((m) => ({
          id: m.id,
          role: m.role,
          content: (m.parts ?? [])
            .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
            .map((p) => p.text)
            .join(''),
        })),
    [messages]
  );

  return (
    <div className="flex flex-col h-screen">
      <Header currentRoute="/flowtoken" />
      <main className="flex-1 overflow-hidden bg-gray-50 pt-14">
        <div className="h-full max-w-3xl mx-auto flex flex-col">
          <MessageList messages={formattedMessages} />
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

### Component Specifications

**Header Component:**
- Height: 56px fixed
- Background: #1E3A5F (Header Navy)
- Tabs use Next.js `Link` component
- Determine active tab from `currentRoute` prop or usePathname()
- Logo/title optional (left side) - can add "stream-gen-ui" text

**MessageBubble Component:**
```typescript
interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}
```
- User: `bg-blue-500 text-white ml-auto` (right-aligned)
- Assistant: `bg-white border border-gray-200` (left-aligned)
- Both: `rounded-xl p-4 max-w-[85%]`

**TypingIndicator Component:**
```typescript
interface TypingIndicatorProps {
  isVisible: boolean;
}
```
- Three dots with keyframe animation:
```css
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-8px); }
}
```
- Stagger timing: 0ms, 150ms, 300ms delay for each dot
- Must respect `prefers-reduced-motion`

**MessageList Component:**
```typescript
interface MessageListProps {
  messages: Array<{ id: string; role: 'user' | 'assistant'; content: string }>;
}
```
- Use `useRef` and `useEffect` to implement auto-scroll
- Detect user scroll with scroll event listener
- `aria-live="polite"` on container

**ChatInput Component:**
```typescript
interface ChatInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}
```
- Form with `onSubmit={handleSubmit}`
- Input: `flex-1 rounded-lg border p-3`
- Button: Send icon, disabled when loading or empty input

### Design Tokens (from UX Spec)

| Token | Value | Usage |
|-------|-------|-------|
| Header Navy | `#1E3A5F` | Header background |
| Primary Blue | `#3B82F6` | User message bg, links |
| Background | `#F9FAFB` | Chat area, assistant msg |
| Text Primary | `#374151` | Body text |
| Border | `#E5E7EB` | Card borders |
| Border Radius | 12px | `rounded-xl` |

### Layout Structure (REQUIRED)

```
┌─────────────────────────────────────────────┐
│  Header (56px fixed, navy)                  │
│  [FlowToken] [llm-ui] [Streamdown]          │
├─────────────────────────────────────────────┤
│                                             │
│  Message List (flex-1, scrollable)          │
│  ┌───────────────────────────────────────┐  │
│  │ max-w-3xl mx-auto                     │  │
│  │                                       │  │
│  │  [User message bubble ────────────]   │  │
│  │                                       │  │
│  │  [───────────── Assistant bubble]     │  │
│  │                                       │  │
│  │  [TypingIndicator if loading]         │  │
│  │                                       │  │
│  └───────────────────────────────────────┘  │
│                                             │
├─────────────────────────────────────────────┤
│  Chat Input (sticky bottom)                 │
│  ┌───────────────────────────────┐ [Send]   │
│  │ Type a message...             │          │
│  └───────────────────────────────┘          │
└─────────────────────────────────────────────┘
```

### Import Order Standard (MUST FOLLOW)

1. React/Next.js imports ('use client', hooks, Link)
2. Third-party libraries (ai/react, lucide-react)
3. Internal components (@/components)
4. Utilities (@/lib)
5. Types (use `import type`)

### Anti-Patterns to Avoid

- **DO NOT** use useState for messages - useChat manages this
- **DO NOT** use export default for components in components/ directory
- **DO NOT** forget 'use client' directive when using hooks
- **DO NOT** hardcode colors - use Tailwind classes matching design tokens
- **DO NOT** forget prefers-reduced-motion for animations
- **DO NOT** block on incomplete stream - handle gracefully

### Previous Story Learnings

**From Story 1.1:**
- cn() utility exists in lib/utils.ts - use for all class management
- TypeScript strict mode is enabled - no `any` allowed
- layout.tsx and page.tsx use `export default` (Next.js requirement)

**From Story 1.2:**
- Use `ReactElement` return type instead of `JSX.Element` if there are issues with React 19
- Components use named exports: `export function ComponentName`
- Full test coverage expected with Vitest (co-located test files)
- Import lucide-react icons as needed

**From Story 1.3:**
- API endpoint is `/api/chat?format=X` where X is flowtoken, llm-ui, or streamdown
- Mock stream uses proper SSE format with `X-Vercel-AI-Data-Stream: v1` header
- ChatMessage type exists in types/index.ts

### Git Intelligence

Recent commit patterns show:
1. Implement feature components
2. Add comprehensive tests
3. Run code review workflow
4. Fix any issues found

Follow this pattern for consistency.

### Project Structure Notes

**Files to Create:**
- `components/shared/Header.tsx`
- `components/shared/Header.test.tsx`
- `components/shared/MessageBubble.tsx`
- `components/shared/MessageBubble.test.tsx`
- `components/shared/TypingIndicator.tsx`
- `components/shared/TypingIndicator.test.tsx`
- `components/shared/MessageList.tsx`
- `components/shared/MessageList.test.tsx`
- `components/shared/ChatInput.tsx`
- `components/shared/ChatInput.test.tsx`
- `app/flowtoken/page.tsx`

**Files to Modify:**
- `app/page.tsx` (add redirect to /flowtoken)
- `types/index.ts` (add new interfaces)
- `app/globals.css` (add typing indicator animation)

### Existing Components Available

From Story 1.2:
- `ContactCard` - components/shared/ContactCard.tsx
- `CalendarEvent` - components/shared/CalendarEvent.tsx

From Story 1.3:
- API endpoint `/api/chat?format=flowtoken` ready
- Mock stream provider working

### Accessibility Requirements

| Element | Requirement |
|---------|-------------|
| Message container | `aria-live="polite"` |
| Send button | `aria-label="Send message"` |
| Input | `aria-label="Message input"` |
| Typing indicator | `aria-label="Assistant is typing"` role="status" |
| Focus states | 2px blue ring on all interactive elements |
| Tab order | Header tabs → Messages → Input |

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.4: Chat UI Shell]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design Direction Decision]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Component Strategy]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX Consistency Patterns]
- [Source: _bmad-output/project-context.md#React Rules]
- [Source: _bmad-output/project-context.md#Streaming UI Rules]
- [Source: ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- AI SDK v6 API change: useChat hook now requires `@ai-sdk/react` import and `DefaultChatTransport` for API configuration
- Message format changed from `content` property to `parts` array with `{ type: 'text', text: string }` objects

### Completion Notes List

- Implemented all 5 chat UI components (Header, MessageBubble, TypingIndicator, MessageList, ChatInput)
- Created FlowToken page with full useChat integration using AI SDK v6 API
- Added typing indicator animation with prefers-reduced-motion support
- All components follow project patterns: named exports, ReactElement return types, cn() utility
- Full test coverage: 65 new tests across 5 component test files
- All 119 project tests passing
- Build passes with no TypeScript errors
- Lint passes with no warnings
- Root page redirects to /flowtoken

### File List

**New Files:**
- components/shared/Header.tsx
- components/shared/Header.test.tsx
- components/shared/MessageBubble.tsx
- components/shared/MessageBubble.test.tsx
- components/shared/TypingIndicator.tsx
- components/shared/TypingIndicator.test.tsx
- components/shared/MessageList.tsx
- components/shared/MessageList.test.tsx
- components/shared/ChatInput.tsx
- components/shared/ChatInput.test.tsx
- app/flowtoken/page.tsx

**Modified Files:**
- app/page.tsx (redirect to /flowtoken)
- app/globals.css (typing indicator animation)
- types/index.ts (added HeaderProps, MessageBubbleProps, TypingIndicatorProps, MessageListProps, ChatInputProps)
- package.json (dependency updates for AI SDK)
- package-lock.json (dependency lock file updates)

## Change Log

- 2026-01-20: Implemented Chat UI Shell - all components, tests, and FlowToken page complete
- 2026-01-20: Code Review fixes applied:
  - MessageBubble: Implemented isStreaming prop with pulse animation and cursor indicator
  - FlowToken page: Added defensive null check for m.parts array
  - MessageListProps: Updated role type from string to 'user' | 'assistant' union
  - MessageList: Removed unsafe type cast, now uses properly typed role
  - FlowToken page: Added filter to exclude system messages from display
  - Header: Changed h-14 to explicit h-[56px] per spec
- 2026-01-20: UX improvement - ChatInput auto-focuses after message submission for seamless typing experience
