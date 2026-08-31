// Coverage Galaxy — Planet View (Briefing + Workflow)
import { useGame } from '../state/GameContext';
import { MISSIONS } from '../data/missions';
import { runTestSuite, computeCoverage, type TestVector } from '../engine/sim';
import { calcPlanetScore } from '../engine/scoring';

const STEPS = [
  { label: '📡 Import', icon: '📡' },
  { label: '🔗 Requisiti', icon: '🔗' },
  { label: '🔎 Dipendenze', icon: '🔎' },
  { label: '⚖️ Keep/Stub', icon: '⚖️' },
  { label: '⚙️ Stub Config', icon: '⚙️' },
  { label: '🧪 Crea Test', icon: '🧪' },
  { label: '🎯 Expected', icon: '🎯' },
  { label: '▶️ Esegui', icon: '▶️' },
  { label: '📊 Coverage', icon: '📊' },
  { label: '🚨 Triage', icon: '🚨' },
  { label: '🔧 Fix', icon: '🔧' },
  { label: '📋 Anomalie', icon: '📋' },
  { label: '🔁 Regression', icon: '🔁' },
];

export default function PlanetView() {
  const { state, dispatch } = useGame();
  const { currentMission: m, currentPlanetState: ps, workflowStep } = state;

  if (!m || !ps) return <div className="p-4 text-dim">Nessuna missione selezionata.</div>;

  const mission = MISSIONS.find(mi => mi.id === m.id)!;

  const handleRunTests = () => {
    const tests: TestVector[] = ps.tests.map(t => ({
      id: t.id, name: t.name, type: t.type,
      inputs: t.inputs, expectedOutputs: t.expectedOutputs, expectedCalls: t.expectedCalls,
    }));
    const results = runTestSuite(tests, mission.sim as any, ps.stubConfigs as Record<string, unknown>);
    results.forEach(r => {
      dispatch({ type: 'SET_TEST_RESULT', missionId: m.id, testId: r.testId, result: r.pass ? 'pass' : 'fail' });
    });
    const cov = computeCoverage(results as any, mission.stations, mission.routes, mission.moons);
    dispatch({ type: 'SET_COVERAGE', missionId: m.id, coverage: { statement: cov.statement.pct, branch: cov.branch.pct, mcdc: cov.mcdc.pct, timestamp: Date.now() } });
  };

  const handleComplete = () => {
    const score = calcPlanetScore({
      coveragePct: ps.coverage.statement,
      testsUsed: ps.tests.length,
      testsOptimal: Math.ceil(m.stations.length * 0.6),
      triageCorrect: ps.anomalies.filter(a => a.status === 'accepted').length,
      triageTotal: ps.anomalies.length + 1,
      anomaliesTruePositive: ps.anomalies.filter(a => a.status === 'accepted').length,
      anomaliesFalsePositive: ps.anomalies.filter(a => a.status === 'rejected').length,
      regressionClean: true,
      mode: state.progress.profile.mode,
      hintsUsed: state.progress.profile.hintsUsed,
    });
    dispatch({ type: 'COMPLETE_MISSION', missionId: m.id, score });
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-hud/80 border-b border-cyan/20">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })} className="text-dim text-sm">◀</button>
        <span className="text-lg">{m.planetEmoji}</span>
        <div className="flex-1">
          <div className="text-sm font-bold text-cyan">{m.planetName}</div>
          <div className="text-[10px] text-dim">{m.config.label}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-amber font-mono">{ps.coverage.statement}% stmt</div>
          <div className="text-[10px] text-dim font-mono">{ps.tests.length} test</div>
        </div>
      </div>

      {/* Step progress */}
      <div className="flex gap-0.5 px-2 py-1.5 bg-space2 overflow-x-auto">
        {STEPS.map((s, i) => (
          <button key={i} onClick={() => dispatch({ type: 'SET_WORKFLOW_STEP', step: i })}
            className={`flex-none px-2 py-1 rounded text-[9px] font-bold transition-all ${
              i === workflowStep ? 'bg-cyan text-space' : i < workflowStep ? 'bg-green-dim text-green' : 'bg-hud text-dim'
            }`}>{s.icon}</button>
        ))}
      </div>

      {/* Step content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        <StepContent step={workflowStep} mission={mission} state={ps} dispatch={dispatch} />

        {/* Navigation */}
        <div className="flex gap-2 pt-2 pb-4">
          {workflowStep > 0 && (
            <button onClick={() => dispatch({ type: 'SET_WORKFLOW_STEP', step: workflowStep - 1 })}
              className="flex-1 py-2 bg-hud border border-cyan/20 rounded-lg text-sm text-dim">◀ Indietro</button>
          )}
          {workflowStep < STEPS.length - 1 ? (
            <button onClick={() => dispatch({ type: 'SET_WORKFLOW_STEP', step: workflowStep + 1 })}
              className="flex-1 py-2 bg-cyan/20 border border-cyan/40 rounded-lg text-sm text-cyan font-bold">Avanti ▶</button>
          ) : (
            <button onClick={handleComplete}
              className="flex-1 py-2 bg-green/20 border border-green/40 rounded-lg text-sm text-green font-bold">🏆 Conquista</button>
          )}
          {workflowStep === 7 && (
            <button onClick={handleRunTests}
              className="flex-none px-4 py-2 bg-amber/20 border border-amber/40 rounded-lg text-sm text-amber font-bold">▶ RUN</button>
          )}
        </div>
      </div>
    </div>
  );
}

function StepContent({ step, mission, state, dispatch }: {
  step: number; mission: typeof MISSIONS[0]; state: any; dispatch: any;
}) {
  switch (step) {
    case 0: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">📡 Import del modulo</h3>
        <div className="bg-hud rounded-lg border border-cyan/20 p-3">
          <div className="text-[10px] text-amber font-mono mb-1">SIGNATURE</div>
          <div className="text-xs text-green font-mono">{mission.functionSig}</div>
        </div>
        <div className="bg-hud rounded-lg border border-cyan/20 p-3 max-h-48 overflow-y-auto">
          <div className="text-[10px] text-amber font-mono mb-1">SOURCE CODE</div>
          <pre className="text-[10px] text-dim font-mono whitespace-pre-wrap leading-relaxed">{mission.sourceCode}</pre>
        </div>
      </div>
    );
    case 1: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">🔗 Requisiti collegati</h3>
        {mission.requirements.map((r: any) => (
          <div key={r.id} className="bg-hud rounded-lg border border-cyan/20 p-2">
            <div className="text-[10px] text-amber font-mono">{r.id}</div>
            <div className="text-xs text-dim">{r.text}</div>
            <div className="text-[9px] text-blue mt-1">Metodo: {r.method}</div>
          </div>
        ))}
      </div>
    );
    case 2: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">🔎 Scan dipendenze</h3>
        {mission.dependencies.length === 0 ? (
          <div className="bg-hud rounded-lg border border-cyan/20 p-3 text-xs text-dim">Nessuna dipendenza esterna rilevata. Funzione autonoma.</div>
        ) : (
          mission.dependencies.map((d: any) => (
            <div key={d.id} className="bg-hud rounded-lg border border-cyan/20 p-2 flex items-center gap-2">
              <span className="text-lg">{d.kind === 'hw' ? '🔧' : d.kind === 'function' ? '📦' : d.kind === 'global' ? '🌍' : '❓'}</span>
              <div>
                <div className="text-xs text-amber font-mono">{d.name}</div>
                <div className="text-[10px] text-dim">Tipo: {d.kind} · {d.keepable ? 'Attracca o Stub' : 'Solo Stub'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    );
    case 3: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">⚖️ Keep vs Stub</h3>
        {mission.dependencies.filter((d: any) => d.keepable).map((d: any) => {
          const kept = state.keptDeps.includes(d.id);
          return (
            <div key={d.id} className="bg-hud rounded-lg border border-cyan/20 p-2 flex items-center justify-between">
              <span className="text-xs text-dim">{d.name}</span>
              <div className="flex gap-1">
                <button onClick={() => {
                  const newDeps = kept ? state.keptDeps.filter((k: string) => k !== d.id) : [...state.keptDeps, d.id];
                  dispatch({ type: 'SET_KEPT_DEPS', missionId: mission.id, deps: newDeps });
                }}
                  className={`px-2 py-1 rounded text-[10px] font-bold ${kept ? 'bg-green/20 text-green border border-green/40' : 'bg-amber/20 text-amber border border-amber/40'}`}>
                  {kept ? 'ATTRACCA' : 'STUB'}
                </button>
              </div>
            </div>
          );
        })}
        {mission.dependencies.filter((d: any) => !d.keepable).length > 0 && (
          <div className="text-[10px] text-dim">Dipendenze HW: sempre stub (non eseguibili in simulazione)</div>
        )}
      </div>
    );
    case 4: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">⚙️ Configura Stub</h3>
        {mission.dependencies.map((d: any) => (
          <div key={d.id} className="bg-hud rounded-lg border border-cyan/20 p-2">
            <div className="text-[10px] text-amber font-mono mb-1">{d.name}</div>
            <input type="text" placeholder="Valore di ritorno..."
              value={String(state.stubConfigs[d.id] ?? '')}
              onChange={e => dispatch({ type: 'SET_STUB_CONFIG', missionId: mission.id, depId: d.id, config: e.target.value })}
              className="w-full bg-space border border-cyan/20 rounded px-2 py-1 text-xs text-green font-mono" />
          </div>
        ))}
        <div className="text-[10px] text-dim">⚠️ Stub mal configurati causano FAIL classificabili come "stub error"</div>
      </div>
    );
    case 5: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">🧪 Crea Test</h3>
        <button onClick={() => {
          dispatch({ type: 'ADD_TEST', missionId: mission.id, test: {
            id: `T${Date.now()}`, name: `Test ${state.tests.length + 1}`, type: 'nominal',
            inputs: {}, expectedOutputs: {}, result: 'not_run',
          }});
        }} className="w-full py-2 bg-cyan/10 border border-cyan/30 rounded-lg text-xs text-cyan font-bold">+ Nuovo Test</button>
        {state.tests.map((t: any) => (
          <div key={t.id} className="bg-hud rounded-lg border border-cyan/20 p-2">
            <div className="flex items-center justify-between mb-1">
              <input value={t.name} onChange={e => dispatch({ type: 'UPDATE_TEST', missionId: mission.id, test: { ...t, name: e.target.value } })}
                className="bg-transparent text-xs text-amber font-mono font-bold border-b border-amber/20 outline-none" />
              <select value={t.type} onChange={e => dispatch({ type: 'UPDATE_TEST', missionId: mission.id, test: { ...t, type: e.target.value } })}
                className="bg-space text-[10px] text-dim border border-cyan/20 rounded px-1">
                <option value="nominal">Nominale</option>
                <option value="boundary">Limite (BVA)</option>
                <option value="negative">Negativo</option>
                <option value="robustness">Robustezza</option>
              </select>
            </div>
            {mission.sim.inputs.map((inp: any) => (
              <div key={inp.name} className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-dim w-24">{inp.name}:</span>
                <input type="text" placeholder={inp.type}
                  value={String(t.inputs[inp.name] ?? '')}
                  onChange={e => {
                    const val = e.target.value === '' ? '' : isNaN(Number(e.target.value)) ? e.target.value : Number(e.target.value);
                    dispatch({ type: 'UPDATE_TEST', missionId: mission.id, test: { ...t, inputs: { ...t.inputs, [inp.name]: val } } });
                  }}
                  className="flex-1 bg-space border border-cyan/20 rounded px-2 py-0.5 text-[10px] text-green font-mono" />
              </div>
            ))}
            <button onClick={() => dispatch({ type: 'REMOVE_TEST', missionId: mission.id, testId: t.id })}
              className="mt-1 text-[9px] text-red/60 hover:text-red">Elimina</button>
          </div>
        ))}
      </div>
    );
    case 6: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">🎯 Expected Results</h3>
        <div className="text-[10px] text-dim">Definisci gli output attesi per ogni test. I valori vengono confrontati con i risultati della simulazione.</div>
        {state.tests.map((t: any) => (
          <div key={t.id} className="bg-hud rounded-lg border border-cyan/20 p-2">
            <div className="text-xs text-amber font-mono mb-1">{t.name}</div>
            <div className="text-[10px] text-dim">
              Input: {Object.entries(t.inputs).map(([k, v]) => `${k}=${v}`).join(', ') || 'non definito'}
            </div>
            <div className="text-[10px] text-dim mt-1">
              Output atteso: {t.expectedOutputs ? JSON.stringify(t.expectedOutputs) : 'non definito'}
            </div>
          </div>
        ))}
      </div>
    );
    case 7: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">▶️ Esecuzione Test Harness</h3>
        <div className="text-[10px] text-dim">Premi RUN per eseguire tutti i test. La simulazione deterministica calcola il percorso di esecuzione.</div>
        <div className="bg-hud rounded-lg border border-cyan/20 p-3 space-y-1">
          <div className="text-[10px] text-amber font-mono">STATO SIMULAZIONE</div>
          <div className="text-xs text-dim">Test: {state.tests.length} · Target: {mission.stations.length} stazioni, {mission.routes.filter((r: any) => r.decisionId).length * 2} rami</div>
          <div className="text-xs text-dim">Config: {mission.config.label}</div>
        </div>
        {state.tests.length === 0 && <div className="text-[10px] text-red">⚠️ Nessun test definito. Crea almeno un test prima di eseguire.</div>}
      </div>
    );
    case 8: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">📊 Coverage Report</h3>
        <CoverageBar label="Statement" value={state.coverage.statement} target={mission.coverageTargets.statement} color="cyan" />
        <CoverageBar label="Branch" value={state.coverage.branch} target={mission.coverageTargets.branch} color="amber" />
        {mission.coverageTargets.mcdc !== undefined && mission.coverageTargets.mcdc > 0 && (
          <CoverageBar label="MC/DC" value={state.coverage.mcdc} target={mission.coverageTargets.mcdc} color="green" />
        )}
        <div className="bg-hud rounded-lg border border-cyan/20 p-3 mt-2">
          <div className="text-[10px] text-amber font-mono mb-1">MAPPA COPERTURA</div>
          <div className="grid grid-cols-5 gap-1">
            {mission.stations.map((s: any) => (
              <div key={s.id} className={`text-center text-[8px] p-1 rounded ${
                state.coverage.statement >= 100 ? 'bg-green-dim text-green' : 'bg-space text-dim'
              }`}>{s.id}</div>
            ))}
          </div>
        </div>
      </div>
    );
    case 9: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">🚨 Triage FAIL</h3>
        <div className="text-[10px] text-dim">Classifica ogni FAIL: test errato, stub mal configurato, o defect del codice.</div>
        {state.tests.filter((t: any) => t.result === 'fail').map((t: any) => (
          <div key={t.id} className="bg-red-dim rounded-lg border border-red/30 p-2">
            <div className="text-xs text-red font-mono mb-1">FAIL: {t.name}</div>
            <div className="flex gap-1">
              {(['test', 'stub', 'code'] as const).map(cls => (
                <button key={cls} onClick={() => dispatch({ type: 'UPDATE_TEST', missionId: mission.id, test: { ...t, triageClass: cls } })}
                  className={`flex-1 py-1 rounded text-[10px] font-bold ${
                    t.triageClass === cls ? 'bg-cyan text-space' : 'bg-hud text-dim border border-cyan/20'
                  }`}>
                  {cls === 'test' ? 'Test' : cls === 'stub' ? 'Stub' : 'Codice'}
                </button>
              ))}
            </div>
          </div>
        ))}
        {state.tests.filter((t: any) => t.result === 'fail').length === 0 && (
          <div className="text-xs text-green">✅ Nessun FAIL da triagare!</div>
        )}
      </div>
    );
    case 10: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">🔧 Fix</h3>
        <div className="text-[10px] text-dim">Correggi test sbagliati o riconfigura stub. Poi riesegui il test harness.</div>
        {state.tests.filter((t: any) => t.triageClass === 'test').map((t: any) => (
          <div key={t.id} className="bg-hud rounded-lg border border-amber/20 p-2">
            <div className="text-xs text-amber">⚠️ {t.name} — test errato: correggi input o expected</div>
          </div>
        ))}
        {state.tests.filter((t: any) => t.triageClass === 'stub').map((t: any) => (
          <div key={t.id} className="bg-hud rounded-lg border border-amber/20 p-2">
            <div className="text-xs text-amber">⚠️ {t.name} — stub mal configurato: torna a step 4</div>
          </div>
        ))}
      </div>
    );
    case 11: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">📋 Anomalie (Defect Report)</h3>
        <div className="text-[10px] text-dim">Se il problema è nel codice, apri un anomalia formale.</div>
        {state.tests.filter((t: any) => t.triageClass === 'code').map((t: any) => (
          <div key={t.id} className="bg-hud rounded-lg border border-red/20 p-2">
            <div className="text-xs text-red font-mono mb-1">DEFECT: {t.name}</div>
            <button onClick={() => {
              dispatch({ type: 'ADD_ANOMALY', missionId: mission.id, anomaly: {
                id: `ANO-${Date.now()}`, severity: 'Major', description: `FAIL in ${t.name}: ${t.result}`,
                requirementId: mission.requirements[0]?.id || '', stationId: mission.stations[0]?.id || '',
                status: 'open', createdAt: Date.now(),
              }});
            }} className="w-full py-1 bg-red/10 border border-red/30 rounded text-[10px] text-red font-bold">
              + Apri Anomalia
            </button>
          </div>
        ))}
        {state.anomalies.map((a: any) => (
          <div key={a.id} className="bg-hud rounded-lg border border-red/20 p-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-red font-mono">{a.id}</span>
              <span className={`text-[9px] px-1 rounded ${
                a.severity === 'Critical' ? 'bg-red text-white' : a.severity === 'Major' ? 'bg-amber text-space' : 'bg-hud text-dim'
              }`}>{a.severity}</span>
            </div>
            <div className="text-[10px] text-dim mt-1">{a.description}</div>
            <div className="text-[9px] text-blue mt-1">REQ: {a.requirementId} · STATION: {a.stationId}</div>
          </div>
        ))}
      </div>
    );
    case 12: return (
      <div className="space-y-2">
        <h3 className="text-sm font-bold text-cyan">🔁 Regression Campaign</h3>
        <div className="text-[10px] text-dim">Riesegui tutti i test per verificare che nulla si sia rotto dopo le correzioni.</div>
        <div className="bg-hud rounded-lg border border-cyan/20 p-3">
          <div className="text-xs text-green">✅ Tutti i test passano</div>
          <div className="text-[10px] text-dim mt-1">Coverage: {state.coverage.statement.toFixed(0)}% stmt · {state.coverage.branch.toFixed(0)}% branch</div>
          <div className="text-[10px] text-dim">Anomalie aperte: {state.anomalies.filter((a: any) => a.status === 'open').length}</div>
        </div>
      </div>
    );
    default: return <div className="text-dim text-xs">Step {step + 1}</div>;
  }
}

function CoverageBar({ label, value, target, color }: { label: string; value: number; target: number; color: string }) {
  const met = value >= target;
  const colorMap: Record<string, string> = { cyan: 'from-cyan to-blue', amber: 'from-amber to-orange', green: 'from-green to-emerald' };
  return (
    <div className="bg-hud rounded-lg border border-cyan/20 p-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-[10px] text-dim">{label}</span>
        <span className={`text-[10px] font-mono font-bold ${met ? 'text-green' : 'text-amber'}`}>{value.toFixed(0)}% / {target}%</span>
      </div>
      <div className="h-2 bg-space rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${colorMap[color] || colorMap.cyan} rounded-full transition-all`}
          style={{ width: `${Math.min(100, value)}%` }} />
      </div>
      {met && <div className="text-[9px] text-green mt-1">✅ Target raggiunto</div>}
    </div>
  );
}
