---
path: /root/wks/stream-gen-ui/frontend/components/llm-ui/ContactBlockComponent.tsx
type: component
updated: 2026-01-22
status: active
---

# ContactBlockComponent.tsx

## Purpose

LLM-UI output component that parses JSON5 contact blocks from LLM streaming output and renders them as ContactCard components. Handles validation errors gracefully with user-friendly error display.

## Exports

- **ContactBlockComponent**: LLMOutputComponent wrapper that parses contact block JSON5 data, validates against schema, and renders ContactCard with extracted props

## Dependencies

- `@llm-ui/react` (external): LLMOutputComponent type
- `@llm-ui/json` (external): parseJson5 utility
- [[root-wks-stream-gen-ui-frontend-components-llm-ui-schemas]]: contactBlockSchema for validation
- [[root-wks-stream-gen-ui-frontend-components-shared-ContactCard]]: ContactCard presentation component

## Used By

TBD

## Notes

- Uses Zod schema validation via safeParse for type-safe parsing
- Strips `type` field from parsed data before passing to ContactCard
- Returns null when block is not visible (streaming incomplete)
- Applies `component-fade-in` animation class for smooth appearance