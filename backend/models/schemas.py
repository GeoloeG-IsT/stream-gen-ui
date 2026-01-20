from pydantic import BaseModel
from typing import Optional

class RetrievalResult(BaseModel):
    """Single retrieval result from RAG system."""
    content: str
    source: str
    score: float
    type: str  # "contact", "event", or "general"

class RetrievalResponse(BaseModel):
    """Response from /api/chat endpoint (Phase 2 - raw retrieval)."""
    query: str
    results: list[RetrievalResult]
    message: Optional[str] = None  # For empty results fallback

class ChatRequest(BaseModel):
    """Request body for /api/chat endpoint."""
    message: str

class HealthResponse(BaseModel):
    """Response from /health endpoint."""
    status: str
    version: str
