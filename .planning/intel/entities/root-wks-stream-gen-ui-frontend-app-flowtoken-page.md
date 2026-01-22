---
path: /root/wks/stream-gen-ui/frontend/app/flowtoken/page.tsx
type: component
updated: 2026-01-21
status: active
---

# page.tsx

## Purpose

Main page component for the FlowToken chat interface. Handles chat state management, message formatting, auto-scrolling behavior, and renders the complete chat UI with streaming support via the AI SDK.

## Exports

- `default` (FlowTokenPage): Main page component that renders the FlowToken chat interface
- `FlowTokenPage`: Named export of the same component

## Dependencies

- react (useState, useCallback, useMemo, useRef, useEffect)
- @ai-sdk/react (useChat)
- ai (DefaultChatTransport)
- [[root-wks-stream-gen-ui-frontend-components-flowtoken-flowtokenrenderer]] (FlowTokenRenderer)
- [[root-wks-stream-gen-ui-frontend-components-shared-header]] (Header)
- [[root-wks-stream-gen-ui-frontend-components-shared-messagebubble]] (MessageBubble)
- [[root-wks-stream-gen-ui-frontend-components-shared-chatinput]] (ChatInput)
- [[root-wks-stream-gen-ui-frontend-components-shared-rawoutputpanel]] (RawOutputPanel)
- [[root-wks-stream-gen-ui-frontend-contexts-viewrawcontext]] (useViewRaw)
- [[root-wks-stream-gen-ui-frontend-lib-utils]] (cn)

## Used By

TBD

## Notes

- Uses `DefaultChatTransport` to connect to backend API at configurable URL via `NEXT_PUBLIC_BACKEND_URL`
- Implements smart auto-scroll that respects user scroll position (tracks `userHasScrolled` state)
- Transforms chat messages to extract text parts and adds `isStreaming` flag for the last assistant message during streaming
- Filters messages to only include user/assistant roles, excluding system messages