import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Bot,
  Sparkles,
  Clock,
  Cpu,
  Wifi,
  ChevronDown,
  Volume2,
  AlertCircle,
  HelpCircle
} from "lucide-react";
import { MatchState, OpsPosture, Anomaly, CommsEntry } from "../types";

interface AIChatWidgetProps {
  matchState: MatchState | null;
  opsPosture: OpsPosture | null;
  currentAnomaly: Anomaly | null;
  weatherText: string;
  commsEntries: CommsEntry[];
  onAddLog: (entry: CommsEntry) => void;
  isDarkMode: boolean;
}

export default function AIChatWidget({
  matchState,
  opsPosture,
  currentAnomaly,
  weatherText,
  commsEntries,
  onAddLog,
  isDarkMode
}: AIChatWidgetProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMsg, setInputMsg] = useState<string>("");
  const [isLending, setIsLending] = useState<boolean>(false);
  const [hasNewNotif, setHasNewNotif] = useState<boolean>(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [commsEntries, isOpen, isLending]);

  // Turn off notification indicator when opened
  useEffect(() => {
    if (isOpen) {
      setHasNewNotif(false);
    }
  }, [isOpen]);

  // Handle active suggestions by Match Phase or status
  const getSuggestions = () => {
    const status = (matchState?.status as string) || "pre_match";
    const phase = (matchState?.phase as string) || "n/a";
    
    if (status === "pre_match") {
      return ["Status overview", "Check gate throughput", "Is storm approaching?"];
    }
    if (phase === "powerplay") {
      return ["Are exit concourses safe?", "Predict peak load hour", "Gate ingress stats"];
    }
    if (phase === "middle") {
      return ["Trace Section 312 camera", "Risk assessment summary", "Logistics status"];
    }
    if (status === "innings_break" || phase === "innings_break") {
      return ["Bottleneck probability", "How to redirect Gate E?", "Broadcasting warning"];
    }
    if (phase === "death") {
      return ["Meteorological radar check", "Is egress prepared?", "Divert VIP entry"];
    }
    if (status === "super_over") {
      return ["Lock gates precaution", "Egress target ETA", "Dispatch medical team"];
    }
    return ["Stadium status", "Check sensor health", "Weather updates"];
  };

  const handleSend = async (messageText: string) => {
    if (!messageText.trim() || isLending) return;

    const query = messageText.trim();
    setInputMsg("");
    setIsLending(true);

    const timestamp = new Date().toLocaleTimeString();

    // 1. Post local user message log immediately
    const userLog: CommsEntry = {
      id: "chat-user-" + Date.now(),
      ts: timestamp,
      speaker: "ops_lead",
      role_color: "grey",
      text: query,
      trace_id: "trx-chat-usr-" + Math.floor(Math.random() * 90000)
    };
    onAddLog(userLog);

    try {
      // 2. Call the server side Express proxy with operational variables
      const response = await fetch("/api/agent-respond", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          matchState,
          opsPosture,
          currentAnomaly,
          weather: weatherText
        })
      });

      const data = await response.json();

      if (data && data.success) {
        // 3. Append Agent Orb log message from server database
        const orbLog: CommsEntry = {
          id: "chat-orb-" + Date.now(),
          ts: new Date().toLocaleTimeString(),
          speaker: "agent_orb",
          role_color: "violet",
          text: data.text,
          trace_id: "trx-chat-rsp-" + Math.floor(Math.random() * 90000),
          tool_call: data.tool_call
            ? {
                name: data.tool_call.name,
                args: data.tool_call.args,
                result_summary: data.tool_call.result_summary
              }
            : undefined
        };
        onAddLog(orbLog);

        // Buzz if audio feedback is desired
        try {
          const speakText = data.text.substring(0, 80);
          if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            const utterance = new SpeechSynthesisUtterance(speakText);
            utterance.rate = 1.05;
            utterance.pitch = 0.95;
            window.speechSynthesis.speak(utterance);
          }
        } catch {
          // Speak synthesis failed or wasn't supported
        }
      }
    } catch (e) {
      console.error("Chat Widget Query Failed:", e);
      // Append local fallback debug error
      onAddLog({
        id: "chat-error-" + Date.now(),
        ts: new Date().toLocaleTimeString(),
        speaker: "system",
        role_color: "red",
        text: "🚨 CricSentinel Agent Offline. Internal micro-mesh query timed out. Retrying automatic routing...",
        trace_id: "trx-chat-err-" + Math.floor(Math.random() * 8000)
      });
    } finally {
      setIsLending(false);
    }
  };

  const getMsgBubbleBg = (speaker: string) => {
    switch (speaker) {
      case "ops_lead":
        return "bg-brand-cyan/10 border border-brand-cyan/25 self-end text-right rounded-br-none";
      case "agent_orb":
        return "bg-glass-base border border-glass-border/30 self-start float-left rounded-bl-none text-left";
      case "system":
        return "bg-brand-red/5 border border-brand-red/15 self-center text-center text-xs w-full py-1 text-gray-300";
      default:
        return "bg-glass-base/60 border border-white/5 self-start text-left";
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 font-sans" id="cricsentinel-agent-widget">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="w-[360px] md:w-[400px] h-[520px] bg-glass-surface rounded-2xl border border-glass-border/70 overflow-hidden shadow-2xl flex flex-col glow-cyan mb-3 select-none"
          >
            {/* Widget Elegant Header */}
            <div className="p-3 bg-glass-base flex justify-between items-center border-b border-glass-border/40">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-brand-violet to-brand-cyan p-[1px] flex items-center justify-center animate-pulse">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                    <Bot className="w-4 h-4 text-brand-cyan" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-xs font-bold font-display text-white tracking-wide uppercase">
                      @Agent_Orb
                    </h3>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  </div>
                  <p className="text-[9px] font-mono text-gray-400">
                    Narendra Modi Stadium Duty Companion
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Active telemetry labels */}
                <div className="hidden sm:flex items-center gap-1.5 text-[8px] font-mono text-gray-500 border border-white/5 rounded-md px-1.5 py-0.5 bg-black/40">
                  <Wifi className="w-2.5 h-2.5 text-brand-cyan animate-pulse" />
                  <span>3.5 FLASH</span>
                </div>
                
                {/* Close handle button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-full text-gray-400 hover:text-white hover:bg-white/5 transition-all duration-150 cursor-pointer"
                  title="Collapse chat widget"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stadium Operations Context Bar */}
            <div className="bg-brand-violet/5 border-b border-glass-border/20 px-3 py-1.5 text-[9px] font-mono text-gray-400 flex justify-between items-center select-none text-xs">
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-brand-cyan shrink-0" />
                PHASE: <span className="text-white font-bold uppercase">{matchState?.phase || "PRE-MATCH"}</span>
              </span>
              <span>
                THREAT LEVEL:{" "}
                <span className={`font-semibold uppercase ${opsPosture?.level === "critical" ? "text-brand-red animate-pulse" : opsPosture?.level === "amber" ? "text-brand-amber font-bold" : "text-emerald-400"}`}>
                  {opsPosture?.level || "NOMINAL"}
                </span>
              </span>
            </div>

            {/* Message Thread Panel */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-black/15 scroll-smooth"
            >
              {commsEntries.map((msg) => {
                const isUser = msg.speaker === "ops_lead";
                const isSys = msg.speaker === "system";
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={msg.id}
                    className={`flex flex-col gap-1 max-w-[85%] ${isUser ? "ml-auto" : isSys ? "mx-auto w-full max-w-full" : "mr-auto"}`}
                  >
                    {/* Log Speaker details */}
                    {!isSys && (
                      <span className="text-[8px] font-mono text-gray-500 px-1 uppercase tracking-wider select-none">
                        [{msg.ts}] @{msg.speaker}
                      </span>
                    )}

                    {/* Chat Bubble Context Container */}
                    <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed break-words ${getMsgBubbleBg(msg.speaker)} shadow-md`}>
                      <span className="text-gray-100 font-medium whitespace-pre-line">{msg.text}</span>

                      {/* Render Interactive ADK Tool called decorator inline */}
                      {msg.tool_call && (
                        <div className="mt-2 bg-black/60 border-l border-brand-cyan rounded p-2 text-[9px] font-mono text-gray-400 gap-1 flex flex-col">
                          <span className="text-brand-cyan text-[8px] font-bold uppercase flex items-center gap-1">
                            <Cpu className="w-3 h-3 animate-pulse text-brand-cyan shrink-0" />
                            ADK SERVER PROC:
                          </span>
                          <div>
                            <span className="text-gray-500">Call:</span> {msg.tool_call.name}()
                          </div>
                          <div>
                            <span className="text-gray-500">Summary:</span> <span className="text-emerald-400 font-semibold">{msg.tool_call.result_summary}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {/* Loader Typing Block */}
              {isLending && (
                <div className="flex flex-col gap-1 mr-auto max-w-[80%]">
                  <span className="text-[8px] font-mono text-gray-500 px-1 uppercase tracking-wider">
                    Orb is thinking...
                  </span>
                  <div className="p-2.5 rounded-xl text-[11px] bg-glass-surface/90 border border-brand-cyan/20 rounded-bl-none text-left flex items-center gap-2 text-brand-cyan">
                    <svg className="animate-spin h-3.5 w-3.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="font-mono text-[10px] animate-pulse">Running diagnostics via Gemini SDK...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick operational suggestions */}
            <div className="px-3 py-2 bg-glass-base border-t border-glass-border/30 flex flex-wrap gap-1 items-center select-none">
              <span className="text-[8px] font-mono text-gray-500 uppercase font-semibold mr-1 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 " /> Sug:
              </span>
              {getSuggestions().map((quest, index) => (
                <button
                  key={index}
                  onClick={() => handleSend(quest)}
                  className="px-2 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-[9px] font-mono text-gray-400 hover:text-white border border-white/5 transition-all cursor-pointer"
                >
                  {quest}
                </button>
              ))}
            </div>

            {/* Form text input layout */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputMsg);
              }}
              className="p-3 bg-glass-base border-t border-glass-border/40 flex gap-2 items-center"
            >
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Ask Agent Orb for status, forecast or alerts..."
                className="flex-1 bg-black/40 border border-glass-border/30 text-[11px] text-white rounded-lg px-3 py-2 focus:outline-none focus:border-brand-cyan font-mono"
              />
              <button
                type="submit"
                disabled={isLending || !inputMsg.trim()}
                className="p-2 rounded-lg bg-brand-cyan hover:bg-brand-cyan/90 text-black font-semibold transition-all disabled:opacity-45 cursor-pointer flex items-center justify-center shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Launcher Button Trigger */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-3 bg-gradient-to-r from-brand-violet to-[#8b5cf6] hover:from-brand-violet hover:to-[#7c3aed] text-white rounded-full shadow-2xl border border-brand-cyan/30 flex items-center gap-2 select-none cursor-pointer glow-violet"
        title="Access CricSentinel Agent Orb"
      >
        <div className="relative">
          <Bot className="w-5 h-5" />
          <AnimatePresence>
            {hasNewNotif && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1.5 -right-1.5 w-2.5 h-2.5 rounded-full bg-brand-cyan border border-black animate-pulse"
              />
            )}
          </AnimatePresence>
        </div>
        <span className="text-[11px] font-mono tracking-wider font-bold uppercase pointer-events-none">
          {isOpen ? "COLLAPSE ORB" : "ASK AGENT ORB"}
        </span>
      </motion.button>
    </div>
  );
}
