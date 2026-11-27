import './styles.css';
import { Game } from './game/Game';
import { setupPwaLifecycle } from './pwa';
import { UIManager } from './ui/UIManager';

const sceneEl = document.getElementById('scene');
const uiEl = document.getElementById('ui');

if (sceneEl && uiEl) {
  const game = new Game(sceneEl);
  const ui = new UIManager(uiEl, game);

  setupPwaLifecycle({
    onInstallReady: (trigger) => {
      ui.onInstallClick = () => void trigger();
      ui.setInstallAvailable(true);
    },
    onVisibilityChange: (hidden) => {
      game.paused = hidden;
    },
  });

  // Support PWA manifest shortcuts (`?start=hub` / `?start=expedition`)
  const startParam = new URLSearchParams(window.location.search).get('start');
  if (startParam === 'hub') {
    ui.hideTitle();
    game.enterHub();
  } else if (startParam === 'expedition') {
    ui.hideTitle();
    game.startExpedition('sun-canopy');
  }

  game.startLoop();
}
