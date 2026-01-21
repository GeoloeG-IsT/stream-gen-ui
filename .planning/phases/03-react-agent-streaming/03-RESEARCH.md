# Phase 3: ReAct Agent + Streaming Integration - Research

**Researched:** 2026-01-20
**Domain:** LangChain/LangGraph ReAct agent with FastAPI SSE streaming to AI SDK frontend
**Confidence:** HIGH

## Summary

This phase implements a ReAct (Reasoning + Acting) agent using LangGraph that streams responses via Server-Sent Events (SSE) to the existing Next.js frontend using Vercel AI SDK's `useChat` hook. The agent executes Thought-Action-Observation cycles, invokes the existing RAG retriever as a tool, and streams both reasoning steps and final responses with embedded Contact/CalendarEvent entities.

The standard approach uses LangGraph's graph-based state machine for the ReAct loop, ChatMistralAI for the LLM (with proper tool-calling support), FastAPI's StreamingResponse for SSE, and a custom async generator that bridges LangGraph's astream to the AI SDK's stream protocol. Structured output is achieved through a formatting node at the end of the agent graph, not through with_structured_output (which doesn't stream token-by-token).

**Primary recommendation:** Use LangGraph's create_react_agent or build from scratch with state graph, stream with stream_mode="messages" for token visibility, implement retry middleware for tool failures, and format SSE events to match AI SDK v6 protocol with x-vercel-ai-ui-message-stream: v1 header.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| langgraph | >=0.2.0 | ReAct agent orchestration | Official LangChain framework for graph-based agents, provides streaming and state management |
| langchain-mistralai | >=0.2.0 | Mistral LLM integration | Official LangChain integration with Mistral AI, supports tool calling and streaming |
| langchain-core | >=0.3.0 | Base abstractions | Core LangChain primitives for messages, tools, runnables |
| fastapi | 0.128.0 | API framework | Already in use, excellent SSE support via StreamingResponse |
| sse-starlette | >=2.0.0 | SSE utilities (optional) | Provides EventSourceResponse helper for SSE format |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| pydantic | >=2.0 | Schema definition | Defining Contact/CalendarEvent schemas for validation |
| tenacity | >=8.0 | Retry logic | Alternative to LangChain middleware for custom retry patterns |
| langsmith | >=0.1.0 | Observability | Production tracing and debugging (set LANGSMITH_TRACING_V2=true) |
| langfuse | >=2.0.0 | Observability (alt) | Open-source alternative to LangSmith, self-hostable |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| LangGraph | LangChain AgentExecutor (legacy) | AgentExecutor deprecated, lacks streaming flexibility and iteration control |
| ChatMistralAI | Custom Mistral API client | Lose LangChain abstractions, tool calling integration, retry logic |
| SSE | WebSockets | More complex, overkill for one-way streaming, AI SDK defaults to SSE |

**Installation:**
```bash
# Backend (add to backend/requirements.txt)
langgraph>=0.2.0
langchain-mistralai>=0.2.0
sse-starlette>=2.0.0
tenacity>=8.0.0
pydantic>=2.0.0

# Optional observability
langsmith>=0.1.0
# OR
langfuse>=2.0.0
```

## Architecture Patterns

### Recommended Project Structure
```
backend/
├── agent/                   # ReAct agent logic
│   ├── __init__.py
│   ├── graph.py            # LangGraph state machine
│   ├── tools.py            # RAG tool + future tools
│   ├── prompts.py          # System prompts for agent
│   └── state.py            # AgentState TypedDict
├── streaming/              # SSE streaming utilities
│   ├── __init__.py
│   ├── sse.py              # SSE formatting helpers
│   └── entity_parser.py    # Extract entities from markdown
├── models/
│   └── schemas.py          # Add AgentRequest, entity schemas
└── main.py                 # Add /api/chat POST endpoint
```

### Pattern 1: LangGraph ReAct Agent Graph

**What:** State machine with agent node (LLM call), tools node (tool execution), and conditional routing.

**When to use:** For all ReAct implementations - this is the standard pattern.

**Example:**
```python
# Source: https://langchain-ai.github.io/langgraph/how-tos/react-agent-from-scratch/
from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

# Define nodes
def call_model(state: AgentState):
    messages = state["messages"]
    response = model.invoke(messages)
    return {"messages": [response]}

def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END

# Build graph
workflow = StateGraph(AgentState)
workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNode(tools))
workflow.set_entry_point("agent")
workflow.add_conditional_edges("agent", should_continue, {"tools": "tools", END: END})
workflow.add_edge("tools", "agent")
graph = workflow.compile()
```

### Pattern 2: RAG as Agent Tool

**What:** Convert existing retriever into a tool the agent can invoke.

**When to use:** When agent needs to decide when to retrieve, not retrieve on every query.

**Example:**
```python
# Source: https://docs.langchain.com/oss/python/langgraph/agentic-rag
from langchain.tools import tool
from rag import get_hybrid_retriever

@tool
def search_knowledge_base(query: str) -> str:
    """Search the Berlin city knowledge base for contacts, events, and information.

    Use this tool when the user asks about:
    - Contact information (emails, phone numbers, addresses)
    - Upcoming events or calendar information
    - General city services and information

    Args:
        query: The search query describing what information to find

    Returns:
        Relevant information from the knowledge base
    """
    retriever = get_hybrid_retriever()
    docs = retriever.invoke(query)

    # Format with source attribution
    results = []
    for doc in docs[:5]:  # Top 5 results
        results.append(f"Source: {doc.metadata.get('attribution', 'Unknown')}\n{doc.page_content}")

    return "\n\n---\n\n".join(results)

# Bind to agent
tools = [search_knowledge_base]
model_with_tools = model.bind_tools(tools)
```

### Pattern 3: Streaming with LangGraph

**What:** Use `.astream()` with stream_mode="messages" for token-by-token streaming.

**When to use:** For all streaming implementations - enables real-time token visibility.

**Example:**
```python
# Source: https://docs.langchain.com/oss/python/langchain/streaming
async def stream_agent_response(user_query: str):
    """Stream agent response with token-by-token visibility."""
    inputs = {"messages": [("user", user_query)]}

    # stream_mode="messages" shows tokens as they arrive
    async for event in graph.astream(inputs, stream_mode="messages"):
        # event is a tuple: (node_name, message_chunk)
        if isinstance(event, tuple) and len(event) == 2:
            node, message = event
            if hasattr(message, "content") and message.content:
                yield message.content
```

### Pattern 4: SSE Format for AI SDK

**What:** Format streaming output to match AI SDK v6 stream protocol.

**When to use:** When frontend uses Vercel AI SDK's useChat hook (our case).

**Example:**
```python
# Source: https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol
from fastapi import Response
from fastapi.responses import StreamingResponse
import json

async def format_sse_stream(agent_stream):
    """Format LangGraph stream to AI SDK SSE protocol."""

    # Text streaming: text-delta events
    async for chunk in agent_stream:
        if chunk:
            event = {
                "type": "text-delta",
                "content": chunk
            }
            yield f"data: {json.dumps(event)}\n\n"

    # Signal completion
    yield "data: [DONE]\n\n"

@app.post("/api/chat")
async def chat(request: ChatRequest):
    """SSE endpoint compatible with AI SDK."""
    stream = format_sse_stream(stream_agent_response(request.message))

    return StreamingResponse(
        stream,
        media_type="text/event-stream",
        headers={
            "x-vercel-ai-ui-message-stream": "v1",  # REQUIRED for AI SDK
            "Cache-Control": "no-cache",
            "Connection": "keep-alive"
        }
    )
```

### Pattern 5: Entity Embedding in Markdown

**What:** Emit structured entities as markdown markers that frontend parses.

**When to use:** When mixing natural language with structured components (our Contact/CalendarEvent case).

**Example:**
```python
# Custom format - Claude's discretion for exact syntax
# Option A: JSON in code fence with type marker
def format_contact_entity(name: str, email: str, phone: str):
    return f"""
:::contact
{{"name": "{name}", "email": "{email}", "phone": "{phone}"}}

# Option B: YAML-style markers
def format_contact_entity_v2(name: str, email: str, phone: str):
    return f"""
[CONTACT]
name: {name}
email: {email}
phone: {phone}
[/CONTACT]
"""

# Agent system prompt includes:
# "When providing contact information, format as: :::contact...:::"
# "Show top 3 matches. If more exist, mention: '...and 5 more contacts found.'"
```

### Pattern 6: Error Handling with Middleware

**What:** Use LangChain's ToolRetryMiddleware for exponential backoff.

**When to use:** For production agents that call external APIs or unreliable tools.

**Example:**

```python
# Source: https://docs.langchain.com/oss/python/langchain/middleware/built-in
from langgraph.prebuilt import create_react_agent
from langchain.agents.middleware import ToolRetryMiddleware

agent = create_react_agent(
    model,
    tools=[search_knowledge_base],
    middleware=[
        ToolRetryMiddleware(
            max_retries=5,              # User requirement: 5 retries
            backoff_factor=2.0,         # Exponential: 1s, 2s, 4s, 8s, 16s
            initial_delay=1.0,
            jitter=True,                # Avoid thundering herd
        )
    ]
)
```

### Pattern 7: Iteration Limiting

**What:** Set recursion_limit to prevent infinite loops.

**When to use:** Always - prevents runaway costs.

**Example:**
```python
# Source: https://python.langchain.com/docs/modules/agents/how_to/max_time_limit/
from langgraph.errors import GraphRecursionError

# User requirement: max 5 iterations
# LangGraph counts each step, so multiply by 2 (agent + tools) and add 1
RECURSION_LIMIT = 2 * 5 + 1  # 11

try:
    async for chunk in graph.astream(
        inputs,
        config={"recursion_limit": RECURSION_LIMIT},
        stream_mode="messages"
    ):
        yield chunk
except GraphRecursionError:
    yield "I apologize, but I've reached the maximum number of steps. Please try rephrasing your question."
```

### Anti-Patterns to Avoid

- **Using .invoke() instead of .astream():** Blocks streaming, defeats the purpose of SSE
- **Applying with_structured_output() to agent:** Returns full JSON at end, no token streaming
- **Not setting recursion_limit:** Can infinite loop on bad prompts, rack up costs
- **Missing SSE headers:** AI SDK requires x-vercel-ai-ui-message-stream: v1 header
- **Synchronous generators with StreamingResponse:** Use async def and async for
- **Retrieving on every query:** Let agent decide when to use RAG tool
- **Swallowing tool errors:** Stream user-friendly messages, log detailed errors server-side

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| ReAct loop logic | Custom while loop with tool calling | LangGraph StateGraph or create_react_agent | Handles message history, streaming, checkpoints, error recovery |
| Retry logic | try/except with sleep | ToolRetryMiddleware or tenacity | Exponential backoff, jitter, per-exception rules, observability hooks |
| SSE formatting | Manual f"data: {text}\n\n" | sse-starlette EventSourceResponse | Handles keep-alive pings, reconnect logic, event IDs |
| Tool call parsing | String parsing of LLM output | LangChain bind_tools() | Handles provider differences (OpenAI vs Mistral format), validation |
| Agent observability | Print statements | LangSmith or Langfuse integration | Trace visualization, replay, metrics, multi-turn debugging |
| Streaming token parsing | Character-by-character state machine | LangChain astream with stream_mode | Handles chunking boundaries, message types, proper event emission |
| Iteration counting | Manual counter in loop | LangGraph recursion_limit config | Persists across checkpoints, proper error types, works with streaming |
| Partial JSON parsing | Regex or split() | partial-json-parser library | Handles incomplete JSON from streaming LLMs, schema validation |

**Key insight:** LangGraph's abstraction level is perfect for this domain - not too low (raw API calls) or too high (no-code). Building custom ReAct loops seems simple until you need streaming, retries, observability, and error handling.

## Common Pitfalls

### Pitfall 1: Streaming Breaks with Structured Output

**What goes wrong:** Using `.with_structured_output()` on the agent model prevents token-by-token streaming - you get the full JSON response at the end.

**Why it happens:** `with_structured_output()` waits for the complete response to parse and validate against the schema. This is fundamentally incompatible with streaming tokens.

**How to avoid:** Use a formatting node at the end of the agent graph that converts natural language + entities into structured format AFTER the agent completes reasoning. Or emit entities as markdown markers that frontend parses.

**Warning signs:**
- No tokens appear until the very end
- Frontend shows "loading" then full response appears instantly
- Logs show full message generation before any streaming starts

**Source:** [LangGraph structured output discussion](https://github.com/langchain-ai/langgraph/discussions/749) notes streaming and structured output are incompatible when using with_structured_output.

### Pitfall 2: Missing Stream Mode Parameter

**What goes wrong:** Using `.astream(inputs)` without `stream_mode="messages"` only streams state updates, not individual tokens.

**Why it happens:** Default stream mode is "values" which emits complete state after each node execution, not token-by-token.

**How to avoid:** Always specify `stream_mode="messages"` for token streaming: `graph.astream(inputs, stream_mode="messages")`

**Warning signs:**
- Seeing complete messages from each node instead of tokens
- Reasoning appears in chunks, not word-by-word
- Stream events are node transitions, not token arrivals

**Source:** [LangChain streaming docs](https://docs.langchain.com/oss/python/langchain/streaming) specify stream_mode="messages" for token-level visibility.

### Pitfall 3: Recursion Limit Off by One

**What goes wrong:** Setting recursion_limit=5 when you want 5 iterations gives you 2-3 actual iterations.

**Why it happens:** In LangGraph, each step (agent call + tool call) increments the counter, unlike AgentExecutor which counts full iterations. Formula: `recursion_limit = 2 * desired_iterations + 1`.

**How to avoid:** For 5 iterations: `recursion_limit = 2 * 5 + 1 = 11`

**Warning signs:**
- Agent stops earlier than expected
- GraphRecursionError appears after 2-3 tool calls
- Logs show fewer iterations than configured

**Source:** [LangChain iteration migration docs](https://python.langchain.com/docs/modules/agents/how_to/max_iterations/) note the calculation difference.

### Pitfall 4: Tool Descriptions Too Vague

**What goes wrong:** Agent repeatedly calls wrong tool or doesn't call RAG tool when it should.

**Why it happens:** LLM relies entirely on tool name and description to decide when to invoke. Vague descriptions like "Search for information" don't provide enough context.

**How to avoid:** Write detailed tool descriptions with:
- **When to use:** Specific trigger scenarios
- **What it returns:** Format and content expectations
- **Examples:** "Use for questions like: 'Who works in Parks department?'"

**Warning signs:**
- Agent calls RAG tool for questions it could answer directly
- Agent doesn't call RAG tool for questions requiring knowledge base
- Excessive iterations trying different tools

**Example good description:**
```python
@tool
def search_knowledge_base(query: str) -> str:
    """Search the Berlin city knowledge base for contacts, events, and information.

    **Use this when the user asks about:**
    - Specific people's contact details (email, phone, address)
    - Department contact information
    - Upcoming events, festivals, or city calendar
    - City services, facilities, or general information

    **DO NOT use for:**
    - General greetings or small talk
    - Questions about yourself or your capabilities
    - Math calculations or reasoning tasks

    **Returns:** Top relevant passages with source attribution
    """
```

### Pitfall 5: Not Handling Tool Failures in Stream

**What goes wrong:** RAG retrieval fails, exception bubbles up, entire stream crashes with HTTP 500, frontend shows generic error.

**Why it happens:** Streaming responses are already sending HTTP 200 headers, so you can't return proper error codes mid-stream.

**How to avoid:**
1. Wrap tool execution in try/except
2. On failure, yield error message in stream (don't raise)
3. Use middleware for retries before manual handling
4. Log full error server-side, stream user-friendly message

**Example:**
```python
@tool
def search_knowledge_base(query: str) -> str:
    try:
        retriever = get_hybrid_retriever()
        docs = retriever.invoke(query)
        return format_results(docs)
    except Exception as e:
        logger.error(f"RAG retrieval failed: {e}", exc_info=True)
        return "I couldn't access the knowledge base right now. Try asking about general topics I might know, or try again in a moment."
```

**Warning signs:**
- Streams stop mid-response with no error message
- Browser console shows network errors
- Frontend error handler doesn't trigger (because HTTP 200 already sent)

### Pitfall 6: Timeout Not Applied to Tools

**What goes wrong:** RAG retrieval hangs for minutes, agent doesn't timeout, user waits indefinitely.

**Why it happens:** LangGraph doesn't automatically timeout tool execution - that's the tool's responsibility.

**How to avoid:** Wrap tool invocations with timeout decorator or async timeout context.

**Example:**
```python
import asyncio
from functools import wraps

def tool_timeout(seconds: int):
    """Decorator to timeout tool execution."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await asyncio.wait_for(func(*args, **kwargs), timeout=seconds)
            except asyncio.TimeoutError:
                logger.warning(f"Tool {func.__name__} timed out after {seconds}s")
                return f"The operation timed out after {seconds} seconds. Please try a simpler query."
        return wrapper
    return decorator

@tool_timeout(30)  # User requirement: 30s timeout
async def search_knowledge_base(query: str) -> str:
    # ... implementation
```

**Warning signs:**
- Requests hang indefinitely
- No response in browser after 30+ seconds
- Uvicorn workers stuck in retriever.invoke() (check logs)

### Pitfall 7: Frontend Can't Parse Entity Markers

**What goes wrong:** Agent emits `:::contact{...}:::` but frontend shows raw markdown instead of ContactCard component.

**Why it happens:** Frontend markdown renderer doesn't know about custom syntax, treats it as literal text.

**How to avoid:**
1. Define clear marker syntax server-side
2. Implement parser frontend-side that extracts markers before rendering
3. Test with actual streaming chunks (markers might arrive split across chunks)
4. Provide fallback: if parsing fails, show raw text

**Example frontend parser:**
```typescript
// Parse markdown for entity markers
function extractEntities(markdown: string) {
  const entities = [];
  const contactRegex = /:::contact\n```json\n(.*?)\n```\n:::/gs;

  let match;
  while ((match = contactRegex.exec(markdown)) !== null) {
    try {
      entities.push({
        type: 'contact',
        data: JSON.parse(match[1])
      });
    } catch (e) {
      console.warn('Failed to parse contact entity:', match[1]);
    }
  }

  return entities;
}
```

**Warning signs:**
- Raw `:::contact...:::` text visible in chat
- Entities work in non-streaming mode but fail when streaming
- Entities appear only after full message complete, not during streaming

## Code Examples

Verified patterns from official sources:

### LangGraph Agent with Streaming
```python
# Source: https://langchain-ai.github.io/langgraph/how-tos/react-agent-from-scratch/
from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_mistralai import ChatMistralAI
from langgraph.graph import StateGraph, END
from langgraph.graph.message import add_messages
from langgraph.prebuilt import ToolNode

# State definition
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]

# Initialize model with tools
model = ChatMistralAI(
    model="mistral-large-latest",
    temperature=0,
    streaming=True  # CRITICAL: enables token streaming
)
tools = [search_knowledge_base]
model_with_tools = model.bind_tools(tools)

# Agent node
def call_model(state: AgentState):
    messages = state["messages"]
    response = model_with_tools.invoke(messages)
    return {"messages": [response]}

# Conditional routing
def should_continue(state: AgentState):
    messages = state["messages"]
    last_message = messages[-1]
    if last_message.tool_calls:
        return "tools"
    return END

# Build graph
workflow = StateGraph(AgentState)
workflow.add_node("agent", call_model)
workflow.add_node("tools", ToolNode(tools))
workflow.set_entry_point("agent")
workflow.add_conditional_edges(
    "agent",
    should_continue,
    {"tools": "tools", END: END}
)
workflow.add_edge("tools", "agent")

# Compile
graph = workflow.compile()

# Stream with messages mode
async for event in graph.astream(
    {"messages": [HumanMessage(content="Who works in Parks?")]},
    stream_mode="messages"
):
    if isinstance(event, tuple) and len(event) == 2:
        node, message = event
        if hasattr(message, "content"):
            print(message.content, end="", flush=True)
```

### FastAPI SSE Endpoint for AI SDK
```python
# Source: https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json

class ChatRequest(BaseModel):
    messages: list[dict]  # AI SDK sends message history

async def stream_agent_tokens(messages: list[dict]):
    """Bridge LangGraph to AI SDK stream format."""

    # Convert to LangChain messages
    lc_messages = []
    for msg in messages:
        if msg["role"] == "user":
            lc_messages.append(HumanMessage(content=msg["content"]))
        # Add assistant messages for context

    # Stream from agent
    async for event in graph.astream(
        {"messages": lc_messages},
        config={"recursion_limit": 11},  # 5 iterations
        stream_mode="messages"
    ):
        if isinstance(event, tuple):
            node, message = event

            # Only stream content, not tool calls
            if hasattr(message, "content") and message.content:
                # Format as AI SDK text-delta event
                event_data = {
                    "type": "text-delta",
                    "content": message.content
                }
                yield f"data: {json.dumps(event_data)}\n\n"

    # Signal completion
    yield "data: [DONE]\n\n"

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    """SSE streaming endpoint compatible with AI SDK."""

    return StreamingResponse(
        stream_agent_tokens(request.messages),
        media_type="text/event-stream",
        headers={
            "x-vercel-ai-ui-message-stream": "v1",  # REQUIRED
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )
```

### Exponential Backoff for Tool Failures
```python
# Source: https://docs.langchain.com/oss/python/langchain/middleware/built-in
from langchain.agents.middleware import ToolRetryMiddleware
from langgraph.prebuilt import create_react_agent

# User requirement: 5 retries, 30s timeout, exponential backoff
agent_executor = create_react_agent(
    model=ChatMistralAI(
        model="mistral-large-latest",
        temperature=0,
        timeout=30.0,  # 30s per LLM call
        streaming=True
    ),
    tools=[search_knowledge_base],
    middleware=[
        ToolRetryMiddleware(
            max_retries=5,
            backoff_factor=2.0,      # 1s, 2s, 4s, 8s, 16s
            initial_delay=1.0,
            max_delay=30.0,          # Cap at 30s
            jitter=True,             # Add randomness
            retry_on=(Exception,),   # Retry all exceptions
            on_failure="raise"       # Raise after exhausting retries
        )
    ]
)
```

### Agent System Prompt for Entity Emission
```python
# Source: Custom implementation based on user requirements
from langchain_core.prompts import ChatPromptTemplate

AGENT_SYSTEM_PROMPT = """You are a helpful assistant for Berlin city information.

You have access to a knowledge base tool that contains:
- Contact information for city employees and departments
- Upcoming events and city calendar
- General city services and information

## When to use the knowledge base:
- User asks about specific people, departments, or contact details
- User asks about events, festivals, or calendar information
- User needs information about city services

## How to present information:

### Contacts
When providing contact information, format as:
:::contact
```json
{"name": "Full Name", "email": "email@berlin.de", "phone": "+49...", "address": "Street..."}
```
:::

Show TOP 3 most relevant contacts. If more exist, mention: "...and X more contacts found."

### Events
When providing event information, format as:
:::event
```json
{"title": "Event Name", "date": "2026-01-25", "startTime": "14:00", "location": "Address...", "description": "Details..."}
```
:::

Show TOP 3 upcoming events. If more exist, mention: "...and X more events found."

### Partial data
If some fields are missing (no phone number, no address), still show the contact/event with available fields only.

## Tone
- Concise and helpful
- Brief reasoning: "Looking up Parks contacts..." not long explanations
- Admit when you don't know: "I couldn't find specific information about that. Try asking about [related topics]."

## Error handling
- If knowledge base fails: "I couldn't access the knowledge base right now. Please try again."
- If no results: "I didn't find any information about that. Try asking about contacts, events, or city services."

```python
prompt = ChatPromptTemplate.from_messages([
    ("system", AGENT_SYSTEM_PROMPT),
    ("placeholder", "{messages}")
])

# Use with agent
agent_with_prompt = prompt | model_with_tools
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| AgentExecutor | LangGraph StateGraph | Mid-2025 | Better streaming control, checkpoints, iteration visibility |
| create_react_agent (LangChain) | create_react_agent (LangGraph) | v0.2.0 | Same name, different package - new one is graph-based |
| Custom SSE formatting | AI SDK stream protocol | AI SDK v5 (July 2025) | Standardized format, better error handling, reconnect support |
| with_structured_output on agent | Formatting node at graph end | Ongoing (2025-2026) | Preserves streaming while adding structure |
| Manual retry loops | ToolRetryMiddleware | LangChain 0.3.0 | Built-in exponential backoff, jitter, per-exception control |
| Print debugging | LangSmith/Langfuse tracing | 2024-2025 | Visual traces, replay, metrics, production monitoring |

**Deprecated/outdated:**
- **AgentExecutor:** Legacy LangChain agent runner - lacks streaming flexibility, iteration control, checkpointing. Migrate to LangGraph.
- **stream_mode="values" for tokens:** Use stream_mode="messages" for token-level streaming (values only streams state updates).
- **Synchronous streaming with callbacks:** Use async astream for better performance and control.
- **WebSockets for LLM streaming:** SSE is now standard (AI SDK v5+), simpler, better browser support.

## Open Questions

Things that couldn't be fully resolved:

1. **Exact entity marker syntax**
   - What we know: Need markdown markers that frontend can parse, should wrap JSON, must survive streaming chunking
   - What's unclear: Exact delimiter choice (:::type vs [TYPE] vs custom), whether to use code fences, how frontend renderer integrates
   - Recommendation: Start with `:::contact\n```json\n{...}\n```\n:::` format - familiar markdown, clear boundaries, JSON validation. Test streaming with partial markers.

2. **Debug mode implementation**
   - What we know: User wants optional query param/header to expose more internals to frontend
   - What's unclear: What internals to expose (full tool calls? retrieval scores? timing?), how to format in stream
   - Recommendation: Add `?debug=true` query param, stream additional events with type `debug-*` that frontend can display in expandable section. Not part of AI SDK spec, so frontend ignores if not implemented.

3. **Reasoning vs response separation**
   - What we know: User wants reasoning in separate visual block from final response
   - What's unclear: How to distinguish in stream - AI SDK has `reasoning-start/delta/end` events but LangGraph doesn't emit these natively
   - Recommendation: Use AI SDK reasoning events. Emit agent thoughts as `reasoning-delta`, final response as `text-delta`. Requires custom stream formatting logic.

4. **Mistral model version for tool calling**
   - What we know: Need Mistral model with tool calling support
   - What's unclear: Which specific model version (mistral-large-latest, mistral-large-2411, etc.) has best tool calling + streaming
   - Recommendation: Start with `mistral-large-latest` (most current), test tool calling behavior. Fall back to `mistral-large-2411` if issues. Document model choice in config.

5. **Streaming entity assembly**
   - What we know: Entities might arrive split across multiple stream chunks
   - What's unclear: Whether to buffer complete entities before emitting or stream raw and let frontend handle reassembly
   - Recommendation: Stream raw as agent generates. Frontend must buffer partial entities (start with `:::contact`, wait for closing `:::`). Test with slow streaming to verify reassembly logic.

## Sources

### Primary (HIGH confidence)
- [LangGraph ReAct Agent from Scratch](https://langchain-ai.github.io/langgraph/how-tos/react-agent-from-scratch/) - Core agent pattern
- [LangGraph Structured Output](https://langchain-ai.github.io/langgraph/how-tos/react-agent-structured-output/) - Formatting node approach
- [LangChain Streaming Documentation](https://docs.langchain.com/oss/python/langchain/streaming) - stream_mode="messages" specification
- [AI SDK Stream Protocol](https://ai-sdk.dev/docs/ai-sdk-ui/stream-protocol) - SSE format requirements
- [ChatMistralAI API Reference](https://reference.langchain.com/v0.3/python/mistralai/chat_models/langchain_mistralai.chat_models.ChatMistralAI.html) - Tool calling and streaming options
- [LangChain Middleware Documentation](https://docs.langchain.com/oss/python/langchain/middleware/built-in) - ToolRetryMiddleware configuration
- [LangChain Max Iterations](https://python.langchain.com/docs/modules/agents/how_to/max_time_limit/) - Recursion limit calculation

### Secondary (MEDIUM confidence)
- [FastAPI SSE with React and LangGraph](https://www.softgrade.org/sse-with-fastapi-react-langgraph/) - Integration example verified with official docs
- [LangGraph Streaming Modes](https://dev.to/sreeni5018/langgraph-streaming-101-5-modes-to-build-responsive-ai-applications-4p3f) - Multiple WebSearch sources agree on 6 modes
- [Agentic RAG with LangChain](https://docs.langchain.com/oss/python/langgraph/agentic-rag) - RAG as tool pattern
- [AI SDK 5 Announcement](https://vercel.com/blog/ai-sdk-5) - SSE adoption and stream protocol
- [LangSmith Observability](https://www.langchain.com/langsmith/observability) - Official product page
- [Langfuse Documentation](https://langfuse.com/docs/observability/overview) - Open source alternative

### Tertiary (LOW confidence - WebSearch only, flagged for validation)
- [Streaming LangChain with FastAPI examples](https://medium.com/@shijotck/streaming-responses-with-langchain-and-fastapi-72e9cfd8088f) - Community blog, pattern matches official docs but verify details
- [Mistral + LangChain Agent examples](https://medium.com/@anil.goyal0057/building-a-powerful-ai-agent-using-langchain-mistral-faiss-and-web-search-c9953751a1b2) - Community content, specific model recommendations need verification
- [Partial JSON Parser libraries](https://github.com/promplate/partial-json-parser) - Open source project, not officially endorsed by LangChain
- [LangChain ReAct pitfalls](https://latenode.com/blog/ai-frameworks-technical-infrastructure/langchain-setup-tools-agents-memory/langchain-react-agent-complete-implementation-guide-working-examples-2025) - Community guide, cross-verify specific claims

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs and package repositories
- Architecture: HIGH - Patterns from official LangGraph/LangChain documentation and tutorials
- Pitfalls: MEDIUM-HIGH - Mix of official docs (streaming modes, recursion) and community experience (tool descriptions, entity parsing)
- SSE protocol: HIGH - AI SDK official documentation with exact specifications
- Mistral integration: MEDIUM - Official API docs exist but specific streaming behavior needs testing

**Research date:** 2026-01-20
**Valid until:** ~2026-02-20 (30 days) - LangChain/LangGraph ecosystem is stable, but minor version updates common

**Notes:**
- AI SDK v6 released recently (late 2025), protocol stable but verify edge cases
- LangGraph 0.2.x is current, v1.0 mentioned for October 2025 but docs still reference 0.2
- Mistral API stable, but model versions change - pin specific version in production
- SSE browser support is universal, no compatibility concerns
