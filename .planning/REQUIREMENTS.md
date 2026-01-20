# Requirements: Stream Gen UI — City Chatbot Backend

**Defined:** 2026-01-20
**Core Value:** The chatbot returns accurate, well-formatted responses with Contact cards and Calendar events rendered as rich UI components when relevant.

## v1 Requirements

Requirements for initial PoC release. Each maps to roadmap phases.

### Project Structure

- [x] **STRUCT-01**: Frontend files moved to frontend/ directory
- [x] **STRUCT-02**: Frontend builds and runs from frontend/ directory
- [x] **STRUCT-03**: All source code paths updated for new structure
- [x] **STRUCT-04**: All documentation paths updated for new structure
- [ ] **STRUCT-05**: Backend created in backend/ directory with FastAPI

### RAG & Retrieval

- [ ] **RAG-01**: Markdown files chunked for embedding with appropriate strategy
- [ ] **RAG-02**: Hybrid retrieval combining keyword and semantic search
- [ ] **RAG-03**: Vector store populated with city contacts, events, and general info
- [ ] **RAG-04**: Retrieval returns source metadata (document title, chunk reference)

### ReAct Agent

- [ ] **AGENT-01**: ReAct agent implements Thought-Action-Observation cycle
- [ ] **AGENT-02**: Agent uses RAG as a tool and decides when to invoke it
- [ ] **AGENT-03**: Agent has max iteration limit (5) to prevent infinite loops
- [ ] **AGENT-04**: Agent uses Mistral LLM for reasoning

### Structured Output

- [ ] **OUTPUT-01**: Agent outputs Contact entities matching ContactCardProps interface
- [ ] **OUTPUT-02**: Agent outputs CalendarEvent entities matching CalendarEventProps interface
- [ ] **OUTPUT-03**: Response format is consistent and predictable for frontend parsing

### Streaming & API

- [ ] **STREAM-01**: /api/chat endpoint accepts POST with messages array
- [ ] **STREAM-02**: Response streams via SSE (Server-Sent Events)
- [ ] **STREAM-03**: Streaming compatible with existing useChat hook transport
- [ ] **STREAM-04**: Inline citations reference source documents in response

### Conversation

- [ ] **CONV-01**: Message history tracked across conversation turns
- [ ] **CONV-02**: Agent uses conversation context for follow-up questions

### Error Handling & Observability

- [ ] **ERR-01**: Tool call failures handled gracefully with user-friendly messages
- [ ] **ERR-02**: Request timeouts prevent hung requests (configurable, default 30s)
- [ ] **ERR-03**: Agent traces logged via LangSmith or Langfuse

### Knowledge Base

- [ ] **KB-01**: Fictional city contacts created in markdown format
- [ ] **KB-02**: Fictional city events created in markdown format
- [ ] **KB-03**: General city information (hours, services) in markdown format

## v2 Requirements

Deferred to future release. Tracked but not in current roadmap.

### Advanced Retrieval

- **RAG-V2-01**: Query rewriting for improved follow-up retrieval
- **RAG-V2-02**: Reranking for better result relevance
- **RAG-V2-03**: Semantic chunking based on document structure

### Advanced Agent

- **AGENT-V2-01**: Multi-tool orchestration (query multiple sources in sequence)
- **AGENT-V2-02**: Parallel tool execution for independent lookups
- **AGENT-V2-03**: Clarification questions for ambiguous queries

### Observability

- **OBS-V2-01**: Cost tracking for token usage per query
- **OBS-V2-02**: Retrieval metrics (precision, recall) with test dataset

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
|---------|--------|
| Multi-language support | Massive scope increase, English-only for PoC |
| User personalization | PoC is stateless, no user profiles |
| Voice/speech interface | Text-only, validate RAG+ReAct first |
| Human handoff | Testing automation, not hybrid workflows |
| Production security | City info is public, basic validation sufficient |
| Custom fine-tuned models | Prompt engineering + RAG sufficient for PoC |
| Session memory (cross-session) | Stateless per request, no persistence |
| Real city data | Using fictional data for PoC |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| STRUCT-01 | Phase 1 | Complete |
| STRUCT-02 | Phase 1 | Complete |
| STRUCT-03 | Phase 1 | Complete |
| STRUCT-04 | Phase 1 | Complete |
| STRUCT-05 | Phase 2 | Pending |
| RAG-01 | Phase 2 | Pending |
| RAG-02 | Phase 2 | Pending |
| RAG-03 | Phase 2 | Pending |
| RAG-04 | Phase 2 | Pending |
| KB-01 | Phase 2 | Pending |
| KB-02 | Phase 2 | Pending |
| KB-03 | Phase 2 | Pending |
| AGENT-01 | Phase 3 | Pending |
| AGENT-02 | Phase 3 | Pending |
| AGENT-03 | Phase 3 | Pending |
| AGENT-04 | Phase 3 | Pending |
| OUTPUT-01 | Phase 3 | Pending |
| OUTPUT-02 | Phase 3 | Pending |
| OUTPUT-03 | Phase 3 | Pending |
| STREAM-01 | Phase 3 | Pending |
| STREAM-02 | Phase 3 | Pending |
| STREAM-03 | Phase 3 | Pending |
| STREAM-04 | Phase 3 | Pending |
| CONV-01 | Phase 3 | Pending |
| CONV-02 | Phase 3 | Pending |
| ERR-01 | Phase 3 | Pending |
| ERR-02 | Phase 3 | Pending |
| ERR-03 | Phase 3 | Pending |

**Coverage:**
- v1 requirements: 28 total
- Mapped to phases: 28
- Unmapped: 0 ✓

---
*Requirements defined: 2026-01-20*
*Last updated: 2026-01-20 after initial definition*
