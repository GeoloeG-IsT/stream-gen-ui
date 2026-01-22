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

    # Agent
    mistral_model: str = "mistral-large-latest"
    mistral_api_key: str = ""  # Required - set via MISTRAL_API_KEY env var
    agent_max_iterations: int = 5
    agent_timeout_seconds: int = 30
    agent_temperature: float = 0.0  # Deterministic for consistent responses

    # Observability (optional)
    # NOTE: LangChain reads LANGCHAIN_* env vars automatically for tracing
    langchain_api_key: str = ""  # Set via LANGCHAIN_API_KEY for tracing
    langchain_project: str = "berlin-city-chatbot"
    langchain_tracing_v2: bool = False  # Enable LangSmith tracing

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"  # Allow extra env vars without error

@lru_cache
def get_settings() -> Settings:
    return Settings()
