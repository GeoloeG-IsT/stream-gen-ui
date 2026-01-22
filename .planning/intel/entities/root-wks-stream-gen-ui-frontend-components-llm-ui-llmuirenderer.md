---
path: /root/wks/stream-gen-ui/frontend/components/llm-ui/LLMUIRenderer.tsx
type: component
updated: 2026-01-22
status: active
---

# LLMUIRenderer.tsx

## Purpose

Renders LLM output with support for streaming and structured UI blocks (contacts, calendar events). Uses @llm-ui/react for parsing delimiter-based blocks (`【TYPE:{json}】`) and gracefully falls back to raw text on parse errors.

## Exports

- **LLMUIRenderer**: Main component that parses LLM content and renders markdown with embedded UI blocks
- **LLMUIRendererProps**: TypeScript interface for component props (`content: string`, `isStreaming?: boolean`)

## Dependencies

- [[root-wks-stream-gen-ui-frontend-components-llm-ui-contactblockcomponent]]: Contact card block renderer
- [[root-wks-stream-gen-ui-frontend-components-llm-ui-calendarblockcomponent]]: Calendar event block renderer
- react
- @llm-ui/react: Core streaming output hook and types
- @llm-ui/json: JSON block parsing utilities
- react-markdown: Markdown fallback rendering

## Used By

TBD

## Notes

- Blocks are hidden during streaming until complete (have closing `】` delimiter)
- Error boundary wraps rendering for graceful degradation
- Uses `memo` for performance optimization
- Block format: `【CONTACT:{...}】` or `【CALENDAR:{...}】`