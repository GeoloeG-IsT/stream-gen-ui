"""LangGraph ReAct agent state machine.

Implements the Thought-Action-Observation cycle using LangGraph's StateGraph.
The agent decides when to invoke the RAG tool and streams responses.

Key points from research:
- Use stream_mode="messages" for token-by-token streaming
- Recursion limit = 2 * max_iterations + 1 (LangGraph counts each step)
- Model must have streaming=True for token visibility
"""

import logging
from typing import Literal

from langchain_mistralai import ChatMistralAI
from langgraph.graph import StateGraph, END
from langgraph.prebuilt import ToolNode

from config import get_settings
from agent.state import AgentState
from agent.tools import search_knowledge_base
from agent.prompts import get_agent_prompt

logger = logging.getLogger(__name__)


def create_agent_graph(marker: str = "streamdown"):
    """Create and compile the ReAct agent graph.

    Args:
        marker: Output format strategy ("streamdown", "flowtoken", or "llm-ui")

    Returns:
        Compiled LangGraph state machine ready for streaming execution.
    """
    settings = get_settings()

    # Initialize Mistral LLM with streaming enabled
    # CRITICAL: streaming=True is required for token-by-token visibility
    llm = ChatMistralAI(
        model=settings.mistral_model,
        api_key=settings.mistral_api_key,
        temperature=settings.agent_temperature,
        streaming=True,  # REQUIRED for token streaming
        timeout=settings.agent_timeout_seconds,
    )

    # Bind tools to the model
    tools = [search_knowledge_base]
    llm_with_tools = llm.bind_tools(tools)

    # Create prompt chain with marker-aware prompt
    prompt = get_agent_prompt(marker)
    agent_chain = prompt | llm_with_tools

    def call_agent(state: AgentState) -> dict:
        """Agent node: invoke LLM with current messages.

        The LLM decides whether to call a tool or respond directly.
        """
        messages = state["messages"]
        response = agent_chain.invoke({"messages": messages})
        return {"messages": [response]}

    def should_continue(state: AgentState) -> Literal["tools", "__end__"]:
        """Route to tools if LLM requested tool call, else end.

        Returns:
            "tools" if last message has tool_calls, "__end__" otherwise
        """
        messages = state["messages"]
        last_message = messages[-1]

        # Check if the LLM wants to call a tool
        if hasattr(last_message, "tool_calls") and last_message.tool_calls:
            logger.debug(
                f"Agent calling tools: {[tc['name'] for tc in last_message.tool_calls]}"
            )
            return "tools"

        logger.debug("Agent finished - no more tool calls")
        return END

    # Build the graph
    workflow = StateGraph(AgentState)

    # Add nodes
    workflow.add_node("agent", call_agent)
    workflow.add_node("tools", ToolNode(tools))

    # Set entry point
    workflow.set_entry_point("agent")

    # Add edges
    # Agent -> (tools or end)
    workflow.add_conditional_edges(
        "agent",
        should_continue,
        {
            "tools": "tools",
            END: END,
        },
    )
    # Tools -> back to agent (for observation)
    workflow.add_edge("tools", "agent")

    # Compile the graph
    graph = workflow.compile()

    logger.info(
        f"Agent graph compiled with model={settings.mistral_model}, max_iterations={settings.agent_max_iterations}, marker={marker}"
    )
    return graph


def get_recursion_limit() -> int:
    """Calculate recursion limit from max iterations.

    LangGraph counts each step (agent call + tool call) separately.
    Formula: recursion_limit = 2 * max_iterations + 1

    For 5 iterations: 2 * 5 + 1 = 11
    """
    settings = get_settings()
    return 2 * settings.agent_max_iterations + 1
