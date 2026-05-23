import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MatchState,
  OpsPosture,
  CommsEntry,
  DecisionCard,
  RunbookStep,
  Anomaly
} from "./types";
import { getTimelineNodeState, TIMELINE_NODES } from "./mockTimeline";
import VitalSigns from "./components/VitalSigns";
import StadiumView from "./components/StadiumView";
import CommsLog from "./components/CommsLog";
import ActionCards from "./components/ActionCards";
import TimelineController from "./components/TimelineController";
import SecurityView from "./components/SecurityView";
import LogisticsView from "./components/LogisticsView";
import GuestsView from "./components/GuestsView";
import AIChatWidget from "./components/AIChatWidget";
import {
  ShieldAlert,
  Send,
  Sparkles,
  Wifi,
  Database,
  Grid,
  Radio,
  User,
  ExternalLink,
  Bot,
  Sun,
  Moon
} from "lucide-react";

export default function App() {
  const [activeNodeId, setActiveNodeId] = useState<string>("pre_match");
  const [activeTab, setActiveTab] = useState<"ops" | "security" | "guests" | "logistics">("ops");

  // Realtime Live Streaming Autopilot states
  const [isAutoStream, setIsAutoStream] = useState<boolean>(true);
  const [autoCountdown, setAutoCountdown] = useState<number>(30);

  // Theme Persistence State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const cached = localStorage.getItem("cricsentinel_theme");
      return cached ? cached === "dark" : true;
    } catch {
      return true;
    }
  });

  // Keep DOM class list synchronized automatically for fluid transitions
  useEffect(() => {
    try {
      const root = document.documentElement;
      if (isDarkMode) {
        root.classList.remove("light-theme");
        document.body.classList.remove("light-theme");
        localStorage.setItem("cricsentinel_theme", "dark");
      } else {
        root.classList.add("light-theme");
        document.body.classList.add("light-theme");
        localStorage.setItem("cricsentinel_theme", "light");
      }
    } catch (e) {
      console.warn("localStorage or DOM classes failed:", e);
    }
  }, [isDarkMode]);

  // Main operational records
  const [matchState, setMatchState] = useState<MatchState | null>(null);
  const [opsPosture, setOpsPosture] = useState<OpsPosture | null>(null);
  const [currentAnomaly, setCurrentAnomaly] = useState<Anomaly | null>(null);
  const [commsEntries, setCommsEntries] = useState<CommsEntry[]>([]);
  const [decisionCards, setDecisionCards] = useState<DecisionCard[]>([]);
  const [runbookSteps, setRunbookSteps] = useState<RunbookStep[]>([]);

  // Telemetry sub-caps for ticking / count animation helpers
  const [attendance, setAttendance] = useState<number>(12500);
  const [throughput, setThroughput] = useState<number>(850);
  const [egressEta, setEgressEta] = useState<number>(0);
  const [weatherText, setWeatherText] = useState<string>("");

  // Filters
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  // Chat/Input support
  const [userQuery, setUserQuery] = useState<string>("");
  const [agentSpeaking, setAgentSpeaking] = useState<string>("");
  const [isAILending, setIsAILending] = useState<boolean>(false);

  // Initialize operational snapshot based on Selected Node ID
  useEffect(() => {
    const freshState = getTimelineNodeState(activeNodeId);
    setMatchState(freshState.matchState);
    setOpsPosture(freshState.opsPosture);
    setCurrentAnomaly(freshState.currentAnomaly);
    setDecisionCards(freshState.decisionCards);
    setRunbookSteps(freshState.runbookSteps);

    setAttendance(freshState.node.attendance);
    setThroughput(freshState.node.gateThroughput);
    setEgressEta(freshState.node.egressEta);
    setWeatherText(freshState.node.weather);

    setAgentSpeaking(freshState.node.agentSpeech);

    // Dynamic routing to specific workspaces based on active scenario triggers
    if (activeNodeId === "middle_overs") {
      setActiveTab("security");
    } else if (activeNodeId === "innings_break" || activeNodeId === "death_overs") {
      setActiveTab("logistics");
    } else if (activeNodeId === "pre_match") {
      setActiveTab("ops");
    }

    // Capture auto status in logs
    const timestamp = new Date().toLocaleTimeString();
    const sysLog: CommsEntry = {
      id: "live-auto-" + Date.now() + "-" + Math.random(),
      ts: timestamp,
      speaker: "system",
      role_color: "violet",
      text: isAutoStream
        ? `🔴 [LIVE TELEMETRY INGEST] Narendra Modi Stadium telemetry synchronized. Phase advanced autonomously to ${activeNodeId.replace("_", " ").toUpperCase()}. 14 CCTV channels verified.`
        : `⚠️ [DIAGNOSTICS LOCK] Operator manual bypass active. Continuous telemetry streaming is paused.`,
      trace_id: "trx-live-" + Math.floor(Math.random() * 90000)
    };
    setCommsEntries([...freshState.commsEntries, sysLog]);

    // Reset countdown
    setAutoCountdown(30);
  }, [activeNodeId, isAutoStream]);

  // Autopilot telemetry stream progression loop
  useEffect(() => {
    if (!isAutoStream) return;

    const timer = setInterval(() => {
      setAutoCountdown((prev) => {
         if (prev <= 1) {
           const currentIndex = TIMELINE_NODES.findIndex((node) => node.id === activeNodeId);
           const nextIndex = (currentIndex + 1) % TIMELINE_NODES.length;
           const nextNode = TIMELINE_NODES[nextIndex];
           setActiveNodeId(nextNode.id);
           return 30; // reset
         }
         return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isAutoStream, activeNodeId]);

  // Handle ticking animation counts for Attendance or Throughput
  useEffect(() => {
    if (activeNodeId === "pre_match") return;
    const interval = setInterval(() => {
      // Slightly fluctuate attendance and gate throughput for high realism
      setAttendance((prev) => {
        if (activeNodeId === "done") {
          return Math.max(126000, prev - Math.floor(Math.random() * 30));
        }
        return Math.min(130224, prev + Math.floor(Math.random() * 8));
      });

      setThroughput((prev) => {
        const base = activeNodeId === "innings_break" ? 4800 : activeNodeId === "powerplay" ? 2100 : 850;
        const drift = Math.floor(Math.random() * 120) - 60;
        return Math.max(100, base + drift);
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [activeNodeId]);

  // Operator executes decision card proposal
  const handleExecuteDecision = (actionId: string, cardId: string) => {
    // 1. Set executed state on the card
    setDecisionCards((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, isExecuted: true } : c))
    );

    // 2. Draft action details
    const targetCard = decisionCards.find((c) => c.id === cardId);
    if (!targetCard) return;

    const timestamp = new Date().toLocaleTimeString();
    const cleanActionName = actionId.toUpperCase().replace("_", " ");

    const logEntry: CommsEntry = {
      id: "op-act-" + Date.now(),
      ts: timestamp,
      speaker: "ops_lead",
      role_color: "amber",
      text: `[CONFIRMED ACTION DEPLOYMENT] operator executed: "${targetCard.title}" via trigger ${cleanActionName}. Broadcasting state...`,
      trace_id: "trx-op-" + Math.floor(Math.random() * 10000)
    };

    // 3. Append to Comms list
    setCommsEntries((prev) => [...prev, logEntry]);

    // 4. Update runbook state based on action
    if (actionId === "initiate_security" || actionId === "broadcast_pa" || actionId === "initiate_rain") {
      setRunbookSteps((prevSteps) => {
        const nextSteps = prevSteps.map((step) => {
          if (step.order === 1) return { ...step, state: "completed" as const, completed_at: new Date().toISOString() };
          if (step.order === 2) return { ...step, state: "active" as const };
          return step;
        });
        return nextSteps;
      });
    }
  };

  // Operator advances checklist runbook steps
  const handleCompleteStep = (stepId: string) => {
    const timestamp = new Date().toLocaleTimeString();

    setRunbookSteps((prev) => {
      const resolvedList = prev.map((item) => {
        if (item.id === stepId) {
          return {
            ...item,
            state: "completed" as const,
            completed_by: "ops_lead",
            completed_at: new Date().toISOString()
          };
        }
        return item;
      });

      // Find current ordering index
      const completedStep = prev.find((i) => i.id === stepId);
      if (!completedStep) return prev;

      const nextOrder = completedStep.order + 1;
      const finalSteps = resolvedList.map((item) => {
        if (item.order === nextOrder) {
          return { ...item, state: "active" as const };
        }
        return item;
      });

      // Add audit logs
      const logEntry: CommsEntry = {
        id: "step-rec-" + Date.now(),
        ts: timestamp,
        speaker: "system",
        role_color: "cyan",
        text: `Runbook state advanced. Step 0${completedStep.order} reconciled by Operations Lead. Initiating Step 0${nextOrder}...`,
        trace_id: "trx-sys-" + Math.floor(Math.random() * 10000)
      };
      setCommsEntries((prevComms) => [...prevComms, logEntry]);

      return finalSteps;
    });
  };

  // Submit operator text command to Gemini REST API on the server
  const handleSendQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userQuery.trim() || isAILending) return;

    const queryMessage = userQuery.trim();
    setUserQuery("");
    setIsAILending(true);

    const timestamp = new Date().toLocaleTimeString();

    // 1. Post operator request to local Comms terminal
    const operatorLog: CommsEntry = {
      id: "user-q-" + Date.now(),
      ts: timestamp,
      speaker: "ops_lead",
      role_color: "grey",
      text: queryMessage,
      trace_id: "trx-req-" + Math.floor(Math.random() * 90000)
    };
    setCommsEntries((prev) => [...prev, operatorLog]);

    try {
      // 2. Trigger Express full-stack API route
      const response = await fetch("/api/agent-respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryMessage,
          matchState,
          opsPosture,
          currentAnomaly,
          weather: weatherText
        })
      });

      const data = await response.json();

      if (data && data.success) {
        setAgentSpeaking(data.text);

        // Append Orb response and its tool called signature in log details!
        const orbLog: CommsEntry = {
          id: "orb-r-" + Date.now(),
          ts: new Date().toLocaleTimeString(),
          speaker: "agent_orb",
          role_color: "violet",
          text: data.text,
          trace_id: "trx-rsp-" + Math.floor(Math.random() * 90000),
          tool_call: data.tool_call
            ? {
                name: data.tool_call.name,
                args: data.tool_call.args,
                result_summary: data.tool_call.result_summary
              }
            : undefined
        };
        setCommsEntries((prev) => [...prev, orbLog]);
      }
    } catch (err) {
      console.error("Failed to query Express API backend:", err);
    } finally {
      setIsAILending(false);
    }
  };

  // Quick action chips for Operator voice bar queries
  const quickQuestionsByNode = {
    pre_match: ["Status overview", "Check gate throughput", "Pre-stage bathroom lanes"],
    powerplay: ["Exits report", "Are concourse levels safe?", "Predict peak crowd hour"],
    middle_overs: ["Trace CAM_14 bag anomaly", "Incident risk rating", "Dispatch guard"],
    innings_break: ["Bottleneck alert", "Divert traffic to Gate F", "Trigger PA speaker notice"],
    death_overs: ["Radar weather forecast", "Pre-position stanchions", "Activate shelters"],
    super_over: ["Lock gates precautionary", "Egress eta target", "Notify paramedics"],
    done: ["Shift handover summary", "Egress peak speed", "Archive duty log"]
  };

  const activeQuickQuests = quickQuestionsByNode[activeNodeId as keyof typeof quickQuestionsByNode] || [];

  // Determine threat background glow values
  const getOrbMeshColor = () => {
    if (!opsPosture) return "from-violet-500 to-cyan-500";
    if (opsPosture.level === "critical") return "from-red-600 via-orange-600 to-red-500 shadow-md glow-red";
    if (opsPosture.level === "amber") return "from-amber-600 via-yellow-500 to-amber-500 shadow-sm glow-amber";
    if (opsPosture.level === "elevated") return "from-violet-600 via-indigo-600 to-cyan-400";
    return "from-violet-500 to-cyan-400";
  };

  return (
    <div className={`min-h-screen relative p-4 max-w-7xl mx-auto flex flex-col justify-between select-none transition-colors duration-500`} id="cricsentinel-main-deck">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-cyan-950/10 blur-[140px] rounded-full pointer-events-none z-0"></div>

      {/* 1. Header/Navigation Brand bar */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-glass-border/30 pb-4 mb-4 gap-4">
        <div className="flex items-center gap-3">
          {/* Logo HUD Glyph */}
          <div className="w-10 h-10 border border-brand-cyan/40 bg-brand-cyan/5 rounded flex items-center justify-center relative select-none">
            <span className="text-brand-cyan font-mono font-bold text-xl tracking-tighter">C</span>
            <div className="absolute top-[-2px] right-[-2px] w-1.5 h-1.5 rounded-full bg-brand-cyan"></div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold font-display tracking-wide text-white uppercase">
                CricSentinel
              </h1>
              <span className="px-1.5 py-0.5 rounded bg-brand-cyan/10 border border-brand-cyan/20 text-brand-cyan font-mono text-[8px] tracking-widest font-semibold uppercase select-none">
                Mission Central
              </span>
            </div>
            <p className="text-[10px] font-mono text-gray-500 mt-0.5">
              IPL 2026 Finale · नरेन्द्र मोदी Stadium, Ahmedabad
            </p>
          </div>
        </div>

        {/* Navigation Tabs bar matching images exactly */}
        <div className="flex bg-white/[0.02] border border-white/5 rounded-lg p-1 hover:border-white/10 transition-colors font-mono text-[10px] items-center gap-1">
          {(["ops", "security", "guests", "logistics"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const highlightColor = tab === "security" 
              ? "text-brand-red border-[#ef4444] bg-[#ef4444]/5" 
              : "text-brand-cyan border-brand-cyan bg-brand-cyan/5";
            const hoverColor = tab === "security"
              ? "hover:text-brand-red hover:bg-brand-red/5"
              : "hover:text-[#06b6d4] hover:bg-[#06b6d4]/5";

            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3.5 py-1.5 uppercase rounded-md transition-all duration-200 cursor-pointer font-bold tracking-wider ${
                  isActive
                    ? `border ${highlightColor} shadow-inner`
                    : `text-gray-400 ${hoverColor}`
                }`}
              >
                {tab}
              </button>
            );
          })}
        </div>

        {/* Phase aware Match Posture HUD Mirror Banner */}
        {matchState && (
          <div className="flex h-11 bg-glass-surface border border-glass-border/20 rounded-lg p-1.5 font-mono text-[10px] items-center gap-4 divide-x divide-white/5 shadow-inner">
            <div className="px-2">
              <span className="text-gray-500 mr-2">MATCH PHASE:</span>
              <span className="text-brand-cyan font-bold uppercase tracking-widest animate-pulse">
                {matchState.status === "super_over" ? "SUPER OVER" : matchState.phase === "n/a" ? matchState.status.replace("_", " ") : matchState.phase.replace("_", " ")}
              </span>
            </div>
            <div className="px-3">
              <span className="text-gray-500 mr-2">SCORE:</span>
              <span className="text-white font-mono font-bold">
                {matchState.status === "pre_match" ? "0/0 (0.0 overs)" : matchState.status === "innings_break" ? `RCB ${matchState.score.runs}/6 (20.0)` : `${matchState.teams.home} 112/3 vs ${matchState.teams.away} ${matchState.score.runs}/${matchState.score.wickets} (${matchState.score.overs} ov)`}
              </span>
            </div>
            {matchState.score.target && (
              <div className="px-3">
                <span className="text-gray-500 mr-2">TARGET:</span>
                <span className="text-brand-amber font-mono font-bold">{matchState.score.target}</span>
              </div>
            )}
          </div>
        )}

        {/* Mode switcher and HUD Connectivity Metadata layout */}
        <div className="flex items-center gap-4">
          {/* HUD Connectivity Metadata Indicators */}
          <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono font-medium text-gray-500 border-r border-white/5 pr-4 h-5">
            <span className="flex items-center gap-1">
              <Wifi className="w-3.5 h-3.5 text-brand-cyan" /> PING: <span className="text-white">42MS</span>
            </span>
            <span className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-brand-violet" /> STREAM: <span className="text-emerald-400">NOMINAL</span>
            </span>
          </div>

          {/* Premium Animated Theme Switcher button */}
          <motion.div 
            className="flex items-center bg-white/[0.02] border border-white/5 rounded-lg p-0.5 hover:border-white/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="relative px-3 py-1.5 rounded-md hover:bg-white/5 transition-all text-[10px] font-mono font-bold tracking-widest uppercase cursor-pointer flex items-center gap-2"
              title="Toggle cockpit visual theme"
            >
              <AnimatePresence mode="wait">
                {isDarkMode ? (
                  <motion.div
                    key="dark"
                    initial={{ y: -6, opacity: 0, rotate: -25 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 6, opacity: 0, rotate: 25 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1 text-indigo-400"
                  >
                    <Moon className="w-3.5 h-3.5 fill-indigo-400/10 text-indigo-400" />
                    <span>MIDNIGHT</span>
                  </motion.div>
                ) : (
                  <motion.div
                    key="light"
                    initial={{ y: -6, opacity: 0, rotate: -25 }}
                    animate={{ y: 0, opacity: 1, rotate: 0 }}
                    exit={{ y: 6, opacity: 0, rotate: 25 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center gap-1 text-amber-500 font-bold"
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: "16s" }} />
                    <span>DAYLIGHT</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </div>
      </header>

      {/* 2. Interactive Timeline Stepper (Case triggers) */}
      <section className="relative z-10 mb-4">
        <TimelineController
          activeNodeId={activeNodeId}
          onSelectNode={setActiveNodeId}
          isAutoStream={isAutoStream}
          onToggleAutoStream={() => setIsAutoStream(!isAutoStream)}
          autoCountdown={autoCountdown}
        />
      </section>

      {/* 3. Primary Metrics Top Row */}
      {matchState && opsPosture && (
        <section className="relative z-10 mb-4">
          <VitalSigns
            matchState={matchState}
            opsPosture={opsPosture}
            attendanceVal={attendance}
            throughputVal={throughput}
            egressEtaVal={egressEta}
            weatherVal={weatherText}
            selectedFilter={selectedFilter}
            onSelectFilter={setSelectedFilter}
          />
        </section>
      )}

      {/* 4. Three-Column Main operations grid or Tab view */}
      {matchState && opsPosture && (
        <section className="relative z-10 flex-grow py-1">
          {activeTab === "ops" && (
            <main className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 items-stretch" id="view-ops-workspace">
              {/* L1. Left Rail (Comms log + Mini system status) */}
              <div className="lg:col-span-3 flex flex-col gap-4">
                <CommsLog entries={commsEntries} />
                
                {/* Embedded Active System Health Metrics (F1 PIT WALL styling) */}
                <div className="bg-glass-surface rounded-xl border border-glass-border/30 p-3 select-none flex flex-col gap-2 font-mono text-[9px] text-gray-500">
                  <span className="text-[10px] uppercase font-bold text-gray-400 flex items-center gap-1">
                    <Radio className="w-3.5 h-3.5 text-brand-cyan shrink-0 animate-pulse" /> Diagnostic Signals
                  </span>
                  <div className="grid grid-cols-2 gap-2 mt-1 border-t border-white/5 pt-2">
                    <div>
                      CCTV RADARS: <span className="text-emerald-400 font-bold">14/14 CH</span>
                    </div>
                    <div>
                      AUDIO ARRAYS: <span className="text-emerald-400 font-bold">8/8 CH</span>
                    </div>
                    <div>
                      ROOF SHIELD: <span className="text-brand-cyan font-bold">STANDBY</span>
                    </div>
                    <div>
                      STEWARDS HF: <span className="text-brand-cyan font-bold">SECURE CHANNEL</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* C2. Center Column (Stadium Arena Map Viewport) */}
              <div className="lg:col-span-5 flex flex-col justify-between h-full">
                <StadiumView
                  matchState={matchState}
                  anomaly={currentAnomaly}
                  activeFilter={selectedFilter}
                  onSelectGate={(gateName) => {
                    setUserQuery(`Predict stanchion alignment flow for concourse around ${gateName}`);
                    // Highlight with logs
                    const queryLog: CommsEntry = {
                      id: "stadium-tap-" + Date.now(),
                      ts: new Date().toLocaleTimeString(),
                      speaker: "ops_lead",
                      role_color: "cyan",
                      text: `Scanning sensors and structural overlays near ${gateName}. Requesting prediction vectors...`,
                      trace_id: "trx-hud-" + Math.floor(Math.random() * 8000)
                    };
                    setCommsEntries((p) => [...p, queryLog]);
                  }}
                />
              </div>

              {/* R3. Right Column (Active proposals & checklists response) */}
              <div className="lg:col-span-4 bg-glass-surface rounded-xl border border-glass-border/30 p-4 max-h-[500px] overflow-y-auto overflow-x-hidden">
                <ActionCards
                  decisionCards={decisionCards}
                  runbookSteps={runbookSteps}
                  threatLevel={opsPosture.level}
                  onExecuteAction={handleExecuteDecision}
                  onCompleteStep={handleCompleteStep}
                />
              </div>
            </main>
          )}

          {activeTab === "security" && (
            <SecurityView
              commsEntries={commsEntries}
              agentSpeaking={agentSpeaking}
              setAgentSpeaking={setAgentSpeaking}
              onAddLog={(newLog) => setCommsEntries((p) => [...p, newLog])}
            />
          )}

          {activeTab === "logistics" && (
            <LogisticsView
              onAddLog={(newLog) => setCommsEntries((p) => [...p, newLog])}
              setAgentSpeaking={setAgentSpeaking}
            />
          )}

          {activeTab === "guests" && (
            <GuestsView
              onAddLog={(newLog) => setCommsEntries((p) => [...p, newLog])}
              setAgentSpeaking={setAgentSpeaking}
            />
          )}
        </section>
      )}

      {/* 5. Bottom Voice Bar (Agent Speech and Chat interface) */}
      <footer className="relative z-10 mt-4 bg-glass-surface rounded-xl border border-glass-border/40 p-4 flex flex-col md:flex-row items-center gap-4">
        
        {/* The glowing mesh Agent Orb */}
        <div className="flex-shrink-0 flex items-center gap-3">
          <motion.div
            animate={{
              scale: isAILending ? [1, 1.15, 1] : [1, 1.05, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              scale: { repeat: Infinity, duration: isAILending ? 1.5 : 4, ease: "easeInOut" },
              rotate: { repeat: Infinity, duration: 15, ease: "linear" }
            }}
            className={`w-12 h-12 rounded-full bg-gradient-to-tr ${getOrbMeshColor()} relative flex items-center justify-center p-0.5 select-none`}
          >
            {/* Inner clean orb core */}
            <div className="w-10 h-10 bg-[#07080c] rounded-full flex items-center justify-center relative">
              <Bot className="w-5 h-5 text-brand-cyan shrink-0" />
            </div>
            
            {/* Pulsing state ring */}
            <div className="absolute inset-0 rounded-full border border-white/5 opacity-50 animate-ping"></div>
          </motion.div>
          
          <div className="select-none">
            <span className="text-[9px] font-mono tracking-widest text-[#8b5cf6] font-bold uppercase flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#8b5cf6]" /> Resident Agent Orb
            </span>
            <h2 className="text-xs font-semibold text-white font-display">
              @Agent_Orb
            </h2>
          </div>
        </div>

        {/* Streaming text bubble */}
        <div className="flex-1 bg-glass-base/70 border border-white/5 rounded-lg p-2.5 min-h-[44px] flex items-center">
          <p className="text-[10px] md:text-xs text-gray-300 italic font-medium leading-relaxed">
            {isAILending ? (
              <span className="flex items-center gap-2 font-mono text-xs text-brand-cyan">
                <SpinnerIcon /> Processing signals. Consulting Gemini 3.5 Flash server-side...
              </span>
            ) : (
              agentSpeaking || "Active listening online. State queries above or tap the stanchion shortcuts below."
            )}
          </p>
        </div>

        {/* Input panel & custom triggers */}
        <div className="w-full md:w-auto flex flex-col gap-2">
          {/* Quick chip queries */}
          <div className="flex flex-wrap gap-1.5 justify-end">
            {activeQuickQuests.slice(0, 3).map((quest, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setUserQuery(quest);
                }}
                className="px-2 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-gray-400 hover:text-white border border-white/5 transition-all text-[8px] font-mono uppercase font-semibold cursor-pointer"
              >
                + {quest}
              </button>
            ))}
          </div>

          {/* Form write input */}
          <form onSubmit={handleSendQuery} className="flex gap-2 w-full md:w-[350px]">
            <input
              type="text"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="Query Agent Orb (e.g., 'Verify CAM_14 backpack anomaly')"
              className="flex-1 bg-glass-base/90 border border-glass-border/40 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-brand-cyan font-mono"
            />
            <button
              type="submit"
              disabled={isAILending || !userQuery.trim()}
              className="px-3.5 py-1.5 rounded-lg bg-brand-cyan hover:bg-brand-cyan/95 text-glass-base font-semibold text-xs transition-all flex items-center justify-center gap-1.5 disabled:opacity-40 select-none cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" /> Send
            </button>
          </form>
        </div>

      </footer>

      {/* Real-time Embedded AI Chat Widget */}
      <AIChatWidget
        matchState={matchState}
        opsPosture={opsPosture}
        currentAnomaly={currentAnomaly}
        weatherText={weatherText}
        commsEntries={commsEntries}
        onAddLog={(newLog) => setCommsEntries((p) => [...p, newLog])}
        isDarkMode={isDarkMode}
      />
    </div>
  );
}

// Inline Spinner icon
function SpinnerIcon() {
  return (
    <svg className="animate-spin h-3.5 w-3.5 text-brand-cyan" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );
}
