---
phase: quick-001
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - frontend/contexts/ViewRawContext.tsx
  - frontend/components/shared/RawOutputPanel.tsx
  - frontend/components/shared/MessageBubble.tsx
  - frontend/app/flowtoken/page.tsx
  - frontend/app/llm-ui/page.tsx
  - frontend/app/streamdown/page.tsx
autonomous: true

must_haves:
  truths:
    - "When View Raw is ON, a side panel appears showing raw output"
    - "The side panel shows the currently streaming message's raw content"
    - "When View Raw is OFF, no side panel is visible"
    - "Raw output no longer appears inline within message bubbles"
  artifacts:
    - path: "frontend/components/shared/RawOutputPanel.tsx"
      provides: "Side panel component for raw output display"
      min_lines: 30
  key_links:
    - from: "frontend/contexts/ViewRawContext.tsx"
      to: "RawOutputPanel.tsx"
      via: "rawContent state and useViewRaw hook"
      pattern: "rawContent|setRawContent"
---

<objective>
Move raw LLM output display from inline chat bubbles to a dedicated side panel.

Purpose: Improve UX by keeping the chat clean while still providing debug/evaluation access to raw markup in a non-intrusive side panel.

Output: A collapsible side panel that appears when "View Raw" is toggled, showing the raw output of the current/streaming assistant message.
</objective>

<execution_context>
@./.claude/get-shit-done/workflows/execute-plan.md
@./.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@frontend/contexts/ViewRawContext.tsx
@frontend/components/shared/MessageBubble.tsx
@frontend/components/shared/RawOutputView.tsx
@frontend/app/flowtoken/page.tsx
@frontend/app/llm-ui/page.tsx
@frontend/app/streamdown/page.tsx
</context>

<tasks>

<task type="auto">
  <name>Task 1: Extend ViewRawContext and create RawOutputPanel component</name>
  <files>
    frontend/contexts/ViewRawContext.tsx
    frontend/components/shared/RawOutputPanel.tsx
  </files>
  <action>
1. Extend ViewRawContext to include rawContent state:
   - Add `rawContent: string | null` to context value
   - Add `setRawContent: (content: string | null) => void` to context value
   - Initialize rawContent as null in the provider
   - Update the ViewRawContextValue interface

2. Create RawOutputPanel component:
   - Fixed position panel on the right side of the screen
   - Width: ~400px on desktop, full-width on mobile with slide-in animation
   - Only visible when viewRaw is true AND rawContent exists
   - Use existing RawOutputView internally for the content display
   - Add a close button (X) that toggles viewRaw off
   - Add a header with "Raw Output" title
   - Use Tailwind for styling: bg-gray-900, text-gray-100, shadow-lg
   - Panel should be scrollable for long content
   - Position: right: 0, top: 56px (below header), bottom: 0
   - Add smooth slide-in/out transition (transform translateX)

Props interface:
```typescript
interface RawOutputPanelProps {
  isStreaming?: boolean;
}
```

The panel reads rawContent and viewRaw from context.
  </action>
  <verify>
    - TypeScript compiles: `cd frontend && npx tsc --noEmit`
    - ViewRawContext exports setRawContent
    - RawOutputPanel.tsx exists and imports RawOutputView
  </verify>
  <done>
    - ViewRawContext provides rawContent and setRawContent
    - RawOutputPanel component renders conditionally based on viewRaw and rawContent
  </done>
</task>

<task type="auto">
  <name>Task 2: Remove inline raw output and integrate side panel into pages</name>
  <files>
    frontend/components/shared/MessageBubble.tsx
    frontend/app/flowtoken/page.tsx
    frontend/app/llm-ui/page.tsx
    frontend/app/streamdown/page.tsx
  </files>
  <action>
1. Update MessageBubble.tsx:
   - Remove the inline RawOutputView rendering (lines 38-42)
   - Remove the showRawOutput variable
   - Remove the RawOutputView import
   - Keep the rawContent prop but DON'T render it inline
   - MessageBubble no longer needs to consume useViewRaw for rendering (can remove if not needed elsewhere)

2. Update each page file (flowtoken, llm-ui, streamdown):
   - Import RawOutputPanel from '@/components/shared/RawOutputPanel'
   - Import useViewRaw hook (already imported via Header in most cases)
   - In the page component, call useViewRaw() to get setRawContent
   - Add useEffect to update rawContent whenever the last assistant message changes:
     ```typescript
     const { setRawContent } = useViewRaw();
     const lastAssistantMessage = formattedMessages.filter(m => m.role === 'assistant').pop();

     useEffect(() => {
       if (lastAssistantMessage) {
         setRawContent(lastAssistantMessage.content);
       } else {
         setRawContent(null);
       }
     }, [lastAssistantMessage?.content, setRawContent]);
     ```
   - Add RawOutputPanel at the end of the main content area, passing isStreaming prop
   - Update layout: When viewRaw is true, chat container should shrink to make room for panel
     - Change max-w-3xl to a responsive approach: main chat area takes remaining space
     - Use flex layout: chat on left (flex-1), panel on right (fixed width when visible)

Layout structure for each page:
```tsx
<main className="flex-1 overflow-hidden bg-gray-50 pt-14">
  <div className="h-full flex">
    {/* Chat area - shrinks when panel open */}
    <div className={cn(
      "flex-1 flex flex-col transition-all duration-300",
      viewRaw ? "mr-[400px]" : ""
    )}>
      {/* existing chat content with max-w-3xl mx-auto wrapper */}
    </div>
    {/* Side panel - fixed position */}
    <RawOutputPanel isStreaming={isStreaming} />
  </div>
</main>
```
  </action>
  <verify>
    - TypeScript compiles: `cd frontend && npx tsc --noEmit`
    - Run dev server: `cd frontend && npm run dev` and manually test:
      1. Toggle "View Raw" ON - side panel should appear
      2. Send a message - raw content should stream in the panel
      3. Toggle OFF - panel should disappear
      4. Chat area should remain usable and responsive
  </verify>
  <done>
    - MessageBubble no longer renders RawOutputView inline
    - All three page files include RawOutputPanel
    - Raw output appears in side panel instead of inline
    - Chat layout adjusts when panel is open/closed
  </done>
</task>

</tasks>

<verification>
1. TypeScript compilation passes with no errors
2. Visual verification:
   - View Raw toggle shows/hides side panel
   - Panel displays raw markup content
   - Panel scrolls independently of chat
   - Chat area responsive when panel open
3. Streaming verification:
   - During streaming, panel content updates in real-time
   - Cursor indicator shows in panel during streaming
</verification>

<success_criteria>
- Raw output displayed in side panel (right side, ~400px width)
- Side panel only visible when View Raw is ON
- Chat messages no longer show inline raw output
- Panel shows streaming content with cursor indicator
- Smooth transition animation on panel open/close
- Chat area adjusts layout when panel is visible
</success_criteria>

<output>
After completion, create `.planning/quick/001-move-view-raw-output-from-inline-chat-to/001-SUMMARY.md`
</output>
