#!/usr/bin/env python
"""Ingest knowledge base markdown files into vector store."""
import sys
from pathlib import Path

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))

from rag.chunking import chunk_all_knowledge
from rag.vectorstore import init_vectorstore
from rag.retriever import init_hybrid_retriever

def ingest(knowledge_dir: Path | None = None) -> dict:
    """
    Ingest all knowledge base files into vector store.

    Returns dict with ingestion stats.
    """
    if knowledge_dir is None:
        knowledge_dir = Path(__file__).parent.parent / "knowledge"

    print(f"Ingesting knowledge from: {knowledge_dir}")

    # Chunk all markdown files
    print("Chunking documents...")
    documents = chunk_all_knowledge(knowledge_dir)
    print(f"Created {len(documents)} chunks")

    # Count by type
    type_counts = {}
    for doc in documents:
        doc_type = doc.metadata.get("type", "unknown")
        type_counts[doc_type] = type_counts.get(doc_type, 0) + 1

    print(f"Chunk breakdown: {type_counts}")

    # Initialize vector store with documents
    print("Initializing vector store...")
    vectorstore = init_vectorstore(documents)
    print(f"Vector store initialized with {vectorstore._collection.count()} vectors")

    # Initialize hybrid retriever
    print("Initializing hybrid retriever...")
    init_hybrid_retriever(documents)
    print("Hybrid retriever initialized")

    # Test retrieval
    print("\nTesting retrieval...")
    test_queries = [
        "Who handles emergency services?",
        "When is the next city council meeting?",
        "How do I get a building permit?"
    ]

    from rag.retriever import retrieve_with_scores
    for query in test_queries:
        results = retrieve_with_scores(query, k=3)
        print(f"\nQuery: {query}")
        for doc, score in results[:3]:
            print(f"  [{score:.3f}] {doc.metadata.get('attribution', 'Unknown')}")

    return {
        "total_chunks": len(documents),
        "by_type": type_counts,
        "vector_count": vectorstore._collection.count()
    }

if __name__ == "__main__":
    stats = ingest()
    print(f"\nIngestion complete: {stats}")
