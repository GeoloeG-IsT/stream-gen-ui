# Stream Gen UI — City Chatbot Backend

## What This Is

A city chatbot (neuraflow.de use case) that answers public questions about contacts, events, and general city services. The frontend already exists as a streaming UI comparison framework — this work adds a real FastAPI backend with a ReAct agent powered by Mistral and RAG over markdown knowledge files.

## Core Value

The chatbot returns accurate, well-formatted responses with Contact cards and Calendar events rendered as rich UI components when relevant.

## Requirements

### Validated

<!-- Shipped and confirmed valuable. -->

- ✓ Streaming UI with three renderer implementations (FlowToken, llm-ui, Streamdown) — existing
- ✓ ContactCard component renders contact entities with name, email, phone, address, avatar — existing
- ✓ CalendarEvent component renders events with title, date, time, location, description — existing
- ✓ useChat hook integration with DefaultChatTransport — existing
- ✓ Format-aware content generation based on URL query parameters — existing
- ✓ Error boundaries for graceful fallback — existing

### Active

<!-- Current scope. Building toward these. -->

- [ ] Frontend files reorganized into frontend/ folder with working build
- [ ] FastAPI backend exposing /api/chat endpoint with streaming SSE responses
- [ ] ReAct agent using LangChain/LangGraph with Mistral LLM
- [ ] RAG tool searching markdown knowledge base (contacts, events, city info)
- [ ] Agent formats Contact entities matching ContactCardProps interface
- [ ] Agent formats CalendarEvent entities matching CalendarEventProps interface
- [ ] Fictional markdown knowledge base with city contacts and events
- [ ] End-to-end streaming: user asks → agent reasons → RAG retrieves → response streams

### Out of Scope

- Production deployment — this is a PoC
- Authentication — public chatbot, no auth needed
- Multiple LLM providers — Mistral only
- Real city data — using fictional data
- Persistent chat history — stateless per request

## Context

**Existing frontend:**
- Next.js 16 with App Router, React 19, TypeScript
- AI SDK v6 with useChat hook for streaming
- Three streaming renderer implementations comparing FlowToken, llm-ui, Streamdown
- Custom components: ContactCard, CalendarEvent
- Currently uses mock /api/chat endpoint that returns preset content

**Entity formats expected by frontend:**

ContactCardProps:
```typescript
{
  name: string;        // required
  email?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}
```

CalendarEventProps:
```typescript
{
  title: string;       // required
  date: string;        // required
  startTime?: string;
  endTime?: string;
  location?: string;
  description?: string;
}
```

**Backend will use:**
- FastAPI for REST/SSE endpoints
- LangChain/LangGraph for ReAct agent
- Mistral for LLM
- ChromaDB or FAISS for vector store (PoC-appropriate)

## Constraints

- **Tech stack (frontend)**: Keep existing Next.js/React/TypeScript setup — only reorganize into frontend/
- **Tech stack (backend)**: FastAPI + LangChain + Mistral — user specified
- **Scope**: Working PoC, not production-ready
- **Entity format**: Backend must emit entities matching existing frontend component interfaces

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mistral LLM | User preference | — Pending |
| FastAPI backend | User preference, good SSE support | — Pending |
| LangChain/LangGraph | User preference, ReAct agent support | — Pending |
| Frontend reorganization first | Clean separation before adding backend | — Pending |
| Fictional city data | PoC doesn't need real data | — Pending |

---
*Last updated: 2026-01-20 after initialization*
