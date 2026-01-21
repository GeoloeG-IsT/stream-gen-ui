---
phase: 04-backend-marker-strategy
verified: 2026-01-21T19:50:00Z
status: passed
score: 7/7 must-haves verified
---

# Phase 4: Backend Marker Strategy Verification Report

**Phase Goal:** Backend /api/chat endpoint supports multiple marker formats via query param, with ReAct agent adapting its output accordingly.

**Verified:** 2026-01-21T19:50:00Z
**Status:** passed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | /api/chat accepts marker query param | ✓ VERIFIED | Line 206: `marker: str = "xml"` in function signature |
| 2 | Invalid marker values return 400 Bad Request | ✓ VERIFIED | Lines 224-229: Validation with HTTPException and valid_values hint |
| 3 | Default marker (no param) uses xml | ✓ VERIFIED | Line 206: Default parameter `marker: str = "xml"` |
| 4 | Response includes X-Marker-Strategy header | ✓ VERIFIED | Line 256: `"X-Marker-Strategy": marker` in response headers |
| 5 | Agent outputs XML format when marker=xml | ✓ VERIFIED | Lines 11-24 prompts.py: XML_CONTACT_FORMAT and XML_EVENT_FORMAT templates |
| 6 | Agent outputs llm-ui format when marker=llm-ui | ✓ VERIFIED | Lines 28-42 prompts.py: LLMUI_CONTACT_FORMAT and LLMUI_EVENT_FORMAT templates |
| 7 | ReAct agent system prompt adapts to marker strategy | ✓ VERIFIED | Lines 159-183 prompts.py: get_agent_prompt(marker) switches formats |

**Score:** 7/7 truths verified

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `backend/models/schemas.py` | MarkerStrategy enum | ✓ VERIFIED | Lines 5-8: XML and LLM_UI enum values, str inheritance |
| `backend/main.py` | marker query param handling | ✓ VERIFIED | Lines 203-257: Parameter, validation, logging, header |
| `backend/agent/prompts.py` | Marker-aware prompt templates | ✓ VERIFIED | Lines 11-183: Format templates + get_agent_prompt(marker) |
| `backend/agent/graph.py` | Request-scoped graph creation | ✓ VERIFIED | Lines 28-110: create_agent_graph(marker) with prompt wiring |

**All artifacts exist, substantive (71-262 lines), and properly wired.**

### Key Link Verification

| From | To | Via | Status | Details |
|------|-----|-----|--------|---------|
| `backend/main.py` | `backend/models/schemas.py` | MarkerStrategy import | ✓ WIRED | Line 23: Import statement present |
| `backend/main.py` | `backend/agent/graph.py` | marker param in create_agent_graph call | ✓ WIRED | Line 162: `create_agent_graph(marker)` |
| `backend/agent/graph.py` | `backend/agent/prompts.py` | marker param in get_agent_prompt call | ✓ WIRED | Line 54: `get_agent_prompt(marker)` |
| `backend/main.py` | `stream_agent_response` | marker param passed | ✓ WIRED | Line 254: `stream_agent_response(lc_messages, message_id, marker)` |
| `stream_agent_response` | Graph creation | marker param | ✓ WIRED | Line 162: Graph created with marker parameter |

**All critical wiring paths verified. Marker flows: endpoint → stream function → graph creation → prompt generation.**

### Requirements Coverage

| Requirement | Status | Evidence |
|-------------|--------|----------|
| MARK-01: /api/chat accepts `marker` query param (xml, llm-ui) | ✓ SATISFIED | Query param exists (line 206), validation with enum values (lines 224-229) |
| MARK-02: ReAct agent system prompt adapts to marker strategy | ✓ SATISFIED | get_agent_prompt(marker) switches contact_format and event_format (lines 168-178) |
| MARK-03: XML format outputs `<contactcard>` and `<calendarevent>` tags | ✓ SATISFIED | XML_CONTACT_FORMAT uses `<contactcard ... />` (line 13), XML_EVENT_FORMAT uses `<calendarevent ... />` (line 21) |
| MARK-04: llm-ui format outputs `【CONTACT:{...}】` and `【CALENDAR:{...}】` | ✓ SATISFIED | LLMUI_CONTACT_FORMAT uses `【CONTACT:{...}】` (line 30), LLMUI_EVENT_FORMAT uses `【CALENDAR:{...}】` (line 38) |

**All 4 requirements satisfied.**

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `backend/agent/__init__.py` | 9 | Outdated docstring reference to `get_agent_graph` | ℹ️ Info | Documentation only - actual export is correct (line 29) |

**No blocker anti-patterns found. One info-level documentation outdatedness.**

### Entity Field Verification

**XML Format:**
- Contact: `name`, `email`, `phone`, `company`, `title` (all attributes present in template)
- Event: `title`, `date`, `time`, `location`, `description` (all attributes present in template)

**llm-ui Format:**
- Contact: `name`, `email`, `phone`, `company`, `title` (all fields present in JSON)
- Event: `title`, `date`, `time`, `location`, `description` (all fields present in JSON)

**Field consistency:** ✓ Both formats use same field names

### Human Verification Required

Manual testing recommended to verify end-to-end behavior:

#### 1. XML Marker Test

**Test:** Start backend server, make request with `curl -X POST "http://localhost:8000/api/chat?marker=xml" -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Who is in the Parks department?"}]}'`

**Expected:** 
- Response header contains `X-Marker-Strategy: xml`
- Agent output includes `<contactcard name="..." email="..." />` format

**Why human:** Requires running server and LLM API key to test actual agent output

#### 2. llm-ui Marker Test

**Test:** Make request with `marker=llm-ui` query parameter

**Expected:** 
- Response header contains `X-Marker-Strategy: llm-ui`
- Agent output includes `【CONTACT:{"name":"...","email":"..."}】` format

**Why human:** Requires running server and LLM API key to test actual agent output

#### 3. Default Marker Test

**Test:** Make request without marker parameter

**Expected:** 
- Response defaults to XML format
- Header shows `X-Marker-Strategy: xml`

**Why human:** Requires running server to verify default behavior

#### 4. Invalid Marker Test

**Test:** Make request with `marker=invalid`

**Expected:** 
- 400 Bad Request status
- Response body contains `{"error": "Invalid marker", "valid_values": ["xml", "llm-ui"]}`

**Why human:** Requires running server to verify error response format

## Success Criteria Evaluation

From ROADMAP.md Phase 4 success criteria:

| # | Criterion | Status | Evidence |
|---|-----------|--------|----------|
| 1 | GET /api/chat?marker=xml streams responses with XML entity tags | ✓ CODE READY | Prompt template has XML tags, wiring complete |
| 2 | GET /api/chat?marker=llm-ui streams responses with Chinese bracket JSON format | ✓ CODE READY | Prompt template has llm-ui delimiters, wiring complete |
| 3 | Default marker (no param) uses xml format | ✓ VERIFIED | Default parameter value is "xml" |
| 4 | Agent correctly formats Contact and CalendarEvent entities per strategy | ✓ CODE READY | Templates specify all required fields for both entities |

**All success criteria met at code level. Human verification needed for runtime behavior.**

## Deviations from Plans

**From 04-02-SUMMARY.md:**

1. **Field name standardization** (Rule 1 - Bug fix)
   - Changed "address" to "company" for contact affiliation
   - Changed "startTime/endTime" to single "time" field
   - Impact: Aligned with knowledge base schema
   - Status: ✓ Properly documented, no issue

**No scope creep or unplanned changes.**

## Code Quality Assessment

**Strengths:**
- Clean separation of concerns (enum, validation, prompt, graph)
- Template-based prompt generation enables easy format additions
- Request-scoped graph pattern prevents marker leakage
- Proper error handling with helpful error messages
- Comprehensive logging (INFO level for marker selection)
- Type hints throughout
- Docstrings on all major functions

**Architecture pattern:**
```
/api/chat?marker=X 
  → validate marker (main.py line 224)
  → create_agent_graph(marker) (main.py line 162)
    → get_agent_prompt(marker) (graph.py line 54)
      → select XML vs llm-ui templates (prompts.py lines 168-173)
  → stream response with X-Marker-Strategy header (main.py line 256)
```

**Request-scoped design:**
- Removed singleton pattern (no more `_agent_graph` global)
- Each request creates fresh graph with appropriate marker
- Prevents concurrent request interference
- Trade-off: Slight performance overhead vs correctness (correct choice)

## Next Phase Readiness

**Phase 5 prerequisites:**
- ✓ Backend marker parameter API stable
- ✓ XML format ready for Streamdown page
- ✓ llm-ui format ready for llm-ui page  
- ✓ Response headers include strategy metadata
- ✓ Agent outputs match expected format structure

**No blockers for Phase 5 (Renderer Integration).**

Frontend can now:
- Call `/api/chat?marker=xml` for Streamdown page
- Call `/api/chat?marker=llm-ui` for llm-ui page
- Parse entity markers in streaming response
- Verify strategy via X-Marker-Strategy header

## Summary

Phase 4 goal **ACHIEVED**. All code artifacts exist, are substantive (not stubs), and properly wired together. The marker parameter flows correctly from API endpoint through graph creation to prompt generation. Both XML and llm-ui format templates are complete with all required entity fields.

**Gap analysis:** None. All must-haves verified at code level.

**Risk:** Runtime behavior depends on LLM following prompt instructions. While templates are correct, actual agent output quality requires human testing with live LLM.

**Recommendation:** Proceed to Phase 5 (Renderer Integration). Conduct manual testing during Phase 5 to verify agent output format compliance.

---
_Verified: 2026-01-21T19:50:00Z_
_Verifier: Claude (gsd-verifier)_
