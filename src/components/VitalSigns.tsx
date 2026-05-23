import React from "react";
import { motion } from "motion/react";
import { MatchState, OpsPosture } from "../types";
import { Users2, ArrowDownUp, Timer, ShieldAlert, CloudSun, AlertTriangle } from "lucide-react";

interface VitalSignsProps {
  matchState: MatchState;
  opsPosture: OpsPosture;
  attendanceVal: number;
  throughputVal: number;
  egressEtaVal: number;
  weatherVal: string;
  selectedFilter: string | null;
  onSelectFilter: (filterName: string | null) => void;
}

export default function VitalSigns({
  matchState,
  opsPosture,
  attendanceVal,
  throughputVal,
  egressEtaVal,
  weatherVal,
  selectedFilter,
  onSelectFilter
}: VitalSignsProps) {

  // Function to determine threshold borders based on severity
  const getPosturizedBorder = (type: string) => {
    if (opsPosture.level === "critical") return "border-brand-red/60 text-brand-red glow-red";
    if (opsPosture.level === "amber") {
      if (type === "throughput" && matchState.status === "innings_break") {
        return "border-brand-amber/60 text-brand-amber glow-amber";
      }
      if (type === "weather" && matchState.phase === "death") {
        return "border-brand-amber/60 text-brand-amber glow-amber";
      }
    }
    if (opsPosture.level === "elevated" && type === "threat") {
      return "border-brand-amber/60 text-brand-amber glow-amber";
    }
    return "border-glass-border/30 text-gray-400";
  };

  const getThreatLabel = () => {
    switch (opsPosture.level) {
      case "low":
        return "LOW (GREEN)";
      case "elevated":
        return "ELEVATED (BLUE)";
      case "amber":
        return "WARNING (AMBER)";
      case "critical":
        return "CRITICAL (RED)";
      default:
        return "NOMINAL";
    }
  };

  const threatColor = {
    low: "text-brand-cyan",
    elevated: "text-[#8b5cf6] animate-pulse", // violet
    amber: "text-brand-amber animate-pulse",
    critical: "text-brand-red font-bold animate-ping"
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 w-full" id="cordon-vital-signs-strip">
      
      {/* 1. Attendance Cell */}
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        onClick={() => onSelectFilter(selectedFilter === "attendance" ? null : "attendance")}
        className={`p-3 rounded-lg bg-glass-surface border ${
          selectedFilter === "attendance" ? "border-brand-cyan glow-cyan" : "border-white/5"
        } cursor-pointer transition-all flex flex-col justify-between h-[82px] relative overflow-hidden`}
      >
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-semibold text-gray-400 uppercase">
          <span>Attendance</span>
          <Users2 className={`w-3.5 h-3.5 ${selectedFilter === "attendance" ? "text-brand-cyan" : "text-gray-500"}`} />
        </div>
        <div className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight mt-1.5 font-mono">
          {attendanceVal.toLocaleString()}
        </div>
        <div className="text-[9px] font-mono text-gray-400 mt-1 flex justify-between items-center">
          <span>Narendra Modi Stadium</span>
          <span className="text-brand-cyan">{( (attendanceVal / 130224) * 100 ).toFixed(0)}% Cap</span>
        </div>
        {selectedFilter === "attendance" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan"></div>
        )}
      </motion.div>

      {/* 2. Gate Throughput Cell */}
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        onClick={() => onSelectFilter(selectedFilter === "throughput" ? null : "throughput")}
        className={`p-3 rounded-lg bg-glass-surface border ${
          selectedFilter === "throughput" ? "border-brand-cyan glow-cyan" : getPosturizedBorder("throughput")
        } cursor-pointer transition-all flex flex-col justify-between h-[82px] relative overflow-hidden`}
      >
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-semibold text-gray-400 uppercase">
          <span>Throughput</span>
          <ArrowDownUp className={`w-3.5 h-3.5 ${selectedFilter === "throughput" ? "text-brand-cyan" : "text-gray-500"}`} />
        </div>
        <div className={`text-xl md:text-2xl font-display font-semibold tracking-tight mt-1.5 font-mono ${
          matchState.status === "innings_break" ? "text-brand-amber" : "text-white"
        }`}>
          {(throughputVal / 1000).toFixed(1)}k/min
        </div>
        <div className="text-[9px] font-mono mt-1 flex justify-between items-center">
          <span>Transit Ratio</span>
          <span className={matchState.status === "innings_break" ? "text-brand-amber font-bold" : "text-gray-500"}>
            {matchState.status === "innings_break" ? "PEAK SURGE" : "NOMINAL"}
          </span>
        </div>
        {selectedFilter === "throughput" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan"></div>
        )}
      </motion.div>

      {/* 3. Egress ETA Cell */}
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        onClick={() => onSelectFilter(selectedFilter === "egress" ? null : "egress")}
        className={`p-3 rounded-lg bg-glass-surface border ${
          selectedFilter === "egress" ? "border-brand-cyan glow-cyan" : "border-white/5"
        } cursor-pointer transition-all flex flex-col justify-between h-[82px] relative overflow-hidden`}
      >
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-semibold text-gray-400 uppercase">
          <span>Egress ETA</span>
          <Timer className={`w-3.5 h-3.5 ${selectedFilter === "egress" ? "text-brand-cyan" : "text-gray-500"}`} />
        </div>
        <div className="text-xl md:text-2xl font-display font-semibold text-white tracking-tight mt-1.5 font-mono">
          {egressEtaVal === 0 ? "STBY" : `${egressEtaVal} MIN`}
        </div>
        <div className="text-[9px] font-mono text-gray-400 mt-1 flex justify-between items-center">
          <span>Total Clearance</span>
          <span className="text-gray-400 font-mono">
            {matchState.status === "super_over" ? "BLOCKED" : "ACTIVE"}
          </span>
        </div>
        {selectedFilter === "egress" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan"></div>
        )}
      </motion.div>

      {/* 4. Threat Level Cell */}
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        onClick={() => onSelectFilter(selectedFilter === "threat" ? null : "threat")}
        className={`p-3 rounded-lg bg-glass-surface border ${
          selectedFilter === "threat" ? "border-brand-cyan glow-cyan" : getPosturizedBorder("threat")
        } cursor-pointer transition-all flex flex-col justify-between h-[82px] relative overflow-hidden`}
      >
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-semibold text-gray-400 uppercase">
          <span>Threat Level</span>
          {opsPosture.level !== "low" ? (
            <AlertTriangle className={`w-3.5 h-3.5 ${opsPosture.level === "amber" ? "text-brand-amber" : "text-brand-red animate-pulse"}`} />
          ) : (
            <ShieldAlert className={`w-3.5 h-3.5 ${selectedFilter === "threat" ? "text-brand-cyan" : "text-gray-500"}`} />
          )}
        </div>
        <div className={`text-sm md:text-md uppercase font-display font-medium tracking-wide mt-2 font-mono ${threatColor[opsPosture.level]}`}>
          {getThreatLabel()}
        </div>
        <div className="text-[8px] font-mono text-gray-400 mt-1 flex justify-between items-center truncate">
          <span>Active Driver:</span>
          <span className="text-brand-cyan font-bold truncate max-w-[80px]">{opsPosture.driver}</span>
        </div>
        {selectedFilter === "threat" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan"></div>
        )}
      </motion.div>

      {/* 5. Weather Cell */}
      <motion.div
        whileHover={{ scale: 1.01, y: -1 }}
        onClick={() => onSelectFilter(selectedFilter === "weather" ? null : "weather")}
        className={`p-3 rounded-lg bg-glass-surface border ${
          selectedFilter === "weather" ? "border-brand-cyan glow-cyan" : getPosturizedBorder("weather")
        } cursor-pointer transition-all flex flex-col justify-between h-[82px] relative overflow-hidden`}
      >
        <div className="flex justify-between items-center text-[10px] font-mono tracking-wider font-semibold text-gray-400 uppercase">
          <span>Weather Sensor</span>
          <CloudSun className={`w-3.5 h-3.5 ${selectedFilter === "weather" ? "text-brand-cyan" : "text-gray-500"}`} />
        </div>
        <div className={`text-xs md:text-sm font-semibold truncate leading-tight mt-2.5 font-mono ${
          matchState.status === "rain_hold" || matchState.phase === "death" ? "text-brand-amber font-bold animate-pulse" : "text-white"
        }`}>
          {weatherVal}
        </div>
        <div className="text-[9px] font-mono mt-1 flex justify-between items-center">
          <span>Doppler Mode</span>
          <span className="text-brand-cyan font-mono font-semibold">ONLINE</span>
        </div>
        {selectedFilter === "weather" && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-cyan"></div>
        )}
      </motion.div>

    </div>
  );
}
