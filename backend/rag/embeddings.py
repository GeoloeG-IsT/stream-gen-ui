from functools import lru_cache
from langchain_huggingface import HuggingFaceEmbeddings
import sys
sys.path.insert(0, '..')
from config import get_settings

@lru_cache
def get_embeddings() -> HuggingFaceEmbeddings:
    """Get cached HuggingFace embeddings instance."""
    settings = get_settings()
    return HuggingFaceEmbeddings(
        model_name=settings.embedding_model,
        model_kwargs={"device": "cpu"},
        encode_kwargs={"normalize_embeddings": True}
    )
