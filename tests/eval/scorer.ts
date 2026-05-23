/**
 * Eval scoring engine.
 *
 * Two scorer types:
 *  - Rubric-based: LLM-as-judge (Gemini Flash) rates 1-5, normalised to 0.0-1.0
 *  - Deterministic: word count, response time, schema checks — no LLM call
 */

import { GoogleGenAI } from "@google/genai";
import type { CriterionResult, DeterministicChecks, EvalRequest, JudgeModelOptions } from "./types.js";

let judgeClient: GoogleGenAI | null = null;

function getJudgeClient(): GoogleGenAI {
  if (!judgeClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key || key === "MY_GEMINI_API_KEY") throw new Error("GEMINI_API_KEY required for LLM judge");
    judgeClient = new GoogleGenAI({ apiKey: key });
  }
  return judgeClient;
}

const JUDGE_SYSTEM = `You are a strict evaluation judge for a stadium operations AI agent called @Agent_Orb.
Your task is to score AI-generated responses against a specific rubric.
Be critical. A score of 5 requires the response to fully and clearly satisfy the rubric.
Return ONLY valid JSON with this exact schema: {"score": <integer 1-5>, "reason": "<one sentence>"}`;

function buildJudgePrompt(
  rubric: string,
  request: EvalRequest,
  responseText: string
): string {
  return `RUBRIC:
${rubric}

OPERATIONAL CONTEXT PROVIDED TO AGENT:
- Match Phase: ${request.matchState.phase} (Status: ${request.matchState.status})
- Score: ${request.matchState.score.runs}/${request.matchState.score.wickets} (${request.matchState.score.overs} ov)
- Threat Level: ${request.opsPosture.level} — Driver: ${request.opsPosture.driver}
- Weather: ${request.weather ?? "N/A"}
- Anomaly: ${request.currentAnomaly ? `${request.currentAnomaly.kind} on ${request.currentAnomaly.camera} (${request.currentAnomaly.section})` : "None"}
- Attendance: ~130,000

OPERATOR QUERY:
"${request.query}"

AGENT RESPONSE:
"${responseText}"

Rate 1-5. Return JSON only.`;
}

export async function scoreRubric(
  rubric: string,
  request: EvalRequest,
  responseText: string,
  threshold: number,
  opts: JudgeModelOptions
): Promise<CriterionResult> {
  const scores: number[] = [];
  const reasons: string[] = [];

  for (let i = 0; i < opts.num_samples; i++) {
    try {
      const ai = getJudgeClient();
      const result = await ai.models.generateContent({
        model: opts.judge_model,
        contents: buildJudgePrompt(rubric, request, responseText),
        config: {
          systemInstruction: JUDGE_SYSTEM,
          temperature: opts.temperature,
          responseMimeType: "application/json",
        },
      });

      const raw = result.text?.trim() ?? "{}";
      const parsed = JSON.parse(raw);
      const s = Math.min(5, Math.max(1, Number(parsed.score) || 1));
      scores.push(s);
      reasons.push(parsed.reason ?? "");
    } catch (e: any) {
      scores.push(1);
      reasons.push(`Judge error: ${e.message}`);
    }
  }

  const avgRaw = scores.reduce((a, b) => a + b, 0) / scores.length;
  const score = parseFloat(((avgRaw - 1) / 4).toFixed(3)); // normalise 1-5 → 0.0-1.0
  return {
    type: "rubric",
    score,
    passed: score >= threshold,
    threshold,
    reason: reasons[0] ?? "",
  };
}

export function scoreDeterministic(
  responseText: string,
  responseTimeMs: number,
  responseJson: Record<string, unknown>,
  checks: DeterministicChecks
): Record<string, CriterionResult> {
  const results: Record<string, CriterionResult> = {};

  if (checks.max_word_count !== undefined) {
    const wc = responseText.trim().split(/\s+/).filter(Boolean).length;
    results["word_count"] = {
      type: "deterministic",
      score: wc <= checks.max_word_count ? 1.0 : 0.0,
      passed: wc <= checks.max_word_count,
      threshold: 1.0,
      reason: `${wc} words (limit: ${checks.max_word_count})`,
    };
  }

  if (checks.max_response_time_ms !== undefined) {
    results["response_time"] = {
      type: "deterministic",
      score: responseTimeMs <= checks.max_response_time_ms ? 1.0 : 0.0,
      passed: responseTimeMs <= checks.max_response_time_ms,
      threshold: 1.0,
      reason: `${responseTimeMs}ms (limit: ${checks.max_response_time_ms}ms)`,
    };
  }

  if (checks.success_must_be_true) {
    const ok = responseJson["success"] === true;
    results["success_flag"] = {
      type: "deterministic",
      score: ok ? 1.0 : 0.0,
      passed: ok,
      threshold: 1.0,
      reason: ok ? "success:true" : `success was ${responseJson["success"]}`,
    };
  }

  if (checks.required_fields?.length) {
    const missing = checks.required_fields.filter((f) => !(f in responseJson));
    const ok = missing.length === 0;
    results["schema_fields"] = {
      type: "deterministic",
      score: ok ? 1.0 : 0.0,
      passed: ok,
      threshold: 1.0,
      reason: ok ? "all required fields present" : `missing: ${missing.join(", ")}`,
    };
  }

  if (checks.tool_call_must_exist) {
    const tc = responseJson["tool_call"];
    const ok = !!tc && typeof (tc as any).name === "string";
    results["tool_call_exists"] = {
      type: "deterministic",
      score: ok ? 1.0 : 0.0,
      passed: ok,
      threshold: 1.0,
      reason: ok ? `tool_call.name="${(tc as any).name}"` : "tool_call missing or malformed",
    };
  }

  if (checks.text_must_not_contain?.length) {
    const violations = checks.text_must_not_contain.filter((term) =>
      responseText.toLowerCase().includes(term.toLowerCase())
    );
    const ok = violations.length === 0;
    results["forbidden_content"] = {
      type: "deterministic",
      score: ok ? 1.0 : 0.0,
      passed: ok,
      threshold: 1.0,
      reason: ok ? "no forbidden content found" : `forbidden terms found: ${violations.join(", ")}`,
    };
  }

  return results;
}
