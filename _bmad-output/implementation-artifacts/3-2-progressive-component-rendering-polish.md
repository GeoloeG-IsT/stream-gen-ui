# Story 3.2: Progressive Component Rendering Polish

Status: ready-for-dev

## Story

As an **evaluator**,
I want **smooth skeleton-to-complete transitions on custom components**,
so that **the streaming experience feels polished and production-ready**.

## Acceptance Criteria

1. **Given** a custom component tag is detected in the stream **When** the skeleton appears **Then** it renders within 100ms of tag detection **And** the skeleton has a shimmer animation

2. **Given** props are streaming into the component **When** each prop value completes **Then** that field fades in with 150ms ease transition **And** there is no layout shift or reflow

3. **Given** the component tag closes **When** the component transitions to complete state **Then** a subtle shadow appears (200ms ease) **And** all interactive elements become clickable

## Tasks / Subtasks

- [ ] Task 1: Create skeleton component variants for ContactCard and CalendarEvent (AC: #1)
  - [ ] Create `components/shared/ContactCardSkeleton.tsx` with shimmer animation
  - [ ] Create `components/shared/CalendarEventSkeleton.tsx` with shimmer animation
  - [ ] Match exact dimensions of completed components to prevent layout shift
  - [ ] Add shimmer animation using CSS keyframes (1.5s loop, linear)
  - [ ] Create tests for skeleton rendering

- [ ] Task 2: Implement progressive prop animation system (AC: #2)
  - [ ] Create `components/shared/AnimatedField.tsx` wrapper for field fade-in
  - [ ] Use 150ms ease-out transition for opacity
  - [ ] Ensure no layout shift by using fixed dimensions or opacity-only transitions
  - [ ] Add `prefers-reduced-motion` support per UX spec
  - [ ] Create tests for animation behavior

- [ ] Task 3: Add completion state transition to components (AC: #3)
  - [ ] Update `ContactCard.tsx` to accept `isComplete` prop
  - [ ] Update `CalendarEvent.tsx` to accept `isComplete` prop
  - [ ] Add shadow transition (200ms ease-out) on completion
  - [ ] Ensure interactive elements only receive click handlers when isComplete=true
  - [ ] Update component tests for completion state

- [ ] Task 4: Update FlowToken renderer for progressive rendering (AC: #1, #2, #3)
  - [ ] Detect tag open vs. tag close states during streaming
  - [ ] Show skeleton immediately on tag detection (<100ms)
  - [ ] Pass partial props as they stream in
  - [ ] Trigger completion state on tag close
  - [ ] Update FlowTokenRenderer tests

- [ ] Task 5: Update llm-ui renderer for progressive rendering (AC: #1, #2, #3)
  - [ ] Detect delimiter start vs. JSON parse completion
  - [ ] Show skeleton immediately on delimiter detection
  - [ ] Parse and pass props incrementally if possible (may need full JSON)
  - [ ] Trigger completion state when delimiter closes
  - [ ] Update LLMUIRenderer tests

- [ ] Task 6: Update Streamdown renderer for progressive rendering (AC: #1, #2, #3)
  - [ ] Integrate with custom XML parser for tag state detection
  - [ ] Show skeleton on opening tag detection
  - [ ] Pass props progressively as attributes parse
  - [ ] Trigger completion state on closing tag
  - [ ] Update StreamdownRenderer tests

- [ ] Task 7: Integration testing and polish (AC: #1, #2, #3)
  - [ ] Run `npm run build` - no TypeScript errors
  - [ ] Run `npm run lint` - no ESLint warnings
  - [ ] Run `npm test` - all tests pass (currently 259)
  - [ ] Manual verification: test progressive rendering on each route
  - [ ] Verify shimmer animation displays correctly
  - [ ] Verify prop fade-in works without layout shift
  - [ ] Verify shadow transition on completion
  - [ ] Test `prefers-reduced-motion` disables animations

## Dev Notes

### Story Context from Epics

From Epic 3: Evaluation Tools & Production Polish - this story delivers NFR3 (Progressive component rendering: skeleton -> populated -> interactive). The goal is to make the streaming experience feel polished and production-ready for evaluators.

**Key Value Proposition:** Progressive rendering transforms a "loading" moment into a **delight moment**. The skeleton-to-populated transition should feel satisfying, almost magical. This is the emotional climax of the demo experience.

### Technical Architecture

**Component Structure (changes required):**
```
components/
├── shared/
│   ├── ContactCard.tsx           # MODIFY: Add isComplete prop, shadow transition
│   ├── ContactCardSkeleton.tsx   # NEW: Shimmer skeleton
│   ├── CalendarEvent.tsx         # MODIFY: Add isComplete prop, shadow transition
│   ├── CalendarEventSkeleton.tsx # NEW: Shimmer skeleton
│   ├── AnimatedField.tsx         # NEW: Field fade-in wrapper
│   └── *.test.tsx                # UPDATE: All related tests
├── flowtoken/
│   └── FlowTokenRenderer.tsx     # MODIFY: Progressive rendering support
├── llm-ui/
│   └── LLMUIRenderer.tsx         # MODIFY: Progressive rendering support
└── streamdown/
    └── StreamdownRenderer.tsx    # MODIFY: Progressive rendering support
types/
└── index.ts                      # MODIFY: Add isComplete to component props
```

### UX Specification Reference

From `ux-design-specification.md`:

**Streaming & Loading States:**
| State | Visual | Timing |
|-------|--------|--------|
| Component Skeleton | Gray placeholder + shimmer animation | <100ms from tag detection |
| Component Partial | Fields fade in as props arrive | 150ms per field |
| Component Complete | Shadow appears, fully interactive | Instant on closing tag |

**Transition Timing:**
| Element | Duration | Easing |
|---------|----------|--------|
| Skeleton shimmer | 1.5s loop | linear |
| Prop fade-in | 150ms | ease-out |
| Component completion | 200ms | ease-out |

**Motion Reduction (CRITICAL):**
```css
@media (prefers-reduced-motion: reduce) {
  animation: none;
  transition: none;
}
```

### Architecture Compliance

**From project-context.md:**
- TypeScript strict mode, no `any`
- Explicit return types on exports
- Props: `ComponentNameProps` pattern
- Use `cn()` for conditional classes
- `prefers-reduced-motion` must be respected

**File Naming:**
- Components: PascalCase (`ContactCardSkeleton.tsx`)
- Tests: Co-located (`ContactCardSkeleton.test.tsx`)

### Library/Framework Requirements

**Current Implementation:**
- FlowToken: Uses `AnimatedMarkdown` with `customComponents` prop
- llm-ui: Uses delimiter-based blocks with `useLLMOutput` hook
- Streamdown: Uses custom XML parser with `StreamdownRenderer`

**Animation Libraries:**
- Use Tailwind CSS animations (no additional deps)
- CSS `@keyframes` for shimmer
- CSS `transition` for fade-in and shadow

**Shimmer Animation Pattern:**
```tsx
// Using Tailwind's animate-pulse or custom keyframes
const shimmer = `
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
`;
// Or use: className="animate-pulse" with bg-gray-200
```

### File Structure Requirements

**Test Coverage Required:**
1. Skeleton components render with correct dimensions
2. Shimmer animation is applied
3. AnimatedField fades in correctly
4. isComplete prop toggles shadow and interactivity
5. Progressive rendering sequence works per renderer
6. `prefers-reduced-motion` disables animations

### Implementation Patterns

**Skeleton Component Pattern:**
```tsx
export interface ContactCardSkeletonProps {
  className?: string;
}

export function ContactCardSkeleton({
  className
}: ContactCardSkeletonProps): ReactElement {
  return (
    <span
      className={cn(
        "flex flex-col gap-3 my-3 p-4 rounded-xl border border-gray-200",
        "animate-pulse",
        className
      )}
      role="img"
      aria-label="Loading contact card"
    >
      {/* Avatar placeholder */}
      <span className="flex items-center gap-3">
        <span className="w-10 h-10 rounded-full bg-gray-200" />
        <span className="h-4 w-32 bg-gray-200 rounded" />
      </span>
      {/* Fields placeholders */}
      <span className="flex flex-col gap-2">
        <span className="h-3 w-48 bg-gray-200 rounded" />
        <span className="h-3 w-36 bg-gray-200 rounded" />
      </span>
    </span>
  );
}
```

**AnimatedField Pattern:**
```tsx
export interface AnimatedFieldProps {
  children: ReactNode;
  isVisible: boolean;
}

export function AnimatedField({
  children,
  isVisible
}: AnimatedFieldProps): ReactElement {
  return (
    <span
      className={cn(
        "transition-opacity duration-150 ease-out",
        "motion-reduce:transition-none",
        isVisible ? "opacity-100" : "opacity-0"
      )}
    >
      {children}
    </span>
  );
}
```

**Completion State Pattern:**
```tsx
// In ContactCard
export interface ContactCardProps {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
  isComplete?: boolean;  // NEW
}

// Shadow transition on completion
className={cn(
  "flex flex-col gap-3 my-3 p-4 rounded-xl border",
  "transition-shadow duration-200 ease-out",
  "motion-reduce:transition-none",
  isComplete
    ? "shadow-md border-blue-100"
    : "shadow-sm border-gray-200"
)}

// Conditional interactivity
{phone && (
  <a
    href={isComplete ? `tel:${phone}` : undefined}
    onClick={isComplete ? undefined : (e) => e.preventDefault()}
    className={cn(
      "flex items-center gap-2 text-sm",
      isComplete ? "text-blue-500 hover:underline cursor-pointer" : "text-gray-400 cursor-default"
    )}
  >
    ...
  </a>
)}
```

### Previous Story Learnings

From Story 3.1 (View Raw Debug Toggle):
- Created ViewRawContext for global state - similar pattern may work for streaming state
- All 259 tests passed after implementation
- Pattern: Small, focused changes with comprehensive test coverage
- Updated types/index.ts for new props

From Story 2.4 (Enhanced Navigation UX):
- Keep changes minimal and focused on acceptance criteria
- Verify visual appearance matches UX specification
- Run build, lint, and test validation before completing

### Git Intelligence

Recent commits show pattern:
- `2f09c1c` - Story 3.1 complete with ViewRawContext
- `7a47c88` - Minimal color class updates for UX spec compliance

**Pattern:** Test-first approach, comprehensive coverage, UX spec compliance.

### Critical Implementation Notes

**Layout Shift Prevention (CRITICAL):**
- Skeleton MUST match completed component dimensions exactly
- Use `opacity` transitions, NOT `display` or `height`
- Reserve space for optional fields even when empty

**Tag Detection Timing (<100ms):**
- FlowToken: Hook into `customComponents` render
- llm-ui: Hook into delimiter detection
- Streamdown: Hook into XML parser state

**Interactivity Safety:**
- Links should NOT be clickable during streaming
- Use `href={isComplete ? url : undefined}`
- Prevent default on click if incomplete

### Testing Strategy

**Unit Tests:**
- Skeleton renders with shimmer class
- AnimatedField transitions opacity
- Component shadow changes on isComplete
- Links are non-interactive when incomplete

**Integration Tests:**
- Progressive rendering sequence per renderer
- No layout shift during transitions
- `prefers-reduced-motion` disables animations

### Anti-Patterns to Avoid

- **DO NOT** use `setTimeout` for skeleton display - must be synchronous
- **DO NOT** change dimensions during transitions - causes layout shift
- **DO NOT** forget `motion-reduce:transition-none` - accessibility requirement
- **DO NOT** make links clickable before completion - confuses users
- **DO NOT** use `any` type - use proper TypeScript types
- **DO NOT** add new dependencies - use Tailwind animations only

### Verification Checklist

After implementation:
- [ ] Skeleton appears within 100ms (visual timing)
- [ ] Shimmer animation loops at 1.5s
- [ ] Props fade in with 150ms ease-out
- [ ] No layout shift during prop population
- [ ] Shadow appears on completion (200ms ease-out)
- [ ] Links only clickable when isComplete=true
- [ ] `prefers-reduced-motion` disables all animations
- [ ] Works consistently across all three renderers
- [ ] All existing tests pass
- [ ] New tests cover all acceptance criteria
- [ ] Build succeeds, lint passes

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.2: Progressive Component Rendering Polish]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Streaming & Loading States]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Transition Timing]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Responsive Design & Accessibility]
- [Source: components/shared/ContactCard.tsx - current implementation]
- [Source: components/shared/CalendarEvent.tsx - current implementation]
- [Source: components/flowtoken/FlowTokenRenderer.tsx - current implementation]
- [Source: types/index.ts - type definitions]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

