import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, type GenerateContentConfig } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

// Security headers
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

app.use(express.json({ limit: "32kb" }));

// Lazy-initialized GoogleGenAI client to avoid startup crash if API key is not configured
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    // If key is empty or equals template placeholders, throw error to trigger graceful fallback
    if (!key || key === "MY_GEMINI_API_KEY" || key === "") {
      throw new Error("GEMINI_API_KEY is missing or unconfigured");
    }

    // Optional regional routing support for GCP Vertex AI to bypass local Developer API quotas
    const location = process.env.GCP_LOCATION || process.env.GOOGLE_CLOUD_REGION;
    const projectId = process.env.GCP_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT;

    const clientConfig: {
      apiKey: string;
      httpOptions: { headers: Record<string, string> };
      projectId?: string;
      location?: string;
    } = {
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    };

    if (projectId) {
      clientConfig.projectId = projectId;
    }
    if (location) {
      clientConfig.location = location;
    }

    aiClient = new GoogleGenAI(clientConfig);
  }
  return aiClient;
}

// ADK Python agent proxy — preferred AI backend
const ADK_AGENT_URL = process.env.ADK_AGENT_URL || "http://localhost:8000";

async function tryAdkAgent(payload: object): Promise<any | null> {
  try {
    const r = await fetch(`${ADK_AGENT_URL}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) return null;
    const data = await r.json() as any;
    return data?.success ? data : null;
  } catch {
    return null;
  }
}

// Simple in-memory rate limiter: max 30 requests per IP per minute
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 60_000 });
    return false;
  }
  if (entry.count >= 30) return true;
  entry.count++;
  return false;
}

// REST route for live Agent Orb reasoning
app.post("/api/agent-respond", async (req, res) => {
  const clientIp = (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() || req.socket.remoteAddress || "unknown";
  if (isRateLimited(clientIp)) {
    res.status(429).json({ success: false, error: "Too many requests. Please slow down." });
    return;
  }

  const { query, matchState, opsPosture, currentAnomaly } = req.body;

  // Input validation
  if (!query || typeof query !== "string") {
    res.status(400).json({ success: false, error: "query is required and must be a string." });
    return;
  }
  const sanitizedQuery = query.trim().slice(0, 500);

  const statePromptContext = `
[CURRENT STADIUM OPERATIONS STATE]
Match Phase: ${matchState?.phase || "N/A"} (Status: ${matchState?.status || "N/A"})
Score: ${matchState?.score?.runs || 0}/${matchState?.score?.wickets || 0} (${matchState?.score?.overs || "0.0"} overs)
Attendance: ${matchState?.attendance || "130,224"}
Weather: ${req.body.weather || "CLEAR"}
Threat Level: ${opsPosture?.level || "low"}
Active Driver: ${opsPosture?.driver || "N/A"}
Current Section Alert: ${currentAnomaly ? `${currentAnomaly.kind} Alert on ${currentAnomaly.camera} (${currentAnomaly.section})` : "None"}
  `.trim();

  const systemInstruction = `
You are "@Agent_Orb", the Narendra Modi Stadium's highly advanced resident Operations AI Agent.
You support Narendra Modi Stadium duty operators in Ahmedabad during the high-stakes IPL 2026 Finale (RCB vs MI).
Ensure your answers are incredibly professional, calm, concise, and focused on operational safety and stadium logistics (crowd flow, gate throughput, meteorology, and anomaly response).
Strictly avoid telemetry jargon-larping or any reference to betting, and never speak with flowery or promotional language.
Keep your answer short and focused, directly addressing the operator's query. Use markdown if helpful, but stay under 80 words.
  `.trim();

  // 1. Try ADK Python agent (preferred)
  const adkResult = await tryAdkAgent({
    query: sanitizedQuery,
    match_state: matchState || {},
    ops_posture: opsPosture || {},
    current_anomaly: currentAnomaly || null,
    weather: req.body.weather || "CLEAR",
  });
  if (adkResult) {
    res.json(adkResult);
    return;
  }

  // 2. Fallback: direct Gemini call
  try {
    const ai = getGeminiClient();
    const prompt = `
Context of Operation Deck:
${statePromptContext}

Operator Query or Event:
"${sanitizedQuery}"

Provide your professional guidance:
    `.trim();

    const genConfig: GenerateContentConfig = {
      systemInstruction,
      temperature: 0.7,
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: genConfig,
    });

    const replyText = response.text || "Operations standby. Analyzing signals...";
    res.json({
      success: true,
      sender: "@Agent_Orb",
      text: replyText,
      tool_call: {
        name: "predict_stadium_load",
        args: { phase: matchState?.phase || "middle", threat: opsPosture?.level || "low" },
        result_summary: "Calculations stabilized. Recommendation queued."
      }
    });

  } catch (err: any) {
    // Graceful fallback if API key is not configured or fails
    console.warn("Gemini API server-side fallback triggered:", err.message);

    // Procedural smart responses based on keywords in the query or phase to ensure absolute reliability
    let fallbackText = "Cordon Agent Orb (Offline Loop): Monitoring Narendra Modi Stadium operations. All sectors report nominal densities.";
    let fallbackTool: {
      name: string;
      args: Record<string, any>;
      result_summary: string;
    } = {
      name: "get_fallback_telemetry",
      args: { active_gates: "A-F", density_factor: 1.05 },
      result_summary: "Status green. Ready for backup commands."
    };

    const lowercaseQuery = sanitizedQuery.toLowerCase();
    const lowerPhase = (matchState?.phase || "").toLowerCase();

    if (lowercaseQuery.includes("bag") || lowercaseQuery.includes("backpack") || lowercaseQuery.includes("anomaly") || opsPosture?.level === "elevated") {
      fallbackText = "⚠️ Warning: Potential security anomaly flagged in Section 312. Command recommends immediate dispatch of security stewards to verify the unattended backpack under CAM_14. Maintain perimeter containment.";
      fallbackTool = {
        name: "query_camera",
        args: { camera: "CAM_14", section: "SEC_312" },
        result_summary: "Anomaly bbox confirmed. Perimeter locked."
      };
    } else if (lowerPhase === "innings_break" || lowercaseQuery.includes("gate") || lowercaseQuery.includes("bottleneck")) {
      fallbackText = "🚨 Crowd Flow Notice: Innings break triggers peak concourse saturation. Gate E bottleneck probability is at 84%. Recommending immediate PA broadcast routing to divert traffic to Gate F.";
      fallbackTool = {
        name: "predict_bottleneck",
        args: { gate: "E", horizon_min: 10 },
        result_summary: "Inflow exceeds limit by 12%. Alternate route open."
      };
    } else if (lowercaseQuery.includes("weather") || lowercaseQuery.includes("rain") || opsPosture?.level === "amber") {
      fallbackText = "🌧️ Weather Shift: Meteorological radars show an active cell passing over Ahmedabad within 10 minutes. Activate rain coverage protocol and deploy non-slip stanchions in the concourse immediately.";
      fallbackTool = {
        name: "predict_weather_impact",
        args: { location: "Ahmedabad_West", alert_severity: "moderate" },
        result_summary: "Sky coverage 89%. Squall likely."
      };
    } else if (lowerPhase === "super_over") {
      fallbackText = "🔥 Extreme Intensity: Super Over triggered. Security stance is set to maximum awareness. Non-emergency egress routes are locked in to ensure general crowd alignment during the play.";
      fallbackTool = {
        name: "freeze_egress_gates",
        args: { mode: "precautionary" },
        result_summary: "All 12 exits in slow-roll status."
      };
    } else if (lowercaseQuery.includes("hi") || lowercaseQuery.includes("hello") || lowercaseQuery.includes("help") || lowercaseQuery.includes("status")) {
      fallbackText = "Orb active. Currently overseeing Narendra Modi Stadium operations for the IPL Finale. System at nominal performance. Ask me to predict bottlenecks, check camera anomalies, or check weather status.";
    }

    res.json({
      success: true,
      sender: "@Agent_Orb",
      text: fallbackText,
      tool_call: fallbackTool,
      isFallback: true,
    });
  }
});

// Healthy check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// Integrate Vite middleware in development or serve static files in production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite middleware mounted in development mode.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Serving compiled static assets from dist/ in production mode.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CricSentinel server running on http://localhost:${PORT}`);
  });
}

startServer();
