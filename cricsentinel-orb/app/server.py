import uuid
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai import types
from pydantic import BaseModel

load_dotenv()

# Agent import must come AFTER env vars are set by agent.py module-level code
from app.agent import root_agent  # noqa: E402

app = FastAPI(title="CricSentinel Agent Orb", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST", "GET"],
    allow_headers=["*"],
)

_session_service = InMemorySessionService()
_runner = Runner(
    agent=root_agent,
    app_name="cricsentinel",
    session_service=_session_service,
)


class ChatRequest(BaseModel):
    query: str
    match_state: dict[str, Any] = {}
    ops_posture: dict[str, Any] = {}
    current_anomaly: dict[str, Any] | None = None
    weather: str = "CLEAR"
    session_id: str | None = None


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok", "agent": "cricsentinel-orb", "model": "gemini-2.5-flash"}


@app.post("/chat")
async def chat(req: ChatRequest) -> dict[str, Any]:
    session_id = req.session_id or f"ops-{uuid.uuid4().hex[:8]}"

    anomaly_text = "None"
    if req.current_anomaly:
        a = req.current_anomaly
        anomaly_text = (
            f"{a.get('kind', 'Unknown')} on {a.get('camera', 'N/A')} "
            f"({a.get('section', 'N/A')})"
        )

    score = req.match_state.get("score", {})
    context_block = (
        f"[STADIUM OPS STATE — IPL 2026 FINALE]\n"
        f"Phase: {req.match_state.get('phase', 'N/A')} | "
        f"Status: {req.match_state.get('status', 'N/A')}\n"
        f"Score: {score.get('runs', 0)}/{score.get('wickets', 0)} "
        f"({score.get('overs', '0.0')} ov)\n"
        f"Threat: {req.ops_posture.get('level', 'low')} | "
        f"Driver: {req.ops_posture.get('driver', 'N/A')}\n"
        f"Weather: {req.weather}\n"
        f"Active Alert: {anomaly_text}"
    )
    message = f"{context_block}\n\nOperator Query: {req.query}"

    # Create session (ignore error if it already exists)
    try:
        await _session_service.create_session(
            app_name="cricsentinel",
            user_id="operator",
            session_id=session_id,
        )
    except Exception:
        pass

    response_text = ""
    tool_calls: list[dict[str, Any]] = []

    async for event in _runner.run_async(
        user_id="operator",
        session_id=session_id,
        new_message=types.Content(
            role="user", parts=[types.Part(text=message)]
        ),
    ):
        # Collect final text response
        if event.is_final_response() and event.content and event.content.parts:
            for part in event.content.parts:
                if hasattr(part, "text") and part.text:
                    response_text += part.text

        # Capture tool call / response pairs for frontend display
        if event.content and event.content.parts:
            for part in event.content.parts:
                if hasattr(part, "function_call") and part.function_call:
                    tool_calls.append(
                        {
                            "name": part.function_call.name,
                            "args": dict(part.function_call.args or {}),
                            "result_summary": "",
                        }
                    )
                elif hasattr(part, "function_response") and part.function_response:
                    if tool_calls:
                        tool_calls[-1]["result_summary"] = str(
                            part.function_response.response
                        )[:300]

    # Surface the last tool call to the frontend's tool_call widget
    last_tool: dict[str, Any] | None = None
    if tool_calls:
        tc = tool_calls[-1]
        last_tool = {
            "name": tc["name"],
            "args": tc.get("args", {}),
            "result_summary": tc.get("result_summary") or "Tool executed successfully.",
        }

    return {
        "success": True,
        "sender": "@Agent_Orb",
        "text": response_text or "Operations standby. Analyzing signals...",
        "tool_call": last_tool,
        "session_id": session_id,
        "adk": True,
    }
