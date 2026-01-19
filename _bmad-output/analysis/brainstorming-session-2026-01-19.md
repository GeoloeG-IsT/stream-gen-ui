---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: []
session_topic: 'Overall direction for stream-gen-ui PoC - streaming chat UI with custom markup to rich components'
session_goals: 'Explore technical architecture possibilities with pros and cons'
selected_approach: 'AI-Recommended Techniques'
techniques_used: ['First Principles Thinking', 'Morphological Analysis', 'Decision Tree Mapping']
ideas_generated: ['14 bedrock truths', '3 architectural directions', 'meta-architecture for comparison', 'implementation order recommendation']
context_file: '_bmad/bmm/data/project-context-template.md'
session_complete: true
---

# Brainstorming Session Results

**Facilitator:** GeoloeG
**Date:** 2026-01-19

## Session Overview

**Topic:** Overall direction for stream-gen-ui as a Proof of Concept - a streaming chat UI that parses custom markup tags into rich UI components

**Goals:** Explore technical architecture possibilities with their trade-offs, appropriate for PoC scope

### Context Guidance

This PoC explores the intersection of:
- LLM streaming output handling
- Custom markup parsing and detection
- Dynamic component rendering mid-stream
- Rich UI component integration (contact cards, calendars, etc.)

### Session Setup

**Scope:** Proof of Concept - proving feasibility and exploring boundaries
**Approach:** AI-Recommended Techniques - curated methods for technical architecture exploration
**Focus Areas:**
- Parsing location (client/server/hybrid)
- Stream handling and buffering strategies
- Component rendering lifecycle
- Markup format design
- State management patterns
- Error handling in partial streams

## Technique Selection

**Approach:** AI-Recommended Techniques
**Analysis Context:** Technical architecture exploration for PoC with trade-off analysis

**Recommended Techniques:**

1. **First Principles Thinking:** Strip away assumptions about how streaming UIs "should work" to establish fundamental truths and constraints
2. **Morphological Analysis:** Systematically map architectural dimensions and explore option combinations
3. **Decision Tree Mapping:** For promising approaches, map decision paths and document trade-offs

**AI Rationale:** This sequence moves from establishing bedrock truths → systematic exploration of options → trade-off evaluation, optimized for technical decision-making in a PoC context.

---

## Technique Execution

### Technique 1: First Principles Thinking

**Focus:** Strip away assumptions to establish bedrock truths for the PoC

#### Bedrock Truths Established

| # | Truth | Architectural Implication |
|---|-------|---------------------------|
| 1 | Tokens arrive sequentially | Must handle partial/incomplete states |
| 2 | Tag type known at `<tagname ` (space) | Can render skeleton immediately on tag recognition |
| 3 | Props arrive incrementally | Progressive enhancement: skeleton → props → complete |
| 4 | Text outside markup = normal rendering | Parser only activates on `<known_tag ` pattern |
| 5 | Finite, known tag set | Simple lookup parser, not grammar inference |
| 6 | Freeze + error on incomplete | Components track "last valid state" for graceful degradation |
| 7 | Flat components (no nesting) | Simple state machine parser, one component at a time |
| 8 | Interactive while streaming | Components independent once rendered; two parallel concerns |
| 9 | Props purely from stream | Components are self-contained islands - no external dependencies |
| 10 | Components never die | Chat is append-only log of text + component instances |
| 11 | Duplicate components = independent | No deduplication, no shared state between instances |
| 12 | Stream source is mocked | PoC focuses purely on frontend stream consumption |
| 13 | LLM awareness out of scope | No prompt engineering - just "markup appears in stream" |
| 14 | Best effort prop rendering | Frontend is permissive; validation is server's job |

#### Emergent Pattern: Component Islands in a Text Stream

```
┌─────────────────────────────────────────────┐
│  Chat Log (append-only)                     │
├─────────────────────────────────────────────┤
│  "Here's the contact:"                      │  ← text
│  ┌─────────────────────────────┐            │
│  │ ContactCard (self-contained)│            │  ← island
│  └─────────────────────────────┘            │
│  "And another:"                             │  ← text
│  ┌─────────────────────────────┐            │
│  │ ContactCard (independent)   │            │  ← island
│  └─────────────────────────────┘            │
└─────────────────────────────────────────────┘
```

#### PoC Scope Defined

**Building:** Frontend system consuming text stream → detecting tags → progressive rendering → interactive islands

**Not Building:** LLM integration, server parsing, nesting, lifecycle management, prop validation

---

### Technique 2: Morphological Analysis

**Focus:** Systematically map architectural dimensions and explore option combinations

#### Architectural Dimensions Identified

| Dimension | Decision Area |
|-----------|---------------|
| A. Stream Consumption | How frontend receives/buffers the stream |
| B. Parser Architecture | How we detect tags and extract props |
| C. State Management | How we track parsing state + component states |
| D. Render Strategy | How components appear and update (React - constrained) |
| E. Component Registry | How we map tag names to components |
| F. Markup Format | Exact syntax for component tags |
| G. Build vs. Compose | How much to build vs. use libraries |

#### Three Directions Defined

| Dimension | Direction 1 (Extend Library) | Direction 2 (Custom Parser) | Direction 3 (Markdown+) |
|-----------|------------------------------|----------------------------|-------------------------|
| A. Stream | Library's expectation | Token/chunk based | Token/chunk based |
| B. Parser | Library's parser | State machine (custom) | remark/rehype pipeline |
| C. State | Library's model | Reducer pattern | React state + library |
| D. Render | React | React | React |
| E. Registry | Map into library's API | Static map | react-markdown components |
| F. Markup | XML-like | XML-like | XML-like (test if works) |
| G. Approach | Extend llm-ui or similar | Build parser from scratch | Compose react-markdown |

#### Meta-Architecture: Comparison Harness

**Decision:** Build all three directions in one PoC with menu to switch between implementations.

**Shared Layer:**
- MockStreamProvider (simulates LLM stream)
- Test content presets (same strings for all)
- Component UI library (ContactCard, CalendarCard, etc.)
- Props interfaces (TypeScript types)
- UI Shell (layout, direction switcher)

**Per-Implementation:** Parser logic, state management, stream consumption approach

**Markup Strategy:** Identical input (XML-like) for all three. Adapt if constraints discovered.

---

### Technique 3: Decision Tree Mapping

**Focus:** Map decision paths and document trade-offs for each direction

#### Direction 1: Extend Existing Library

**Decision Path:**
1. Which library? (llm-ui, vercel ai sdk, etc.)
2. Does it support custom components natively?
3. Can it handle XML-like markup?

**Trade-offs:**

| Aspect | Rating | Notes |
|--------|--------|-------|
| Implementation Speed | Fast | If library fits |
| Control | Low | Library dictates model |
| Streaming Quality | High | Libraries handle edge cases |
| Custom Markup Support | Unknown | Must research |
| Progressive Rendering | Depends | Library might not support skeleton → props |
| Maintenance | Medium | Dependent on library updates |

**Key Risk:** Library might not support XML-like markup or progressive prop rendering.

#### Direction 2: Custom Parser + React

**Decision Path:**
1. Implement state machine parser (TEXT → TAG_OPEN → TAG_NAME → ATTR → TAG_CLOSE)
2. Choose state management (useReducer vs external library)
3. Handle render optimization (avoid jitter)

**Trade-offs:**

| Aspect | Rating | Notes |
|--------|--------|-------|
| Implementation Speed | Slower | Build from scratch |
| Control | High | Everything is yours |
| Streaming Quality | You build it | Edge cases are your problem |
| Custom Markup Support | Perfect | You define the format |
| Progressive Rendering | Perfect | Built to your spec |
| Maintenance | Low (long-term) | No upstream dependencies |

**Key Risk:** Implementation effort and discovering edge cases mid-build.

#### Direction 3: Markdown + react-markdown

**Decision Path:**
1. Can remark/rehype handle XML tags?
2. How to handle streaming? (re-render on every chunk?)
3. Will partial tags break the parser?

**Trade-offs:**

| Aspect | Rating | Notes |
|--------|--------|-------|
| Implementation Speed | Medium | If it works |
| Control | Low | remark/rehype dictate parsing |
| Streaming Quality | Uncertain | Not designed for streaming |
| Custom Markup Support | Unknown | Need to test |
| Progressive Rendering | Unlikely | Re-parse might break this |
| Maintenance | Low | Standard libraries |

**Key Risk:** Streaming + markdown parsing likely incompatible with progressive rendering goals.

#### Comparison Summary

| Criterion | Dir 1 (Library) | Dir 2 (Custom) | Dir 3 (Markdown) |
|-----------|-----------------|----------------|------------------|
| Speed to working demo | Fast | Slow | Medium |
| Meets all First Principles | Maybe | Yes | Unlikely |
| Risk of dead end | Medium | Low | High |
| Code you own | Little | All | Little |
| Production-path clarity | Depends | Clear | Unclear |

#### Recommended Implementation Order

1. **Direction 2 (Custom Parser)** - Guaranteed to work, deep understanding
2. **Direction 1 (Extend Library)** - Compare with working baseline
3. **Direction 3 (Markdown+)** - Document why it fails (or surprises us)

---

## Session Summary

### Key Outcomes

**1. Established 14 Bedrock Truths** defining the PoC's constraints and capabilities:
- Sequential token arrival, progressive rendering possible
- Self-contained component islands, immortal in chat log
- Flat components, finite tag set, best-effort rendering
- Frontend-only scope with mocked stream

**2. Identified 3 Architectural Directions** with clear trade-offs:
- Direction 1: Extend library (fast but constrained)
- Direction 2: Custom parser (full control, more work)
- Direction 3: Markdown-based (high risk of incompatibility)

**3. Designed Meta-Architecture** for comparison:
- Single PoC with menu to switch between implementations
- Shared: stream mock, component UI, test presets
- Per-implementation: parser, state management, stream consumption

**4. Clear Recommendation:** Start with Direction 2 (Custom Parser) as the guaranteed path, then build others for comparison.

### Next Steps

1. **Research Phase:** Investigate libraries (llm-ui, FlowToken, etc.) to validate Direction 1 viability
2. **Implementation:** Build Direction 2 first as baseline
3. **Comparison:** Add Direction 1 and 3, document findings
4. **Decision:** Choose direction for production based on PoC learnings

---

**Session Complete.**
