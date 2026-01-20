---
source: /root/wks/stream-gen-ui/components/shared/ContactCard.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# ContactCard.tsx

## Purpose

Rich UI component for displaying contact information with avatar, name, email, phone, and address. Demonstrates streaming UI capability to render structured data as interactive cards with clickable email/phone links. Used as a custom component registered with streaming parsers.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| ContactCard | function | React component rendering a styled contact card with optional avatar and contact details |

## Dependencies

| Import | Purpose |
|--------|---------|
| react (ReactElement) | TypeScript type for component return value |
| next/image | Optimized image component for avatar display |
| lucide-react (Mail, MapPin, Phone, User) | Icons for contact detail labels |
| @/types (ContactCardProps) | TypeScript interface for name, email, phone, address, avatar props |

## Used By

- `components/flowtoken/FlowTokenRenderer.tsx` - Registered as custom component for `<contactcard>` tags
- `components/llmui/LlmUiRenderer.tsx` - Registered as custom component
- `components/streamdown/StreamdownRenderer.tsx` - Registered as custom component
- Rendered inline within streamed markdown when parser encounters ContactCard markup
