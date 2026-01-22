---
path: /root/wks/stream-gen-ui/frontend/components/llm-ui/LLMUIRenderer.test.tsx
type: test
updated: 2026-01-22
status: active
---

# LLMUIRenderer.test.tsx

## Purpose

Test suite for the LLMUIRenderer component. Validates the streaming block parsing behavior, component rendering for contact/calendar blocks, and the integration with @llm-ui/react library through comprehensive mocking.

## Exports

None

## Dependencies

- @testing-library/react (external)
- vitest (external)
- [[root-wks-stream-gen-ui-frontend-components-llm-ui-llmuirenderer]]

## Used By

TBD

## Notes

- Mocks the @llm-ui/react package with custom useLLMOutput implementation that simulates block parsing
- Tests delimiter-based block detection using 【】 wrapper pattern with JSON type field
- Validates both contact and calendar block rendering scenarios
- Includes streaming simulation for incomplete block handling