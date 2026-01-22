---
path: /root/wks/stream-gen-ui/frontend/app/llm-ui/page.tsx
type: component
updated: 2026-01-21
status: active
---

# page.tsx

## Purpose

Main page component for the LLM-UI demo that provides a chat interface using the AI SDK's useChat hook. Connects to a backend agent API and renders streaming assistant responses using the LLMUIRenderer component.

## Exports

- `default` / `LlmUiPage`: Main page component rendering the chat interface with message history, input form, and streaming support

## Dependencies

- react (useState, useCallback, useMemo, useRef, useEffect)
- @ai-sdk/react (useChat)
- ai (DefaultChatTransport)
- sonner (toast)
- [[root-wks-stream-gen-ui-frontend-components-llm-ui-llmuirenderer]] (LLMUIRenderer)
- [[root-wks-stream-gen-ui-frontend-components-shared-header]] (Header)
- [[root-wks-stream-gen-ui-frontend-components-shared-messagebubble]] (MessageBubble)
- [[root-wks-stream-gen-ui-frontend-components-shared-chatinput]] (ChatInput)
- [[root-wks-stream-gen-ui-frontend-components-shared-stopbutton]] (StopButton)
- [[root-wks-stream-gen-ui-frontend-components-shared-rawoutputpanel]] (RawOutputPanel)
- [[root-wks-stream-gen-ui-frontend-contexts-viewrawcontext]] (useViewRaw)
- [[root-wks-stream-gen-ui-frontend-lib-utils]] (cn)

## Used By

TBD

## Notes

- Uses DefaultChatTransport to connect to configurable backend URL via NEXT_PUBLIC_BACKEND_URL env var
- Implements abort-on-unmount pattern to prevent background streaming
- Filters messages to only user/assistant roles, adds isStreaming flag to last assistant message
- Error handling displays user-friendly toast messages for network/server errors