---
path: /root/wks/stream-gen-ui/frontend/app/flowtoken/page.tsx
type: component
updated: 2026-01-21
status: active
---

# page.tsx

## Purpose

Next.js page component that provides a FlowToken-based chat interface with streaming message support. Manages chat state, message formatting, and auto-scroll behavior for real-time conversation display.

## Exports

- `default` / `FlowTokenPage`: Main page component rendering the FlowToken chat UI with streaming support

## Dependencies

- react (useState, useCallback, useMemo, useRef, useEffect)
- @ai-sdk/react (useChat hook)
- ai (DefaultChatTransport)
- [[root-wks-stream-gen-ui-frontend-components-flowtoken-flowtokenrenderer]]
- [[root-wks-stream-gen-ui-frontend-components-shared-header]]
- [[root-wks-stream-gen-ui-frontend-components-shared-messagebubble]]
- [[root-wks-stream-gen-ui-frontend-components-shared-chatinput]]
- [[root-wks-stream-gen-ui-frontend-components-shared-typingindicator]]
- [[root-wks-stream-gen-ui-frontend-components-shared-entityrenderer]]
- [[root-wks-stream-gen-ui-lib-entity-parser]]

## Used By

TBD

## Notes

- Uses `DefaultChatTransport` with `/api/chat?format=flowtoken` endpoint
- Tracks streaming state via `status === 'streaming'` for last assistant message
- Implements smart auto-scroll that respects user scroll position
- Filters messages to only user/assistant roles, excludes system messages
- Extracts text content from message parts for rendering