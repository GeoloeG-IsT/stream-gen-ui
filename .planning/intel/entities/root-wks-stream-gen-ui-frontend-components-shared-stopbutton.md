---
path: /root/wks/stream-gen-ui/frontend/components/shared/StopButton.tsx
type: component
updated: 2026-01-21
status: active
---

# StopButton.tsx

## Purpose

A reusable UI button component that allows users to stop an ongoing generation or streaming process. Provides visual feedback with a stop icon and accessible labeling.

## Exports

- `StopButton` - React functional component that renders a styled stop button with icon and click handler

## Dependencies

- `lucide-react` - Icon library providing the StopCircle icon
- [[root-wks-stream-gen-ui-lib-utils]] - Utility for className merging via `cn`

## Used By

TBD

## Notes

- Client component ('use client' directive) - cannot be rendered on server
- Follows accessibility best practices with aria-label and aria-hidden on decorative icon
- Accepts className prop for style customization via cn utility