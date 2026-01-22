---
path: /root/wks/stream-gen-ui/frontend/components/shared/CalendarEvent.tsx
type: component
updated: 2026-01-22
status: active
---

# CalendarEvent.tsx

## Purpose

Renders a styled calendar event card displaying event details including title, date, time range, location, and description. Used to present calendar/scheduling information in a visually consistent format with emerald-themed styling and accessibility support.

## Exports

- `CalendarEvent` - React component that renders a calendar event card with props for title, date, startTime, endTime, location, and description

## Dependencies

- `lucide-react` - Icons (Calendar, Clock, MapPin)
- [[types]] - CalendarEventProps type definition

## Used By

TBD

## Notes

- Uses conditional rendering for optional fields (time, location, description)
- Time display shows range format when both startTime and endTime provided
- Includes ARIA labels and roles for accessibility
- Hover effect on card with shadow transition