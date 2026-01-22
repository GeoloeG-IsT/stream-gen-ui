---
path: /root/wks/stream-gen-ui/frontend/components/flowtoken/FlowTokenRenderer.tsx
type: component
updated: 2026-01-21
status: active
---

# FlowTokenRenderer.tsx

## Purpose

React component that renders streaming markdown content using the FlowToken library with animated text effects. Supports custom XML components (ContactCard, CalendarEvent) and includes error boundary fallback to raw text on parse errors.

## Exports

- **FlowTokenRenderer** - Main component that wraps AnimatedMarkdown with error handling and custom component support
- **FlowTokenRendererProps** - TypeScript interface for component props (content: string, isStreaming?: boolean)

## Dependencies

- react (external)
- flowtoken (external) - AnimatedMarkdown component
- [[shared-calendarevent]] - Custom CalendarEvent component for XML rendering
- [[shared-contactcard]] - Custom ContactCard component for XML rendering

## Used By

TBD

## Notes

- FlowToken lowercases tag names when parsing, so custom component keys must be lowercase (`contactcard`, `calendarevent`)
- `filterIncompleteXml` function exists but is currently unused - filters incomplete XML tags during streaming
- Error boundary catches FlowToken parse errors and falls back to displaying raw content in a `<pre>` tag
- Animation is set to 'fadeIn' during streaming, null when complete