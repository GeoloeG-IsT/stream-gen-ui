---
phase: quick
plan: 003
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/components/llm-ui/LLMUIRenderer.tsx
autonomous: true

must_haves:
  truths:
    - "Raw 【 and 】 delimiters are not visible to users during streaming"
    - "Parsed blocks still render correctly after streaming completes"
    - "Markdown text streams smoothly with appropriate lag"
  artifacts:
    - path: "frontend/components/llm-ui/LLMUIRenderer.tsx"
      provides: "Throttled streaming with readAheadChars buffer"
      contains: "throttleBasic"
  key_links:
    - from: "LLMUIRenderer.tsx"
      to: "useLLMOutput"
      via: "throttle parameter"
      pattern: "throttle:\\s*throttle"
---

<objective>
Add throttleBasic to LLMUIRenderer to hide raw delimiters during streaming.

Purpose: Currently users see raw 【contact:{...}】 delimiters briefly during streaming before the block parses. The throttle function withholds characters via `readAheadChars`, allowing the parser to recognize and hide formatting before display.

Output: Updated LLMUIRenderer.tsx with throttle configuration that hides delimiter characters during streaming.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@frontend/components/llm-ui/LLMUIRenderer.tsx

Reference (from llm-ui docs):
- throttleBasic controls streaming display rate
- readAheadChars: Characters withheld while streaming (KEY for hiding delimiters)
- Higher readAheadChars = more buffer for parser to detect blocks before display
</context>

<tasks>

<task type="auto">
  <name>Task 1: Add throttleBasic to useLLMOutput</name>
  <files>frontend/components/llm-ui/LLMUIRenderer.tsx</files>
  <action>
    1. Import throttleBasic from @llm-ui/react
    2. Create throttle constant outside component (avoid recreating each render):
       ```typescript
       const throttle = throttleBasic({
         readAheadChars: 15,    // Buffer to hide 【TYPE:{"..."}】 during parsing
         targetBufferChars: 10, // Smooth streaming lag
         adjustPercentage: 0.35,
         frameLookBackMs: 10000,
         windowLookBackMs: 2000,
       });
       ```
    3. Add throttle parameter to useLLMOutput call:
       ```typescript
       const { blockMatches } = useLLMOutput({
         llmOutput: content,
         blocks: [contactBlock, calendarBlock],
         fallbackBlock: markdownBlock,
         isStreamFinished: !isStreaming,
         throttle,  // Add this line
       });
       ```

    Why readAheadChars: 15?
    - 【 is 1 char, 】 is 1 char
    - "contact:" or "calendar:" is 8-9 chars
    - Some JSON content buffer
    - 15 chars gives parser time to recognize block start before display
  </action>
  <verify>
    - npm run lint passes
    - npm run typecheck passes
    - Manual test: Stream a response with contact/calendar blocks; delimiters should not flash
  </verify>
  <done>throttleBasic configured in LLMUIRenderer, delimiters hidden during streaming</done>
</task>

</tasks>

<verification>
- [ ] TypeScript compiles without errors
- [ ] ESLint passes
- [ ] Streaming response does not show raw 【 or 】 characters
- [ ] Parsed contact/calendar blocks render correctly after streaming completes
</verification>

<success_criteria>
- throttleBasic imported and configured with readAheadChars buffer
- useLLMOutput includes throttle parameter
- Streaming UX is smooth with no visible raw delimiters
</success_criteria>

<output>
After completion, create `.planning/quick/003-add-throttle-function-to-hide-raw-delimi/003-SUMMARY.md`
</output>
