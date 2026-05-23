import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { ShieldAlert, Timer, Check, AlertCircle, Volume2, Shield, Radio, Terminal, Cpu } from "lucide-react";

interface SecurityViewProps {
  commsEntries: any[];
  onAddLog: (entry: any) => void;
}

export default function SecurityView({
  commsEntries,
  onAddLog,
}: SecurityViewProps) {
  const [activeStep, setActiveStep] = useState<number>(4); // Step 4 is the PA Script preview in screenshots
  const [isBroadcasted, setIsBroadcasted] = useState<boolean>(false);
  const [secondsActive, setSecondsActive] = useState<number>(42);

  // Active elapsed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsActive((s) => s + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const runbookSteps = [
    {
      id: 1,
      title: "Notify Security Lead",
      desc: "Auto-page sent",
      state: "completed",
    },
    {
      id: 2,
      title: "Dispatch K9 Unit",
      desc: "Unit K9-Alpha ETA 90s",
      state: "completed",
    },
    {
      id: 3,
      title: "Hold Ingress Gates F, G",
      desc: "Turnstiles locked",
      state: "completed",
    },
    {
      id: 4,
      title: "Brief PA: Calm Advisory Script",
      desc: "Agent pending approval to broadcast.",
      state: "active",
      script: "Attention guests in Section 312. We are conducting a routine sweep. Please remain clear of the east stairwell...",
    },
    {
      id: 5,
      title: "EOD Team Assessment",
      desc: "Pending K9 sweep result",
      state: "pending",
    },
  ];

  const handleBroadcast = () => {
    setIsBroadcasted(true);
    setActiveStep(5);
    
    // Add operational logs
    onAddLog({
      id: "sec-pa-" + Date.now(),
      ts: new Date().toLocaleTimeString(),
      speaker: "ops_lead",
      role_color: "amber",
      text: "[PA BROADCAST INITIATED] 'Attention guests in Section 312...' deployed stadium-wide on Section sub-arrays.",
      trace_id: "trx-pa-" + Math.floor(Math.random() * 9000),
    });
  };

  return (
    <div className="flex flex-col gap-4 w-full" id="cordon-security-screen">
      {/* 1. Hot Tactical Threat Banner */}
      <div className="w-full bg-brand-red/10 border border-brand-red/30 rounded-xl p-3 flex justify-between items-center relative overflow-hidden glow-red">
        <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-brand-red"></div>
        <div className="flex items-center gap-3 pl-3 select-none">
          <ShieldAlert className="w-5 h-5 text-brand-red animate-bounce" />
          <div>
            <div className="text-xs font-bold font-display text-white tracking-wide uppercase flex items-center gap-2">
              <span>Incident Registered</span>
              <span className="w-1.5 h-1.5 rounded-full bg-brand-red animate-ping"></span>
            </div>
            <p className="text-[10px] font-mono text-gray-300 mt-0.5">
              Suspicious package reported · Section 312 · row 12 underseat · Arena Core
            </p>
          </div>
        </div>
        <div className="font-mono text-xs text-right pr-2">
          <span className="text-gray-400 mr-2 uppercase text-[10px]">Active Duration</span>
          <span className="text-brand-red font-bold animate-pulse">{formatTimer(secondsActive)}</span>
        </div>
      </div>

      {/* 2. Side-by-Side Canvas/Terminal Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* L1. Left CCTV Terminal Log (3 Cols) */}
        <div className="lg:col-span-3 flex flex-col gap-3">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#ef4444] font-bold flex items-center justify-between">
            <span>Terminal Comms</span>
            <span className="px-1.5 py-0.2 bg-brand-red/15 rounded text-brand-red text-[8px]">LIVE RADAR</span>
          </div>
          
          <div className="bg-glass-surface rounded-xl border border-glass-border/30 h-[380px] p-3 overflow-y-auto space-y-3 font-mono text-[10px]">
            {commsEntries.map((log) => (
              <div key={log.id} className="p-2 bg-glass-base/50 rounded border border-white/5">
                <div className="flex justify-between items-center text-[8px] text-gray-500 mb-0.5">
                  <span>[{log.ts}]</span>
                  <span className="uppercase text-brand-cyan">@{log.speaker}</span>
                </div>
                <p className="text-gray-300 leading-normal">{log.text}</p>
                {log.tool_call && (
                  <div className="mt-1.5 bg-glass-base p-1.5 rounded text-[8px] text-brand-cyan border-l border-brand-cyan/40">
                    <span className="font-bold flex items-center gap-1"><Cpu className="w-2.5 h-2.5" /> TOOL call:</span>
                    <span className="text-gray-400 font-sans">{log.tool_call.name}({JSON.stringify(log.tool_call.args)})</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* C2. Center High-Tech CCTV Camera Viewport (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-3">
          <div className="text-[10px] uppercase font-mono tracking-widest text-brand-cyan font-bold flex items-center justify-between">
            <span>Security Feed Matrix</span>
            <span className="text-gray-500 text-[9px]">LOC: SECTOR_312_RAMP</span>
          </div>

          <div className="relative w-full h-[380px] bg-glass-surface rounded-xl border border-glass-border overflow-hidden glow-red flex flex-col">
            {/* Top camera overlay HUD */}
            <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/80 to-transparent flex justify-between items-center z-10 text-[10px] font-mono font-medium">
              <span className="text-white flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-red animate-pulse"></span>
                CAM 14 · SEC 312
              </span>
              <span className="text-gray-400 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded">
                LATENCY: 42ms
              </span>
            </div>

            {/* Simulated high-end visual CCTV Grid space with turnstiles */}
            <div className="flex-1 relative bg-neutral-950 flex items-center justify-center overflow-hidden">
              
              {/* Scanline Overlay */}
              <div className="absolute inset-0 bg-scanlines pointer-events-none opacity-25 z-0" 
                   style={{ background: "repeating-linear-gradient(0deg, rgba(0,0,0,0.15), rgba(0,0,0,0.15) 1px, transparent 1px, transparent 2px)" }}>
              </div>

              {/* CGI Turnstile/Security Checkpoint drawing inside SVG */}
              <svg viewBox="0 0 400 280" className="w-full h-full max-h-[260px] opacity-75 z-0">
                {/* Floor grids projection space */}
                <path d="M 0,220 L 400,220" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <path d="M 40,220 L 0,280" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <path d="M 120,220 L 80,280" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <path d="M 200,220 L 200,280" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                <path d="M 280,220 L 320,280" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />

                {/* Left side concrete Pillar */}
                <rect x="10" y="80" width="30" height="150" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
                
                {/* Gated security turnstiles */}
                {/* Gate 1 */}
                <rect x="100" y="100" width="12" height="120" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                <line x1="112" y1="140" x2="160" y2="140" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="4" />
                
                {/* Gate 2 */}
                <rect x="200" y="100" width="12" height="120" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                <line x1="212" y1="140" x2="260" y2="140" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="4" />

                {/* Gate 3 */}
                <rect x="300" y="100" width="12" height="120" fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.12)" />
                <line x1="312" y1="140" x2="360" y2="140" stroke="rgba(239, 68, 68, 0.4)" strokeWidth="4" />

                {/* Unattended backpack asset at turnstile 1 */}
                <g transform="translate(130, 160)">
                  {/* Subtle bag block */}
                  <ellipse cx="20" cy="40" rx="14" ry="16" fill="rgba(30, 41, 59, 0.9)" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                  <ellipse cx="14" cy="42" rx="6" ry="12" fill="rgba(15, 23, 42, 0.8)" />
                  <ellipse cx="26" cy="42" rx="6" ry="12" fill="rgba(15, 23, 42, 0.8)" />
                </g>

                {/* Overlay Target alignment bounds */}
                <circle cx="200" cy="140" r="120" fill="none" stroke="rgba(6, 182, 212, 0.05)" strokeWidth="1" strokeDasharray="4 8" />
              </svg>

              {/* HIGH INTENSITY CYAN BOUNDING BOX MATCHING SCREENSHOT EXACTLY */}
              <motion.div
                initial={{ opacity: 0.8 }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                className="absolute w-[110px] h-[100px] border-2 border-brand-red/90 rounded z-10 p-1 flex flex-col justify-between"
                style={{ top: "145px", left: "128px" }}
              >
                <div className="absolute top-0 left-0 bg-brand-red text-white text-[8px] font-mono font-bold uppercase px-1 py-0.2 select-none whitespace-nowrap">
                  ANOMALY: UNATTENDED
                </div>
                {/* Bounding box corner ticks */}
                <div className="w-2 h-2 border-t-2 border-l-2 border-brand-red absolute top-[-2px] left-[-2px]"></div>
                <div className="w-2 h-2 border-t-2 border-r-2 border-brand-red absolute top-[-2px] right-[-2px]"></div>
                <div className="w-2 h-2 border-b-2 border-l-2 border-brand-red absolute bottom-[-2px] left-[-2px]"></div>
                <div className="w-2 h-2 border-b-2 border-r-2 border-brand-red absolute bottom-[-2px] right-[-2px]"></div>
              </motion.div>
            </div>

            {/* Bottom HUD metadata telemetry */}
            <div className="p-2.5 bg-glass-base border-t border-glass-border/30 grid grid-cols-3 text-[9px] font-mono text-gray-500">
              <div>
                HOUSED COMPONENT: <span className="text-white">Radars V4</span>
              </div>
              <div className="text-center">
                REC RATE: <span className="text-brand-red font-bold">24 FPS</span>
              </div>
              <div className="text-right">
                RESOLUTION: <span className="text-brand-cyan">1080P UHD</span>
              </div>
            </div>
          </div>
        </div>

        {/* R3. Right Sequential Response Runbook (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          <div className="text-[10px] uppercase font-mono tracking-widest text-[#8b5cf6] font-bold flex items-center justify-between">
            <span>Response Runbook</span>
            <span className="text-gray-500 text-[9px]">SOP LIST</span>
          </div>

          <div className="space-y-3">
            {runbookSteps.map((step) => {
              const capStepActive = step.id === activeStep && !isBroadcasted;
              const capStepCompleted = step.id < activeStep || (isBroadcasted && step.id === 4);
              const capStepPending = step.id > activeStep && !(isBroadcasted && step.id === 5);

              return (
                <div
                  key={step.id}
                  className={`p-3 rounded-lg border transition-all duration-300 relative ${
                    capStepActive
                      ? "border-brand-cyan bg-[#06b6d4]/5 glow-cyan"
                      : capStepCompleted
                      ? "border-emerald-500/15 bg-emerald-950/5 opacity-55"
                      : "border-white/5 bg-glass-surface"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2.5 items-start">
                      {/* Left icon circle */}
                      <div className="mt-0.5 select-none">
                        {capStepCompleted ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center">
                            <Check className="w-2.5 h-2.5 text-emerald-400" strokeWidth={3} />
                          </div>
                        ) : capStepActive ? (
                          <div className="w-4 h-4 rounded-full border border-brand-cyan flex items-center justify-center bg-brand-cyan/20 animate-pulse">
                            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></span>
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-gray-600 flex items-center justify-center"></div>
                        )}
                      </div>

                      <div>
                        <h4 className={`text-xs font-semibold text-white ${capStepCompleted ? "line-through text-gray-400 font-medium" : ""}`}>
                          {step.title}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-sans leading-normal mt-0.5">
                          {step.desc}
                        </p>
                      </div>
                    </div>

                    <span className="text-[8px] font-mono text-gray-500">0{step.id}</span>
                  </div>

                  {/* Active Script Preview Drawer matching PICTURE exactly */}
                  {step.id === 4 && capStepActive && (
                    <div className="mt-3 bg-glass-base rounded p-2 border border-brand-cyan/20 text-[9px] font-mono relative">
                      <div className="text-brand-cyan flex items-center gap-1 font-semibold text-[8px] uppercase mb-1.5">
                        <Volume2 className="w-3 h-3 text-brand-cyan" /> PA BROADCAST PREVIEW:
                      </div>
                      <div className="text-gray-300 italic font-sans pl-1.5 border-l border-brand-cyan/40 leading-relaxed text-[10px]">
                        "{step.script}"
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* 3. Persistent bottom alert action feedback block */}
      <div className="w-full bg-[#1e1b4b]/60 border border-[#8b5cf6]/35 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4 glow-violet mt-2">
        <div className="flex items-center gap-3">
          {/* Pulsing purple orb */}
          <div className="w-5 h-5 rounded-full bg-[#8b5cf6] flex items-center justify-center relative select-none">
            <Volume2 className="w-3 h-3 text-white" />
            <div className="absolute inset-0 rounded-full border border-[#8b5cf6] animate-ping"></div>
          </div>
          <div>
            <h3 className="text-xs font-semibold text-white font-mono">
              @Agent_Orb Proposal (Incident Containment)
            </h3>
            <p className="text-[11px] text-gray-300 leading-relaxed font-sans mt-0.5">
              Containment perimeter set. K9 ETA 90 seconds. I have drafted a calm-advisory PA script — review or auto-broadcast in 15s?
            </p>
          </div>
        </div>

        <div className="flex gap-2 font-mono text-[10px]">
          <button className="px-3 py-1.5 rounded bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-bold tracking-wide transition-all cursor-pointer">
            REVIEW SCRIPT
          </button>
          <button
            onClick={handleBroadcast}
            disabled={isBroadcasted}
            className={`px-4 py-1.5 rounded font-bold tracking-wide transition-all cursor-pointer ${
              isBroadcasted
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                : "bg-brand-cyan text-glass-base hover:bg-brand-cyan/90 border border-brand-cyan/30"
            }`}
          >
            {isBroadcasted ? "BROADCAST SUCCESS" : "AUTO-BROADCAST"}
          </button>
        </div>
      </div>
    </div>
  );
}
