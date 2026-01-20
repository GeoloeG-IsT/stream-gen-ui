---
source: /root/wks/stream-gen-ui/lib/test-content.ts
indexed: 2026-01-20T00:00:00.000Z
---

# test-content.ts

## Purpose

Provides pre-defined test content for the streaming demo that includes embedded component markup (ContactCard, CalendarEvent) in both XML format (FlowToken/Streamdown) and delimiter format (llm-ui). Detects keywords in user messages to select appropriate content presets, enabling realistic demo scenarios without a real LLM.

## Exports

| Name | Type | Purpose |
|------|------|---------|
| detectPreset | function | Analyzes user message text to determine which content preset to use (contact, calendar, both, text, multi, event) |
| getTestContent | function | Returns formatted test content string based on message history and target format |

## Dependencies

| Import | Purpose |
|--------|---------|
| MessageFormat (@/types) | Type for supported message formats to select correct content variant |

## Used By

- `/app/api/chat/route.ts` - calls getTestContent() to generate mock LLM responses based on user input and selected format
