export type MatchStatus = 'pre_match' | 'live' | 'innings_break' | 'rain_hold' | 'strategic_timeout' | 'super_over' | 'done';
export type MatchPhase = 'powerplay' | 'middle' | 'death' | 'innings_break' | 'n/a';
export type ThreatLevel = 'low' | 'elevated' | 'amber' | 'critical';

export interface MatchState {
  id: string;
  teams: {
    home: string; // e.g. "RCB"
    away: string; // e.g. "MI"
  };
  venue: string;
  format: string;
  innings: number;
  target?: number;
  status: MatchStatus;
  phase: MatchPhase;
  score: {
    runs: number;
    wickets: number;
    overs: string;
    target?: number;
    rr?: string; // Run Rate
    rrr?: string; // Required Run Rate
    ballsBowled?: number;
  };
  data_complete: boolean;
  updated_at: string;
}

export interface OpsPosture {
  level: ThreatLevel;
  driver: string;
  since: string;
  match_phase: MatchStatus;
}

export interface TelemetryItem {
  id: string;
  kind: 'attendance' | 'gate_throughput' | 'egress_eta' | 'threat_level' | 'weather' | 'density';
  value: string | number;
  unit: string;
  location: string | null;
  ts: string;
  schema_version: number;
}

export interface ToolCallPayload {
  name: string;
  args: Record<string, any>;
  result_summary: string;
}

export interface CommsEntry {
  id: string;
  ts: string;
  speaker: 'system' | 'agent_orb' | 'guard_07' | 'guard_14' | 'ops_lead' | 'logistics_03';
  role_color: 'cyan' | 'violet' | 'grey' | 'amber' | 'red';
  text: string;
  tool_call?: ToolCallPayload;
  trace_id: string;
}

export interface DecisionCardAction {
  kind: 'primary' | 'ghost';
  label: string;
  action_id: string;
}

export interface DecisionCard {
  id: string;
  incident_id: string | null;
  type: 'BOTTLENECK_FORMING' | 'WEATHER_SHIFT' | 'SCAN_ANOMALY' | 'PHASE_POSTURE';
  impact: 'HIGH IMPACT' | 'MITIGATION';
  confidence: number;
  title: string;
  rationale: string;
  actions: DecisionCardAction[];
  expires_at: string;
  schema_version: number;
  isExecuted?: boolean;
}

export interface RunbookStep {
  id: string;
  incident_id: string;
  order: number;
  title: string;
  description: string;
  state: 'pending' | 'active' | 'completed';
  embed?: {
    kind: 'pa_script' | 'image' | 'anomaly_box';
    text?: string;
    imageUrl?: string;
    camera?: string;
    details?: string;
  };
  completed_by: string | null;
  completed_at: string | null;
}

export interface Anomaly {
  id: string;
  camera: string;
  section: string;
  kind: 'UNATTENDED' | 'CROWDING' | 'INTRUSION';
  bbox: [number, number, number, number]; // [x, y, w, h]
  confidence: number;
  ts: string;
}

export interface ReplayTimelineNode {
  id: string;
  title: string;
  subtitle: string;
  matchStatus: MatchStatus;
  matchPhase: MatchPhase;
  threatLevel: ThreatLevel;
  weather: string;
  scoreSummary: string;
  attendance: number;
  gateThroughput: number;
  egressEta: number;
  description: string;
  agentSpeech: string;
}
