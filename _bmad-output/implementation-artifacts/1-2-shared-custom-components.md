# Story 1.2: Shared Custom Components

Status: done

## Story

As an **evaluator**,
I want **polished ContactCard and CalendarEvent components**,
so that **I can see how custom UI renders within the chat stream**.

## Acceptance Criteria

1. **Given** the component library is implemented **When** ContactCard receives name, email, and phone props **Then** it displays a styled card with the contact information **And** phone number is a clickable tel: link **And** email is a clickable mailto: link **And** the card follows Neuraflow brand styling (12px radius, blue links, shadow)

2. **Given** the CalendarEvent component receives title, date, time, and location props **When** rendered **Then** it displays a styled event card with all information **And** the card follows the same visual design system

## Tasks / Subtasks

- [x] Task 1: Create ContactCard component (AC: #1)
  - [x] Create `components/shared/ContactCard.tsx` with proper TypeScript types
  - [x] Implement ContactCardProps interface: name (required), email (optional), phone (optional)
  - [x] Add tel: link for phone number with Phone icon from lucide-react
  - [x] Add mailto: link for email with Mail icon from lucide-react
  - [x] Apply Neuraflow styling: 12px border-radius, #3B82F6 blue links, shadow-md
  - [x] Use cn() utility for all conditional class management
  - [x] Export as named export (not default)

- [x] Task 2: Create CalendarEvent component (AC: #2)
  - [x] Create `components/shared/CalendarEvent.tsx` with proper TypeScript types
  - [x] Implement CalendarEventProps interface: title (required), date (required), time (optional), location (optional)
  - [x] Add Calendar icon from lucide-react for visual indicator
  - [x] Add MapPin icon for location if provided
  - [x] Apply consistent Neuraflow styling matching ContactCard
  - [x] Use cn() utility for all conditional class management
  - [x] Export as named export (not default)

- [x] Task 3: Add shared type definitions (AC: #1, #2)
  - [x] Add ContactCardProps to types/index.ts
  - [x] Add CalendarEventProps to types/index.ts
  - [x] Ensure all props use explicit types (no `any`)

- [x] Task 4: Verify components build and lint (AC: #1, #2)
  - [x] Run `npm run build` - no TypeScript errors
  - [x] Run `npm run lint` - no ESLint warnings
  - [x] Verify components can be imported from @/components/shared

## Dev Notes

### Critical Architecture Requirements

**IMPORTANT: These components will be rendered inline within streaming chat messages. They must work in both "skeleton" (streaming) and "complete" states in later stories.**

### Component Design Specifications

**ContactCard Visual Requirements:**
```
┌────────────────────────────────────────┐
│  [Avatar Circle]  Name                 │
│                                        │
│  📧 email@example.com (blue, clickable)│
│  📞 +1-555-123-4567 (blue, clickable)  │
└────────────────────────────────────────┘
```

- Background: `#FFFFFF` (white)
- Border: `1px solid #E5E7EB`
- Border radius: `12px`
- Shadow: `shadow-md` (0 4px 6px rgba(0,0,0,0.07))
- Padding: `16px`
- Link color: `#3B82F6` (Primary Blue)
- Link hover: underline

**CalendarEvent Visual Requirements:**
```
┌────────────────────────────────────────┐
│  📅 Event Title                        │
│                                        │
│  🗓️ January 20, 2026 at 2:00 PM       │
│  📍 123 Main Street, City             │
└────────────────────────────────────────┘
```

- Same container styling as ContactCard
- Date formatting: human-readable (not ISO)
- Time: 12-hour format with AM/PM

### Props Interfaces (REQUIRED)

```typescript
// types/index.ts
export interface ContactCardProps {
  name: string;
  email?: string;
  phone?: string;
}

export interface CalendarEventProps {
  title: string;
  date: string;      // ISO date string or human-readable
  time?: string;     // e.g., "2:00 PM" or "14:00"
  location?: string;
}
```

### Component Implementation Pattern (REQUIRED)

```typescript
// components/shared/ContactCard.tsx
import { Mail, Phone } from 'lucide-react';

import { cn } from '@/lib/utils';

import type { ContactCardProps } from '@/types';

export function ContactCard({ name, email, phone }: ContactCardProps): JSX.Element {
  return (
    <div className={cn(
      "flex flex-col gap-2 p-4",
      "bg-white rounded-xl border border-gray-200 shadow-md"
    )}>
      {/* Implementation here */}
    </div>
  );
}
```

### Lucide React Icons to Use

| Icon | Import | Usage |
|------|--------|-------|
| Mail | `import { Mail } from 'lucide-react'` | Email link |
| Phone | `import { Phone } from 'lucide-react'` | Phone link |
| Calendar | `import { Calendar } from 'lucide-react'` | Event header |
| MapPin | `import { MapPin } from 'lucide-react'` | Location |
| Clock | `import { Clock } from 'lucide-react'` | Time (optional) |

Icon sizing: `className="w-4 h-4"` for inline icons

### Neuraflow Design Tokens (from UX Spec)

| Token | Value | Usage |
|-------|-------|-------|
| Primary Blue | `#3B82F6` | Links, actionable elements |
| Border | `#E5E7EB` | Card borders |
| Text Primary | `#374151` | Main text |
| Text Secondary | `#6B7280` | Metadata |
| Border Radius | `12px` | All containers (`rounded-xl`) |
| Shadow | `shadow-md` | Cards |

### Import Order Standard (MUST FOLLOW)

1. React/Next.js imports (none needed for these components)
2. Third-party libraries (lucide-react)
3. Internal components (@/components) - none needed
4. Utilities (@/lib) - cn()
5. Types (use `import type`)

### Anti-Patterns to Avoid

- ❌ `export default` - use named exports only
- ❌ `any` type - all props must be typed
- ❌ String concatenation for classes - use cn()
- ❌ `IContactCardProps` naming - use `ContactCardProps`
- ❌ Missing return type on function - always include `: JSX.Element`
- ❌ Inline styles - use Tailwind classes only

### Previous Story Learnings (from 1.1)

From Story 1.1 implementation:
- **Use `--legacy-peer-deps`** when installing packages due to @llm-ui/react React 18 vs 19 conflict
- **layout.tsx and page.tsx use `export default`** - this is a Next.js App Router requirement, not an anti-pattern
- **Static className strings are fine** - the anti-pattern is specifically about string concatenation for conditionals
- **Always use cn() for dynamic/conditional classes**

### Project Structure Notes

**File Locations:**
- ContactCard: `components/shared/ContactCard.tsx`
- CalendarEvent: `components/shared/CalendarEvent.tsx`
- Types: `types/index.ts` (update existing file)

**Directory already exists:** `components/shared/` was created in Story 1.1

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 1.2: Shared Custom Components]
- [Source: _bmad-output/planning-artifacts/architecture.md#Component Structure]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#ContactCard]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#CalendarEvent]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Color System]
- [Source: _bmad-output/project-context.md#TypeScript Rules]
- [Source: _bmad-output/project-context.md#File Organization]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Initial build failed with `JSX.Element` return type not recognized in React 19
- Fixed by using `ReactElement` from 'react' import type

### Completion Notes List

- Created ContactCard component with avatar placeholder, clickable email (mailto:) and phone (tel:) links
- Created CalendarEvent component with calendar icon header and optional location display
- Both components use consistent Neuraflow styling: rounded-xl (12px), shadow-md, gray-200 border
- Used cn() utility for all class management
- All props interfaces defined in types/index.ts with explicit types (no any)
- Components follow project import order standard: React types -> third-party -> internal -> utils -> types
- Build and lint pass successfully

### File List

- `components/shared/ContactCard.tsx` (created, updated with full UX spec props)
- `components/shared/CalendarEvent.tsx` (created, updated with full UX spec props)
- `components/shared/ContactCard.test.tsx` (created - 10 tests)
- `components/shared/CalendarEvent.test.tsx` (created - 11 tests)
- `types/index.ts` (modified - full prop interfaces per UX spec)
- `vitest.config.ts` (created - test configuration)
- `vitest.setup.ts` (created - test setup)
- `package.json` (modified - added test dependencies and scripts)

### Change Log

- 2026-01-20: Implemented ContactCard and CalendarEvent components with Neuraflow styling (Story 1.2)
- 2026-01-20: Code review fixes - Added missing props (address, avatar, isComplete for ContactCard; startTime, endTime, description, isComplete for CalendarEvent), ARIA labels, Clock icon for time, comprehensive test suite (21 tests)

## Senior Developer Review (AI)

**Review Date:** 2026-01-20
**Reviewer:** Claude Opus 4.5 (code-review workflow)
**Outcome:** Approved (after fixes)

### Issues Found and Resolved

| ID | Severity | Status | Description |
|----|----------|--------|-------------|
| H1 | HIGH | [x] Fixed | ContactCard missing address, avatar, isComplete props per UX spec |
| H2 | HIGH | [x] Fixed | CalendarEvent missing startTime/endTime, description, isComplete props |
| H3 | HIGH | [x] Fixed | No test coverage - added 21 tests with Vitest |
| M1 | MEDIUM | [x] Fixed | Added ARIA labels to all interactive elements |
| M2 | MEDIUM | [x] Noted | text-blue-500 is equivalent to #3B82F6 - acceptable |
| M3 | MEDIUM | [x] Fixed | Used Clock icon for time display instead of duplicate Calendar |
| M4 | MEDIUM | [x] Fixed | Simplified cn() usage for static classes |
| L1 | LOW | [x] Fixed | Clock icon now used for time display |
| L2 | LOW | [-] Deferred | Barrel export file deferred to future story |

### Summary

All HIGH and MEDIUM severity issues were addressed. Components now fully align with UX specification including streaming state support (isComplete prop), accessibility (ARIA labels), and comprehensive test coverage.

