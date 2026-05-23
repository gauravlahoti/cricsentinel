import React, { useState } from "react";
import { Coffee, RotateCcw, Compass, MapPin, Smile, CheckSquare, Plus } from "lucide-react";

interface GuestsViewProps {
  onAddLog: (entry: any) => void;
}

export default function GuestsView({ onAddLog }: GuestsViewProps) {
  const [toiletLanesDecongested, setToiletLanesDecongested] = useState<boolean>(false);
  const [concessionRoutesModified, setConcessionRoutesModified] = useState<boolean>(false);

  // High resolution mock statistics for guest zones
  const zonesInfo = [
    {
      id: "z-1",
      name: "Concourse Food Stand East",
      wait: "19 min wait",
      metric: "720 pax/hr",
      density: "94% Density",
      status: "STALLED",
    },
    {
      id: "z-2",
      name: "Concourse Food Stand West",
      wait: "4 min wait",
      metric: "120 pax/hr",
      density: "22% Density",
      status: "NOMINAL",
    },
    {
      id: "z-3",
      name: "South Concourse Restrooms",
      wait: "14 min wait",
      metric: "98 visits/min",
      density: "88% Density",
      status: "CROWDED",
    },
    {
      id: "z-4",
      name: "North Concourse Restrooms",
      wait: "2 min wait",
      metric: "14 visits/min",
      density: "12% Density",
      status: "NOMINAL",
    },
  ];

  const handleDecongestToilet = () => {
    setToiletLanesDecongested(true);
    onAddLog({
      id: "guest-toilet-" + Date.now(),
      ts: new Date().toLocaleTimeString(),
      speaker: "system",
      role_color: "cyan",
      text: "[GUESTS EXECUTED] Secondary restroom lanes activated. Redirected 600 users to underpopulated West Stand.",
      trace_id: "trx-gst-rest-" + Math.floor(Math.random() * 9000),
    });
  };

  const handleRouteConcession = () => {
    setConcessionRoutesModified(true);
    onAddLog({
      id: "guest-concession-" + Date.now(),
      ts: new Date().toLocaleTimeString(),
      speaker: "logistics_03",
      role_color: "amber",
      text: "[CONCESSION ROUTE] Pushed '20% off at West Concourse' notification rule to mobile ticket holders near stalled stands.",
      trace_id: "trx-gst-con-" + Math.floor(Math.random() * 9000),
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full text-white" id="cordon-guests-screen">
      
      {/* 1. Guest Comfort Dashboard (4 Cols) */}
      <div className="lg:col-span-4 flex flex-col gap-3">
        <div className="text-[10px] uppercase font-mono tracking-widest text-brand-cyan font-bold flex justify-between items-center">
          <span>COMFORT FEEDBACK DECK</span>
          <span className="text-gray-500 text-[9px]">SENSORS ACTIVE</span>
        </div>

        <div className="space-y-2.5">
          {zonesInfo.map((zone) => {
            const isStalled = zone.status === "STALLED";
            const isCrowded = zone.status === "CROWDED";

            return (
              <div
                key={zone.id}
                className="p-3 bg-glass-surface rounded-lg border border-white/5 flex flex-col gap-2 relative transition-all hover:bg-white/[0.02]"
              >
                {/* Visual density warning strip */}
                {isStalled && <div className="absolute top-0 bottom-0 left-0 w-1 bg-brand-red"></div>}
                {isCrowded && <div className="absolute top-0 bottom-0 left-0 w-1 bg-brand-amber"></div>}

                <div className="flex justify-between items-center">
                  <div className="flex gap-2 items-center">
                    <span className="text-xs font-semibold">{zone.name}</span>
                  </div>
                  <span className={`text-[8px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isStalled
                      ? "bg-brand-red/15 text-brand-red"
                      : isCrowded
                      ? "bg-brand-amber/15 text-brand-amber"
                      : "bg-emerald-500/15 text-emerald-400"
                  }`}>
                    {zone.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-mono mt-1 text-gray-400 border-t border-white/5 pt-2">
                  <div>
                    WAIT: <span className="text-white block font-sans font-semibold mt-0.5">{zone.wait}</span>
                  </div>
                  <div>
                    RATE: <span className="text-white block font-sans font-semibold mt-0.5">{zone.metric}</span>
                  </div>
                  <div>
                    DENSITY: <span className="text-white block font-sans font-semibold mt-0.5">{zone.density}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Concession Map Area (5 Cols) */}
      <div className="lg:col-span-5 flex flex-col gap-3">
        <div className="text-[10px] uppercase font-mono tracking-widest text-[#06b6d4] font-bold flex justify-between items-center">
          <span>GUEST HEATPAL SYSTEM</span>
          <span className="text-gray-500 text-[9px]">LOC: CONCOURSE_LEVEL_1</span>
        </div>

        <div className="relative w-full h-[380px] bg-glass-surface rounded-xl border border-glass-border overflow-hidden flex items-center justify-center">
          <svg viewBox="0 0 400 300" className="w-full h-full max-h-[280px]">
            {/* Arena outline mapping */}
            <ellipse cx="200" cy="150" rx="140" ry="110" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <ellipse cx="200" cy="150" rx="120" ry="94" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />

            {/* Hot Stall Zone (East Food Stand) */}
            <circle cx="310" cy="150" r="15" fill="rgba(239, 68, 68, 0.25)" stroke="#ef4444" strokeWidth="1" className="animate-pulse" />
            <text x="330" y="154" fill="#ef4444" fontSize="8px" fontFamily="var(--font-mono)">East Food (94%)</text>

            {/* Cold Zone */}
            <circle cx="90" cy="150" r="10" fill="rgba(16, 185, 129, 0.15)" stroke="#10b981" strokeWidth="1" />
            <text x="5" y="154" fill="#10b981" fontSize="8px" fontFamily="var(--font-mono)">West Food (22%)</text>

            {/* Inflow Directional Arrow paths */}
            <path
              d="M 310,135 Q 200,90 90,140"
              fill="none"
              stroke="#06b6d4"
              strokeWidth="2"
              strokeDasharray="4 4"
              className={concessionRoutesModified ? "animate-pulse" : ""}
            />
          </svg>

          <div className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded text-[8px] font-mono text-gray-400">
            DENSITY BALANCE LAYER ACTIVE
          </div>
        </div>
      </div>

      {/* 3. Right Guest Proposals (3 Cols) */}
      <div className="lg:col-span-3 flex flex-col gap-3">
        <div className="text-[10px] uppercase font-mono tracking-widest text-[#8b5cf6] font-bold">
          <span>GUEST SERVICE DIRECTIVES</span>
        </div>

        <div className="space-y-4">
          {/* Action 1 */}
          <div className="p-4 bg-glass-surface rounded-xl border border-glass-border/40 relative overflow-hidden">
            <div className="text-[8px] font-mono uppercase bg-brand-cyan/15 text-brand-cyan font-bold px-1.5 py-0.2 rounded w-fit mb-2">
              COMFORT ACTION
            </div>

            <h3 className="text-xs font-semibold text-white">
              Decongest South Concourse Restroom Wait times
            </h3>
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed mt-1.5">
              Activates auxiliary restrooms and routes users through adjacent halls.
            </p>

            <button
              onClick={handleDecongestToilet}
              className={`mt-4 w-full py-1.5 rounded font-mono text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer ${
                toiletLanesDecongested
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-brand-cyan text-glass-base hover:bg-cyan-400"
              }`}
            >
              {toiletLanesDecongested ? "AUX RESTROOMS OPENED" : "DEPLOY DIRECTIVE"}
            </button>
          </div>

          {/* Action 2 */}
          <div className="p-4 bg-glass-surface rounded-xl border border-glass-border/40 relative overflow-hidden">
            <div className="text-[8px] font-mono uppercase bg-white/5 text-gray-400 px-1.5 py-0.2 rounded w-fit mb-2">
              CUB DIRECTIVE
            </div>

            <h3 className="text-xs font-semibold text-white">
              Push discount vouchers to re-balance food stand load
            </h3>
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed mt-1.5">
              Channels users from crowded East Stand to underutilized West Stand.
            </p>

            <button
              onClick={handleRouteConcession}
              className={`mt-4 w-full py-1.5 rounded font-mono text-[10px] font-bold tracking-wide uppercase transition-all cursor-pointer ${
                concessionRoutesModified
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                  : "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
              }`}
            >
              {concessionRoutesModified ? "DIGITAL VOUCHERS SENT" : "PUSH NOTIFICATIONS"}
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}
