# Story 1.4: Chat UI Shell

Status: ready-for-dev

## Story

As an **evaluator**,
I want **a functional chat interface**,
so that **I can send messages and see streaming responses**.

## Acceptance Criteria

1. **Given** the chat page loads **When** I view the interface **Then** I see a message list area and an input field with send button **And** the layout follows the compact header design (56px navy header)

2. **Given** I type a message and press Enter or click Send **When** the message is submitted **Then** my message appears immediately in the message list (user bubble) **And** a typing indicator shows while waiting for response **And** the assistant response streams in token-by-token **And** auto-scroll follows new content

## Tasks / Subtasks

- [ ] Task 1: Create Header component with navigation tabs (AC: #1)
  - [ ] Create `components/shared/Header.tsx`
  - [ ] Fixed position, 56px height, navy background (#1E3A5F)
  - [ ] Three navigation tabs: FlowToken, llm-ui, Streamdown
  - [ ] Active tab: white background, navy text
  - [ ] Inactive tabs: transparent background, white text at 70% opacity
  - [ ] Use Next.js Link for navigation to /flowtoken, /llm-ui, /streamdown
  - [ ] Export as named export

- [ ] Task 2: Create MessageBubble component (AC: #1, #2)
  - [ ] Create `components/shared/MessageBubble.tsx`
  - [ ] Props: role ('user' | 'assistant'), content, isStreaming
  - [ ] User messages: blue background (#3B82F6), white text, right-aligned
  - [ ] Assistant messages: white/light gray (#F9FAFB) background, left-aligned
  - [ ] 12px border-radius (rounded-xl), appropriate padding
  - [ ] Max-width 85% to avoid full-width bubbles

- [ ] Task 3: Create TypingIndicator component (AC: #2)
  - [ ] Create `components/shared/TypingIndicator.tsx`
  - [ ] Three dots with staggered bounce animation
  - [ ] Props: isVisible (boolean)
  - [ ] Use CSS keyframes for bounce animation
  - [ ] Support prefers-reduced-motion media query

- [ ] Task 4: Create MessageList component (AC: #1, #2)
  - [ ] Create `components/shared/MessageList.tsx`
  - [ ] Scrollable container for messages
  - [ ] Auto-scroll to bottom when new content arrives
  - [ ] Pause auto-scroll when user scrolls up manually
  - [ ] Resume auto-scroll when user scrolls to bottom
  - [ ] Use aria-live="polite" for screen reader announcements
  - [ ] Map over messages array and render MessageBubble for each

- [ ] Task 5: Create ChatInput component (AC: #2)
  - [ ] Create `components/shared/ChatInput.tsx`
  - [ ] Props: value, onChange, onSubmit, isLoading
  - [ ] Sticky at bottom of chat area
  - [ ] Text input field with rounded styling (rounded-lg)
  - [ ] Send button with submit icon (lucide-react Send icon)
  - [ ] Disable input and button while streaming
  - [ ] Submit on Enter key or button click
  - [ ] Clear input after submission

- [ ] Task 6: Create FlowToken page with useChat integration (AC: #1, #2)
  - [ ] Create `app/flowtoken/page.tsx`
  - [ ] Use 'use client' directive for useChat hook
  - [ ] Import and use `useChat` from 'ai/react' with api option pointing to `/api/chat?format=flowtoken`
  - [ ] Layout: Header + MessageList + ChatInput
  - [ ] Pass messages from useChat to MessageList
  - [ ] Pass input, handleInputChange, handleSubmit to ChatInput
  - [ ] Show TypingIndicator when isLoading is true

- [ ] Task 7: Update root page to redirect to /flowtoken (AC: #1)
  - [ ] Update `app/page.tsx` to redirect to /flowtoken using next/navigation redirect()

- [ ] Task 8: Add type definitions and tests (AC: #1, #2)
  - [ ] Add MessageBubbleProps, ChatInputProps, HeaderProps to types/index.ts
  - [ ] Create co-located test files for new components
  - [ ] Run `npm run build` - no TypeScript errors
  - [ ] Run `npm run lint` - no ESLint warnings
  - [ ] Run `npm test` - all tests pass

## Dev Notes

### Critical Architecture Requirements

**CRITICAL: useChat is the ONLY message state management. DO NOT use useState for messages.**

The `useChat` hook from Vercel AI SDK provides:
- `messages` - array of Message objects
- `input` - current input value
- `handleInputChange` - input change handler
- `handleSubmit` - form submit handler
- `isLoading` - streaming state indicator
- `error` - any errors during streaming

### useChat Integration Pattern (REQUIRED)

```typescript
// app/flowtoken/page.tsx
'use client';

import { useChat } from 'ai/react';

import { Header } from '@/components/shared/Header';
import { MessageList } from '@/components/shared/MessageList';
import { ChatInput } from '@/components/shared/ChatInput';
import { TypingIndicator } from '@/components/shared/TypingIndicator';

export default function FlowTokenPage(): JSX.Element {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat?format=flowtoken',
  });

  return (
    <div className="flex flex-col h-screen">
      <Header currentRoute="/flowtoken" />
      <main className="flex-1 overflow-hidden bg-gray-50">
        <div className="h-full max-w-3xl mx-auto flex flex-col">
          <MessageList messages={messages} />
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
  messages: Array<{ id: string; role: string; content: string }>;
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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

