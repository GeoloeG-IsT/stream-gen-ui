---
path: /root/wks/stream-gen-ui/frontend/components/shared/EntityRenderer.tsx
type: component
updated: 2026-01-21
status: active
---

# EntityRenderer.tsx

## Purpose

Renders parsed entities (contacts, calendar events) inline with text content. Takes parse results from the entity parser and interleaves text segments with specialized entity components, supporting streaming content with incomplete entity handling.

## Exports

- **EntityRenderer**: Main component that renders ParseResult with interleaved text and entity components
- **EntityRendererProps**: (type) Props interface accepting parseResult, isStreaming flag, and optional custom text renderer

## Dependencies

- react (external)
- [[ContactCard]] - Renders contact entity cards
- [[CalendarEvent]] - Renders calendar event cards
- [[entity-parser]] - Types: ParseResult, ParsedEntity

## Used By

TBD

## Notes

- Uses 'use client' directive for client-side rendering
- Supports custom text rendering via `renderText` prop (useful for markdown)
- Handles incomplete entities during streaming via `hasIncompleteEntity` flag
- Interleaving algorithm alternates between text segments and entities by index parity