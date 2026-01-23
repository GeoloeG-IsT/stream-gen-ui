from pathlib import Path
from langchain_chroma import Chroma
from langchain_core.documents import Document
import sys

sys.path.insert(0, "..")
from config import get_settings
from .embeddings import get_embeddings

_vectorstore = None


def init_vectorstore(documents: list[Document] | None = None) -> Chroma:
    """Initialize ChromaDB vector store, optionally with documents."""
    global _vectorstore
    settings = get_settings()

    persist_dir = Path(settings.chroma_persist_dir)
    persist_dir.mkdir(parents=True, exist_ok=True)

    _vectorstore = Chroma(
        collection_name=settings.collection_name,
        embedding_function=get_embeddings(),
        persist_directory=str(persist_dir),
        collection_metadata={"hnsw:space": "cosine"},
    )

    if documents:
        _vectorstore.add_documents(documents)

    return _vectorstore


def get_vectorstore() -> Chroma:
    """Get or create vector store instance."""
    global _vectorstore
    if _vectorstore is None:
        _vectorstore = init_vectorstore()
    return _vectorstore
