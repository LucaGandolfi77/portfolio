// Coverage Galaxy — Galaxy Map (Home Screen)
import { useGame } from '../state/GameContext';
import { MISSIONS } from '../data/missions';
import { getNextRankXP, BADGES } from '../engine/scoring';

const CONSTELLATIONS: Record<string, { x: number; y: number }> = {
  'OBC Cluster': { x: 30, y: 30 },
  'COMMS Nebula': { x: 65, y: 25 },
  'Payload Belt': { x: 20, y: 60 },
  'ADCS Cluster': { x: 70, y: 65 },
  'FDIR Deep Field': { x: 45, y: 80 },
};

export default function GalaxyMap() {
  const { state, dispatch } = useGame();
  const { profile, planetStates } = state.progress;

  const nextXP = getNextRankXP(profile.xp);
  const progressPct = nextXP ? (profile.xp / nextXP) * 100 : 100;

  return (
    <div className="flex flex-col h-full">
      {/* HUD Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-hud/80 border-b border-cyan/20">
        <div className="flex items-center gap-2">
          <span className="text-lg">🛰️</span>
          <span className="text-sm font-bold text-cyan text-glow">ACCADEMIA</span>
        </div>
        <div className="text-right">
          <div className="text-xs text-amber font-mono">{profile.rank}</div>
          <div className="w-24 h-1.5 bg-space rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-cyan to-green rounded-full transition-all" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="text-[10px] text-dim font-mono">{profile.xp} XP{nextXP ? ` / ${nextXP}` : ''}</div>
        </div>
      </div>

      {/* Galaxy SVG */}
      <div className="flex-1 relative overflow-hidden">
        <svg viewBox="0 0 100 100" className="w-full h-full" style={{ background: 'radial-gradient(ellipse at center, #0a1030 0%, #050818 70%)' }}>
          {/* Stars */}
          {Array.from({ length: 80 }, (_, i) => (
            <circle key={i} cx={Math.random() * 100} cy={Math.random() * 100} r={Math.random() * 0.3 + 0.1}
              fill="#fff" opacity={Math.random() * 0.6 + 0.2}>
              <animate attributeName="opacity" values={`${Math.random()*0.3+0.2};${Math.random()*0.8+0.2};${Math.random()*0.3+0.2}`}
                dur={`${Math.random()*3+2}s`} repeatCount="indefinite" />
            </circle>
          ))}

          {/* Constellation labels */}
          {Object.entries(CONSTELLATIONS).map(([name, pos]) => (
            <text key={name} x={pos.x} y={pos.y - 8} textAnchor="middle" fill="#3a5070" fontSize="2.5" fontFamily="var(--font-mono)">{name}</text>
          ))}

          {/* Planets */}
          {MISSIONS.map((m, i) => {
            const con = CONSTELLATIONS[m.constellation] || { x: 50, y: 50 };
            const angle = (i / MISSIONS.length) * Math.PI * 2 + i * 0.7;
            const r = 8 + (i % 3) * 3;
            const x = con.x + Math.cos(angle) * r;
            const y = con.y + Math.sin(angle) * r;
            const ps = planetStates[m.id];
            const completed = ps?.status === 'completed';
            const inProgress = ps?.status === 'in_progress';
            const available = !completed && (i === 0 || planetStates[MISSIONS[i - 1]?.id]?.status === 'completed' || i <= profile.planetsCompleted.length);
            const locked = !completed && !inProgress && !available;

            const covPct = ps?.coverage?.statement ?? 0;

            return (
              <g key={m.id} onClick={() => !locked && dispatch({ type: 'SELECT_MISSION', missionId: m.id })}
                className="cursor-pointer" style={{ opacity: locked ? 0.3 : 1 }}>
                {/* Orbit ring */}
                <circle cx={x} cy={y} r={4} fill="none" stroke={completed ? '#7dffa8' : inProgress ? '#ffb340' : '#1a2a40'} strokeWidth="0.3" strokeDasharray={locked ? '1,1' : ''} />
                {/* Coverage fill */}
                {covPct > 0 && (
                  <circle cx={x} cy={y} r={4} fill="none" stroke={completed ? '#7dffa8' : '#38e8d0'} strokeWidth="0.8"
                    strokeDasharray={`${covPct * 0.25} ${(100 - covPct) * 0.25}`}
                    transform={`rotate(-90 ${x} ${y})`} opacity="0.7" />
                )}
                {/* Planet body */}
                <circle cx={x} cy={y} r={2.5} fill={completed ? '#1a3820' : inProgress ? '#382820' : '#0a1020'}
                  stroke={completed ? '#7dffa8' : inProgress ? '#ffb340' : '#2a3a50'} strokeWidth="0.4" />
                <text x={x} y={y + 0.3} textAnchor="middle" fontSize="2.5" dominantBaseline="central">{m.planetEmoji}</text>
                {/* Label */}
                <text x={x} y={y + 5.5} textAnchor="middle" fill={completed ? '#7dffa8' : inProgress ? '#ffb340' : '#5a7a90'}
                  fontSize="1.8" fontFamily="var(--font-mono)">{m.planetName}</text>
                {/* Status icon */}
                {completed && <text x={x + 3} y={y - 2} fontSize="1.5">✅</text>}
                {locked && <text x={x + 3} y={y - 2} fontSize="1.5">🔒</text>}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Bottom bar */}
      <div className="flex gap-1 px-2 py-2 bg-hud/80 border-t border-cyan/20">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'glossary' })}
          className="flex-1 py-2 bg-hud rounded-lg border border-cyan/20 text-[10px] text-cyan font-bold">📚 Glossario</button>
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'lab' })}
          className="flex-1 py-2 bg-hud rounded-lg border border-cyan/20 text-[10px] text-cyan font-bold">🧪 Libero</button>
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'report' })}
          className="flex-1 py-2 bg-hud rounded-lg border border-cyan/20 text-[10px] text-cyan font-bold">📊 Report</button>
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'settings' })}
          className="flex-1 py-2 bg-hud rounded-lg border border-cyan/20 text-[10px] text-cyan font-bold">⚙️</button>
      </div>

      {/* Badges shelf */}
      {profile.badges.length > 0 && (
        <div className="flex gap-1 px-3 py-1 bg-space2 border-t border-cyan/10 overflow-x-auto">
          {profile.badges.slice(-8).map(b => (
            <span key={b} className="text-sm" title={BADGES[b]?.name}>{BADGES[b]?.icon}</span>
          ))}
        </div>
      )}
    </div>
  );
}
