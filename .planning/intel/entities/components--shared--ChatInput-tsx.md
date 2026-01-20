---
source: /root/wks/stream-gen-ui/components/shared/ChatInput.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# ChatInput.tsx

## Purpose

Controlled text input form for composing and sending chat messages. Includes auto-focus behavior after submission, loading state handling, and an optional preset selector for quick demo message injection. Central input component used by all three library implementations.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| ChatInput | function | React component with text input, send button, and optional preset buttons |

## Dependencies

| Import | Purpose |
|--------|---------|
| react (useRef, useEffect, ReactElement) | Ref for input focus management, effect for auto-focus |
| lucide-react (Send) | Send button icon |
| @/components/shared/PresetSelector | Optional row of quick-select demo message buttons |
| @/lib/utils (cn) | Conditional className composition |
| @/types (ChatInputProps) | TypeScript props interface including value, onChange, onSubmit, isLoading, onPresetSelect |

## Used By

- `app/flowtoken/page.tsx` - Chat input for FlowToken implementation
- `app/llm-ui/page.tsx` - Chat input for llm-ui implementation
- `app/streamdown/page.tsx` - Chat input for Streamdown implementation
