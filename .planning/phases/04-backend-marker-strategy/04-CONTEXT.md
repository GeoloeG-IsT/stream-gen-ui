# Phase 4: Backend Marker Strategy - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Backend /api/chat endpoint supports multiple marker formats via `marker` query param (xml, llm-ui). ReAct agent adapts its output accordingly. Default is xml format. Frontend wiring to these endpoints is Phase 5.

</domain>

<decisions>
## Implementation Decisions

### Error handling
- Invalid marker values (e.g., `marker=foo`): Return 400 Bad Request
- Error format: JSON object `{"error": "Invalid marker", "valid_values": ["xml", "llm-ui"]}`
- No docs link in error response — keep it minimal
- Mid-stream errors (agent fails during generation): Send error event in stream `{"type": "error", "message": "..."}`

### Tag content structure
- Use compact attribute format, not JSON body inside tags
- XML format: `<contactcard name="..." email="..." />` style
- llm-ui format: `【CONTACT:{"name": "...", "email": "..."}】` — same fields, JSON syntax
- **Format parity:** Both formats contain identical fields

**ContactCard fields (full set):**
- name, email, phone, company, title, avatar, social links

**CalendarEvent fields (full set):**
- title, date, time, location, description, attendees, link

### Logging & debugging
- Log marker choice on each request at INFO level
- Add `X-Marker-Strategy` response header indicating which format was used
- No debug mode — keep it simple, use logs
- Transformation errors (malformed entity from agent): Log as WARN

### Claude's Discretion
- Exact attribute naming in XML format
- Agent prompt wording for marker adaptation
- Error event structure details beyond type and message

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-backend-marker-strategy*
*Context gathered: 2026-01-21*
