---
source: /root/wks/stream-gen-ui/components/streamdown/StreamdownRenderer.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# StreamdownRenderer.tsx

## Purpose

Renders streaming LLM output with embedded UI components using the Streamdown library combined with a custom XML-style tag parser. Since Streamdown doesn't natively support custom HTML elements, this component implements its own parsing layer to extract `<contactcard>` and `<calendarevent>` XML-style tags, render them as React components, and delegate remaining markdown to Streamdown. Designed for AI streaming with graceful handling of incomplete tags during transmission.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| StreamdownRenderer | function (memoized) | Main component that parses content and renders mixed markdown + UI components |
| StreamdownRendererProps | interface | TypeScript interface defining the component's props (content, isStreaming) |

## Dependencies

| Import | Purpose |
|--------|---------|
| react | Component, memo, useMemo, ReactElement, ReactNode, ErrorInfo for React component infrastructure |
| streamdown | Streamdown component for rendering animated streaming markdown |
| @/components/shared/CalendarEvent | UI component rendered when `<calendarevent>` tags are detected |
| @/components/shared/ContactCard | UI component rendered when `<contactcard>` tags are detected |
| @/types | TypeScript types for CalendarEventProps and ContactCardProps |

## Used By

- `app/streamdown/page.tsx` - Demo page showcasing the Streamdown approach to streaming generative UI
- `components/streamdown/StreamdownRenderer.test.tsx` - Unit tests for the renderer component
