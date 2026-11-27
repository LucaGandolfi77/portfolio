import './styles.css';
import { registerPWA } from './pwa';
import { Game } from './game/Game';

registerPWA();

const app = document.getElementById('app')!;
const scene = document.getElementById('scene')!;
const game = new Game(app, scene);

// Expose for E2E smoke tests without affecting production gameplay
(window as unknown as { __AFTER_DUSK__?: Game }).__AFTER_DUSK__ = game;
