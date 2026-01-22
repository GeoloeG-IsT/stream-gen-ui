---
path: /root/wks/stream-gen-ui/frontend/components/shared/ComponentSkeleton.tsx
type: component
updated: 2026-01-21
status: active
---

# ComponentSkeleton.tsx

## Purpose

A loading placeholder component that displays animated skeleton UI while content is being fetched. Supports two visual variants (contact and calendar) to match the shape of the components they replace.

## Exports

- **ComponentSkeleton**: React component that renders an animated pulse skeleton with type-specific layouts for contact cards (circular avatar + text) or calendar items (square icon + text)

## Dependencies

- [[root-wks-stream-gen-ui-lib-utils]] (`cn` utility for className merging)

## Used By

TBD

## Notes

- Uses Tailwind's `animate-pulse` for the loading animation
- Includes accessibility attributes (`role="status"`, `aria-label`) for screen readers
- The `aria-label` attribute appears to have an empty template literal - may need a value like `Loading ${type}...`