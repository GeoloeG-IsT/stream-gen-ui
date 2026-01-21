# Roadmap: Stream Gen UI v1.1

**Milestone:** v1.1 Renderer Integration
**Goal:** Complete all three renderer implementations with proper backend integration and marker strategy support.
**Phases:** 4-6 (continues from v1.0)

## Phase Overview

| Phase | Name | Goal | Requirements | Success Criteria |
|-------|------|------|--------------|------------------|
| 4 | Backend Marker Strategy | Backend supports multiple marker formats via query param | MARK-01, MARK-02, MARK-03, MARK-04 | 4 |
| 5 | Renderer Integration | All renderers connected to live backend with UX fixes | WIRE-01, WIRE-02, UX-01, UX-02 | 4 |
| 6 | Cleanup | Remove dead code and polish | CLEAN-01 | 2 |

**Total:** 3 phases | 9 requirements | All mapped

---

## Phase 4: Backend Marker Strategy

**Goal:** Backend /api/chat endpoint supports multiple marker formats via query param, with ReAct agent adapting its output accordingly.

**Requirements:**
- MARK-01: /api/chat accepts `marker` query param (xml, llm-ui)
- MARK-02: ReAct agent system prompt adapts to marker strategy
- MARK-03: XML format outputs `<contactcard>` and `<calendarevent>` tags
- MARK-04: llm-ui format outputs `【CONTACT:{...}】` and `【CALENDAR:{...}】`

**Success Criteria:**
1. GET /api/chat?marker=xml streams responses with XML entity tags
2. GET /api/chat?marker=llm-ui streams responses with Chinese bracket JSON format
3. Default marker (no param) uses xml format
4. Agent correctly formats Contact and CalendarEvent entities per strategy

**Dependencies:** None (builds on v1.0 backend)

---

## Phase 5: Renderer Integration

**Goal:** Wire llm-ui and Streamdown pages to live /api/chat backend, fix transient markup display issues.

**Requirements:**
- WIRE-01: llm-ui page uses /api/chat with marker=llm-ui
- WIRE-02: Streamdown page uses /api/chat with marker=xml
- UX-01: llm-ui hides incomplete markup during streaming
- UX-02: Streamdown hides incomplete markup during streaming

**Success Criteria:**
1. llm-ui page streams real responses from backend (not mock data)
2. Streamdown page streams real responses from backend (not mock data)
3. No raw delimiters (【, 】) visible during llm-ui streaming
4. No incomplete XML tags visible during Streamdown streaming

**Dependencies:** Phase 4 (marker strategy support)

---

## Phase 6: Cleanup

**Goal:** Remove dead code, unused imports, and legacy patterns.

**Requirements:**
- CLEAN-01: Dead code removal

**Success Criteria:**
1. No unused imports across frontend and backend
2. No orphaned mock data files (if superseded by real API)

**Dependencies:** Phase 5 (know what's actually used)

---

## Requirement Coverage

All v1.1 requirements mapped:

| Requirement | Phase | Description |
|-------------|-------|-------------|
| MARK-01 | 4 | Query param for marker strategy |
| MARK-02 | 4 | System prompt adaptation |
| MARK-03 | 4 | XML marker format |
| MARK-04 | 4 | llm-ui marker format |
| WIRE-01 | 5 | llm-ui backend wiring |
| WIRE-02 | 5 | Streamdown backend wiring |
| UX-01 | 5 | llm-ui transient markup fix |
| UX-02 | 5 | Streamdown transient markup fix |
| CLEAN-01 | 6 | Dead code removal |

**Coverage:** 9/9 (100%)

---
*Roadmap created: 2026-01-21*
*Last updated: 2026-01-21*
