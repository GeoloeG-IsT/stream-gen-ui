---
source: /root/wks/stream-gen-ui/components/llm-ui/LLMUIRenderer.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# LLMUIRenderer.tsx

## Purpose

Renders streaming LLM output with embedded UI components using the @llm-ui/react library. Parses delimiter-based blocks in the format `【TYPE:{json}】` and renders corresponding React components (ContactCard, CalendarEvent) while treating other content as markdown. Provides smooth streaming UX with frame-rate throttling and graceful error handling via an error boundary that falls back to raw text.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| LLMUIRenderer | function (memoized) | Main component that parses LLM output and renders mixed markdown + UI components |
| LLMUIRendererProps | interface | TypeScript interface defining the component's props (content, isStreaming) |

## Dependencies

| Import | Purpose |
|--------|---------|
| react | Component, memo, ReactElement, ReactNode, ErrorInfo for React component infrastructure |
| @llm-ui/react | useLLMOutput hook and types for parsing and managing LLM output blocks |
| react-markdown | Renders markdown content in fallback blocks |
| @/components/shared/CalendarEvent | UI component rendered when `【CALENDAR:{json}】` blocks are detected |
| @/components/shared/ContactCard | UI component rendered when `【CONTACT:{json}】` blocks are detected |
| @/types | TypeScript types for CalendarEventProps and ContactCardProps |

## Used By

- `app/llm-ui/page.tsx` - Demo page showcasing the llm-ui approach to streaming generative UI
- `components/llm-ui/LLMUIRenderer.test.tsx` - Unit tests for the renderer component
