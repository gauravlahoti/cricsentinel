export interface MatchState {
  id: string;
  teams: { home: string; away: string };
  venue: string;
  format: string;
  innings: number;
  status: string;
  phase: string;
  score: { runs: number; wickets: number; overs: string };
  data_complete: boolean;
  updated_at: string;
}

export interface OpsPosture {
  level: "low" | "elevated" | "amber" | "critical";
  driver: string;
  since: string;
  match_phase: string;
}

export interface Anomaly {
  id: string;
  camera: string;
  section: string;
  kind: "UNATTENDED" | "CROWDING" | "INTRUSION";
  bbox: [number, number, number, number];
  confidence: number;
  ts: string;
}

export interface EvalRequest {
  query: string;
  matchState: MatchState;
  opsPosture: OpsPosture;
  currentAnomaly?: Anomaly | null;
  weather?: string;
}

export interface RubricCriterion {
  rubric: string;
  threshold: number;
}

export interface DeterministicChecks {
  max_word_count?: number;
  max_response_time_ms?: number;
  required_fields?: string[];
  success_must_be_true?: boolean;
  tool_call_must_exist?: boolean;
  text_must_not_contain?: string[];
}

export interface EvalCase {
  eval_id: string;
  description: string;
  tags: string[];
  request: EvalRequest;
  criteria: Record<string, RubricCriterion>;
  deterministic_checks: DeterministicChecks;
}

export interface EvalSet {
  eval_set_id: string;
  name: string;
  description: string;
  eval_cases: EvalCase[];
}

export interface JudgeModelOptions {
  judge_model: string;
  temperature: number;
  num_samples: number;
}

export interface EvalConfig {
  judge_model_options: JudgeModelOptions;
  server_url: string;
  request_timeout_ms: number;
  overall_pass_threshold: number;
}

export interface CriterionResult {
  type: "rubric" | "deterministic";
  score: number;
  passed: boolean;
  threshold: number;
  reason: string;
}

export interface CaseResult {
  eval_id: string;
  description: string;
  tags: string[];
  passed: boolean;
  response_time_ms: number;
  word_count: number;
  is_fallback: boolean;
  criteria_results: Record<string, CriterionResult>;
  response_text: string;
  tool_call?: { name: string; args: Record<string, unknown>; result_summary: string };
  errors: string[];
}

export interface EvalSetResult {
  eval_set_id: string;
  name: string;
  total: number;
  passed: number;
  failed: number;
  pass_rate: number;
  avg_response_time_ms: number;
  cases: CaseResult[];
}

export interface EvalSuiteResult {
  timestamp: string;
  server_url: string;
  judge_model: string;
  total_cases: number;
  total_passed: number;
  total_failed: number;
  overall_pass_rate: number;
  suite_passed: boolean;
  overall_pass_threshold: number;
  evalsets: EvalSetResult[];
}
