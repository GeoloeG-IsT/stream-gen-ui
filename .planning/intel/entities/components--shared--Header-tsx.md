---
source: /root/wks/stream-gen-ui/components/shared/Header.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# Header.tsx

## Purpose

Fixed navigation header providing tab-based routing between the three streaming library implementations (FlowToken, llm-ui, Streamdown) and a toggle switch for viewing raw streamed output. Serves as the primary navigation and debug control surface for the PoC application.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| Header | function | React component rendering the fixed top navigation bar with library tabs and raw view toggle |

## Dependencies

| Import | Purpose |
|--------|---------|
| react (ReactElement) | TypeScript type for component return value |
| next/link | Client-side navigation between implementation routes |
| next/navigation (usePathname) | Detect current route for active tab highlighting |
| @/contexts/ViewRawContext (useViewRaw) | Access global toggle state for showing raw streamed output |
| @/lib/utils (cn) | Conditional className composition utility |

## Used By

- `app/layout.tsx` - Rendered in the root layout, appears on all pages
- Provides navigation to `/flowtoken`, `/llm-ui`, and `/streamdown` routes
