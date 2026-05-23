#!/usr/bin/env tsx
/**
 * CricSentinel Agent Eval Runner
 *
 * Usage:
 *   npm run eval                          # run all evalsets
 *   npm run eval -- --evalset 01_core_ops # run one evalset
 *   npm run eval -- --url http://host:3000
 *   npm run eval -- --output results.json
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { scoreRubric, scoreDeterministic } from "./scorer.js";
import type {
  EvalSet,
  EvalConfig,
  CaseResult,
  EvalSetResult,
  EvalSuiteResult,
} from "./types.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ─── CLI args ────────────────────────────────────────────────────────────────

function arg(flag: string): string | undefined {
  const i = process.argv.indexOf(flag);
  return i !== -1 ? process.argv[i + 1] : undefined;
}
const evalsetFilter = arg("--evalset");
const outputPath = arg("--output") ?? path.join(__dirname, "results", `eval_${Date.now()}.json`);

// ─── Load config ─────────────────────────────────────────────────────────────

const config: EvalConfig = JSON.parse(
  fs.readFileSync(path.join(__dirname, "eval_config.json"), "utf8")
);
const serverUrl = arg("--url") ?? config.server_url;

// ─── Colours ─────────────────────────────────────────────────────────────────

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  dim: "\x1b[2m",
};

function pass(s: string) { return `${C.green}${s}${C.reset}`; }
function fail(s: string) { return `${C.red}${s}${C.reset}`; }
function dim(s: string)  { return `${C.dim}${s}${C.reset}`; }
function bold(s: string) { return `${C.bold}${s}${C.reset}`; }

// ─── Health check ─────────────────────────────────────────────────────────────

async function healthCheck(): Promise<void> {
  try {
    const r = await fetch(`${serverUrl}/api/health`, { signal: AbortSignal.timeout(5000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const { status } = await r.json() as { status: string };
    if (status !== "ok") throw new Error(`status=${status}`);
  } catch (e: any) {
    console.error(fail(`\n✗ Server not reachable at ${serverUrl}: ${e.message}`));
    console.error(dim("  Start the server with: npm run dev\n"));
    process.exit(1);
  }
}

// ─── Run a single eval case ───────────────────────────────────────────────────

async function runCase(ec: EvalSet["eval_cases"][0]): Promise<CaseResult> {
  const errors: string[] = [];
  let responseJson: Record<string, unknown> = {};
  let responseText = "";
  let responseTimeMs = 0;
  let isFallback = false;

  const start = Date.now();
  try {
    const resp = await fetch(`${serverUrl}/api/agent-respond`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ec.request),
      signal: AbortSignal.timeout(config.request_timeout_ms),
    });
    responseTimeMs = Date.now() - start;

    if (!resp.ok) {
      errors.push(`HTTP ${resp.status} ${resp.statusText}`);
    } else {
      responseJson = await resp.json() as Record<string, unknown>;
      responseText = (responseJson["text"] as string) ?? "";
      isFallback = responseJson["isFallback"] === true;
    }
  } catch (e: any) {
    responseTimeMs = Date.now() - start;
    errors.push(`Request failed: ${e.message}`);
  }

  const wordCount = responseText.trim().split(/\s+/).filter(Boolean).length;

  // Deterministic checks first (fast, no LLM)
  const detResults = scoreDeterministic(
    responseText,
    responseTimeMs,
    responseJson,
    ec.deterministic_checks ?? {}
  );

  // Rubric checks (LLM judge) — run in parallel
  const rubricEntries = Object.entries(ec.criteria);
  const rubricResults = await Promise.all(
    rubricEntries.map(([, crit]) =>
      scoreRubric(
        crit.rubric,
        ec.request,
        responseText,
        crit.threshold,
        config.judge_model_options
      )
    )
  );

  const criteriaResults: CaseResult["criteria_results"] = { ...detResults };
  rubricEntries.forEach(([key], i) => {
    criteriaResults[key] = rubricResults[i];
  });

  const allPassed = errors.length === 0 &&
    Object.values(criteriaResults).every((r) => r.passed);

  return {
    eval_id: ec.eval_id,
    description: ec.description,
    tags: ec.tags ?? [],
    passed: allPassed,
    response_time_ms: responseTimeMs,
    word_count: wordCount,
    is_fallback: isFallback,
    criteria_results: criteriaResults,
    response_text: responseText,
    tool_call: responseJson["tool_call"] as CaseResult["tool_call"],
    errors,
  };
}

// ─── Run an evalset ───────────────────────────────────────────────────────────

async function runEvalSet(evalset: EvalSet): Promise<EvalSetResult> {
  const cases: CaseResult[] = [];
  for (const ec of evalset.eval_cases) {
    process.stdout.write(`  ${dim("↻")} ${ec.eval_id.padEnd(45, " ")}`);
    const result = await runCase(ec);
    const symbol = result.passed ? pass("✓") : fail("✗");
    const passCount = Object.values(result.criteria_results).filter((r) => r.passed).length;
    const totalCount = Object.keys(result.criteria_results).length;
    const failedKeys = Object.entries(result.criteria_results)
      .filter(([, r]) => !r.passed)
      .map(([k, r]) => `${k}=${r.score.toFixed(2)}<${r.threshold}`)
      .join(", ");
    process.stdout.write(
      `\r  ${symbol} ${ec.eval_id.padEnd(45, " ")}` +
      ` [${passCount}/${totalCount}]` +
      (result.errors.length ? fail(` ERR: ${result.errors[0]}`) : "") +
      (failedKeys ? fail(` FAIL: ${failedKeys}`) : "") +
      `  ${dim(result.response_time_ms + "ms")}\n`
    );
    cases.push(result);
  }

  const passed = cases.filter((c) => c.passed).length;
  const avgRt = Math.round(cases.reduce((s, c) => s + c.response_time_ms, 0) / cases.length);
  return {
    eval_set_id: evalset.eval_set_id,
    name: evalset.name,
    total: cases.length,
    passed,
    failed: cases.length - passed,
    pass_rate: cases.length ? passed / cases.length : 0,
    avg_response_time_ms: avgRt,
    cases,
  };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n${bold("═".repeat(65))}`);
  console.log(`${bold("  CRICSENTINEL @Agent_Orb — AGENT EVAL SUITE")}`);
  console.log(`${dim("  Server: " + serverUrl + "  |  " + new Date().toISOString())}`);
  console.log(`${bold("═".repeat(65))}\n`);

  await healthCheck();
  console.log(pass("  ✓ Server healthy\n"));

  // Discover evalsets
  const evalDir = path.join(__dirname, "evalsets");
  let files = fs.readdirSync(evalDir)
    .filter((f) => f.endsWith(".evalset.json"))
    .sort();

  if (evalsetFilter) {
    files = files.filter((f) => f.includes(evalsetFilter));
    if (!files.length) {
      console.error(fail(`No evalsets matching "${evalsetFilter}"`));
      process.exit(1);
    }
  }

  const evalsetResults: EvalSetResult[] = [];

  for (const file of files) {
    const evalset: EvalSet = JSON.parse(
      fs.readFileSync(path.join(evalDir, file), "utf8")
    );
    console.log(`  ${bold(evalset.eval_set_id)} — ${evalset.name}`);
    console.log(`  ${dim("─".repeat(63))}`);
    const result = await runEvalSet(evalset);
    evalsetResults.push(result);

    const rate = (result.pass_rate * 100).toFixed(0);
    const rateStr = result.pass_rate >= 0.8 ? pass(`${rate}%`) : fail(`${rate}%`);
    console.log(`\n  ${bold("Result:")} ${result.passed}/${result.total} passed (${rateStr}) — avg ${dim(result.avg_response_time_ms + "ms")}\n`);
  }

  // Suite summary
  const totalCases = evalsetResults.reduce((s, r) => s + r.total, 0);
  const totalPassed = evalsetResults.reduce((s, r) => s + r.passed, 0);
  const overallRate = totalCases ? totalPassed / totalCases : 0;
  const suitePassed = overallRate >= config.overall_pass_threshold;

  console.log(`${bold("═".repeat(65))}`);
  const rateStr = (overallRate * 100).toFixed(1) + "%";
  const threshStr = (config.overall_pass_threshold * 100).toFixed(0) + "%";
  console.log(
    `  OVERALL: ${totalPassed}/${totalCases} passed (${suitePassed ? pass(rateStr) : fail(rateStr)})` +
    ` — threshold: ${threshStr}`
  );
  console.log(`${bold("═".repeat(65))}\n`);

  // Write results JSON
  const suiteResult: EvalSuiteResult = {
    timestamp: new Date().toISOString(),
    server_url: serverUrl,
    judge_model: config.judge_model_options.judge_model,
    total_cases: totalCases,
    total_passed: totalPassed,
    total_failed: totalCases - totalPassed,
    overall_pass_rate: overallRate,
    suite_passed: suitePassed,
    overall_pass_threshold: config.overall_pass_threshold,
    evalsets: evalsetResults,
  };

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(suiteResult, null, 2));
  console.log(dim(`  Results written → ${outputPath}\n`));

  process.exit(suitePassed ? 0 : 1);
}

main().catch((e) => {
  console.error(fail(`\nFatal: ${e.message}`));
  process.exit(1);
});
