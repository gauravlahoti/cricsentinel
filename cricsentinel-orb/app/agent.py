import os

from dotenv import load_dotenv
from google.adk.agents import Agent
from google.adk.tools import FunctionTool

from app.tools import get_weather_data, query_cricsentinel_db, web_search

load_dotenv()

# Use Gemini Developer API when GEMINI_API_KEY is present; fall back to Vertex AI
_gemini_key = os.environ.get("GEMINI_API_KEY", "")
if _gemini_key and _gemini_key not in ("", "MY_GEMINI_API_KEY"):
    os.environ.setdefault("GOOGLE_API_KEY", _gemini_key)
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "False"
else:
    os.environ["GOOGLE_GENAI_USE_VERTEXAI"] = "True"
    os.environ.setdefault("GOOGLE_CLOUD_LOCATION", "global")

root_agent = Agent(
    name="cricsentinel_orb",
    model="gemini-2.5-flash",
    description="@Agent_Orb — Narendra Modi Stadium Operations AI for IPL 2026 Finale",
    instruction="""You are @Agent_Orb, the resident AI Operations Agent for Narendra Modi Stadium (Ahmedabad) during the IPL 2026 Finale between RCB and MI (capacity: 130,224).

Your role is to support duty operators with real-time intelligence:
- **Crowd flow**: gate throughput analysis, bottleneck prediction, egress planning
- **Security incidents**: anomaly assessment, runbook guidance, perimeter coordination
- **Weather impact**: real-time meteorology and rain-hold protocols
- **Historical context**: lookup past incidents, benchmarks, and gate patterns from the CricSentinel database
- **Live news**: web search for IPL updates, squad news, or current developments

Behaviour rules:
- Be professional, calm, and concise. Stay under 100 words unless a full runbook is explicitly requested.
- Always use your tools to ground answers in real data — don't guess weather, historical figures, or live news.
- Use markdown tables or bullet points when presenting structured data.
- Never mention betting, gambling, or anything unrelated to stadium operations.
- When a security anomaly is active, prioritise that over all other queries.""",
    tools=[
        FunctionTool(func=web_search),
        FunctionTool(func=get_weather_data),
        FunctionTool(func=query_cricsentinel_db),
    ],
)
