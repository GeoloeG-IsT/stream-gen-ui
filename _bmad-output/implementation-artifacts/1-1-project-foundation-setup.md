# Story 1.1: Project Foundation Setup

Status: review

## Story

As a **developer**,
I want **a properly configured Next.js project with all required dependencies**,
so that **I have a working foundation to build the streaming chat implementations**.

## Acceptance Criteria

1. **Given** a fresh development environment **When** I run the initialization command and install dependencies **Then** the project is created with Next.js 16+, TypeScript, Tailwind CSS 4.x, ESLint, and App Router

2. **Given** the project is initialized **When** I check the installed dependencies **Then** Vercel AI SDK, FlowToken, llm-ui, Streamdown, and lucide-react are installed

3. **Given** all dependencies are installed **When** I run `npm run dev` **Then** the development server starts on localhost:3000

## Tasks / Subtasks

- [x] Task 1: Initialize Next.js project (AC: #1)
  - [x] Run `npx create-next-app@latest stream-gen-ui --typescript --tailwind --eslint --app --turbopack --use-npm`
  - [x] Verify project structure matches App Router pattern (app/ directory)
  - [x] Confirm TypeScript strict mode is enabled in tsconfig.json
  - [x] Verify Tailwind CSS 4.x is configured with PostCSS

- [x] Task 2: Install required dependencies (AC: #2)
  - [x] Install Vercel AI SDK: `npm i ai`
  - [x] Install streaming libraries: `npm i flowtoken @llm-ui/react streamdown`
  - [x] Install UI utility: `npm i lucide-react`
  - [x] Install class utilities: `npm i clsx tailwind-merge`
  - [x] Verify all packages in package.json

- [x] Task 3: Set up project foundation (AC: #3)
  - [x] Create lib/utils.ts with cn() helper function
  - [x] Create types/index.ts for shared type definitions
  - [x] Set up folder structure for components (shared/, flowtoken/, llm-ui/, streamdown/)
  - [x] Verify `npm run dev` starts successfully on localhost:3000
  - [x] Verify no TypeScript errors on initial build

## Dev Notes

### Critical Architecture Requirements

**IMPORTANT: This story establishes the foundation for the entire project. All future stories depend on correct setup here.**

1. **Initialization Command (EXACT):**
   ```bash
   npx create-next-app@latest stream-gen-ui --typescript --tailwind --eslint --app --turbopack --use-npm
   ```

2. **Required Packages (ALL MANDATORY):**
   ```bash
   npm i ai flowtoken @llm-ui/react streamdown lucide-react clsx tailwind-merge
   ```

3. **cn() Utility Function (REQUIRED):**
   ```typescript
   // lib/utils.ts
   import { clsx, type ClassValue } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   export function cn(...inputs: ClassValue[]): string {
     return twMerge(clsx(inputs));
   }
   ```

### Technology Stack Constraints

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16.x | App Router ONLY - no pages/ directory |
| React | 19.x | Required for Streamdown compatibility |
| TypeScript | Strict | No `any` allowed |
| Tailwind CSS | 4.x | Use cn() for class management |
| Vercel AI SDK | 6.x | Core streaming backbone |
| flowtoken | Latest | Route: /flowtoken |
| @llm-ui/react | Latest | Route: /llm-ui |
| streamdown | Latest | Route: /streamdown |

### Project Structure Notes

**Target Directory Structure:**
```
stream-gen-ui/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── page.tsx
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Created in Story 1.3
│   ├── flowtoken/
│   │   └── page.tsx              # Created in Story 1.5
│   ├── llm-ui/
│   │   └── page.tsx              # Created in Epic 2
│   └── streamdown/
│       └── page.tsx              # Created in Epic 2
├── components/
│   ├── shared/                   # Created in Story 1.2+
│   ├── flowtoken/
│   ├── llm-ui/
│   └── streamdown/
├── lib/
│   ├── utils.ts                  # cn() helper - THIS STORY
│   ├── mock-stream.ts            # Created in Story 1.3
│   └── test-content.ts           # Created in Story 1.3
├── types/
│   └── index.ts                  # THIS STORY
└── public/
```

**Naming Conventions:**
- Components: PascalCase (e.g., `ContactCard.tsx`)
- Utilities: kebab-case (e.g., `mock-stream.ts`)
- Tests: Co-located (e.g., `ContactCard.test.tsx`)

### TypeScript Configuration Requirements

**tsconfig.json must include:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Import Order Standard

All files must follow this import organization:
1. React/Next.js imports
2. Third-party libraries
3. Internal components (@/components)
4. Utilities (@/lib)
5. Types (use `import type`)

### Anti-Patterns to Avoid

- Do NOT use `any` type - use `unknown` with type guards
- Do NOT use `export default` for components - use named exports
- Do NOT create a pages/ directory - App Router only
- Do NOT use string concatenation for Tailwind classes - use cn()
- Do NOT add I prefix to interfaces - use `ComponentNameProps`

### References

- [Source: _bmad-output/planning-artifacts/architecture.md#Selected Starter: Minimal create-next-app]
- [Source: _bmad-output/planning-artifacts/architecture.md#Implementation Patterns & Consistency Rules]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/project-context.md#Technology Stack]
- [Source: _bmad-output/project-context.md#TypeScript Rules]

## Dev Agent Record

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Used `--legacy-peer-deps` to resolve @llm-ui/react peer dependency conflict (requires React 18 but project uses React 19 per architecture requirements)

### Completion Notes List

- Initialized Next.js 16.1.4 project with TypeScript, Tailwind CSS 4.x, ESLint, and App Router
- Configured strict TypeScript with noImplicitAny enabled
- Installed all required dependencies: ai@6.0.41, flowtoken@1.0.40, @llm-ui/react@0.13.3, streamdown@2.1.0, lucide-react@0.562.0, clsx@2.1.1, tailwind-merge@3.4.0
- Created lib/utils.ts with cn() helper function for Tailwind class management
- Created types/index.ts placeholder for shared type definitions
- Set up component folder structure: shared/, flowtoken/, llm-ui/, streamdown/
- Verified dev server starts successfully and no TypeScript errors

### File List

- app/globals.css (generated by create-next-app)
- app/layout.tsx (generated by create-next-app)
- app/page.tsx (generated by create-next-app)
- app/favicon.ico (generated by create-next-app)
- components/shared/ (new directory)
- components/flowtoken/ (new directory)
- components/llm-ui/ (new directory)
- components/streamdown/ (new directory)
- lib/utils.ts (new)
- types/index.ts (new)
- package.json (modified)
- tsconfig.json (modified - added noImplicitAny)
- postcss.config.mjs (generated by create-next-app)
- eslint.config.mjs (generated by create-next-app)
- next.config.ts (generated by create-next-app)
- next-env.d.ts (generated by create-next-app)
- public/ (generated by create-next-app)

### Change Log

- 2026-01-20: Story 1.1 implementation completed - Project foundation established with Next.js 16, TypeScript strict mode, Tailwind CSS 4.x, and all required dependencies

