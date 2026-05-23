import React, { useState } from "react";
import { motion } from "motion/react";
import { MatchState, Anomaly } from "../types";
import { MapPin, ShieldAlert, Users, Info, Compass, Radio, Activity } from "lucide-react";

interface StadiumViewProps {
  matchState: MatchState;
  anomaly: Anomaly | null;
  activeFilter: string | null;
  onSelectGate: (gateName: string) => void;
}

export default function StadiumView({ matchState, anomaly, activeFilter, onSelectGate }: StadiumViewProps) {
  const [selectedPin, setSelectedPin] = useState<string | null>(null);
  const [isRadarActive, setIsRadarActive] = useState<boolean>(true);

  // Determine current active posture overlays
  const isAnomalyActive = anomaly && anomaly.camera === "CAM_14";
  const isBottleneckActive = matchState.status === "innings_break";
  const isRainActive = matchState.status === "rain_hold" || matchState.phase === "death";

  // Dynamic context-aware Zone Stats selector
  const getZoneStats = () => {
    // If it is in active play, check phase for specific density levels (e.g. death overs preparation)
    if (matchState.status === "live" || matchState.status === "rain_hold" || matchState.status === "strategic_timeout") {
      if (matchState.phase === "death") {
        return [
          { name: "North Zone (VIP Ingress)", gates: "Gates A-D", occupancy: 75, density: "Preparing Egress", status: "Operational Prep", color: "text-emerald-400" },
          { name: "East Zone (General Deck)", gates: "Gates E-I", occupancy: 90, density: "Staggered Staging", status: "Heavy Standby", color: "text-amber-400 font-semibold" },
          { name: "South Zone (Club Pavilion)", gates: "Gates J-L", occupancy: 92, density: "Lobbies Packed", status: "Steadier", color: "text-amber-400 font-semibold" },
          { name: "West Zone (Metro Link LINK)", gates: "Gates M-R", occupancy: 82, density: "Egress Standby", status: "Pre-positioned", color: "text-brand-cyan font-bold" },
        ];
      }
    }

    switch (matchState.status) {
      case "pre_match":
        return [
          { name: "North Zone (VIP Ingress)", gates: "Gates A-D", occupancy: 35, density: "Normal", status: "Nominal", color: "text-emerald-400" },
          { name: "East Zone (General Deck)", gates: "Gates E-I", occupancy: 78, density: "Dense Inflow", status: "Active Ingress", color: "text-amber-400 font-semibold" },
          { name: "South Zone (Club Pavilion)", gates: "Gates J-L", occupancy: 42, density: "Steady", status: "Nominal", color: "text-emerald-400" },
          { name: "West Zone (Metro Link Link)", gates: "Gates M-R", occupancy: 65, density: "Active Inflow", status: "Nominal", color: "text-brand-cyan" },
        ];
      case "innings_break":
        return [
          { name: "North Zone (VIP Ingress)", gates: "Gates A-D", occupancy: 85, density: "Heavy Transit", status: "Clearance Active", color: "text-amber-400 font-semibold" },
          { name: "East Zone (General Deck)", gates: "Gates E-I", occupancy: 96, density: "Overload (112%)", status: "Critical Crowding", color: "text-brand-red font-bold animate-pulse" },
          { name: "South Zone (Club Pavilion)", gates: "Gates J-L", occupancy: 88, density: "Dense Concourse", status: "Monitoring", color: "text-amber-400 font-semibold" },
          { name: "West Zone (Metro Link LINK)", gates: "Gates M-R", occupancy: 70, density: "Moderate Flow", status: "Nominal", color: "text-emerald-400" },
        ];
      case "super_over":
        return [
          { name: "North Zone (VIP Ingress)", gates: "Gates A-D", occupancy: 75, density: "Preparing Egress", status: "Operational Prep", color: "text-emerald-400" },
          { name: "East Zone (General Deck)", gates: "Gates E-I", occupancy: 90, density: "Staggered Staging", status: "Heavy Standby", color: "text-amber-400 font-semibold" },
          { name: "South Zone (Club Pavilion)", gates: "Gates J-L", occupancy: 92, density: "Lobbies Packed", status: "Steadier", color: "text-amber-400 font-semibold" },
          { name: "West Zone (Metro Link LINK)", gates: "Gates M-R", occupancy: 82, density: "Egress Standby", status: "Pre-positioned", color: "text-brand-cyan font-bold" },
        ];
      case "done":
        return [
          { name: "North Zone (VIP Outgress)", gates: "Gates A-D", occupancy: 12, density: "Dispersed", status: "Logs Archiving", color: "text-gray-400" },
          { name: "East Zone (General Deck)", gates: "Gates E-I", occupancy: 18, density: "Dispersed", status: "Area Clear", color: "text-gray-400" },
          { name: "South Zone (Club Pavilion)", gates: "Gates J-L", occupancy: 8, density: "Nominal", status: "Stands Empty", color: "text-gray-400" },
          { name: "West Zone (Metro Link LINK)", gates: "Gates M-R", occupancy: 94, density: "Egress Peak Speed", status: "Discharging Feed", color: "text-[#8b5cf6] font-bold animate-pulse" },
        ];
      default:
        return [
          { name: "North Zone (VIP Ingress)", gates: "Gates A-D", occupancy: 50, density: "Nominal", status: "Nominal", color: "text-emerald-400" },
          { name: "East Zone (General Deck)", gates: "Gates E-I", occupancy: 82, density: "Heavy Flow", status: "Monitoring", color: "text-brand-cyan" },
          { name: "South Zone (Club Pavilion)", gates: "Gates J-L", occupancy: 61, density: "Steady", status: "Nominal", color: "text-emerald-400" },
          { name: "West Zone (Metro Link LINK)", gates: "Gates M-R", occupancy: 74, density: "Steady Outflow", status: "Nominal", color: "text-brand-cyan" },
        ];
    }
  };

  // Coordinates for interactive markers on Narendra Modi Stadium layout
  const pins = [
    {
      id: "sec-312",
      name: "Section 312 (Upper Tier)",
      x: 380,
      y: 110,
      type: "anomaly",
      description: isAnomalyActive ? "CCTV Anomaly flagging - Unattended black backpack under seat row 12." : "All seats clear. Normal decibel levels.",
      active: isAnomalyActive,
    },
    {
      id: "gate-e",
      name: "Gate E Corridor",
      x: 480,
      y: 280,
      type: "bottleneck",
      description: isBottleneckActive ? "Critical Bottleneck alert: Ticketing bottleneck at 112% capacity. Alternate route open." : "Normal transit. Peak expected at Innings Break.",
      active: isBottleneckActive,
    },
    {
      id: "gate-f",
      name: "Gate F Outer Ramp",
      x: 520,
      y: 180,
      type: "logistic",
      description: "Recommended diversion outlet. Currently operates at 41% density, very fast flow.",
      active: isBottleneckActive,
    },
    {
      id: "gate-a",
      name: "Gate A (Main VIP)",
      x: 120,
      y: 230,
      type: "security",
      description: "VIP and Media ingress vector. Protected stance active.",
      active: false,
    },
    {
      id: "pitch",
      name: "Active Match Sphere",
      x: 320,
      y: 190,
      type: "match",
      description: `Pitch status: ${matchState.score.runs}/${matchState.score.wickets} in ${matchState.score.overs} overs. Stadium illumination at 100%.`,
      active: true,
    }
  ];

  return (
    <div className="relative w-full h-auto bg-glass-surface rounded-xl border border-glass-border overflow-hidden glow-cyan flex flex-col transition-all duration-300" id="cordon-stadium-canvas">
      {/* HUD Corner Accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-brand-cyan opacity-60"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-brand-cyan opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-brand-cyan opacity-60"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-brand-cyan opacity-60"></div>

      {/* Top Banner / Legend / Live radar activation Switch */}
      <div className="p-3 bg-glass-base/90 border-b border-glass-border flex justify-between items-center text-xs">
        <span className="font-display font-semibold uppercase tracking-wider text-brand-cyan flex items-center gap-1.5">
          <Compass className={`w-3.5 h-3.5 ${isRadarActive ? "animate-spin" : ""}`} style={{ animationDuration: isRadarActive ? "6s" : "0s" }} /> 
          Arena Telemetry Feed
        </span>
        <div className="flex items-center gap-2">
          {/* Real-time Radar switch */}
          <button
            onClick={() => setIsRadarActive(!isRadarActive)}
            className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase transition-all tracking-wider cursor-pointer border ${
              isRadarActive
                ? "bg-brand-cyan/20 text-brand-cyan border-brand-cyan glow-cyan"
                : "bg-white/[0.02] text-gray-400 border-white/10 hover:text-white"
            }`}
          >
            Live Radar: {isRadarActive ? "ACTIVE SCAN" : "PAUSED"}
          </button>
          <div className="hidden sm:flex gap-4 text-[10px] text-gray-400 font-mono items-center ml-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-cyan inline-block"></span> Nominal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-brand-amber inline-block animate-pulse"></span> Warning
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 relative flex items-center justify-center p-4">
        {/* SVG Stadium Map */}
        <svg viewBox="0 0 640 380" className="w-full h-full max-h-[300px]" style={{ transition: "all 0.5s ease" }}>
          {/* SVG definitions for clipping boundary and radial glows */}
          <defs>
            <clipPath id="stadium-ellipse-clip">
              <ellipse cx="320" cy="190" rx="270" ry="150" />
            </clipPath>
            <radialGradient id="radar-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(6, 182, 212, 0)" />
              <stop offset="100%" stopColor="rgba(6, 182, 212, 0.12)" />
            </radialGradient>
          </defs>

          {/* Active sweeping high-tech Radar scanner overlays restricted inside stadium frame */}
          {isRadarActive && (
            <g clipPath="url(#stadium-ellipse-clip)">
              {/* Radar center backglow */}
              <ellipse cx="320" cy="190" rx="270" ry="150" fill="url(#radar-glow)" />

              {/* Laser sweep rotational coordinate line */}
              <motion.g
                transform="translate(320, 190)"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 4.8, ease: "linear" }}
              >
                <line x1="0" y1="0" x2="270" y2="0" stroke="rgba(6, 182, 212, 0.45)" strokeWidth="2.5" />
                <polygon points="0,0 270,0 263,-40 245,-80 215,-115" fill="rgba(6, 182, 212, 0.12)" />
                <polygon points="0,0 215,-115 175,-145" fill="rgba(6, 182, 212, 0.05)" />
                
                {/* Active vector tracking beacon dots */}
                <circle cx="265" cy="0" r="4" fill="#22d3ee" className="animate-ping" />
              </motion.g>
            </g>
          )}

          {/* Main Stadium Outer Ring Frame */}
          <ellipse
            cx="320"
            cy="190"
            rx="270"
            ry="150"
            fill="none"
            stroke="rgba(6, 182, 212, 0.15)"
            strokeWidth="3"
          />

          {/* Stadium Inner Concourse Ring */}
          <ellipse
            cx="320"
            cy="190"
            rx="220"
            ry="110"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeWidth="20"
            className="cursor-pointer hover:stroke-white/10 transition-colors"
          />

          {/* Heatmap overlay for Innings Break corridor congestion */}
          {isBottleneckActive && (
            <motion.ellipse
              cx="480"
              cy="230"
              rx="60"
              ry="45"
              fill="rgba(245, 158, 11, 0.15)"
              stroke="rgba(245, 158, 11, 0.4)"
              strokeWidth="2"
              initial={{ scale: 0.8, opacity: 0.4 }}
              animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />
          )}

          {/* Heatmap overlay for Section 312 unattended backpack */}
          {isAnomalyActive && (
            <motion.ellipse
              cx="380"
              cy="120"
              rx="40"
              ry="25"
              fill="rgba(239, 68, 68, 0.2)"
              stroke="rgba(239, 68, 68, 0.6)"
              strokeWidth="2.5"
              initial={{ scale: 0.9, opacity: 0.5 }}
              animate={{ scale: [0.9, 1.2, 0.9], opacity: [0.5, 0.9, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
            />
          )}

          {/* General stadium structures & tier segments */}
          {/* East Stand */}
          <path d="M 500,140 A 240,130 0 0,1 500,240" fill="none" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="15" />
          {/* West Stand */}
          <path d="M 140,140 A 240,130 0 0,0 140,240" fill="none" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="15" />
          {/* North Stand */}
          <path d="M 190,95 A 240,130 0 0,1 450,95" fill="none" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="15" />
          {/* South Stand */}
          <path d="M 190,285 A 240,130 0 0,0 450,285" fill="none" stroke="rgba(255, 255, 255, 0.07)" strokeWidth="15" />

          {/* Active wind/rain vector overlays */}
          {isRainActive && (
            <motion.g
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 20, opacity: [0, 0.6, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
              stroke="rgba(6, 182, 212, 0.5)"
              strokeWidth="1.5"
            >
              <line x1="150" y1="80" x2="190" y2="100" />
              <line x1="300" y1="50" x2="340" y2="70" strokeDasharray="3" />
              <line x1="450" y1="80" x2="490" y2="100" />
              <line x1="200" y1="300" x2="240" y2="320" />
            </motion.g>
          )}

          {/* Core Central Cricket Field Overlay */}
          <ellipse
            cx="320"
            cy="190"
            rx="120"
            ry="65"
            fill="rgba(16, 185, 129, 0.1)"
            stroke="rgba(16, 185, 129, 0.4)"
            strokeWidth="2.5"
          />

          {/* Cricket Pitch Line */}
          <line
            x1="300"
            y1="190"
            x2="340"
            y2="190"
            stroke="rgba(245, 158, 11, 0.8)"
            strokeWidth="4"
          />

          {/* Connection vectors between active gates if bottleneck is routed */}
          {isBottleneckActive && (
            <motion.path
              d="M 460,260 Q 520,240 510,195"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="3.5"
              strokeDasharray="6 4"
              animate={{ strokeDashoffset: -12 }}
              transition={{ repeat: Infinity, ease: "linear", duration: 1.2 }}
            />
          )}

          {/* Render interactive coordinate pins */}
          {pins.map((pin) => {
            const isSelected = selectedPin === pin.id;
            const markerColor =
              pin.id === "sec-312" && isAnomalyActive
                ? "#ef4444"
                : pin.id === "gate-e" && isBottleneckActive
                ? "#f59e0b"
                : pin.id === "gate-f" && isBottleneckActive
                ? "#22d3ee" // active routing target color
                : "#06b6d4";

            return (
              <g
                key={pin.id}
                className="cursor-pointer"
                onClick={() => {
                  setSelectedPin(isSelected ? null : pin.id);
                  if (pin.id.startsWith("gate")) {
                    onSelectGate(pin.name);
                  }
                }}
              >
                {/* Ring pulsing effect if active warning */}
                {pin.active && (
                  <circle
                    cx={pin.x}
                    cy={pin.y}
                    r={isSelected ? 18 : 12}
                    fill="none"
                    stroke={markerColor}
                    strokeWidth="1.5"
                  >
                    <animate
                      attributeName="r"
                      values="6;22;6"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="opacity"
                      values="0.4;0.9;0.4"
                      dur="2s"
                      repeatCount="indefinite"
                    />
                  </circle>
                )}

                {/* Main pin circle */}
                <circle
                  cx={pin.x}
                  cy={pin.y}
                  r={isSelected ? 8 : 5}
                  fill={markerColor}
                  stroke="#07080c"
                  strokeWidth="1.5"
                  className="transition-all duration-300 hover:r-10"
                />

                {/* Pin labels (abbreviated) */}
                <text
                  x={pin.x}
                  y={pin.y - (isSelected ? 12 : 9)}
                  textAnchor="middle"
                  fill="#94a3b8"
                  fontSize="8px"
                  fontFamily="var(--font-mono)"
                  className="select-none bg-glass-base pointer-events-none"
                >
                  {pin.id.toUpperCase()}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Floating details popup box when a pin is selected */}
        {selectedPin && (
          <div className="absolute bottom-3 left-3 right-3 glass-card p-3 rounded-lg border border-glass-border/30 z-20 flex gap-2.5 items-start">
            {pins.find(p => p.id === selectedPin)?.type === "anomaly" ? (
              <ShieldAlert className="w-5 h-5 text-brand-red flex-shrink-0 mt-0.5 animate-bounce" />
            ) : pins.find(p => p.id === selectedPin)?.type === "bottleneck" ? (
              <Users className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5" />
            ) : (
              <Info className="w-5 h-5 text-brand-cyan flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <h4 className="text-xs font-semibold font-display text-white">
                {pins.find(p => p.id === selectedPin)?.name}
              </h4>
              <p className="text-[10px] text-gray-300 mt-1 leading-relaxed">
                {pins.find(p => p.id === selectedPin)?.description}
              </p>
            </div>
            <button
              className="text-[10px] uppercase font-mono text-gray-400 hover:text-white border border-white/10 px-1.5 py-0.5 rounded transition-all"
              onClick={() => setSelectedPin(null)}
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Real-time Zone Control Stats Deck */}
      <div className="bg-glass-base/65 border-t border-glass-border/30 p-3 text-xs font-mono select-none">
        <div className="px-1 pb-2 pt-0.5 flex justify-between items-center border-b border-white/5 mb-2.5">
          <span className="text-[9px] text-[#8b5cf6] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan animate-pulse"></span>
            ACTIVE STADIUM QUADRANTS (ZONE STATS)
          </span>
          <span className="text-[8px] text-gray-500 uppercase tracking-widest flex items-center gap-1">
            <Radio className="w-2.5 h-2.5 animate-pulse text-brand-cyan" /> IoT Radar synchronized
          </span>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 px-0.5">
          {getZoneStats().map((zone, i) => {
            const isCritical = zone.status.includes("Critical") || zone.status.includes("Overload");
            return (
              <div 
                key={i} 
                className="bg-white/[0.01] border border-white/5 rounded-lg p-2.5 flex flex-col gap-1 hover:border-brand-cyan/20 hover:bg-white/[0.02] transition-all duration-200"
              >
                <div className="flex justify-between items-start gap-1">
                  <span className="text-[10px] font-bold text-gray-200 truncate uppercase" title={zone.name}>
                    {zone.name.split(" (")[0]}
                  </span>
                  <span className={`text-[8px] font-bold px-1 rounded uppercase tracking-wider ${
                    isCritical ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {zone.status.replace("Ingress", "In")}
                  </span>
                </div>
                <div className="text-[9px] text-gray-400 font-mono mt-0.5 flex items-center justify-between">
                  <span>Gates:</span> 
                  <span className="text-gray-300 font-semibold">{zone.gates}</span>
                </div>
                
                {/* Dynamic progress indicators */}
                <div className="mt-1.5 flex flex-col gap-1">
                  <div className="flex justify-between text-[8px] text-gray-500 font-mono">
                    <span>Occupancy:</span>
                    <span className="text-gray-300 font-bold">{zone.occupancy}%</span>
                  </div>
                  <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        zone.occupancy > 90 ? "bg-red-500" : zone.occupancy > 75 ? "bg-amber-500" : "bg-cyan-500"
                      }`}
                      style={{ width: `${zone.occupancy}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="text-[9px] flex justify-between items-center mt-1.5 pt-1.5 border-t border-white/5 font-mono">
                  <span className="text-gray-500 text-[8px]">Transit Density:</span>
                  <span className={`font-semibold text-[9px] ${zone.color}`}>{zone.density}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating posture control badges at bottom of Stadium View */}
      <div className="grid grid-cols-3 bg-glass-base border-t border-glass-border/40 text-[10px] font-mono select-none">
        <div className="p-2 border-r border-glass-border/20 text-center flex flex-col justify-center">
          <span className="text-gray-500 uppercase">Stadium Noise</span>
          <span className="text-white font-bold max-sm:text-[8px]">
            {matchState.phase === "powerplay" ? "118 db (PEAK)" : matchState.phase === "death" ? "121 db (EXTREME)" : "94 db (NOMINAL)"}
          </span>
        </div>
        <div className="p-2 border-r border-glass-border/20 text-center flex flex-col justify-center">
          <span className="text-gray-500 uppercase">Illumination</span>
          <span className="text-brand-cyan font-bold">2,400 LUX</span>
        </div>
        <div className="p-2 text-center flex flex-col justify-center">
          <span className="text-gray-500 uppercase">Evacuation Staging</span>
          <span className="text-brand-violet font-bold">
            {matchState.status === "done" ? "ACTIVE FORCE" : matchState.status === "super_over" ? "EGRESS FREEZE" : "STANDBY FLOW"}
          </span>
        </div>
      </div>
    </div>
  );
}
