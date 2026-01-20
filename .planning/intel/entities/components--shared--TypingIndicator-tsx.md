---
source: /root/wks/stream-gen-ui/components/shared/TypingIndicator.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# TypingIndicator.tsx

## Purpose

Animated three-dot typing indicator shown while waiting for assistant response. Provides visual feedback that the system is processing, improving perceived responsiveness during stream initialization.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| TypingIndicator | function | React component displaying animated bouncing dots when isVisible is true |

## Dependencies

| Import | Purpose |
|--------|---------|
| react (ReactElement) | TypeScript type for component return value |
| @/lib/utils (cn) | Conditional className composition |
| @/types (TypingIndicatorProps) | TypeScript props interface with isVisible boolean |

## Used By

- Utility component - used across chat pages to indicate assistant is processing
- Chat page implementations when waiting for initial stream response
