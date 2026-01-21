import asyncio
from functools import wraps
import logging
from langchain.tools import tool
from rag.retriever import get_hybrid_retriever, retrieve_with_scores, deduplicate_results

logger = logging.getLogger(__name__)

# Timeout decorator for tool execution (30 seconds per user requirement)
TOOL_TIMEOUT_SECONDS = 30

def async_tool_timeout(seconds: int):
    """Decorator to timeout async tool execution."""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            try:
                return await asyncio.wait_for(
                    func(*args, **kwargs),
                    timeout=seconds
                )
            except asyncio.TimeoutError:
                logger.warning(f"Tool {func.__name__} timed out after {seconds}s")
                return f"The operation timed out after {seconds} seconds. Please try a simpler query."
        return wrapper
    return decorator


@tool
async def search_knowledge_base(query: str) -> str:
    """Search the Berlin city knowledge base for contacts, events, and information.

    **Use this tool when the user asks about:**
    - Specific people's contact details (email, phone, address)
    - Department or agency contact information
    - Upcoming events, festivals, or city calendar
    - City services, facilities, or general information

    **DO NOT use this tool for:**
    - General greetings or small talk
    - Questions about your capabilities
    - Math calculations or reasoning tasks
    - Information not related to Berlin city services

    Args:
        query: The search query describing what information to find

    Returns:
        Relevant information from the knowledge base with source attribution
    """
    try:
        retriever = get_hybrid_retriever()
        if retriever is None:
            return "The knowledge base is not currently available. Please try again later."

        # Retrieve with scores and deduplicate
        raw_results = retrieve_with_scores(query, k=10)
        unique_results = deduplicate_results(raw_results)

        if not unique_results:
            return "I didn't find any information matching that query. Try asking about contacts, events, or city services."

        # Log sources for debugging (not sent to frontend)
        formatted_results = []
        for doc, score in unique_results[:5]:  # Top 5 results
            source = doc.metadata.get("attribution", "Unknown source")
            doc_type = doc.metadata.get("type", "general")
            # Log source attribution for debugging/observability
            logger.info(f"RAG result: source={source}, type={doc_type}, score={score:.2f}")
            # Return content without source prefix (cleaner for frontend)
            formatted_results.append(doc.page_content)

        return "\n\n---\n\n".join(formatted_results)

    except Exception as e:
        logger.error(f"RAG retrieval failed: {e}", exc_info=True)
        return "I couldn't access the knowledge base right now. Please try again in a moment."


# Apply timeout wrapper for async execution
search_knowledge_base_with_timeout = async_tool_timeout(TOOL_TIMEOUT_SECONDS)(
    search_knowledge_base.coroutine
)
