---
status: complete
phase: 04-backend-marker-strategy
source: [04-01-SUMMARY.md, 04-02-SUMMARY.md]
started: 2026-01-21T11:05:00Z
updated: 2026-01-21T20:10:00Z
---

## Current Test

[testing complete]

## Tests

### 1. Default Marker Behavior
expected: Call /api/chat without a marker parameter. Response includes header X-Marker-Strategy: xml (default).
result: pass

### 2. XML Marker Acceptance
expected: Call /api/chat?marker=xml. Returns 200 status with header X-Marker-Strategy: xml.
result: pass

### 3. llm-ui Marker Acceptance
expected: Call /api/chat?marker=llm-ui. Returns 200 status with header X-Marker-Strategy: llm-ui.
result: pass

### 4. Invalid Marker Rejection
expected: Call /api/chat?marker=invalid. Returns 400 status with error message showing valid_values hint.
result: pass

### 5. XML Contact Card Output
expected: With marker=xml, ask about a person (e.g., "Who is Alice?"). Response includes contact info formatted as `<contactcard name="..." email="..." ... />` XML tag.
result: pass

### 6. XML Calendar Event Output
expected: With marker=xml, ask about an event (e.g., "When is the team meeting?"). Response includes event formatted as `<calendarevent title="..." date="..." ... />` XML tag.
result: pass

### 7. llm-ui Contact Card Output
expected: With marker=llm-ui, ask about a person. Response includes contact info formatted as `【CONTACT:{"name":"...","email":"...",...}】` with Chinese brackets.
result: pass

### 8. llm-ui Calendar Event Output
expected: With marker=llm-ui, ask about an event. Response includes event formatted as `【CALENDAR:{"title":"...","date":"...",...}】` with Chinese brackets.
result: pass

## Summary

total: 8
passed: 8
issues: 0
pending: 0
skipped: 0

## Gaps

[none yet]
