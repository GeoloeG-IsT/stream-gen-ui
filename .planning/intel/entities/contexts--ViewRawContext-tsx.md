---
source: /root/wks/stream-gen-ui/contexts/ViewRawContext.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# ViewRawContext.tsx

## Purpose

Provides global React state management for the "View Raw" toggle feature, which allows users to see the raw markup (XML or delimiter format) instead of rendered components. The context persists across route changes, enabling consistent toggle state when switching between FlowToken, llm-ui, and Streamdown implementations.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| ViewRawProvider | function (React component) | Context provider that wraps the app and holds viewRaw boolean state |
| useViewRaw | function (React hook) | Hook to access viewRaw state and setViewRaw setter from any component |

## Dependencies

| Import | Purpose |
|--------|---------|
| createContext (react) | Creates the React context for sharing state |
| useContext (react) | Accesses context value in useViewRaw hook |
| useState (react) | Manages the viewRaw boolean state in provider |
| ReactElement, ReactNode (react) | TypeScript types for component returns and children |

## Used By

- `/app/layout.tsx` - wraps entire app with ViewRawProvider for global state access
- `/components/shared/Header.tsx` - uses useViewRaw to control the toggle switch
- `/components/shared/MessageBubble.tsx` - uses useViewRaw to conditionally show raw markup vs rendered content
