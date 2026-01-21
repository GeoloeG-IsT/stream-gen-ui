---
phase: 03-react-agent-streaming
plan: 03
subsystem: agent
tags: [langgraph, mistralai, react-agent, state-machine, streaming]

# Dependency graph
requires:
  - phase: 03-01
    provides: AgentState, RAG tool, agent prompts
  - phase: 03-02
    provides: SSE streaming utilities, entity parsers
provides:
  - LangGraph StateGraph with ReAct cycle (agent + tools nodes)
  - ChatMistralAI with streaming=True for token visibility
  - Conditional routing for tool invocation
  - Recursion limit calculation (2 * max_iterations + 1)
  - Agent configuration in config.py
affects: [03-04-streaming-endpoint, 03-05-structured-output]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Singleton pattern for agent graph instance"
    - "LangGraph StateGraph with conditional edges"
    - "Recursion limit formula: 2 * max_iterations + 1"

key-files:
  created:
    - backend/agent/graph.py
  modified:
    - backend/config.py
    - backend/agent/__init__.py
    - backend/.env.example

key-decisions:
  - "Mistral LLM with streaming=True enabled for token-by-token visibility"
  - "Recursion limit = 2 * max_iterations + 1 (LangGraph counts each step)"
  - "Agent temperature 0.0 for deterministic responses"
  - "Optional LangSmith observability settings for debugging"

patterns-established:
  - "Singleton graph pattern: get_agent_graph() with global _agent_graph"
  - "Conditional routing: should_continue() checks for tool_calls"
  - "Recursion limit calculation helper: get_recursion_limit()"

# Metrics
duration: 2min
completed: 2026-01-21
---

# Phase 3 Plan 3: LangGraph Agent Graph Summary

**LangGraph ReAct state machine with Mistral streaming LLM, conditional tool routing, and proper recursion limit control**

## Performance

- **Duration:** 2 min
- **Started:** 2026-01-21T00:07:45Z
- **Completed:** 2026-01-21T00:09:56Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments
- LangGraph StateGraph implements complete ReAct cycle (Thought-Action-Observation)
- ChatMistralAI configured with streaming=True for token-by-token streaming visibility
- Conditional routing sends agent to tools or end based on tool_calls presence
- Agent configuration centralized in config.py with env var support
- All agent components exported from module for streaming endpoint integration

## Task Commits

Each task was committed atomically:

1. **Task 1: Add agent configuration to config.py** - `abbb7341` (feat)
2. **Task 2: Create LangGraph ReAct agent graph** - `dcd01ddd` (feat)
3. **Task 3: Update agent __init__.py with all exports** - `4bc6dd9e` (feat)

## Files Created/Modified
- `backend/agent/graph.py` - LangGraph StateGraph with agent/tools nodes, conditional routing, singleton pattern
- `backend/config.py` - Agent settings (mistral_model, max_iterations, timeout, temperature, LangSmith)
- `backend/agent/__init__.py` - Export all agent components (state, tools, prompts, graph)
- `backend/.env.example` - Agent configuration examples with Mistral API key and LangSmith settings

## Decisions Made

**1. Mistral LLM with streaming enabled**
- streaming=True is CRITICAL for token-by-token visibility in SSE streaming
- Without this, tokens would batch and streaming wouldn't work

**2. Recursion limit formula: 2 * max_iterations + 1**
- LangGraph counts each step (agent call + tool call) separately
- For 5 iterations: 2 * 5 + 1 = 11 steps
- Prevents infinite loops while allowing sufficient ReAct cycles

**3. Agent temperature 0.0**
- Deterministic responses for consistent behavior
- Reduces variability in tool calling decisions

**4. Optional LangSmith observability**
- Configured but not required (empty string defaults)
- Enables tracing for debugging agent behavior
- Project name: "berlin-city-chatbot"

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## User Setup Required

**Environment variables required for agent to work:**

Add to `backend/.env`:
```
MISTRAL_API_KEY=your_actual_mistral_api_key
```

**Optional observability setup:**
```
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_TRACING_V2=true
```

Reference: `backend/.env.example` has examples of all agent configuration options.

**Verification after setup:**
```bash
cd backend
source venv/bin/activate
python -c "from config import get_settings; s = get_settings(); print(f'API key set: {bool(s.mistral_api_key)}')"
```

## Next Phase Readiness

**Ready for:**
- 03-04: Streaming endpoint integration (graph ready for .astream() calls)
- 03-05: Structured output (graph can be extended with .with_structured_output())

**Available exports:**
- `get_agent_graph()` - Returns compiled LangGraph singleton
- `get_recursion_limit()` - Returns calculated recursion limit (11 for default 5 iterations)
- `AgentState`, `search_knowledge_base`, `AGENT_SYSTEM_PROMPT`, `get_agent_prompt` - All foundation components

**Known requirements:**
- MISTRAL_API_KEY environment variable must be set before agent can run
- Streaming endpoint will use stream_mode="messages" for token streaming

---
*Phase: 03-react-agent-streaming*
*Completed: 2026-01-21*
