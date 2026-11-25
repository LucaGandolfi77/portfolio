/* Compatibility facade — the game core now lives in pure modules. */
export { generateGrid as spin, evaluate as payout } from './systems/reels.js';
export { start as setup, reduce, createStore } from './state.js';
export { buyUpgrade } from './systems/economy.js';
