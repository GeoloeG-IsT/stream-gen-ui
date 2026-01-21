# Phase 5: Renderer Integration - Research

**Researched:** 2026-01-21
**Domain:** Frontend streaming integration, transient markup handling, React chat UX
**Confidence:** HIGH

## Summary

This phase wires the llm-ui and Streamdown pages to the live `/api/chat` backend endpoint (FastAPI) instead of the mock frontend API route. The backend already supports marker-based format selection (`marker=xml` for Streamdown, `marker=llm-ui` for llm-ui). Key integration points:

1. **Transport Configuration:** The existing `DefaultChatTransport` needs to point to the backend URL with the appropriate `marker` query parameter
2. **Transient Markup Hiding:** Both renderers already have mechanisms for this (llm-ui's `lookBack` function, Streamdown's `isAnimating` prop), but custom component markup needs additional skeleton handling
3. **Error/Stop Handling:** The AI SDK provides `stop()` and `onError` but the current pages don't expose them - needs wiring

**Primary recommendation:** Reuse the existing FlowToken page pattern (which already connects to backend) for llm-ui and Streamdown pages, adding marker query params and implementing skeleton loaders for incomplete custom components.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @ai-sdk/react | 3.0.43 | React hooks for AI streaming | Project already uses useChat hook |
| ai | 6.0.41 | DefaultChatTransport, stream protocols | AI SDK v6 data stream compatibility |
| @llm-ui/react | 0.13.3 | llm-ui page rendering | Already integrated, handles partial blocks |
| streamdown | 2.1.0 | Streamdown page rendering | Already integrated, handles incomplete markdown |
| sonner | ^2.0 (new) | Toast notifications for errors | Lightweight, works well with Tailwind, shadcn-compatible |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| lucide-react | 0.562.0 | Icons for stop button, error states | Already in project |
| clsx/tailwind-merge | latest | Conditional styling | Already in project |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| sonner | react-hot-toast | Both excellent; sonner has better default animations, but react-hot-toast is more battle-tested at 5KB |
| Custom skeleton | react-loading-skeleton | Project uses Tailwind; custom skeleton avoids dependency bloat |

**Installation:**
```bash
npm install sonner
```

## Architecture Patterns

### Current Frontend Architecture
```
frontend/
├── app/
│   ├── api/chat/route.ts    # Mock API (REMOVE for live backend)
│   ├── llm-ui/page.tsx      # Uses /api/chat?format=llm-ui (mock)
│   ├── streamdown/page.tsx  # Uses /api/chat?format=streamdown (mock)
│   └── flowtoken/page.tsx   # Uses backend URL + marker (REFERENCE)
├── components/
│   ├── llm-ui/LLMUIRenderer.tsx      # lookBack hides partial blocks
│   └── streamdown/StreamdownRenderer.tsx  # isAnimating handles streaming
└── lib/
    └── test-content.ts      # Mock content (no longer needed for live pages)
```

### Target Architecture
```
frontend/
├── app/
│   ├── api/chat/route.ts    # KEEP for flowtoken demo mode only
│   ├── llm-ui/page.tsx      # Backend: marker=llm-ui + skeleton loading
│   ├── streamdown/page.tsx  # Backend: marker=xml + skeleton loading
│   └── flowtoken/page.tsx   # Already uses backend (marker=xml default)
├── components/
│   ├── llm-ui/LLMUIRenderer.tsx      # Add skeleton for incomplete blocks
│   ├── streamdown/StreamdownRenderer.tsx  # Add skeleton for incomplete tags
│   └── shared/
│       ├── ErrorToast.tsx   # Sonner-based error display
│       └── StopButton.tsx   # Abort streaming button
└── contexts/
    └── ToastProvider.tsx    # Sonner provider at layout level
```

### Pattern 1: Backend URL Configuration
**What:** Use environment variable for backend URL with marker query param
**When to use:** All pages connecting to live backend
**Example:**
```typescript
// Source: Existing flowtoken/page.tsx pattern
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://188.245.108.179:8000';
const transport = useMemo(
  () => new DefaultChatTransport({
    api: `${backendUrl}/api/chat?marker=llm-ui`,  // or marker=xml for Streamdown
  }),
  [backendUrl]
);
```

### Pattern 2: useChat with Stop Function
**What:** Destructure `stop` from useChat to enable stream abortion
**When to use:** Implementing stop button
**Example:**
```typescript
// Source: AI SDK docs - https://ai-sdk.dev/docs/advanced/stopping-streams
const { messages, sendMessage, status, error, stop } = useChat({
  transport,
  onError: (err) => {
    toast.error(getErrorMessage(err));
  },
});

// Stop button visibility
const isStreaming = status === 'streaming';
{isStreaming && <StopButton onClick={stop} />}
```

### Pattern 3: Skeleton Loader for Incomplete Blocks
**What:** Show skeleton placeholder while custom component markup is incomplete
**When to use:** During streaming when block delimiters are partial
**Example:**
```typescript
// Source: llm-ui lookBack pattern - existing LLMUIRenderer.tsx
lookBack: ({ output, isComplete }: LookBackFunctionParams) => {
  if (isComplete) {
    return { output, visibleText: '' };  // Hide delimiters, show component
  }
  // During streaming, show skeleton instead of partial markup
  return { output, visibleText: '' };  // Return empty, render skeleton externally
}

// Skeleton component (Tailwind-based)
function ComponentSkeleton() {
  return (
    <div className="animate-pulse bg-gray-200 rounded-lg h-24 w-full" />
  );
}
```

### Pattern 4: Error Toast with Retry
**What:** Show toast notification with error type differentiation
**When to use:** Network errors, server errors, timeouts
**Example:**
```typescript
// Source: Sonner docs - https://github.com/emilkowalski/sonner
import { toast } from 'sonner';

function getErrorMessage(error: Error): string {
  if (error.name === 'AbortError') return 'Request was cancelled';
  if (error.message.includes('fetch')) return 'Network error - check your connection';
  if (error.message.includes('500')) return 'Server error - please try again';
  if (error.message.includes('timeout')) return 'Request timed out';
  return 'An error occurred';
}

// In onError callback
onError: (err) => {
  toast.error(getErrorMessage(err), {
    action: {
      label: 'Retry',
      onClick: () => sendMessage({ text: lastMessage }),
    },
  });
}
```

### Anti-Patterns to Avoid
- **Buffering entire response:** Don't wait for complete markup before showing anything - use skeleton loaders instead
- **Re-rendering entire message list:** Memoize individual message components (already done with React.memo)
- **Blocking main thread during scroll:** Use requestAnimationFrame for scroll-to-bottom if performance issues arise

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Partial delimiter detection | Custom regex state machine | llm-ui's `findPartialMatch` / `findCompleteMatch` | Edge cases with nested/malformed delimiters |
| Streaming markdown rendering | Custom parser | Streamdown with `isAnimating` | Handles unterminated blocks, code fences, etc. |
| Toast notifications | Custom modal/alert | sonner | Animation, stacking, accessibility handled |
| Abort signal propagation | Manual fetch abort | AI SDK `stop()` function | Handles cleanup, state management |
| SSE stream parsing | Custom EventSource handling | AI SDK v6 stream protocol | Protocol-specific parsing, reconnection |

**Key insight:** The rendering libraries (llm-ui, Streamdown) already handle most transient markup issues internally. The main work is: (1) wiring to backend, (2) adding skeleton UI for custom components during partial state, and (3) exposing stop/error UX.

## Common Pitfalls

### Pitfall 1: Wrong Marker Parameter Name
**What goes wrong:** Using `format=` instead of `marker=` when calling backend
**Why it happens:** Frontend mock API uses `format` param, backend uses `marker`
**How to avoid:** Backend API is `POST /api/chat?marker=xml|llm-ui` - check backend/main.py line 208-209
**Warning signs:** 400 error with "Invalid marker" or default XML format when expecting llm-ui

### Pitfall 2: Incomplete lookBack Implementation
**What goes wrong:** Raw delimiters `【CONTACT:` flash briefly during streaming
**Why it happens:** lookBack returns partial output as visibleText
**How to avoid:** For custom component blocks, return `visibleText: ''` for both complete and incomplete states; render skeleton externally based on `isComplete`
**Warning signs:** Flickering brackets/tags during fast streaming

### Pitfall 3: Stop Button State Mismatch
**What goes wrong:** Stop button visible when not streaming, or hidden when streaming
**Why it happens:** Using `isLoading` (submitted OR streaming) instead of just `status === 'streaming'`
**How to avoid:** Show stop button only when `status === 'streaming'`, hide immediately when stopped
**Warning signs:** Stop button during initial submission (before stream starts)

### Pitfall 4: Error Toast Overlap with Inline Error
**What goes wrong:** Error shown both as toast AND inline, confusing UX
**Why it happens:** Multiple error handling paths not coordinated
**How to avoid:** Use toast for notification, inline for retry prompt; don't duplicate message text
**Warning signs:** Same error message appearing in two places

### Pitfall 5: Memory Leak on Navigation During Stream
**What goes wrong:** Stream continues in background, state updates after unmount
**Why it happens:** No cleanup on component unmount
**How to avoid:** Call `stop()` in useEffect cleanup; AI SDK handles abort signal
**Warning signs:** Console warnings about state updates on unmounted component

### Pitfall 6: Scroll Jank During Streaming
**What goes wrong:** UI feels sluggish, clicks delayed during fast streaming
**Why it happens:** Frequent re-renders blocking main thread
**How to avoid:**
- Use React.memo (already done)
- Throttle scroll-to-bottom with requestAnimationFrame if needed
- Consider `content-visibility: auto` for off-screen messages
**Warning signs:** Scroll stuttering, delayed button response during streaming

## Code Examples

Verified patterns from official sources:

### Backend Integration Transport
```typescript
// Source: Existing flowtoken/page.tsx + backend/main.py
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://188.245.108.179:8000';

// For llm-ui page
const transport = useMemo(
  () => new DefaultChatTransport({
    api: `${backendUrl}/api/chat?marker=llm-ui`,
  }),
  [backendUrl]
);

// For Streamdown page
const transport = useMemo(
  () => new DefaultChatTransport({
    api: `${backendUrl}/api/chat?marker=xml`,
  }),
  [backendUrl]
);
```

### useChat with Full Error/Stop Support
```typescript
// Source: AI SDK docs - https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
const { messages, sendMessage, status, error, stop } = useChat({
  transport,
  onError: (err) => {
    console.error('[page] useChat error:', err);
    // Toast handled separately
  },
  onFinish: (message, { isAbort }) => {
    if (isAbort) {
      // Mark message as "(stopped)" - handled in message display
    }
  },
});

const isStreaming = status === 'streaming';
const isLoading = status === 'submitted' || isStreaming;
```

### Sonner Toast Setup
```typescript
// Source: Sonner docs - https://github.com/emilkowalski/sonner
// In layout.tsx or _app.tsx
import { Toaster } from 'sonner';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}

// Usage in components
import { toast } from 'sonner';

// Error with retry action
toast.error('Network error', {
  description: 'Check your connection and try again',
  action: {
    label: 'Retry',
    onClick: () => handleRetry(),
  },
});
```

### Skeleton Loader Component
```typescript
// Source: Tailwind CSS patterns + project conventions
interface ComponentSkeletonProps {
  type: 'contact' | 'calendar';
}

function ComponentSkeleton({ type }: ComponentSkeletonProps) {
  return (
    <div
      className="animate-pulse rounded-lg border border-gray-200 p-4 transition-opacity duration-150"
      aria-label={`Loading ${type}...`}
    >
      <div className="flex gap-4">
        {type === 'contact' && (
          <>
            <div className="h-12 w-12 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded" />
              <div className="h-3 w-48 bg-gray-200 rounded" />
            </div>
          </>
        )}
        {type === 'calendar' && (
          <>
            <div className="h-12 w-12 rounded bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-40 bg-gray-200 rounded" />
              <div className="h-3 w-24 bg-gray-200 rounded" />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

### Stop Button Component
```typescript
// Source: AI SDK stop pattern + project conventions
interface StopButtonProps {
  onClick: () => void;
}

function StopButton({ onClick }: StopButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      aria-label="Stop generating"
    >
      <StopCircle className="h-4 w-4" />
      Stop
    </button>
  );
}
```

### Fade Transition for Component Ready State
```typescript
// Source: Project CONTEXT.md decision - 150-200ms fade
// CSS (in globals.css or component)
.component-fade-in {
  animation: fadeIn 150ms ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

// Usage
<div className={cn(
  'transition-opacity',
  isComplete ? 'component-fade-in' : 'opacity-0'
)}>
  <ContactCard {...props} />
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AI SDK v5 content string | AI SDK v6 parts array | 2024 | Messages use `parts` not `content`; already handled in project |
| SSE text/event-stream | UI Message Stream protocol | AI SDK v6 | Backend uses `x-vercel-ai-ui-message-stream: v1` header |
| Manual streaming parse | useChat hook | AI SDK v6 | Hook handles reconnection, state, abort |

**Deprecated/outdated:**
- `onFinish` parameter name changed: `isAborted` -> `isAbort` in newer versions (verify exact param name)
- Direct fetch with EventSource: Use DefaultChatTransport instead

## Open Questions

Things that couldn't be fully resolved:

1. **Streaming Performance Investigation**
   - What we know: CONTEXT.md mentions investigating "interaction sluggishness during streaming"
   - What's unclear: Root cause - could be React re-renders, scroll handler, or DOM operations
   - Recommendation: Profile with React DevTools during streaming; fix if straightforward, defer if complex

2. **Exact isAbort vs isAborted Param**
   - What we know: AI SDK onFinish callback has an abort flag
   - What's unclear: Exact parameter name may vary by version
   - Recommendation: Check at implementation time with TypeScript types

3. **Skeleton During Tool Calls**
   - What we know: Backend may show "Looking up..." text during tool execution
   - What's unclear: Whether skeleton should show during tool call period
   - Recommendation: Show skeleton only for incomplete component markup, not during tool reasoning

## Sources

### Primary (HIGH confidence)
- AI SDK useChat documentation - https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat
- AI SDK stopping streams - https://ai-sdk.dev/docs/advanced/stopping-streams
- Existing project code: `/root/wks/stream-gen-ui/frontend/app/flowtoken/page.tsx` (backend integration pattern)
- Existing project code: `/root/wks/stream-gen-ui/backend/main.py` (marker API)
- Existing project code: `/root/wks/stream-gen-ui/frontend/components/llm-ui/LLMUIRenderer.tsx` (lookBack pattern)

### Secondary (MEDIUM confidence)
- Sonner GitHub - https://github.com/emilkowalski/sonner
- llm-ui documentation - https://llm-ui.com/docs/llm-output-hook
- Streamdown GitHub - https://github.com/vercel/streamdown

### Tertiary (LOW confidence)
- WebSearch results on scroll jank - requestAnimationFrame patterns (needs validation if used)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project or well-documented
- Architecture: HIGH - Pattern exists in flowtoken page, just needs replication
- Pitfalls: MEDIUM - Some based on code review, some from general streaming experience
- Performance investigation: LOW - Root cause unknown, needs profiling

**Research date:** 2026-01-21
**Valid until:** 30 days (stable libraries, no major version changes expected)
