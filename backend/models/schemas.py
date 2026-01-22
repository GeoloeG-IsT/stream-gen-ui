from pydantic import BaseModel, model_validator
from typing import Optional, Literal, Any
from enum import Enum

class MarkerStrategy(str, Enum):
    """Output format strategy for entity markers."""
    STREAMDOWN = "streamdown"
    FLOWTOKEN = "flowtoken"
    LLM_UI = "llm-ui"

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
    """Request body for legacy /api/chat endpoint (Phase 2)."""
    message: str

class HealthResponse(BaseModel):
    """Response from /health endpoint."""
    status: str
    version: str

# --- Agent schemas (Phase 3) ---

class MessagePart(BaseModel):
    """Single part of a message (AI SDK v6 format)."""
    type: str
    text: Optional[str] = None


class MessageItem(BaseModel):
    """Single message in conversation history.

    Supports both legacy format (content string) and AI SDK v6 format (parts array).
    """
    role: Literal["user", "assistant", "system"]
    content: Optional[str] = None
    parts: Optional[list[MessagePart]] = None
    id: Optional[str] = None  # AI SDK includes message ID

    @model_validator(mode='after')
    def extract_content_from_parts(self) -> 'MessageItem':
        """Extract content from parts array if content not provided."""
        if self.content is None and self.parts:
            # Concatenate text from all text parts
            text_parts = [p.text for p in self.parts if p.type == 'text' and p.text]
            self.content = ''.join(text_parts)
        if not self.content:
            raise ValueError('Message must have content or text parts')
        return self

class AgentChatRequest(BaseModel):
    """Request body for streaming agent /api/chat endpoint.

    Accepts messages array matching AI SDK useChat format.
    """
    messages: list[MessageItem]

class AgentChatError(BaseModel):
    """Error response for agent endpoint."""
    error: str
    detail: Optional[str] = None
