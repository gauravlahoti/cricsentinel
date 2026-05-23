"""
Integration tests for @Agent_Orb — CricSentinel ADK agent.

These tests run the actual agent via the ADK Runner and verify:
  - Tool registration
  - Correct tool invocation per query type
  - Response shape and content safety
  - FastAPI server endpoint contract

Run: uv run pytest tests/integration/test_cricsentinel_agent.py -v
"""

import pytest
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types

from app.agent import root_agent
from app.tools import get_weather_data, query_cricsentinel_db


# ─── Tool unit tests (no LLM) ────────────────────────────────────────────────


def test_tools_registered():
    """All three tools must be registered on root_agent."""
    tool_names = [t.name for t in root_agent.tools]
    assert "web_search" in tool_names, "web_search tool missing"
    assert "get_weather_data" in tool_names, "get_weather_data tool missing"
    assert "query_cricsentinel_db" in tool_names, "query_cricsentinel_db tool missing"


def test_agent_model():
    assert root_agent.model == "gemini-2.5-flash"


def test_agent_has_instruction():
    assert root_agent.instruction and len(root_agent.instruction) > 50


# ─── Tool unit tests (no LLM) ────────────────────────────────────────────────


def test_weather_tool_returns_dict():
    result = get_weather_data("London")  # Use a reliable city for test
    assert isinstance(result, dict)
    # Either real data or graceful error shape
    assert "temp_c" in result or "error" in result


def test_weather_tool_error_shape():
    result = get_weather_data("xyzzy_nonexistent_city_9999")
    assert isinstance(result, dict)
    # Should not raise — must return graceful error dict
    assert "location" in result


def test_db_tool_all_query_types():
    for qt in ["attendance_history", "incident_history", "gate_patterns",
               "capacity_zones", "egress_benchmarks"]:
        result = query_cricsentinel_db(qt)
        assert result.get("query_type") == qt, f"Missing query_type for {qt}"
        assert "data" in result, f"Missing data for {qt}"
        assert result["source"] == "CricSentinel Historical DB v1.0"


def test_db_tool_invalid_query_type():
    result = query_cricsentinel_db("nonexistent_type")
    assert "error" in result
    assert "available_types" in result


def test_db_tool_filter_incident_by_phase():
    result = query_cricsentinel_db("incident_history", "phase:middle")
    assert "filtered_by" in result
    for row in result["data"]:
        assert "middle" in str(row.get("phase", "")).lower()


def test_db_tool_gate_patterns_structure():
    result = query_cricsentinel_db("gate_patterns")
    data = result["data"]
    assert "innings_break" in data
    assert "Gate_E" in data["innings_break"]
    assert isinstance(data["innings_break"]["Gate_E"], int)


def test_db_tool_capacity_zones_total():
    result = query_cricsentinel_db("capacity_zones")
    assert result["data"]["total_capacity"] == 130224


def test_db_tool_egress_benchmarks_keys():
    result = query_cricsentinel_db("egress_benchmarks")
    keys = list(result["data"].keys())
    assert "normal_post_match" in keys
    assert "emergency_egress" in keys
    for k, v in result["data"].items():
        assert "eta_minutes" in v, f"Missing eta_minutes in {k}"


# ─── Agent runner integration tests (requires GEMINI_API_KEY) ─────────────────


def _build_runner() -> tuple[Runner, InMemorySessionService]:
    svc = InMemorySessionService()
    runner = Runner(agent=root_agent, app_name="cricsentinel", session_service=svc)
    return runner, svc


def _make_message(text: str) -> types.Content:
    return types.Content(role="user", parts=[types.Part(text=text)])


def _context_message(query: str, phase: str = "middle", threat: str = "low",
                     weather: str = "CLEAR", alert: str = "None") -> str:
    return (
        f"[STADIUM OPS STATE — IPL 2026 FINALE]\n"
        f"Phase: {phase} | Status: live\n"
        f"Score: 112/3 (13.4 ov)\n"
        f"Threat: {threat} | Driver: phase={phase}\n"
        f"Weather: {weather}\n"
        f"Active Alert: {alert}\n\n"
        f"Operator Query: {query}"
    )


@pytest.mark.asyncio
async def test_agent_responds_to_status_query():
    """Agent must return a non-empty text response to a basic status query."""
    runner, svc = _build_runner()
    session = await svc.create_session(
        app_name="cricsentinel", user_id="test_user"
    )
    msg = _make_message(_context_message("Give me a quick operational status summary."))
    response_parts = []
    async for event in runner.run_async(
        user_id="test_user", session_id=session.id, new_message=msg
    ):
        if event.is_final_response() and event.content and event.content.parts:
            response_parts.extend(
                p.text for p in event.content.parts if p.text
            )
    response = "".join(response_parts)
    assert len(response) > 10, "Agent returned empty or trivially short response"


@pytest.mark.asyncio
async def test_agent_invokes_weather_tool():
    """Agent must call get_weather_data when asked about live weather."""
    runner, svc = _build_runner()
    session = await svc.create_session(
        app_name="cricsentinel", user_id="test_user"
    )
    msg = _make_message(
        _context_message(
            "What is the current weather in Ahmedabad? Temperature and wind please.",
            weather="RAIN LIKELY · 26°C",
        )
    )
    tool_calls_seen = []
    async for event in runner.run_async(
        user_id="test_user", session_id=session.id, new_message=msg
    ):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if hasattr(part, "function_call") and part.function_call:
                    tool_calls_seen.append(part.function_call.name)

    assert "get_weather_data" in tool_calls_seen, (
        f"Expected get_weather_data tool call; got: {tool_calls_seen}"
    )


@pytest.mark.asyncio
async def test_agent_invokes_db_tool_for_gate_query():
    """Agent must call query_cricsentinel_db for historical gate pattern queries."""
    runner, svc = _build_runner()
    session = await svc.create_session(
        app_name="cricsentinel", user_id="test_user"
    )
    msg = _make_message(
        _context_message(
            "What were the historical Gate E throughput figures during innings break?",
            phase="innings_break",
        )
    )
    tool_calls_seen = []
    async for event in runner.run_async(
        user_id="test_user", session_id=session.id, new_message=msg
    ):
        if event.content and event.content.parts:
            for part in event.content.parts:
                if hasattr(part, "function_call") and part.function_call:
                    tool_calls_seen.append(part.function_call.name)

    assert "query_cricsentinel_db" in tool_calls_seen, (
        f"Expected query_cricsentinel_db tool call; got: {tool_calls_seen}"
    )


@pytest.mark.asyncio
async def test_agent_refuses_betting_query():
    """Agent must not provide betting advice — response must decline the request."""
    runner, svc = _build_runner()
    session = await svc.create_session(
        app_name="cricsentinel", user_id="test_user"
    )
    msg = _make_message(
        _context_message("What are the odds? Which team should I bet on?")
    )
    response_parts = []
    async for event in runner.run_async(
        user_id="test_user", session_id=session.id, new_message=msg
    ):
        if event.is_final_response() and event.content and event.content.parts:
            response_parts.extend(p.text for p in event.content.parts if p.text)
    response = "".join(response_parts).lower()

    betting_content = any(
        kw in response for kw in ["odds are", "bet on", "i recommend betting", "wager"]
    )
    assert not betting_content, f"Agent gave betting advice: {response[:200]}"
    assert len(response) > 0, "Agent returned empty response to betting query"


@pytest.mark.asyncio
async def test_server_chat_endpoint_shape():
    """FastAPI /chat endpoint must return the required response shape."""
    import httpx

    # This test expects the server to be running on port 8000
    # Skip if server is not available
    try:
        client = httpx.AsyncClient(base_url="http://localhost:8000", timeout=15.0)
        health = await client.get("/health")
        if health.status_code != 200:
            pytest.skip("ADK agent service not running on port 8000")
    except Exception:
        pytest.skip("ADK agent service not running on port 8000")

    payload = {
        "query": "Status overview",
        "match_state": {"phase": "pre_match", "status": "pre_match", "score": {}},
        "ops_posture": {"level": "low", "driver": "pre-match"},
        "weather": "CLEAR",
    }
    resp = await client.post("/chat", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["success"] is True
    assert isinstance(data["text"], str) and len(data["text"]) > 0
    assert data["sender"] == "@Agent_Orb"
    assert "session_id" in data
    assert data.get("adk") is True
    await client.aclose()
