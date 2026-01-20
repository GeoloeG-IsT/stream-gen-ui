# Source Tree Analysis

## Project Structure Overview

```
stream-gen-ui/
├── app/                              # Next.js App Router (Pages & API)
│   ├── api/
│   │   └── chat/
│   │       ├── route.ts              # POST /api/chat - Mock streaming endpoint
│   │       └── route.test.ts         # API route tests
│   ├── flowtoken/
│   │   └── page.tsx                  # FlowToken implementation page
│   ├── llm-ui/
│   │   └── page.tsx                  # llm-ui implementation page
│   ├── streamdown/
│   │   └── page.tsx                  # Streamdown implementation page
│   ├── layout.tsx                    # Root layout with ViewRawProvider
│   ├── page.tsx                      # Redirects to /flowtoken
│   ├── globals.css                   # Global styles (Tailwind + animations)
│   └── favicon.ico                   # App favicon
│
├── components/                       # React Components
│   ├── shared/                       # Reusable UI components (9 components)
│   │   ├── CalendarEvent.tsx         # Calendar event display card
│   │   ├── CalendarEvent.test.tsx
│   │   ├── ChatInput.tsx             # Message input with preset selector
│   │   ├── ChatInput.test.tsx
│   │   ├── ContactCard.tsx           # Contact information display card
│   │   ├── ContactCard.test.tsx
│   │   ├── Header.tsx                # Navigation tabs + View Raw toggle
│   │   ├── Header.test.tsx
│   │   ├── MessageBubble.tsx         # Chat message container
│   │   ├── MessageBubble.test.tsx
│   │   ├── MessageList.tsx           # Message list container
│   │   ├── MessageList.test.tsx
│   │   ├── PresetSelector.tsx        # Content preset quick buttons
│   │   ├── PresetSelector.test.tsx
│   │   ├── RawOutputView.tsx         # Debug raw markup display
│   │   ├── RawOutputView.test.tsx
│   │   ├── TypingIndicator.tsx       # Animated typing dots
│   │   └── TypingIndicator.test.tsx
│   │
│   ├── flowtoken/                    # FlowToken-specific
│   │   └── FlowTokenRenderer.tsx     # AnimatedMarkdown wrapper
│   │
│   ├── llm-ui/                       # llm-ui-specific
│   │   └── LLMUIRenderer.tsx         # useLLMOutput with block matchers
│   │
│   └── streamdown/                   # Streamdown-specific
│       └── StreamdownRenderer.tsx    # Custom XML parser + Streamdown
│
├── contexts/                         # React Context Providers
│   └── ViewRawContext.tsx            # Global state for View Raw toggle
│
├── lib/                              # Utilities & Test Data
│   ├── mock-stream.ts                # Stream simulation utilities
│   ├── mock-stream.test.ts           # Mock stream tests
│   ├── test-content.ts               # Content presets per format
│   ├── test-content.test.ts          # Content detection tests
│   └── utils.ts                      # cn() className utility
│
├── types/                            # TypeScript Type Definitions
│   └── index.ts                      # Shared interfaces & type guards
│
├── public/                           # Static Assets
│   └── (favicon, etc.)
│
├── docs/                             # Generated Documentation
│   └── screenshot.png                # Demo screenshot
│
├── _bmad/                            # BMAD Workflow Configuration (excluded)
├── _bmad-output/                     # BMAD Output Artifacts (excluded)
├── node_modules/                     # Dependencies (excluded)
├── .next/                            # Next.js Build Output (excluded)
│
├── package.json                      # Dependencies & scripts
├── package-lock.json                 # Lockfile
├── tsconfig.json                     # TypeScript configuration
├── next.config.ts                    # Next.js configuration
├── vitest.config.ts                  # Vitest test configuration
├── vitest.setup.ts                   # Test setup
├── eslint.config.mjs                 # ESLint configuration
├── postcss.config.mjs                # PostCSS configuration
├── .gitignore                        # Git ignore patterns
├── .npmrc                            # npm configuration
├── LICENSE                           # MIT License
└── README.md                         # Comprehensive project documentation
```

## Critical Directories

### `/app` - Next.js App Router
The application uses Next.js 16 App Router architecture with file-based routing.

| Path | Purpose |
|------|---------|
| `app/api/chat/route.ts` | Single API endpoint for mock streaming responses |
| `app/flowtoken/page.tsx` | FlowToken implementation demonstration |
| `app/llm-ui/page.tsx` | llm-ui implementation demonstration |
| `app/streamdown/page.tsx` | Streamdown implementation demonstration |
| `app/layout.tsx` | Root layout wrapping all pages with ViewRawProvider |
| `app/page.tsx` | Index route - redirects to /flowtoken |

### `/components/shared` - Reusable UI Components
Shared component library used by all three implementation strategies.

| Component | Purpose | Props Interface |
|-----------|---------|-----------------|
| `ContactCard` | Display contact information with avatar, email, phone, address | `ContactCardProps` |
| `CalendarEvent` | Display calendar event with title, date, time, location | `CalendarEventProps` |
| `Header` | Navigation tabs between implementations + View Raw toggle | `HeaderProps` (none) |
| `ChatInput` | Message input field with send button and preset selector | `ChatInputProps` |
| `MessageBubble` | Message container with user/assistant styling | `MessageBubbleProps` |
| `MessageList` | Container for rendering message history | `MessageListProps` |
| `PresetSelector` | Quick action buttons for content presets | `PresetSelectorProps` |
| `RawOutputView` | Debug panel showing raw unparsed markup | `RawOutputViewProps` |
| `TypingIndicator` | Animated typing indicator dots | `TypingIndicatorProps` |

### `/components/{implementation}` - Implementation-Specific Renderers
Each streaming approach has its own renderer component.

| Renderer | Library | Parsing Strategy |
|----------|---------|------------------|
| `FlowTokenRenderer` | flowtoken | XML tags via AnimatedMarkdown `customComponents` |
| `LLMUIRenderer` | @llm-ui/react | Delimiter blocks via `useLLMOutput` with block matchers |
| `StreamdownRenderer` | streamdown | Custom regex XML parser + Streamdown for markdown |

### `/lib` - Utilities and Mock Data
Core utilities and test content generation.

| File | Purpose |
|------|---------|
| `mock-stream.ts` | `createMockStream()` - Simulates token-by-token streaming |
| `test-content.ts` | `getTestContent()` - Returns format-specific content presets |
| `utils.ts` | `cn()` - Tailwind CSS class merging utility |

### `/contexts` - React Context
Global state management using React Context API.

| Context | Purpose |
|---------|---------|
| `ViewRawContext` | Provides `viewRaw` state and `setViewRaw` function for debug toggle |

### `/types` - Type Definitions
Centralized TypeScript interfaces.

| Type | Purpose |
|------|---------|
| `MessageFormat` | Union type: `'flowtoken' \| 'llm-ui' \| 'streamdown'` |
| `ContactCardProps` | Props for ContactCard component |
| `CalendarEventProps` | Props for CalendarEvent component |
| `ChatMessage` | Message structure for API requests |
| `MockStreamOptions` | Configuration for mock stream delays |
| Various `*Props` | Props interfaces for all shared components |

## Entry Points

| Entry Point | Path | Purpose |
|-------------|------|---------|
| Application | `app/layout.tsx` | Root layout, wraps app with ViewRawProvider |
| Default Route | `app/page.tsx` | Redirects to `/flowtoken` |
| API Endpoint | `app/api/chat/route.ts` | `POST /api/chat?format=X` |

## Test Structure

Tests are co-located with their source files using `*.test.ts` / `*.test.tsx` naming:

- **Unit Tests**: `components/shared/*.test.tsx` (9 test files)
- **Integration Tests**: `lib/*.test.ts` (2 test files)
- **API Tests**: `app/api/chat/route.test.ts`

Test framework: Vitest with jsdom environment and React Testing Library.
