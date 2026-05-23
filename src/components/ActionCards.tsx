import React from "react";
import { motion } from "motion/react";
import { DecisionCard, RunbookStep } from "../types";
import { ShieldCheck, ArrowRight, CheckCircle2, Circle, AlertTriangle, Play, HelpCircle, MessageSquareText } from "lucide-react";

interface ActionCardsProps {
  decisionCards: DecisionCard[];
  runbookSteps: RunbookStep[];
  threatLevel: string;
  onExecuteAction: (actionId: string, cardId: string) => void;
  onCompleteStep: (stepId: string) => void;
}

export default function ActionCards({
  decisionCards,
  runbookSteps,
  threatLevel,
  onExecuteAction,
  onCompleteStep
}: ActionCardsProps) {
  const isIncidentRunning = runbookSteps.length > 0;

  // Render confidence bar colors
  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "text-emerald-400";
    if (score >= 0.8) return "text-brand-cyan";
    return "text-brand-amber";
  };

  return (
    <div className="flex flex-col gap-4 h-full" id="cordon-action-cards-panel">
      
      {/* SECTION 1: ACTIVE MISSION PROPOSALS (AGENT ORB DECISIONS) */}
      <div className="flex flex-col gap-3">
        <div className="text-[10px] uppercase tracking-widest text-brand-cyan font-mono font-bold flex items-center justify-between">
          <span>⚡ Agent Orb Proposals</span>
          <span className="text-gray-500 font-mono text-[9px]">Decision Deck</span>
        </div>

        {decisionCards.map((card) => {
          const isExecuted = card.isExecuted;
          return (
            <motion.div
              layout
              key={card.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-4 rounded-xl border relative overflow-hidden transition-all duration-300 ${
                isExecuted
                  ? "bg-emerald-950/10 border-emerald-500/30 glow-violet"
                  : card.impact === "HIGH IMPACT"
                  ? "bg-glass-surface border-brand-cyan/20 glow-cyan"
                  : "bg-glass-surface border-glass-border/30"
              }`}
            >
              {/* Confident score chip (Top Right) */}
              <div className="absolute top-3 right-3 flex items-center gap-1 font-mono text-[10px]">
                <span className="text-gray-500">Confidence</span>
                <span className={`font-bold ${getConfidenceColor(card.confidence)}`}>
                  {(card.confidence * 100).toFixed(0)}%
                </span>
              </div>

              {/* Impact Tag (Top Left) */}
              <div className="text-[9px] font-mono tracking-widest font-semibold flex items-center gap-1.5 mb-2.5">
                <span className={`px-1.5 py-0.5 rounded ${
                  card.impact === "HIGH IMPACT" ? "bg-brand-red/10 text-brand-red" : "bg-brand-cyan/10 text-brand-cyan"
                }`}>
                  {card.impact}
                </span>
                <span className="text-gray-500">•</span>
                <span className="text-gray-400 font-mono">{card.type}</span>
              </div>

              {/* Title */}
              <h3 className="text-xs font-semibold font-display text-white pr-20 leading-relaxed">
                {card.title}
              </h3>

              {/* Rationale block */}
              <div className="mt-3 text-[10px] text-gray-300 font-sans leading-relaxed bg-glass-base/60 p-2.5 rounded border border-white/5 flex gap-1.5 items-start">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-cyan flex-shrink-0 mt-0.5" />
                <span>{card.rationale}</span>
              </div>

              {/* Action Triggers */}
              <div className="mt-4 flex gap-2 w-full font-mono text-[10px]">
                {isExecuted ? (
                  <div className="w-full text-center bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 py-1.5 rounded font-semibold flex items-center justify-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> PROPOSAL DEPLOYED & LOGGED
                  </div>
                ) : (
                  <>
                    {card.actions.map((act) => (
                      <button
                        key={act.action_id}
                        onClick={() => onExecuteAction(act.action_id, card.id)}
                        className={`flex-1 py-1.5 px-3 rounded font-semibold transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer ${
                          act.kind === "primary"
                            ? "bg-brand-cyan text-glass-base hover:bg-brand-cyan/90"
                            : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {act.label}
                      </button>
                    ))}
                  </>
                )}
              </div>
            </motion.div>
          );
        })}

        {decisionCards.length === 0 && (
          <div className="p-4 rounded-xl border border-dashed border-white/5 text-center text-xs text-gray-500 font-mono">
           No active proposals. System currently stabilized.
          </div>
        )}
      </div>

      {/* SECTION 2: INCIDENT RESPONSE RUNBOOK */}
      {isIncidentRunning && (
        <div className="flex flex-col gap-3 mt-2 border-t border-glass-border/30 pt-4">
          <div className="text-[10px] uppercase tracking-widest text-[#8b5cf6] font-mono font-bold flex items-center justify-between">
            <span>🛡️ Incident Response Runbook</span>
            <span className="text-brand-amber text-[9px] animate-pulse flex items-center gap-1 font-mono">
              <AlertTriangle className="w-3 h-3 text-brand-amber" /> SECTOR ALERT ACTIVE
            </span>
          </div>

          <div className="space-y-4 font-mono text-[10px]" id="runbook-steps-timeline">
            {runbookSteps.map((step) => {
              const isActive = step.state === "active";
              const isCompleted = step.state === "completed";
              const isPending = step.state === "pending";

              return (
                <div
                  key={step.id}
                  className={`relative pl-7 transition-all duration-300 ${
                    isCompleted ? "opacity-45" : "opacity-100"
                  }`}
                >
                  {/* Step status connectors & glyphs */}
                  <div className="absolute left-1 top-0 bottom-0 w-0.5 bg-glass-border/20 z-0"></div>
                  <div className="absolute left-[-2px] top-1 z-10 bg-[#07080c] p-0.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    ) : isActive ? (
                      <div className="w-4 h-4 rounded-full border border-brand-cyan flex items-center justify-center bg-brand-cyan/20 animate-pulse glow-cyan">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan"></span>
                      </div>
                    ) : (
                      <Circle className="w-4 h-4 text-gray-600" />
                    )}
                  </div>

                  {/* Step Body */}
                  <div className={`p-3 rounded-lg border leading-relaxed ${
                    isActive
                      ? "border-brand-cyan/40 bg-[#06b6d4]/5 glow-cyan"
                      : "border-white/5 bg-glass-surface"
                  }`}>
                    <div className="flex justify-between items-center text-[9px] text-gray-500 mb-1">
                      <span>STEP 0{step.order}</span>
                      <span className={`uppercase font-semibold text-[8px] px-1 rounded ${
                        isCompleted
                          ? "bg-emerald-500/15 text-emerald-400"
                          : isActive
                          ? "bg-brand-cyan/15 text-brand-cyan animate-pulse"
                          : "bg-white/5 text-gray-500"
                      }`}>
                        {step.state}
                      </span>
                    </div>

                    <h4 className={`text-xs font-semibold text-white mt-1 leading-normal ${isCompleted ? "line-through text-gray-500" : ""}`}>
                      {step.title}
                    </h4>

                    <p className={`text-[10px] text-gray-400 mt-1.5 font-sans leading-normal ${isCompleted ? "line-through" : ""}`}>
                      {step.description}
                    </p>

                    {/* Embed Content (e.g. PA announcement block or CCTV details) */}
                    {step.embed && !isCompleted && (
                      <div className="mt-3 bg-glass-base p-2.5 rounded border border-white/5 text-[9px] space-y-2">
                        {step.embed.kind === "pa_script" ? (
                          <>
                            <div className="text-brand-cyan flex items-center gap-1 font-semibold select-none text-[8px] uppercase">
                              <MessageSquareText className="w-3 h-3" /> Live PA Script Preview:
                            </div>
                            <div className="text-gray-300 italic pl-1 border-l border-brand-cyan/45 font-sans leading-relaxed">
                              "{step.embed.text}"
                            </div>
                          </>
                        ) : step.embed.kind === "anomaly_box" ? (
                          <>
                            <div className="text-brand-red font-semibold uppercase flex items-center gap-1 select-none text-[8px]">
                              <ShieldTriangle /> CCTV ANOMALY BOUNDING DATA:
                            </div>
                            <div className="text-gray-300 font-mono leading-relaxed pl-1 border-l border-brand-red/45">
                              {step.embed.text}
                            </div>
                          </>
                        ) : null}
                      </div>
                    )}

                    {/* Operational completion button for Active step */}
                    {isActive && (
                      <button
                        onClick={() => onCompleteStep(step.id)}
                        className="mt-3 w-full py-1 bg-[#8b5cf6] hover:bg-[#8b5cf6]/90 active:scale-[0.98] text-white text-[9px] font-bold rounded flex items-center justify-center gap-1 transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-3 h-3" /> MARK STEP RECONCILED & PROCEED
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}

// Inline helper for security triangle emblem
function ShieldTriangle() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  );
}
