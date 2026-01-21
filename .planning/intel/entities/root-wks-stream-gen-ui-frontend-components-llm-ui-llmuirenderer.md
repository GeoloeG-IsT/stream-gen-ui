---
path: /root/wks/stream-gen-ui/frontend/components/llm-ui/LLMUIRenderer.tsx
type: component
updated: 2026-01-21
status: active
---

# LLMUIRenderer.tsx

## Purpose

React component that renders LLM streaming output using the @llm-ui/react library, parsing delimiter-based blocks (【TYPE:{json}】) into rich UI components like ContactCard and CalendarEvent. Handles streaming states with skeleton loaders and provides graceful error boundary fallback to raw text on parse failures.

## Exports

- **LLMUIRenderer**: Main memoized component that processes LLM output content and renders structured blocks with markdown fallback
- **LLMUIRendererProps**: TypeScript interface defining component props (content: string, isStreaming?: boolean)

## Dependencies

- react (Component, memo, ReactElement, ReactNode, ErrorInfo)
- @llm-ui/react (useLLMOutput, BlockMatch, LLMOutputBlock, LLMOutputFallbackBlock, LookBackFunctionParams)
- react-markdown (ReactMarkdown)
- [[root-wks-stream-gen-ui-frontend-components-shared-calendarevent]]
- [[root-wks-stream-gen-ui-frontend-components-shared-contactcard]]
- [[root-wks-stream-gen-ui-frontend-components-shared-componentskeleton]]

## Used By

TBD

## Notes

- Uses delimiter format 【CONTACT:{json}】 and 【CALENDAR:{json}】 for structured blocks
- Shows ComponentSkeleton during streaming while blocks are incomplete (no closing delimiter)
- LLMUIErrorBoundary class component catches render errors and falls back to raw text display
- createBlockMatcher is a generic factory function supporting both ContactCard and CalendarEvent props
- Memoized with React.memo for performance optimization during streaming updates