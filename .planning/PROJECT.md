# Stream Gen UI — City Chatbot Backend

## What This Is

A city chatbot (neuraflow.de use case) that answers public questions about contacts, events, and general city services. Features a FastAPI backend with a ReAct agent powered by Mistral LLM and RAG over markdown knowledge files, streaming responses to a Next.js frontend with rich UI components (ContactCard, CalendarEvent).

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
- ✓ Frontend files reorganized into frontend/ folder with working build — v1.0
- ✓ FastAPI backend exposing /api/chat endpoint with streaming SSE responses — v1.0
- ✓ ReAct agent using LangChain/LangGraph with Mistral LLM — v1.0
- ✓ RAG tool searching markdown knowledge base (contacts, events, city info) — v1.0
- ✓ Agent formats Contact entities matching ContactCardProps interface — v1.0
- ✓ Agent formats CalendarEvent entities matching CalendarEventProps interface — v1.0
- ✓ Fictional markdown knowledge base with city contacts and events — v1.0
- ✓ End-to-end streaming: user asks → agent reasons → RAG retrieves → response streams — v1.0

### Active

<!-- Current scope. Building toward these. -->

**Milestone v1.1: Renderer Integration**

Goal: Complete all three renderer implementations (FlowToken, llm-ui, Streamdown) with proper backend integration and marker strategy support.

- [ ] Backend supports multiple marker strategies via query param
- [ ] FlowToken renderer wired to /api/chat with XML markers
- [ ] llm-ui renderer wired to /api/chat with Chinese bracket markers
- [ ] Streamdown renderer wired to /api/chat with XML markers
- [ ] Transient markup bugs fixed in llm-ui and Streamdown
- [ ] Dead code cleanup

### Out of Scope

- Production deployment — this is a PoC
- Authentication — public chatbot, no auth needed
- Multiple LLM providers — Mistral only
- Real city data — using fictional data
- Persistent chat history — stateless per request

## Context

**Current state (v1.0 shipped):**
- Frontend: Next.js 16 with App Router, React 19, TypeScript (~5,200 LOC)
- Backend: FastAPI with LangChain/LangGraph, Mistral LLM, ChromaDB (~1,200 LOC)
- Knowledge base: 400 chunks covering fictional Berlin city contacts, events, general info
- Streaming: SSE with AI SDK v6 useChat hook integration
- Entity rendering: ContactCard and CalendarEvent components via EntityRenderer

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

**Tech stack:**
- Frontend: Next.js 16, React 19, TypeScript, AI SDK v6
- Backend: FastAPI, LangChain, LangGraph, Mistral, ChromaDB, HuggingFace embeddings

## Constraints

- **Tech stack (frontend)**: Keep existing Next.js/React/TypeScript setup
- **Tech stack (backend)**: FastAPI + LangChain + Mistral
- **Scope**: Working PoC, not production-ready
- **Entity format**: Backend must emit entities matching existing frontend component interfaces

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Mistral LLM | User preference for European data residency | ✓ Good — works well for city queries |
| FastAPI backend | User preference, good SSE support | ✓ Good — clean async streaming |
| LangChain/LangGraph | User preference, ReAct agent support | ✓ Good — state machine pattern works well |
| Frontend reorganization first | Clean separation before adding backend | ✓ Good — monorepo structure established |
| Fictional city data | PoC doesn't need real data | ✓ Good — unblocked development |
| Hybrid RAG (BM25 + semantic) | Better recall than semantic-only | ✓ Good — 0.8/0.2 weighting effective |
| Entity markers (:::contact/:::event) | Distinguishes structured content for parsing | ✓ Good — reliable frontend parsing |
| Source attribution server-side only | User requested cleaner frontend display | ✓ Good — sources logged, not displayed |
| stream_mode="messages" | Token-by-token streaming required | ✓ Good — smooth UX |
| Recursion limit 11 | 2 * max_iterations + 1 safety formula | ✓ Good — prevents infinite loops |

---
*Last updated: 2026-01-21 after v1.1 milestone started*
