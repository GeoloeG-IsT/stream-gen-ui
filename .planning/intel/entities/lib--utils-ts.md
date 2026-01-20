---
source: /root/wks/stream-gen-ui/lib/utils.ts
indexed: 2026-01-20T00:00:00.000Z
---

# utils.ts

## Purpose

Provides the `cn` utility function that combines clsx and tailwind-merge to enable conditional and conflict-free Tailwind CSS class composition. This is a standard pattern in Tailwind/React projects to merge class names while properly handling Tailwind's utility class conflicts.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| cn | function | Merges class names using clsx and resolves Tailwind CSS class conflicts |

## Dependencies

| Import | Purpose |
|--------|---------|
| clsx | Conditionally joins class names based on truthy values |
| tailwind-merge | Intelligently merges Tailwind CSS classes, resolving conflicts (e.g., `p-2` and `p-4` becomes `p-4`) |

## Used By

Utility - used across codebase. Key consumers:
- `/app/layout.tsx` - combines font variables with antialiased class
- All UI components that need conditional or merged Tailwind classes
