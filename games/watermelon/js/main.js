import { STR, MODES } from './config.js';
import { createArcade } from '../../_kit/arcade.js';
import { api } from './game.js';

createArcade({
  root: document.getElementById('app'),
  canvas: document.createElement('canvas'),
  str: STR, key: 'watermelon.save.v1', modes: MODES, startLives: 3, ...api
});
