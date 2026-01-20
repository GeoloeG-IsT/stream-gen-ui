---
source: /root/wks/stream-gen-ui/components/shared/MessageList.tsx
indexed: 2026-01-20T00:00:00.000Z
---

# MessageList.tsx

## Purpose

Scrollable container that renders a list of chat messages with smart auto-scroll behavior. Automatically scrolls to bottom when new messages arrive unless user has scrolled up to read history, preserving user's scroll position during active conversations.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| MessageList | function | React component rendering messages array with auto-scroll and aria-live announcements |

## Dependencies

| Import | Purpose |
|--------|---------|
| react (useEffect, useRef, useState, useCallback, ReactElement) | Refs for scroll container/bottom marker, state for scroll tracking |
| @/lib/utils (cn) | Conditional className composition |
| @/types (MessageListProps) | TypeScript props interface with messages array |
| ./MessageBubble | Renders individual message bubbles |

## Used By

- Generic message list component - may be used by simpler chat implementations
- Note: The three main implementations (FlowToken, llm-ui, Streamdown) use their own specialized message rendering that wraps MessageBubble directly rather than using MessageList
