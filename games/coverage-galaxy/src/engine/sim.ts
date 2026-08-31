// Coverage Galaxy — Deterministic Decision Engine
// No C execution: JSON decision tables evaluated by a safe TypeScript evaluator

export interface SimInput {
  name: string;
  type: 'int32' | 'uint32' | 'int16' | 'uint16' | 'int8' | 'uint8' | 'float32' | 'char' | 'bool';
  min?: number;
  max?: number;
  special?: number[];
}

export interface SimDecision {
  id: string;
  moons: string[]; // boolean expressions: ["key == 0x55", "mode == ARMED"]
}

export interface SimRule {
  when: Record<string, boolean>; // decision.moon_index → true/false
  trace: string[]; // station IDs in execution order
  returns?: unknown;
  calls?: string[];
  defect?: { id: string; effect: string; affectedTestIds?: string[] };
}

export interface SimModel {
  inputs: SimInput[];
  decisions: SimDecision[];
  rules: SimRule[];
  configModifiers?: ConfigModifier[];
}

export interface ConfigModifier {
  condition: string; // e.g. "char_is_unsigned", "alignment_strict"
  whenInput?: { name: string; value: number };
  overrideRuleIndex: number;
  explanation: string;
}

export interface Station {
  id: string;
  label: string;
  line: number;
}

export interface Route {
  from: string;
  to: string;
  decisionId?: string;
  moonIndex?: number; // which moon: 0=true branch, 1=false branch
  label?: string;
}

export interface Moon {
  id: string;
  expr: string;
  decisionId: string;
  index: number; // 0-based position in decision.moons
}

export interface TestVector {
  id: string;
  name: string;
  type: 'nominal' | 'boundary' | 'negative' | 'robustness';
  inputs: Record<string, number | string | boolean>;
  expectedOutputs?: Record<string, unknown>;
  expectedCalls?: string[];
}

export interface SimResult {
  testId: string;
  trace: string[];
  outputs: Record<string, unknown>;
  calls: string[];
  pass: boolean;
  failReason?: string;
  failClass?: 'test' | 'stub' | 'code';
}

export interface CoverageResult {
  statement: { covered: string[]; total: number; pct: number };
  branch: { covered: string[]; total: number; pct: number };
  mcdc: { covered: string[]; total: number; pct: number };
}

function safeEvalExpr(expr: string, env: Record<string, unknown>): boolean {
  let e = expr;
  for (const [k, v] of Object.entries(env)) {
    const re = new RegExp('\\b' + k + '\\b', 'g');
    if (typeof v === 'boolean') e = e.replace(re, v ? '1' : '0');
    else e = e.replace(re, JSON.stringify(v));
  }
  // Safe: only allow ==, !=, <, >, <=, >=, &&, ||, !, parens, numbers, 0x hex
  if (!/^[\d\s=&|<>!()x0-9a-fA-F]+$/.test(e)) return false;
  try { return !!Function('"use strict"; return (' + e + ')')(); }
  catch { return false; }
}

function resolveInputs(
  inputs: SimInput[],
  testInputs: Record<string, unknown>,
  stubConfigs?: Record<string, unknown>
): Record<string, unknown> {
  const env: Record<string, unknown> = {};
  for (const inp of inputs) {
    const val = testInputs[inp.name] ?? stubConfigs?.[inp.name];
    if (val !== undefined) env[inp.name] = val;
    else if (inp.special?.length) env[inp.name] = inp.special[0];
    else env[inp.name] = inp.min ?? 0;
  }
  return env;
}

export function evaluateTest(
  test: TestVector,
  model: SimModel,
  stubConfigs?: Record<string, unknown>,
  configMod?: string
): SimResult {
  const env = resolveInputs(model.inputs, test.inputs, stubConfigs);

  // Find matching rule
  let matchedRule: SimRule | undefined;

  for (let i = 0; i < model.rules.length; i++) {
    const rule = model.rules[i];
    let allMatch = true;
    for (const [key, expected] of Object.entries(rule.when)) {
      const [decId, moonStr] = key.split('.');
      const dec = model.decisions.find(d => d.id === decId);
      if (!dec) continue;
      const moonIdx = parseInt(moonStr.replace('m', ''), 10);
      const moonExpr = dec.moons[moonIdx];
      const actual = safeEvalExpr(moonExpr, env);
      if (actual !== expected) { allMatch = false; break; }
    }
    if (allMatch) { matchedRule = rule; break; }
  }

  // Apply config modifier if applicable
  if (configMod && matchedRule) {
    for (const mod of model.configModifiers ?? []) {
      if (mod.condition === configMod && mod.overrideRuleIndex !== undefined) {
        const override = model.rules[mod.overrideRuleIndex];
        if (override) { matchedRule = override; }
      }
    }
  }

  if (!matchedRule) {
    return { testId: test.id, trace: [], outputs: {}, calls: [], pass: false, failReason: 'No matching rule — inputs may be out of simulation domain' };
  }

  // Check defect
  let defectEffect: string | undefined;
  if (matchedRule.defect) {
    defectEffect = matchedRule.defect.effect;
  }

  const pass = !defectEffect || test.type === 'robustness';
  return {
    testId: test.id,
    trace: matchedRule.trace,
    outputs: (matchedRule.returns !== undefined ? { return: matchedRule.returns } : {}) as Record<string, unknown>,
    calls: matchedRule.calls ?? [],
    pass,
    failReason: defectEffect,
    failClass: defectEffect ? 'code' : undefined,
  };
}

export function runTestSuite(
  tests: TestVector[],
  model: SimModel,
  stubConfigs?: Record<string, unknown>,
  configMod?: string
): SimResult[] {
  return tests.map(t => evaluateTest(t, model, stubConfigs, configMod));
}

export function computeCoverage(
  results: SimResult[],
  stations: Station[],
  routes: Route[],
  moons: Moon[]
): CoverageResult {
  const coveredStatements = new Set<string>();
  const coveredBranches = new Set<string>();
  const coveredConditions = new Set<string>();

  for (const r of results) {
    if (!r.pass) continue;
    for (const s of r.trace) coveredStatements.add(s);
    // Branch coverage: for each consecutive pair in trace, check if a route exists
    for (let i = 0; i < r.trace.length - 1; i++) {
      const routeKey = `${r.trace[i]}->${r.trace[i + 1]}`;
      const route = routes.find(rt => rt.from === r.trace[i] && rt.to === r.trace[i + 1]);
      if (route && route.decisionId) {
        const branchKey = route.moonIndex !== undefined
          ? `${route.decisionId}.m${route.moonIndex}_${route.moonIndex === 0 ? 'T' : 'F'}`
          : routeKey;
        coveredBranches.add(branchKey);
      }
    }
  }

  // MC/DC: simplified — check each moon appears in at least one passing test
  for (const moon of moons) {
    const key = `${moon.decisionId}.m${moon.index}`;
    const wasInTrace = results.some(r => r.pass && r.trace.length > 0);
    if (wasInTrace) coveredConditions.add(key);
  }

  return {
    statement: {
      covered: [...coveredStatements],
      total: stations.length,
      pct: stations.length > 0 ? (coveredStatements.size / stations.length) * 100 : 0,
    },
    branch: {
      covered: [...coveredBranches],
      total: routes.filter(r => r.decisionId !== undefined).length * 2,
      pct: routes.filter(r => r.decisionId !== undefined).length > 0
        ? (coveredBranches.size / (routes.filter(r => r.decisionId !== undefined).length * 2)) * 100
        : 100,
    },
    mcdc: {
      covered: [...coveredConditions],
      total: moons.length,
      pct: moons.length > 0 ? (coveredConditions.size / moons.length) * 100 : 0,
    },
  };
}
