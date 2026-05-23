import React, { useEffect, useRef } from "react";
import { CommsEntry } from "../types";
import { Terminal, Cpu, Clock, ShieldAlert } from "lucide-react";

interface CommsLogProps {
  entries: CommsEntry[];
}

export default function CommsLog({ entries }: CommsLogProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new entries
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [entries]);

  const getSpeakerLabelColor = (speaker: string) => {
    switch (speaker) {
      case "agent_orb":
        return "text-[#8b5cf6] font-semibold"; // violet
      case "system":
        return "text-cyan-400 font-semibold";
      case "ops_lead":
        return "text-amber-400 font-semibold";
      default:
        return "text-gray-400";
    }
  };

  const getLogBg = (entry: CommsEntry) => {
    if (entry.speaker === "system" && entry.role_color === "red") {
      return "bg-brand-red/5 border-l border-brand-red/40";
    }
    if (entry.speaker === "agent_orb") {
      return "bg-[#8b5cf6]/5 border-l border-[#8b5cf6]/40";
    }
    if (entry.speaker.startsWith("guard")) {
      return "bg-zinc-800/20";
    }
    return "bg-transparent";
  };

  return (
    <div className="relative w-full h-[450px] bg-glass-surface rounded-xl border border-glass-border overflow-hidden glow-cyan flex flex-col" id="cordon-comms-log">
      {/* HUD Header */}
      <div className="p-3 bg-glass-base/90 border-b border-glass-border flex justify-between items-center text-xs">
        <span className="font-display font-semibold uppercase tracking-wider text-brand-cyan flex items-center gap-1.5 font-mono">
          <Terminal className="w-4 h-4 text-brand-cyan" />
          ↘ Stadium Comms Log (Terminal Stream)
        </span>
        <span className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
          <Clock className="w-3 h-3 text-brand-cyan" /> UTC LIVE
        </span>
      </div>

      {/* Terminal Log Items Container */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-[11px] leading-relaxed scroll-smooth"
      >
        {entries.map((entry) => {
          const isAgent = entry.speaker === "agent_orb";
          return (
            <div
              key={entry.id}
              className={`p-2.5 rounded border border-white/5 transition-all hover:bg-white/[0.02] ${getLogBg(entry)}`}
            >
              {/* Header meta */}
              <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1">
                <span className="flex items-center gap-1.5 select-none">
                  <span className="text-gray-600">[{entry.ts}]</span>
                  <span className={`${getSpeakerLabelColor(entry.speaker)} uppercase`}>
                    @{entry.speaker}
                  </span>
                </span>
                <span className="text-[9px] text-gray-600 font-mono font-medium">
                  ID: {entry.trace_id}
                </span>
              </div>

              {/* Message Payload */}
              <div className="text-gray-200 break-words whitespace-pre-wrap pl-1">
                {entry.text}
              </div>

              {/* Server-Side ADK Tool call block decoration if present */}
              {entry.tool_call && (
                <div className="mt-2.5 bg-glass-base border-l-2 border-brand-cyan rounded p-2 text-[10px]">
                  <div className="flex justify-between items-center text-brand-cyan font-semibold text-[9px] mb-1">
                    <span className="flex items-center gap-1 uppercase">
                      <Cpu className="w-3 h-3 animate-pulse" /> ADK tool call log:
                    </span>
                    <span className="opacity-60 text-gray-500 font-mono">Server Proxy (Active)</span>
                  </div>
                  <div className="text-gray-400 font-mono pl-1 space-y-1">
                    <div>
                      <span className="text-gray-500">Tool:</span>{" "}
                      <span className="text-white font-medium">{entry.tool_call.name}()</span>
                    </div>
                    {Object.keys(entry.tool_call.args).length > 0 && (
                      <div>
                        <span className="text-gray-500">Args:</span>{" "}
                        <span className="text-amber-500/90 text-[9px]">
                          {JSON.stringify(entry.tool_call.args)}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-white/5 pt-1 mt-1">
                      <span className="text-gray-500">Result:</span>{" "}
                      <span className="text-emerald-400/90">{entry.tool_call.result_summary}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {entries.length === 0 && (
          <div className="h-full flex items-center justify-center text-gray-500 text-xs font-mono select-none">
            Stream offline. Waiting for system initialization...
          </div>
        )}
      </div>

      {/* Terminal log Footer metrics footer */}
      <div className="p-2.5 bg-glass-base border-t border-glass-border/40 text-[10px] font-mono text-gray-500 flex justify-between items-center">
        <span className="flex items-center gap-1 text-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          SSE connection: true
        </span>
        <span className="font-semibold text-brand-cyan select-all">↘ logs=#{entries.length}</span>
      </div>
    </div>
  );
}
