"""ReAct agent module for Berlin city chatbot.

This module provides the LangGraph-based ReAct agent that:
- Executes Thought-Action-Observation cycles
- Uses RAG as a tool for knowledge retrieval
- Streams responses with entity markers

Usage:
    from agent import get_agent_graph, get_recursion_limit

    graph = get_agent_graph()
    async for event in graph.astream(
        {"messages": messages},
        config={"recursion_limit": get_recursion_limit()},
        stream_mode="messages"
    ):
        # Process streaming events
"""
from agent.state import AgentState
from agent.tools import search_knowledge_base
from agent.prompts import AGENT_SYSTEM_PROMPT, get_agent_prompt
from agent.graph import create_agent_graph, get_recursion_limit

__all__ = [
    "AgentState",
    "search_knowledge_base",
    "AGENT_SYSTEM_PROMPT",
    "get_agent_prompt",
    "create_agent_graph",
    "get_recursion_limit",
]
