# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-21)

**Core value:** The chatbot returns accurate, well-formatted responses with Contact cards and Calendar events rendered as rich UI components when relevant.
**Current focus:** v1.1 Renderer Integration

## Current Position

Phase: 5 (Renderer Integration)
Plan: 3 of 3 complete
Status: Phase complete
Last activity: 2026-01-22 — Completed quick task 004: Research backend deployment options
Branch: feature/v1.1-renderer-integration

Progress: ██████████ 3/3 plans (phase 5 complete)

## v1.0 Performance Summary

**Delivered:**
- 3 phases, 10 plans, 28 requirements
- ~6,400 LOC (5,162 TypeScript, 1,249 Python)
- 3 days from start to ship

**Velocity:**
- Total plans: 10
- Average duration: 4 min
- Total execution time: ~45 min

**Archived:**
- milestones/v1.0-ROADMAP.md
- milestones/v1.0-REQUIREMENTS.md
- milestones/v1.0-MILESTONE-AUDIT.md

## Accumulated Context

### Decisions

All v1.0 decisions documented in PROJECT.md Key Decisions table with outcomes.

**v1.1 Phase 04:**

| Phase | Decision | Rationale | Outcome |
|-------|----------|-----------|---------|
| 04-01 | Default marker is xml | Backward compatibility with existing Streamdown renderer | Clients opt into llm-ui explicitly |
| 04-01 | Use str, Enum inheritance | FastAPI auto-documentation and clean JSON serialization | OpenAPI schema documents valid values |
| 04-01 | Return 400 with valid_values | Helpful error messages guide API consumers | Developer-friendly validation |
| 04-01 | Log marker at INFO level | Monitor renderer usage in production | Operational visibility |
| 04-02 | Template-based prompt generation | Clean separation between shared logic and format-specific syntax | Easy to add new formats in future |
| 04-02 | Request-scoped graph creation | Prevents marker leakage between concurrent requests | Correctness over performance |
| 04-02 | XML: self-closing tags with attributes | Streamdown parser expects attribute-based syntax | Compatible with existing renderer |
| 04-02 | llm-ui: Chinese brackets with JSON | Match llm-ui renderer expectations | Compatible with llm-ui library |
| 04-02 | Unified field names across formats | Consistent data model regardless of output format | Frontend parsers have consistent field access |

**v1.1 Phase 05:**

| Phase | Decision | Rationale | Outcome |
|-------|----------|-----------|---------|
| 05-01 | Toaster positioned bottom-right | Standard location, non-intrusive | Consistent toast UX |
| 05-01 | ComponentSkeleton uses type prop | Single component handles both contact/calendar variants | Simpler API for consumers |
| 05-01 | Fade animation 150ms ease-out | Quick but visible transition | Smooth skeleton-to-component feel |
| 05-01 | Reduced motion support for fade | Accessibility best practice | Respects user preferences |
| 05-02 | Detect incomplete blocks via endDelimiter | Simple outputRaw.endsWith(delimiter) check | Clean skeleton-to-component transition |
| 05-02 | Track lastUserMessage for retry | Low cost state addition | Enables future retry feature |
| 05-03 | Regex for incomplete tag detection | Match opening tag without closing at end of content | Skeleton shown instead of raw tags |
| 05-03 | Skeleton type derived from tag name | Map contactcard to 'contact', calendarevent to 'calendar' | Correct skeleton variant displayed |

**Quick Tasks:**

| Phase | Decision | Rationale | Outcome |
|-------|----------|-----------|---------|
| quick-003 | readAheadChars set to 15 | Buffers 【TYPE:{...}】 delimiters (1+8+1+JSON chars) during parsing | Raw delimiters hidden during streaming |
| quick-003 | Throttle constant outside component | Avoid recreation on each render | Performance optimization for streaming |
| quick-004 | Railway recommended for backend deployment | Persistent volumes for ChromaDB, unlimited SSE, Vercel-like DX | Production-ready platform at $5/mo |
| quick-004 | Render as secondary option | Similar capabilities to Railway, slightly higher cost | Solid alternative if Railway unavailable |
| quick-004 | Avoid serverless platforms | Ephemeral storage and timeout limits incompatible | Cloud Run and App Runner ruled out |

### Pending Todos

None

### Blockers/Concerns

None

### Quick Tasks Completed

| # | Description | Date | Commit | Directory |
|---|-------------|------|--------|-----------|
| 001 | Move View Raw output to side panel | 2026-01-21 | 50967933 | [001-move-view-raw-output-from-inline-chat-to](./quick/001-move-view-raw-output-from-inline-chat-to/) |
| 002 | Refactor to llm-ui JSON blocks pattern | 2026-01-22 | fb271373 | [002-refactor-to-llm-ui-json-blocks-pattern](./quick/002-refactor-to-llm-ui-json-blocks-pattern/) |
| 003 | Add throttle function to hide raw delimiters | 2026-01-22 | 3e289ea5 | [003-add-throttle-function-to-hide-raw-delimi](./quick/003-add-throttle-function-to-hide-raw-delimi/) |
| 004 | Research backend deployment options | 2026-01-22 | 7a22acb2 | [004-research-backend-deployment-options-simi](./quick/004-research-backend-deployment-options-simi/) |

## Session Continuity

Last session: 2026-01-22
Stopped at: Completed quick task 004
Resume file: None (phase complete)
