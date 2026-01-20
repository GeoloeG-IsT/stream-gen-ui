# stream-gen-ui Documentation Index

> **Live Demo:** [stream-gen-ui.vercel.app](https://stream-gen-ui.vercel.app)

## Project Overview

- **Type:** Monolith (single Next.js application)
- **Primary Language:** TypeScript
- **Framework:** Next.js 16.1.4 (App Router)
- **Architecture:** Component-based with Strategy Pattern for streaming implementations

### Purpose

Proof-of-concept comparing three approaches to rendering custom React components within streaming LLM responses:

| Implementation | Library | Parsing Strategy |
|---------------|---------|------------------|
| **FlowToken** | flowtoken | XML tags via `customComponents` |
| **llm-ui** | @llm-ui/react | Delimiter blocks via `useLLMOutput` |
| **Streamdown** | streamdown | Custom XML parser + Streamdown |

## Quick Reference

| Aspect | Details |
|--------|---------|
| **Tech Stack** | Next.js 16.1.4, React 19.2.3, TypeScript 5.x, Tailwind CSS 4.x |
| **Entry Point** | `app/layout.tsx` |
| **API Endpoint** | `POST /api/chat?format={flowtoken\|llm-ui\|streamdown}` |
| **State Management** | React Context (ViewRawContext) |
| **Testing** | Vitest + React Testing Library |
| **Components** | 9 shared + 3 implementation-specific renderers |

## Generated Documentation

### Core Documents

- [Architecture](./architecture.md) - System design, data flow, technology stack
- [Source Tree Analysis](./source-tree-analysis.md) - Complete directory structure with annotations
- [Component Inventory](./component-inventory.md) - All React components cataloged
- [Development Guide](./development-guide.md) - Setup, testing, coding conventions

### Existing Documentation

- [README.md](../README.md) - Comprehensive project overview with comparison matrix
- [LICENSE](../LICENSE) - MIT License

## Getting Started

### Prerequisites
- Node.js 20+ (LTS recommended)
- npm 10+

### Quick Start
```bash
git clone <repository-url>
cd stream-gen-ui
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - redirects to `/flowtoken`

### Available Routes
| Route | Implementation |
|-------|---------------|
| `/flowtoken` | FlowToken XML-based streaming |
| `/llm-ui` | Delimiter-based block parsing |
| `/streamdown` | Custom XML + Streamdown markdown |

### Content Presets
Type these keywords in the chat to trigger specific responses:
- **contact**, **email**, **phone** → ContactCard
- **meeting**, **schedule**, **calendar** → CalendarEvent
- **everything**, **both** → Both components
- **multiple**, **several** → Multiple components
- **text**, **markdown** → Markdown only

## Key Files Reference

| File | Purpose |
|------|---------|
| `app/api/chat/route.ts` | Mock streaming API endpoint |
| `lib/test-content.ts` | Content presets per format |
| `lib/mock-stream.ts` | Token-by-token streaming simulation |
| `contexts/ViewRawContext.tsx` | Global View Raw toggle state |
| `types/index.ts` | Shared TypeScript interfaces |
| `components/shared/*` | Reusable UI components |
| `components/*/Renderer.tsx` | Implementation-specific parsers |

## Scripts

```bash
npm run dev        # Development server
npm run build      # Production build
npm run start      # Production server
npm run test       # Run tests
npm run test:watch # Watch mode
npm run lint       # ESLint
```

## For AI-Assisted Development

When modifying this project, reference these key patterns:

1. **Adding custom components:** See `components/shared/ContactCard.tsx` for pattern
2. **Extending renderers:** Each renderer in `components/{impl}/` follows error boundary + memo pattern
3. **Adding presets:** Update `lib/test-content.ts` with format-specific content
4. **Type definitions:** All props interfaces live in `types/index.ts`
5. **Testing:** Co-located tests with `*.test.tsx` naming

---

*Documentation generated: 2026-01-20*
*Scan mode: Exhaustive*
