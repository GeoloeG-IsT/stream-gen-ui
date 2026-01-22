---
phase: quick
plan: 002
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/package.json
  - frontend/components/llm-ui/LLMUIRenderer.tsx
  - frontend/components/llm-ui/schemas.ts
  - frontend/components/llm-ui/ContactBlockComponent.tsx
  - frontend/components/llm-ui/CalendarBlockComponent.tsx
autonomous: true

must_haves:
  truths:
    - "Contact blocks render as ContactCard components"
    - "Calendar blocks render as CalendarEvent components"
    - "Invalid JSON gracefully falls back to error display"
    - "Streaming shows nothing until block is complete"
  artifacts:
    - path: "frontend/components/llm-ui/schemas.ts"
      provides: "Zod schemas for contact and calendar blocks"
      exports: ["contactBlockSchema", "calendarBlockSchema"]
    - path: "frontend/components/llm-ui/ContactBlockComponent.tsx"
      provides: "LLMOutputComponent for contact blocks"
      exports: ["ContactBlockComponent"]
    - path: "frontend/components/llm-ui/CalendarBlockComponent.tsx"
      provides: "LLMOutputComponent for calendar blocks"
      exports: ["CalendarBlockComponent"]
    - path: "frontend/components/llm-ui/LLMUIRenderer.tsx"
      provides: "Renderer using jsonBlock pattern"
      exports: ["LLMUIRenderer"]
  key_links:
    - from: "frontend/components/llm-ui/LLMUIRenderer.tsx"
      to: "frontend/components/llm-ui/schemas.ts"
      via: "import schemas"
      pattern: "import.*schemas"
    - from: "frontend/components/llm-ui/ContactBlockComponent.tsx"
      to: "@llm-ui/json"
      via: "parseJson5 and jsonBlock"
      pattern: "parseJson5"
---

<objective>
Refactor LLMUIRenderer from custom block matchers to @llm-ui/json jsonBlock pattern

Purpose: Replace hand-rolled delimiter matching and JSON parsing with the official @llm-ui/json library for cleaner, more maintainable code
Output: LLMUIRenderer using jsonBlock() with Zod schemas for validation
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/STATE.md
@frontend/components/llm-ui/LLMUIRenderer.tsx
@frontend/components/shared/ContactCard.tsx
@frontend/components/shared/CalendarEvent.tsx
@frontend/types/index.ts
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install @llm-ui/json and create Zod schemas</name>
  <files>frontend/package.json, frontend/components/llm-ui/schemas.ts</files>
  <action>
1. Install @llm-ui/json package:
   ```bash
   cd frontend && npm install @llm-ui/json
   ```

2. Create `frontend/components/llm-ui/schemas.ts` with Zod schemas:
   - `contactBlockSchema`: z.object with type: z.literal("contact"), name (required string), email/phone/address (optional strings)
   - `calendarBlockSchema`: z.object with type: z.literal("calendar"), title/date (required strings), startTime/endTime/location/description (optional strings)
   - Export both schemas
   - Schema types should match ContactCardProps and CalendarEventProps from @/types

Pattern to follow:
```typescript
import { z } from "zod";

export const contactBlockSchema = z.object({
  type: z.literal("contact"),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
});

export const calendarBlockSchema = z.object({
  type: z.literal("calendar"),
  title: z.string(),
  date: z.string(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  description: z.string().optional(),
});
```
  </action>
  <verify>
- `npm ls @llm-ui/json` shows package installed
- `frontend/components/llm-ui/schemas.ts` exists and exports contactBlockSchema, calendarBlockSchema
- TypeScript compiles: `cd frontend && npx tsc --noEmit`
  </verify>
  <done>@llm-ui/json installed, Zod schemas defined matching ContactCardProps/CalendarEventProps</done>
</task>

<task type="auto">
  <name>Task 2: Create LLMOutputComponent wrappers for ContactCard and CalendarEvent</name>
  <files>frontend/components/llm-ui/ContactBlockComponent.tsx, frontend/components/llm-ui/CalendarBlockComponent.tsx</files>
  <action>
1. Create `frontend/components/llm-ui/ContactBlockComponent.tsx`:
   - Import LLMOutputComponent type from @llm-ui/react, parseJson5 from @llm-ui/json
   - Import contactBlockSchema from ./schemas
   - Import ContactCard from @/components/shared/ContactCard
   - Create ContactBlockComponent: LLMOutputComponent
   - Check blockMatch.isVisible, return null if false
   - Parse with parseJson5(blockMatch.output), validate with contactBlockSchema.safeParse()
   - On error: return error message in styled div
   - On success: return ContactCard with props (exclude 'type' field)
   - Wrap in component-fade-in div for animation

2. Create `frontend/components/llm-ui/CalendarBlockComponent.tsx`:
   - Same pattern but with calendarBlockSchema and CalendarEvent component
   - Map schema fields to CalendarEventProps (they match directly)

Component pattern:
```typescript
'use client';

import type { LLMOutputComponent } from '@llm-ui/react';
import { parseJson5 } from '@llm-ui/json';
import { contactBlockSchema } from './schemas';
import { ContactCard } from '@/components/shared/ContactCard';

export const ContactBlockComponent: LLMOutputComponent = ({ blockMatch }) => {
  if (!blockMatch.isVisible) return null;

  const { data, error } = contactBlockSchema.safeParse(
    parseJson5(blockMatch.output)
  );

  if (error) {
    return (
      <div className="text-red-500 text-sm p-2 bg-red-50 rounded">
        Invalid contact data: {error.message}
      </div>
    );
  }

  // Destructure to exclude 'type' from props
  const { type, ...contactProps } = data;

  return (
    <div className="component-fade-in">
      <ContactCard {...contactProps} />
    </div>
  );
};
```
  </action>
  <verify>
- Both component files exist
- TypeScript compiles: `cd frontend && npx tsc --noEmit`
  </verify>
  <done>LLMOutputComponent wrappers created for both ContactCard and CalendarEvent</done>
</task>

<task type="auto">
  <name>Task 3: Refactor LLMUIRenderer to use jsonBlock pattern</name>
  <files>frontend/components/llm-ui/LLMUIRenderer.tsx</files>
  <action>
1. Remove the custom createBlockMatcher function entirely

2. Update imports:
   - Add: `import { jsonBlock } from '@llm-ui/json';`
   - Add: `import { ContactBlockComponent } from './ContactBlockComponent';`
   - Add: `import { CalendarBlockComponent } from './CalendarBlockComponent';`
   - Remove: direct imports of ContactCard, CalendarEvent (no longer needed here)

3. Replace contactBlock and calendarBlock definitions:
   ```typescript
   const contactBlock = {
     ...jsonBlock({ type: "contact" }),
     component: ContactBlockComponent,
   };

   const calendarBlock = {
     ...jsonBlock({ type: "calendar" }),
     component: CalendarBlockComponent,
   };
   ```

4. Keep existing:
   - LLMUIErrorBoundary (error handling)
   - markdownBlock (fallback for non-component content)
   - LLMUIRendererInner and memo wrapper
   - useLLMOutput hook usage (blocks array stays same)

5. Note: jsonBlock uses the standard 【TYPE:{json}】 format which matches what the backend already sends
  </action>
  <verify>
- `cd frontend && npx tsc --noEmit` passes
- `cd frontend && npm run lint` passes
- Run existing tests: `cd frontend && npm test -- --testPathPattern="LLMUIRenderer"` passes
- Manual test: Start dev server, use llm-ui renderer, verify contact and calendar cards still render
  </verify>
  <done>LLMUIRenderer refactored to use @llm-ui/json jsonBlock pattern, all tests pass</done>
</task>

</tasks>

<verification>
1. TypeScript compilation: `cd frontend && npx tsc --noEmit`
2. Lint check: `cd frontend && npm run lint`
3. Existing tests pass: `cd frontend && npm test -- --testPathPattern="LLMUIRenderer"`
4. Manual verification: Dev server renders contact/calendar blocks correctly with llm-ui format
</verification>

<success_criteria>
- @llm-ui/json package installed
- Zod schemas defined in schemas.ts
- Separate LLMOutputComponent files for Contact and Calendar
- LLMUIRenderer uses jsonBlock() instead of custom createBlockMatcher
- All existing tests pass
- Manual test confirms blocks render correctly
</success_criteria>

<output>
After completion, create `.planning/quick/002-refactor-to-llm-ui-json-blocks-pattern/002-SUMMARY.md`
</output>
