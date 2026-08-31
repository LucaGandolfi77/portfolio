// Coverage Galaxy — Main App
import { GameProvider, useGame } from './state/GameContext';
import GalaxyMap from './components/GalaxyMap';
import PlanetView from './components/PlanetView';
import GlossaryView from './components/GlossaryView';
import ReportView from './components/ReportView';
import SettingsView from './components/SettingsView';

function AppRouter() {
  const { state } = useGame();

  if (!state.loaded) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="text-4xl mb-4">🛰️</div>
          <div className="text-sm text-cyan font-bold animate-pulse">Caricamento...</div>
        </div>
      </div>
    );
  }

  switch (state.screen) {
    case 'home': return <GalaxyMap />;
    case 'planet': return <PlanetView />;
    case 'glossary': return <GlossaryView />;
    case 'report': return <ReportView />;
    case 'settings': return <SettingsView />;
    default: return <GalaxyMap />;
  }
}

export default function App() {
  return (
    <GameProvider>
      <AppRouter />
    </GameProvider>
  );
}
