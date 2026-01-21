# Roadmap: Stream Gen UI — City Chatbot Backend

## Overview

Transform the existing frontend streaming UI comparison into a full-stack city chatbot by reorganizing the codebase, building a FastAPI backend with RAG-powered knowledge retrieval, and integrating a ReAct agent that formats responses as rich UI components. The journey moves from structure (Phase 1) to foundation (Phase 2) to intelligence (Phase 3), delivering a working PoC where users ask city questions and receive streaming responses with Contact cards and Calendar events.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Frontend Reorganization** - Restructure codebase with frontend/ and backend/ separation
- [x] **Phase 2: Backend Foundation + RAG** - Build FastAPI backend with vector retrieval over markdown knowledge base
- [x] **Phase 3: ReAct Agent + Streaming Integration** - Add intelligent agent with streaming SSE and structured entity output

## Phase Details

### Phase 1: Frontend Reorganization
**Goal**: Clean frontend/backend separation with working Next.js build in frontend/ directory
**Depends on**: Nothing (first phase)
**Requirements**: STRUCT-01, STRUCT-02, STRUCT-03, STRUCT-04
**Success Criteria** (what must be TRUE):
  1. All Next.js source files exist under frontend/ directory with correct structure
  2. Frontend builds successfully from frontend/ directory without errors
  3. Frontend development server runs and renders existing streaming UI components
  4. All import paths and configuration files reference correct locations
**Plans**: 1 plan

Plans:
- [x] 01-01-PLAN.md — Move frontend code to frontend/ directory with configuration updates

### Phase 2: Backend Foundation + RAG
**Goal**: Working FastAPI backend with RAG retrieval over fictional city knowledge base
**Depends on**: Phase 1
**Requirements**: STRUCT-05, RAG-01, RAG-02, RAG-03, RAG-04, KB-01, KB-02, KB-03
**Success Criteria** (what must be TRUE):
  1. Backend server runs and exposes /api/chat endpoint accepting POST requests
  2. Markdown knowledge base contains fictional city contacts, events, and general information
  3. Vector store successfully retrieves relevant documents for sample queries
  4. Hybrid search combines keyword and semantic retrieval with source metadata
  5. RAG system returns document chunks with proper attribution (title, reference)
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Backend foundation with FastAPI, config, and schemas
- [x] 02-02-PLAN.md — Knowledge base creation with fictional Berlin city data
- [x] 02-03-PLAN.md — RAG pipeline with hybrid retrieval

### Phase 3: ReAct Agent + Streaming Integration
**Goal**: Intelligent agent streams formatted responses with Contact/CalendarEvent entities to frontend
**Depends on**: Phase 2
**Requirements**: AGENT-01, AGENT-02, AGENT-03, AGENT-04, OUTPUT-01, OUTPUT-02, OUTPUT-03, STREAM-01, STREAM-02, STREAM-03, STREAM-04, CONV-01, CONV-02, ERR-01, ERR-02, ERR-03
**Success Criteria** (what must be TRUE):
  1. ReAct agent executes Thought-Action-Observation cycles and decides when to invoke RAG tool
  2. Agent streams responses via SSE that render correctly in existing useChat frontend
  3. Contact entities format as valid ContactCardProps and render as ContactCard components
  4. CalendarEvent entities format as valid CalendarEventProps and render as CalendarEvent components
  5. Multi-turn conversations maintain context across message history
  6. Tool failures and timeouts handled gracefully with user-friendly error messages
  7. Agent traces logged for debugging and observability
**Plans**: 6 plans

Plans:
- [x] 03-01-PLAN.md — Agent foundation (state, tools, dependencies)
- [x] 03-02-PLAN.md — SSE streaming utilities and entity parser
- [x] 03-03-PLAN.md — LangGraph ReAct agent state machine
- [x] 03-04-PLAN.md — Streaming /api/chat endpoint
- [x] 03-05-PLAN.md — Frontend entity rendering integration
- [x] 03-06-PLAN.md — End-to-end verification

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Frontend Reorganization | 1/1 | ✓ Complete | 2026-01-20 |
| 2. Backend Foundation + RAG | 3/3 | ✓ Complete | 2026-01-20 |
| 3. ReAct Agent + Streaming Integration | 6/6 | ✓ Complete | 2026-01-21 |
