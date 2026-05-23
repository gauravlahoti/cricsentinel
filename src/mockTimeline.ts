import { ReplayTimelineNode, MatchState, OpsPosture, CommsEntry, DecisionCard, RunbookStep, Anomaly } from "./types";

export const TIMELINE_NODES: ReplayTimelineNode[] = [
  {
    id: "pre_match",
    title: "PRE_MATCH",
    subtitle: "Briefing Stance",
    matchStatus: "pre_match",
    matchPhase: "n/a",
    threatLevel: "low",
    weather: "CLEAR · 32°C · NW @ 12km/h",
    scoreSummary: "0/0 (0.0 overs) | Target: N/A",
    attendance: 12500,
    gateThroughput: 850,
    egressEta: 0,
    description: "Narendra Modi Stadium gates A-F now open to the public. Spectators undergoing standard perimeter checks. Duty logs initialized.",
    agentSpeech: "Welcome operators to CricSentinel. Narendra Modi Stadium gates are active. 130,000 patrons pre-staged. Standing by for match commencement."
  },
  {
    id: "powerplay",
    title: "POWERPLAY",
    subtitle: "Innings 1 Match Commencement",
    matchStatus: "live",
    matchPhase: "powerplay",
    threatLevel: "low",
    weather: "CLEAR · 30°C · NW @ 10km/h",
    scoreSummary: "RCB 48/1 (5.2 overs) | Innings 1",
    attendance: 125483,
    gateThroughput: 2100,
    egressEta: 45,
    description: "Powerplay overs underway. Crowd decibels exceeding 115dB. Outer gates security flow stabilized. Concourse flows fully nominal.",
    agentSpeech: "Powerplay Active. RCB starts strongly at 48/1. Concourse density checks report ideal flow. Gate stanchions functioning nominal."
  },
  {
    id: "middle_overs",
    title: "MIDDLE OVERS",
    subtitle: "CCTV Security Anomaly Detection",
    matchStatus: "live",
    matchPhase: "middle",
    threatLevel: "elevated",
    weather: "CLEAR · 29°C · NW @ 8km/h",
    scoreSummary: "RCB 112/3 (13.4 overs) | Innings 1",
    attendance: 130224,
    gateThroughput: 350,
    egressEta: 42,
    description: "CCTV anomaly triggered on CAM_14 in Section 312: Unattributed backpack left under seat row 12. Security incident response initialized.",
    agentSpeech: "Attention Operations Lead: Unattended black backpack flagged on CAM_14 (Section 312). Recommending runbook deployment for inspection."
  },
  {
    id: "innings_break",
    title: "INNINGS BREAK",
    subtitle: "Concourse Bottleneck Alert",
    matchStatus: "innings_break",
    matchPhase: "innings_break",
    threatLevel: "amber",
    weather: "CLEAR · 28°C · N @ 7km/h",
    scoreSummary: "RCB 186/6 (20 overs) | Target: 187",
    attendance: 130224,
    gateThroughput: 4800,
    egressEta: 38,
    description: "Innings break has triggered severe bathroom & food concession surges. Gate E ticketing corridor reports critical congestion (112% flow).",
    agentSpeech: "Innings Break active. Concourse throughput peaking at 4.8k/min. Bottleneck detected at Gate E corridor. Recommending diversion to Gate F."
  },
  {
    id: "death_overs",
    title: "DEATH OVERS",
    subtitle: "Storm Radar Weather Shift",
    matchStatus: "live",
    matchPhase: "death",
    threatLevel: "amber",
    weather: "RAIN LIKELY · 26°C · NE @ 24km/h",
    scoreSummary: "MI 164/5 (17.2 overs) | Target: 187",
    attendance: 130224,
    gateThroughput: 900,
    egressEta: 35,
    description: "Death overs peaking. Meteorological Doppler radar reports squall cell approaching stadium from west. Rain hold protocols staged.",
    agentSpeech: "Death overs in progress. Doppler radar flags light precipitation risk in 10 minutes. Rain hold stanchions pre-staged in outer concourses."
  },
  {
    id: "super_over",
    title: "SUPER OVER",
    subtitle: "Match Tie — Crowd Lockdown",
    matchStatus: "super_over",
    matchPhase: "n/a",
    threatLevel: "elevated",
    weather: "LIGHT DRIZZLE · 25°C · NE @ 15km/h",
    scoreSummary: "RCB 186/6 vs MI 186/6 | TIE! SUPER OVER!",
    attendance: 130224,
    gateThroughput: 150,
    egressEta: 48,
    description: "Extreme tension inside Narendra Modi Stadium. Non-emergency exits locked-in under slow-roll posture. Strategic visual feedback.",
    agentSpeech: "Match Tie! Super Over under drizzle. Perimeter exits frozen in slow-roll posture to ensure zero crowd destabilization. Focus is absolute."
  },
  {
    id: "done",
    title: "MATCH DONE",
    subtitle: "Handover & Egress Operations",
    matchStatus: "done",
    matchPhase: "n/a",
    threatLevel: "low",
    weather: "CLEAR SHIFT · 24°C · N @ 12km/h",
    scoreSummary: "RCB WON IPL 2026 IN SUPER OVER!",
    attendance: 130224,
    gateThroughput: 6200,
    egressEta: 22,
    description: "RCB has been crowned Champions. Active egress sequence deployed across all Narendra Modi gates (Egress flow peaking at 6.2k/min).",
    agentSpeech: "RCB wins! Narendra Modi Stadium evacuation fully active. Gates A-F operating at 100% egress capacity. Generating operations brief."
  }
];

// Helper to construct exact initial data state for a given timeline node ID
export function getTimelineNodeState(nodeId: string) {
  const node = TIMELINE_NODES.find(n => n.id === nodeId) || TIMELINE_NODES[0];

  const matchState: MatchState = {
    id: "ipl2026-final",
    teams: { home: "RCB", away: "MI" },
    venue: "Narendra Modi Stadium, Ahmedabad",
    format: "T20",
    innings: nodeId === "done" || nodeId === "super_over" || nodeId === "death_overs" ? 2 : 1,
    status: node.matchStatus,
    phase: node.matchPhase,
    score: {
      runs: nodeId === "pre_match" ? 0 : nodeId === "powerplay" ? 48 : nodeId === "middle_overs" ? 112 : nodeId === "innings_break" ? 186 : 164,
      wickets: nodeId === "pre_match" ? 0 : nodeId === "powerplay" ? 1 : nodeId === "middle_overs" ? 3 : nodeId === "innings_break" ? 6 : 5,
      overs: nodeId === "pre_match" ? "0.0" : nodeId === "powerplay" ? "5.2" : nodeId === "middle_overs" ? "13.4" : nodeId === "innings_break" ? "20.0" : "17.2",
      target: nodeId === "innings_break" || nodeId === "death_overs" || nodeId === "super_over" || nodeId === "done" ? 187 : undefined,
    },
    data_complete: true,
    updated_at: new Date().toISOString()
  };

  const opsPosture: OpsPosture = {
    level: node.threatLevel,
    driver: nodeId === "middle_overs" ? "anomaly=cam14" : nodeId === "innings_break" ? "concourse=gateE_bottleneck" : nodeId === "death_overs" ? "weather=squall" : "phase=" + node.matchPhase,
    since: new Date().toISOString(),
    match_phase: node.matchStatus
  };

  // Specific simulated anomaly
  let currentAnomaly: Anomaly | null = null;
  if (nodeId === "middle_overs") {
    currentAnomaly = {
      id: "anom-001",
      camera: "CAM_14",
      section: "SEC_312",
      kind: "UNATTENDED",
      bbox: [120, 240, 60, 60],
      confidence: 0.81,
      ts: new Date().toISOString()
    };
  } else if (nodeId === "innings_break") {
    currentAnomaly = {
      id: "anom-002",
      camera: "CAM_08",
      section: "GATE_E_CORRIDOR",
      kind: "CROWDING",
      bbox: [310, 180, 120, 90],
      confidence: 0.84,
      ts: new Date().toISOString()
    };
  }

  // Comms list for that state
  const commsEntries: CommsEntry[] = [
    {
      id: "com-001",
      ts: "05:34:10",
      speaker: "system",
      role_color: "grey",
      text: "CricSentinel Command Interface connected. Synced with Narendra Modi Stadium central feed.",
      trace_id: "trx-77189"
    }
  ];

  if (nodeId !== "pre_match") {
    commsEntries.push({
      id: "com-002",
      ts: "05:34:15",
      speaker: "ops_lead",
      role_color: "grey",
      text: "Stadium control room active. Operations staff dispatched across perimeter gates.",
      trace_id: "trx-77190"
    });
  }

  // Inject events based on selected node
  if (nodeId === "powerplay") {
    commsEntries.push({
      id: "com-003",
      ts: "05:34:20",
      speaker: "logistics_03",
      role_color: "cyan",
      text: "Gate A-F spectator ingress finalized. Concourse scanning shows optimal transit behavior.",
      trace_id: "trx-88220"
    });
    commsEntries.push({
      id: "com-004",
      ts: "05:34:25",
      speaker: "agent_orb",
      role_color: "violet",
      text: "Powerplay overs logged. Crowd decibels exceeding 115dB. Sound monitoring points show high focus but completely stable perimeter.",
      trace_id: "trx-88221",
      tool_call: {
        name: "predict_stadium_load",
        args: { phase: "powerplay", density_check: true },
        result_summary: "Status nominal. Capacity utility balanced."
      }
    });
  } else if (nodeId === "middle_overs") {
    commsEntries.push({
      id: "com-003",
      ts: "05:34:22",
      speaker: "guard_14",
      role_color: "grey",
      text: "OPS Check Section 312: Spotting an unattended grey storage bag or backpack under row 12 seat.",
      trace_id: "trx-99100"
    });
    commsEntries.push({
      id: "com-004",
      ts: "05:34:26",
      speaker: "system",
      role_color: "red",
      text: "CCTV incident triggered: CAM_14 object recognition reports confidence 81% on unattended baggage.",
      trace_id: "trx-99102"
    });
    commsEntries.push({
      id: "com-005",
      ts: "05:34:30",
      speaker: "agent_orb",
      role_color: "violet",
      text: "Unattended bag detected by security algorithms. Recommended response sequence loaded into incident runbook. Security staff dispatched.",
      trace_id: "trx-99105",
      tool_call: {
        name: "query_camera",
        args: { camera: "CAM_14", section: "SEC_312" },
        result_summary: "Baggage confirmed. Proposing security runbook."
      }
    });
  } else if (nodeId === "innings_break") {
    commsEntries.push({
      id: "com-003",
      ts: "05:34:21",
      speaker: "guard_07",
      role_color: "grey",
      text: "Gate E transit bottlenecks reported. Ticket scan corridors fully backing up due to high bathroom rush.",
      trace_id: "trx-10110"
    });
    commsEntries.push({
      id: "com-004",
      ts: "05:34:24",
      speaker: "agent_orb",
      role_color: "violet",
      text: "Severe queue forming at Gate E corridor. Analysis shows capacity overload. Pre-positioning alternate route mapping in Comms Log.",
      trace_id: "trx-10114",
      tool_call: {
        name: "predict_bottleneck",
        args: { gate: "Gate E Corridor", horizon_min: 10 },
        result_summary: "Congestion 84% probability inside 5 minutes. Gate F capacity is under 41%."
      }
    });
  } else if (nodeId === "death_overs") {
    commsEntries.push({
      id: "com-003",
      ts: "05:34:22",
      speaker: "system",
      role_color: "amber",
      text: "Doppler radar flags: Squall cloudburst cell moving east directly towards Ahmedabad.",
      trace_id: "trx-20220"
    });
    commsEntries.push({
      id: "com-004",
      ts: "05:34:25",
      speaker: "agent_orb",
      role_color: "violet",
      text: "High humidity and wind vectors suggest localized drizzle inside 10m. Staging rain stanchions and updating stadium non-slip pathway controls.",
      trace_id: "trx-20224",
      tool_call: {
        name: "predict_weather_impact",
        args: { location: "Ahmedabad_Narendra_Modi_Stadium", lead_time_min: 10 },
        result_summary: "Precipitation threat: Moderate. Concourse deployment active."
      }
    });
  } else if (nodeId === "super_over") {
    commsEntries.push({
      id: "com-003",
      ts: "05:34:21",
      speaker: "system",
      role_color: "red",
      text: "MATCH TIED. Entering Super Over. Spectator adrenaline indices at stadium maximum.",
      trace_id: "trx-30310"
    });
    commsEntries.push({
      id: "com-004",
      ts: "05:34:25",
      speaker: "agent_orb",
      role_color: "violet",
      text: "Super Over phase active. Crowd attention is locked on-pitch. Exits are secured in slow-roll status to prevent accidental gate rushes. Stewards alert.",
      trace_id: "trx-30315",
      tool_call: {
        name: "freeze_egress_gates",
        args: { mode: "precautionary" },
        result_summary: "Gate controls switched. Status synchronized."
      }
    });
  } else if (nodeId === "done") {
    commsEntries.push({
      id: "com-003",
      ts: "05:34:20",
      speaker: "system",
      role_color: "cyan",
      text: "MATCH COMPLETED - RCB wins the IPL 2026 Title in Super Over!",
      trace_id: "trx-40410"
    });
    commsEntries.push({
      id: "com-004",
      ts: "05:34:25",
      speaker: "agent_orb",
      role_color: "violet",
      text: "RCB are the Champions. Evacuation protocols active. Commencing full stadium egress on gates A-F. Directing transport hubs to dispatch Ahmedabad metro lines.",
      trace_id: "trx-40416",
      tool_call: {
        name: "get_match_state",
        args: { status: "ended" },
        result_summary: "RCB Victory. 130k spectators evacuating Narendra Modi Stadium safely."
      }
    });
  }

  // Active decision cards
  const decisionCards: DecisionCard[] = [];
  if (nodeId === "middle_overs") {
    decisionCards.push({
      id: "dec-001",
      incident_id: "inc-001",
      type: "SCAN_ANOMALY",
      impact: "HIGH IMPACT",
      confidence: 0.81,
      title: "Activate Security Runbook for Section 312",
      rationale: "Unattended bag detected of size 35x25cm. Security response recommended to neutralize potential hazard.",
      actions: [
        { kind: "primary", label: "INITIATE RUNBOOK", action_id: "initiate_security" },
        { kind: "ghost", label: "FALSE POSITIVE", action_id: "dismiss_security" }
      ],
      expires_at: new Date(Date.now() + 600000).toISOString(),
      schema_version: 1,
      isExecuted: false
    });
  } else if (nodeId === "innings_break") {
    decisionCards.push({
      id: "dec-002",
      incident_id: "inc-002",
      type: "BOTTLENECK_FORMING",
      impact: "MITIGATION",
      confidence: 0.84,
      title: "Divert Gate E Concourse Traffic to Gate F",
      rationale: "Gate E capacity exceeded (112%). Diverting flow via corridor 4 to Gate F (under 41% utilized). Includes emergency PA broadcast script.",
      actions: [
        { kind: "primary", label: "BROADCAST DIVERSION PA", action_id: "broadcast_pa" },
        { kind: "ghost", label: "STAY NOMINAL", action_id: "dismiss_bottleneck" }
      ],
      expires_at: new Date(Date.now() + 600000).toISOString(),
      schema_version: 1,
      isExecuted: false
    });
  } else if (nodeId === "death_overs") {
    decisionCards.push({
      id: "dec-003",
      incident_id: "inc-003",
      type: "WEATHER_SHIFT",
      impact: "HIGH IMPACT",
      confidence: 0.91,
      title: "Deploy Weather Cover Canopy & Slip Paths",
      rationale: "Squall precipitation threat high inside 10 minutes. Requires canopy pre-warnings and non-slip pathing vectors.",
      actions: [
        { kind: "primary", label: "ACTIVATE RAIN RUNBOOK", action_id: "initiate_rain" },
        { kind: "ghost", label: "OVERRIDE PROTOCOL", action_id: "override_weather" }
      ],
      expires_at: new Date(Date.now() + 600000).toISOString(),
      schema_version: 1,
      isExecuted: false
    });
  }

  // Active runbooks for Security Anomaly
  const runbookSteps: RunbookStep[] = [];
  if (nodeId === "middle_overs") {
    runbookSteps.push(
      {
        id: "step-1",
        incident_id: "inc-001",
        order: 1,
        title: "Identify Object on CAM_14",
        description: "Verify bag dimension, material, and unattended timestamp context.",
        state: "completed",
        embed: {
          kind: "anomaly_box",
          camera: "CAM_14",
          text: "Unattended backpack under seat 12 (Section 312). Highlight box coordinates verified by central operator."
        },
        completed_by: "system",
        completed_at: new Date().toISOString()
      },
      {
        id: "step-2",
        incident_id: "inc-001",
        order: 2,
        title: "Dispatch Field Security Lead",
        description: "Duty Guard 14 routed to Section 312 row 12 for localized investigation.",
        state: "active",
        embed: {
          kind: "pa_script",
          text: "Secure alert: Guard 14, please proceed immediately to Section 312, Seat Row 12, under seat container for brief object check. Standby on audio loop."
        },
        completed_by: null,
        completed_at: null
      },
      {
        id: "step-3",
        incident_id: "inc-001",
        order: 3,
        title: "Perimeter Isolation Staging",
        description: "Stage emergency stanchion lines to clear a 5-meter exclusion radius if object verified.",
        state: "pending",
        completed_by: null,
        completed_at: null
      }
    );
  } else if (nodeId === "innings_break") {
    runbookSteps.push(
      {
        id: "step-e1",
        incident_id: "inc-002",
        order: 1,
        title: "Configure Digital Signage Diversions",
        description: "Reprogram lobby and seat corridors to signal Gate F as the preferred concession outlet.",
        state: "completed",
        completed_by: "ops_lead",
        completed_at: new Date().toISOString()
      },
      {
        id: "step-e2",
        incident_id: "inc-002",
        order: 2,
        title: "Trigger PA Stadium Broadcast script",
        description: "Emit pre-recorded diversion audio across Narendra Modi Stadium sound units.",
        state: "active",
        embed: {
          kind: "pa_script",
          text: "Narendra Modi Stadium PA Announcement: 'For your maximum comfort and minimal queue times, visitors inside Sections 150-250 are highly recommended to use Gate F Concourse facilities instead of Gate E.'"
        },
        completed_by: null,
        completed_at: null
      },
      {
        id: "step-e3",
        incident_id: "inc-002",
        order: 3,
        title: "Deploy Concourse Stewards",
        description: "Manual steward redirection lines deployed at Corridor intersection 4.",
        state: "pending",
        completed_by: null,
        completed_at: null
      }
    );
  }

  return {
    node,
    matchState,
    opsPosture,
    currentAnomaly,
    commsEntries,
    decisionCards,
    runbookSteps
  };
}
