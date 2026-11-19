/* DITTOPIA — Pokémon entities, AI, habitats and Pokédex */

import { SPECIES, HABITATS, SHINY_CHANCE, DIALOGUES } from './config.js';
import { world } from './world.js';
import * as AUDIO from './audio.js';

class PokemonSystem {
  constructor() { this.list = []; this.dex = {}; }

  reset() { this.list = []; this.dex = {}; }
  all() { return this.list; }
  at(x, y) { return this.list.find(m => Math.round(m.x) === x && Math.round(m.y) === y) || null; }
  countSpecies(sp) { return this.list.filter(m => m.species === sp).length; }
  friendsCount() { return Object.values(this.dex).filter(d => d.friends).length; }
  dexCount() { return Object.values(this.dex).filter(d => d.seen).length; }
  pokedex() { return this.dex; }

  addSeen(sp) {
    if (!this.dex[sp]) this.dex[sp] = { seen: false, friends: false };
    this.dex[sp].seen = true;
  }
  addFriend(sp) {
    this.addSeen(sp);
    this.dex[sp].friends = true;
  }

  spawn(species, x, y, opts = {}) {
    const mon = {
      id: Math.random().toString(36).slice(2, 8),
      species, x, y, homeX: x, homeY: y,
      shiny: opts.shiny !== undefined ? opts.shiny : Math.random() < SHINY_CHANCE,
      friendship: 0, following: !!opts.following, questOnly: !!opts.questOnly,
      wobble: Math.random() * 100, dir: 0, bubble: null, bubbleTime: 0
    };
    this.list.push(mon);
    this.addSeen(species);
    return mon;
  }

  despawn(id) { this.list = this.list.filter(m => m.id !== id); }

  update(dt, player, isNight) {
    for (const mon of this.list) {
      mon.wobble += dt;
      if (mon.bubbleTime > 0) {
        mon.bubbleTime -= dt;
        if (mon.bubbleTime <= 0) mon.bubble = null;
      }
      if (mon.following) this.follow(mon, player, dt);
      else this.wander(mon, dt);
    }
  }

  wander(mon, dt) {
    if (Math.random() < 0.02) mon.dir = (Math.random() * 4) | 0;
    const speed = 0.6;
    let vx = 0, vy = 0;
    if (mon.dir === 0) vy = -speed;
    else if (mon.dir === 1) vy = speed;
    else if (mon.dir === 2) vx = -speed;
    else vx = speed;
    const nx = mon.x + vx * dt, ny = mon.y + vy * dt;
    if (world.walkable(Math.round(nx), Math.round(mon.y)) && Math.abs(nx - mon.homeX) < 3) mon.x = nx;
    else mon.dir = (Math.random() * 4) | 0;
    if (world.walkable(Math.round(mon.x), Math.round(ny)) && Math.abs(ny - mon.homeY) < 3) mon.y = ny;
    else mon.dir = (Math.random() * 4) | 0;
    if (vx || vy) mon.facing = Math.abs(vx) > Math.abs(vy) ? (vx > 0 ? 'R' : 'L') : (vy > 0 ? 'D' : 'U');
  }

  follow(mon, player, dt) {
    const tx = Math.floor(player.x), ty = Math.floor(player.y - 2);
    const dx = tx - mon.x, dy = ty - mon.y;
    const d = Math.hypot(dx, dy);
    if (d > 0.6) {
      const speed = 1.7;
      const nx = mon.x + dx / d * speed * dt, ny = mon.y + dy / d * speed * dt;
      if (world.walkable(Math.round(nx), Math.round(mon.y))) mon.x = nx;
      if (world.walkable(Math.round(mon.x), Math.round(ny))) mon.y = ny;
      mon.facing = Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'R' : 'L') : (dy > 0 ? 'D' : 'U');
    }
  }

  say(mon, text) { mon.bubble = text; mon.bubbleTime = 3.2; }

  interact(mon, context) {
    if (!mon) return false;
    const sp = SPECIES[mon.species];
    this.addSeen(mon.species);
    if (mon.friendship === 0) {
      mon.friendship = 1;
      mon.following = !!sp.follows;
      this.addFriend(mon.species);
      AUDIO.cry(sp.cry);
      AUDIO.sfxFanfare();
      context.notify((mon.shiny ? 'Shiny ' : '') + `Hai fatto amicizia con ${sp.name}!`);
      if (sp.teaches && !context.player.moves[sp.teaches]) {
        context.player.moves[sp.teaches] = true;
        context.notify(`Hai imparato ${sp.teaches}!`);
      }
      if (context.onFriend) context.onFriend(mon);
      return 'friend:' + sp.name;
    }
    const lines = sp.flavor ? [sp.flavor] : (DIALOGUES.youngster || ['Ciao!']);
    context.dialogue(`${sp.name}: ${lines[0]}`);
    AUDIO.cry(sp.cry);
    return 'talk:' + sp.name;
  }

  scanHabitats(time, player) {
    for (const rule of HABITATS) {
      if (rule.special) continue;
      const sp = SPECIES[rule.mon];
      if (!sp || sp.questOnly || sp.caveOnly) continue;
      if (rule.time !== 'any' && rule.time !== time) continue;
      if (rule.needDex && this.dexCount() < rule.needDex) continue;
      if (rule.needFriends && this.friendsCount() < rule.needFriends) continue;

      const centers = [];
      for (const req of rule.req) {
        if (req.k.startsWith('cristallo')) continue;
        centers.push(...world.getPlaced().filter(p => p.type === req.k).map(p => ({ x: p.x, y: p.y })));
      }
      if (!centers.length) centers.push({ x: 40, y: 40 });

      let count = this.countSpecies(rule.mon);
      for (const center of centers) {
        if (count >= (rule.limit || 1)) break;
        if (!world.ruleOk(rule, center.x, center.y)) continue;
        const spot = this.findSpot(center.x, center.y);
        if (spot) {
          this.spawn(rule.mon, spot.x, spot.y);
          count++;
          AUDIO.sfxSparkle();
        }
      }
    }

    // despawn dei vagabondi le cui regole non valgono più
    for (const mon of [...this.list]) {
      const sp = SPECIES[mon.species];
      if (!sp || sp.questOnly || sp.caveOnly || mon.friendship > 0) continue;
      const rule = HABITATS.find(r => r.mon === mon.species);
      if (!rule) continue;
      if (rule.time !== 'any' && rule.time !== time) { this.despawn(mon.id); continue; }
      if (!world.ruleOk(rule, mon.x | 0, mon.y | 0)) this.despawn(mon.id);
    }
  }

  findSpot(cx, cy) {
    for (let r = 1; r < 4; r++) {
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        const x = cx + dx, y = cy + dy;
        if (world.walkable(x, y) && !world.objAt(x, y) && !this.at(x, y)) return { x, y };
      }
    }
    return null;
  }

  serialize() {
    return this.list.map(m => ({
      id: m.id, sp: m.species, x: m.x, y: m.y, hx: m.homeX, hy: m.homeY,
      sh: m.shiny, fr: m.friendship, fo: m.following, qo: m.questOnly
    }));
  }
  load(data, dex) {
    this.reset();
    (data || []).forEach(e => {
      const mon = {
        id: e.id, species: e.sp, x: e.x, y: e.y, homeX: e.hx, homeY: e.hy,
        shiny: e.sh, friendship: e.fr, following: e.fo, questOnly: e.qo,
        wobble: 0, dir: 0, bubble: null, bubbleTime: 0
      };
      this.list.push(mon);
      if (mon.friendship > 0) this.addFriend(mon.species);
      else this.addSeen(mon.species);
    });
    if (dex) this.dex = dex;
  }
}

export const pokemon = new PokemonSystem();
