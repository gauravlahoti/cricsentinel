<div align="center">

# CricSentinel

### AI-Powered Stadium Operations Command Center

**Real-time crowd intelligence · Incident management · AI-guided decision support**

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Google ADK](https://img.shields.io/badge/Google_ADK-1.33-4285F4?logo=google&logoColor=white)](https://google.github.io/adk-docs/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev)
[![Cloud Run](https://img.shields.io/badge/Cloud_Run-us--west1-4285F4?logo=googlecloud&logoColor=white)](https://cloud.google.com/run)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

*Built for the IPL 2026 Finale · Narendra Modi Stadium, Ahmedabad · 130,224 seats*

**Live Demo → [cric-sentinel-593919045544.us-west1.run.app](https://cric-sentinel-593919045544.us-west1.run.app)**

</div>

---

## The Problem

130,000 fans. One stadium. Six gates. Current stadium operations rely on **fragmented, manual systems** — radios, spreadsheets, and gut instinct. When a crowd surge, security anomaly, or weather shift hits, ops teams have seconds to respond with no unified view.

**CricSentinel** collapses that fragmentation into a single AI-powered command layer — giving duty operators real-time situational awareness, proactive decision proposals, and an AI agent that reasons through incidents using live data and historical precedent.

---

## Architecture

Two independently deployed services on Google Cloud Run, connected through a resilient 3-tier fallback chain.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        OPERATOR BROWSER                             │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌────────────┐  ┌──────────┐ │
│  │  VitalSigns  │  │ StadiumView  │  │ ActionCards│  │ Security │ │
│  │ Attendance · │  │  Gate Map ·  │  │  AI Decis- │  │ Runbook  │ │
│  │ Throughput · │  │  Anomaly     │  │  ion Deck  │  │ Executor │ │
│  │  Egress ETA  │  │  Overlay     │  │            │  │          │ │
│  └──────────────┘  └──────────────┘  └────────────┘  └──────────┘ │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  @Agent_Orb Chat Widget — floating AI assistant                │ │
│  │  Context-aware: injects live match phase, threat level,        │ │
│  │  active anomaly, and weather into every query                  │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ POST /api/agent-respond
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│              Cloud Run — cric-sentinel  (Node / Express)             │
│                                                                      │
│   Receives query + full ops context → attempts ADK agent first       │
│                                                                      │
│   Tier 1 ──► POST /chat ──► cricsentinel-agent service              │
│   Tier 2 ──► Direct Gemini SDK call (if agent unreachable)          │
│   Tier 3 ──► Procedural keyword fallback (always available)         │
└──────────────────────────────┬───────────────────────────────────────┘
                               │ POST /chat
                               ▼
┌──────────────────────────────────────────────────────────────────────┐
│           Cloud Run — cricsentinel-agent  (Python / ADK)             │
│                                                                      │
│   @Agent_Orb — Google ADK ReAct Agent · gemini-2.5-flash            │
│   Vertex AI backend · Scoped to stadium operations only              │
│                                                                      │
│   ┌──────────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│   │  get_weather_data │  │   web_search    │  │query_cricsentinel │  │
│   │  wttr.in live API │  │  DuckDuckGo API │  │      _db          │  │
│   │  Ahmedabad only   │  │  IPL news,      │  │  Historical ops   │  │
│   │                   │  │  squad updates  │  │  DB — 2019–2025   │  │
│   └──────────────────┘  └─────────────────┘  └───────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## @Agent_Orb — The AI Agent

Built on **Google's Agent Development Kit (ADK)**, `@Agent_Orb` is a scoped ReAct agent that supports duty operators with live intelligence. It uses **Vertex AI** (no quota limits) and enforces strict domain guardrails — it only answers questions about Narendra Modi Stadium operations, IPL logistics, and Ahmedabad weather.

### Three Live Tools

| Tool | Data Source | What it answers |
|---|---|---|
| `get_weather_data` | [wttr.in](https://wttr.in) real-time API | Current temp, humidity, wind, UV — Ahmedabad only |
| `web_search` | DuckDuckGo Instant Answer API | IPL news, squad changes, live match updates |
| `query_cricsentinel_db` | In-memory historical DB (2019–2025) | Gate throughput, incident history, egress benchmarks, capacity zones |

### Demo Queries (one per tool)

```
"Is current weather safe for death overs, or should we prep a rain hold?"
→ calls get_weather_data(Ahmedabad)

"Has Gate E ever caused a bottleneck at innings break in a previous NMS final?"
→ calls query_cricsentinel_db(gate_patterns, phase:innings_break)

"Any squad changes for RCB ahead of today's finale?"
→ calls web_search(RCB IPL 2026 finale squad news)
```

### Context Injection

Every operator query automatically includes the current ops state — the agent never answers blind:

```
[STADIUM OPS STATE — IPL 2026 FINALE]
Phase: innings_break | Status: innings_break
Score: 142/4 (14.2 ov)
Threat: amber | Driver: Gate E saturation
Weather: HAZE
Active Alert: BOTTLENECK on CAM-08 (Gate E Corridor)
```

### 3-Tier Fallback

```
Query → ADK Agent (Vertex AI + 3 tools)  ←── primary
            │ unreachable
            ▼
        Gemini SDK (direct API call)      ←── secondary
            │ no key
            ▼
        Procedural fallback               ←── always on
```

The app is **always operational** — no single point of failure.

---

## Key Features

| Feature | Detail |
|---|---|
| **Ops Command Dashboard** | Four tabs: Ops · Security · Guests · Logistics — unified single pane of glass |
| **VitalSigns Strip** | Live attendance, gate throughput, egress ETA, weather, and threat level — color-coded by severity |
| **Stadium Map** | Gate-by-gate anomaly overlay. Active sections glow red/amber on incident detection |
| **AI Decision Cards** | Phase-driven proposals with confidence scores. Accept → logged + executed. Override → dismissed |
| **Security Runbook** | Step-by-step incident response. Agent drafts PA broadcast script; human approves before it goes live |
| **Match Phase Timeline** | Auto-streams through Pre-Match → Powerplay → Innings Break → Death → Super Over in 30s intervals |
| **@Agent_Orb Chat** | Context-aware floating assistant. Suggestions change per match phase. Shows which backend responded (ADK vs Gemini) |
| **Human-in-the-Loop** | Agent cannot broadcast PA or execute runbook steps autonomously — operator approval required at every action |

---

## Scalability

| Concern | How it's handled |
|---|---|
| Traffic spikes | Cloud Run auto-scales to zero and bursts horizontally — no pre-provisioning |
| Independent scaling | Frontend (`cric-sentinel`) and agent (`cricsentinel-agent`) are separate services, scale independently |
| No quota bottlenecks | Agent uses Vertex AI via service account — not tied to free-tier Developer API limits |
| Stateless agent | Each request is stateless at the infra level; ADK handles in-memory session per conversation |

For production at scale: add Cloud Pub/Sub for real sensor event streaming, BigQuery for cross-match analytics, and Cloud SQL for persistent session state.

---

## Security

| Concern | Implementation |
|---|---|
| API keys | `GEMINI_API_KEY` stored in **GCP Secret Manager** — injected at runtime, never in image or env vars |
| Agent scope | Hard-enforced domain guardrails in system instruction — out-of-scope queries return a fixed refusal |
| Human-in-the-loop | PA broadcasts and runbook actions require explicit operator approval — agent cannot act unilaterally |
| Transport | HTTPS-only via Cloud Run managed TLS |
| Rate limiting | Express layer enforces 30 req/IP/min to prevent abuse |

---

## Google Cloud Stack

| Service | Role |
|---|---|
| **Google ADK** (`google-adk 1.33`) | Agent framework — ReAct loop, tool routing, session memory |
| **Gemini 2.5 Flash** (Vertex AI) | Agent reasoning model — no free-tier quota limits |
| **Cloud Run** (`us-west1`) | Hosts both services — zero-config HTTPS, auto-scaling |
| **Cloud Build** | Builds multi-stage Docker images and pushes to Artifact Registry |
| **Artifact Registry** | Private container image registry |
| **Secret Manager** | Secure runtime injection of API credentials |
| **Google Stitch** | AI design tool used to prototype the initial dashboard layout |
| **agents-cli** | Scaffolded and managed the `cricsentinel-orb` ADK agent project |

---

## Project Structure

```
cricsentinel/
├── cricsentinel-orb/            # ADK Python agent microservice
│   ├── app/
│   │   ├── agent.py             # Agent definition — model, instruction, tools, guardrails
│   │   ├── tools.py             # get_weather_data · web_search · query_cricsentinel_db
│   │   └── server.py            # FastAPI wrapper (POST /chat · GET /health)
│   ├── Dockerfile
│   └── pyproject.toml
├── src/
│   ├── App.tsx                  # Root — state orchestrator, timeline engine
│   ├── mockTimeline.ts          # Match phase simulation data + decision cards
│   ├── types.ts                 # Domain types
│   └── components/
│       ├── AIChatWidget.tsx     # Floating AI chat — context injection + tool call display
│       ├── ActionCards.tsx      # AI decision proposals + incident runbook
│       ├── VitalSigns.tsx       # Telemetry strip
│       ├── StadiumView.tsx      # Gate map + anomaly overlay
│       ├── SecurityView.tsx     # Camera anomaly + runbook execution
│       ├── LogisticsView.tsx    # Gate & crowd flow
│       ├── GuestsView.tsx       # VIP guest status
│       └── TimelineController.tsx
├── server.ts                    # Express — ADK proxy + fallback chain
└── Dockerfile                   # Multi-stage Node build
```

---

## Quick Start

**Prerequisites:** Node.js 18+, Python 3.12+, [uv](https://docs.astral.sh/uv/), Gemini API key

```bash
# Terminal 1 — ADK agent
cd cricsentinel-orb
echo "GEMINI_API_KEY=your_key" > .env
./run.sh   # → http://localhost:8000

# Terminal 2 — Frontend
npm install
echo "GEMINI_API_KEY=your_key" > .env
npm run dev   # → http://localhost:3000
```

> No ADK service? The app falls back to direct Gemini. No key at all? Procedural fallback keeps the demo functional.

---

## Deploy

```bash
# Agent
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT/REPO/cricsentinel-agent:latest ./cricsentinel-orb
gcloud run deploy cricsentinel-agent --image ... --region us-west1

# Frontend
gcloud builds submit --tag REGION-docker.pkg.dev/PROJECT/REPO/cric-sentinel:latest .
gcloud run deploy cric-sentinel --image ... --region us-west1 \
  --set-secrets="GEMINI_API_KEY=GEMINI_API_KEY:latest" \
  --set-env-vars="ADK_AGENT_URL=https://cricsentinel-agent-....run.app"
```

---

<div align="center">
Built for IPL 2026 · Powered by Google ADK + Gemini + Cloud Run · Keeping 130,000 fans safe
</div>
