# Requirements: Stream Gen UI

**Defined:** 2026-01-21
**Core Value:** The chatbot returns accurate, well-formatted responses with Contact cards and Calendar events rendered as rich UI components when relevant.

## v1.1 Requirements

Requirements for Renderer Integration milestone. Completes all three renderer implementations with proper backend integration.

### Backend Marker Strategy

- [x] **MARK-01**: /api/chat accepts `marker` query param to select output format (xml, llm-ui)
- [x] **MARK-02**: ReAct agent system prompt adapts entity formatting based on marker strategy
- [x] **MARK-03**: XML marker strategy outputs `<contactcard name="..." email="..."></contactcard>` and `<calendarevent title="..." date="..."></calendarevent>` tags
- [x] **MARK-04**: llm-ui marker strategy outputs `【CONTACT:{"name":"..."}】` and `【CALENDAR:{"title":"..."}】` format

### Renderer Wiring

- [ ] **WIRE-01**: llm-ui page connects to /api/chat endpoint with marker=llm-ui param
- [ ] **WIRE-02**: Streamdown page connects to /api/chat endpoint with marker=xml param

### UX Fixes

- [ ] **UX-01**: llm-ui renderer hides transient incomplete markup while streaming (no flickering raw delimiters)
- [ ] **UX-02**: Streamdown renderer hides transient incomplete markup while streaming (no flickering raw tags)

### Cleanup

- [ ] **CLEAN-01**: Remove dead code (unused imports, legacy mock patterns, orphaned utilities)

## Future Requirements

Deferred beyond v1.1.

### Multi-turn Conversation

- **CONV-01**: Agent remembers context across messages in a session
- **CONV-02**: Follow-up questions work without repeating context

### Production Hardening

- **PROD-01**: Structured logging with request correlation
- **PROD-02**: Rate limiting for public endpoint
- **PROD-03**: Health check endpoint for monitoring

## Out of Scope

Explicitly excluded from this milestone.

| Feature | Reason |
|---------|--------|
| Authentication | Public chatbot, no auth needed |
| Real city data | PoC uses fictional data |
| Multi-language | English-only for now |
| Production deployment | User handles deployment separately |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| MARK-01 | Phase 4 | Complete |
| MARK-02 | Phase 4 | Complete |
| MARK-03 | Phase 4 | Complete |
| MARK-04 | Phase 4 | Complete |
| WIRE-01 | Phase 5 | Pending |
| WIRE-02 | Phase 5 | Pending |
| UX-01 | Phase 5 | Pending |
| UX-02 | Phase 5 | Pending |
| CLEAN-01 | Phase 6 | Pending |

**Coverage:**
- v1.1 requirements: 9 total
- Mapped to phases: 9
- Unmapped: 0

---
*Requirements defined: 2026-01-21*
*Last updated: 2026-01-21 — Phase 4 requirements complete*
