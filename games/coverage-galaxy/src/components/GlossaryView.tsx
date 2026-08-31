// Coverage Galaxy — Glossary View
import { useGame } from '../state/GameContext';
import { GLOSSARY } from '../data/glossary';
import { useState } from 'react';

export default function GlossaryView() {
  const { state, dispatch } = useGame();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);

  const filtered = GLOSSARY.filter(g =>
    g.term.toLowerCase().includes(search.toLowerCase()) ||
    g.def.toLowerCase().includes(search.toLowerCase())
  );

  const term = GLOSSARY.find(g => g.id === selected);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-3 py-2 bg-hud/80 border-b border-cyan/20">
        <button onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })} className="text-dim text-sm">◀</button>
        <span className="text-lg">📚</span>
        <div className="flex-1 text-sm font-bold text-cyan">Glossario</div>
        <div className="text-[10px] text-dim">{state.progress.glossaryRead.length}/{GLOSSARY.length}</div>
      </div>

      <div className="px-3 py-2">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Cerca termine..."
          className="w-full bg-hud border border-cyan/20 rounded-lg px-3 py-2 text-xs text-green font-mono" />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4 space-y-1">
        {filtered.map(g => (
          <button key={g.id} onClick={() => { setSelected(g.id); dispatch({ type: 'MARK_GLOSSARY_READ', termId: g.id }); }}
            className={`w-full text-left p-2 rounded-lg border transition-all ${
              selected === g.id ? 'bg-cyan/10 border-cyan/40' : 'bg-hud border-cyan/10'
            } ${state.progress.glossaryRead.includes(g.id) ? 'border-l-2 border-l-green' : ''}`}>
            <div className="text-xs text-amber font-bold">{g.term}</div>
            <div className="text-[10px] text-dim line-clamp-2 mt-0.5">{g.def}</div>
          </button>
        ))}
      </div>

      {term && (
        <div className="px-3 py-3 bg-hud/95 border-t border-cyan/20">
          <div className="text-xs text-amber font-bold mb-1">{term.term}</div>
          <div className="text-[11px] text-dim leading-relaxed">{term.def}</div>
          {term.related && term.related.length > 0 && (
            <div className="text-[9px] text-blue mt-2">Vedi anche: {term.related.join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
}
