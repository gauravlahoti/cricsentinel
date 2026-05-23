import React from "react";
import { TIMELINE_NODES } from "../mockTimeline";
import { PlayCircle, ShieldAlert, CheckCircle2, Award, CloudRain, Radio, Cpu, RotateCw } from "lucide-react";

interface TimelineControllerProps {
  activeNodeId: string;
  onSelectNode: (nodeId: string) => void;
  isAutoStream: boolean;
  onToggleAutoStream: () => void;
  autoCountdown: number;
}

export default function TimelineController({
  activeNodeId,
  onSelectNode,
  isAutoStream,
  onToggleAutoStream,
  autoCountdown,
}: TimelineControllerProps) {
  return (
    <div className="w-full bg-glass-surface rounded-xl border border-glass-border/30 p-4 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 transition-all" id="timeline-navigation-stepper">
      
      {/* Real-time streaming state controller */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 select-none w-full xl:w-auto">
        <div className="flex items-center gap-3 bg-[#0a2540]/30 border border-brand-cyan/20 px-3 py-2 rounded-lg">
          <div className="relative">
            <span className={`w-2 h-2 rounded-full block ${isAutoStream ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`}></span>
            {isAutoStream && <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-75"></span>}
          </div>
          <div>
            <div className="text-[9px] font-mono tracking-widest text-[#8b5cf6] font-bold">TELEMETRY INGESTION PATH</div>
            <p className="text-xs font-semibold text-white mt-0.5 font-display flex items-center gap-2">
              {isAutoStream ? (
                <>
                  <span className="text-brand-cyan tracking-wide font-mono text-[10px]">🔴 LIVE FEED ACTIVE</span>
                  <span className="text-gray-500 font-mono text-[9px] ml-1">Next phase in {autoCountdown}s</span>
                </>
              ) : (
                <span className="text-amber-400 font-mono text-[10px]">⚠️ MANUAL MANUAL OVERRIDE</span>
              )}
            </p>
          </div>
        </div>

        {/* Live streaming master switch */}
        <button
          onClick={onToggleAutoStream}
          className={`px-4 py-2 rounded-lg border font-mono text-[10px] font-bold flex items-center gap-2 transition-all cursor-pointer ${
            isAutoStream
              ? "bg-brand-cyan/15 border-brand-cyan text-brand-cyan hover:bg-brand-cyan/25 glow-cyan"
              : "bg-white/[0.02] border-white/10 text-gray-400 hover:text-white hover:bg-white/5"
          }`}
        >
          <RotateCw className={`w-3.5 h-3.5 ${isAutoStream ? "animate-spin" : ""}`} style={{ animationDuration: "10s" }} />
          <span>{isAutoStream ? "AUTOPILOT ENGINE: ON" : "ACTIVATE AUTO STREAM"}</span>
        </button>
      </div>

      {/* Grid of timeline steps */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full xl:w-auto">
        <span className="text-[9px] font-mono text-gray-500 tracking-wider uppercase shrink-0">STADIUM PHASE INDEX:</span>
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto font-mono text-[10px]">
          {TIMELINE_NODES.map((node, index) => {
            const isActive = node.id === activeNodeId;
            
            // Custom glyphs for high impact items
            const getStepNodeGlyph = () => {
              if (node.id === "middle_overs") return <ShieldAlert className="w-3.5 h-3.5 text-brand-red inline" />;
              if (node.id === "innings_break") return <CheckCircle2 className="w-3.5 h-3.5 text-brand-amber inline" />;
              if (node.id === "death_overs") return <CloudRain className="w-3.5 h-3.5 text-brand-amber inline" />;
              if (node.id === "done") return <Award className="w-3.5 h-3.5 text-emerald-400 inline" />;
              return <PlayCircle className="w-3.5 h-3.5 text-gray-400 inline" />;
            };

            return (
              <button
                key={node.id}
                onClick={() => {
                  onSelectNode(node.id);
                }}
                className={`py-1.5 px-2.5 rounded-lg border text-center transition-all duration-300 flex items-center gap-1.5 cursor-pointer max-sm:text-[8px] hover:scale-[1.01] ${
                  isActive
                    ? "bg-[#8b5cf6]/20 border-[#8b5cf6] text-[#c084fc] font-bold"
                    : "bg-white/[0.02] border-white/5 text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>{index + 1}.</span>
                {getStepNodeGlyph()}
                <span className="uppercase tracking-tight">{node.title.replace("_", " ")}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
