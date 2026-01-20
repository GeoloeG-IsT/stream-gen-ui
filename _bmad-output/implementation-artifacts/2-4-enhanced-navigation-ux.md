# Story 2.4: Enhanced Navigation UX

Status: ready-for-dev

## Story

As an **evaluator**,
I want **polished tab navigation with clear visual feedback**,
so that **I always know which implementation I'm viewing**.

## Acceptance Criteria

1. **Given** I am viewing any implementation route **When** I look at the header tabs **Then** the active tab has white background with navy text **And** inactive tabs have transparent background with semi-transparent white text **And** tab hover state shows increased opacity

2. **Given** I click a different tab **When** navigation occurs **Then** the transition is instant (no loading state) **And** a fresh chat session starts on the new route **And** the URL updates to reflect the current implementation

## Tasks / Subtasks

- [ ] Task 1: Audit current Header implementation against UX spec (AC: #1)
  - [ ] Review current inactive tab color (`#94A3B8` slate vs spec `rgba(255,255,255,0.7)`)
  - [ ] Verify active/inactive styling matches UX design specification exactly
  - [ ] Document any deviations from spec

- [ ] Task 2: Enhance inactive tab styling for spec compliance (AC: #1)
  - [ ] Update inactive tab text to use `text-white/70` (white at 70% opacity) per UX spec
  - [ ] Update hover state to `hover:text-white` (100% opacity)
  - [ ] Verify visual appearance matches UX design Direction A specification

- [ ] Task 3: Verify navigation behavior works correctly (AC: #2)
  - [ ] Confirm instant tab switching (no loading states, client-side navigation)
  - [ ] Confirm fresh chat session per route (useChat isolated per page)
  - [ ] Confirm URL reflects current implementation (/flowtoken, /llm-ui, /streamdown)

- [ ] Task 4: Update Header component tests (AC: #1, #2)
  - [ ] Update tests for new inactive tab color class (`text-white/70`)
  - [ ] Add/update hover state test for new class
  - [ ] Ensure all existing tests still pass with new styling

- [ ] Task 5: Cross-browser and responsive verification (AC: #1, #2)
  - [ ] Test tab appearance in Chrome, Firefox, Safari
  - [ ] Verify mobile responsiveness (overflow-x-auto works)
  - [ ] Test keyboard navigation between tabs

- [ ] Task 6: Run validation and finalize (AC: #1, #2)
  - [ ] Run `npm run build` - no TypeScript errors
  - [ ] Run `npm run lint` - no ESLint warnings
  - [ ] Run `npm test` - all tests pass
  - [ ] Manual verification: switch between all three tabs, verify visual feedback

## Dev Notes

### Current State Analysis

The Header component at `components/shared/Header.tsx` is already well-implemented with:
- Fixed 56px header with navy background (#1E3A5F) ✅
- Three navigation tabs (FlowToken, llm-ui, Streamdown) ✅
- Active tab: white background, navy text ✅
- Instant navigation via Next.js Link ✅
- ARIA accessibility (aria-current, aria-label) ✅
- Focus-visible styling with blue ring ✅
- 44px minimum touch targets ✅
- Responsive overflow-x-auto ✅

**Minor Enhancement Needed:**
Current inactive tab uses `text-[#94A3B8]` (slate gray) while UX spec calls for:
- Inactive: `rgba(255,255,255,0.7)` (white at 70% opacity)
- Hover: `rgba(255,255,255,1.0)` (white at 100% opacity)

This is a **visual refinement** to match the exact UX specification from Design Direction A.

### UX Specification Reference

From `ux-design-specification.md` (Design Direction A - Compact Header):

```
| Component   | Background  | Border | Text      |
|-------------|-------------|--------|-----------|
| Active Tab  | #FFFFFF     | none   | #1E3A5F   |
| Inactive Tab| transparent | none   | #94A3B8   |  <- Note: This is in the color table
```

However, the **Tab Styling** section specifies:
```
**Tab Styling:**
- Inactive: semi-transparent white text, transparent background
- Active: white background, navy text
- Hover: slightly increased opacity
```

The "semi-transparent white text" suggests using white with opacity rather than a distinct slate color. For consistency with the dark navy header, white text with opacity will appear more visually integrated.

**Decision:** Update to `text-white/70` for better visual harmony with the navy header background.

### Implementation Strategy

**File to Modify:** `components/shared/Header.tsx`

**Current Code (line 44-46):**
```typescript
isActive
  ? 'bg-white text-[#1E3A5F]'
  : 'text-[#94A3B8] hover:text-white'
```

**Updated Code:**
```typescript
isActive
  ? 'bg-white text-[#1E3A5F]'
  : 'text-white/70 hover:text-white'
```

This is a minimal change with clear spec justification.

### Technical Requirements

**From Architecture Document:**
- TypeScript strict mode - no `any` types
- Use `cn()` utility for Tailwind class management
- Follow import order: React → Next.js → Third-party → Internal → Types
- Explicit return types on exported functions

**From Project Context:**
- Named exports only for components
- App Router only
- Test files co-located with source

### Testing Strategy

**Test File:** `components/shared/Header.test.tsx`

Update tests that check for `text-[#94A3B8]` to check for `text-white/70`:

```typescript
// Current tests check for:
expect(llmUiTab).toHaveClass('text-[#94A3B8]');

// Updated tests should check for:
expect(llmUiTab).toHaveClass('text-white/70');
```

**Tests to Update:**
- `shows FlowToken as active when on /flowtoken route`
- `shows llm-ui as active when on /llm-ui route`
- `shows Streamdown as active when on /streamdown route`
- `shows no active tab when on unknown route`
- `applies hover text color class to inactive tabs`

### Anti-Patterns to Avoid

- **DO NOT** change the Header component structure - only update color classes
- **DO NOT** add loading states to navigation - instant switching is a requirement
- **DO NOT** persist chat state across routes - fresh session per route is intentional
- **DO NOT** use arbitrary color values - use Tailwind opacity syntax (`text-white/70`)

### Previous Story Learnings (Story 2.3)

From Test Content Presets implementation:
- Keep changes minimal and focused
- Update tests to match implementation changes
- Verify all existing tests still pass
- Document all modified files in the File List

### Git Intelligence

Recent commits show consistent implementation pattern:
- `7d21928` - Content presets (minimal, focused changes)
- `728679a` - Header navigation structure (original implementation)

Pattern: Small, focused changes with comprehensive test updates.

### File Structure

```
components/
└── shared/
    ├── Header.tsx        # MODIFY: Update inactive tab color class
    └── Header.test.tsx   # MODIFY: Update test expectations for new color class
```

### Verification Checklist

After implementation:
- [ ] Active tab: white background (#FFFFFF), navy text (#1E3A5F)
- [ ] Inactive tabs: transparent background, white text at 70% opacity
- [ ] Hover on inactive: white text at 100% opacity
- [ ] Click tab → instant navigation (no loading)
- [ ] URL changes to match route
- [ ] Fresh chat on each route
- [ ] All 290+ tests pass
- [ ] Build succeeds
- [ ] Lint passes

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 2.4: Enhanced Navigation UX]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design Direction Decision]
- [Source: components/shared/Header.tsx - current implementation]
- [Source: components/shared/Header.test.tsx - current tests]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

- 2026-01-20: Story created with comprehensive developer context (create-story workflow)
