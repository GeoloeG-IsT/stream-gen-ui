---
stepsCompleted: [1, 2, 3, 4]
status: complete
completedAt: '2026-01-19'
inputDocuments:
  - _bmad-output/planning-artifacts/product-brief-stream-gen-ui-2026-01-19.md
  - _bmad-output/planning-artifacts/architecture.md
  - _bmad-output/planning-artifacts/ux-design-specification.md
  - _bmad-output/planning-artifacts/research/technical-streaming-ui-patterns-research-2026-01-19.md
---

# stream-gen-ui - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for stream-gen-ui, decomposing the requirements from the Product Brief, Architecture, and UX Design specification into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Stream LLM output token-by-token with progressive text rendering
FR2: Detect custom markup tags in stream and render as React components
FR3: Support two custom component types (ContactCard, CalendarEvent)
FR4: Implement 3 different parsing approaches on separate routes (/flowtoken, /llm-ui, /streamdown)
FR5: Provide header navigation to switch between implementations
FR6: Use mock stream provider with configurable delays (no real LLM/API integration)
FR7: Shared chat UI shell with message list, input field, auto-scroll, and streaming indicator

### NonFunctional Requirements

NFR1: Time-to-first-token < 500ms
NFR2: Smooth streaming UX (no visible jank or flicker during token rendering)
NFR3: Progressive component rendering (skeleton → populated → interactive)
NFR4: Memory stability over conversation length (no degradation)
NFR5: Local development setup in < 5 minutes (npm install && npm run dev)

### Additional Requirements

**From Architecture:**
- Starter template: Minimal create-next-app with TypeScript, Tailwind CSS, ESLint, App Router, Turbopack
- React 19.1.1+ required for Streamdown implementation
- Vercel AI SDK (useChat hook) as core streaming backbone for all implementations
- Next.js App Router for route-based implementation separation
- TypeScript strict mode enabled, no `any` usage
- Component structure: shared components + implementation-specific renderers
- API endpoint pattern: `/api/chat?format={flowtoken|llm-ui|streamdown}`
- File naming: PascalCase for components, kebab-case for utilities
- Import organization: React → Third-party → Internal → Types
- cn() utility function for Tailwind class management
- Error handling: inline error display + graceful fallback for parse errors
- Co-located test files with source files

**From UX Design:**
- Design Direction A: Compact Header (56px fixed, navy background #1E3A5F)
- Neuraflow brand colors: Primary Blue #3B82F6, Header Navy #1E3A5F, Accent Green #10B981
- Typography: Inter (sans-serif), JetBrains Mono (monospace for raw output)
- Spacing: 4px base scale, 12px border-radius on all containers
- Design system: Tailwind CSS 4.x + shadcn/ui components
- User message styling: Blue background, right-aligned
- Assistant message styling: White/light gray background, left-aligned
- View Raw toggle in header for debug mode (shows streamed markup)
- Typing indicator: Three dots with staggered bounce animation
- Component skeleton: Gray placeholder + shimmer animation, <100ms from tag detection
- Progressive prop population: 150ms ease per field fade-in
- Component completion signal: Shadow appears, border solidifies
- Auto-scroll: Follow new content, pause when user scrolls up
- Accessibility: WCAG 2.1 Level AA, visible focus rings, aria-live regions
- Actionable links: tel: for phone, mailto: for email (blue color with hover underline)
- Responsive: Desktop-first (1024px+), mobile-functional

**From Research (Implementation-Specific):**
- FlowToken: XML tag mapping with animations, `customComponents` prop
- llm-ui: Delimiter-based blocks (【】syntax), frame-rate throttling, `useLLMOutput` hook
- Streamdown: Drop-in react-markdown replacement, custom XML parser layer

### FR Coverage Map

| Requirement | Epic | Description |
|-------------|------|-------------|
| FR1 | Epic 1 | Stream LLM output token-by-token with progressive text rendering |
| FR2 | Epic 1 | Detect custom markup tags in stream and render as React components |
| FR3 | Epic 1 | Support two custom component types (ContactCard, CalendarEvent) |
| FR4 | Epic 2 | Implement 3 different parsing approaches on separate routes |
| FR5 | Epic 2 | Provide header navigation to switch between implementations |
| FR6 | Epic 1 | Use mock stream provider with configurable delays |
| FR7 | Epic 1 | Shared chat UI shell (message list, input, auto-scroll, streaming indicator) |

**All 7 FRs mapped. NFRs addressed in Epic 3.**

## Epic List

### Epic 1: Working Streaming Chat Demo

**Goal:** Evaluators can send a message and watch streaming text with custom components (ContactCard, CalendarEvent) render inline - proving the core concept works.

**What this delivers:**
- Project foundation (Next.js, Tailwind, TypeScript)
- Shared custom components with progressive rendering
- Mock stream provider with configurable delays
- One complete implementation (FlowToken - lowest complexity)
- Basic chat UI shell with input, message list, streaming indicator
- Header with navigation structure

**FRs covered:** FR1, FR2, FR3, FR6, FR7

---

### Epic 2: Three-Way Implementation Comparison

**Goal:** Evaluators can switch between all 3 implementations (FlowToken, llm-ui, Streamdown) to compare architectural approaches side-by-side using the same test content.

**What this delivers:**
- llm-ui route with delimiter-based blocks and frame-rate throttling
- Streamdown route with custom XML parser
- Enhanced header navigation with clear active state indicators
- Consistent UX across all implementations
- Same test content presets for fair comparison

**FRs covered:** FR4, FR5

---

### Epic 3: Evaluation Tools & Production Polish

**Goal:** Evaluators have production-quality experience with debugging tools and clear architectural documentation to make informed recommendations.

**What this delivers:**
- "View Raw" toggle showing actual streamed markup
- Performance optimizations (memory stability, smooth streaming)
- Accessibility compliance (focus states, ARIA labels)
- README with setup instructions, comparison matrix, and recommendation
- All NFR targets validated

**NFRs addressed:** NFR1, NFR2, NFR3, NFR4, NFR5

---

## Epic 1: Working Streaming Chat Demo

**Goal:** Evaluators can send a message and watch streaming text with custom components (ContactCard, CalendarEvent) render inline - proving the core concept works.

### Story 1.1: Project Foundation Setup

**As a** developer,
**I want** a properly configured Next.js project with all required dependencies,
**So that** I have a working foundation to build the streaming chat implementations.

**Acceptance Criteria:**

**Given** a fresh development environment
**When** I run the initialization command and install dependencies
**Then** the project is created with Next.js 16+, TypeScript, Tailwind CSS 4.x, ESLint, and App Router
**And** Vercel AI SDK, FlowToken, llm-ui, Streamdown, and lucide-react are installed
**And** `npm run dev` starts the development server on localhost:3000

---

### Story 1.2: Shared Custom Components

**As an** evaluator,
**I want** polished ContactCard and CalendarEvent components,
**So that** I can see how custom UI renders within the chat stream.

**Acceptance Criteria:**

**Given** the component library is implemented
**When** ContactCard receives name, email, and phone props
**Then** it displays a styled card with the contact information
**And** phone number is a clickable tel: link
**And** email is a clickable mailto: link
**And** the card follows Neuraflow brand styling (12px radius, blue links, shadow)

**Given** the CalendarEvent component receives title, date, time, and location props
**When** rendered
**Then** it displays a styled event card with all information
**And** the card follows the same visual design system

---

### Story 1.3: Mock Stream Provider

**As a** developer,
**I want** a mock stream provider that simulates LLM output,
**So that** evaluators can demo the app without API keys.

**Acceptance Criteria:**

**Given** the `/api/chat` endpoint exists
**When** a POST request is received with messages
**Then** it returns a streaming SSE response using Vercel AI SDK
**And** tokens are delivered with configurable delay to simulate LLM speed
**And** the response includes test content with embedded custom component markup

**Given** the format query param is set (e.g., `?format=flowtoken`)
**When** the endpoint generates content
**Then** it returns markup appropriate for that implementation's parser

---

### Story 1.4: Chat UI Shell

**As an** evaluator,
**I want** a functional chat interface,
**So that** I can send messages and see streaming responses.

**Acceptance Criteria:**

**Given** the chat page loads
**When** I view the interface
**Then** I see a message list area and an input field with send button
**And** the layout follows the compact header design (56px navy header)

**Given** I type a message and press Enter or click Send
**When** the message is submitted
**Then** my message appears immediately in the message list (user bubble)
**And** a typing indicator shows while waiting for response
**And** the assistant response streams in token-by-token
**And** auto-scroll follows new content

---

### Story 1.5: FlowToken Implementation

**As an** evaluator,
**I want** the FlowToken streaming approach working on `/flowtoken`,
**So that** I can experience the first implementation of custom component rendering.

**Acceptance Criteria:**

**Given** I navigate to `/flowtoken`
**When** I send a message requesting contact info
**Then** the response streams text progressively
**And** when `<ContactCard>` tag is detected, a skeleton component appears immediately
**And** as props stream in, the component populates progressively
**And** when the tag closes, the component becomes fully interactive
**And** text continues streaming after the component

**Given** the message contains `<CalendarEvent>` markup
**When** rendered via FlowToken
**Then** the CalendarEvent component appears inline with the same progressive behavior

---

### Story 1.6: Header Navigation Structure

**As an** evaluator,
**I want** navigation tabs in the header,
**So that** I can switch between implementations.

**Acceptance Criteria:**

**Given** I am on any page
**When** I view the header
**Then** I see tabs for FlowToken, llm-ui, and Streamdown
**And** the current route is visually indicated (active tab state)
**And** clicking a tab navigates to that implementation's page
**And** the header uses Neuraflow navy background (#1E3A5F)

---

## Epic 2: Three-Way Implementation Comparison

**Goal:** Evaluators can switch between all 3 implementations (FlowToken, llm-ui, Streamdown) to compare architectural approaches side-by-side using the same test content.

### Story 2.1: llm-ui Implementation

**As an** evaluator,
**I want** the llm-ui streaming approach working on `/llm-ui`,
**So that** I can compare its delimiter-based block parsing with FlowToken.

**Acceptance Criteria:**

**Given** I navigate to `/llm-ui`
**When** I send a message requesting contact info
**Then** the response streams with frame-rate throttling for smooth UX
**And** when `【CONTACT:{...}】` delimiter is detected, ContactCard renders
**And** the component receives parsed JSON props from within the delimiter
**And** text before and after the delimiter renders as markdown

**Given** the message contains `【CALENDAR:{...}】` delimiter
**When** rendered via llm-ui
**Then** the CalendarEvent component appears with the same behavior

**Given** the LLM output has variable token speed
**When** streaming via llm-ui
**Then** the frame-rate throttling smooths out pauses for consistent UX

---

### Story 2.2: Streamdown Implementation

**As an** evaluator,
**I want** the Streamdown + custom parser approach working on `/streamdown`,
**So that** I can compare the most flexible implementation option.

**Acceptance Criteria:**

**Given** I navigate to `/streamdown`
**When** I send a message requesting contact info
**Then** the response streams using Streamdown's streaming-optimized markdown
**And** when `<ContactCard>` XML tag is detected, the custom parser extracts it
**And** the ContactCard component renders with parsed props
**And** remaining markdown content renders via Streamdown

**Given** incomplete XML tags are streaming
**When** the parser encounters partial markup like `<ContactCard name="`
**Then** it waits gracefully without breaking the UI
**And** displays the component when the tag is complete

---

### Story 2.3: Test Content Presets

**As an** evaluator,
**I want** identical test scenarios across all implementations,
**So that** I can make fair side-by-side comparisons.

**Acceptance Criteria:**

**Given** the test content library exists in `lib/test-content.ts`
**When** a user sends common test messages (e.g., "Show me a contact", "Schedule a meeting")
**Then** each implementation receives semantically equivalent content
**And** FlowToken receives XML-tagged content
**And** llm-ui receives delimiter-based content
**And** Streamdown receives XML-tagged content

**Given** I switch between implementation routes
**When** I send the same test message
**Then** I can visually compare how each parser handles the content

---

### Story 2.4: Enhanced Navigation UX

**As an** evaluator,
**I want** polished tab navigation with clear visual feedback,
**So that** I always know which implementation I'm viewing.

**Acceptance Criteria:**

**Given** I am viewing any implementation route
**When** I look at the header tabs
**Then** the active tab has white background with navy text
**And** inactive tabs have transparent background with semi-transparent white text
**And** tab hover state shows increased opacity

**Given** I click a different tab
**When** navigation occurs
**Then** the transition is instant (no loading state)
**And** a fresh chat session starts on the new route
**And** the URL updates to reflect the current implementation

---

## Epic 3: Evaluation Tools & Production Polish

**Goal:** Evaluators have production-quality experience with debugging tools and clear architectural documentation to make informed recommendations.

### Story 3.1: View Raw Debug Toggle

**As an** evaluator,
**I want** a "View Raw" toggle that shows the actual streamed markup,
**So that** I can understand what each parser is receiving and build confidence in the architecture.

**Acceptance Criteria:**

**Given** the header contains a "View Raw" toggle
**When** I toggle it ON
**Then** each message displays the raw streamed markup alongside (or below) the rendered output
**And** raw output uses monospace font (JetBrains Mono)
**And** raw output has a distinct visual container (dark background or border)

**Given** the toggle is ON and content is streaming
**When** new tokens arrive
**Then** the raw output updates in real-time alongside the rendered view

**Given** I switch between implementation routes
**When** View Raw is toggled ON
**Then** the toggle state persists across route changes

---

### Story 3.2: Progressive Component Rendering Polish

**As an** evaluator,
**I want** smooth skeleton-to-complete transitions on custom components,
**So that** the streaming experience feels polished and production-ready.

**Acceptance Criteria:**

**Given** a custom component tag is detected in the stream
**When** the skeleton appears
**Then** it renders within 100ms of tag detection
**And** the skeleton has a shimmer animation

**Given** props are streaming into the component
**When** each prop value completes
**Then** that field fades in with 150ms ease transition
**And** there is no layout shift or reflow

**Given** the component tag closes
**When** the component transitions to complete state
**Then** a subtle shadow appears (200ms ease)
**And** all interactive elements become clickable

---

### Story 3.3: Accessibility Compliance

**As an** evaluator with accessibility needs,
**I want** the app to meet WCAG 2.1 Level AA standards,
**So that** I can evaluate it regardless of how I interact with the interface.

**Acceptance Criteria:**

**Given** I navigate with keyboard only
**When** I tab through the interface
**Then** all interactive elements have visible focus rings (2px blue)
**And** tab order follows logical sequence (header tabs → toggle → messages → input)

**Given** I use a screen reader
**When** new messages stream in
**Then** the message container has `aria-live="polite"` for dynamic updates
**And** custom components announce their completion state

**Given** the user prefers reduced motion
**When** `prefers-reduced-motion` media query matches
**Then** shimmer animations and typing indicator animations are disabled

---

### Story 3.4: Performance Validation

**As an** evaluator,
**I want** the app to meet all performance NFRs,
**So that** I'm confident the architecture scales to production.

**Acceptance Criteria:**

**Given** I send a message
**When** waiting for the response
**Then** time-to-first-token is < 500ms (NFR1)

**Given** content is streaming
**When** tokens arrive at variable speeds
**Then** there is no visible jank or flicker (NFR2)

**Given** I have a conversation with 20+ messages
**When** I continue chatting
**Then** memory usage remains stable without degradation (NFR4)

**Given** completed messages exist in the conversation
**When** new content streams
**Then** animations on completed messages are disabled to save memory

---

### Story 3.5: README Documentation

**As an** evaluator,
**I want** comprehensive documentation in the README,
**So that** I can quickly set up the project and understand the architectural decisions.

**Acceptance Criteria:**

**Given** I clone the repository
**When** I read the README
**Then** I see clear setup instructions (`npm install && npm run dev`)
**And** setup completes in < 5 minutes (NFR5)

**Given** I want to understand the architecture
**When** I review the README
**Then** I see a comparison matrix of the 3 implementations
**And** each approach lists: complexity, bundle size impact, streaming UX quality, custom component support

**Given** I want a recommendation
**When** I read the README conclusion
**Then** I see clear guidance on which approach suits production use cases
**And** trade-offs are documented for informed decision-making

---

### Story 3.6: Deploy PoC to Vercel

**As an** evaluator,
**I want** the PoC deployed to a public URL,
**So that** I can share it with stakeholders without requiring local setup.

**Acceptance Criteria:**

**Given** the project is deployed to Vercel
**When** I visit the deployed URL
**Then** all three implementation routes are accessible (/flowtoken, /llm-ui, /streamdown)
**And** the mock streaming API works correctly
**And** the View Raw toggle functions as expected

**Given** the README is updated
**When** I read the documentation
**Then** I see the live demo URL prominently displayed
**And** I see instructions for deploying my own instance

**Implementation Notes:**
- Deploy using Vercel free tier (zero-config for Next.js)
- Either `npx vercel` CLI or GitHub repo integration
- Update README with live demo link and deployment section
