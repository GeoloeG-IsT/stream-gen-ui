---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments: []
workflowType: 'research'
lastStep: 1
research_type: 'technical'
research_topic: 'Streaming UI Patterns for AI Chat Interfaces'
research_goals: 'Evaluate 7 solutions for streaming/parsing and rich component rendering in React, including react-markdown, llm-ui, and FlowToken - focusing on composable approaches for structured data display'
user_name: 'GeoloeG'
date: '2026-01-19'
web_research_enabled: true
source_verification: true
---

# Research Report: Technical

**Date:** 2026-01-19
**Author:** GeoloeG
**Research Type:** Technical

---

## Research Overview

[Research overview and methodology will be appended here]

---

## Technical Research Scope Confirmation

**Research Topic:** Streaming UI Patterns for AI Chat Interfaces
**Research Goals:** Evaluate 7 solutions for streaming/parsing and rich component rendering in React, including react-markdown, llm-ui, and FlowToken - focusing on composable approaches for structured data display

**Technical Research Scope:**

- Architecture Analysis - streaming data flow, parser architectures, component composition patterns
- Implementation Approaches - token-by-token rendering, buffered parsing, custom markdown extensions
- Technology Stack - React libraries (react-markdown, llm-ui, FlowToken + 4 more), streaming primitives
- Integration Patterns - library composability, SSE/fetch streaming, Vercel AI SDK patterns
- Performance Considerations - render performance during streaming, virtualization, memory management

**Research Methodology:**

- Current web data with rigorous source verification
- Multi-source validation for critical technical claims
- Confidence level framework for uncertain information
- Comprehensive technical coverage with architecture-specific insights

**Scope Confirmed:** 2026-01-19

---

## Technology Stack Analysis

### The 7 Solutions Overview

Based on comprehensive web research, here are the 7 most promising solutions for streaming UI patterns in React AI chat interfaces:

| # | Library | Primary Focus | Custom Components | Streaming-Optimized |
|---|---------|---------------|-------------------|---------------------|
| 1 | **react-markdown** | Baseline markdown rendering | Via `components` prop | ❌ (needs memoization) |
| 2 | **Vercel Streamdown** | Drop-in react-markdown replacement | Via `components` prop | ✅ Built-in |
| 3 | **llm-ui** | Smooth LLM output rendering | ✅ Extensible blocks | ✅ Frame-rate throttling |
| 4 | **FlowToken** | Animated streaming text | ✅ Regex/tag mapping | ✅ Animation smoothing |
| 5 | **assistant-ui** | Full chat UI framework | ✅ Tool calls, JSON | ✅ Production-ready |
| 6 | **Vercel AI SDK** | Streaming backbone + hooks | Via AI Elements | ✅ Core streaming layer |
| 7 | **@llamaindex/chat-ui** | Composable chat components | ✅ Composable design | ✅ Vercel AI integration |

### Library Deep Dives

#### 1. react-markdown (Baseline)

**What it is:** The most widely used React markdown renderer, built on the unified/remark ecosystem.

**Streaming Challenge:** react-markdown is designed to render complete markdown documents in a single pass. When used with streaming LLM output, it causes severe performance issues:
- Re-parses the entire AST on every token
- Re-renders the full component tree with each update
- Performance degrades exponentially with conversation length

**Custom Components:** Supports custom component mapping via the `components` prop:
```jsx
<ReactMarkdown components={{ h1: CustomH1, code: CodeBlock }} />
```

**Streaming Solutions:**
- **Memoization pattern**: Cache parsed markdown blocks, only re-render changed portions
- **Block-level memoization**: Use unique message IDs for proper caching
- **Alternative**: Switch to Streamdown for drop-in streaming support

**Best For:** Static markdown rendering, non-streaming use cases, or when combined with heavy memoization.

_Sources: [AI SDK Memoization Cookbook](https://ai-sdk.dev/cookbook/next/markdown-chatbot-with-memoization), [remarkjs Discussion #1342](https://github.com/orgs/remarkjs/discussions/1342)_

---

#### 2. Vercel Streamdown

**What it is:** A drop-in replacement for react-markdown, purpose-built for AI streaming scenarios.

**Key Differentiator:** Handles incomplete/unterminated markdown syntax gracefully:
- Parses `**bold` before the closing `**` arrives
- Handles unclosed code blocks, headings, links
- Auto-repairs streaming syntax in real-time

**Features:**
- GitHub Flavored Markdown (GFM) with tables, task lists
- Shiki code highlighting with copy/download buttons
- KaTeX math rendering
- Mermaid diagram support
- CJK language support (critical for ideographic punctuation)
- Built-in security policies against prompt injection

**Custom Components:** Same API as react-markdown - use `components` prop.

**Performance:**
- v2 ships 83.5% smaller bundle than v1
- CDN-based dynamic loading for languages, themes, CSS
- Custom renderer replaced react-markdown internally in v1.6

**Requirements:** Node.js 18+, React 19.1.1+

**Best For:** Direct react-markdown replacement when you need streaming support without architectural changes.

_Sources: [Vercel Streamdown GitHub](https://github.com/vercel/streamdown), [Streamdown.ai](https://streamdown.ai/), [Vercel Changelog](https://vercel.com/changelog/introducing-streamdown)_

---

#### 3. llm-ui

**What it is:** A React library specifically designed for rendering LLM outputs smoothly.

**Key Differentiator:** Frame-rate throttling - renders characters at your display's native frame rate, smoothing out pauses in LLM token generation.

**Features:**
- Removes broken markdown syntax during streaming
- Built-in support for Markdown, JSON, CSV parsing
- Extensible with custom "blocks" for arbitrary content types
- Throttling smooths out variable token generation speeds

**Custom Components:** Define custom "blocks" that can render any content type:
```jsx
// Register custom blocks for structured data
const blocks = [
  { type: 'contact-card', component: ContactCard },
  { type: 'calendar-event', component: CalendarEvent }
];
```

**Architecture:** Uses a block-based parsing system where you define patterns that trigger custom renderers.

**Best For:** When you need smooth token-by-token rendering with custom structured data components.

_Sources: [llm-ui.com](https://llm-ui.com/), [llm-ui GitHub](https://github.com/richardgill/llm-ui), [LogRocket Blog](https://blog.logrocket.com/react-llm-ui/)_

---

#### 4. FlowToken

**What it is:** A UI library focused on animating and styling streaming LLM output.

**Key Differentiator:** Animation-first approach with multiple built-in animations and CSS customization.

**Components:**
- `AnimatedMarkdown` - Markdown with streaming animations
- `StreamText` - Raw text streaming with animations

**Custom Components:** Map regex patterns or custom tag names to React components:
```jsx
customComponents={{
  '<contact>': ContactCard,
  '<calendar>': CalendarWidget,
  /\[EVENT:.*?\]/: EventParser
}}
```

**Animation Features:**
- Multiple built-in animations
- Custom keyframe animations via CSS
- Rate smoothing (moving average) to reduce token speed fluctuations
- Memory optimization: disable animations on completed messages

**Performance:** Lightweight, can disable animations for memory optimization.

**Best For:** When visual presentation and animations are important, and you need regex-based custom component mapping.

_Sources: [FlowToken GitHub](https://github.com/Ephibbs/flowtoken), [npm flowtoken](https://www.npmjs.com/package/flowtoken), [Vercel AI Discussion #2391](https://github.com/vercel/ai/discussions/2391)_

---

#### 5. assistant-ui (Y Combinator backed)

**What it is:** A comprehensive React library for AI chat interfaces with 400k+ monthly downloads.

**Key Differentiator:** Production-ready, composable primitives inspired by Radix UI and cmdk.

**Out-of-box Features:**
- Streaming with auto-scroll
- Retries, attachments, markdown
- Code highlighting, voice input (dictation)
- Keyboard shortcuts, accessibility
- Tool call rendering, JSON as components
- Human approval collection inline

**Architecture:** Instead of a monolithic chat component, provides building blocks:
- Message components
- Input fields
- Attachment handlers
- Streaming renderers
- Composable primitives you assemble and customize

**Integrations:** Works with AI SDK, LangGraph, Mastra, or custom backends.

**Custom Components:** Render tool calls and arbitrary JSON as React components.

**Best For:** Production applications needing a full-featured, accessible chat UI with deep customization.

_Sources: [assistant-ui.com](https://www.assistant-ui.com/), [assistant-ui GitHub](https://github.com/assistant-ui/assistant-ui), [Y Combinator](https://www.ycombinator.com/companies/assistant-ui)_

---

#### 6. Vercel AI SDK (+ AI Elements)

**What it is:** The foundational TypeScript toolkit for building AI applications - the streaming backbone that many other libraries build upon.

**Latest Versions:**
- AI SDK 6 (late 2025) - 20M+ monthly downloads
- AI SDK 5 (July 2025) - Major architectural changes

**Core Hook - useChat:**
- Manages conversation state
- Handles streaming via SSE (Server-Sent Events)
- Built-in loading states
- Decoupled state management (integrates with Zustand, Redux, MobX)
- End-to-end type safety

**AI SDK 5+ Features:**
- Typed chat messages (UIMessage vs ModelMessage)
- Data parts for streaming arbitrary typed data
- Fully typed tool invocations with automatic input streaming
- Type-safe message metadata
- Multi-framework support (React, Vue, Svelte, Angular)

**AI Elements:** New open-source library of customizable React components:
- Message threads, input boxes, reasoning panels
- Built on shadcn/ui
- Designed to work with useChat

**Custom Components:** Via AI Elements or by building on useChat primitives.

**Best For:** The streaming foundation layer - use this as your backbone and layer other libraries on top for UI.

_Sources: [AI SDK Docs](https://ai-sdk.dev/docs/introduction), [AI SDK 6 Blog](https://vercel.com/blog/ai-sdk-6), [AI Elements Changelog](https://vercel.com/changelog/introducing-ai-elements)_

---

#### 7. @llamaindex/chat-ui

**What it is:** React component library from LlamaIndex for building chat interfaces in LLM applications.

**Design Philosophy:** Composable components with minimal styling, fully customizable with Tailwind CSS.

**Components:**
- Pre-built chat components (message bubbles, input fields)
- TypeScript support for type safety
- Easy integration with LLM backends

**Integration:** Works seamlessly with Vercel AI SDK.

**Styling:** Minimal base styling, designed for Tailwind CSS customization.

**Best For:** LlamaIndex users or those wanting minimal, composable chat primitives with Tailwind.

_Sources: [LlamaIndex chat-ui GitHub](https://github.com/run-llama/chat-ui)_

---

### Composability Matrix

How these libraries work together:

| Base Layer | + Rendering | + Animation | Result |
|------------|-------------|-------------|--------|
| Vercel AI SDK (useChat) | Streamdown | - | Streaming markdown chat |
| Vercel AI SDK (useChat) | llm-ui | - | Smooth LLM output + custom blocks |
| Vercel AI SDK (useChat) | react-markdown | FlowToken | Animated streaming (requires memoization) |
| Vercel AI SDK (useChat) | assistant-ui | - | Full production chat UI |
| Vercel AI SDK (useChat) | Streamdown | FlowToken | Streaming markdown + animations |

**Recommended Stack for Your Use Case (Structured Data Components):**

For rendering custom tags like `<contact>`, `<calendar>` from LLM output:

1. **Option A - llm-ui path**: `Vercel AI SDK` → `llm-ui` with custom blocks
2. **Option B - FlowToken path**: `Vercel AI SDK` → `FlowToken` with `customComponents` regex mapping
3. **Option C - MDX path**: `Vercel AI SDK` → `react-markdown-with-mdx` + `html-balancer-stream`

---

### Technology Adoption Trends

**Rising:**
- Streamdown adoption accelerating as react-markdown replacement
- assistant-ui gaining traction (YC backing, 400k+ downloads)
- AI SDK becoming the de facto streaming standard

**Mature:**
- react-markdown (stable but not streaming-optimized)
- Vercel AI SDK (industry standard)

**Emerging:**
- llm-ui (specialized for LLM UX challenges)
- FlowToken (animation-focused niche)

_Research completed: 2026-01-19_

---

## Integration Patterns Analysis

### Streaming Protocols

#### Server-Sent Events (SSE) - The New Standard

As of AI SDK 5 (July 2025), **SSE replaced WebSockets** as the standard streaming protocol:

| Protocol | Use Case | Pros | Cons |
|----------|----------|------|------|
| **SSE** | Default for AI SDK 5+ | Browser-native, debuggable, robust | Unidirectional only |
| **WebSocket** | Real-time bidirectional | Full duplex, low latency | More complex, harder to debug |
| **Fetch Streaming** | Client-only apps | No server required | Limited browser support |

**AI SDK 5 SSE Implementation:**
```typescript
// Server: return SSE-compatible stream
return toUIMessageStreamResponse(result);

// Client: useChat handles SSE automatically
const { messages, input } = useChat();
```

**Flexible Transport System:** AI SDK 5 allows swapping the default fetch-based transport for custom implementations:
- WebSockets for real-time bidirectional
- Direct LLM provider connection for client-only apps
- Custom transports for specialized backends

_Sources: [AI SDK Stream Protocol](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol), [AI SDK 5 Blog](https://vercel.com/blog/ai-sdk-5)_

---

### Custom Component Registration Patterns

Each library has a distinct API for mapping custom components to LLM output:

#### 1. react-markdown / Streamdown - `components` Prop

```jsx
<ReactMarkdown
  components={{
    // Map HTML elements to custom components
    h1: CustomHeading,
    code: ({ node, inline, ...props }) =>
      inline ? <InlineCode {...props} /> : <CodeBlock {...props} />,
    // Custom elements (requires plugin)
    contact: ContactCard,
  }}
  remarkPlugins={[remarkGfm]}
  rehypePlugins={[rehypeSlug]}
/>
```

**Extensibility:** Use remark/rehype plugins to:
- Parse custom syntax into AST nodes
- Transform nodes before rendering
- Add custom node types that map to components

_Source: [react-markdown GitHub](https://github.com/remarkjs/react-markdown)_

---

#### 2. llm-ui - Block-Based System

```jsx
// Define custom blocks with matchers and renderers
const contactBlock = {
  // Matcher: regex or function to identify block in stream
  matcher: regexMatcher(/【CONTACT:(.*?)】/s),

  // Component receives parsed content
  component: ({ blockMatch }) => {
    const data = JSON.parse(blockMatch.groups[1]);
    return <ContactCard {...data} />;
  },

  // Look-back function for streaming UX
  lookBack: ({ output, isComplete, visibleTextLengthTarget }) => {
    // Control what's visible during streaming
  }
};

// Use in hook
const { blockMatches } = useLLMOutput({
  llmOutput: streamingText,
  blocks: [contactBlock, calendarBlock, markdownBlock],
  fallbackBlock: markdownFallback,
});
```

**Key Concepts:**
- **Matchers**: Identify patterns in streaming text (delimiters like `【】` or `⦅⦆`)
- **Look-back**: Control what's visible during incomplete streaming
- **Fallback block**: Handle unmatched content (usually markdown)

_Sources: [llm-ui.com](https://llm-ui.com/), [Custom Blocks DeepWiki](https://deepwiki.com/richardgill/llm-ui/4.2-custom-blocks)_

---

#### 3. FlowToken - `customComponents` Map

```jsx
<AnimatedMarkdown
  content={streamingContent}
  animation="dropIn"
  customComponents={{
    // XML tag syntax (recommended)
    'ContactCard': ContactCard,
    'CalendarEvent': CalendarWidget,

    // Regex patterns (alternative)
    '/\\{\\{contact:.*?\\}\\}/': ContactParser,
  }}
  htmlComponents={{
    // Override standard HTML elements
    code: CodeHighlighter,
    h1: CustomHeading,
  }}
/>
```

**LLM Prompting:** Instruct LLM to output `<ContactCard name="John" email="john@example.com" />` syntax.

_Sources: [FlowToken GitHub](https://github.com/Ephibbs/flowtoken), [npm flowtoken](https://www.npmjs.com/package/flowtoken)_

---

#### 4. assistant-ui - `makeAssistantToolUI`

```tsx
import { makeAssistantToolUI } from "@assistant-ui/react";

// Register tool UI component
const ContactToolUI = makeAssistantToolUI({
  toolName: "show_contact",
  render: ({ args, result, status }) => {
    if (status === "running") return <ContactCardSkeleton />;
    if (status === "complete") return <ContactCard {...result} />;
    return null;
  },
});

// Use in app
<AssistantProvider>
  <ContactToolUI />
  <Thread />
</AssistantProvider>
```

**Render Props Available:**
- `args` - Tool arguments from LLM
- `result` - Tool execution result (may be partial during streaming)
- `status` - `"running"` | `"complete"` | `"error"`
- `toolCallId`, `toolName` - Metadata
- `addResult`, `resume` - Interactive callbacks

**Key Insight:** Tool execution happens on backend; UI component only renders the visualization.

_Sources: [assistant-ui ToolUI Guide](https://www.assistant-ui.com/docs/guides/ToolUI), [makeAssistantToolUI API](https://www.assistant-ui.com/docs/copilots/make-assistant-tool-ui)_

---

### Data Flow Patterns

#### Pattern A: Markdown with Custom Tags (FlowToken/Streamdown)

```
LLM Output → Stream Parser → AST → Component Mapper → React Components
     ↓
"Hello! Here's the contact:
<ContactCard name='John' />"
     ↓
[TextNode, ContactCardNode]
     ↓
<>
  <p>Hello! Here's the contact:</p>
  <ContactCard name="John" />
</>
```

**Pros:** Natural markdown flow, familiar syntax
**Cons:** Requires XML-safe LLM output, parsing complexity

---

#### Pattern B: Delimiter-Based Blocks (llm-ui)

```
LLM Output → Block Matcher → Parsed Blocks → Block Renderers
     ↓
"Here's the contact:
【CONTACT:{"name":"John","email":"john@example.com"}】"
     ↓
[{ type: 'markdown', content: "Here's the contact:" },
 { type: 'contact', data: { name: 'John', email: '...' } }]
     ↓
<>
  <Markdown>Here's the contact:</Markdown>
  <ContactCard name="John" email="..." />
</>
```

**Pros:** Clear delimiters, JSON data inside, streaming-friendly
**Cons:** Less natural syntax, requires LLM training

---

#### Pattern C: Tool Calls (assistant-ui)

```
LLM API → Tool Call → Backend Execution → UI Stream
     ↓
{ tool_calls: [{ name: "show_contact", args: { name: "John" } }] }
     ↓
Backend executes tool, streams result
     ↓
<ContactToolUI args={...} result={...} status="complete" />
```

**Pros:** Type-safe, secure (execution on backend), standard API pattern
**Cons:** Requires backend, more infrastructure

---

### XML Tag Parsing for Structured Data

#### Why XML Works Well with LLMs

LLMs are trained on massive amounts of XML/HTML, making them adept at generating well-formed tags. Benefits:
- Natural for LLMs to produce
- Clear boundaries for parsing
- Attributes carry structured data
- Handles streaming gracefully (can detect incomplete tags)

#### Libraries for XML Parsing from LLM Streams

| Library | Streaming | Use Case |
|---------|-----------|----------|
| **llm-xml-parser** | ✅ Yes | Real-time XML parsing, SSE support |
| **xmllm** | ✅ Yes | Schema-based extraction, lenient parsing |
| **html-balancer-stream** | ✅ Yes | Auto-close unclosed tags for streaming |

**xmllm Approach:**
```javascript
// Define schema
const schema = {
  contact: { name: String, email: String }
};

// Stream parses and validates
const result = await stream(llmOutput, schema);
// { contact: { name: "John", email: "john@example.com" } }
```

_Sources: [llm-xml-parser GitHub](https://github.com/ocherry341/llm-xml-parser), [xmllm GitHub](https://github.com/padolsey/xmllm)_

---

### Library Composability Patterns

#### Recommended Integration Stack

```
┌─────────────────────────────────────────────────────────────┐
│                     Your React App                          │
├─────────────────────────────────────────────────────────────┤
│  UI Layer                                                   │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────┐ │
│  │ FlowToken   │  │ Streamdown   │  │ assistant-ui       │ │
│  │ (animation) │  │ (markdown)   │  │ (full chat UI)     │ │
│  └──────┬──────┘  └──────┬───────┘  └─────────┬──────────┘ │
│         │                │                     │            │
├─────────┴────────────────┴─────────────────────┴────────────┤
│  Parsing Layer                                              │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ llm-ui (block parsing) OR custom XML parser             ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Streaming Layer                                            │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Vercel AI SDK (useChat, SSE, state management)          ││
│  └─────────────────────────────────────────────────────────┘│
├─────────────────────────────────────────────────────────────┤
│  Backend                                                    │
│  ┌─────────────────────────────────────────────────────────┐│
│  │ Next.js API Routes / Edge Functions / serverless        ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

#### Composition Examples

**Example 1: Vercel AI SDK + llm-ui**
```jsx
import { useChat } from 'ai/react';
import { useLLMOutput } from '@llm-ui/react';

function Chat() {
  const { messages } = useChat();

  return messages.map(m => (
    <Message key={m.id}>
      <LLMOutput
        llmOutput={m.content}
        blocks={[contactBlock, calendarBlock]}
      />
    </Message>
  ));
}
```

**Example 2: Vercel AI SDK + FlowToken**
```jsx
import { useChat } from 'ai/react';
import { AnimatedMarkdown } from 'flowtoken';

function Chat() {
  const { messages } = useChat();

  return messages.map(m => (
    <AnimatedMarkdown
      key={m.id}
      content={m.content}
      customComponents={{ ContactCard, CalendarEvent }}
      animation={m.role === 'assistant' ? 'dropIn' : null}
    />
  ));
}
```

**Example 3: Vercel AI SDK + Streamdown + Custom Parser**
```jsx
import { useChat } from 'ai/react';
import { Streamdown } from 'streamdown';
import { parseCustomTags } from './customParser';

function Chat() {
  const { messages } = useChat();

  return messages.map(m => {
    const { markdown, customComponents } = parseCustomTags(m.content);
    return (
      <>
        <Streamdown content={markdown} />
        {customComponents.map(c => renderCustomComponent(c))}
      </>
    );
  });
}
```

---

### Integration Security Considerations

| Concern | Mitigation |
|---------|------------|
| **XSS from LLM output** | Sanitize HTML, use allowlists for components |
| **Prompt injection** | Streamdown has built-in security policies |
| **Arbitrary code execution** | Never use `eval()` or `dangerouslySetInnerHTML` with LLM output |
| **MDX security** | Use strict component allowlists, validate props with zod |

**Best Practice:** Register only specific, approved components. Never dynamically render arbitrary component names from LLM output.

_Research completed: 2026-01-19_

---

## Architectural Patterns and Design

### System Architecture for Streaming AI Chat

#### The Fundamental Challenge

"Building a modern AI chat interface in React presents a unique set of state management challenges. It's far more complex than a simple form or a standard data display. We need to gracefully handle a continuous, asynchronous stream of messages, manage complex loading states to provide clear user feedback, and keep the entire UI perfectly synchronized."

**Key Architectural Requirements:**
1. **Optimistic Updates** - UI updates instantly when user sends message
2. **Streaming State** - Show "thinking"/"typing" indicators
3. **Input Locking** - Prevent race conditions during generation
4. **Chunk-by-Chunk Appending** - Progressive message rendering
5. **Custom Component Injection** - Parse and render structured data inline

_Source: [shadcn AI Components](https://www.shadcn.io/ai)_

---

### Component Architecture Patterns

#### Pattern 1: Container/Presentation Separation

```
┌─────────────────────────────────────────────────────────┐
│  ChatContainer (Smart)                                  │
│  - useChat() hook (streaming state)                     │
│  - Message history                                      │
│  - Input handling                                       │
│  - Error boundaries                                     │
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  MessageList (Presentation)                         ││
│  │  - Virtualized list                                 ││
│  │  - Auto-scroll logic                                ││
│  │                                                     ││
│  │  ┌─────────────────────────────────────────────────┐││
│  │  │  Message (Presentation)                         │││
│  │  │  - Role indicator                               │││
│  │  │  - Streaming content renderer                   │││
│  │  │  - Custom component slots                       │││
│  │  └─────────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────────┘│
│                                                         │
│  ┌─────────────────────────────────────────────────────┐│
│  │  ChatInput (Presentation)                           ││
│  │  - Textarea with submit                             ││
│  │  - Disabled state during streaming                  ││
│  └─────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────┘
```

**Rationale:** Smart/dumb component separation keeps streaming logic isolated and presentation components reusable and testable.

---

#### Pattern 2: Compound Components (assistant-ui style)

```jsx
<AssistantProvider>
  <Thread>
    <Thread.Messages>
      <Message.If user>
        <UserMessage />
      </Message.If>
      <Message.If assistant>
        <AssistantMessage>
          <Message.Content />
          <Message.ToolCalls>
            <ToolUI toolName="contact" render={ContactCard} />
            <ToolUI toolName="calendar" render={CalendarWidget} />
          </Message.ToolCalls>
        </AssistantMessage>
      </Message.If>
    </Thread.Messages>
    <Thread.Input />
  </Thread>
</AssistantProvider>
```

**Rationale:** Compound components share implicit state (via Context) while exposing flexible composition. Users can rearrange, style, or replace any piece.

_Source: [assistant-ui Architecture](https://www.assistant-ui.com/)_

---

#### Pattern 3: Slot Pattern for Custom Components

```jsx
// Define slots for different content types
<StreamingMessage content={message.content}>
  <ContentSlot type="markdown" component={MarkdownRenderer} />
  <ContentSlot type="contact" component={ContactCard} />
  <ContentSlot type="calendar" component={CalendarEvent} />
  <ContentSlot type="code" component={CodeBlock} />
  <FallbackSlot component={RawText} />
</StreamingMessage>
```

**Rationale:** Slot pattern allows component injection without modifying the message renderer itself. Parser routes content to appropriate slots.

---

### State Management Architecture

#### Recommended Approach: Decoupled State with useChat

```
┌──────────────────────────────────────────────────────────┐
│                    State Architecture                     │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────┐     ┌─────────────────────────────────┐│
│  │ useChat()   │────▶│ External Store (Optional)       ││
│  │ (AI SDK)    │     │ Zustand / Redux / MobX          ││
│  └─────────────┘     └─────────────────────────────────┘│
│        │                                                 │
│        │ messages, isLoading, error                      │
│        ▼                                                 │
│  ┌─────────────────────────────────────────────────────┐│
│  │ Local Component State                               ││
│  │ - Input value (useState)                            ││
│  │ - UI state (expanded, focused)                      ││
│  └─────────────────────────────────────────────────────┘│
│                                                          │
└──────────────────────────────────────────────────────────┘
```

**AI SDK 5 Decoupled State:**
- Hook state is fully decoupled from React
- Integrates with Zustand, Redux, MobX
- Share chat state across entire application
- Enables persistent conversation history

**State Categories:**

| Category | Tool | Use Case |
|----------|------|----------|
| **Server State** | useChat (AI SDK) | Messages, streaming, LLM communication |
| **Client State** | useState/useReducer | Input, UI toggles, local preferences |
| **Global State** | Zustand (optional) | Cross-component chat sharing, persistence |
| **Derived State** | useMemo | Parsed blocks, filtered messages |

_Sources: [React State Management 2025](https://www.developerway.com/posts/react-state-management-2025), [AI SDK 5](https://vercel.com/blog/ai-sdk-5)_

---

### Performance Architecture

#### The Streaming Re-render Problem

"Regular text components don't handle markdown that renders character by character without flickering." Every new token triggers a re-render, and naive implementations re-parse and re-render the entire message history.

#### Solution 1: React Compiler (Automatic Memoization)

React 19+ with React Compiler automatically memoizes components:
- Zero code changes required
- Meta reports 12% faster initial loads, >2.5× faster interactions
- Manual `useMemo`/`useCallback` becomes escape hatch, not standard practice

**Caveat:** Compiler won't save architectural issues like overly broad context providers.

_Source: [React 19.2 Changelog](https://www.econify.com/news/react-19-2-brings-smarter-rendering-and-event-handling)_

---

#### Solution 2: Block-Level Memoization

```jsx
// Memoize at block level, not message level
const MemoizedBlock = React.memo(({ block, id }) => {
  return <BlockRenderer block={block} />;
});

function Message({ content }) {
  const blocks = useMemo(() => parseBlocks(content), [content]);

  return blocks.map((block, i) => (
    <MemoizedBlock
      key={`${messageId}-${i}`}
      block={block}
      id={`${messageId}-${i}`}
    />
  ));
}
```

**Key Insight:** Only new/changed blocks re-render. Completed blocks stay cached.

_Source: [AI SDK Memoization Cookbook](https://ai-sdk.dev/cookbook/next/markdown-chatbot-with-memoization)_

---

#### Solution 3: Virtualization for Long Conversations

```jsx
import { FixedSizeList } from 'react-window';

function VirtualizedMessageList({ messages }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={messages.length}
      itemSize={100} // Estimated row height
    >
      {({ index, style }) => (
        <div style={style}>
          <Message message={messages[index]} />
        </div>
      )}
    </FixedSizeList>
  );
}
```

**Benchmarks:** Rendering only visible rows provides >80% performance improvement for long lists.

**Libraries:**
- `react-window` (lightweight, recommended)
- `react-virtualized` (full-featured)
- `@tanstack/react-virtual` (headless)

_Source: [Syncfusion Blog](https://www.syncfusion.com/blogs/post/render-large-datasets-in-react)_

---

### Rendering Pipeline Architecture

#### For Custom Component Injection

```
┌─────────────────────────────────────────────────────────────────┐
│                    Rendering Pipeline                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 1. STREAMING LAYER                                              │
│    useChat() → SSE stream → accumulating string                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. PARSING LAYER                                                │
│    ┌─────────────────────────────────────────────────────────┐  │
│    │ Option A: llm-ui block matchers                         │  │
│    │ Option B: Custom XML parser (llm-xml-parser)            │  │
│    │ Option C: remark/rehype plugins                         │  │
│    └─────────────────────────────────────────────────────────┘  │
│    Output: Array of typed blocks                                │
│    [{ type: 'markdown', content: '...' },                       │
│     { type: 'contact', data: {...} },                           │
│     { type: 'markdown', content: '...' }]                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. COMPONENT REGISTRY                                           │
│    const registry = {                                           │
│      markdown: MarkdownRenderer,                                │
│      contact: ContactCard,                                      │
│      calendar: CalendarWidget,                                  │
│      code: CodeBlock,                                           │
│    };                                                           │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. RENDER LOOP                                                  │
│    blocks.map(block => {                                        │
│      const Component = registry[block.type] || Fallback;        │
│      return <Component key={block.id} {...block.data} />;       │
│    })                                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

### Design Principles for Streaming UI

#### 1. Progressive Enhancement
- Show something immediately (loading skeleton)
- Render markdown as it streams (not after completion)
- Inject custom components when their data is complete

#### 2. Graceful Degradation
- Incomplete tags → show as raw text or loading state
- Parse errors → fallback to markdown or raw display
- Network failures → retry with exponential backoff

#### 3. Optimistic UI
- User message appears instantly
- "Thinking" indicator while waiting for first token
- Input disabled to prevent race conditions

#### 4. Separation of Concerns
- Streaming logic (useChat) → isolated hook
- Parsing logic → pure functions, easily testable
- Rendering logic → presentational components

---

### Architectural Decision Records (ADRs)

#### ADR-1: Parser Selection

| Option | Streaming | Custom Tags | Complexity |
|--------|-----------|-------------|------------|
| remark/rehype plugins | ⚠️ Partial | ✅ Full | High |
| llm-ui blocks | ✅ Native | ✅ Full | Medium |
| FlowToken customComponents | ✅ Native | ✅ Regex/XML | Low |
| Custom XML parser | ✅ Native | ✅ Full | Medium |

**Recommendation:** For your prototype, start with **FlowToken** (lowest complexity) or **llm-ui** (best streaming UX). Graduate to custom parser if you need full control.

---

#### ADR-2: State Management

| Option | Streaming Support | Persistence | Complexity |
|--------|------------------|-------------|------------|
| useChat only | ✅ Built-in | ❌ None | Low |
| useChat + Zustand | ✅ Built-in | ✅ Easy | Medium |
| useChat + Redux | ✅ Built-in | ✅ Full | High |

**Recommendation:** Start with **useChat only**. Add Zustand if you need cross-component state sharing or persistence.

---

#### ADR-3: Performance Strategy

| Stage | Optimization | Tools |
|-------|--------------|-------|
| **Baseline** | React Compiler | React 19+ |
| **Block-level** | Memoization | React.memo + useMemo |
| **Long chats** | Virtualization | react-window |
| **Heavy parsing** | Web Workers | Comlink |

**Recommendation:** Start with React Compiler (free perf). Add block memoization next. Only virtualize if conversations exceed ~100 messages.

_Research completed: 2026-01-19_

---

## Implementation Recommendations for stream-gen-ui

### Executive Summary

Based on comprehensive research across 7 libraries, integration patterns, and architectural approaches, this prototype will implement **3 different approaches on separate pages** to compare streaming UI patterns for custom component rendering side-by-side.

---

### Prototype Architecture: 3 Implementations

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PROTOTYPE STRUCTURE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  Header Navigation                                              │ │
│  │  [FlowToken] | [llm-ui] | [Streamdown+Custom]                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  /flowtoken     - FlowToken implementation                      │ │
│  │  /llm-ui        - llm-ui block-based implementation             │ │
│  │  /streamdown    - Streamdown + custom XML parser                │ │
│  └────────────────────────────────────────────────────────────────┘ │
│                                                                      │
│  Shared:                                                             │
│  - Vercel AI SDK (useChat) - streaming backbone                     │
│  - Same custom components (ContactCard, CalendarEvent, etc.)        │
│  - Same /api/chat endpoint                                          │
│  - Same styling (Tailwind CSS)                                      │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Shared Foundation

```
┌─────────────────────────────────────────────────────────┐
│                  SHARED STACK                            │
├─────────────────────────────────────────────────────────┤
│  Framework:       Next.js 14+ (App Router)              │
│  Streaming:       Vercel AI SDK (useChat)               │
│  Styling:         Tailwind CSS                          │
│  Backend:         Single /api/chat endpoint             │
│  Components:      Shared ContactCard, CalendarEvent     │
└─────────────────────────────────────────────────────────┘
```

---

### Implementation 1: FlowToken (`/flowtoken`)

**Approach:** XML tag-based custom components with animations

**Why Include:**
- Lowest complexity for custom component mapping
- Native XML tag support (`<ContactCard />`, `<CalendarEvent />`)
- Built-in animations for streaming text
- Direct integration with Vercel AI SDK

**Sample Implementation:**
```jsx
// app/flowtoken/page.tsx
import { useChat } from 'ai/react';
import { AnimatedMarkdown } from 'flowtoken';
import 'flowtoken/dist/styles.css';
import { ContactCard, CalendarEvent, CodeBlock } from '@/components/custom';

export default function FlowTokenChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id} className={m.role === 'user' ? 'text-right' : ''}>
            <AnimatedMarkdown
              content={m.content}
              animation={m.role === 'assistant' && isLoading ? 'fadeIn' : null}
              customComponents={{
                'ContactCard': ContactCard,
                'CalendarEvent': CalendarEvent,
              }}
              htmlComponents={{
                code: CodeBlock,
              }}
            />
          </div>
        ))}
      </div>
      <ChatInput input={input} onChange={handleInputChange} onSubmit={handleSubmit} disabled={isLoading} />
    </div>
  );
}
```

**LLM Output Format:**
```
Here's the contact you requested:
<ContactCard name="John Doe" email="john@example.com" phone="+1-555-0123" />
```

---

### Implementation 2: llm-ui (`/llm-ui`)

**Approach:** Delimiter-based block matching with frame-rate throttling

**Why Include:**
- Smoothest streaming UX (frame-rate throttling)
- More control over streaming behavior via look-back functions
- JSON payloads inside delimiters for structured data

**Sample Implementation:**
```jsx
// app/llm-ui/page.tsx
import { useChat } from 'ai/react';
import { useLLMOutput } from '@llm-ui/react';
import { markdownLookBack } from '@llm-ui/markdown';
import { ContactCard, CalendarEvent } from '@/components/custom';

const contactBlock = {
  matcher: /【CONTACT:(.*?)】/s,
  component: ({ blockMatch }) => {
    const jsonStr = blockMatch.output.match(/【CONTACT:(.*?)】/s)?.[1];
    const data = JSON.parse(jsonStr || '{}');
    return <ContactCard {...data} />;
  },
  lookBack: markdownLookBack,
};

const calendarBlock = {
  matcher: /【CALENDAR:(.*?)】/s,
  component: ({ blockMatch }) => {
    const jsonStr = blockMatch.output.match(/【CALENDAR:(.*?)】/s)?.[1];
    const data = JSON.parse(jsonStr || '{}');
    return <CalendarEvent {...data} />;
  },
  lookBack: markdownLookBack,
};

function LLMUIMessage({ content }) {
  const { blockMatches } = useLLMOutput({
    llmOutput: content,
    blocks: [contactBlock, calendarBlock],
    fallbackBlock: { component: MarkdownRenderer, lookBack: markdownLookBack },
  });

  return blockMatches.map((block, i) => {
    const Component = block.component;
    return <Component key={i} blockMatch={block} />;
  });
}

export default function LLMUIChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => (
          <div key={m.id}>
            <LLMUIMessage content={m.content} />
          </div>
        ))}
      </div>
      <ChatInput input={input} onChange={handleInputChange} onSubmit={handleSubmit} disabled={isLoading} />
    </div>
  );
}
```

**LLM Output Format:**
```
Here's the contact you requested:
【CONTACT:{"name":"John Doe","email":"john@example.com","phone":"+1-555-0123"}】
```

---

### Implementation 3: Streamdown + Custom Parser (`/streamdown`)

**Approach:** Vercel's Streamdown for markdown + custom XML parser layer

**Why Include:**
- Most flexible/customizable approach
- Demonstrates building your own parsing layer
- Combines Streamdown's streaming markdown with custom extraction

**Sample Implementation:**
```jsx
// app/streamdown/page.tsx
import { useChat } from 'ai/react';
import { Streamdown } from 'streamdown';
import { extractCustomTags, renderCustomComponent } from '@/lib/customParser';

export default function StreamdownChat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((m) => {
          // Extract custom tags and remaining markdown
          const { markdown, customBlocks } = extractCustomTags(m.content);

          return (
            <div key={m.id}>
              {/* Render markdown with Streamdown */}
              <Streamdown content={markdown} />

              {/* Render custom components */}
              {customBlocks.map((block, i) => (
                <div key={i}>{renderCustomComponent(block)}</div>
              ))}
            </div>
          );
        })}
      </div>
      <ChatInput input={input} onChange={handleInputChange} onSubmit={handleSubmit} disabled={isLoading} />
    </div>
  );
}

// lib/customParser.ts
export function extractCustomTags(content: string) {
  const customBlocks: Array<{ type: string; props: Record<string, string> }> = [];
  const tagRegex = /<(ContactCard|CalendarEvent)\s+([^>]*)\/>/g;

  let markdown = content;
  let match;

  while ((match = tagRegex.exec(content)) !== null) {
    const [fullMatch, tagName, propsStr] = match;
    const props = parseProps(propsStr);
    customBlocks.push({ type: tagName, props });
    markdown = markdown.replace(fullMatch, ''); // Remove from markdown
  }

  return { markdown: markdown.trim(), customBlocks };
}

function parseProps(propsStr: string): Record<string, string> {
  const props: Record<string, string> = {};
  const propRegex = /(\w+)="([^"]*)"/g;
  let match;
  while ((match = propRegex.exec(propsStr)) !== null) {
    props[match[1]] = match[2];
  }
  return props;
}

export function renderCustomComponent(block: { type: string; props: Record<string, string> }) {
  switch (block.type) {
    case 'ContactCard':
      return <ContactCard {...block.props} />;
    case 'CalendarEvent':
      return <CalendarEvent {...block.props} />;
    default:
      return null;
  }
}
```

**LLM Output Format:** Same as FlowToken (XML tags)
```
Here's the contact you requested:
<ContactCard name="John Doe" email="john@example.com" phone="+1-555-0123" />
```

---

### Comparison Matrix

| Aspect | FlowToken | llm-ui | Streamdown+Custom |
|--------|-----------|--------|-------------------|
| **Complexity** | Low | Medium | Medium-High |
| **Streaming UX** | Good (animations) | Excellent (frame-rate) | Good |
| **Custom Components** | XML tags | Delimiters + JSON | XML tags |
| **Flexibility** | Medium | High | Highest |
| **Bundle Size** | Small | Medium | Small + custom |
| **Learning Curve** | Easy | Medium | Medium |
| **LLM Prompt Style** | `<Tag prop="val" />` | `【TYPE:json】` | `<Tag prop="val" />` |

---

### Implementation Roadmap

#### Phase 1: Foundation & Shared Infrastructure

**Goal:** Set up Next.js app with shared components and navigation

| Task | Details | Effort |
|------|---------|--------|
| Initialize Next.js 14+ with App Router | TypeScript, Tailwind CSS | Low |
| Create header navigation component | Links to /flowtoken, /llm-ui, /streamdown | Low |
| Implement `/api/chat` route | Single endpoint for all implementations | Low |
| Build shared custom components | ContactCard, CalendarEvent, CodeBlock | Medium |
| Create shared ChatInput component | Reusable across all pages | Low |
| Set up shared layout | Header + page content structure | Low |

**Deliverable:** App shell with navigation and shared components

---

#### Phase 2: Implement All Three Pages

**Goal:** Complete all 3 streaming implementations

| Task | Page | Effort |
|------|------|--------|
| FlowToken implementation | `/flowtoken` | Medium |
| llm-ui implementation | `/llm-ui` | Medium |
| Streamdown + custom parser | `/streamdown` | Medium-High |
| Configure LLM system prompts | Per-implementation format | Low |

**Deliverable:** All 3 implementations working side-by-side

---

#### Phase 3: Polish & Comparison Features

**Goal:** Add features to facilitate comparison

| Task | Details | Effort |
|------|---------|--------|
| Add performance metrics display | Time-to-first-token, render time | Medium |
| Add loading/typing indicators | Consistent across implementations | Low |
| Implement error boundaries | Graceful fallbacks | Low |
| Auto-scroll on new messages | Consistent UX | Low |
| Add "view source" toggle | Show raw LLM output vs rendered | Medium |

**Deliverable:** Polished prototype with comparison tools

---

#### Phase 4: Documentation & Evaluation

| Task | Details | Effort |
|------|---------|--------|
| Document pros/cons of each | Based on implementation experience | Low |
| Performance benchmarks | Side-by-side metrics | Medium |
| Write evaluation summary | Recommendation for production use | Low |

---

### LLM Prompting Strategy

For custom component rendering, prompt the LLM to output specific syntax:

**System Prompt Example:**
```
You are a helpful assistant. When displaying contact information,
use the following XML format:

<ContactCard
  name="John Doe"
  email="john@example.com"
  phone="+1-555-0123"
  avatar="https://..."
/>

When displaying calendar events, use:

<CalendarEvent
  title="Meeting with Team"
  date="2026-01-20"
  time="14:00"
  duration="1h"
  location="Zoom"
/>

Always close tags properly. Only use these components when
the user asks about contacts or schedules.
```

**Key Prompting Tips:**
- Be explicit about tag format and attributes
- Provide examples in the system prompt
- Instruct LLM to close tags properly
- Define when to use each component type

---

### Testing Strategy

#### Unit Tests (Components)

```jsx
// ContactCard.test.tsx
import { render, screen } from '@testing-library/react';
import { ContactCard } from './ContactCard';

describe('ContactCard', () => {
  it('renders contact information', () => {
    render(
      <ContactCard
        name="John Doe"
        email="john@example.com"
        phone="+1-555-0123"
      />
    );

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

#### Integration Tests (Streaming)

```jsx
// Chat.integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chat from './Chat';

// Mock the useChat hook
jest.mock('ai/react', () => ({
  useChat: () => ({
    messages: [
      { id: '1', role: 'assistant', content: 'Here is the contact:\n<ContactCard name="John" email="john@test.com" />' }
    ],
    input: '',
    handleInputChange: jest.fn(),
    handleSubmit: jest.fn(),
    isLoading: false,
  }),
}));

describe('Chat Integration', () => {
  it('renders custom ContactCard component from LLM output', async () => {
    render(<Chat />);

    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument();
      expect(screen.getByText('john@test.com')).toBeInTheDocument();
    });
  });
});
```

#### E2E Tests (Full Flow)

```typescript
// chat.e2e.spec.ts (Playwright)
import { test, expect } from '@playwright/test';

test('streaming chat renders custom components', async ({ page }) => {
  await page.goto('/chat');

  // Type a message
  await page.fill('input[placeholder="Type a message..."]', 'Show me John Doe contact');
  await page.press('input', 'Enter');

  // Wait for streaming to complete and custom component to render
  await expect(page.locator('[data-testid="contact-card"]')).toBeVisible({ timeout: 10000 });
  await expect(page.locator('[data-testid="contact-card"]')).toContainText('John Doe');
});
```

_Source: [Testing React Components](https://www.callstack.com/blog/using-ai-to-write-tests-for-react-components)_

---

### Risk Assessment & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **LLM outputs malformed tags** | Medium | Graceful fallback to raw text; error boundaries |
| **Performance with long chats** | Medium | Block memoization; virtualization at 100+ messages |
| **Security (XSS from LLM)** | High | Component allowlist only; never `dangerouslySetInnerHTML` |
| **Library deprecation** | Low | All recommended libs actively maintained; abstract parser layer |
| **React 19 requirement** | Low | Streamdown requires React 19.1.1+; plan upgrade path |

---

### Quick Wins for Prototype

1. **Start with FlowToken** - Lowest barrier to entry
2. **Use Streamdown** if you don't need custom components initially
3. **Hardcode 2-3 component types** (ContactCard, CalendarEvent, CodeBlock)
4. **Prompt engineering** is crucial - invest time in system prompts
5. **Add `animation={null}` on completed messages** to save memory

---

### Success Metrics

| Metric | Target | How to Measure |
|--------|--------|----------------|
| **Time to First Token** | <500ms | Performance monitoring |
| **Custom Component Render** | <100ms after tag complete | React DevTools Profiler |
| **Parse Errors** | <1% of messages | Error tracking (Sentry) |
| **Memory (100 messages)** | <50MB heap | Chrome DevTools |
| **User Satisfaction** | Smooth streaming UX | User testing |

---

### Conclusion

For your **stream-gen-ui** comparative prototype with 3 implementations:

**Architecture:**
```
┌─────────────────────────────────────────────┐
│  Header: [FlowToken] | [llm-ui] | [Streamdown]  │
├─────────────────────────────────────────────┤
│  /flowtoken   → XML tags + animations       │
│  /llm-ui      → Delimiters + frame-rate     │
│  /streamdown  → Custom parser + flexibility │
└─────────────────────────────────────────────┘
```

**Shared Foundation:**
- **Vercel AI SDK** (`useChat`) - single streaming backbone for all pages
- **Next.js App Router** - shared layout with header navigation
- **Shared Components** - ContactCard, CalendarEvent, CodeBlock reused across all implementations
- **Single `/api/chat` endpoint** - all implementations hit the same backend

**Implementation Order:**
1. **FlowToken first** - Lowest complexity, quick win
2. **llm-ui second** - More complex but best streaming UX
3. **Streamdown+Custom third** - Most flexible, demonstrates DIY approach

**Evaluation Criteria:**
- Streaming smoothness
- Custom component rendering quality
- Code complexity
- Bundle size impact
- Developer experience

This prototype will provide hands-on comparison data to inform the final production architecture decision.

---

## Sources & References

### Primary Libraries
- [Vercel AI SDK Documentation](https://ai-sdk.dev/docs/introduction)
- [FlowToken GitHub](https://github.com/Ephibbs/flowtoken)
- [llm-ui Documentation](https://llm-ui.com/)
- [Vercel Streamdown](https://github.com/vercel/streamdown)
- [assistant-ui](https://www.assistant-ui.com/)

### Implementation Guides
- [AI SDK Memoization Cookbook](https://ai-sdk.dev/cookbook/next/markdown-chatbot-with-memoization)
- [LogRocket - Build React UIs with llm-ui](https://blog.logrocket.com/react-llm-ui/)
- [Complete Guide to Streaming LLM Responses](https://dev.to/hobbada/the-complete-guide-to-streaming-llm-responses-in-web-applications-from-sse-to-real-time-ui-3534)

### Architecture & Patterns
- [AI SDK Stream Protocol](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol)
- [React State Management 2025](https://www.developerway.com/posts/react-state-management-2025)
- [React Performance Optimization](https://dev.to/alex_bobes/react-performance-optimization-15-best-practices-for-2025-17l9)

---

_Technical Research Completed: 2026-01-19_
_Author: GeoloeG_
_Research Type: Technical - Streaming UI Patterns for AI Chat Interfaces_

<!-- End of Technical Research Document -->
