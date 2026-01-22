---
path: /root/wks/stream-gen-ui/frontend/components/llm-ui/CalendarBlockComponent.tsx
type: component
updated: 2026-01-22
status: active
---

# CalendarBlockComponent.tsx

## Purpose

LLM-UI block component that parses JSON5 calendar block output from LLM streams and renders it as a CalendarEvent component. Acts as an adapter between the llm-ui streaming library and the shared CalendarEvent presentation component.

## Exports

- `CalendarBlockComponent`: LLMOutputComponent that validates calendar JSON5 blocks against a Zod schema and renders CalendarEvent with error handling

## Dependencies

- [[root-wks-stream-gen-ui-frontend-components-llm-ui-schemas]]: calendarBlockSchema for validation
- [[root-wks-stream-gen-ui-frontend-components-shared-calendarevent]]: CalendarEvent presentation component
- @llm-ui/react: LLMOutputComponent type
- @llm-ui/json: parseJson5 utility

## Used By

TBD

## Notes

- Excludes `type` discriminator field when spreading props to CalendarEvent
- Returns null when block is not visible (streaming not complete)
- Displays inline error UI for invalid JSON5 data instead of throwing