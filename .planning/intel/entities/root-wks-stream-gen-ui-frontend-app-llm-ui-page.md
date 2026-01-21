---
path: /root/wks/stream-gen-ui/frontend/app/llm-ui/page.tsx
type: component
updated: 2026-01-21
status: active
---

# page.tsx

## Purpose

Next.js page component that provides a chat interface using the LLM-UI rendering approach. Manages chat state with the AI SDK's useChat hook, handles message submission, and renders streaming AI responses through the LLMUIRenderer component.

## Exports

- `default` / `LlmUiPage` - Main page component rendering the LLM-UI chat interface with Header, message list, ChatInput, and streaming support

## Dependencies

- react (useState, useCallback, useMemo, useRef, useEffect)
- @ai-sdk/react (useChat)
- ai (DefaultChatTransport)
- sonner (toast)
- [[root-wks-stream-gen-ui-frontend-components-llm-ui-llmuirenderer]]
- [[root-wks-stream-gen-ui-frontend-components-shared-header]]
- [[root-wks-stream-gen-ui-frontend-components-shared-messagebubble]]
- [[root-wks-stream-gen-ui-frontend-components-shared-chatinput]]
- [[root-wks-stream-gen-ui-frontend-components-shared-typingindicator]]
- [[root-wks-stream-gen-ui-frontend-components-shared-stopbutton]]

## Used By

TBD

## Notes

- Uses `DefaultChatTransport` with `/api/chat?format=llm-ui` endpoint
- Tracks streaming state via `status === 'streaming'` for the last assistant message
- Implements smart auto-scroll that respects user scroll position
- Filters messages to only user/assistant roles, extracts text parts from message parts array