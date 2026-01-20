# Technology Stack

**Analysis Date:** 2026-01-20

## Languages

**Primary:**
- TypeScript 5.x - Application code, type safety for React and Next.js
- JSX/TSX - React component markup and page layouts

**Secondary:**
- JavaScript (ES2017+) - Build configuration and utilities
- CSS - Styling via Tailwind CSS with PostCSS

## Runtime

**Environment:**
- Node.js 18+ (from `@types/node: ^20`)
- Browser: Modern browsers supporting ES2017, React 19, Web Streams API

**Package Manager:**
- npm (version management in `frontend/package-lock.json`)
- Lockfile: Present and committed
- Working directory: frontend/ (self-contained package)

## Frameworks

**Core:**
- Next.js 16.1.4 - Full-stack React framework with App Router
- React 19.2.3 - UI component library
- React DOM 19.2.3 - React web rendering

**AI/Streaming:**
- @ai-sdk/react 3.0.43 - React hooks for AI SDK chat functionality (useChat hook)
- ai 6.0.41 - Vercel AI SDK for streaming utilities (createUIMessageStream, DefaultChatTransport)
- @llm-ui/react 0.13.3 - LLM UI rendering library with streaming support

**Streaming Content Renderers:**
- flowtoken 1.0.40 - XML-based streaming component markup parser
- streamdown 2.1.0 - Markdown-focused streaming content (uses same XML format as FlowToken)

**Styling:**
- Tailwind CSS 4.x - Utility-first CSS framework
- @tailwindcss/postcss 4.x - Tailwind PostCSS plugin
- tailwind-merge 3.4.0 - Tailwind class merging utility
- PostCSS 4.x (via @tailwindcss/postcss) - CSS processing

**UI Components:**
- lucide-react 0.562.0 - Icon library for React

**Utilities:**
- clsx 2.1.1 - Conditional className utility

**Testing:**
- vitest 4.0.17 - Vitest test runner (ESM-native, Vite-based)
- @testing-library/react 16.3.2 - React component testing utilities
- @testing-library/dom 10.4.1 - DOM testing utilities
- @testing-library/jest-dom 6.9.1 - Jest matchers for DOM assertions
- jsdom 27.4.0 - JavaScript implementation of DOM for Node.js testing

**Build/Dev:**
- ESLint 9.x - Linting with Next.js ESLint config
- eslint-config-next 16.1.4 - Next.js ESLint config preset
- @vitejs/plugin-react 5.1.2 - React plugin for Vitest (via Vite)

## Key Dependencies

**Critical:**
- ai 6.0.41 - Core streaming protocol and utilities for SSE-based chat interface
- @ai-sdk/react 3.0.43 - React hooks for chat state management and message transport
- next 16.1.4 - Server/client framework with API routes for /api/chat endpoint

**Infrastructure:**
- flowtoken 1.0.40 - Parses XML component markup in streaming content (contact cards, calendar events)
- @llm-ui/react 0.13.3 - Renders JSON-delimited component data (【CONTACT:{}】 format)
- streamdown 2.1.0 - Markdown/XML streaming renderer
- Tailwind CSS 4.x - CSS generation and styling

## Configuration

**Environment:**
- No .env file required for development (no external API keys/credentials)
- No NEXT_PUBLIC_* variables detected
- No process.env usage detected
- localhost:3000 is default development server
- Uses mock streaming response (no real LLM API calls)

**Build:**
- `frontend/tsconfig.json` - TypeScript configuration with Next.js plugin, path alias `@/*` maps to `./*` (relative to frontend/)
- `frontend/next.config.ts` - Next.js config (minimal, currently empty)
- `frontend/postcss.config.mjs` - PostCSS with Tailwind CSS plugin
- `frontend/vitest.config.ts` - Vitest with jsdom environment, React plugin, path alias matching tsconfig
- `frontend/eslint.config.mjs` - ESLint config using flat config (ESLint 9), Next.js presets for core-web-vitals and TypeScript
- `frontend/.npmrc` - Sets `legacy-peer-deps=true` (for peer dependency compatibility)
- `frontend/package.json` - Frontend dependencies and scripts (self-contained)
- `frontend/node_modules/` - Frontend dependencies installed independently

## Platform Requirements

**Development:**
- Node.js 18+
- npm with peer dependency handling
- TypeScript 5.x compiler
- Modern IDE with TypeScript support

**Production:**
- Node.js 18+ runtime
- Vercel (platform references in package.json scripts suggest Vercel deployment)
- Can run on any Node.js hosting with `npm build && npm start`

---

*Stack analysis: 2026-01-20*
