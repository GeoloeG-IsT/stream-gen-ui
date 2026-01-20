# Story 3.1: View Raw Debug Toggle

Status: ready-for-dev

## Story

As an **evaluator**,
I want **a "View Raw" toggle that shows the actual streamed markup**,
so that **I can understand what each parser is receiving and build confidence in the architecture**.

## Acceptance Criteria

1. **Given** the header contains a "View Raw" toggle **When** I toggle it ON **Then** each message displays the raw streamed markup alongside (or below) the rendered output **And** raw output uses monospace font (JetBrains Mono) **And** raw output has a distinct visual container (dark background or border)

2. **Given** the toggle is ON and content is streaming **When** new tokens arrive **Then** the raw output updates in real-time alongside the rendered view

3. **Given** I switch between implementation routes **When** View Raw is toggled ON **Then** the toggle state persists across route changes

## Tasks / Subtasks

- [ ] Task 1: Create RawOutputView component for displaying raw markup (AC: #1)
  - [ ] Create `components/shared/RawOutputView.tsx` with monospace font styling (JetBrains Mono via `font-mono` Tailwind class)
  - [ ] Add dark background container (`bg-gray-800 text-gray-100`) with subtle border
  - [ ] Support isStreaming prop for cursor animation during streaming
  - [ ] Create co-located test file `components/shared/RawOutputView.test.tsx`

- [ ] Task 2: Implement global ViewRaw context for cross-route state persistence (AC: #3)
  - [ ] Create `contexts/ViewRawContext.tsx` with React Context and Provider
  - [ ] Store viewRaw boolean state that persists across route changes
  - [ ] Add `useViewRaw()` hook for consuming components
  - [ ] Wrap app in provider via `app/layout.tsx`

- [ ] Task 3: Add View Raw toggle to Header component (AC: #1, #3)
  - [ ] Add toggle switch to right side of Header (after navigation tabs)
  - [ ] Use shadcn/ui Switch or simple toggle button pattern
  - [ ] Connect to ViewRawContext for state management
  - [ ] Match UX spec: Gray track when off, blue (#3B82F6) when on
  - [ ] Ensure 44px touch target minimum
  - [ ] Update Header tests

- [ ] Task 4: Update MessageBubble to display raw output when enabled (AC: #1, #2)
  - [ ] Add optional `rawContent` prop to MessageBubble
  - [ ] Conditionally render RawOutputView below rendered content when viewRaw is ON
  - [ ] Ensure raw content updates in real-time during streaming
  - [ ] Update MessageBubble tests for dual-display mode

- [ ] Task 5: Update all page implementations to pass raw content (AC: #2)
  - [ ] Update `/flowtoken/page.tsx` to pass rawContent to MessageBubble
  - [ ] Update `/llm-ui/page.tsx` to pass rawContent to MessageBubble
  - [ ] Update `/streamdown/page.tsx` to pass rawContent to MessageBubble

- [ ] Task 6: Add integration tests and finalize (AC: #1, #2, #3)
  - [ ] Run `npm run build` - no TypeScript errors
  - [ ] Run `npm run lint` - no ESLint warnings
  - [ ] Run `npm test` - all tests pass
  - [ ] Manual verification: toggle raw output, verify persistence across routes
  - [ ] Verify real-time updates during streaming

## Dev Notes

### Story Context from Epics

From Story 3.1 in epics.md - this is the first story in Epic 3: Evaluation Tools & Production Polish. The goal is to provide evaluators with debugging tools to understand what each parser is receiving.

**Key Value Proposition:** The "View Raw" toggle is a **trust-building feature**, not just debugging. Showing the actual markup removes skepticism and helps evaluators understand the differences between implementations.

### Technical Architecture

**Component Structure:**
```
components/
├── shared/
│   ├── RawOutputView.tsx        # NEW: Raw markup display component
│   ├── RawOutputView.test.tsx   # NEW: Tests
│   ├── MessageBubble.tsx        # MODIFY: Add rawContent prop and dual display
│   ├── Header.tsx               # MODIFY: Add View Raw toggle
│   └── Header.test.tsx          # MODIFY: Add toggle tests
contexts/
└── ViewRawContext.tsx           # NEW: Global state for toggle persistence
app/
├── layout.tsx                   # MODIFY: Add ViewRawProvider
├── flowtoken/page.tsx           # MODIFY: Pass rawContent
├── llm-ui/page.tsx              # MODIFY: Pass rawContent
└── streamdown/page.tsx          # MODIFY: Pass rawContent
types/
└── index.ts                     # MODIFY: Add RawOutputViewProps, update MessageBubbleProps
```

### UX Specification Reference

From `ux-design-specification.md`:

**Debug Features:**
- "View Raw Output" toggle in header
- Shows actual streamed markup alongside rendered output
- Helps evaluators understand what each parser is receiving

**Toggle Styling (from UX Consistency Patterns):**
- Off: Gray track, knob left
- On: Blue track (#3B82F6), knob right
- Transition: 150ms ease
- Persistence: State persists across tab switches

**RawOutputView Styling (from Visual Design Foundation):**
- Monospace font: JetBrains Mono (use Tailwind `font-mono`)
- Code font size: 13px (Body Small)
- Should have distinct container (dark background or border)

**From Typography System:**
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| Code | 13px | 400 | 1.5 |

### Architecture Compliance

**From Architecture Document:**

**TypeScript Standards:**
- Strict mode enabled
- No `any` - use `unknown` + type guards
- Explicit return types on exported functions
- Props: `ComponentNameProps` pattern (no I prefix)
- Inline destructure: `function Foo({ a }: FooProps)`

**Import Organization:**
1. React/Next.js
2. Third-party libs
3. Internal components (@/components)
4. Utilities (@/lib)
5. Types (use `import type`)

**Error Handling Pattern:**
```typescript
// Inline error display for parse errors
{parseError ? (
  <pre className="text-sm text-gray-600">{content}</pre>
) : (
  <ParsedContent blocks={blocks} />
)}
```

### Library/Framework Requirements

**Current Dependencies:**
- Tailwind CSS 4.x with `cn()` utility from `@/lib/utils`
- No additional dependencies needed for this feature
- Use standard React Context API for state management

**Font Stack (from globals.css):**
- `font-mono` maps to system monospace stack (includes JetBrains Mono if installed)
- May need to add JetBrains Mono to font stack for guaranteed consistency

### File Structure Requirements

**File Naming Conventions:**
| File Type | Convention | Example |
|-----------|------------|---------|
| React components | PascalCase | `RawOutputView.tsx` |
| Test files | Same as source + `.test` | `RawOutputView.test.tsx` |
| Context files | PascalCase | `ViewRawContext.tsx` |

### Testing Requirements

**Testing Framework:** Vitest + React Testing Library (already configured)

**Test Coverage Required:**
1. RawOutputView renders content correctly
2. RawOutputView applies monospace styling
3. RawOutputView shows cursor during streaming
4. Header toggle changes context state
5. MessageBubble shows raw output when context is ON
6. MessageBubble hides raw output when context is OFF
7. Context state persists across route changes

### Implementation Patterns

**React Context Pattern:**
```typescript
// contexts/ViewRawContext.tsx
'use client';

import { createContext, useContext, useState } from 'react';
import type { ReactElement, ReactNode } from 'react';

interface ViewRawContextValue {
  viewRaw: boolean;
  setViewRaw: (value: boolean) => void;
}

const ViewRawContext = createContext<ViewRawContextValue | undefined>(undefined);

export function ViewRawProvider({ children }: { children: ReactNode }): ReactElement {
  const [viewRaw, setViewRaw] = useState(false);
  return (
    <ViewRawContext.Provider value={{ viewRaw, setViewRaw }}>
      {children}
    </ViewRawContext.Provider>
  );
}

export function useViewRaw(): ViewRawContextValue {
  const context = useContext(ViewRawContext);
  if (!context) {
    throw new Error('useViewRaw must be used within a ViewRawProvider');
  }
  return context;
}
```

**Toggle Button Pattern (simpler than shadcn/ui Switch):**
```typescript
<button
  onClick={() => setViewRaw(!viewRaw)}
  className={cn(
    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
    'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
    viewRaw ? 'bg-blue-500' : 'bg-gray-300'
  )}
  aria-pressed={viewRaw}
  aria-label="Toggle raw output view"
>
  <span
    className={cn(
      'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
      viewRaw ? 'translate-x-6' : 'translate-x-1'
    )}
  />
</button>
```

### Previous Story Learnings

From Story 2.4 (Enhanced Navigation UX):
- Keep changes minimal and focused on acceptance criteria
- Follow TDD pattern: update tests first if possible
- Document all file changes in Dev Agent Record
- All tests must pass (currently 219 tests in suite)
- Run build, lint, and test validation before completing

From Story 2.3 (Test Content Presets):
- Verify visual appearance matches UX specification
- Cross-browser considerations for CSS features

### Git Intelligence

Recent commit patterns:
- `7a47c88` - Navigation UX: minimal, focused color class update
- `7d21928` - Content presets: added new shared component with tests
- `5a49813` - Streamdown: comprehensive implementation with tests

Pattern: Small, focused commits with comprehensive test coverage.

### Anti-Patterns to Avoid

- **DO NOT** use localStorage for toggle state (Context is sufficient for session)
- **DO NOT** duplicate raw content processing logic across pages (use shared pattern)
- **DO NOT** use `any` type - use proper TypeScript types
- **DO NOT** forget to update MessageBubbleProps in types/index.ts
- **DO NOT** break existing tests - run full test suite before completion

### Verification Checklist

After implementation:
- [ ] RawOutputView renders with monospace font
- [ ] RawOutputView has dark background container
- [ ] RawOutputView updates in real-time during streaming
- [ ] Toggle appears in Header (right side)
- [ ] Toggle uses correct styling (gray off, blue on)
- [ ] Toggle has 44px minimum touch target
- [ ] Toggle state persists across route changes
- [ ] MessageBubble displays both rendered and raw when ON
- [ ] All existing tests pass
- [ ] New tests cover all acceptance criteria
- [ ] Build succeeds, lint passes

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.1: View Raw Debug Toggle]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#UX Consistency Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Visual Design Foundation]
- [Source: components/shared/Header.tsx - current implementation]
- [Source: components/shared/MessageBubble.tsx - current implementation]
- [Source: types/index.ts - type definitions]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

