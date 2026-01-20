# Story 1.2: Shared Custom Components

Status: ready-for-dev

## Story

As an **evaluator**,
I want **polished ContactCard and CalendarEvent components**,
so that **I can see how custom UI renders within the chat stream**.

## Acceptance Criteria

1. **Given** the component library is implemented **When** ContactCard receives name, email, and phone props **Then** it displays a styled card with the contact information **And** phone number is a clickable tel: link **And** email is a clickable mailto: link **And** the card follows Neuraflow brand styling (12px radius, blue links, shadow)

2. **Given** the CalendarEvent component receives title, date, time, and location props **When** rendered **Then** it displays a styled event card with all information **And** the card follows the same visual design system

## Tasks / Subtasks

- [ ] Task 1: Create ContactCard component (AC: #1)
  - [ ] Create `components/shared/ContactCard.tsx` with proper TypeScript types
  - [ ] Implement ContactCardProps interface: name (required), email (optional), phone (optional)
  - [ ] Add tel: link for phone number with Phone icon from lucide-react
  - [ ] Add mailto: link for email with Mail icon from lucide-react
  - [ ] Apply Neuraflow styling: 12px border-radius, #3B82F6 blue links, shadow-md
  - [ ] Use cn() utility for all conditional class management
  - [ ] Export as named export (not default)

- [ ] Task 2: Create CalendarEvent component (AC: #2)
  - [ ] Create `components/shared/CalendarEvent.tsx` with proper TypeScript types
  - [ ] Implement CalendarEventProps interface: title (required), date (required), time (optional), location (optional)
  - [ ] Add Calendar icon from lucide-react for visual indicator
  - [ ] Add MapPin icon for location if provided
  - [ ] Apply consistent Neuraflow styling matching ContactCard
  - [ ] Use cn() utility for all conditional class management
  - [ ] Export as named export (not default)

- [ ] Task 3: Add shared type definitions (AC: #1, #2)
  - [ ] Add ContactCardProps to types/index.ts
  - [ ] Add CalendarEventProps to types/index.ts
  - [ ] Ensure all props use explicit types (no `any`)

- [ ] Task 4: Verify components build and lint (AC: #1, #2)
  - [ ] Run `npm run build` - no TypeScript errors
  - [ ] Run `npm run lint` - no ESLint warnings
  - [ ] Verify components can be imported from @/components/shared

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

### Change Log

