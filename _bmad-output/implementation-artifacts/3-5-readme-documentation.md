# Story 3.5: README Documentation

Status: ready-for-dev

## Story

As an **evaluator**,
I want **comprehensive documentation in the README**,
so that **I can quickly set up the project and understand the architectural decisions**.

## Acceptance Criteria

1. **Given** I clone the repository **When** I read the README **Then** I see clear setup instructions (`npm install && npm run dev`) **And** setup completes in < 5 minutes (NFR5)

2. **Given** I want to understand the architecture **When** I review the README **Then** I see a comparison matrix of the 3 implementations **And** each approach lists: complexity, bundle size impact, streaming UX quality, custom component support

3. **Given** I want a recommendation **When** I read the README conclusion **Then** I see clear guidance on which approach suits production use cases **And** trade-offs are documented for informed decision-making

## Tasks / Subtasks

- [ ] Task 1: Create basic README structure with project overview (AC: #1)
  - [ ] Add project title and one-sentence description
  - [ ] Add "What is this?" section explaining the PoC purpose
  - [ ] Add list of key features (streaming components, 3 implementation approaches, debug toggle)
  - [ ] Include screenshot placeholder or live demo link area

- [ ] Task 2: Write Quick Start section (AC: #1)
  - [ ] Add Prerequisites subsection (Node.js 20+, npm)
  - [ ] Add Installation steps (`git clone`, `npm install`, `npm run dev`)
  - [ ] Document available routes (`/flowtoken`, `/llm-ui`, `/streamdown`)
  - [ ] Explain "View Raw" toggle functionality
  - [ ] Add troubleshooting tips for common issues

- [ ] Task 3: Create implementation comparison matrix (AC: #2)
  - [ ] Create markdown table comparing FlowToken, llm-ui, Streamdown
  - [ ] Document complexity rating for each approach (Low/Medium/High)
  - [ ] Analyze and document bundle size impact (actual package sizes)
  - [ ] Rate streaming UX quality (smoothness, progressive rendering)
  - [ ] Document custom component support approach for each
  - [ ] Include code examples showing how each parser handles `<ContactCard>`

- [ ] Task 4: Write detailed architecture section (AC: #2)
  - [ ] Document overall architecture (Vercel AI SDK + route-specific parsers)
  - [ ] Explain shared components pattern (`components/shared/`)
  - [ ] Document mock stream provider design
  - [ ] Add data flow diagram (text-based Mermaid or ASCII)
  - [ ] List key files and their purposes

- [ ] Task 5: Create recommendation and trade-offs section (AC: #3)
  - [ ] Provide clear recommendation based on implementation experience
  - [ ] Document when to use FlowToken (simplest, XML-based)
  - [ ] Document when to use llm-ui (delimiter-based, frame throttling)
  - [ ] Document when to use Streamdown (markdown-native, most flexible)
  - [ ] List trade-offs for each approach (DX, performance, flexibility)
  - [ ] Include decision flowchart for choosing approach

- [ ] Task 6: Add supplementary sections
  - [ ] Add Tech Stack section with version numbers
  - [ ] Add Project Structure overview
  - [ ] Add Contributing guidelines (keep minimal for PoC)
  - [ ] Add License section
  - [ ] Add acknowledgments/credits

- [ ] Task 7: Final validation and polish
  - [ ] Verify all links and code examples work
  - [ ] Check markdown rendering in GitHub preview
  - [ ] Ensure < 5 minute setup is achievable (time yourself)
  - [ ] Run `npm run build` and `npm run lint` to ensure no issues
  - [ ] Get final file under reasonable length (target: 300-500 lines)

## Dev Notes

### Story Context from Epics

From Story 3.5 in epics.md - this is the final story in Epic 3: Evaluation Tools & Production Polish. The README is the primary deliverable for evaluators who will clone the repo.

**Key Value Proposition:** The README is how evaluators form their first impression. It must clearly communicate:
1. How to get running immediately (< 5 minutes)
2. What architectural approaches are being compared
3. Which approach is recommended and why

### Current State Analysis

**Existing README:** Currently just `# stream-gen-ui` - essentially empty.

**Package Versions for Comparison Matrix:**
| Package | Version | Purpose |
|---------|---------|---------|
| flowtoken | 1.0.40 | XML-based component streaming |
| @llm-ui/react | 0.13.3 | Delimiter-based with frame throttling |
| streamdown | 2.1.0 | Markdown-native streaming |
| ai (Vercel AI SDK) | 6.0.41 | Core streaming backbone |
| react | 19.2.3 | UI framework |
| next | 16.1.4 | App Router framework |

### Technical Requirements

**README Content Requirements (from AC):**

1. **Setup Instructions:**
   - Clear `npm install && npm run dev` command
   - Prerequisites (Node.js, npm)
   - < 5 minute setup target (NFR5)

2. **Comparison Matrix Must Include:**
   - Complexity (implementation difficulty)
   - Bundle size impact
   - Streaming UX quality
   - Custom component support

3. **Recommendation Section:**
   - Clear guidance for production use
   - Trade-offs documented
   - When to use each approach

### Architecture Overview for README

**From Architecture Document:**

```
User Input → ChatInput → useChat → POST /api/chat?format=X
                                        ↓
                              Mock Stream Provider
                                        ↓
                              SSE tokens to client
                                        ↓
                              useChat.messages update
                                        ↓
                              {Impl}Renderer parses
                                        ↓
                   ┌──────────────┴──────────────┐
                   ↓                             ↓
             Markdown text              Custom components
```

**Project Structure:**
```
stream-gen-ui/
├── app/
│   ├── api/chat/route.ts      # Mock stream endpoint
│   ├── flowtoken/page.tsx     # FlowToken implementation
│   ├── llm-ui/page.tsx        # llm-ui implementation
│   └── streamdown/page.tsx    # Streamdown implementation
├── components/
│   ├── shared/                # Reusable components
│   │   ├── Header.tsx
│   │   ├── ChatInput.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── ContactCard.tsx
│   │   ├── CalendarEvent.tsx
│   │   └── RawOutputView.tsx
│   ├── flowtoken/
│   ├── llm-ui/
│   └── streamdown/
├── lib/
│   ├── utils.ts
│   ├── mock-stream.ts
│   └── test-content.ts
└── contexts/
    └── ViewRawContext.tsx
```

### Implementation Comparison Analysis

**FlowToken:**
- **Markup Format:** XML tags (`<ContactCard name="..." />`)
- **Complexity:** Low - simplest setup, uses `AnimatedMarkdown` component
- **Streaming UX:** Good - built-in animations
- **Custom Components:** Via `customComponents` prop mapping
- **Best For:** Quick prototypes, XML-comfortable teams

**llm-ui:**
- **Markup Format:** Delimiters with JSON (`【CONTACT:{...}】`)
- **Complexity:** Medium - requires block parsing configuration
- **Streaming UX:** Excellent - frame-rate throttling smooths output
- **Custom Components:** Via block type matchers
- **Best For:** Production apps needing smooth streaming UX

**Streamdown:**
- **Markup Format:** Markdown + XML tags (react-markdown drop-in)
- **Complexity:** Medium-High - requires custom XML parser layer
- **Streaming UX:** Good - optimized for streaming markdown
- **Custom Components:** Via custom XML parser integration
- **Best For:** Teams already using react-markdown, needing custom components

### File Structure Requirements

**File to Modify:**
- `README.md` - Complete rewrite from empty state

**File Naming:** README uses standard uppercase convention.

### Testing Requirements

**No automated tests needed** for README - this is documentation only.

**Manual Verification:**
1. Clone fresh repo, follow setup instructions, verify < 5 minutes
2. Check all code examples are accurate
3. Verify comparison matrix data is correct
4. Ensure markdown renders correctly on GitHub

### Previous Story Learnings

From Story 3.1 (View Raw Debug Toggle):
- Keep documentation accurate to current implementation
- Include specific version numbers
- Reference actual file paths
- Test instructions work on clean environment

### Git Intelligence

Recent commit patterns show comprehensive feature implementations with good test coverage. The README should reflect the mature state of the codebase.

### Anti-Patterns to Avoid

- **DO NOT** include outdated or incorrect commands
- **DO NOT** promise features that don't exist
- **DO NOT** use placeholder text ("TODO", "TBD")
- **DO NOT** make comparison matrix subjective without data
- **DO NOT** exceed 500 lines (keep focused)
- **DO NOT** include internal/BMAD workflow references

### Verification Checklist

After implementation:
- [ ] Setup instructions work from clean clone
- [ ] Setup completes in < 5 minutes
- [ ] Comparison matrix has all required columns
- [ ] Bundle sizes are accurate
- [ ] Code examples compile/work
- [ ] Recommendation section provides clear guidance
- [ ] Trade-offs are documented
- [ ] Markdown renders correctly on GitHub
- [ ] No broken links
- [ ] README is between 300-500 lines

### References

- [Source: _bmad-output/planning-artifacts/epics.md#Story 3.5: README Documentation]
- [Source: _bmad-output/planning-artifacts/architecture.md#Project Structure & Boundaries]
- [Source: _bmad-output/planning-artifacts/architecture.md#Core Architectural Decisions]
- [Source: _bmad-output/project-context.md#Technology Stack]
- [Source: _bmad-output/planning-artifacts/ux-design-specification.md#Executive Summary]

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

