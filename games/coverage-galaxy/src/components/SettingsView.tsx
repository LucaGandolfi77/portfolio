// Coverage Galaxy — Settings View
import { useGame } from '../state/GameContext';
import { resetProgress } from '../db/idb';

export default function SettingsView() {
  const { state, dispatch } = useGame();
  const mode = state.progress.profile.mode;

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 bg-hud/80 border-b border-cyan/20">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })} className="text-dim text-sm">◀</button>
        <span className="text-lg">⚙️</span>
        <div className="flex-1 text-sm font-bold text-cyan">Impostazioni</div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-4">
        {/* Mode */}
        <div className="bg-hud rounded-lg border border-cyan/20 p-3">
          <div className="text-[10px] text-amber font-mono mb-2">MODALITÀ</div>
          <div className="flex gap-2">
            <button onClick={() => dispatch({ type: 'SET_MODE', mode: 'beginner' })}
              className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                mode === 'beginner' ? 'bg-cyan/20 text-cyan border-cyan/40' : 'bg-hud text-dim border-cyan/10'
              }`}>🎓 Principiante</button>
            <button onClick={() => dispatch({ type: 'SET_MODE', mode: 'advanced' })}
              className={`flex-1 py-2 rounded-lg text-xs font-bold border ${
                mode === 'advanced' ? 'bg-amber/20 text-amber border-amber/40' : 'bg-hud text-dim border-cyan/10'
              }`}>🚀 Avanzato</button>
          </div>
          <div className="text-[10px] text-dim mt-2">
            {mode === 'beginner'
              ? 'Principiante: hint gratuiti, target statement+branch, nessun MC/DC obbligatorio.'
              : 'Avanzato: MC/DC obbligatorio, hint a costo XP, defect nascosti, false anomalie penalizzate.'}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-hud rounded-lg border border-cyan/20 p-3">
          <div className="text-[10px] text-amber font-mono mb-2">STATISTICHE</div>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between"><span className="text-dim">XP totali</span><span className="text-amber font-mono">{state.progress.profile.xp}</span></div>
            <div className="flex justify-between"><span className="text-dim">Rank</span><span className="text-cyan">{state.progress.profile.rank}</span></div>
            <div className="flex justify-between"><span className="text-dim">Pianeti completati</span><span className="text-green">{state.progress.profile.planetsCompleted.length}</span></div>
            <div className="flex justify-between"><span className="text-dim">Test creati</span><span className="text-blue">{state.progress.profile.totalTestsCreated}</span></div>
            <div className="flex justify-between"><span className="text-dim">Anomalie trovate</span><span className="text-red">{state.progress.profile.totalAnomaliesFound}</span></div>
            <div className="flex justify-between"><span className="text-dim">Badge</span><span className="text-purple">{state.progress.profile.badges.length}</span></div>
            <div className="flex justify-between"><span className="text-dim">Streak daily</span><span className="text-amber">{state.progress.profile.dailyStreak}</span></div>
          </div>
        </div>

        {/* Reset */}
        <div className="bg-hud rounded-lg border border-red/20 p-3">
          <div className="text-[10px] text-red font-mono mb-2">RESET</div>
          <button onClick={async () => {
            if (confirm('Reset completo? Tutti i progressi verranno persi.')) {
              await resetProgress();
              window.location.reload();
            }
          }} className="w-full py-2 bg-red/10 border border-red/30 rounded-lg text-xs text-red font-bold">
            🗑️ Reset Progressi
          </button>
        </div>

        {/* Credits */}
        <div className="bg-hud rounded-lg border border-cyan/20 p-3">
          <div className="text-[10px] text-amber font-mono mb-2">CREDITI</div>
          <div className="text-[10px] text-dim leading-relaxed">
            Coverage Galaxy: Embedded Test Academy — PWA gamificata per imparare unit testing embedded aerospace.
            Algoritmi di simulazione deterministica, nessuna esecuzione di codice C.
            Concetti generici di verifica software (DO-178C, MC/DC, BVA, regression).
          </div>
        </div>
      </div>
    </div>
  );
}
