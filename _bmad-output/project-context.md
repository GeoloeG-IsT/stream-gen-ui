---
project_name: 'stream-gen-ui'
user_name: 'GeoloeG'
date: '2026-01-19'
sections_completed: ['technology_stack', 'typescript_rules', 'react_rules', 'streaming_rules', 'file_organization', 'imports', 'tailwind', 'anti_patterns']
status: 'complete'
---

# Project Context for AI Agents

_Critical rules for implementing stream-gen-ui. Follow these exactly._

## Technology Stack

| Package | Version | Notes |
|---------|---------|-------|
| Next.js | 16.x | App Router only |
| React | 19.x | Required for Streamdown |
| TypeScript | Strict | No `any` |
| Tailwind CSS | 4.x | Use `cn()` |
| Vercel AI SDK | 6.x | `useChat` hook |
| flowtoken | Latest | Route: /flowtoken |
| @llm-ui/react | Latest | Route: /llm-ui |
| streamdown | Latest | Route: /streamdown |

## TypeScript Rules

- No `any` - use `unknown` + type guards
- Explicit return types on exports: `function foo(): Type`
- Props: `ComponentNameProps` (no I prefix)
- Inline destructure: `function Foo({ a }: FooProps)`

## React Rules

- Function components only, named exports
- `useChat` is the ONLY message state - no useState for messages
- React.memo on streaming message blocks
- App Router only - no pages/

## Streaming UI Rules

- Handle incomplete markup gracefully - never block
- Fallback to raw text on parse errors
- Disable animations on completed messages
- Include `?format={route}` on all useChat calls

## File Organization

- Components: PascalCase (`ContactCard.tsx`)
- Utilities: kebab-case (`mock-stream.ts`)
- Tests: co-located (`ContactCard.test.tsx`)
- Shared: `components/shared/` (all routes)
- Per-route: `components/{impl}/` (one route)

## Import Order

1. React/Next.js
2. Third-party libs
3. Internal components (@/components)
4. Utilities (@/lib)
5. Types (use `import type`)

## Tailwind

Always use `cn()`:

```tsx
className={cn("p-4", isActive && "border")}
```

Never:

```tsx
className={"p-4 " + (isActive ? "border" : "")}
```

## Anti-Patterns

- ❌ `any` type
- ❌ `export default` for components
- ❌ useState for messages
- ❌ String concat for classes
- ❌ Missing return types
- ❌ `IProps` naming
- ❌ Blocking on incomplete stream
- ❌ pages/ directory

---

## Usage Guidelines

**For AI Agents:**
- Read this file before implementing any code
- Follow ALL rules exactly as documented
- When in doubt, prefer the more restrictive option
- Reference architecture.md for detailed decisions

**For Humans:**
- Keep this file lean and focused on agent needs
- Update when technology stack changes
- Review periodically for outdated rules

Last Updated: 2026-01-19
