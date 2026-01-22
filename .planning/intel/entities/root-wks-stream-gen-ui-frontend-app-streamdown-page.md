---
path: /root/wks/stream-gen-ui/frontend/app/streamdown/page.tsx
type: component
updated: 2026-01-21
status: active
---

# page.tsx

## Purpose

Next.js page component that provides a chat interface using the Streamdown rendering approach. Connects to a backend agent API and renders streamed markdown responses with the StreamdownRenderer component.

## Exports

- `default` / `StreamdownPage`: Main page component with chat functionality, message handling, and Streamdown-based message rendering

## Dependencies

- [[root-wks-stream-gen-ui-frontend-components-streamdown-streamdownrenderer]]: Renders streamed markdown content
- [[root-wks-stream-gen-ui-frontend-components-shared-header]]: Page header component
- [[root-wks-stream-gen-ui-frontend-components-shared-messagebubble]]: Message display wrapper
- [[root-wks-stream-gen-ui-frontend-components-shared-chatinput]]: User input component
- [[root-wks-stream-gen-ui-frontend-components-shared-stopbutton]]: Button to stop streaming
- [[root-wks-stream-gen-ui-frontend-components-shared-rawoutputpanel]]: Panel to view raw output
- [[root-wks-stream-gen-ui-frontend-contexts-viewrawcontext]]: Context for raw view toggle state
- [[root-wks-stream-gen-ui-frontend-lib-utils]]: Utility functions (cn)
- react: State and lifecycle hooks
- @ai-sdk/react: useChat hook for chat functionality
- ai: DefaultChatTransport for API communication
- sonner: Toast notifications for errors

## Used By

TBD

## Notes

- Uses `NEXT_PUBLIC_BACKEND_URL` env var with fallback to hardcoded IP for backend connection
- Appends `?marker=streamdown` to API endpoint for backend routing
- Aborts streaming on component unmount to prevent background processing
- Filters messages to only user/assistant roles, excluding system messages
- Tracks `isStreaming` state to pass to last assistant message for animation purposes