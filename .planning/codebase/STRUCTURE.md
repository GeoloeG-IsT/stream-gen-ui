# Codebase Structure

**Analysis Date:** 2026-01-20

## Directory Layout

```
stream-gen-ui/
├── frontend/                   # Self-contained Next.js frontend package
│   ├── app/                    # Next.js App Router pages and API
│   │   ├── api/
│   │   │   └── chat/          # Chat API endpoint (streaming)
│   │   ├── flowtoken/         # FlowToken implementation page
│   │   ├── llm-ui/            # llm-ui implementation page
│   │   ├── streamdown/        # Streamdown implementation page
│   │   ├── page.tsx           # Root redirect to /flowtoken
│   │   ├── layout.tsx         # Root layout with context provider
│   │   └── globals.css        # Global styles
│   ├── components/            # React components organized by feature
│   │   ├── flowtoken/         # FlowToken-specific renderer
│   │   ├── llm-ui/            # llm-ui-specific renderer
│   │   ├── streamdown/        # Streamdown-specific renderer
│   │   └── shared/            # Shared components used across implementations
│   ├── contexts/              # React Context providers
│   │   └── ViewRawContext.tsx # Global state for View Raw toggle
│   ├── lib/                   # Utility functions and helpers
│   │   ├── test-content.ts    # Content generation and preset detection
│   │   ├── mock-stream.ts     # Mock stream configuration
│   │   ├── test-content.test.ts # Content generation tests
│   │   ├── mock-stream.test.ts # Mock stream configuration tests
│   │   └── utils.ts           # Generic utilities (cn, etc)
│   ├── types/                 # Shared TypeScript types
│   │   └── index.ts           # All type definitions
│   ├── public/                # Static assets
│   ├── node_modules/          # Frontend dependencies (self-contained)
│   ├── .next/                 # Build output (generated)
│   ├── package.json           # Frontend dependencies and scripts
│   ├── package-lock.json      # Locked dependency versions
│   ├── tsconfig.json          # TypeScript configuration
│   ├── next.config.ts         # Next.js configuration
│   ├── vitest.config.ts       # Test configuration
│   ├── vitest.setup.ts        # Test setup file
│   └── eslint.config.mjs      # ESLint configuration
├── docs/                      # Documentation files
├── .planning/                 # Planning and intelligence documents
├── .claude/                   # Claude workspace configuration
└── .gitignore                 # Git ignore patterns (applies to entire repo)
```

## Directory Purposes

**frontend/:**
- Purpose: Self-contained Next.js frontend package with own dependencies and configuration
- Working directory: All commands run from this directory (`cd frontend && npm run build`)
- Contains: Complete frontend application with source, tests, config, and node_modules

**frontend/app/:**
- Purpose: Next.js App Router structure containing all route pages and API handlers
- Contains: Page components (TSX), API routes (TS), layout component, root styling
- Key files: `page.tsx` (redirect), `layout.tsx` (root provider), `globals.css` (Tailwind directives)

**frontend/app/api/chat/:**
- Purpose: Server-side streaming API endpoint
- Contains: Route handler for POST requests, stream generation, content selection
- Key files: `route.ts` (handler), `route.test.ts` (tests)

**frontend/app/flowtoken/, frontend/app/llm-ui/, frontend/app/streamdown/:**
- Purpose: User-facing pages for each streaming implementation demo
- Contains: Page component with useChat hook, message state management, scroll handling, renderer component integration
- Pattern: Nearly identical page structure differing only in renderer component used

**frontend/components/:**
- Purpose: Reusable React components organized by scope (feature-specific or shared)
- Contains: Presentational and container components with tests

**frontend/components/shared/:**
- Purpose: Components used across all implementations
- Contains: MessageBubble (message display wrapper), ChatInput (input form), Header (navigation), TypingIndicator, MessageList, RawOutputView, ContactCard, CalendarEvent, PresetSelector
- Key pattern: Each component has TSX file + test file (co-located)

**frontend/components/flowtoken/:**
- Purpose: FlowToken implementation details
- Contains: FlowTokenRenderer component that uses `flowtoken` library's AnimatedMarkdown
- Key file: `FlowTokenRenderer.tsx` with error boundary and custom component registration

**frontend/components/llm-ui/:**
- Purpose: llm-ui implementation details
- Contains: LLMUIRenderer component that uses `@llm-ui/react` for delimiter-based block parsing
- Key file: `LLMUIRenderer.tsx` with BlockMatcher creation and custom component integration

**frontend/components/streamdown/:**
- Purpose: Streamdown implementation details
- Contains: StreamdownRenderer component with custom XML parser for extracting component tags
- Key file: `StreamdownRenderer.tsx` with content segment parsing and component registration

**frontend/contexts/:**
- Purpose: React Context for global state
- Contains: ViewRawContext provider and hook

**frontend/lib/:**
- Purpose: Business logic, utilities, and configuration
- Contains: Content generation, content presets, mock stream settings, utility functions
- Key files:
  - `test-content.ts`: Preset detection, content generation for all formats
  - `mock-stream.ts`: Stream delay constants
  - `utils.ts`: cn() utility wrapper

**frontend/types/:**
- Purpose: Centralized type definitions
- Contains: MessageFormat union type, component prop interfaces, type guards
- Key file: `index.ts` (single file - all types)

**frontend/public/:**
- Purpose: Static assets served directly by Next.js
- Contains: Images, icons, fonts (if any)

## Key File Locations

**Entry Points:**
- `frontend/app/page.tsx`: Root redirect to /flowtoken
- `frontend/app/layout.tsx`: Root layout with ViewRawProvider wrapper
- `frontend/app/flowtoken/page.tsx`: FlowToken demo page entry
- `frontend/app/llm-ui/page.tsx`: llm-ui demo page entry
- `frontend/app/streamdown/page.tsx`: Streamdown demo page entry

**Configuration:**
- `frontend/tsconfig.json`: TypeScript settings with @ path alias
- `frontend/next.config.ts`: Next.js configuration
- `frontend/package.json`: Dependencies and npm scripts
- `frontend/app/globals.css`: Tailwind directives and global styles

**Core Logic:**
- `frontend/app/api/chat/route.ts`: Stream API handler and validation
- `frontend/lib/test-content.ts`: Content templates and preset detection
- `frontend/contexts/ViewRawContext.tsx`: Global state management

**Rendering:**
- `frontend/components/flowtoken/FlowTokenRenderer.tsx`: FlowToken rendering logic
- `frontend/components/llm-ui/LLMUIRenderer.tsx`: llm-ui rendering logic
- `frontend/components/streamdown/StreamdownRenderer.tsx`: Streamdown rendering logic
- `frontend/components/shared/MessageBubble.tsx`: Message display wrapper

**Testing:**
- `frontend/app/api/chat/route.test.ts`: API route tests
- `frontend/lib/test-content.test.ts`: Content generation tests
- `frontend/lib/mock-stream.test.ts`: Mock stream configuration tests
- `frontend/components/**/*.test.tsx`: Component tests co-located with components

## Naming Conventions

**Files:**
- Page routes: Lowercase with hyphens (flowtoken, llm-ui, streamdown)
- Component files: PascalCase (FlowTokenRenderer.tsx, MessageBubble.tsx)
- Test files: Adjacent to source with `.test.ts` or `.test.tsx` suffix
- Utility files: Lowercase with hyphens (test-content.ts, mock-stream.ts, utils.ts)

**Directories:**
- Feature directories: Lowercase with hyphens (components/llm-ui, app/api/chat)
- Grouping directories: Lowercase plural (components/, contexts/, lib/, types/, public/)

**Components:**
- Export function name matches file name (FlowTokenRenderer exported from FlowTokenRenderer.tsx)
- Props interfaces: ComponentNameProps suffix (FlowTokenRendererProps, MessageBubbleProps)
- Constants: UPPER_SNAKE_CASE (NAVIGATION_TABS, PRESET_KEYWORDS, MESSAGE_FORMATS)

**Functions:**
- camelCase for all functions (detectPreset, parseAttributes, getTestContent)
- Handler functions: handleX pattern (handleSubmit, handleScroll, handleInputChange)
- Type guards: isXxx pattern (isValidMessageFormat)
- Conversion functions: toXxx pattern (toContactCardProps, toCalendarEventProps)

**Types & Interfaces:**
- PascalCase for all types and interfaces
- Union types: Use lowercase or descriptive names (MessageFormat, ContentPreset)
- Props interfaces: Attach Props suffix
- Enum-like objects: Prefix with descriptive name (MESSAGE_FORMATS, NAVIGATION_TABS)

## Where to Add New Code

**New Feature (cross-implementation):**
- Primary code: `frontend/lib/` for logic, `frontend/components/shared/` for UI
- Tests: Co-located with `.test.ts` or `.test.tsx` suffix
- Types: Add to `frontend/types/index.ts`

**New Component/Module:**
- Shared component: `frontend/components/shared/ComponentName.tsx`
- Feature-specific component: `frontend/components/[feature]/ComponentName.tsx`
- Always pair with test file immediately

**Utilities:**
- String/class utilities: `frontend/lib/utils.ts`
- Content/data utilities: `frontend/lib/[domain].ts` (e.g., lib/test-content.ts)
- API utilities: Keep in `frontend/app/api/chat/route.ts` or create `frontend/lib/api-utils.ts`

**New Page/Route:**
- Page component: `frontend/app/[route-name]/page.tsx`
- API endpoint: `frontend/app/api/[resource]/route.ts`
- Shared layout: Update `frontend/app/layout.tsx`

**Tests:**
- Unit tests: Co-located in same directory
- Integration tests: Can be grouped in `__tests__/` directory
- Test helpers/fixtures: Create `frontend/lib/test-utils.ts` or similar

## Special Directories

**frontend/.next/:**
- Purpose: Build output from `next build`
- Generated: Yes
- Committed: No (in .gitignore)

**frontend/node_modules/:**
- Purpose: Installed frontend dependencies
- Generated: Yes (by npm install from frontend/)
- Committed: No (in .gitignore)

**.planning/:**
- Purpose: GSD phase planning and codebase intelligence documents
- Generated: Yes (by GSD commands)
- Committed: Yes (planning artifacts)

**.claude/, .gemini/, .opencode/:**
- Purpose: Agent configuration and workspace hooks
- Generated: Yes (manually created)
- Committed: Yes (configuration)

**docs/:**
- Purpose: Markdown documentation files
- Generated: No (manually created)
- Committed: Yes

## Import Path Aliases

**Primary Alias:**
- `@/*`: Maps to `./*` (relative to frontend/ since tsconfig.json is inside frontend/)
- Usage: `import { cn } from '@/lib/utils'`, `import { Header } from '@/components/shared/Header'`
- Defined in: `frontend/tsconfig.json` → `compilerOptions.paths["@/*"]`

## Working Directory

**All frontend commands run from frontend/ directory:**
- Build: `cd frontend && npm run build`
- Dev server: `cd frontend && npm run dev`
- Tests: `cd frontend && npm test`
- Lint: `cd frontend && npm run lint`

The frontend is a self-contained package with its own package.json and node_modules.

## Architecture Decisions in File Placement

**Why test files are co-located:**
- Keep tests close to source for easier maintenance
- Visibility of test coverage at a glance
- Reduced navigation when modifying components

**Why renderers are feature-specific directories:**
- Each renderer depends on different libraries (flowtoken vs @llm-ui/react vs streamdown)
- Isolate format-specific code (XML parsing for Streamdown)
- Shared components (ContactCard, CalendarEvent) kept in shared/

**Why pages are nearly identical:**
- Template/boilerplate reduces time to add new implementations
- Eases side-by-side comparison during development
- Format differences isolated to renderer component only

**Why content presets are centralized in lib/:**
- Content generation is format-agnostic logic
- Can be easily tested independently
- Enables single source of truth for demo content
