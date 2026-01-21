---
path: /root/wks/stream-gen-ui/frontend/components/streamdown/StreamdownRenderer.tsx
type: component
updated: 2026-01-21
status: active
---

# StreamdownRenderer.tsx

## Purpose

Renders streaming markdown content with embedded XML custom components (ContactCard, CalendarEvent) using the Streamdown library. Provides graceful error handling via an error boundary that falls back to raw text on parse failures.

## Exports

- **StreamdownRenderer**: Memoized React component that parses and renders streaming markdown with custom XML component support
- **StreamdownRendererProps**: TypeScript interface defining component props (content: string, isStreaming?: boolean)

## Dependencies

- react (Component, memo, useMemo, ReactElement, ReactNode, ErrorInfo)
- streamdown (Streamdown parser)
- [[root-wks-stream-gen-ui-frontend-components-shared-calendarevent]] (CalendarEvent component)
- [[root-wks-stream-gen-ui-frontend-components-shared-contactcard]] (ContactCard component)
- @/types (CalendarEventProps, ContactCardProps)

## Used By

TBD

## Notes

- Uses ContentSegment union type to represent parsed segments: markdown, contactcard, calendarevent, or skeleton placeholders
- XML attribute parsing only supports double-quoted attributes; single quotes and escaped quotes may cause issues
- Error boundary catches Streamdown parsing failures and renders raw content as fallback
- Skeleton loading shown for incomplete XML tags during streaming (isStreaming prop)