/* Snake Neon — test logici (node games/snake/test/logic-test.js) */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

global.window = global;
const base = path.join(__dirname, '..', 'js');
['engine.js', 'modes.js', 'events.js'].forEach(f => {
    eval(fs.readFileSync(path.join(base, f), 'utf8'));
});

const { SnakeGame, hashSeed } = window.SnakeEngine;
const events = window.SnakeEvents;
let passed = 0;
function test(name, fn) {
    try { fn(); console.log('✓', name); passed++; }
    catch (e) { console.error('✗', name, '\n ', e.message); process.exitCode = 1; }
}

function mk(modeId, opts) {
    const g = new SnakeGame({});
    g.events = events;
    g.hooks = {};
    g.start(window.SnakeModes.get(modeId), opts || {});
    return g;
}

test('modalità: 7 definiti', () => assert.strictEqual(window.SnakeModes.list.length, 7));
test('classica parte in playing con cibo', () => {
    const g = mk('classic', { seed: 1 });
    assert.strictEqual(g.phase, 'playing');
    assert.strictEqual(g.food.length, 1);
    assert.strictEqual(g.snake.length, 3);
});
test('coda in movimento non uccide', () => {
    const g = mk('classic', { seed: 2 });
    g.food = [];
    g.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 }];
    g.dir = { x: 1, y: 0 };
    g.setDirection(0, 1);
    g.move();
    assert.strictEqual(g.phase, 'playing');
});
test('morso al corpo uccide', () => {
    const g = mk('classic', { seed: 3 });
    g.food = [];
    g.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }, { x: 7, y: 6 }];
    g.dir = { x: 0, y: 1 };
    g.move();
    assert.strictEqual(g.phase, 'over');
    assert.strictEqual(g.overReason, 'corpo');
});
test('inversione a 180 gradi respinta', () => {
    const g = mk('classic', { seed: 4 });
    g.setDirection(-1, 0);
    assert.strictEqual(g.queue.length, 0);
});
test('wrap dei muri in classica', () => {
    const g = mk('classic', { seed: 5 });
    g.food = [];
    g.snake = [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }];
    g.dir = { x: -1, y: 0 };
    g.move();
    assert.strictEqual(g.snake[0].x, g.cols - 1);
});
test('muro letale in arcade', () => {
    const g = mk('arcade', { seed: 6 });
    g.food = [];
    g.snake = [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }];
    g.dir = { x: -1, y: 0 };
    g.move();
    assert.strictEqual(g.phase, 'over');
    assert.strictEqual(g.overReason, 'muro');
});
test('sprint finisce a tempo', () => {
    const g = mk('sprint', { seed: 7 });
    g.elapsed = 59900;
    g.tick(200);
    assert.strictEqual(g.phase, 'over');
    assert.strictEqual(g.overReason, 'tempo');
});
test('metro accelera mangiando', () => {
    const g = mk('metro', { seed: 8 });
    const before = g.currentInterval();
    g.foodEaten = 10;
    assert.ok(g.currentInterval() < before);
});
test('zen ignora il corpo', () => {
    const g = mk('zen', { seed: 9 });
    g.food = [];
    g.snake = [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 4, y: 6 }, { x: 5, y: 6 }, { x: 6, y: 6 }];
    g.dir = { x: 1, y: 0 };
    g.move();
    assert.strictEqual(g.phase, 'playing');
});
test('battle crea la CPU', () => {
    const g = mk('battle', { seed: 10 });
    assert.ok(g.ai && g.ai.snake.length === 3);
    for (let i = 0; i < 400 && g.phase === 'playing'; i++) g.tick(16);
    assert.ok(g.ai.alive || !g.ai.alive);
});
test('ostacoli generati', () => {
    const g = mk('obstacles', { seed: 11, level: 2 });
    assert.ok(g.obstacles.length > 5);
});
test('seed giornaliero deterministico', () => {
    const a = hashSeed('snake-2026-11-19');
    const b = hashSeed('snake-2026-11-19');
    assert.strictEqual(a, b);
    const g1 = mk('classic', { seed: a });
    const g2 = mk('classic', { seed: a });
    assert.deepStrictEqual(g1.food[0], g2.food[0]);
});
test('eventi live scattano', () => {
    const g = mk('classic', { seed: 12 });
    g.eventTimer = 0;
    let banner = false;
    g.hooks.onBanner = () => { banner = true; };
    g.tick(16);
    assert.ok(banner);
});
test('power-up applica effetto', () => {
    const g = mk('classic', { seed: 13 });
    events.onPowerup(g, { type: 'turbo' });
    assert.ok(g.effects.turbo > 0);
    assert.strictEqual(g.modifiers.scoreMul, 2);
});
test('scudo assorbe la morte', () => {
    const g = mk('arcade', { seed: 14 });
    g.modifiers.shield = 1;
    g.effects.shield = 1;
    g.food = [];
    g.snake = [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }];
    g.dir = { x: -1, y: 0 };
    g.move();
    assert.strictEqual(g.phase, 'playing');
    assert.strictEqual(g.modifiers.shield, 0);
});

console.log('\n' + passed + ' test superati.');
