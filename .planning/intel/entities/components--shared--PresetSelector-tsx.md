---
source: /root/wks/stream-gen-ui/components/shared/PresetSelector.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# PresetSelector.tsx

## Purpose

Row of quick-select buttons for demo content presets (Contact, Calendar, Both, Text Only, Multiple). Enables rapid testing of different UI component rendering scenarios without typing. Each button triggers a predefined message that the mock API interprets to return specific content types.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| PresetSelector | function | React component displaying labeled icon buttons for each content preset |

## Dependencies

| Import | Purpose |
|--------|---------|
| react (ReactElement) | TypeScript type for component return value |
| lucide-react (User, Calendar, FileText, Layers, Grid) | Icons for each preset button |
| @/lib/utils (cn) | Conditional className composition |
| @/types (PresetSelectorProps, PresetOption) | TypeScript interfaces for props and preset configuration |

## Used By

- `components/shared/ChatInput.tsx` - Rendered above the input field when onPresetSelect callback is provided
- Provides demo workflow: click "Contact" to auto-send "Show me a contact" message
