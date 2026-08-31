// Coverage Galaxy — Report + Export
import { useGame } from '../state/GameContext';
import { MISSIONS } from '../data/missions';
import { BADGES } from '../engine/scoring';

export default function ReportView() {
  const { state, dispatch } = useGame();
  const { profile, planetStates } = state.progress;

  const completed = MISSIONS.filter(m => planetStates[m.id]?.status === 'completed');
  const totalScore = completed.reduce((s, m) => s + (planetStates[m.id]?.score ?? 0), 0);
  const totalTests = Object.values(planetStates).reduce((s, ps) => s + ps.tests.length, 0);
  const totalAnomalies = Object.values(planetStates).reduce((s, ps) => s + ps.anomalies.length, 0);

  const handleExport = () => {
    const data = {
      exportDate: new Date().toISOString(),
      profile: state.progress.profile,
      planets: MISSIONS.map(m => ({
        id: m.id, name: m.planetName,
        status: planetStates[m.id]?.status ?? 'locked',
        coverage: planetStates[m.id]?.coverage,
        tests: planetStates[m.id]?.tests,
        anomalies: planetStates[m.id]?.anomalies,
        score: planetStates[m.id]?.score,
      })),
      badges: profile.badges.map(b => ({ id: b, ...BADGES[b] })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `coverage-galaxy-report-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 bg-hud/80 border-b border-cyan/20">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })} className="text-dim text-sm">◀</button>
        <span className="text-lg">📊</span>
        <div className="flex-1 text-sm font-bold text-cyan">Report Accademia</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-4">
        {/* Summary */}
        <div className="bg-hud rounded-lg border border-cyan/20 p-3">
          <div className="text-[10px] text-amber font-mono mb-2">PROFILO</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div><span className="text-dim">Rank:</span> <span className="text-cyan font-bold">{profile.rank}</span></div>
            <div><span className="text-dim">XP:</span> <span className="text-amber font-mono">{totalScore}</span></div>
            <div><span className="text-dim">Pianeti:</span> <span className="text-green">{completed.length}/{MISSIONS.length}</span></div>
            <div><span className="text-dim">Test:</span> <span className="text-blue">{totalTests}</span></div>
            <div><span className="text-dim">Anomalie:</span> <span className="text-red">{totalAnomalies}</span></div>
            <div><span className="text-dim">Badge:</span> <span className="text-purple">{profile.badges.length}</span></div>
          </div>
        </div>

        {/* Badges */}
        {profile.badges.length > 0 && (
          <div className="bg-hud rounded-lg border border-cyan/20 p-3">
            <div className="text-[10px] text-amber font-mono mb-2">BADGE</div>
            <div className="grid grid-cols-3 gap-1">
              {profile.badges.map(b => (
                <div key={b} className="text-center p-1">
                  <div className="text-lg">{BADGES[b]?.icon}</div>
                  <div className="text-[8px] text-dim">{BADGES[b]?.name}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Planet details */}
        {MISSIONS.map(m => {
          const ps = planetStates[m.id];
          if (!ps) return null;
          return (
            <div key={m.id} className="bg-hud rounded-lg border border-cyan/20 p-2">
              <div className="flex items-center gap-2 mb-1">
                <span>{m.planetEmoji}</span>
                <span className="text-xs text-amber font-bold flex-1">{m.planetName}</span>
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                  ps.status === 'completed' ? 'bg-green-dim text-green' : ps.status === 'in_progress' ? 'bg-amber-dim text-amber' : 'bg-hud text-dim'
                }`}>{ps.status === 'completed' ? '✅' : ps.status === 'in_progress' ? '🔄' : '🔒'}</span>
              </div>
              {ps.status !== 'locked' && (
                <div className="grid grid-cols-3 gap-1 text-[9px]">
                  <div className="text-dim">Stmt: <span className="text-cyan">{ps.coverage.statement.toFixed(0)}%</span></div>
                  <div className="text-dim">Branch: <span className="text-amber">{ps.coverage.branch.toFixed(0)}%</span></div>
                  <div className="text-dim">Score: <span className="text-green">{ps.score}</span></div>
                  <div className="text-dim">Test: <span className="text-blue">{ps.tests.length}</span></div>
                  <div className="text-dim">Anomalie: <span className="text-red">{ps.anomalies.length}</span></div>
                </div>
              )}
            </div>
          );
        })}

        <button onClick={handleExport}
          className="w-full py-3 bg-cyan/10 border border-cyan/30 rounded-lg text-sm text-cyan font-bold">
          📥 Export JSON
        </button>
      </div>
    </div>
  );
}
