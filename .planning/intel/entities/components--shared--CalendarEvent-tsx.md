---
source: /root/wks/stream-gen-ui/components/shared/CalendarEvent.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# CalendarEvent.tsx

## Purpose

Rich UI component for displaying calendar event information with title, date, time range, location, and description. Demonstrates streaming UI capability to render structured data as styled event cards. Used as a custom component registered with streaming parsers.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| CalendarEvent | function | React component rendering a styled calendar event card with date/time/location details |

## Dependencies

| Import | Purpose |
|--------|---------|
| react (ReactElement) | TypeScript type for component return value |
| lucide-react (Calendar, Clock, MapPin) | Icons for event detail labels |
| @/types (CalendarEventProps) | TypeScript interface for title, date, startTime, endTime, location, description props |

## Used By

- `components/flowtoken/FlowTokenRenderer.tsx` - Registered as custom component for `<calendarevent>` tags
- `components/llmui/LlmUiRenderer.tsx` - Registered as custom component
- `components/streamdown/StreamdownRenderer.tsx` - Registered as custom component
- Rendered inline within streamed markdown when parser encounters CalendarEvent markup
