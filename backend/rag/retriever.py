from functools import lru_cache
from langchain_classic.retrievers.ensemble import EnsembleRetriever
from langchain_community.retrievers import BM25Retriever
from langchain_core.documents import Document
from nltk.tokenize import word_tokenize
import nltk
import sys
sys.path.insert(0, '..')
from config import get_settings
from .vectorstore import get_vectorstore

# Ensure NLTK data is available
try:
    nltk.data.find('tokenizers/punkt_tab')
except LookupError:
    nltk.download('punkt_tab', quiet=True)

_hybrid_retriever = None
_documents_cache = None

def init_hybrid_retriever(documents: list[Document]) -> EnsembleRetriever:
    """Initialize hybrid retriever with BM25 + semantic search."""
    global _hybrid_retriever, _documents_cache
    settings = get_settings()

    # BM25 retriever for keyword search
    bm25_retriever = BM25Retriever.from_documents(
        documents,
        k=settings.retrieval_k,
        preprocess_func=word_tokenize
    )

    # Semantic retriever from vector store
    vectorstore = get_vectorstore()
    semantic_retriever = vectorstore.as_retriever(
        search_type="similarity",
        search_kwargs={"k": settings.retrieval_k}
    )

    # Ensemble with weights [BM25, semantic] = [0.2, 0.8]
    _hybrid_retriever = EnsembleRetriever(
        retrievers=[bm25_retriever, semantic_retriever],
        weights=[settings.bm25_weight, settings.semantic_weight]
    )

    _documents_cache = documents
    return _hybrid_retriever

def get_hybrid_retriever() -> EnsembleRetriever | None:
    """Get hybrid retriever instance (must be initialized first)."""
    return _hybrid_retriever

def retrieve_with_scores(query: str, k: int = 10) -> list[tuple[Document, float]]:
    """Retrieve documents with relevance scores."""
    if _hybrid_retriever is None:
        return []

    # EnsembleRetriever doesn't return scores directly
    # Use vector store for scored results
    vectorstore = get_vectorstore()
    results = vectorstore.similarity_search_with_score(query, k=k)

    # Convert distance to similarity (lower distance = higher similarity)
    scored_results = []
    for doc, distance in results:
        relevance = max(0, 1 - distance)  # Clamp to [0, 1]
        scored_results.append((doc, relevance))

    return scored_results

def deduplicate_results(
    results: list[tuple[Document, float]],
    similarity_threshold: float = 0.95
) -> list[tuple[Document, float]]:
    """Remove near-duplicate chunks from same source."""
    from collections import defaultdict

    seen_sources = defaultdict(list)
    unique_results = []

    for doc, score in results:
        source = doc.metadata.get("source", "")
        content = doc.page_content
        content_words = set(content.lower().split())

        is_duplicate = False
        for seen_content in seen_sources[source]:
            seen_words = set(seen_content.lower().split())
            if len(content_words) == 0:
                continue
            overlap = len(content_words & seen_words) / len(content_words)
            if overlap > similarity_threshold:
                is_duplicate = True
                break

        if not is_duplicate:
            seen_sources[source].append(content)
            unique_results.append((doc, score))

    return unique_results
