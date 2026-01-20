# Story 1.6: Header Navigation Structure

Status: ready-for-dev

## Story

As an **evaluator**,
I want **navigation tabs in the header**,
so that **I can switch between implementations**.

## Acceptance Criteria

1. **Given** I am on any page **When** I view the header **Then** I see tabs for FlowToken, llm-ui, and Streamdown **And** the current route is visually indicated (active tab state)

2. **Given** I click a tab **When** navigation occurs **Then** I am taken to that implementation's page **And** the URL updates to reflect the current route

3. **Given** the header is rendered **When** I view its styling **Then** it uses Neuraflow navy background (#1E3A5F) **And** follows the UX design specification for tab styling

4. **Given** I am on any route **When** I want to compare implementations **Then** switching tabs is instant with no loading state

## Tasks / Subtasks

- [ ] Task 1: Enhance Header component with navigation tabs (AC: #1, #2, #3)
  - [ ] Update `components/shared/Header.tsx` with tab navigation
  - [ ] Add tabs for: FlowToken (`/flowtoken`), llm-ui (`/llm-ui`), Streamdown (`/streamdown`)
  - [ ] Implement active tab state detection using `usePathname()` from Next.js
  - [ ] Style inactive tabs: transparent background, white text at 70% opacity
  - [ ] Style active tab: white background (#FFFFFF), navy text (#1E3A5F)
  - [ ] Style hover state: white text at 100% opacity
  - [ ] Ensure header has Neuraflow navy background (#1E3A5F)
  - [ ] Use `Link` component from `next/link` for client-side navigation

- [ ] Task 2: Create Header navigation tests (AC: #1, #2, #3, #4)
  - [ ] Update/enhance `components/shared/Header.test.tsx`
  - [ ] Test all three tabs render with correct labels
  - [ ] Test active tab state applies correct styling for each route
  - [ ] Test tabs are clickable links with correct href values
  - [ ] Test header has correct navy background color

- [ ] Task 3: Implement responsive tab behavior (AC: #1)
  - [ ] Ensure tabs are horizontally scrollable on mobile if needed
  - [ ] Maintain touch targets of at least 44x44px
  - [ ] Test at mobile, tablet, and desktop breakpoints

- [ ] Task 4: Add accessibility support (AC: #1, #2)
  - [ ] Add `aria-current="page"` to active tab
  - [ ] Ensure tabs have proper focus indicators (2px blue ring)
  - [ ] Support keyboard navigation with Tab key between tabs
  - [ ] Add appropriate ARIA labels

- [ ] Task 5: Create placeholder pages for other routes (AC: #2)
  - [ ] Verify `app/llm-ui/page.tsx` exists or create placeholder
  - [ ] Verify `app/streamdown/page.tsx` exists or create placeholder
  - [ ] Ensure all routes render with Header component

- [ ] Task 6: Verify integration and run tests (AC: #1, #2, #3, #4)
  - [ ] Run `npm run build` - no TypeScript errors
  - [ ] Run `npm run lint` - no ESLint warnings
  - [ ] Run `npm test` - all tests pass
  - [ ] Manual testing: verify tab navigation between all routes
  - [ ] Manual testing: verify active state updates correctly
  - [ ] Manual testing: verify styling matches UX specification

## Dev Notes

### Critical Architecture Requirements

**Header Design (from UX Specification)**

The Header follows Direction A - Compact Header design:
- Fixed position at top
- 56px height
- Neuraflow navy background (#1E3A5F)
- Center: Implementation tabs (FlowToken | llm-ui | Streamdown)
- Right: Space reserved for "View Raw" toggle (Story 3.1)

**Tab Styling (from UX Specification)**

| State | Background | Text Color | Other |
|-------|------------|------------|-------|
| Inactive | transparent | `#94A3B8` (70% white) | - |
| Active | `#FFFFFF` | `#1E3A5F` | - |
| Hover | transparent | `#FFFFFF` | Cursor pointer |
| Focus | transparent | varies | 2px blue focus ring |

**Route Structure (from Architecture)**

```
app/
├── flowtoken/
│   └── page.tsx    ← Implemented in Story 1.5
├── llm-ui/
│   └── page.tsx    ← Placeholder exists, Epic 2 implementation
└── streamdown/
    └── page.tsx    ← Placeholder exists, Epic 2 implementation
```

### Existing Header Component Analysis

The Header component exists at `components/shared/Header.tsx`. It currently:
- Accepts `currentRoute` prop
- Has basic structure with navy background
- Needs enhancement for full tab navigation

**Required Updates:**
1. Replace `currentRoute` prop with `usePathname()` hook for automatic detection
2. Add navigation tabs with proper styling
3. Implement active state logic
4. Add accessibility attributes

### Implementation Pattern (REQUIRED)

```typescript
// components/shared/Header.tsx
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

import { cn } from '@/lib/utils';

interface NavTab {
  label: string;
  href: string;
}

const NAV_TABS: NavTab[] = [
  { label: 'FlowToken', href: '/flowtoken' },
  { label: 'llm-ui', href: '/llm-ui' },
  { label: 'Streamdown', href: '/streamdown' },
];

export function Header(): ReactElement {
  const pathname = usePathname();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50",
        "h-14 bg-[#1E3A5F]",
        "flex items-center justify-center"
      )}
    >
      <nav className="flex items-center gap-1" role="navigation" aria-label="Implementation navigation">
        {NAV_TABS.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E3A5F]",
                isActive
                  ? "bg-white text-[#1E3A5F]"
                  : "text-white/70 hover:text-white"
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
```

### Design Tokens (from UX Spec)

| Token | Value | Usage |
|-------|-------|-------|
| Header Navy | `#1E3A5F` | Header background |
| Header Height | `56px` (`h-14`) | Fixed header height |
| Active Tab BG | `#FFFFFF` | Active tab background |
| Active Tab Text | `#1E3A5F` | Active tab text |
| Inactive Tab Text | `#94A3B8` (`text-white/70`) | Inactive tab text |
| Border Radius | `8px` (`rounded-lg`) | Tab corners |
| Focus Ring | `#3B82F6` | Focus indicator |

### Import Order Standard (MUST FOLLOW)

1. 'use client' directive
2. React/Next.js imports (usePathname, Link)
3. Third-party libraries (none needed)
4. Internal components (@/components)
5. Utilities (@/lib)
6. Types (use `import type`)

### Previous Story Learnings (1.5 FlowToken Implementation)

**Key Patterns Established:**
- Use `'use client'` directive for components with hooks
- Named exports only (no default exports)
- Co-located tests with source files
- Use `cn()` utility for conditional Tailwind classes
- Explicit return types on all exported functions

**FlowToken Page Integration:**
- Header is already integrated in `app/flowtoken/page.tsx`
- Uses `<Header currentRoute="/flowtoken" />` pattern
- After this story, Header will auto-detect route via `usePathname()`

**API Route Considerations:**
- Different routes use `?format={flowtoken|llm-ui|streamdown}` query param
- Each page must pass correct format to useChat API
- This story focuses on navigation only; format handling is route-specific

### Git Intelligence

Recent commits show consistent pattern:
1. Implement feature component with tests
2. Run build and lint verification
3. Complete code review
4. Update sprint status

Recent relevant commits:
- `59f1955` feat: finalize FlowToken implementation
- `bb93133` feat: Implement FlowTokenRenderer component
- `8ddce7f` feat: complete chat UI implementation

### Project Structure Notes

**Files to Modify:**
- `components/shared/Header.tsx` - Add full tab navigation
- `components/shared/Header.test.tsx` - Add/enhance tests

**Files to Verify/Create (if missing):**
- `app/llm-ui/page.tsx` - Placeholder page
- `app/streamdown/page.tsx` - Placeholder page

**Existing Components to Use:**
- `cn()` utility from `@/lib/utils`
- `Link` from `next/link`

### Accessibility Requirements

| Element | Requirement |
|---------|-------------|
| Navigation | `role="navigation"` with `aria-label` |
| Active tab | `aria-current="page"` |
| All tabs | Keyboard navigable (Tab key) |
| Focus state | Visible 2px blue focus ring |
| Touch targets | Minimum 44x44px |

### Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Desktop (1024px+) | Tabs centered, comfortable spacing |
| Tablet (768-1023px) | Same layout, slightly reduced padding |
| Mobile (<768px) | Tabs scrollable if needed, maintained touch targets |

### Anti-Patterns to Avoid

- **DO NOT** use `router.push()` for tab navigation - use `Link` component
- **DO NOT** pass `currentRoute` as prop - detect with `usePathname()`
- **DO NOT** forget `'use client'` directive when using hooks
- **DO NOT** use string concatenation for Tailwind classes - use `cn()`
- **DO NOT** use default exports for components
- **DO NOT** forget accessibility attributes (aria-current, aria-label)
- **DO NOT** use inline styles - use Tailwind classes

### Testing Strategy

**Unit Tests (Header):**
- Test all three tabs render with correct labels
- Test tabs have correct href values
- Test active state styling for each route (mock usePathname)
- Test accessibility attributes present
- Test focus styles applied

**Integration Tests:**
- Test navigation between routes works
- Test URL updates on navigation
- Test active state updates after navigation

### Performance Considerations

1. **Client-side navigation:** Use Next.js `Link` for instant transitions
2. **No loading states:** Tab switches should be instant (pre-rendered pages)
3. **Minimal re-renders:** Active state computed from pathname, not local state

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.6: Header Navigation Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Frontend Architecture]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Structure]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Design Direction Decision]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Navigation Patterns]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Tab Styling]
- [Source: _bmad-output/project-context.md#React Rules]
- [Source: _bmad-output/project-context.md#TypeScript Rules]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List
