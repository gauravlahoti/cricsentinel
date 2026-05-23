from typing import Any

import httpx

# ---------------------------------------------------------------------------
# Tool 1: Web search via DuckDuckGo Instant Answer API (no key required)
# ---------------------------------------------------------------------------


def web_search(query: str) -> dict[str, Any]:
    """Search the web for current information — IPL news, stadium updates, live data.

    Args:
        query: The search query string (e.g. "IPL 2026 RCB vs MI latest news").

    Returns:
        Dictionary with abstract text, source, URL, and related topics.
    """
    try:
        resp = httpx.get(
            "https://api.duckduckgo.com/",
            params={
                "q": query,
                "format": "json",
                "no_html": "1",
                "skip_disambig": "1",
            },
            timeout=6.0,
            follow_redirects=True,
        )
        resp.raise_for_status()
        data = resp.json()
        topics = [
            t.get("Text", "")
            for t in data.get("RelatedTopics", [])[:5]
            if isinstance(t, dict) and t.get("Text")
        ]
        return {
            "query": query,
            "abstract": data.get("AbstractText", ""),
            "source": data.get("AbstractSource", ""),
            "url": data.get("AbstractURL", ""),
            "answer": data.get("Answer", ""),
            "related_topics": topics,
        }
    except Exception as e:
        return {"error": str(e), "query": query, "status": "unavailable"}


# ---------------------------------------------------------------------------
# Tool 2: Live weather via wttr.in (no API key required)
# ---------------------------------------------------------------------------


def get_weather_data(location: str = "Ahmedabad") -> dict[str, Any]:
    """Fetch real-time weather conditions for the stadium location.

    Args:
        location: City or location name (e.g. "Ahmedabad", "Ahmedabad India").

    Returns:
        Dictionary with current weather: temperature, humidity, wind, description.
    """
    try:
        url = f"https://wttr.in/{location}?format=j1"
        resp = httpx.get(url, timeout=5.0)
        resp.raise_for_status()
        data = resp.json()
        c = data["current_condition"][0]
        return {
            "location": location,
            "temp_c": c["temp_C"],
            "feels_like_c": c["FeelsLikeC"],
            "humidity_pct": c["humidity"],
            "wind_kmph": c["windspeedKmph"],
            "wind_direction": c["winddir16Point"],
            "description": c["weatherDesc"][0]["value"],
            "visibility_km": c["visibility"],
            "uv_index": c.get("uvIndex", "N/A"),
        }
    except Exception as e:
        return {"error": str(e), "location": location, "status": "unavailable"}


# ---------------------------------------------------------------------------
# Tool 3: CricSentinel historical operations database
# ---------------------------------------------------------------------------

_DB: dict[str, Any] = {
    "attendance_history": [
        {
            "year": 2019,
            "match": "CSK vs MI Final",
            "venue": "Hyderabad",
            "attendance": 52000,
            "peak_ingress_phase": "powerplay",
            "notes": "Peak ingress in first 30 min exceeded gate capacity by 8%",
        },
        {
            "year": 2022,
            "match": "GT vs RR Final",
            "venue": "Ahmedabad (NMS)",
            "attendance": 101000,
            "peak_ingress_phase": "pre_match",
            "notes": "First NMS Final. Gate E bottleneck reported 45 min before match",
        },
        {
            "year": 2023,
            "match": "CSK vs GT Final",
            "venue": "Ahmedabad (NMS)",
            "attendance": 98000,
            "peak_ingress_phase": "pre_match",
            "notes": "Smooth ingress. Gate F redirected Gate E overflow successfully",
        },
        {
            "year": 2024,
            "match": "KKR vs SRH Final",
            "venue": "Chennai",
            "attendance": 112000,
            "peak_ingress_phase": "powerplay",
            "notes": "Record crowd for Chennai; minor crush at Gate 7",
        },
        {
            "year": 2025,
            "match": "MI vs RCB Final",
            "venue": "Ahmedabad (NMS)",
            "attendance": 125000,
            "peak_ingress_phase": "innings_break",
            "notes": "Innings break saw 6200/min egress to concessions. Rain hold in death overs",
        },
    ],
    "incident_history": [
        {
            "id": "INC-2022-01",
            "type": "BOTTLENECK",
            "location": "Gate E Corridor",
            "phase": "pre_match",
            "resolution": "PA announcement redirected crowd to Gate F. Resolved in 12 min",
            "severity": "MEDIUM",
        },
        {
            "id": "INC-2022-02",
            "type": "UNATTENDED_ITEM",
            "location": "Section 245, Row 8",
            "phase": "middle",
            "resolution": "Guard cleared item in 4 min — false alarm (forgotten food bag)",
            "severity": "LOW",
        },
        {
            "id": "INC-2023-01",
            "type": "CROWD_SURGE",
            "location": "Gate A concourse",
            "phase": "powerplay",
            "resolution": "Steward chain deployed, 3 extra channels opened. Resolved in 8 min",
            "severity": "HIGH",
        },
        {
            "id": "INC-2024-01",
            "type": "WEATHER_HOLD",
            "location": "Full stadium",
            "phase": "death",
            "resolution": "18-min rain hold. Canopy deployed over sections 100-200. DLS applied",
            "severity": "MEDIUM",
        },
        {
            "id": "INC-2025-01",
            "type": "MEDICAL",
            "location": "Section 312, Row 14",
            "phase": "middle",
            "resolution": "Medical team on scene in 3 min. Fan treated for heat exhaustion",
            "severity": "MEDIUM",
        },
        {
            "id": "INC-2025-02",
            "type": "UNATTENDED_ITEM",
            "location": "CAM-14, Section 312",
            "phase": "middle",
            "resolution": "Security runbook deployed. Backpack claimed by owner within 6 min",
            "severity": "ELEVATED",
        },
    ],
    "gate_patterns": {
        "pre_match": {
            "Gate_A": 1200,
            "Gate_B": 980,
            "Gate_C": 1100,
            "Gate_D": 890,
            "Gate_E": 1450,
            "Gate_F": 680,
            "unit": "fans/min",
            "note": "Gate E is the primary turnstile bottleneck in pre-match",
        },
        "powerplay": {
            "Gate_A": 220,
            "Gate_B": 180,
            "Gate_C": 160,
            "Gate_D": 140,
            "Gate_E": 310,
            "Gate_F": 120,
            "unit": "fans/min",
            "note": "Reduced ingress; peak concession footfall",
        },
        "innings_break": {
            "Gate_A": 890,
            "Gate_B": 720,
            "Gate_C": 810,
            "Gate_D": 660,
            "Gate_E": 1180,
            "Gate_F": 540,
            "unit": "fans/min",
            "note": "Massive concourse surge. Gate E critical — Gate F historically underutilised",
        },
        "death": {
            "Gate_A": 150,
            "Gate_B": 120,
            "Gate_C": 110,
            "Gate_D": 95,
            "Gate_E": 200,
            "Gate_F": 85,
            "unit": "fans/min",
            "note": "Pre-egress building. Medical team pre-staged",
        },
        "done": {
            "Gate_A": 2100,
            "Gate_B": 1800,
            "Gate_C": 1950,
            "Gate_D": 1600,
            "Gate_E": 2400,
            "Gate_F": 1200,
            "unit": "fans/min",
            "note": "Peak egress. All gates open. Expected 22-38 min full evacuation",
        },
    },
    "capacity_zones": {
        "Gate_A": {"sections": "100-124", "max_capacity": 18500, "type": "Lower Bowl North"},
        "Gate_B": {"sections": "125-150", "max_capacity": 16200, "type": "Lower Bowl East"},
        "Gate_C": {"sections": "151-200", "max_capacity": 19800, "type": "Lower Bowl South"},
        "Gate_D": {"sections": "201-250", "max_capacity": 17400, "type": "Upper Tier West"},
        "Gate_E": {
            "sections": "251-312",
            "max_capacity": 22100,
            "type": "Upper Tier East + VIP Access",
        },
        "Gate_F": {
            "sections": "313-350",
            "max_capacity": 14200,
            "type": "Upper Tier North (Premium)",
        },
        "total_capacity": 130224,
        "vip_zones": ["Section 300-315", "Pavilion Box"],
        "medical_stations": [
            "Gate A Ground Level",
            "Section 200 Concourse",
            "Gate E Level 2",
        ],
    },
    "egress_benchmarks": {
        "normal_post_match": {
            "eta_minutes": 35,
            "peak_flow_per_min": 4800,
            "notes": "Standard post-match. All 6 gates open",
        },
        "super_over_post_match": {
            "eta_minutes": 42,
            "peak_flow_per_min": 4200,
            "notes": "Crowd lingers longer. Slow-roll egress in final overs",
        },
        "rain_hold_post_match": {
            "eta_minutes": 48,
            "peak_flow_per_min": 3600,
            "notes": "Wet concourses reduce flow. Non-slip stanchions required",
        },
        "emergency_egress": {
            "eta_minutes": 18,
            "peak_flow_per_min": 8200,
            "notes": "Emergency protocol. All gates + emergency exits. PA guidance required",
        },
    },
}


def query_cricsentinel_db(query_type: str, filters: str = "") -> dict[str, Any]:
    """Query the CricSentinel historical stadium operations database.

    Args:
        query_type: One of: attendance_history, incident_history, gate_patterns,
                    capacity_zones, egress_benchmarks
        filters: Optional filter string, comma-separated key:value pairs
                 (e.g. "phase:innings_break", "year:2025", "gate:E").

    Returns:
        Matching records from the CricSentinel operations database.
    """
    key = query_type.lower().strip()
    if key not in _DB:
        return {
            "error": f"Unknown query_type '{query_type}'",
            "available_types": list(_DB.keys()),
        }

    data = _DB[key]
    result: dict[str, Any] = {
        "query_type": key,
        "source": "CricSentinel Historical DB v1.0",
        "data": data,
    }

    if filters and isinstance(data, list):
        filtered = data
        for part in filters.lower().split(","):
            part = part.strip()
            if ":" in part:
                field, val = part.split(":", 1)
                filtered = [
                    r for r in filtered if val in str(r.get(field.strip(), "")).lower()
                ]
        result["data"] = filtered
        result["filtered_by"] = filters
        result["result_count"] = len(filtered)

    return result
