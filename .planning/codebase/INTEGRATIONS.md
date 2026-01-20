# External Integrations

**Analysis Date:** 2026-01-20

## APIs & External Services

**None (Demo/PoC Application)**

The application does not integrate with external APIs. It uses mock streaming responses for demonstration purposes.

**Vercel AI SDK:**
- Service: Vercel AI SDK (internal protocol)
- What it's used for: Streaming chat responses via Server-Sent Events (SSE)
  - SDK/Client: `ai` 6.0.41, `@ai-sdk/react` 3.0.43
  - Protocol: AI SDK data stream format (prefix: `0:` for text, `e:` for finish event, `d:` for done)
  - Implementation: Mock streaming only (no real LLM connection)

## Data Storage

**Databases:**
- None - Fully client-side application with in-memory message state
- No persistent storage, no database connection
- Messages stored in React state only (lost on page refresh)

**File Storage:**
- Local filesystem only - Static assets in `public/` directory
- No external file storage (S3, etc.)

**Caching:**
- Browser caching only (HTTP cache headers)
- No server-side cache
- No Redis or external caching

## Authentication & Identity

**Auth Provider:**
- None - No authentication system
- Application is public and unauthenticated
- No user login or session management

**Implementation Approach:**
- N/A - Not applicable for this demo application

## Monitoring & Observability

**Error Tracking:**
- None configured
- Browser console logging only via `console.error()`
- Examples: Error logging in page components (`frontend/app/flowtoken/page.tsx`, `frontend/app/llm-ui/page.tsx`, `frontend/app/streamdown/page.tsx`)

**Logs:**
- Browser console logs (console.error)
- No log aggregation service
- No server-side logging infrastructure

## CI/CD & Deployment

**Hosting:**
- Vercel (inferred from Next.js default and `.npmrc` legacy-peer-deps flag for Vercel compatibility)
- Deployment: `npm build && npm start`
- Default Next.js app can also run on any Node.js hosting

**CI Pipeline:**
- None detected (no GitHub Actions, no CircleCI config)
- Manual deployment likely

## Environment Configuration

**Required env vars:**
- None - Application requires no environment variables
- No API keys, database URLs, or secrets needed
- Development and production configurations are identical

**Secrets location:**
- N/A - No secrets in use

## Webhooks & Callbacks

**Incoming:**
- None - No webhook endpoints
- Application only makes outbound HTTP requests (chat endpoint)

**Outgoing:**
- None - No external webhooks called
- All communication is request-response over standard HTTP/SSE

## Streaming Protocol Details

**Chat API Endpoint:**
- Route: `POST /api/chat` (defined in `frontend/app/api/chat/route.ts`)
- Query parameters:
  - `format`: Accepts `'flowtoken'`, `'llm-ui'`, `'streamdown'` (default: `'flowtoken'`)
- Request body:
  ```json
  {
    "messages": [
      {
        "role": "user" | "assistant" | "system",
        "content": "string"  // or "parts": [{ "type": "text", "text": "..." }]
      }
    ]
  }
  ```
- Response: SSE stream using AI SDK UIMessageStream protocol
- No authentication required
- Response format adapts based on format parameter:
  - `flowtoken` / `streamdown`: XML markup (e.g., `<contactcard ...></contactcard>`, `<calendarevent ...></calendarevent>`)
  - `llm-ui`: JSON delimiters (e.g., `【CONTACT:{"name":"..."}】`)

## Content Rendering Systems

**FlowToken:**
- Format: XML elements embedded in text (e.g., `<contactcard ...></contactcard>`)
- Components: Contact cards, calendar events
- Streaming: Full text stream then parse XML

**LLM-UI:**
- Format: JSON-delimited blocks (e.g., `【CONTACT:{}】`)
- Components: Parsed JSON for structured rendering
- Streaming: Token-by-token with streaming state tracking

**Streamdown:**
- Format: XML elements + Markdown
- Components: Contact cards, calendar events, markdown text
- Streaming: Token-by-token streaming compatible

---

*Integration audit: 2026-01-20*
