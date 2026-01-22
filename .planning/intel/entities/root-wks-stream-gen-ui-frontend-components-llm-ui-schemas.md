---
path: /root/wks/stream-gen-ui/frontend/components/llm-ui/schemas.ts
type: module
updated: 2026-01-22
status: active
---

# schemas.ts

## Purpose

Defines Zod validation schemas for LLM-generated UI blocks (contact and calendar). These schemas enable runtime validation of structured data blocks parsed from LLM output before rendering.

## Exports

- `contactBlockSchema` - Zod schema validating contact blocks with name, email, phone, address fields
- `calendarBlockSchema` - Zod schema validating calendar event blocks with title, date, times, location, description
- `ContactBlock` - TypeScript type inferred from contactBlockSchema
- `CalendarBlock` - TypeScript type inferred from calendarBlockSchema

## Dependencies

- zod (external) - Runtime schema validation library

## Used By

TBD

## Notes

- Schemas are designed to match corresponding Props types from `@/types` (ContactCardProps, CalendarEventProps)
- Uses discriminated union pattern with `type` literal field for block identification
- All fields except type discriminator and primary field (name/title) are optional