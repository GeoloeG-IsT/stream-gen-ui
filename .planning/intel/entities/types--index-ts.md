---
source: /root/wks/stream-gen-ui/types/index.ts
indexed: 2026-01-20T00:00:00.000Z
---

# index.ts

## Purpose

Central type definitions file that establishes the shared data contracts for the streaming UI comparison application. Defines TypeScript types and interfaces for message formats, component props, and API interactions to ensure type safety across the codebase.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| MessageFormat | type | Union type of supported streaming formats: 'flowtoken', 'llm-ui', 'streamdown' |
| MESSAGE_FORMATS | const | Readonly array of valid message format values for runtime validation |
| isValidMessageFormat | function | Type guard to validate if a string is a valid MessageFormat |
| ChatMessage | interface | Structure for chat API requests with role and content fields |
| MockStreamOptions | interface | Configuration for mock stream delays (initial and chunk delays) |
| ContactCardProps | interface | Props for ContactCard component (name, email, phone, etc.) |
| CalendarEventProps | interface | Props for CalendarEvent component (title, date, times, location) |
| HeaderProps | type | Empty record type since Header uses usePathname() internally |
| MessageBubbleProps | interface | Props for message display with role, content, streaming state |
| TypingIndicatorProps | interface | Props for typing indicator visibility control |
| MessageListProps | interface | Props for rendering a list of chat messages |
| ChatInputProps | interface | Props for chat input with value, onChange, onSubmit handlers |
| PresetOption | interface | Structure for content preset buttons (id, label, message, icon) |
| PresetSelectorProps | interface | Props for preset selector with onSelect callback |
| RawOutputViewProps | interface | Props for displaying raw markup content |

## Dependencies

| Import | Purpose |
|--------|---------|
| React.ReactNode | Used in MessageBubbleProps for children type |
| React.ChangeEvent | Used in ChatInputProps for input change handler |
| React.FormEvent | Used in ChatInputProps for form submit handler |

## Used By

Utility - used across codebase. Key consumers:
- `/lib/mock-stream.ts` - uses MockStreamOptions for stream configuration
- `/lib/test-content.ts` - uses MessageFormat for content selection
- `/app/api/chat/route.ts` - uses MessageFormat and isValidMessageFormat for request validation
- All component files in `/components/` - use their respective Props interfaces
