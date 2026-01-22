---
path: /root/wks/stream-gen-ui/frontend/components/shared/RawOutputView.tsx
type: component
updated: 2026-01-21
status: active
---

# RawOutputView.tsx

## Purpose

Displays raw streamed markup content in a monospace font with a dark background. Used for debugging and evaluation purposes to show what each parser is receiving in real-time.

## Exports

- `RawOutputView` - React component that renders raw content with optional streaming cursor animation

## Dependencies

- [[root-wks-stream-gen-ui-lib-utils]] - `cn` utility for className merging
- `@/types` - `RawOutputViewProps` type definition

## Used By

TBD

## Notes

- Accepts `content` (string) and optional `isStreaming` (boolean) props
- Shows a pulsing cursor animation when `isStreaming` is true
- Uses accessible ARIA attributes for screen reader support