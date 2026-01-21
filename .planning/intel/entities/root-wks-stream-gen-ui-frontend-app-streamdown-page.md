---
path: /root/wks/stream-gen-ui/frontend/app/streamdown/page.tsx
type: component
updated: 2026-01-21
status: active
---

# page.tsx

## Purpose

Client-side chat page component that demonstrates the Streamdown rendering format. Provides a complete chat interface with message history, streaming responses, auto-scroll behavior, and error handling via toast notifications.

## Exports

- **default** / **StreamdownPage**: Main page component rendering the Streamdown chat interface with Header, message list, typing indicator, stop button, and chat input

## Dependencies

- react (useState, useCallback, useMemo, useRef, useEffect)
- @ai-sdk/react (useChat hook)
- ai (DefaultChatTransport)
- sonner (toast notifications)
- [[root-wks-stream-gen-ui-frontend-components-streamdown-streamdownrenderer]]
- [[root-wks-stream-gen-ui-frontend-components-shared-header]]
- [[root-wks-stream-gen-ui-frontend-components-shared-messagebubble]]
- [[root-wks-stream-gen-ui-frontend-components-shared-chatinput]]
- [[root-wks-stream-gen-ui-frontend-components-shared-typingindicator]]
- [[root-wks-stream-gen-ui-frontend-components-shared-stopbutton]]

## Used By

TBD

## Notes

- Uses `DefaultChatTransport` with `/api/chat?format=streamdown` endpoint
- Implements smart auto-scroll that pauses when user manually scrolls up, resumes when scrolled back to bottom
- Transforms message parts to extract text content and adds `isStreaming` flag for the last assistant message during streaming
- Filters messages to only show user/assistant roles, excluding system messages