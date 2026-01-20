# Phase 2: Backend Foundation + RAG - Research

**Researched:** 2026-01-20
**Domain:** FastAPI + LangChain RAG with Hybrid Retrieval over Markdown Knowledge Base
**Confidence:** HIGH

## Summary

This research covers the implementation of a FastAPI backend with RAG retrieval over a fictional city (Berlin) knowledge base. The phase focuses on creating markdown content (~50+ contacts, ~50+ events), chunking it appropriately, populating a vector store, and exposing a hybrid search API endpoint.

The standard approach for this use case in 2026 is:
- **ChromaDB** for vector storage (ideal for <200k vectors, built-in persistence and metadata)
- **LangChain EnsembleRetriever** combining BM25 (keyword) and semantic search with Reciprocal Rank Fusion
- **MarkdownHeaderTextSplitter** for structure-aware chunking, preserving header hierarchy as metadata
- **all-mpnet-base-v2** embedding model (768 dimensions, proven quality, local execution)
- **langchain-huggingface** for embeddings integration

**Primary recommendation:** Use the LangChain ecosystem for all RAG components. ChromaDB handles vector storage with metadata. The EnsembleRetriever pattern with weights [0.2, 0.8] (BM25, semantic) implements the specified 80/20 semantic-heavy search. Chunk markdown by headers first, then by size if needed.

## Standard Stack

The established libraries/tools for this domain:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| `fastapi` | 0.128.0 | Backend framework | Native async, StreamingResponse, Pydantic integration |
| `uvicorn[standard]` | 0.40.0 | ASGI server | Development server with hot reload |
| `langchain-chroma` | >=0.1.2 | Vector store integration | Official LangChain/ChromaDB bridge |
| `chromadb` | 1.4.1 | Vector database | Built-in persistence, metadata filtering, ideal for PoC scale |
| `langchain-huggingface` | latest | Embeddings | Official HuggingFace integration (replaces deprecated community package) |
| `sentence-transformers` | 5.2.0 | Embedding models | Local execution, no API costs |
| `langchain-text-splitters` | 1.1.0 | Document chunking | MarkdownHeaderTextSplitter for structure-aware splits |
| `langchain-community` | 0.4.1 | BM25 retriever | BM25Retriever for keyword search |
| `rank_bm25` | latest | BM25 algorithm | Required by langchain BM25Retriever |
| `pydantic-settings` | 2.12.0 | Configuration | Type-safe .env loading |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `python-dotenv` | latest | .env file loading | Always - config management |
| `nltk` | latest | Tokenization | BM25 preprocessing with word_tokenize |
| `httpx` | latest | Async HTTP client | Testing endpoints |
| `pytest` / `pytest-asyncio` | latest | Testing | Unit and integration tests |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ChromaDB | FAISS | FAISS faster for >200k vectors but no persistence/metadata |
| all-mpnet-base-v2 | all-MiniLM-L6-v2 | MiniLM 5x faster but ~3% lower accuracy |
| all-mpnet-base-v2 | Qwen3-Embedding | Qwen3 better multilingual, larger model |
| MarkdownHeaderTextSplitter | SemanticChunker | Semantic slower, higher cost, ~3% better recall |

**Installation:**
```bash
pip install fastapi==0.128.0 "uvicorn[standard]==0.40.0"
pip install "langchain-chroma>=0.1.2" chromadb==1.4.1
pip install langchain-huggingface sentence-transformers==5.2.0
pip install langchain-text-splitters==1.1.0 langchain-community==0.4.1
pip install rank_bm25 nltk
pip install pydantic-settings python-dotenv
pip install pytest pytest-asyncio httpx
```

## Architecture Patterns

### Recommended Project Structure
```
backend/
├── main.py                 # FastAPI app entry, /api/chat endpoint
├── config.py               # Pydantic settings (env vars)
├── requirements.txt        # Python dependencies
├── .env.example            # Environment variable template
│
├── rag/
│   ├── __init__.py
│   ├── embeddings.py       # HuggingFaceEmbeddings wrapper
│   ├── vectorstore.py      # ChromaDB initialization
│   ├── retriever.py        # EnsembleRetriever (hybrid search)
│   └── chunking.py         # MarkdownHeaderTextSplitter logic
│
├── knowledge/              # Markdown knowledge base
│   ├── contacts/
│   │   ├── public-safety.md
│   │   ├── utilities.md
│   │   ├── transportation.md
│   │   ├── health.md
│   │   ├── planning.md
│   │   ├── finance.md
│   │   ├── legal.md
│   │   ├── parks.md
│   │   ├── education.md
│   │   └── housing.md
│   ├── events/
│   │   ├── 2026-q1.md
│   │   ├── 2026-q2.md
│   │   └── recurring.md
│   └── general/
│       ├── services.md
│       ├── hours.md
│       └── faq.md
│
├── models/
│   └── schemas.py          # Pydantic models for API
│
└── scripts/
    └── ingest.py           # One-time knowledge base ingestion
```

### Pattern 1: Hybrid Search with EnsembleRetriever

**What:** Combine BM25 keyword search with semantic vector search using weighted Reciprocal Rank Fusion (RRF).

**When to use:** When queries may contain exact terms (names, IDs, codes) OR require semantic understanding.

**Example:**
```python
# Source: LangChain BM25 docs, EnsembleRetriever pattern
from langchain_community.retrievers import BM25Retriever
from langchain.retrievers import EnsembleRetriever
from langchain_chroma import Chroma

# Initialize retrievers
bm25_retriever = BM25Retriever.from_documents(documents)
bm25_retriever.k = 10  # Top 10 for keyword

chroma_retriever = vectorstore.as_retriever(search_kwargs={"k": 10})

# 80% semantic, 20% keyword (as specified in CONTEXT.md)
ensemble_retriever = EnsembleRetriever(
    retrievers=[bm25_retriever, chroma_retriever],
    weights=[0.2, 0.8]  # [BM25, semantic]
)

results = ensemble_retriever.invoke("Who handles emergency permits?")
```

### Pattern 2: Structure-Aware Markdown Chunking

**What:** Split markdown by headers first to preserve document structure, then apply size limits.

**When to use:** Knowledge bases organized with # ## ### headers.

**Example:**
```python
# Source: LangChain MarkdownHeaderTextSplitter docs
from langchain_text_splitters import MarkdownHeaderTextSplitter, RecursiveCharacterTextSplitter

headers_to_split_on = [
    ("#", "Department"),
    ("##", "Section"),
    ("###", "Contact"),
]

markdown_splitter = MarkdownHeaderTextSplitter(
    headers_to_split_on=headers_to_split_on,
    strip_headers=False  # Keep headers in content for context
)

# First pass: split by headers
header_splits = markdown_splitter.split_text(markdown_content)

# Second pass: enforce size limits on large sections
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=50
)

final_chunks = text_splitter.split_documents(header_splits)
```

### Pattern 3: Metadata-Rich Document Storage

**What:** Store source attribution metadata with each chunk for retrieval.

**When to use:** When results need source references (title + section format).

**Example:**
```python
# Source: ChromaDB LangChain integration docs
from langchain_core.documents import Document

# Each chunk carries metadata for attribution
document = Document(
    page_content="Dr. Maria Schmidt is the Director of Emergency Services...",
    metadata={
        "source": "contacts/public-safety.md",
        "title": "Public Safety",
        "section": "Emergency Services",
        "attribution": "Public Safety > Emergency Services",
        "contact_name": "Dr. Maria Schmidt",
        "type": "contact"
    }
)

# Add to vector store
vectorstore.add_documents([document])

# Retrieve with metadata for attribution
results = vectorstore.similarity_search_with_score(query, k=10)
for doc, score in results:
    print(f"[{doc.metadata['attribution']}] (score: {score:.3f})")
```

### Pattern 4: Relevance Scores in Results

**What:** Return similarity scores with results for ranking and filtering.

**When to use:** When API should include confidence/relevance indicators.

**Example:**
```python
# Source: LangChain ChromaDB similarity_search_with_score
# Note: Lower score = more similar (cosine distance)

results = vectorstore.similarity_search_with_score(query, k=10)

response_chunks = []
for doc, distance_score in results:
    # Convert distance to similarity (0-1 where 1 = identical)
    relevance = 1 - distance_score

    response_chunks.append({
        "content": doc.page_content,
        "source": doc.metadata.get("attribution", "Unknown"),
        "score": round(relevance, 3),
        "type": doc.metadata.get("type", "general")
    })
```

### Anti-Patterns to Avoid

- **Splitting markdown by character count only:** Destroys semantic boundaries. Use MarkdownHeaderTextSplitter first.
- **Hardcoding embedding model in multiple places:** Define once in config, import everywhere.
- **Mixing embedding dimensions:** Indexing with 768d model, querying with 384d model will fail silently.
- **Ignoring chunk overlap:** Zero overlap loses context at boundaries. Use 10-20% overlap.
- **Storing embeddings without source metadata:** Makes attribution impossible at retrieval time.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Keyword + semantic search combination | Custom score merging | EnsembleRetriever with RRF | RRF handles score normalization across different scales |
| Markdown structure parsing | Regex-based header extraction | MarkdownHeaderTextSplitter | Handles edge cases, nested headers, code blocks |
| BM25 implementation | TF-IDF from scratch | BM25Retriever + rank_bm25 | Optimized Okapi BM25 with proper IDF calculation |
| Embedding caching | File-based cache | ChromaDB persistence | Handles concurrent access, automatic deduplication |
| Near-duplicate detection | String similarity | SQLRecordManager or content hashing | Tracks file changes, prevents re-embedding |
| Relevance score normalization | Min-max scaling | similarity_search_with_relevance_scores | Handles edge cases, returns [0,1] range |

**Key insight:** LangChain's retriever ecosystem handles the complexity of combining different search methods. The EnsembleRetriever with RRF eliminates the need to normalize scores between BM25 (which produces unbounded scores) and cosine similarity (bounded 0-1).

## Common Pitfalls

### Pitfall 1: Embedding Dimension Mismatch

**What goes wrong:** Vectors indexed with one model cannot be queried with another model of different dimensions.

**Why it happens:** Changing embedding model after initial ingestion, or using different models for indexing vs querying.

**How to avoid:**
- Define embedding model ONCE in config
- Store model name in ChromaDB collection metadata
- Validate on startup that collection uses expected model

**Warning signs:** Zero results or very poor relevance despite good test queries.

### Pitfall 2: Code Blocks Destroyed in Chunking

**What goes wrong:** RecursiveCharacterTextSplitter splits mid-code-block, creating invalid chunks.

**Why it happens:** Character-based splitters don't understand markdown structure.

**How to avoid:**
- Use MarkdownHeaderTextSplitter first (respects code blocks)
- Or use ExperimentalMarkdownSyntaxTextSplitter which preserves code block metadata
- Set chunk_size large enough to contain typical code examples

**Warning signs:** Retrieved chunks have truncated code, missing closing brackets.

### Pitfall 3: BM25 Retriever Not Updating

**What goes wrong:** Adding new documents to ChromaDB doesn't update BM25 index.

**Why it happens:** BM25Retriever builds index at initialization time, doesn't watch for changes.

**How to avoid:**
- Re-initialize BM25Retriever after document ingestion
- Or use a single ingestion script that builds both indexes atomically
- Document the ingestion flow clearly

**Warning signs:** New content not found via keyword search but appears in semantic search.

### Pitfall 4: Score Direction Confusion

**What goes wrong:** Sorting results by "highest score" returns least relevant results.

**Why it happens:** `similarity_search_with_score` returns distance (lower = better), not similarity (higher = better).

**How to avoid:**
- Use `similarity_search_with_relevance_scores` for normalized [0,1] scores
- Or convert: `relevance = 1 - distance` for cosine distance
- Document score semantics in API response schema

**Warning signs:** "Best" results are clearly irrelevant, "worst" are most relevant.

### Pitfall 5: Empty Metadata on Persistence Restore

**What goes wrong:** ChromaDB restored from disk returns documents without metadata.

**Why it happens:** Known issue when collection created with different embedding function signatures.

**How to avoid:**
- Use consistent embedding function instantiation
- Use `langchain-chroma` (not `langchain_community.vectorstores.chroma`)
- Test persistence/restore cycle during development

**Warning signs:** First run has metadata, subsequent runs have empty metadata dicts.

### Pitfall 6: Weights vs RRF Confusion

**What goes wrong:** Setting weights in EnsembleRetriever doesn't produce expected result distribution.

**Why it happens:** LangChain's weighted RRF implementation applies weights to RRF scores, not raw retriever scores. The effect is more subtle than linear interpolation.

**How to avoid:**
- Start with default weights [0.5, 0.5]
- Tune based on evaluation, not intuition
- For 80/20 semantic-heavy, use [0.2, 0.8] but validate with test queries

**Warning signs:** Changing weights has minimal effect on result ordering.

## Code Examples

Verified patterns from official sources:

### Complete HuggingFace Embeddings Setup
```python
# Source: LangChain HuggingFace integration docs
from langchain_huggingface import HuggingFaceEmbeddings

# all-mpnet-base-v2: 768 dimensions, max 384 tokens, best quality
embeddings = HuggingFaceEmbeddings(
    model_name="sentence-transformers/all-mpnet-base-v2",
    model_kwargs={"device": "cpu"},  # or "cuda" if available
    encode_kwargs={"normalize_embeddings": True}
)

# Test embedding
test_embedding = embeddings.embed_query("Hello world")
print(f"Dimension: {len(test_embedding)}")  # Should be 768
```

### ChromaDB Initialization with Persistence
```python
# Source: LangChain ChromaDB integration docs
from langchain_chroma import Chroma

# Persistent storage (survives restarts)
vectorstore = Chroma(
    collection_name="berlin_city_knowledge",
    embedding_function=embeddings,
    persist_directory="./chroma_db",
    collection_metadata={"hnsw:space": "cosine"}
)

# Add documents with metadata
from langchain_core.documents import Document

docs = [
    Document(
        page_content="Dr. Hans Mueller is the Director of Transportation...",
        metadata={
            "source": "contacts/transportation.md",
            "attribution": "Transportation > Director",
            "type": "contact"
        }
    )
]
vectorstore.add_documents(docs)
```

### BM25 Retriever with Custom Preprocessing
```python
# Source: LangChain BM25 docs
from langchain_community.retrievers import BM25Retriever
from nltk.tokenize import word_tokenize
import nltk

nltk.download("punkt_tab")

# BM25 with word tokenization for better keyword matching
bm25_retriever = BM25Retriever.from_documents(
    documents,
    k=10,
    preprocess_func=word_tokenize
)
```

### Complete Hybrid Retriever Setup
```python
# Source: LangChain EnsembleRetriever docs
from langchain.retrievers import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_chroma import Chroma

def create_hybrid_retriever(documents, embeddings, persist_dir="./chroma_db"):
    """Create hybrid retriever with 80% semantic, 20% keyword."""

    # Vector store for semantic search
    vectorstore = Chroma(
        collection_name="knowledge_base",
        embedding_function=embeddings,
        persist_directory=persist_dir
    )
    vectorstore.add_documents(documents)

    # BM25 for keyword search
    bm25_retriever = BM25Retriever.from_documents(documents, k=10)

    # Semantic retriever
    semantic_retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": 10}
    )

    # Ensemble with weights [BM25, semantic] = [0.2, 0.8]
    ensemble = EnsembleRetriever(
        retrievers=[bm25_retriever, semantic_retriever],
        weights=[0.2, 0.8]
    )

    return ensemble
```

### Metadata Filtering Example
```python
# Source: ChromaDB filter docs
# Filter by document type
contact_results = vectorstore.similarity_search(
    query="emergency director",
    k=5,
    filter={"type": "contact"}
)

# Complex filter: contacts from specific department
results = vectorstore.similarity_search(
    query="permit office hours",
    k=5,
    filter={
        "$and": [
            {"type": {"$eq": "contact"}},
            {"section": {"$eq": "Planning"}}
        ]
    }
)
```

### Deduplication Check
```python
# Source: Research on near-duplicate filtering
from collections import defaultdict

def deduplicate_results(results, similarity_threshold=0.95):
    """Remove near-duplicate chunks from same document."""
    seen_sources = defaultdict(list)
    unique_results = []

    for doc, score in results:
        source = doc.metadata.get("source", "")
        content = doc.page_content

        # Check if we've seen very similar content from same source
        is_duplicate = False
        for seen_content in seen_sources[source]:
            # Simple overlap check (production would use embeddings)
            overlap = len(set(content.split()) & set(seen_content.split()))
            if overlap / len(set(content.split())) > similarity_threshold:
                is_duplicate = True
                break

        if not is_duplicate:
            seen_sources[source].append(content)
            unique_results.append((doc, score))

    return unique_results
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `langchain_community.embeddings.huggingface` | `langchain_huggingface.HuggingFaceEmbeddings` | LangChain 0.2.2 (2025) | Community package deprecated |
| Character-based chunking | Structure-aware (MarkdownHeaderTextSplitter) | 2024-2025 | Better retrieval relevance |
| Separate BM25 + vector indexes | EnsembleRetriever with RRF | 2024 | Unified API, automatic fusion |
| FAISS for all use cases | ChromaDB for <200k, FAISS for scale | 2024-2025 | ChromaDB better DX for PoC/MVP |
| all-MiniLM-L6-v2 | all-mpnet-base-v2 | 2024-2025 | ~3% better accuracy |
| SemanticChunker (experimental) | MarkdownHeaderTextSplitter | 2025 | Semantic slower, marginal gains |

**Deprecated/outdated:**
- `langchain.embeddings.HuggingFaceEmbeddings` - Use `langchain_huggingface`
- `langchain_community.vectorstores.Chroma` - Use `langchain_chroma`
- `langchain.agents.create_react_agent` - Use `langgraph.prebuilt.create_react_agent` (Phase 3)

## Open Questions

Things that couldn't be fully resolved:

1. **Optimal chunk size for city contacts**
   - What we know: 256-512 tokens with 10-20% overlap is general best practice
   - What's unclear: Whether contact entries need different sizing than event entries
   - Recommendation: Start with 512 tokens, evaluate with test queries

2. **Weighted RRF effectiveness**
   - What we know: LangChain EnsembleRetriever supports weights
   - What's unclear: Academic validation of weighted RRF vs standard RRF
   - Recommendation: Use [0.2, 0.8] as specified, validate with test suite

3. **Deduplication threshold**
   - What we know: Near-duplicate filtering improves result diversity
   - What's unclear: Optimal similarity threshold for city content
   - Recommendation: Implement simple overlap-based dedup, tune if needed

## Sources

### Primary (HIGH confidence)
- [LangChain BM25 Docs](https://docs.langchain.com/oss/python/integrations/retrievers/bm25) - BM25Retriever implementation
- [LangChain ChromaDB Integration](https://docs.langchain.com/oss/python/integrations/vectorstores/chroma) - Vector store setup
- [HuggingFace all-mpnet-base-v2](https://huggingface.co/sentence-transformers/all-mpnet-base-v2) - Embedding model specs
- [LangChain HuggingFace Embeddings](https://docs.langchain.com/oss/python/integrations/providers/huggingface) - Official integration

### Secondary (MEDIUM confidence)
- [Hybrid Search with LangChain](https://medium.com/etoai/hybrid-search-combining-bm25-and-semantic-search-for-better-results-with-lan-1358038fe7e6) - EnsembleRetriever patterns
- [ChromaDB vs FAISS](https://mohamedbakrey094.medium.com/chromadb-vs-faiss-a-comprehensive-guide-for-vector-search-and-ai-applications-39762ed1326f) - Vector store comparison
- [Best Chunking Strategies 2025](https://www.firecrawl.dev/blog/best-chunking-strategies-rag-2025) - Chunking best practices
- [RAG Data Quality at Scale](https://www.mitchellbryson.com/articles/ai-rag-data-quality-at-scale) - Deduplication strategies

### Tertiary (LOW confidence)
- [Weighted RRF in EnsembleRetriever](https://medium.com/@autorag/what-is-going-on-under-the-hood-of-langchain-ensemble-retriever-73c3de5377a3) - Limited validation of weighted approach

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages verified on PyPI, versions current
- Architecture patterns: HIGH - Official LangChain documentation
- Chunking strategy: HIGH - Multiple sources agree on MarkdownHeaderTextSplitter
- Hybrid search: MEDIUM - EnsembleRetriever documented, weight tuning needs validation
- Deduplication: MEDIUM - Patterns documented, thresholds need tuning
- Pitfalls: HIGH - Multiple sources confirm these issues

**Research date:** 2026-01-20
**Valid until:** 2026-02-20 (30 days - stable domain)
