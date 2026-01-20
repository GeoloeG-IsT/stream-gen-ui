from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Server
    host: str = "0.0.0.0"
    port: int = 8000
    debug: bool = True

    # RAG
    embedding_model: str = "sentence-transformers/all-mpnet-base-v2"
    chroma_persist_dir: str = "./chroma_db"
    collection_name: str = "berlin_city_knowledge"

    # Retrieval
    retrieval_k: int = 10
    bm25_weight: float = 0.2
    semantic_weight: float = 0.8

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

@lru_cache
def get_settings() -> Settings:
    return Settings()
