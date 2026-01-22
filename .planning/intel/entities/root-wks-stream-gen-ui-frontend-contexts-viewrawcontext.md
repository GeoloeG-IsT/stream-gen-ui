---
path: /root/wks/stream-gen-ui/frontend/contexts/ViewRawContext.tsx
type: hook
updated: 2026-01-21
status: active
---

# ViewRawContext.tsx

## Purpose

Provides global React context for managing "View Raw" toggle state that persists across route changes. Allows components to control and access raw output display mode and associated content.

## Exports

- **ViewRawProvider**: Provider component that wraps the app to provide ViewRaw state management
- **useViewRaw**: Hook to access viewRaw state, setViewRaw, rawContent, and setRawContent from context

## Dependencies

- react (createContext, useContext, useState, ReactElement, ReactNode)

## Used By

TBD

## Notes

- Context value interface defines `rawContent` and `setRawContent` but current implementation does not include them in provider value - potential bug
- Throws error if `useViewRaw` is called outside of `ViewRawProvider`