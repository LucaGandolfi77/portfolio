/* DITTOPIA — procedural world, objects and habitat rules */

import { TILE, TILE_WALK, TILE_CAT, ITEMS, ZONES } from './config.js';

const W = 80, H = 80;

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class World {
  constructor() {
    this.W = W; this.H = H;
    this.tiles = new Uint8Array(W * H);
    this.objects = {};
    this.placed = [];
    this.seed = 1;
    this.specials = {};
  }

  idx(x, y) { return y * W + x; }
  inB(x, y) { return x >= 0 && y >= 0 && x < W && y < H; }
  getTile(x, y) { return this.inB(x, y) ? this.tiles[this.idx(x, y)] : TILE.CAVEWALL; }
  setTile(x, y, tile) { if (this.inB(x, y)) this.tiles[this.idx(x, y)] = tile; }

  gen(seed) {
    this.seed = seed || ((Math.random() * 1e9) | 0);
    const rnd = rng(this.seed);
    this.tiles = new Uint8Array(W * H);
    this.objects = {};
    this.placed = [];
    const s = this.specials = {};

    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const n = rnd();
      this.setTile(x, y, n > 0.86 ? TILE.TGRASS : n > 0.80 ? TILE.DARKGRASS : TILE.GRASS);
    }

    // stagno prosciugato
    for (let y = 37; y < 47; y++) for (let x = 12; x < 24; x++) {
      if (Math.hypot(x - 18, y - 42) < 5 + rnd() * 2) this.setTile(x, y, TILE.DIRT);
    }
    // rovine
    for (let y = 58; y < 72; y++) for (let x = 50; x < 72; x++) {
      if (rnd() < 0.55) this.setTile(x, y, rnd() < 0.2 ? TILE.BRICK : TILE.PAVE);
    }
    // montagna
    for (let y = 8; y < 20; y++) for (let x = 33; x < 48; x++) if (rnd() < 0.7) this.setTile(x, y, TILE.ROCK);
    // distesa gelata (nuova zona)
    for (let y = 2; y < 20; y++) for (let x = 58; x < 80; x++) {
      if (rnd() < 0.85) this.setTile(x, y, rnd() < 0.12 ? TILE.ROCK : TILE.SNOW);
    }
    // sentieri di collegamento
    for (let x = 10; x < 20; x++) this.setTile(x, 14, TILE.PATH);
    for (let y = 20; y < 42; y++) this.setTile(20, y, TILE.PATH);
    for (let x = 20; x < 60; x++) this.setTile(x, 64, TILE.PATH);

    // bordi
    for (let i = 0; i < W; i++) { this.setTile(i, 0, TILE.ROCK); this.setTile(i, H - 1, TILE.ROCK); }
    for (let j = 0; j < H; j++) { this.setTile(0, j, TILE.ROCK); this.setTile(W - 1, j, TILE.ROCK); }

    const scatter = (type, count, filter) => {
      for (let k = 0; k < count; k++) {
        const x = 2 + ((rnd() * (W - 4)) | 0), y = 2 + ((rnd() * (H - 4)) | 0);
        if (!filter || filter(x, y)) this.setObj(x, y, type);
      }
    };
    const grass = (x, y) => [TILE.GRASS, TILE.TGRASS, TILE.DARKGRASS, TILE.FLOWER].includes(this.getTile(x, y));
    scatter('albero', 70, grass);
    scatter('roccia', 34, (x, y) => this.getTile(x, y) === TILE.GRASS || this.getTile(x, y) === TILE.SNOW);
    scatter('detrito', 60, (x, y) => grass(x, y) || this.getTile(x, y) === TILE.DIRT);
    scatter('cespuglio', 22, grass);
    scatter('spruzzabacche', 18, grass);
    scatter('rovina_metallo', 22, (x, y) => [TILE.PAVE, TILE.BRICK].includes(this.getTile(x, y)));
    scatter('cristallo_nat', 16, (x, y) => this.getTile(x, y) === TILE.SNOW);
    for (let k = 0; k < 40; k++) {
      const x = 2 + ((rnd() * (W - 4)) | 0), y = 2 + ((rnd() * (H - 4)) | 0);
      if (grass(x, y)) this.setTile(x, y, TILE.FLOWER);
    }

    // grotta
    for (let y = 10; y < 18; y++) for (let x = 36; x < 46; x++) {
      this.setTile(x, y, (y < 11 || y > 16 || x < 37 || x > 45) ? TILE.CAVEWALL : TILE.CAVEFLOOR);
    }

    s.start = { x: 12, y: 14 };
    s.tangrowth = { x: 14, y: 14 };
    s.squirtle = { x: 20, y: 42 };
    s.sprouts = [{ x: 16, y: 16 }, { x: 22, y: 15 }, { x: 18, y: 13 }];
    s.snorlax = { x: 40, y: 20 };
    s.caveEntrance = { x: 40, y: 18 };
    s.generator = { x: 60, y: 64 };
    s.farfetchd = { x: 26, y: 38 };
    this.setObj(60, 64, 'generatore', { broken: true });
    this.setObj(52, 58, 'sign');
    this.setObj(38, 22, 'sign');
    this.setObj(24, 40, 'sign');
    return this;
  }

  setObj(x, y, type, state) { this.objects[x + ',' + y] = { type, x, y, state: state || {} }; }
  objAt(x, y) { return this.objects[x + ',' + y] || null; }
  removeObj(x, y) { const o = this.objAt(x, y); if (o) delete this.objects[x + ',' + y]; return o; }
  allObjects() { return this.objects; }

  walkable(x, y) {
    if (!this.inB(x, y)) return false;
    if (!TILE_WALK[this.getTile(x, y)]) return false;
    const o = this.objAt(x, y);
    if (o && ['albero','roccia','generatore','sign','snorlax','altare','capanna','cristallo_nat'].includes(o.type)) return false;
    return true;
  }

  placeItem(x, y, type) {
    if (this.objAt(x, y) || !TILE_WALK[this.getTile(x, y)]) return false;
    this.setObj(x, y, type);
    this.placed.push({ x, y, type, state: {} });
    return true;
  }
  removePlaced(x, y) {
    const o = this.removeObj(x, y);
    if (!o) return null;
    const index = this.placed.findIndex(p => p.x === x && p.y === y);
    if (index >= 0) this.placed.splice(index, 1);
    return o;
  }
  getPlaced() { return this.placed; }
  getSpecials() { return this.specials; }
  size() { return { w: W, h: H }; }
  zoneAt(x, y) {
    return ZONES.find(z => x >= z.bounds[0] && y >= z.bounds[1] && x < z.bounds[2] && y < z.bounds[3]) || ZONES[0];
  }

  countCat(cx, cy, cat, r) {
    let n = 0;
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      const x = cx + dx, y = cy + dy;
      if (!this.inB(x, y)) continue;
      if (['water','ruin','rock','grass','cave'].includes(cat)) {
        if (TILE_CAT[this.getTile(x, y)] === cat) n++;
      } else {
        const o = this.objAt(x, y);
        if (o && o.type === cat) n++;
      }
    }
    return n;
  }

  ruleOk(rule, cx, cy) {
    if (!rule.req) return true;
    return rule.req.every(req => this.countCat(cx, cy, req.k, req.r) >= req.count);
  }

  serialize() {
    const objects = Object.values(this.objects).map(o => [o.type, o.x, o.y, o.state || {}]);
    return { seed: this.seed, objects, specials: this.specials };
  }
  load(data) {
    if (!data) return this.gen();
    this.gen(data.seed);
    this.objects = {};
    this.placed = [];
    (data.objects || []).forEach(([type, x, y, st]) => {
      this.setObj(x, y, type, st || {});
      if (ITEMS[type] && ITEMS[type].kind === 'place') this.placed.push({ x, y, type, state: st || {} });
    });
    if (data.specials) this.specials = data.specials;
    return this;
  }
}

export const world = new World();
