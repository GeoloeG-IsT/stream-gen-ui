from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    """State for the ReAct agent graph.

    Uses add_messages annotation to properly accumulate messages
    across graph iterations (Thought -> Action -> Observation cycles).
    """
    messages: Annotated[Sequence[BaseMessage], add_messages]
