# Architecture Research: FastAPI + LangChain ReAct Agent + RAG

**Project:** Stream Gen UI — City Chatbot Backend
**Researched:** 2026-01-20
**Confidence:** HIGH (based on official LangChain docs, recent FastAPI patterns, and verified web sources)

## Executive Summary

This architecture integrates FastAPI's async SSE streaming with LangChain's ReAct agent pattern and a RAG retrieval tool. The system follows a clear data flow: Next.js frontend → FastAPI endpoint → ReAct agent → RAG tool → vector store → streaming response. The architecture separates concerns into distinct components with well-defined boundaries, enabling independent development and testing.

**Key architectural insights:**
- FastAPI's native async/await is ideal for I/O-bound LLM operations
- LangChain's `create_react_agent` provides production-ready ReAct pattern
- RAG as a tool (not a chain) gives agent control over when to retrieve
- SSE streaming requires special handling with LangChain's `astream()` method
- Module-based structure (not file-type) scales better for larger applications

## Component Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js Frontend                        │
│  (frontend/)                                                     │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐       │
│  │ Chat UI      │   │ ContactCard  │   │ CalendarEvent│       │
│  │ (useChat)    │   │ Component    │   │ Component    │       │
│  └──────┬───────┘   └──────────────┘   └──────────────┘       │
│         │ POST /api/chat                                        │
│         │ Accept: text/event-stream                             │
└─────────┼─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI Backend                            │
│  (backend/)                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Router Layer (routers/chat.py)                          │  │
│  │  - POST /api/chat endpoint                               │  │
│  │  - Request validation (Pydantic)                         │  │
│  │  - SSE StreamingResponse setup                           │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│                       ▼                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Agent Service (services/agent.py)                       │  │
│  │  - Initialize ReAct agent                                │  │
│  │  - Bind tools to LLM                                     │  │
│  │  - Stream agent execution via astream()                  │  │
│  │  - Format output with structured parsers                 │  │
│  └────────────────────┬─────────────────────────────────────┘  │
│                       │                                          │
│         ┌─────────────┴─────────────┐                           │
│         ▼                           ▼                           │
│  ┌─────────────────┐         ┌────────────────┐                │
│  │  RAG Tool       │         │ Other Tools    │                │
│  │  (tools/rag.py) │         │ (if needed)    │                │
│  │  - @tool wrapper│         └────────────────┘                │
│  │  - Query vector │                                            │
│  │    store        │                                            │
│  │  - Return docs  │                                            │
│  └────────┬────────┘                                            │
│           │                                                      │
│           ▼                                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Vector Store Service (services/vector_store.py)         │  │
│  │  - Initialize Chroma/FAISS                               │  │
│  │  - Load & chunk markdown documents                       │  │
│  │  - Embed & index chunks                                  │  │
│  │  - Similarity search                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  LLM Service (services/llm.py)                           │  │
│  │  - Initialize Mistral client                             │  │
│  │  - Configure model parameters                            │  │
│  │  - Bind structured output schema (Contact/CalendarEvent)│  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Knowledge Base                               │
│  (backend/data/knowledge/)                                      │
│  ├── contacts/                                                  │
│  │   ├── city-hall.md                                          │
│  │   └── departments.md                                        │
│  ├── events/                                                    │
│  │   ├── upcoming.md                                           │
│  │   └── recurring.md                                          │
│  └── general/                                                   │
│      └── services.md                                            │
└─────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Next.js Frontend
**Purpose:** User interface for city chatbot
**Location:** `frontend/` (existing app moved here)
**Inputs:**
- User chat messages
- SSE stream from backend `/api/chat`

**Outputs:**
- POST requests to `/api/chat` with message history
- Rendered ContactCard and CalendarEvent components

**Dependencies:**
- Backend `/api/chat` endpoint
- AI SDK v6 `useChat` hook
- Custom renderers (FlowToken, llm-ui, Streamdown)

**Key Characteristics:**
- Uses `Accept: text/event-stream` header for SSE
- Expects structured entities in stream (Contact, CalendarEvent)
- Maintains chat history in React state

### 2. FastAPI Router Layer
**Purpose:** HTTP endpoint handling and request validation
**Location:** `backend/src/routers/chat.py`
**Inputs:**
- POST request with `{ messages: [...] }`
- Query param `?format=flowtoken|llm-ui|streamdown`

**Outputs:**
- SSE StreamingResponse with text/event-stream content-type
- Streams agent responses as they're generated

**Dependencies:**
- Pydantic models for request/response validation
- Agent service for business logic
- FastAPI StreamingResponse

**Key Implementation:**
```python
from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from services.agent import AgentService

router = APIRouter()

@router.post("/api/chat")
async def chat(request: ChatRequest):
    agent_service = AgentService()

    async def event_generator():
        async for chunk in agent_service.stream_response(
            messages=request.messages,
            format=request.format
        ):
            yield f"data: {chunk}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream"
    )
```

### 3. Agent Service
**Purpose:** ReAct agent orchestration and execution
**Location:** `backend/src/services/agent.py`
**Inputs:**
- Message history (list of user/assistant messages)
- Output format preference

**Outputs:**
- Async stream of response chunks
- Structured entities (Contact, CalendarEvent) when relevant

**Dependencies:**
- LangChain `create_react_agent` or custom LangGraph implementation
- LLM service (Mistral)
- RAG tool
- Output parsers for structured entities

**Key Implementation Pattern:**
```python
from langchain.agents import create_react_agent
from langchain_core.tools import tool

class AgentService:
    def __init__(self):
        self.llm = get_mistral_llm()
        self.tools = [retrieve_context_tool]
        self.agent = create_react_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=system_prompt
        )

    async def stream_response(self, messages, format):
        # Use astream() for token-by-token streaming
        async for event in self.agent.astream(
            {"messages": messages}
        ):
            # Format and yield chunks
            yield format_chunk(event, format)
```

**ReAct Agent Structure:**
- **State:** AgentState with messages list
- **Nodes:**
  - `agent_node`: Invokes LLM with tools
  - `tools_node`: Executes tool calls
- **Edges:**
  - `START → agent_node`
  - `agent_node → tools_node` (if tool calls present)
  - `tools_node → agent_node` (loop until no tools needed)
  - `agent_node → END` (when response ready)

### 4. RAG Tool
**Purpose:** Retrieve relevant context from knowledge base
**Location:** `backend/src/tools/rag.py`
**Inputs:**
- Query string (from agent's reasoning)

**Outputs:**
- Retrieved document chunks with metadata
- Formatted as tool response

**Dependencies:**
- Vector store service
- LangChain `@tool` decorator

**Key Implementation:**
```python
from langchain_core.tools import tool

@tool(response_format="content_and_artifact")
def retrieve_context(query: str):
    """Retrieve information about city contacts, events, and services.

    Use this tool when you need factual information about:
    - Contact details for city departments or officials
    - Upcoming or past city events
    - General city services and procedures

    Args:
        query: A specific question or search term

    Returns:
        Relevant context from the knowledge base
    """
    vector_store = get_vector_store()
    docs = vector_store.similarity_search(query, k=3)

    # Return serialized results
    return "\n\n".join([doc.page_content for doc in docs])
```

**Design Decision:** RAG as Tool vs Chain
- **Tool approach (RECOMMENDED):** Agent decides when to search, can perform multiple retrievals, handles non-search queries
- **Chain approach:** Always searches, single inference, predictable latency
- For city chatbot: Tool approach enables "What's the weather?" (no retrieval) vs "Who is the mayor?" (needs retrieval)

### 5. Vector Store Service
**Purpose:** Document indexing and similarity search
**Location:** `backend/src/services/vector_store.py`
**Inputs:**
- Markdown files from knowledge base
- Search queries from RAG tool

**Outputs:**
- Initialized vector store (Chroma or FAISS)
- Retrieved document chunks with relevance scores

**Dependencies:**
- Chroma or FAISS library
- LangChain document loaders (UnstructuredMarkdownLoader, DirectoryLoader)
- LangChain text splitters (MarkdownTextSplitter, MarkdownHeaderTextSplitter)
- Embedding model (e.g., HuggingFace embeddings)

**Key Implementation:**
```python
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import DirectoryLoader
from langchain_text_splitters import MarkdownHeaderTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings

class VectorStoreService:
    def __init__(self, knowledge_base_path: str):
        self.embeddings = HuggingFaceEmbeddings()
        self.vector_store = self._initialize_store(knowledge_base_path)

    def _initialize_store(self, path: str):
        # Load markdown documents
        loader = DirectoryLoader(
            path,
            glob="**/*.md",
            loader_cls=UnstructuredMarkdownLoader
        )
        documents = loader.load()

        # Split with header awareness
        splitter = MarkdownHeaderTextSplitter(
            headers_to_split_on=[
                ("#", "Header1"),
                ("##", "Header2"),
                ("###", "Header3")
            ]
        )
        chunks = splitter.split_documents(documents)

        # Create vector store
        return Chroma.from_documents(
            documents=chunks,
            embedding=self.embeddings,
            persist_directory="./chroma_db"
        )

    def similarity_search(self, query: str, k: int = 3):
        return self.vector_store.similarity_search(query, k=k)
```

**Vector Store Options:**
- **Chroma (RECOMMENDED for PoC):** Easy setup, runs locally, good for learning
- **FAISS:** Faster search, RAM-based, better for medium datasets
- **Pinecone:** Cloud-based, production-scale, but overkill for PoC

### 6. LLM Service
**Purpose:** Mistral LLM initialization and configuration
**Location:** `backend/src/services/llm.py`
**Inputs:**
- Model configuration (temperature, max_tokens, etc.)
- Structured output schema (optional)

**Outputs:**
- Configured LLM instance for agent
- Bound with structured output parsers

**Dependencies:**
- LangChain Mistral integration
- Pydantic models for structured output

**Key Implementation:**
```python
from langchain_mistralai import ChatMistralAI
from langchain_core.output_parsers import PydanticOutputParser
from pydantic import BaseModel, Field

class Contact(BaseModel):
    """Contact information for city officials or departments"""
    name: str = Field(description="Full name or department name")
    email: str | None = Field(default=None, description="Email address")
    phone: str | None = Field(default=None, description="Phone number")
    address: str | None = Field(default=None, description="Physical address")
    avatar: str | None = Field(default=None, description="Avatar URL")

class CalendarEvent(BaseModel):
    """City event information"""
    title: str = Field(description="Event title")
    date: str = Field(description="Event date")
    startTime: str | None = Field(default=None, description="Start time")
    endTime: str | None = Field(default=None, description="End time")
    location: str | None = Field(default=None, description="Event location")
    description: str | None = Field(default=None, description="Event description")

def get_mistral_llm(temperature: float = 0.7):
    """Initialize Mistral LLM with structured output support"""
    llm = ChatMistralAI(
        model="mistral-large-latest",  # or mistral-medium
        temperature=temperature,
        max_tokens=2048,
        streaming=True  # Critical for SSE
    )

    # Note: Mistral supports native structured output as of 2026
    # Use .with_structured_output() for entity formatting
    return llm
```

**Structured Output Approach (2026):**
- Modern LLMs (including Mistral) support native structured output
- Use `llm.with_structured_output(Contact)` for entity extraction
- Fallback to `PydanticOutputParser` if native support unavailable
- Agent can mix structured and unstructured output in response

### 7. Knowledge Base
**Purpose:** Source of truth for city information
**Location:** `backend/data/knowledge/`
**Structure:**
```
knowledge/
├── contacts/
│   ├── city-hall.md          # Mayor, council members
│   ├── departments.md         # Police, fire, utilities
│   └── community-centers.md   # Libraries, rec centers
├── events/
│   ├── upcoming.md            # Next 3 months
│   ├── recurring.md           # Weekly/monthly events
│   └── annual.md              # Festivals, holidays
└── general/
    ├── services.md            # Trash, permits, etc.
    └── hours.md               # Office hours
```

**Content Format:**
```markdown
# City Hall Contacts

## Mayor's Office
**Name:** Jane Smith
**Email:** mayor@city.gov
**Phone:** (555) 123-4567
**Address:** 123 Main St, City Hall, Room 201

## City Council
...

## Events
### City Council Meeting
**Title:** Monthly City Council Meeting
**Date:** 2026-02-15
**Time:** 7:00 PM - 9:00 PM
**Location:** City Hall Chambers
**Description:** Public meeting to discuss city budget and upcoming projects.
```

**Design Considerations:**
- Use consistent markdown structure for easier chunking
- Headers (##, ###) help MarkdownHeaderTextSplitter preserve context
- Include metadata in consistent format for entity extraction
- Fictional but realistic data for PoC

## Data Flow

### Complete Request Flow

```
1. User types message
   ↓
2. Frontend: useChat sends POST /api/chat
   Headers: { Accept: "text/event-stream" }
   Body: { messages: [...], format: "flowtoken" }
   ↓
3. Router: Validates request, calls AgentService
   ↓
4. AgentService: Initializes ReAct agent execution
   ↓
5. Agent Node: LLM reasons about user query
   "Need to find contact for mayor..."
   ↓
6. Agent Node: Decides to use retrieve_context tool
   tool_call: { name: "retrieve_context", args: { query: "mayor contact" } }
   ↓
7. Tools Node: Executes RAG tool
   ↓
8. RAG Tool: Queries vector store
   ↓
9. Vector Store: Similarity search on embedded chunks
   Returns: ["Jane Smith, Mayor...", "Email: mayor@city.gov..."]
   ↓
10. Tools Node: Returns results to agent
    ↓
11. Agent Node: LLM formats response with structured entities
    "The mayor is Jane Smith. Here's her contact information:"
    <Contact name="Jane Smith" email="mayor@city.gov" .../>
    ↓
12. AgentService: Streams response chunks via astream()
    ↓
13. Router: Yields SSE events
    "data: The mayor is\n\n"
    "data:  Jane Smith\n\n"
    "data: <Contact...\n\n"
    ↓
14. Frontend: useChat receives stream
    ↓
15. Renderer: Parses entities, renders ContactCard component
    ↓
16. User sees: "The mayor is Jane Smith." + ContactCard UI
```

### SSE Streaming Details

**FastAPI Side:**
```python
async def event_generator():
    async for chunk in agent_service.stream_response(messages):
        # SSE format: "data: <content>\n\n"
        yield f"data: {chunk}\n\n"
```

**LangChain astream() Events:**
```python
async for event in agent.astream(inputs):
    # Events include:
    # - "agent" events (model reasoning)
    # - "tools" events (tool execution)
    # - "messages" (final/intermediate messages)

    if event["event"] == "on_chat_model_stream":
        # Token-by-token streaming
        yield event["data"]["chunk"].content
```

**Frontend SSE Consumption:**
- AI SDK v6 `useChat` handles SSE automatically
- No custom EventSource needed
- Framework parses `data: ` lines

## Directory Structure

```
stream-gen-ui/
├── frontend/                           # Next.js frontend (moved from root)
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts           # PROXY to backend (in production)
│   │   ├── flowtoken/
│   │   ├── llm-ui/
│   │   ├── streamdown/
│   │   └── layout.tsx
│   ├── components/
│   │   ├── flowtoken/
│   │   ├── llm-ui/
│   │   ├── streamdown/
│   │   └── shared/
│   ├── types/
│   ├── lib/
│   ├── package.json
│   ├── next.config.ts
│   └── tsconfig.json
│
├── backend/                            # FastAPI backend
│   ├── src/
│   │   ├── main.py                    # FastAPI app initialization
│   │   ├── config.py                  # Environment variables, settings
│   │   ├── routers/
│   │   │   ├── __init__.py
│   │   │   └── chat.py                # /api/chat endpoint
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── agent.py               # ReAct agent service
│   │   │   ├── llm.py                 # Mistral LLM setup
│   │   │   └── vector_store.py        # RAG vector store
│   │   ├── tools/
│   │   │   ├── __init__.py
│   │   │   └── rag.py                 # RAG tool
│   │   ├── schemas/
│   │   │   ├── __init__.py
│   │   │   ├── chat.py                # ChatRequest, ChatResponse
│   │   │   └── entities.py            # Contact, CalendarEvent
│   │   └── prompts/
│   │       ├── __init__.py
│   │       └── system_prompt.py       # Agent system prompt
│   │
│   ├── data/
│   │   └── knowledge/                 # Markdown knowledge base
│   │       ├── contacts/
│   │       ├── events/
│   │       └── general/
│   │
│   ├── tests/
│   │   ├── test_agent.py
│   │   ├── test_rag.py
│   │   └── test_api.py
│   │
│   ├── .env                           # MISTRAL_API_KEY, etc.
│   ├── requirements.txt
│   └── pyproject.toml
│
└── .planning/                         # Project planning docs
    └── research/
        └── ARCHITECTURE.md            # This file
```

## Architectural Patterns

### Pattern 1: Agentic RAG (Tool-Based Retrieval)

**What:** RAG wrapped as a tool that the agent can choose to invoke

**When:** User queries may or may not need retrieval (e.g., "hello" vs "who is the mayor?")

**Benefits:**
- Agent decides when retrieval is necessary
- Can perform multiple retrievals with refined queries
- Handles conversational flow without forcing retrieval

**Example:**
```python
# User: "What's the weather?"
# Agent: No tool call, responds conversationally

# User: "Who should I contact about a parking ticket?"
# Agent: Calls retrieve_context("parking violations contact")
# Agent: Formats response with Contact entity
```

### Pattern 2: Streaming with LangChain astream()

**What:** Asynchronous token-by-token streaming from agent execution

**When:** Real-time response generation for better UX

**Benefits:**
- Lower perceived latency
- User sees progress immediately
- Matches AI SDK expectations

**Implementation:**
```python
async for event in agent.astream(inputs):
    if event["event"] == "on_chat_model_stream":
        chunk = event["data"]["chunk"]
        yield chunk.content
```

### Pattern 3: Structured Output with Pydantic

**What:** LLM generates responses conforming to Pydantic schemas

**When:** Need consistent entity format for frontend components

**Benefits:**
- Type-safe entity generation
- Automatic validation
- Matches frontend TypeScript interfaces

**Implementation:**
```python
# Define schema matching frontend
class Contact(BaseModel):
    name: str
    email: str | None = None
    # ... matches ContactCardProps

# Bind to LLM
llm_with_structure = llm.with_structured_output(Contact)

# Agent can output Contact entities inline
```

### Pattern 4: Module-Based Backend Structure

**What:** Organize by feature/domain (routers/, services/, tools/) not file type

**When:** Application has multiple domains (chat, admin, etc.) or will grow

**Benefits:**
- Clear separation of concerns
- Easier to locate related code
- Scales better than file-type structure

**Example:**
```
# Good (module-based)
services/agent.py      # All agent logic
services/llm.py        # All LLM logic

# Avoid (file-type for large apps)
models/              # All Pydantic models mixed
utils/               # Grab bag of helpers
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Chain-Based RAG for This Use Case

**What:** Always perform retrieval before generating response

**Why bad:**
- Wastes API calls and latency for non-factual queries
- Less conversational (forces retrieval for "hello", "thanks", etc.)
- Can't perform multi-step retrieval refinement

**Instead:** Use RAG as tool, let agent decide when to retrieve

### Anti-Pattern 2: Synchronous LLM Calls

**What:** Using blocking LLM API calls in FastAPI

**Why bad:**
- Blocks event loop, preventing concurrent requests
- FastAPI's async advantage wasted
- Poor scaling under load

**Instead:** Always use async LLM clients and `astream()`

### Anti-Pattern 3: Storing Vector DB in Git

**What:** Committing Chroma/FAISS database files to version control

**Why bad:**
- Large binary files bloat repo
- Merge conflicts on DB files
- Should be reproducible from source markdown

**Instead:**
- Add `chroma_db/` to `.gitignore`
- Initialize vector store on first run from `data/knowledge/`
- Provide script to rebuild index

### Anti-Pattern 4: Generic System Prompts

**What:** Not tailoring agent prompt to city chatbot domain

**Why bad:**
- Agent doesn't understand its role or available data
- May hallucinate or provide irrelevant info
- Doesn't format entities consistently

**Instead:**
```python
system_prompt = """You are a helpful city chatbot for [City Name].

Your role:
- Answer questions about city contacts, events, and services
- Use the retrieve_context tool to find accurate information
- Format contact information as <Contact> entities
- Format events as <CalendarEvent> entities

Available information:
- City hall contacts and department contacts
- Upcoming and recurring city events
- General city services and procedures

When responding:
1. Use retrieve_context for factual questions
2. Be concise and friendly
3. Always cite sources when providing contact details
4. Use structured entities for contacts and events
"""
```

### Anti-Pattern 5: Mixing Frontend and Backend Concerns

**What:** Running frontend dev server and backend server in same process

**Why bad:**
- Tight coupling prevents independent scaling
- Development complexity (mixed logs, ports)
- Deployment inflexibility

**Instead:**
- Frontend dev server: `npm run dev` on port 3000
- Backend server: `uvicorn main:app --reload` on port 8000
- Frontend proxies `/api/*` to backend via `next.config.ts`
- Production: Deploy separately (Vercel + Railway/Render)

## Scalability Considerations

| Concern | MVP (100 users) | Growth (10K users) | Scale (100K+ users) |
|---------|-----------------|-------------------|---------------------|
| **Vector Store** | Chroma (local) | FAISS (local with backup) | Pinecone/Weaviate (cloud) |
| **LLM Caching** | None | Redis for embeddings | Redis + prompt caching |
| **Agent State** | Stateless per request | Session storage (Redis) | Distributed session store |
| **Streaming** | Direct SSE | SSE with connection pooling | WebSocket or SSE with load balancer |
| **Knowledge Base** | File-based markdown | Git LFS or S3 | CMS with versioning |
| **Monitoring** | Print statements | Basic logging | APM (DataDog, Sentry) |

**For PoC:** Leftmost column is sufficient. No premature optimization needed.

## Build Order

Based on dependencies and risk reduction, here's the recommended implementation sequence:

### Phase 1: Backend Foundation (No Agent Yet)
**Why first:** Establish FastAPI structure, validate SSE streaming works

1. **Initialize FastAPI project structure**
   - Create `backend/src/main.py` with basic app
   - Set up `routers/`, `services/`, `schemas/`
   - Add `.env` for configuration

2. **Create mock `/api/chat` endpoint**
   - Router with Pydantic request validation
   - SSE StreamingResponse with hardcoded chunks
   - Test with curl or Postman

3. **Move frontend to `frontend/` folder**
   - Reorganize Next.js app
   - Update `package.json`, `next.config.ts`
   - Configure proxy to backend in `next.config.ts`
   - Verify existing mock still works

**Validation:** Frontend can receive SSE stream from FastAPI

---

### Phase 2: Knowledge Base & RAG (No Agent Yet)
**Why second:** Independent of agent complexity, testable in isolation

4. **Create markdown knowledge base**
   - Write fictional city contacts (3-5 people)
   - Write fictional events (3-5 events)
   - Structure with consistent headers

5. **Implement Vector Store Service**
   - Install Chroma/FAISS
   - Load markdown with DirectoryLoader
   - Split with MarkdownHeaderTextSplitter
   - Create and persist vector store
   - Add `similarity_search()` method

6. **Test vector store in isolation**
   - Write script to query store
   - Verify relevant chunks returned
   - Tune chunk size, overlap, k value

**Validation:** Can search knowledge base and get relevant results

---

### Phase 3: LLM Integration (No RAG Yet)
**Why third:** Isolate LLM streaming before combining with RAG

7. **Implement LLM Service**
   - Initialize Mistral client
   - Configure streaming
   - Test basic chat completion

8. **Create simple streaming endpoint**
   - Route that streams LLM response
   - No tools, just echo back
   - Verify SSE streaming works end-to-end

**Validation:** Frontend receives streamed LLM responses

---

### Phase 4: ReAct Agent with RAG Tool
**Why fourth:** Now combine all components

9. **Create RAG tool**
   - Wrap vector store in `@tool` decorator
   - Write clear docstring for agent
   - Test tool in isolation

10. **Implement Agent Service**
    - Use `create_react_agent` with Mistral
    - Bind RAG tool
    - Configure system prompt for city chatbot
    - Implement `astream()` streaming

11. **Update `/api/chat` to use agent**
    - Replace mock with agent service
    - Handle streaming events
    - Format SSE output

**Validation:** Agent can reason, call RAG tool, and stream response

---

### Phase 5: Structured Output & Entity Formatting
**Why fifth:** Build on working agent

12. **Define Pydantic schemas for entities**
    - `Contact` matching `ContactCardProps`
    - `CalendarEvent` matching `CalendarEventProps`

13. **Configure LLM for structured output**
    - Use `llm.with_structured_output()` if supported
    - Or configure output parser
    - Update system prompt to use entity syntax

14. **Test entity rendering**
    - Query for contacts, verify ContactCard renders
    - Query for events, verify CalendarEvent renders

**Validation:** Entities render correctly in frontend

---

### Phase 6: Format Support & Polish
**Why last:** Nice-to-have, non-critical

15. **Implement format-aware responses**
    - Handle `?format=flowtoken|llm-ui|streamdown` query param
    - Adjust entity syntax per format
    - Test all three renderers

16. **Add error handling**
    - Graceful degradation if LLM fails
    - Retry logic for transient errors
    - User-friendly error messages

17. **Documentation & cleanup**
    - README with setup instructions
    - Environment variable documentation
    - Remove debug print statements

**Validation:** All three formats work, errors handled gracefully

---

## Key Build Order Principles

1. **Bottom-up component testing:** Build and validate each component independently before integrating
2. **Risk reduction:** Test risky integrations (SSE streaming, LangChain) early
3. **Incremental complexity:** Simple version first (mock), then add features
4. **Always shippable:** Each phase leaves working system, just with less functionality
5. **Frontend last changes:** Don't break existing UI until backend ready

## Integration Points

### Frontend ↔ Backend

**Contract:** REST API with SSE streaming

**Request Format:**
```typescript
POST /api/chat?format=flowtoken
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "Who is the mayor?" }
  ]
}
```

**Response Format:**
```
Content-Type: text/event-stream

data: The mayor

data:  is Jane Smith

data: . <Contact name="Jane Smith" email="mayor@city.gov"/>

data: [DONE]
```

**Error Handling:**
```json
// Non-streaming error response
{
  "error": "LLM service unavailable",
  "detail": "Mistral API returned 503"
}
```

### Agent ↔ RAG Tool

**Interface:** LangChain tool protocol

**Tool Definition:**
```python
@tool(response_format="content_and_artifact")
def retrieve_context(query: str) -> str:
    """Docstring guides agent when to use tool"""
    pass
```

**Agent Invocation:**
```python
# Agent decides to use tool
tool_call = {
    "name": "retrieve_context",
    "args": {"query": "mayor contact information"}
}

# Tool returns result
tool_result = "Jane Smith, Mayor\nEmail: mayor@city.gov..."

# Agent uses result to format response
```

### LLM ↔ Vector Store

**Interface:** Embeddings and similarity search

**Embedding Phase (Initialization):**
```python
# Documents → Chunks
chunks = text_splitter.split_documents(documents)

# Chunks → Embeddings
embeddings = embedding_model.embed_documents([c.page_content for c in chunks])

# Embeddings → Vector Store
vector_store.add_embeddings(embeddings, chunks)
```

**Query Phase (Runtime):**
```python
# Query → Embedding
query_embedding = embedding_model.embed_query("mayor contact")

# Embedding → Similar Chunks
results = vector_store.similarity_search_by_vector(query_embedding, k=3)
```

## Configuration Management

### Environment Variables

**Backend `.env`:**
```bash
# LLM
MISTRAL_API_KEY=your_key_here
MISTRAL_MODEL=mistral-large-latest

# Vector Store
VECTOR_STORE_TYPE=chroma  # or faiss
VECTOR_STORE_PATH=./chroma_db
KNOWLEDGE_BASE_PATH=./data/knowledge

# Server
HOST=0.0.0.0
PORT=8000
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com

# Embeddings
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2

# Agent
AGENT_TEMPERATURE=0.7
AGENT_MAX_TOKENS=2048
```

**Frontend `.env.local`:**
```bash
# Backend API URL (for production proxy)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Or for production
# NEXT_PUBLIC_API_URL=https://api.yourbackend.com
```

### Configuration Service

**`backend/src/config.py`:**
```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    mistral_api_key: str
    mistral_model: str = "mistral-large-latest"

    vector_store_type: str = "chroma"
    vector_store_path: str = "./chroma_db"
    knowledge_base_path: str = "./data/knowledge"

    host: str = "0.0.0.0"
    port: int = 8000
    cors_origins: list[str] = ["http://localhost:3000"]

    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"

    agent_temperature: float = 0.7
    agent_max_tokens: int = 2048

    class Config:
        env_file = ".env"

settings = Settings()
```

## Testing Strategy

### Unit Tests

**Vector Store Service:**
```python
def test_vector_store_initialization():
    """Test vector store can load and index documents"""

def test_similarity_search():
    """Test search returns relevant documents"""

def test_empty_query():
    """Test behavior with empty query string"""
```

**RAG Tool:**
```python
def test_rag_tool_basic_query():
    """Test tool returns context for valid query"""

def test_rag_tool_no_results():
    """Test tool behavior when no results found"""
```

**Agent Service:**
```python
async def test_agent_simple_question():
    """Test agent can answer without tools"""

async def test_agent_uses_rag_tool():
    """Test agent invokes RAG for factual questions"""
```

### Integration Tests

**End-to-End API:**
```python
async def test_chat_endpoint_streaming():
    """Test /api/chat returns SSE stream"""

async def test_chat_endpoint_with_entities():
    """Test response includes Contact entities"""
```

### Manual Testing Checklist

- [ ] Frontend receives SSE stream from backend
- [ ] Agent calls RAG tool for factual questions
- [ ] Agent skips RAG for conversational queries
- [ ] ContactCard renders for contact queries
- [ ] CalendarEvent renders for event queries
- [ ] All three formats (flowtoken, llm-ui, streamdown) work
- [ ] Error messages display gracefully

## Deployment Considerations (Future)

**Frontend:**
- Vercel (Next.js optimized)
- Configure API proxy to backend
- Environment variables for backend URL

**Backend:**
- Railway, Render, or fly.io (FastAPI hosting)
- Persistent volume for Chroma DB (or use cloud vector store)
- Environment variables for API keys
- Health check endpoint (`/health`)

**Knowledge Base:**
- Git repository (for small PoC)
- Git LFS or S3 (for larger datasets)
- CMS integration (for non-technical content updates)

## Sources

### High Confidence (Official Documentation & Recent Tutorials)

**LangChain ReAct Agent Architecture:**
- [Build a RAG agent with LangChain - Official Docs](https://docs.langchain.com/oss/python/langchain/rag)
- [How to create a ReAct agent from scratch - LangGraph Docs](https://langchain-ai.github.io/langgraph/how-tos/react-agent-from-scratch/)
- [LangChain ReAct Agent Template - GitHub](https://github.com/langchain-ai/react-agent)

**FastAPI + LangChain Integration:**
- [Building Smart Web AI Agents with MCP, LangGraph & FastAPI (2026)](https://sgino209.medium.com/building-smart-web-ai-agents-with-mcp-langgraph-fastapi-da2734fe5256)
- [Production-Ready FastAPI + LangGraph Template - GitHub](https://github.com/wassim249/fastapi-langgraph-agent-production-ready-template)
- [FastAPI for LLM Systems: Production LangChain Template](https://activewizards.com/blog/fastapi-for-llm-systems-production-langchain-template)

**SSE Streaming Implementation:**
- [Integrating LangChain with FastAPI for Asynchronous Streaming](https://dev.to/louis-sanna/integrating-langchain-with-fastapi-for-asynchronous-streaming-5d0o)
- [Server Side Events (SSE) with FastAPI and LangChain - GitHub Gist](https://gist.github.com/oneryalcin/2921408da70266aa61f9c40cb2973865)
- [Streaming Responses with LangChain and FastAPI](https://medium.com/@shijotck/streaming-responses-with-langchain-and-fastapi-72e9cfd8088f)

**RAG Implementation Patterns:**
- [Build a RAG agent with NVIDIA Nemotron](https://developer.nvidia.com/blog/build-a-rag-agent-with-nvidia-nemotron/)
- [Using LangChain ReAct Agents to Answer Complex Questions](https://airbyte.com/data-engineering-resources/using-langchain-react-agents)
- [Building a Markdown Knowledge Ingestor for RAG with LangChain](https://medium.com/@vishalkhushlani123/building-a-markdown-knowledge-ingestor-for-rag-with-langchain-ba201515f6c4)

**FastAPI Project Structure:**
- [FastAPI Best Practices - GitHub (zhanymkanov)](https://github.com/zhanymkanov/fastapi-best-practices)
- [FastAPI Project Structure for Large Applications 2026](https://medium.com/@devsumitg/the-perfect-structure-for-a-large-production-ready-fastapi-app-78c55271d15c)
- [Structuring FastAPI Projects: Best Practices](https://medium.com/@agusabdulrahman/structuring-fastapi-projects-best-practices-for-clean-and-scalable-code-a993b297ea3a)

**Monorepo Structure:**
- [Generating API clients in monorepos with FastAPI & Next.js](https://www.vintasoftware.com/blog/nextjs-fastapi-monorepo)
- [Full-Stack Type Safety with FastAPI, Next.js, and OpenAPI Spec](https://abhayramesh.com/blog/type-safe-fullstack)
- [Next.js FastAPI Template - GitHub](https://github.com/vintasoftware/nextjs-fastapi-template)

**Structured Output:**
- [LangChain Structured Output - Official Docs](https://docs.langchain.com/oss/python/langchain/structured-output)
- [LangChain Output Parsers: From Concept to Implementation (2026)](https://atalupadhyay.wordpress.com/2026/01/14/langchain-output-parsers-from-concept-to-implementation/)
- [LangChain Structured Outputs Guide](https://mirascope.com/blog/langchain-structured-output)

**Vector Stores & RAG Setup:**
- [Learn How to Build Reliable RAG Applications in 2026](https://dev.to/pavanbelagatti/learn-how-to-build-reliable-rag-applications-in-2026-1b7p)
- [LangChain RAG Tutorial 2026](https://langchain-tutorials.github.io/langchain-rag-tutorial-2026/)
- [LangChain Document Loaders & Vector Stores](https://superml.dev/langchain-document-vector-guide)

---

**Research Confidence Assessment:**
- Architecture patterns: HIGH (verified with official LangChain docs)
- FastAPI integration: HIGH (multiple recent 2026 sources)
- SSE streaming: HIGH (working code examples found)
- Project structure: MEDIUM-HIGH (best practices, not prescriptive)
- Build order: MEDIUM (based on dependency analysis and experience patterns)
