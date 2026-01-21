"""SSE formatting utilities for AI SDK v6 compatibility.

The AI SDK v6 uses a specific SSE protocol with event types:
- text-delta: streaming text content
- reasoning-delta: agent reasoning (thoughts)
- [DONE]: signals stream completion

CRITICAL: The x-vercel-ai-ui-message-stream: v1 header is REQUIRED
for AI SDK's useChat hook to properly parse the stream.
"""
import json
from typing import Literal

# Required headers for AI SDK v6 SSE compatibility
SSE_HEADERS = {
    "x-vercel-ai-ui-message-stream": "v1",  # REQUIRED - AI SDK stream protocol
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
}


def format_text_start(message_id: str) -> str:
    """Format text-start event to initialize a text part.

    REQUIRED by AI SDK v6: Must be sent before any text-delta events.

    Args:
        message_id: Unique identifier for the text part

    Returns:
        SSE formatted string: data: {...}\n\n
    """
    event = {
        "type": "text-start",
        "id": message_id,
    }
    return f"data: {json.dumps(event)}\n\n"


def format_text_delta(content: str, message_id: str) -> str:
    """Format a text content chunk as SSE event.

    Args:
        content: The text content to stream
        message_id: Unique identifier for the message

    Returns:
        SSE formatted string: data: {...}\n\n
    """
    event = {
        "type": "text-delta",
        "id": message_id,
        "delta": content,
    }
    return f"data: {json.dumps(event)}\n\n"


def format_reasoning_delta(content: str, message_id: str) -> str:
    """Format agent reasoning (thoughts) as SSE event.

    Reasoning appears in a separate visual block from response text.
    Used for Thought-Action-Observation visibility.

    Args:
        content: The reasoning content
        message_id: Unique identifier for the message

    Returns:
        SSE formatted string for reasoning
    """
    event = {
        "type": "reasoning-delta",
        "id": message_id,
        "delta": content,
    }
    return f"data: {json.dumps(event)}\n\n"


def format_done() -> str:
    """Format stream completion signal.

    Returns:
        SSE formatted [DONE] marker
    """
    return "data: [DONE]\n\n"


def format_error(message: str, message_id: str) -> str:
    """Format an error as text-delta (so user sees it).

    We emit errors as text because the stream has already started
    (HTTP 200 sent) and we can't change status codes mid-stream.

    Args:
        message: User-friendly error message
        message_id: Message identifier

    Returns:
        SSE formatted error as text
    """
    return format_text_delta(f"\n\n*Error: {message}*", message_id)
