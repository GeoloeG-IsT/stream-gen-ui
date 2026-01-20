# Coding Conventions

**Analysis Date:** 2026-01-20

## Naming Patterns

**Files:**
- React components: PascalCase with `.tsx` extension (e.g., `MessageBubble.tsx`, `FlowTokenRenderer.tsx`)
- Test files: Same base name with `.test.tsx` or `.test.ts` suffix (e.g., `MessageBubble.test.tsx`)
- Utility files: camelCase with `.ts` extension (e.g., `mock-stream.ts`, `test-content.ts`)
- Type definition files: `index.ts` in dedicated `types/` directory
- Hook files: Named according to hook pattern, e.g., `ViewRawContext.tsx` for context+hook exports
- Directories: kebab-case (e.g., `shared`, `flowtoken`, `llm-ui`, `streamdown`)

**Functions:**
- Component functions: PascalCase (e.g., `MessageBubble`, `FlowTokenRenderer`, `ViewRawProvider`)
- Hook functions: camelCase with `use` prefix (e.g., `useViewRaw`)
- Utility functions: camelCase (e.g., `parseAttributes`, `toContactCardProps`, `parseContent`)
- Private functions: camelCase, often declared with lowercase naming within component files (e.g., `parseAttributes` in `StreamdownRenderer.tsx`)

**Variables:**
- Boolean flags: camelCase, often prefixed with `is` or `has` (e.g., `isStreaming`, `isUser`, `viewRaw`, `hasError`)
- State setters: camelCase with `set` prefix (e.g., `setViewRaw`)
- Constants: camelCase (e.g., `messageFormats`) or UPPER_SNAKE_CASE for immutable arrays (e.g., `MESSAGE_FORMATS`, `NAVIGATION_TABS`)
- Refs: camelCase with `Ref` suffix (e.g., `inputRef`)

**Types:**
- Interfaces: PascalCase (e.g., `MessageBubbleProps`, `ViewRawContextValue`, `ContactCardProps`)
- Type aliases: PascalCase (e.g., `MessageFormat`, `ContentSegment`)
- Props interfaces: Component name + `Props` suffix (e.g., `MessageBubbleProps`, `FlowTokenRendererProps`)
- Union type values: lowercase when literal strings (e.g., `'user' | 'assistant'`)

## Code Style

**Formatting:**
- No explicit formatter configured; project relies on ESLint
- Indentation: 2 spaces (standard for TypeScript/React projects)
- Line length: No hard limit enforced; follow readability conventions

**Linting:**
- Tool: ESLint 9 with Next.js config (`eslint-config-next` 16.1.4)
- Key rules: Core Web Vitals and TypeScript rules from `eslint-config-next`
- Config file: `eslint.config.mjs` (flat config format)
- Ignores: `.next/`, `out/`, `build/`, `next-env.d.ts` directories

## Import Organization

**Order:**
1. React imports and type imports from React (`import { Component } from 'react'`, `import type { ReactElement } from 'react'`)
2. Next.js imports (`import Link from 'next/link'`)
3. Third-party dependencies (`import { AnimatedMarkdown } from 'flowtoken'`)
4. Relative imports from `@/` path alias (contexts, components, types, utils)
5. Local relative imports (`import { RawOutputView } from './RawOutputView'`)

**Path Aliases:**
- `@/*` maps to `./*` (relative to frontend/ since tsconfig.json is inside frontend/)
- Working directory: All frontend commands run from frontend/ directory
- Example usage: `import { useViewRaw } from '@/contexts/ViewRawContext'`
- Enables consistent imports across nested directory structures
- Defined in: `frontend/tsconfig.json`

**Type Imports:**
- Use `import type { ... } from 'module'` for type-only imports to ensure they don't appear in compiled output
- Example: `import type { ReactElement, ReactNode } from 'react'`

## Error Handling

**Patterns:**
- **React Error Boundaries:** Class components extending `Component<Props, State>` with `getDerivedStateFromError()` and `componentDidCatch()` (see `FlowTokenErrorBoundary`, `StreamdownErrorBoundary`)
- **Context Hook Validation:** Throw descriptive errors when hooks are used outside providers (e.g., `throw new Error('useViewRaw must be used within a ViewRawProvider')`)
- **Graceful Fallbacks:** Error boundaries render plain text/markdown as fallback when parsing fails
- **Validation Functions:** Return `undefined` when validation fails (e.g., `toContactCardProps`, `toCalendarEventProps`)

## Logging

**Framework:** Native `console` object (no logging library)

**Patterns:**
- **Error Logging:** `console.error('[ComponentName] Message:', error, errorInfo)` with bracketed component prefix
  - Example: `console.error('[FlowToken] Render error:', error, errorInfo);`
  - Used in error boundaries and error handlers
- **Warning Logging:** `console.warn('[ComponentName] Message')` for validation/parsing warnings
  - Example: `console.warn('[Streamdown] ContactCard missing required "name" attribute');`
- **Test Logging:** Suppress console output in tests where error throwing is expected using `console.error = () => {}`
- **Prefix Convention:** Always use `[ComponentName]` prefix to identify log source

## Comments

**When to Comment:**
- Explain WHY, not WHAT (code explains what it does)
- Non-obvious parsing logic or regex patterns (see `StreamdownRenderer.tsx` line 70-78)
- Limitations and edge cases in complex functions (see `parseAttributes` comments on lines 65-68)
- References to project context or design decisions (e.g., "Per project context: 'Fallback to raw text on parse errors'")
- Workarounds or temporary solutions

**JSDoc/TSDoc:**
- Use for function signatures, especially those with multiple parameters or return values
- Format: `/** Brief description. Additional context. @param name - Description @returns Description @throws Error condition */`
- Document on interfaces and type definitions for clarity
- Example from `ViewRawContext.tsx` lines 6-13: Interface properties documented with inline `/** */` comments
- Custom hooks include `@throws` documentation (line 42-47 in `ViewRawContext.tsx`)
- Library functions include full JSDoc with `@param` and `@returns` (see `lib/mock-stream.ts`, `lib/test-content.ts`)

## Function Design

**Size:**
- Utility functions: Keep small and focused (50-100 lines ideal)
- Component functions: 50-100 lines average (some render-heavy components may exceed)
- Parser functions: Can be longer if the logic is sequential and well-commented (see `parseContent` at 50 lines)

**Parameters:**
- Use destructuring for component props (e.g., `function MessageBubble({ role, content, isStreaming = false, children, rawContent }: MessageBubbleProps)`)
- Default parameters using `= value` syntax for optional props
- Context setups use interface-based parameter passing for clarity

**Return Values:**
- React components return `ReactElement` or `React.ReactElement` type annotation
- Utility functions explicitly type return values (e.g., `Record<string, string>`, `ContentSegment[]`)
- Parser functions may return `undefined` to signal validation failure
- Hooks return typed objects (e.g., `ViewRawContextValue`)

## Module Design

**Exports:**
- Named exports for components and functions: `export function ComponentName(...) { ... }`
- Named exports for interfaces: `export interface ComponentProps { ... }`
- Memoized components use named export: `export const ComponentName = memo(ComponentNameInner)`
- Each module exports one primary item (component, context, utility set)

**Barrel Files:**
- Not used; each component imported directly from its file
- Centralized type exports in `types/index.ts` (all props and type definitions)
- No `index.ts` barrel files in component directories

**Single Responsibility:**
- Components have one concern (render logic)
- Utilities are single-purpose (parsing, formatting, type guards)
- Contexts combine state + hooks in one file (e.g., `ViewRawContext.tsx`)

---

*Convention analysis: 2026-01-20*
