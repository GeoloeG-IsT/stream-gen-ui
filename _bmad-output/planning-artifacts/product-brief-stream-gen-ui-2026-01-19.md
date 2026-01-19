---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - _bmad-output/analysis/brainstorming-session-2026-01-19.md
  - _bmad-output/planning-artifacts/research/technical-streaming-ui-patterns-research-2026-01-19.md
date: 2026-01-19
author: GeoloeG
---

# Product Brief: stream-gen-ui

## Executive Summary

**stream-gen-ui** is a proof-of-concept demonstrating how AI chatbots can stream rich, interactive UI components inline with natural language responses. Built as a technical evaluation for Neuraflow's product backlog, this PoC compares three architectural approaches to rendering custom components (ContactCard, AppointmentBooker, DocumentChecklist) from streaming LLM output.

The goal is threefold: prove feasibility, identify the optimal production architecture, and establish reusable patterns for enhancing citizen-facing municipal chatbots with actionable UI elements.

---

## Core Vision

### Problem Statement

Citizens interacting with municipal AI chatbots receive text-only responses that require manual processing. When asking "How do I register my new address?", users get prose containing office addresses, phone numbers, required documents, and hours - information they must mentally parse, copy elsewhere, or transcribe. This creates friction between AI assistance and citizen action.

### Problem Impact

- **Cognitive load**: Citizens must extract structured data from unstructured text
- **No actionability**: Can't click-to-call, can't add appointments to calendar, can't check off document lists
- **Context switching**: Information delivered by AI must be manually transferred to other tools
- **Accessibility gaps**: Text walls are harder for screen readers to parse than semantic UI components
- **Missed efficiency**: The "last mile" from AI response to citizen action remains manual

### Why Existing Solutions Fall Short

| Approach | Limitation |
|----------|------------|
| **Static rich cards** | Predefined, can't be dynamically generated from LLM reasoning |
| **Tool calls with delayed render** | Requires backend round-trips, breaks conversational streaming flow |
| **react-markdown streaming** | Re-parses entire AST on every token, exponential performance degradation |
| **Post-process after completion** | Loses the progressive, streaming UX that makes AI feel responsive |

No current solution elegantly handles: streaming tokens → detecting custom markup → progressive component rendering → interactive islands in a text stream.

### Proposed Solution

A streaming UI architecture where LLM output flows token-by-token, and when custom markup tags are detected (e.g., `<ContactCard>`), the system:

1. Immediately renders a skeleton component
2. Progressively populates props as they stream in
3. Finalizes to a fully interactive component
4. Continues streaming subsequent text seamlessly

Three implementations compared side-by-side:
- **FlowToken**: XML tag mapping with animations (lowest complexity)
- **llm-ui**: Delimiter-based blocks with frame-rate throttling (smoothest UX)
- **Streamdown + Custom Parser**: Maximum flexibility and control

Shared foundation: Vercel AI SDK (useChat), Next.js App Router, reusable component library.

### Key Differentiators

1. **Comparative Architecture**: Three approaches in one PoC enables data-driven production decisions
2. **Progressive Rendering**: Components materialize as data arrives, not after completion
3. **Component Islands Pattern**: Self-contained, interactive components within flowing text
4. **Municipal-Domain Components**: ContactCard, DocumentChecklist, AppointmentBooker speak directly to Neuraflow's use case
5. **Production-Path Clarity**: Documents trade-offs (complexity, bundle size, streaming UX) for informed scaling decisions

---

## Target Users

### Primary Users

#### PoC Evaluators: Neuraflow Technical Leadership

**Who they are:** CTO and Tech Lead evaluating candidates through technical challenges from their product backlog.

**What they're assessing:**
- **Architecture thinking**: Can this candidate reason about trade-offs, not just implement a solution?
- **Production awareness**: Does the code reflect real-world concerns (performance, maintainability, scalability)?
- **Technical communication**: Is the approach well-documented and the reasoning clear?
- **Completeness**: Does the PoC thoroughly explore the problem space?

**What success looks like for them:**
- Clear comparison of approaches with documented trade-offs
- Clean, readable code that reflects professional standards
- Evidence of understanding streaming challenges (not just "it works")
- A candidate who thinks like someone already on their team

#### End-State Users: Citizens Interacting with Municipal Chatbots

**Who they are:** German residents using neurabot to navigate municipal services - registering addresses, booking appointments, finding office information, understanding bureaucratic processes.

**What they need:**
- **Actionable responses**: Not just information, but interactive elements (click-to-call, add-to-calendar, document checklists)
- **Reduced cognitive load**: Structured UI components vs. parsing text walls
- **Accessibility**: Semantic components that work with screen readers and assistive technology

**What success looks like for them:**
- Ask a question, get an answer they can *act on* immediately
- No copy-pasting between chatbot and other apps
- Confidence they have everything they need (checklist completeness)

### Secondary Users

**Neuraflow Development Team** (future, if hired): Would inherit and extend this architecture. The PoC should demonstrate patterns they can build upon, not a one-off hack.

### User Journey

**PoC Evaluation Journey:**

| Stage | CTO/Tech Lead Experience |
|-------|-------------------------|
| **Discovery** | Receives PoC submission, opens README |
| **First Impression** | Sees 3-approach comparison architecture, clear project structure |
| **Deep Dive** | Reviews code quality, runs each implementation, compares streaming behavior |
| **Assessment** | Evaluates trade-off documentation, checks for edge case handling |
| **Decision** | "This candidate thinks architecturally and executes thoroughly" |

**Citizen Journey (End-State Vision):**

| Stage | Citizen Experience |
|-------|-------------------|
| **Query** | "How do I register my new address?" |
| **Response** | Streaming text with inline `<OfficeCard>`, `<DocumentChecklist>`, `<AppointmentBooker>` |
| **Action** | Clicks to call office, checks off documents, books appointment - all without leaving chat |
| **Completion** | Task done. No context switching. No manual transcription. |

---

## Success Metrics

### PoC Completion Criteria

The PoC is successful when all three streaming UI implementations are functional and comparable:

| Implementation | Success Criteria |
|----------------|------------------|
| **FlowToken** | Renders custom components from XML tags in streaming output |
| **llm-ui** | Renders custom components from delimiter-based blocks in streaming output |
| **Streamdown + Custom Parser** | Renders custom components via custom extraction layer |

**Core Functionality (all implementations):**
- Streaming text renders progressively (not after completion)
- Custom components (ContactCard, CalendarEvent) appear inline with text
- Components are interactive once rendered
- Switching between implementations via navigation

### Technical Success Indicators

| Indicator | Target |
|-----------|--------|
| Time-to-first-token | < 500ms |
| Streaming UX | Smooth, no visible jank |
| Component rendering | Progressive (skeleton → complete) |
| Memory stability | No degradation over conversation length |

### Deliverable Success

| Deliverable | Description |
|-------------|-------------|
| **Working Demo** | All 3 implementations runnable locally |
| **Comparison Matrix** | Side-by-side trade-offs (complexity, bundle size, UX) |
| **README** | Setup instructions, architecture overview, findings summary |
| **Recommendation** | Clear guidance on which approach suits production |

### Business Objectives

**Primary Objective:** Demonstrate technical competence and architectural thinking to Neuraflow's CTO and Tech Lead through thorough exploration of their backlog item.

**Secondary Objective:** Create reusable learnings and potentially a reference implementation for streaming UI patterns with custom components.

---

## MVP Scope

### Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| **3 Implementation Routes** | `/flowtoken`, `/llm-ui`, `/streamdown` - each with distinct parsing approach | Must Have |
| **Shared Chat UI Shell** | Message list, input field, auto-scroll, streaming indicator | Must Have |
| **Mock Stream Provider** | Simulates LLM output with configurable delay, includes custom markup tags | Must Have |
| **ContactCard Component** | Displays name, email, phone with click-to-action affordances | Must Have |
| **CalendarEvent Component** | Displays title, date, time, location with visual formatting | Must Have |
| **Header Navigation** | Switch between implementations to compare side-by-side | Must Have |
| **Test Content Presets** | Same test strings for all implementations (apples-to-apples comparison) | Must Have |
| **README Documentation** | Setup instructions, architecture overview, comparison matrix, recommendation | Must Have |

### Out of Scope for MVP

| Excluded Feature | Rationale |
|------------------|-----------|
| Real LLM/API integration | Mock stream sufficient to prove pattern; avoids API key complexity for evaluators |
| Backend persistence | Ephemeral chat is fine for demonstrating streaming UI |
| User authentication | Not relevant to the core technical challenge |
| More than 2 custom components | Two components prove the pattern; more adds effort without insight |
| Mobile/responsive optimization | Desktop-first demo is sufficient for evaluation |
| Internationalization | English-only; German localization is production concern |
| Accessibility audit | Semantic HTML is good practice, but full a11y audit is post-PoC |
| Performance benchmarking tooling | Visual inspection of smoothness is sufficient for PoC |
| Production deployment | Local development environment only |

### MVP Success Criteria

The PoC is complete when:

1. **All 3 implementations functional** - Each renders streaming text + custom components
2. **Side-by-side comparable** - Same test content, same components, different parsing
3. **Smooth streaming UX** - No visible jank or flicker during token rendering
4. **Components interactive** - ContactCard/CalendarEvent respond to clicks
5. **Documented trade-offs** - README includes comparison matrix and recommendation
6. **Runs locally in < 5 min** - `npm install && npm run dev` gets evaluator to working demo

### Future Vision

If this PoC leads to production integration at Neuraflow:

**Phase 2 - Production Integration:**
- Real LLM backend (Neuraflow's existing infrastructure)
- Municipal-specific components: `<OfficeCard>`, `<DocumentChecklist>`, `<AppointmentBooker>`
- German language support and accessibility compliance
- Integration with neurabot's existing chat framework

**Phase 3 - Advanced Capabilities:**
- Progressive prop streaming (skeleton → partial → complete)
- Component state persistence across conversation
- Analytics on component interaction rates
- A/B testing different component designs

**Long-term Vision:**
- Reusable library for Neuraflow's product suite
- Potential open-source contribution to React streaming UI ecosystem
