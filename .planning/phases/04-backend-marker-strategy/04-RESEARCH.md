# Phase 4: Backend Marker Strategy - Research

**Researched:** 2026-01-21
**Domain:** FastAPI query parameter routing with LangChain dynamic prompt adaptation
**Confidence:** HIGH

## Summary

This phase implements a marker-based output format strategy where the `/api/chat` endpoint accepts a `marker` query parameter (xml or llm-ui) that controls how the ReAct agent formats Contact and CalendarEvent entities. The backend adapts the agent's system prompt at runtime based on the marker choice and streams responses in the requested format.

The standard approach uses FastAPI's enum-based query parameter validation with HTTPException for invalid values, LangChain's ChatPromptTemplate with runtime variable substitution for dynamic prompt adaptation, and StreamingResponse with custom headers to signal the active marker strategy. The key architectural decision is prompt-level formatting control rather than post-processing the LLM output.

**Primary recommendation:** Use Python Enum (str, Enum) for marker validation, template the entity formatting instructions in the system prompt with runtime variable substitution, add custom X-Marker-Strategy response header, and log marker choice at INFO level via middleware or endpoint entry.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| fastapi | 0.128.0 | API framework with query param validation | Already in use, native Enum support, excellent validation error messages |
| langchain-core | >=0.3.0 | ChatPromptTemplate for dynamic prompts | Official LangChain abstraction, supports runtime variable substitution |
| pydantic | >=2.0 | Schema validation and error responses | Already in use, native to FastAPI, clear validation errors |
| python-dotenv | latest | Environment configuration | Already in use for config management |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| structlog | >=24.5.0 | Structured logging with context | When needing context propagation (optional, stdlib logging sufficient) |
| pydantic-settings | 2.12.0 | Settings management | Already in use for config.py pattern |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Enum validation | Manual string checks | Lose automatic OpenAPI docs, validation errors, type safety |
| Prompt templating | Post-processing LLM output | Unreliable, requires regex parsing, harder to test |
| Custom headers | Query param echo in body | Less RESTful, harder to inspect in browser dev tools |

**Installation:**
No new dependencies required - all libraries already present in `backend/requirements.txt`.

## Architecture Patterns

### Recommended Project Structure
```
backend/
├── agent/
│   ├── prompts.py           # ADD: get_agent_prompt(marker: str) function
│   ├── graph.py             # MODIFY: pass marker to prompt function
│   └── tools.py             # No changes
├── models/
│   └── schemas.py           # ADD: MarkerStrategy enum
├── main.py                  # MODIFY: add marker query param to /api/chat
└── config.py                # No changes (could add default marker config)
```

### Pattern 1: Enum-Based Query Parameter Validation

**What:** Define marker values as Python Enum(str, Enum) and use as query parameter type.

**When to use:** For all multi-value query parameters with fixed options (standard FastAPI pattern).

**Example:**
```python
# Source: https://fastapi.tiangolo.com/tutorial/path-params/
from enum import Enum
from fastapi import FastAPI, Query, HTTPException

class MarkerStrategy(str, Enum):
    XML = "xml"
    LLM_UI = "llm-ui"

@app.post("/api/chat")
async def chat_stream(
    request: AgentChatRequest,
    marker: MarkerStrategy = Query(MarkerStrategy.XML)  # Default to xml
):
    # marker is validated automatically by FastAPI
    # Invalid values return 422 with clear error message
    pass
```

**Why this pattern:**
- FastAPI validates automatically, returns 422 for invalid values
- OpenAPI docs show dropdown with valid options
- Type-safe throughout codebase
- Inheriting from both `str` and `Enum` enables string comparisons and JSON serialization

### Pattern 2: Custom 400 Error for Invalid Marker

**What:** Override default 422 validation error with custom 400 Bad Request response.

**When to use:** When API contract specifies 400 for client errors (per phase context).

**Example:**
```python
# Source: https://fastapi.tiangolo.com/tutorial/handling-errors/
from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import ValidationError

@app.exception_handler(ValidationError)
async def validation_exception_handler(request: Request, exc: ValidationError):
    """Convert 422 validation errors to 400 for query param errors."""
    errors = exc.errors()

    # Check if this is a marker query param error
    for error in errors:
        if error.get("loc") == ("query", "marker"):
            return JSONResponse(
                status_code=400,
                content={
                    "error": "Invalid marker",
                    "valid_values": ["xml", "llm-ui"]
                }
            )

    # Default validation error response
    raise HTTPException(status_code=422, detail=errors)
```

**Alternative simpler approach:**
```python
# Manual validation for explicit 400 control
@app.post("/api/chat")
async def chat_stream(
    request: AgentChatRequest,
    marker: str = Query("xml")
):
    if marker not in ["xml", "llm-ui"]:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Invalid marker",
                "valid_values": ["xml", "llm-ui"]
            }
        )
    # Continue with validated marker
```

### Pattern 3: Dynamic Prompt Templating with Runtime Variables

**What:** Use LangChain ChatPromptTemplate with template variables for entity formatting instructions.

**When to use:** When prompt content varies based on request parameters (standard for multi-strategy agents).

**Example:**
```python
# Source: https://python.langchain.com/docs/how_to/prompts_partial/
from langchain_core.prompts import ChatPromptTemplate

def get_agent_prompt(marker: str) -> ChatPromptTemplate:
    """Get agent prompt with marker-specific entity formatting instructions.

    Args:
        marker: "xml" or "llm-ui" format strategy

    Returns:
        ChatPromptTemplate configured for the marker strategy
    """

    # Define format-specific instructions
    if marker == "xml":
        contact_format = '''<contactcard name="..." email="..." phone="..." />'''
        calendar_format = '''<calendarevent title="..." date="..." time="..." location="..." />'''
        format_name = "XML tags"
    else:  # llm-ui
        contact_format = '''【CONTACT:{"name":"...", "email":"...", "phone":"..."}】'''
        calendar_format = '''【CALENDAR:{"title":"...", "date":"...", "time":"...", "location":"..."}】'''
        format_name = "Chinese bracket JSON"

    system_prompt = f"""You are a helpful assistant for Berlin city information.

## Entity Formatting

When providing contact information, format EACH contact as:
{contact_format}

When providing event information, format EACH event as:
{calendar_format}

Use {format_name} format exclusively for all entities.
Include only fields that have data. Omit missing fields entirely.
"""

    return ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("placeholder", "{messages}"),
    ])
```

**Alternative with .partial():**
```python
# Using partial() for cleaner separation
base_template = ChatPromptTemplate.from_messages([
    ("system", "You are a helpful assistant.\n\n{entity_instructions}"),
    ("placeholder", "{messages}"),
])

def get_agent_prompt(marker: str) -> ChatPromptTemplate:
    instructions = get_entity_instructions(marker)
    return base_template.partial(entity_instructions=instructions)
```

### Pattern 4: Custom Response Headers with StreamingResponse

**What:** Add custom headers to StreamingResponse for debugging/observability.

**When to use:** When clients or monitoring tools need metadata about response format.

**Example:**
```python
# Source: https://fastapi.tiangolo.com/advanced/custom-response/
from fastapi.responses import StreamingResponse

@app.post("/api/chat")
async def chat_stream(
    request: AgentChatRequest,
    marker: str = Query("xml")
):
    # Validate and process...

    # Add X-Marker-Strategy header
    headers = {
        **SSE_HEADERS,  # Existing AI SDK headers
        "X-Marker-Strategy": marker
    }

    return StreamingResponse(
        stream_agent_response(lc_messages, message_id, marker),
        media_type="text/event-stream",
        headers=headers
    )
```

### Pattern 5: Request-Level INFO Logging

**What:** Log marker choice at INFO level on each request for observability.

**When to use:** For all request-scoped configuration decisions (standard production pattern).

**Example:**
```python
# Source: https://fastapi.tiangolo.com/tutorial/middleware/
import logging

logger = logging.getLogger(__name__)

@app.post("/api/chat")
async def chat_stream(
    request: AgentChatRequest,
    marker: str = Query("xml")
):
    # Log at INFO level (not DEBUG) for production visibility
    logger.info(f"Chat request with marker strategy: {marker}")

    # Continue processing...
```

**Alternative with middleware (for cross-cutting logging):**
```python
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with query params."""
    query_params = dict(request.query_params)
    logger.info(f"{request.method} {request.url.path}", extra={"query": query_params})

    response = await call_next(request)
    return response
```

### Anti-Patterns to Avoid

- **Post-processing LLM output:** Don't parse LLM response and convert formats - unreliable and defeats streaming
- **Hardcoded prompt strings in main.py:** Keep prompt logic in `agent/prompts.py` for maintainability
- **Using marker as path parameter:** Query params are standard for format selection (Accept header pattern)
- **Storing marker in global state:** Must be request-scoped for concurrent requests
- **Over-engineering with template engines:** LangChain's templating is sufficient, avoid Jinja2/Mako

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Query param validation | Manual `if marker not in [...]` checks | Python Enum + FastAPI | Automatic OpenAPI docs, type safety, validation errors |
| Prompt templating | f-strings or manual string concat | ChatPromptTemplate | Handles message role structure, composable, testable |
| Error response formatting | Custom exception classes | HTTPException with detail dict | FastAPI standard, automatic JSON serialization |
| Request logging | Print statements | Python logging module | Log levels, filtering, production-ready handlers |
| Header validation | Manual header parsing | FastAPI Response class | Type-safe, automatic serialization |

**Key insight:** FastAPI + LangChain already provide all primitives needed - resist urge to build custom abstractions.

## Common Pitfalls

### Pitfall 1: Enum Validation Returns 422, Not 400

**What goes wrong:** FastAPI's automatic validation returns 422 Unprocessable Entity for invalid enum values, but phase context requires 400 Bad Request.

**Why it happens:** FastAPI treats validation errors as 422 by default (REST standard for validation failures).

**How to avoid:** Either (a) use custom exception handler to convert 422→400 for marker param, or (b) use manual string validation with explicit 400 HTTPException.

**Warning signs:** Test suite expects 400 but gets 422, OpenAPI docs show 422 response.

**Recommendation:** Use manual validation for explicit 400 control (simpler, fewer moving parts).

### Pitfall 2: Prompt Templating Breaks Streaming

**What goes wrong:** Using `.format()` on prompt after agent invocation prevents token-by-token streaming.

**Why it happens:** Templating must happen before `.astream()` call, not during stream processing.

**How to avoid:** Pass marker to `get_agent_prompt()` before creating agent chain - prompt is configured once per request.

**Warning signs:** Response arrives all at once, not streaming; tokens don't appear incrementally.

### Pitfall 3: Marker Value in LLM Output

**What goes wrong:** LLM echoes marker parameter value in response ("Using xml format...").

**Why it happens:** System prompt mentions marker strategy too explicitly, LLM treats as instruction to acknowledge.

**How to avoid:** Don't mention "xml" or "llm-ui" by name in prompt - just show format examples directly.

**Warning signs:** Response starts with "I'll use XML format as requested" instead of actual content.

### Pitfall 4: Header Not Visible in Browser DevTools

**What goes wrong:** X-Marker-Strategy header doesn't appear in browser network inspector.

**Why it happens:** CORS middleware may not expose custom headers to client.

**How to avoid:** Add `expose_headers=["X-Marker-Strategy"]` to CORS middleware configuration.

**Warning signs:** Header visible in server logs but not in browser DevTools network tab.

### Pitfall 5: Default Marker Not Applied

**What goes wrong:** Request without marker param fails or uses wrong default.

**Why it happens:** Query parameter missing default value, or default not matching enum value.

**How to avoid:** Always specify default in Query(): `marker: str = Query("xml")`

**Warning signs:** 400 error when marker param omitted, or llm-ui format used when expecting xml.

## Code Examples

Verified patterns from official sources:

### Complete Endpoint Implementation

```python
# Source: FastAPI documentation + Phase 3 patterns
from fastapi import FastAPI, HTTPException, Query
from fastapi.responses import StreamingResponse
import logging

logger = logging.getLogger(__name__)

VALID_MARKERS = ["xml", "llm-ui"]

@app.post("/api/chat")
async def chat_stream(
    request: AgentChatRequest,
    marker: str = Query("xml", description="Entity marker format")
):
    """
    Streaming chat endpoint with ReAct agent.

    Query Parameters:
        marker: Output format for entities ("xml" or "llm-ui"). Defaults to "xml".

    Returns:
        SSE stream with AI SDK v6 protocol, X-Marker-Strategy header.
    """

    # Validate marker
    if marker not in VALID_MARKERS:
        raise HTTPException(
            status_code=400,
            detail={
                "error": "Invalid marker",
                "valid_values": VALID_MARKERS
            }
        )

    # Log marker choice
    logger.info(f"Chat request with marker={marker}")

    # Validate messages
    if not request.messages:
        raise HTTPException(status_code=400, detail="Messages array cannot be empty")

    # Convert to LangChain format (existing logic)
    lc_messages = convert_to_langchain_messages(request.messages)

    # Generate message ID
    message_id = f"msg-{uuid.uuid4().hex[:8]}"

    # Add marker to response headers
    headers = {
        **SSE_HEADERS,
        "X-Marker-Strategy": marker
    }

    # Stream with marker-aware prompt
    return StreamingResponse(
        stream_agent_response(lc_messages, message_id, marker),
        media_type="text/event-stream",
        headers=headers
    )
```

### Dynamic Prompt Function

```python
# Source: LangChain ChatPromptTemplate documentation
from langchain_core.prompts import ChatPromptTemplate

def get_agent_prompt(marker: str = "xml") -> ChatPromptTemplate:
    """Get agent prompt configured for marker strategy.

    Args:
        marker: "xml" or "llm-ui" format strategy

    Returns:
        ChatPromptTemplate with marker-specific formatting instructions
    """

    # Base instructions (common to all markers)
    base_instructions = """You are a helpful assistant for Berlin city information.

You have access to a knowledge base tool for contacts, events, and city services.

## When to use the knowledge base

Use the search_knowledge_base tool when the user asks about:
- Specific people's contact details
- Department or agency information
- Events, festivals, or calendar information
- City services or facilities

Do NOT use the tool for general greetings or questions about your capabilities.
"""

    # Marker-specific entity formatting
    if marker == "xml":
        entity_instructions = """
## Entity Formatting

When providing contact information, format EACH contact as:
<contactcard name="Full Name" email="email@berlin.de" phone="+49 30 ..." company="Department" title="Position" />

When providing event information, format EACH event as:
<calendarevent title="Event Name" date="2026-01-25" time="14:00" location="Venue" description="Details" />

Include only fields that have data. Omit missing fields from attributes.
Show top 3 most relevant entities. Mention if more exist.
"""
    else:  # llm-ui
        entity_instructions = """
## Entity Formatting

When providing contact information, format EACH contact as:
【CONTACT:{"name":"Full Name","email":"email@berlin.de","phone":"+49 30 ...","company":"Department","title":"Position"}】

When providing event information, format EACH event as:
【CALENDAR:{"title":"Event Name","date":"2026-01-25","time":"14:00","location":"Venue","description":"Details"}】

Include only fields that have data. Omit missing fields from JSON.
Show top 3 most relevant entities. Mention if more exist.
"""

    system_prompt = base_instructions + entity_instructions

    return ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("placeholder", "{messages}"),
    ])
```

### Modified Agent Graph Creation

```python
# Source: Phase 3 graph.py patterns
def create_agent_graph(marker: str = "xml"):
    """Create and compile the ReAct agent graph with marker-aware prompt.

    Args:
        marker: Entity format strategy ("xml" or "llm-ui")

    Returns:
        Compiled LangGraph state machine
    """
    settings = get_settings()

    # Initialize LLM (unchanged)
    llm = ChatMistralAI(
        model=settings.mistral_model,
        api_key=settings.mistral_api_key,
        temperature=settings.agent_temperature,
        streaming=True,
    )

    # Bind tools
    tools = [search_knowledge_base]
    llm_with_tools = llm.bind_tools(tools)

    # Create marker-aware prompt
    prompt = get_agent_prompt(marker)
    agent_chain = prompt | llm_with_tools

    # Build graph (rest unchanged)
    # ... existing graph construction

    return graph
```

### Streaming with Marker Parameter

```python
# Source: Phase 3 streaming patterns
async def stream_agent_response(messages: list, message_id: str, marker: str):
    """Stream agent response with marker-aware formatting.

    Args:
        messages: List of LangChain message objects
        message_id: Unique ID for the streamed message
        marker: Entity format strategy ("xml" or "llm-ui")

    Yields:
        SSE formatted events compatible with AI SDK v6
    """
    # Create marker-aware graph (not singleton - request-scoped)
    graph = create_agent_graph(marker)
    recursion_limit = get_recursion_limit()

    yield format_text_start(message_id)

    try:
        async for event in graph.astream(
            {"messages": messages},
            config={"recursion_limit": recursion_limit},
            stream_mode="messages"
        ):
            if isinstance(event, tuple) and len(event) == 2:
                message_chunk, metadata = event

                if isinstance(message_chunk, AIMessageChunk) and message_chunk.content:
                    if not message_chunk.tool_calls:
                        yield format_text_delta(message_chunk.content, message_id)

    except GraphRecursionError:
        logger.warning(f"Agent hit recursion limit ({recursion_limit})")
        yield format_text_delta(
            "\n\nI've reached the maximum number of steps.",
            message_id
        )
    except Exception as e:
        logger.error(f"Agent stream error: {e}", exc_info=True)
        # Send error in stream (per phase context)
        yield format_error_event(str(e), message_id)

    yield format_done()


def format_error_event(message: str, message_id: str) -> str:
    """Format mid-stream error event.

    Source: Phase context requirement for mid-stream errors
    """
    event = {
        "type": "error",
        "message": message
    }
    return f"data: {json.dumps(event)}\n\n"
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Global prompt singleton | Request-scoped prompt creation | LangGraph 0.2.0+ (2025) | Enables concurrent requests with different configs |
| Post-processing LLM output | Prompt-level format control | Industry shift 2024-2025 | More reliable, preserves streaming |
| Path params for format (`/api/chat/xml`) | Query params (`?marker=xml`) | REST API best practices | Cleaner URLs, follows Accept header pattern |
| Manual string validation | Enum + FastAPI validation | FastAPI maturity 2024+ | Better docs, type safety |

**Deprecated/outdated:**
- **LangChain AgentExecutor:** Replaced by LangGraph for better streaming control
- **Global agent graph singleton:** Must be request-scoped for dynamic prompts
- **Pydantic v1:** Codebase uses Pydantic v2 (different validation API)

## Open Questions

Things that couldn't be fully resolved:

1. **Graph Singleton vs Request-Scoped Creation**
   - What we know: Phase 3 uses singleton `_agent_graph`, Phase 4 needs dynamic prompts
   - What's unclear: Performance impact of creating graph per request vs caching by marker
   - Recommendation: Start with per-request creation (simpler), profile if performance issues arise. Graph compilation is fast (<10ms).

2. **CORS Expose Headers**
   - What we know: Custom headers need CORS exposure to be visible in browser
   - What's unclear: Current CORS config doesn't specify `expose_headers`
   - Recommendation: Add `expose_headers=["X-Marker-Strategy"]` to CORS middleware in main.py

3. **Error Event Format**
   - What we know: Phase context requires `{"type": "error", "message": "..."}` for mid-stream errors
   - What's unclear: Should this follow AI SDK stream protocol or be custom?
   - Recommendation: Use custom format per context, frontend is Phase 5 concern

## Sources

### Primary (HIGH confidence)
- FastAPI Path Parameters (Enum): https://fastapi.tiangolo.com/tutorial/path-params/
- FastAPI Query Parameters: https://fastapi.tiangolo.com/tutorial/query-params/
- FastAPI Custom Response: https://fastapi.tiangolo.com/advanced/custom-response/
- FastAPI Error Handling: https://fastapi.tiangolo.com/tutorial/handling-errors/
- Phase 3 Research: `.planning/phases/03-react-agent-streaming/03-RESEARCH.md`
- Current Codebase: `backend/main.py`, `backend/agent/prompts.py`, `backend/agent/graph.py`

### Secondary (MEDIUM confidence)
- LangChain ChatPromptTemplate: https://python.langchain.com/api_reference/core/prompts/langchain_core.prompts.chat.ChatPromptTemplate.html
- LangChain Partial Prompts: https://python.langchain.com/docs/how_to/prompts_partial/
- FastAPI Enum Best Practices: https://apidog.com/blog/fastapi-query-parameters-best-practices/
- Structured Prompting (XML vs JSON): https://codeconductor.ai/blog/structured-prompting-techniques-xml-json/
- FastAPI Middleware Logging 2026: https://johal.in/fastapi-middleware-patterns-custom-logging-metrics-and-error-handling-2026-2/

### Tertiary (LOW confidence - marked for validation)
- Chinese Bracket Format Origin: Context provided "llm-ui format" but no authoritative source found for 【】syntax convention
- LangGraph Dynamic Prompts: https://medium.com/fundamentals-of-artificial-intelligence/rebuild-langgraph-agents-at-runtime-1795ec0465de (Medium article, not official docs)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in use, official documentation verified
- Architecture patterns: HIGH - FastAPI and LangChain official docs, verified in Phase 3 codebase
- Pitfalls: MEDIUM - Based on common patterns and web search, not project-specific testing
- Code examples: HIGH - Adapted from official docs and existing Phase 3 patterns

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - stable technologies, no fast-moving changes expected)

**Notes:**
- No new dependencies required - pure implementation of existing libraries
- Phase context provides clear requirements, minimal ambiguity
- "llm-ui" format with Chinese brackets 【】is non-standard but well-defined in context
- Backend-only phase - frontend integration is Phase 5
