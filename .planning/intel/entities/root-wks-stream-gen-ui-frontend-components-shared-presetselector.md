---
path: /root/wks/stream-gen-ui/frontend/components/shared/PresetSelector.tsx
type: component
updated: 2026-01-21
status: active
---

# PresetSelector.tsx

## Purpose

Displays a row of preset buttons that allow users to quickly select predefined content scenarios (contact, calendar, both, text-only, multiple items) without typing. Each button triggers a specific message when clicked.

## Exports

- `PresetSelector` - React component rendering preset selection buttons with icons and labels

## Dependencies

- `lucide-react` (external) - Icon components (User, Calendar, HelpCircle, Sparkles, Rocket)
- [[root-wks-stream-gen-ui-lib-utils]] - `cn` utility for className merging
- `@/types` - PresetSelectorProps, PresetOption type definitions

## Used By

TBD

## Notes

- Uses `PRESET_OPTIONS` constant array defining 5 presets: contact, calendar, both, text, multi
- `ICONS` mapping references undefined components (FileText, Layers, Grid) - only User and Calendar are imported from lucide-react
- Button has empty `aria-label={}` which appears to be incomplete/buggy
- Supports disabled state with appropriate styling changes