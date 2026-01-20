# Phase 2: Backend Foundation + RAG - Context

**Gathered:** 2026-01-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Build a FastAPI backend with RAG retrieval over a fictional city knowledge base. The backend exposes an API endpoint that retrieves relevant documents using hybrid search (keyword + semantic). This phase creates the knowledge base content, vector store, and retrieval API. The ReAct agent that synthesizes responses is Phase 3.

</domain>

<decisions>
## Implementation Decisions

### Fictional City Identity
- **Name:** Berlin (fictional version with invented departments and contacts)
- **Size:** Large metropolitan (500k+ population)
- **Vibe:** Mix of traditional and modern — established institutions with digital presence
- City data is entirely fictional; do not use real Berlin government information

### Knowledge Base Content
- **Contacts:** ~50+ contacts across all departments
- **Events:** ~50+ calendar events (major events, recurring meetings, deadlines, public meetings)
- **Departments:** Full government scope:
  - Public Safety, Utilities, Transportation, Health
  - Planning, Finance, Legal, Parks, Education, Housing
- **Detail level:** Rich — full bios, service descriptions, FAQs, office hours, related links
- All content in markdown format

### Retrieval Behavior
- **Result count:** Top 10 results per query
- **Search balance:** Semantic-heavy (80% semantic, 20% keyword)
- **Chunk strategy:** Use RecursiveMarkdownTextSplitter or Semantic Splitter — research latest from LlamaIndex for best approach
- **Deduplication:** Yes, filter out near-duplicate chunks from same document

### API Response Format
- **Relevance scores:** Include scores with each result
- **Source attribution:** Title + section format (e.g., "Public Safety > Emergency Services")
- **Empty results:** Return fallback message ("no relevant information found")
- **Content format:** Raw chunks — agent in Phase 3 synthesizes the answer

### Claude's Discretion
- Exact department names and organizational structure
- Specific contact personas and backstories
- Event types and scheduling patterns
- Embedding model choice (research will inform)
- Vector store implementation (ChromaDB vs others)

</decisions>

<specifics>
## Specific Ideas

- User mentioned checking "latest from LlamaIndex" for semantic splitting — research should investigate current best practices
- Rich content means each contact should feel like a real person with responsibilities, not just name+phone
- Berlin theme should feel authentic to European city government style

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 02-backend-foundation-rag*
*Context gathered: 2026-01-20*
