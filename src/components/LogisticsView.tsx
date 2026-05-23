import React, { useState } from "react";
import { motion } from "motion/react";
import { Users2, ArrowRightLeft, ShieldAlert, CheckCircle2, ChevronRight, Compass, Check, HelpCircle, Info } from "lucide-react";

interface LogisticsViewProps {
  onAddLog: (entry: any) => void;
}

export default function LogisticsView({ onAddLog }: LogisticsViewProps) {
  const [subTab, setSubTab] = useState<string>("flow");
  const [diverted, setDiverted] = useState<boolean>(false);
  const [throttled, setThrottled] = useState<boolean>(false);

  // Raw gates state data mimicking the screenshot list perfectly
  const gatesData = [
    {
      id: "A",
      name: "Gate A Inflow",
      scanRate: "118/min",
      queueSize: 420,
      status: "SURGE",
      bars: [3, 4, 6, 8, 10, 12, 16],
    },
    {
      id: "B",
      name: "Gate B Inflow",
      scanRate: "85/min",
      queueSize: 112,
      status: "NOMINAL",
      bars: [3, 4, 3, 5, 4, 5, 3],
    },
    {
      id: "C",
      name: "Gate C Inflow",
      scanRate: "78/min",
      queueSize: 84,
      status: "NOMINAL",
      bars: [2, 3, 4, 2, 3, 2, 4],
    },
    {
      id: "D",
      name: "Gate D Inflow",
      scanRate: "110/min",
      queueSize: 240,
      status: "WATCH",
      bars: [4, 5, 6, 5, 8, 7, 9],
    },
    {
      id: "E",
      name: "Gate E Inflow",
      scanRate: diverted ? "42/min" : "92/min",
      queueSize: diverted ? 64 : 310,
      status: diverted ? "NOMINAL" : "NOMINAL",
      bars: diverted ? [2, 1, 1, 1, 2, 1, 2] : [4, 5, 6, 8, 9, 8, 7],
    },
    {
      id: "F",
      name: "Gate F Inflow",
      scanRate: diverted ? "134/min" : "68/min",
      queueSize: diverted ? 280 : 124,
      status: diverted ? "SURGE" : "NOMINAL",
      bars: diverted ? [4, 6, 8, 10, 12, 14, 18] : [2, 3, 2, 2, 3, 4, 3],
    },
  ];

  const handleAcceptAll = () => {
    setDiverted(true);
    onAddLog({
      id: "log-reroute-" + Date.now(),
      ts: new Date().toLocaleTimeString(),
      speaker: "system",
      role_color: "cyan",
      text: "[ROUTING EXECUTED] Diverted 1,200 East Concourse fans towards Gate F/North Ramp structure. Signage live.",
      trace_id: "trx-rt-" + Math.floor(Math.random() * 8000),
    });
  };

  const handleThrottle = () => {
    setThrottled(true);
    onAddLog({
      id: "log-throttle-" + Date.now(),
      ts: new Date().toLocaleTimeString(),
      speaker: "logistics_03",
      role_color: "cyan",
      text: "[STEWARD NOTIFIED] Throttling Gate E turnstile ingress frequency parameters by 30% to ease pressure.",
      trace_id: "trx-th-" + Math.floor(Math.random() * 8000),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full" id="cordon-logistics-screen">
      
      {/* 1. Interactive Gates Checklist (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        <div className="text-[10px] uppercase font-mono tracking-widest text-[#06b6d4] font-bold flex justify-between items-center">
          <span>GATES MATRIX</span>
          <span className="text-gray-500 text-[9px]">LIVE METRICS</span>
        </div>

        <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
          {gatesData.map((gate) => {
            const isSurge = gate.status === "SURGE";
            const isWatch = gate.status === "WATCH";
            
            return (
              <div
                key={gate.id}
                className={`p-3 rounded-lg border bg-glass-surface flex gap-3 items-center justify-between transition-all hover:bg-white/[0.02] border-white/5 relative`}
              >
                {/* Active strip */}
                {isSurge && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-red"></div>
                )}
                {isWatch && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-amber"></div>
                )}

                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg border flex items-center justify-center font-display font-bold text-lg ${
                    isSurge
                      ? "bg-brand-red/10 border-brand-red/30 text-brand-red"
                      : isWatch
                      ? "bg-brand-amber/10 border-brand-amber/30 text-brand-amber"
                      : "bg-white/5 border-white/10 text-gray-300"
                  }`}>
                    {gate.id}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-white">{gate.name}</span>
                      <span className={`text-[8px] font-mono font-bold px-1 rounded ${
                        isSurge
                          ? "bg-brand-red/15 text-brand-red"
                          : isWatch
                          ? "bg-brand-amber/15 text-brand-amber"
                          : "bg-emerald-500/15 text-emerald-400"
                      }`}>
                        {gate.status}
                      </span>
                    </div>
                    
                    <div className="flex gap-4 text-[10px] text-gray-400 font-mono mt-1">
                      <span>Rate: <strong className="text-white">{gate.scanRate}</strong></span>
                      <span>Queue: <strong className="text-white">{gate.queueSize}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Sparkling mini bar chart mapping to mockup representation */}
                <div className="flex items-end gap-0.5 h-7">
                  {gate.bars.map((bar, bidx) => (
                    <div
                      key={bidx}
                      className={`w-1 rounded-t-sm transition-all`}
                      style={{
                        height: `${bar * 6}%`,
                        backgroundColor: isSurge
                          ? "rgba(239, 68, 68, 0.75)"
                          : isWatch
                          ? "rgba(245, 158, 11, 0.75)"
                          : "rgba(6, 182, 212, 0.75)",
                      }}
                    ></div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Centre High-Tech Flow Map Canvas (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-[#06b6d4] font-bold">
          {/* Sub Navigation */}
          <div className="flex gap-2">
            {["flow", "density", "cameras"].map((t) => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                className={`px-2.5 py-0.5 rounded-md uppercase font-mono text-[9px] transition-all cursor-pointer ${
                  subTab === t
                    ? "bg-[#06b6d4]/15 text-brand-cyan border border-[#06b6d4]/30"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <span className="flex items-center gap-1 bg-[#06b6d4]/10 text-brand-cyan px-2 py-0.5 rounded text-[8px] font-mono font-semibold uppercase select-none">
            <Compass className="w-2.5 h-2.5 animate-spin" style={{ animationDuration: "14s" }} />
            LOC: STADIUM_MAIN
          </span>
        </div>

        <div className="relative w-full h-[380px] bg-glass-surface rounded-xl border border-glass-border overflow-hidden glow-cyan flex flex-col">
          {/* Main Map Arena Canvas render inside SVG */}
          <div className="flex-1 relative flex items-center justify-center p-4">
            <svg viewBox="0 0 400 300" className="w-full h-full max-h-[280px]">
              {/* Polar grids design */}
              <circle cx="200" cy="150" r="130" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <circle cx="200" cy="150" r="100" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <circle cx="200" cy="150" r="70" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              
              {/* Radial tick bounds */}
              <line x1="200" y1="20" x2="200" y2="280" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="2 4" />
              <line x1="70" y1="150" x2="330" y2="150" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" strokeDasharray="2 4" />

              {/* Outer boundary stadium ellipse shape */}
              <ellipse cx="200" cy="150" rx="140" ry="110" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="2" />
              
              {/* Heat congestion zone if not deactivated */}
              {!diverted && (
                <ellipse cx="280" cy="190" rx="40" ry="30" fill="rgba(239, 68, 68, 0.08)" stroke="rgba(239, 68, 68, 0.2)" strokeWidth="1" />
              )}

              {/* Waypoint point named "NORTH RAMP" exactly as shown on high resolution mockup screenshot */}
              <g transform="translate(260, 90)">
                <circle cx="0" cy="0" r="4" fill="#06b6d4" />
                <circle cx="0" cy="0" r="10" fill="none" stroke="#06b6d4" strokeWidth="1" className="animate-ping" style={{ animationDuration: "3s" }} />
                <text x="10" y="3" fill="#94a3b8" fontSize="8px" fontFamily="var(--font-mono)" className="select-none pointer-events-none">
                  NORTH RAMP
                </text>
              </g>

              {/* Re-route flow dots matching the dotted line on the picture */}
              <motion.path
                d="M 120,220 Q 200,160 256,94"
                fill="none"
                stroke="#06b6d4"
                strokeWidth="2.5"
                strokeDasharray="6 4"
                animate={{ strokeDashoffset: diverted ? -20 : 0 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />

              {/* General stadium ingress indicators */}
              <path d="M 80,180 A 140,110 0 0,0 120,220" stroke="rgba(245, 158, 11, 0.6)" strokeWidth="4" strokeDasharray="2 4" />
            </svg>

            {/* Bottom details Overlay Box */}
            <div className="absolute bottom-3 left-3 bg-glass-base/90 p-2.5 rounded-lg border border-glass-border/40 text-[9px] font-mono text-gray-400 space-y-1 select-none">
              <span className="text-white font-semibold text-[10px] block mb-1">STADIUM CO-ORDINATOR</span>
              <div>TRANSIT CHANNELS: <span className="text-brand-cyan">A, F ACTIVE</span></div>
              <div>DIVERT RATIONALE: <span className="text-brand-cyan">EAST TO NORTH CORES</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Right Agent Actions Decisions (3 Cols) */}
      <div className="lg:col-span-3 flex flex-col gap-3">
        <div className="text-[10px] uppercase font-mono tracking-widest text-[#8b5cf6] font-bold flex justify-between items-center">
          <span>AGENT DECISION</span>
          <span className="text-gray-500 text-[9px]">SOP RECOMMEND</span>
        </div>

        <div className="space-y-3.5">
          {/* Card 1: Divert Route */}
          <div className="p-3.5 rounded-xl border border-brand-cyan/20 bg-glass-surface relative overflow-hidden glow-cyan">
            <div className="absolute top-3 right-3 text-[9px] font-mono text-[#06b6d4] font-bold">
              0.92 CONFIDENCE
            </div>
            
            <div className="text-[8px] font-mono uppercase bg-brand-cyan/15 text-brand-cyan font-bold px-1.5 py-0.2 rounded w-fit mb-2">
              HIGH IMPACT
            </div>

            <h3 className="text-xs font-semibold text-white leading-snug">
              Re-route 1,200 fans East Concourse → North Ramp
            </h3>
            
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed mt-1.5">
              Reduces Gate E projected load by 38% before peak stall point.
            </p>

            <div className="text-[8px] text-gray-500 font-mono mt-2 flex items-center gap-1">
              <Info className="w-3 h-3 text-gray-600 shrink-0" />
              <span>Gemini forecast, 10-min horizon</span>
            </div>

            <button
              onClick={handleAcceptAll}
              disabled={diverted}
              className={`mt-3.5 w-full py-1.5 rounded font-mono text-[10px] font-bold tracking-wide transition-all uppercase cursor-pointer ${
                diverted
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-brand-cyan text-glass-base hover:bg-cyan-400"
              }`}
            >
              {diverted ? "PROPOSAL EXECUTED" : "ACCEPT ALL"}
            </button>
          </div>

          {/* Card 2: Throttle Gate */}
          <div className="p-3.5 rounded-xl border border-glass-border/30 bg-glass-surface relative overflow-hidden">
            <div className="absolute top-3 right-3 text-[9px] font-mono text-brand-amber font-bold">
              0.84 CONFIDENCE
            </div>

            <div className="text-[8px] font-mono uppercase bg-white/5 text-gray-400 px-1.5 py-0.2 rounded w-fit mb-2">
              MITIGATION
            </div>

            <h3 className="text-xs font-semibold text-white leading-snug">
              Throttle Gate E inflow by 30% for 4 min
            </h3>

            <p className="text-[10px] text-gray-400 font-sans leading-relaxed mt-1.5">
              Prevents full bottleneck gridlock. Requires manual security deployment.
            </p>

            <div className="mt-3.5 flex gap-2 font-mono text-[9px]">
              <button
                onClick={handleThrottle}
                disabled={throttled}
                className={`flex-1 py-1.5 rounded font-bold transition-all uppercase cursor-pointer ${
                  throttled
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                }`}
              >
                {throttled ? "DONE" : "ACCEPT"}
              </button>
              <button className="px-2 py-1.5 rounded bg-transparent text-gray-500 border border-white/5 hover:border-white/10 transition-all uppercase cursor-pointer">
                OVERRIDE
              </button>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
