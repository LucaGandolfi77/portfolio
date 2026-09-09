const Game = (() => {
  'use strict';
  const D = VOIDBOUND;
  let state, entities, particles, projectiles, shards_dropped, attack_effects, next_id, tick;
  let on_event = null;

  function init() {
    next_id = 1; tick = 0;
    state = {
      time: D.MATCH_DURATION, phase: 'playing', scores: [0, 0],
      boss_alive: false, boss_exposed: false, boss_expose_timer: 0,
      goals: D.GOALS.map(g => ({ ...g, alive: true, current_hp: g.hp, shield: 0 })),
      creep_timers: [], double_points: false,
    };
    entities = []; particles = []; projectiles = []; shards_dropped = [];
    attack_effects = [];
    return state;
  }

  function spawn_champion(roster_idx, team, is_player, lane) {
    const r = D.ROSTER[roster_idx];
    const base = team === 0 ? D.BASES.blue : D.BASES.red;
    const e = {
      id: next_id++, type: 'champion', team, is_player, roster_idx, lane,
      x: base.x + (Math.random() - 0.5) * 60, y: base.y + (Math.random() - 0.5) * 60,
      vx: 0, vy: 0, angle: 0,
      hp: r.base_hp, max_hp: r.base_hp, atk: r.base_atk, def: r.base_def, spd: r.base_spd,
      range: r.atk_range, atk_speed: r.atk_speed,
      level: 1, xp: 0, xp_to_next: D.LEVEL_UP_THRESHOLD,
      shards: 0, dead: false, respawn_timer: 0,
      atk_timer: 0, ability_cds: [0, 0, 0],
      shield: 0, shield_timer: 0,
      buff_atk: 0, buff_atk_timer: 0,
      stun_timer: 0, slow_timer: 0, slow_mult: 1,
      channeling: false, channel_target: null, channel_timer: 0,
      invisible: false, stun_immune: 0,
      ult_unlocked: false,
      spawn_x: base.x, spawn_y: base.y,
      ai_state: null, ai_target: null, ai_timer: 0,
    };
    entities.push(e);
    return e;
  }

  function spawn_creep(idx) {
    const spots = D.MAP.jungle_spots;
    const spot = spots[idx % spots.length];
    const tier = idx < 4 ? 0 : idx < 8 ? 0 : idx < 12 ? 1 : idx < 16 ? 2 : 3;
    const tier_start = tier === 0 ? 0 : tier === 1 ? 4 : tier === 2 ? 8 : 12;
    const tier_pool = D.CREEPS.filter((c, i) => {
      if (tier === 0) return i < 4;
      if (tier === 1) return i >= 4 && i < 8;
      if (tier === 2) return i >= 8 && i < 13;
      return i >= 13;
    });
    const c = tier_pool[idx % tier_pool.length];
    const e = {
      id: next_id++, type: 'creep', creep_tier: tier, creep_type: c.type,
      team: 0, spawn_idx: idx % spots.length,
      x: spot.x + (Math.random() - 0.5) * 100,
      y: spot.y + (Math.random() - 0.5) * 100,
      vx: 0, vy: 0, angle: 0,
      hp: c.hp, max_hp: c.hp, atk: c.atk, spd: c.speed, r: c.r,
      xp: c.xp, shards: c.shards, color: c.color, aggro_r: c.aggro_r,
      atk_type: c.atk_type || 'melee',
      atk_range: c.atk_range || 0,
      proj_speed: c.proj_speed || 0,
      proj_color: c.proj_color || '#fff',
      aoe_r: c.aoe_r || 0,
      aoe_dmg: c.aoe_dmg || 0,
      charge_dmg: c.charge_dmg || 0,
      charge_spd: c.charge_spd || 0,
      pull_r: c.pull_r || 0,
      pull_dmg: c.pull_dmg || 0,
      shield: c.shield || 0,
      stealth: c.stealth || false,
      dead: false, respawn_timer: 0, target: null,
      home_x: spot.x + (Math.random() - 0.5) * 100,
      home_y: spot.y + (Math.random() - 0.5) * 100,
      atk_cd: 0,
    };
    entities.push(e);
  }

  function spawn_boss() {
    const b = D.BOSS;
    const e = {
      id: next_id++, type: 'boss',
      x: b.x, y: b.y, vx: 0, vy: 0, angle: 0,
      hp: b.hp, max_hp: b.hp, atk: b.atk, spd: b.speed, r: b.r,
      xp: b.xp, shards: b.shards, color: b.color,
      dead: false, respawn_timer: 0, target: null,
      home_x: b.x, home_y: b.y,
    };
    entities.push(e);
    state.boss_alive = true;
  }

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function clamp(v, mn, mx) { return Math.max(mn, Math.min(mx, v)); }

  function add_particle(x, y, color, life, dx, dy, size) {
    particles.push({ x, y, color, life, max_life: life, dx: dx || 0, dy: dy || 0, size: size || 3 });
  }

  function add_projectile(owner, x, y, angle, dmg, speed, range, r, color, piercing, aoe_radius, slow, stun) {
    projectiles.push({
      owner, x, y, angle, dmg, speed, range: range || 400, r: r || 6,
      color: color || '#ff0', dx: Math.cos(angle) * speed, dy: Math.sin(angle) * speed,
      dist_traveled: 0, piercing: !!piercing, aoe_radius: aoe_radius || 0,
      slow: slow || 0, stun: stun || 0, hit: new Set()
    });
  }

  function get_allies(e) { return entities.filter(x => x.type === 'champion' && x.team === e.team && x !== e && !x.dead); }
  function get_enemies(e) { return entities.filter(x => x.type === 'champion' && x.team !== e.team && !x.dead); }
  function get_enemy_goals(team) { return state.goals.filter(g => g.team !== team && g.alive); }
  function get_ally_goals(team) { return state.goals.filter(g => g.team === team && g.alive); }

  function nearest_enemy(e, range) {
    let best = null, best_d = range || Infinity;
    for (const o of entities) {
      if (o === e || o.dead) continue;
      if (o.type === 'champion' && o.team === e.team) continue;
      if (o.type === 'champion' && o.invisible && dist(e, o) > 50) continue;
      const d = dist(e, o);
      if (d < best_d) { best_d = d; best = o; }
    }
    return best;
  }

  function nearest_creep(e, range) {
    let best = null, best_d = range || Infinity;
    for (const o of entities) {
      if (o.type !== 'creep' || o.dead) continue;
      const d = dist(e, o);
      if (d < best_d) { best_d = d; best = o; }
    }
    return best;
  }

  function nearest_goal(e, range) {
    const goals = get_enemy_goals(e.team);
    let best = null, best_d = range || Infinity;
    for (const g of goals) {
      if (!g.alive) continue;
      const d = dist(e, g);
      if (d < best_d) { best_d = d; best = g; }
    }
    return best;
  }

  function in_bush(e) {
    for (const b of D.MAP.bushes) {
      if (e.x > b.x && e.x < b.x + b.w && e.y > b.y && e.y < b.y + b.h) return true;
    }
    return false;
  }

  function deal_damage(attacker, target, dmg, effects) {
    if (!target || target.dead) return;
    const reduction = (target.def || 0) / ((target.def || 0) + 100);
    const final_dmg = Math.max(1, Math.round(dmg * (1 - reduction)));
    target.hp -= final_dmg;
    add_particle(target.x, target.y - target.r - 5, '#ff4040', 30, 0, -1.5, 4);
    add_particle(target.x + (Math.random()-0.5)*10, target.y + (Math.random()-0.5)*10, '#ffaa00', 20, 0, -2, 2);
    // effetti visivi
    if (target.is_player) {
      Render.add_shake(3 + final_dmg * 0.1);
      Render.add_damage_flash();
    } else if (attacker && attacker.is_player) {
      Render.add_shake(1.5);
    }
    if (effects) {
      if (effects.stun) target.stun_timer = Math.max(target.stun_timer, effects.stun);
      if (effects.slow) { target.slow_timer = Math.max(target.slow_timer, 2); target.slow_mult = effects.slow; }
    }
    if (target.hp <= 0) {
      target.hp = 0;
      kill_entity(attacker, target);
    }
  }

  function kill_entity(killer, victim) {
    victim.dead = true;
    for (let i = 0; i < 8; i++) {
      add_particle(victim.x, victim.y, victim.type === 'champion' ? '#ff8040' : '#a060c0',
        30 + Math.random() * 20, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 3 + Math.random()*3);
    }
    // death explosion effect
    Render.add_death_effect(victim.x, victim.y, victim.type === 'champion' ? '#ff8040' : '#a060c0');
    if (victim.type === 'champion') {
      victim.respawn_timer = D.RESPAWN_BASE + victim.level * D.RESPAWN_PER_LEVEL;
      if (victim.shards > 0) {
        const lost = Math.floor(victim.shards * 0.5);
        shards_dropped.push({ x: victim.x, y: victim.y, team: victim.team, amount: lost, timer: 60 });
        victim.shards -= lost;
      }
      if (killer && killer.type === 'champion' && killer.team !== victim.team) {
        grant_xp(killer, 80 + victim.level * 10);
      }
      if (on_event) on_event('champion_killed', { killer, victim });
    } else if (victim.type === 'creep') {
      if (killer && killer.type === 'champion') {
        grant_xp(killer, victim.xp);
        const shard_pickup = Math.min(victim.shards, D.MAX_SHARDS_CARRIED - killer.shards);
        killer.shards += shard_pickup;
      }
      victim.respawn_timer = D.CREEPS[victim.creep_tier].respawn;
    } else if (victim.type === 'boss') {
      state.boss_alive = false;
      state.boss_exposed = true;
      state.boss_expose_timer = D.BOSS.expose_duration;
      const allies = killer ? get_allies(killer) : [];
      if (killer) {
        killer.shards = Math.min(killer.shards + victim.shards, D.MAX_SHARDS_CARRIED);
        grant_xp(killer, victim.xp);
      }
      for (const a of allies) {
        grant_xp(a, 100);
        a.shard = Math.min(a.shards + 10, D.MAX_SHARDS_CARRIED);
        a.shield = Math.min(a.shield + 100, a.max_hp * 0.5);
        a.shield_timer = 10;
      }
      if (on_event) on_event('boss_killed', { killer, team: killer ? killer.team : 0 });
    }
  }

  function grant_xp(e, xp) {
    e.xp += xp;
    while (e.xp >= e.xp_to_next && e.level < 15) {
      e.xp -= e.xp_to_next;
      e.level++;
      e.xp_to_next = Math.floor(e.xp_to_next * 1.3);
      const r = D.ROSTER[e.roster_idx];
      e.max_hp = Math.floor(r.base_hp * (1 + (e.level - 1) * 0.08));
      e.hp = Math.min(e.hp + 30, e.max_hp);
      e.atk = Math.floor(r.base_atk * (1 + (e.level - 1) * 0.06));
      e.def = Math.floor(r.base_def * (1 + (e.level - 1) * 0.05));
      e.spd = r.base_spd * (1 + (e.level - 1) * 0.01);
      if (e.level >= 8) e.ult_unlocked = true;
      for (let i = 0; i < 6; i++) {
        add_particle(e.x, e.y, '#ffdd40', 25 + Math.random()*15, (Math.random()-0.5)*3, -Math.random()*3, 3);
      }
      Render.add_level_up_banner(e.x, e.y, e.level);
      if (on_event) on_event('level_up', { entity: e, level: e.level });
    }
  }

  function use_ability(e, idx) {
    if (e.dead || e.stun_timer > 0 || e.ability_cds[idx] > 0) return false;
    const r = D.ROSTER[e.roster_idx];
    let ab = idx === 0 ? r.ab1 : idx === 1 ? r.ab2 : null;
    if (idx === 2) {
      if (!e.ult_unlocked) return false;
      ab = r.ultimate;
    }
    if (!ab) return false;
    const is_upgraded = idx < 2 && e.level >= 10 ? 'upgrade10' : idx < 2 && e.level >= 5 ? 'upgrade5' : null;
    const stats = is_upgraded ? ab[is_upgraded] : ab;
    const dmg = stats.dmg || ab.base_dmg || 0;
    const range = stats.range || ab.range || 0;
    const radius = stats.area_r || stats.radius || 0;
    const cd = stats.cd || ab.cooldown;

    e.ability_cds[idx] = cd;

    if (ab.type === 'melee') {
      const targets = ab.area ? entities.filter(o => o !== e && !o.dead && o.team !== e.team && dist(e, o) <= radius)
                               : [nearest_enemy(e, range)];
      for (const t of targets) {
        if (!t) continue;
        deal_damage(e, t, dmg + e.atk * 0.3, { stun: stats.stun });
        for (let i = 0; i < 4; i++) add_particle(t.x, t.y, r.color, 15, (Math.random()-0.5)*3, (Math.random()-0.5)*3, 2);
      }
      if (ab.area) {
        for (let i = 0; i < 12; i++) {
          const a = (Math.PI * 2 / 12) * i;
          add_particle(e.x + Math.cos(a)*radius*0.7, e.y + Math.sin(a)*radius*0.7, r.color, 20, Math.cos(a)*2, Math.sin(a)*2, 3);
        }
      }
    } else if (ab.type === 'projectile') {
      const t = nearest_enemy(e, range);
      if (t) {
        const a = Math.atan2(t.y - e.y, t.x - e.x);
        add_projectile(e, e.x, e.y, a, dmg + e.atk * 0.2, stats.speed || 10, range, 8, r.color, stats.piercing, 0, stats.slow, stats.stun);
      }
    } else if (ab.type === 'dash') {
      const t = nearest_enemy(e, range);
      const dash_dist = stats.range || range;
      const angle = t ? Math.atan2(t.y - e.y, t.x - e.x) : e.angle;
      e.x += Math.cos(angle) * dash_dist * 0.8;
      e.y += Math.sin(angle) * dash_dist * 0.8;
      e.x = clamp(e.x, 20, D.MAP.W - 20);
      e.y = clamp(e.y, 20, D.MAP.H - 20);
      if (t && dist(e, t) < 80) deal_damage(e, t, dmg + e.atk * 0.2, { stun: stats.stun });
      if (stats.heal_on_hit) e.hp = Math.min(e.max_hp, e.hp + dmg * stats.heal_on_hit);
      for (let i = 0; i < 6; i++) add_particle(e.x, e.y, r.color, 15, (Math.random()-0.5)*2, (Math.random()-0.5)*2, 2);
    } else if (ab.type === 'aoe') {
      const targets = entities.filter(o => o !== e && !o.dead && o.team !== e.team && dist(e, o) <= radius);
      for (const t of targets) {
        deal_damage(e, t, dmg, { slow: stats.slow, stun: stats.stun });
      }
      for (let i = 0; i < 16; i++) {
        const a = (Math.PI * 2 / 16) * i;
        add_particle(e.x + Math.cos(a)*radius*0.5, e.y + Math.sin(a)*radius*0.5, r.color, 25, Math.cos(a)*3, Math.sin(a)*3, 3);
      }
    } else if (ab.type === 'shield') {
      e.shield = Math.min(e.max_hp * 0.6, e.shield + (stats.shield_hp || 100));
      e.shield_timer = stats.duration || 3;
      for (let i = 0; i < 8; i++) add_particle(e.x, e.y, '#60a0ff', 25, (Math.random()-0.5)*3, -Math.random()*3, 2);
    } else if (ab.type === 'heal') {
      const heal = stats.heal || 60;
      if (stats.aoe) {
        for (const a of get_allies(e)) {
          if (dist(e, a) <= (stats.aoe_r || 100)) {
            a.hp = Math.min(a.max_hp, a.hp + heal);
            for (let i = 0; i < 4; i++) add_particle(a.x, a.y, '#60ff60', 20, 0, -2, 2);
          }
        }
        e.hp = Math.min(e.max_hp, e.hp + heal);
      } else {
        const t = nearest_enemy(e, range); // heal ally
        const allies = get_allies(e).filter(a => dist(e, a) <= range);
        let target = allies[0];
        for (const a of allies) { if (a.hp / a.max_hp < (target.hp / target.max_hp)) target = a; }
        if (target) { target.hp = Math.min(target.max_hp, target.hp + heal); for (let i = 0; i < 4; i++) add_particle(target.x, target.y, '#60ff60', 20, 0, -2, 2); }
      }
    } else if (ab.type === 'buff') {
      e.buff_atk = stats.bonus_atk || 0.3;
      e.buff_atk_timer = stats.duration || 4;
      for (let i = 0; i < 6; i++) add_particle(e.x, e.y, '#ffaa40', 20, 0, -2, 2);
    } else if (ab.type === 'shadow') {
      e.invisible = true;
      e.stun_immune = stats.duration || 3;
      e.slow_timer = stats.duration || 3;
      e.slow_mult = 1 - (stats.slow || 0.3);
      for (let i = 0; i < 10; i++) add_particle(e.x, e.y, '#3a3a6a', 25, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 3);
    } else if (ab.type === 'turret') {
      const angle = Math.atan2((e.ai_target ? e.ai_target.y : e.y + 100) - e.y, (e.ai_target ? e.ai_target.x : e.x) - e.x);
      const tx = e.x + Math.cos(angle) * 80;
      const ty = e.y + Math.sin(angle) * 80;
      const turret_count = stats.turret_count || 1;
      for (let ti = 0; ti < turret_count; ti++) {
        const a2 = angle + (ti - (turret_count-1)/2) * 0.5;
        const turret = {
          id: next_id++, type: 'turret', team: e.team, owner: e,
          x: e.x + Math.cos(a2) * 80, y: e.y + Math.sin(a2) * 80,
          hp: stats.turret_hp || 150, max_hp: stats.turret_hp || 150,
          dps: stats.turret_dps || 12, timer: stats.turret_duration || 10,
          atk_timer: 0, angle: a2, r: 10, color: r.color, dead: false,
        };
        entities.push(turret);
      }
      for (let i = 0; i < 8; i++) add_particle(e.x, e.y, '#a0a040', 20, (Math.random()-0.5)*3, (Math.random()-0.5)*3, 2);
    } else if (ab.type === 'hook') {
      const t = nearest_enemy(e, range);
      if (t) {
        deal_damage(e, t, dmg);
        const hook_angle = Math.atan2(e.y - t.y, e.x - t.x);
        t.x += Math.cos(hook_angle) * 120;
        t.y += Math.sin(hook_angle) * 120;
        t.x = clamp(t.x, 20, D.MAP.W - 20);
        t.y = clamp(t.y, 20, D.MAP.H - 20);
        if (stats.stun) t.stun_timer = Math.max(t.stun_timer, stats.stun);
        for (let i = 0; i < 6; i++) add_particle(t.x, t.y, '#7a7a7a', 20, (Math.random()-0.5)*3, (Math.random()-0.5)*3, 2);
      }
    } else if (ab.type === 'stealth') {
      e.invisible = true;
      e.stun_immune = 0;
      e.spd *= (1 + (stats.speed_boost || 0.3));
      for (let i = 0; i < 12; i++) add_particle(e.x, e.y, '#1a1a3a', 30, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 3);
    } else if (ab.type === 'burst') {
      const t = nearest_enemy(e, range);
      if (t) {
        const burst_angle = Math.atan2(t.y - e.y, t.x - e.x);
        const count = stats.burst_count || 3;
        const delay = stats.burst_delay || 0.15;
        for (let bi = 0; bi < count; bi++) {
          setTimeout(() => {
            if (e.dead) return;
            add_projectile(e, e.x, e.y, burst_angle + (Math.random()-0.5)*0.2, dmg + e.atk * 0.2, 14, range, 5, r.color, stats.piercing);
          }, bi * delay * 1000);
        }
      }
    } else if (ab.type === 'aoe_buff') {
      const allies = get_allies(e);
      for (const a of allies) {
        if (dist(e, a) <= 250) {
          a.spd *= (1 + (stats.speed_boost || 0.3));
          a.buff_atk = stats.atk_boost || 0.2;
          a.buff_atk_timer = stats.duration || 4;
          for (let i = 0; i < 4; i++) add_particle(a.x, a.y, '#d0a0d0', 20, 0, -2, 2);
        }
      }
      for (let i = 0; i < 10; i++) {
        const a = (Math.PI * 2 / 10) * i;
        add_particle(e.x + Math.cos(a)*100, e.y + Math.sin(a)*100, '#d0a0d0', 25, Math.cos(a)*2, Math.sin(a)*2, 2);
      }
    }

    if (idx === 2) {
      const targets2 = entities.filter(o => o !== e && !o.dead && o.team !== e.team && dist(e, o) <= radius);
      for (const t of targets2) deal_damage(e, t, dmg);
      if (stats.team_heal) {
        for (const a of get_allies(e)) {
          if (dist(e, a) <= radius) { a.hp = Math.min(a.max_hp, a.hp + stats.team_heal); }
        }
      }
      for (let i = 0; i < 20; i++) {
        const a = (Math.PI * 2 / 20) * i;
        add_particle(e.x + Math.cos(a)*radius*0.6, e.y + Math.sin(a)*radius*0.6, '#ffdd00', 30, Math.cos(a)*4, Math.sin(a)*4, 4);
      }
    }
    return true;
  }

  function basic_attack(e) {
    if (e.dead || e.stun_timer > 0 || e.atk_timer > 0) return;
    const r = D.ROSTER[e.roster_idx];
    let t = nearest_enemy(e, e.range + 30);
    if (!t) t = nearest_creep(e, e.range + 30);
    if (!t) return;
    e.angle = Math.atan2(t.y - e.y, t.x - e.x);
    e.atk_timer = 1 / e.atk_speed;
    const bonus = e.buff_atk > 0 ? e.atk * e.buff_atk : 0;
    if (e.range > 100) {
      add_projectile(e, e.x, e.y, e.angle, e.atk + bonus, 12, e.range, 5, r.color);
      // muzzle flash effect
      attack_effects.push({ type: 'muzzle', x: e.x, y: e.y, angle: e.angle, color: r.color, timer: 6 });
    } else {
      deal_damage(e, t, e.atk + bonus);
      // melee slash effect
      attack_effects.push({ type: 'slash', x: e.x, y: e.y, angle: e.angle, color: r.color, timer: 10, range: e.range });
    }
  }

  function try_channel(e) {
    if (e.dead || e.shards <= 0 || e.channeling) return false;
    const goal = nearest_goal(e, 80);
    const exposed = state.boss_exposed;
    if (!goal) return false;
    if (!exposed && goal.tier === 3) {
      const alive_lane = state.goals.filter(g => g.team === goal.team && g.lane !== 'base' && g.alive).length;
      if (alive_lane > 0) return false;
    }
    if (!exposed && goal.tier === 2) {
      const alive_outer = state.goals.filter(g => g.team === goal.team && g.lane === goal.lane && g.tier === 1 && g.alive).length;
      if (alive_outer > 0) return false;
    }
    e.channeling = true;
    e.channel_target = goal;
    e.channel_timer = D.CHANNEL_TIME;
    return true;
  }

  function cancel_channel(e) {
    if (e.channeling) {
      const lost = Math.floor(e.shards * D.CHANNEL_INTERRUPTED_SHARD_LOSS);
      e.shards -= lost;
      e.channeling = false;
      e.channel_target = null;
      e.channel_timer = 0;
    }
  }

  function update(dt) {
    if (state.phase !== 'playing') return;
    tick++;
    state.time -= dt;
    if (state.time <= 0) { state.time = 0; state.phase = 'finished'; return; }
    state.double_points = state.time <= D.DOUBLE_POINT_TIME;

    if (state.boss_expose_timer > 0) {
      state.boss_expose_timer -= dt;
      if (state.boss_expose_timer <= 0) { state.boss_exposed = false; state.boss_expose_timer = 0; }
    }

    if (!state.boss_alive && state.time <= D.MATCH_DURATION - D.BOSS_SPAWN_TIME && tick % 60 === 0) {
      spawn_boss();
    }

    for (const e of entities) {
      if (e.dead) {
        e.respawn_timer -= dt;
        if (e.respawn_timer <= 0) {
          e.dead = false;
          if (e.type === 'creep') {
            // creeps respawn at their jungle spot
            const spot = D.MAP.jungle_spots[e.spawn_idx % D.MAP.jungle_spots.length];
            e.x = spot.x + (Math.random() - 0.5) * 60;
            e.y = spot.y + (Math.random() - 0.5) * 60;
            e.home_x = e.x;
            e.home_y = e.y;
          } else {
            const base = e.team === 0 ? D.BASES.blue : D.BASES.red;
            e.x = base.x + (Math.random()-0.5)*40;
            e.y = base.y + (Math.random()-0.5)*40;
          }
          e.hp = e.max_hp;
          e.shards = Math.floor(e.shards * 0.7);
          e.stun_timer = 0;
          e.channeling = false;
          e.target = null;
        }
        continue;
      }

      if (e.type === 'champion') {
        if (e.stun_timer > 0) { e.stun_timer -= dt; e.vx = 0; e.vy = 0; }
        else {
          const move_spd = e.spd * (e.slow_timer > 0 ? e.slow_mult : 1);
          e.x += e.vx * move_spd;
          e.y += e.vy * move_spd;
        }
        e.x = clamp(e.x, 20, D.MAP.W - 20);
        e.y = clamp(e.y, 20, D.MAP.H - 20);

        for (const sz of D.MAP.speed_zones) {
          if (dist(e, sz) < sz.r) { e.x += e.vx * sz.mult * dt * 30; e.y += e.vy * sz.mult * dt * 30; }
        }
        for (const jp of D.MAP.jump_pads) {
          if (dist(e, jp) < 40 && (e.vx !== 0 || e.vy !== 0)) {
            e.x = jp.tx; e.y = jp.ty;
            for (let i = 0; i < 8; i++) add_particle(e.x, e.y, '#40c0ff', 20, (Math.random()-0.5)*5, -Math.random()*5, 3);
          }
        }

        e.invisible = in_bush(e) && !nearest_enemy(e, 60);

        e.atk_timer = Math.max(0, e.atk_timer - dt);
        for (let i = 0; i < 3; i++) e.ability_cds[i] = Math.max(0, e.ability_cds[i] - dt);
        if (e.shield_timer > 0) { e.shield_timer -= dt; if (e.shield_timer <= 0) e.shield = 0; }
        if (e.buff_atk_timer > 0) { e.buff_atk_timer -= dt; if (e.buff_atk_timer <= 0) e.buff_atk = 0; }
        if (e.slow_timer > 0) e.slow_timer -= dt;

        // auto-attack: player always auto-attacks nearest enemy
        if (e.is_player && !e.channeling) {
          basic_attack(e);
        }

        if (e.channeling) {
          if (!e.channel_target || !e.channel_target.alive || dist(e, e.channel_target) > 80) {
            cancel_channel(e);
          } else {
            e.channel_timer -= dt;
            if (e.channel_timer <= 0) {
              const g = e.channel_target;
              const points = Math.min(e.shards, 50) * (state.double_points ? 2 : 1);
              g.current_hp -= points;
              e.shards = 0;
              e.channeling = false;
              e.channel_target = null;
              e.shield = D.SHIELD_ON_SCORE;
              e.shield_timer = D.SHIELD_DURATION;
              state.scores[e.team] += points;
              if (g.current_hp <= 0) {
                g.alive = false;
                for (let i = 0; i < 12; i++) add_particle(g.x, g.y, e.team === 0 ? '#40a0ff' : '#ff4040', 35, (Math.random()-0.5)*6, (Math.random()-0.5)*6, 4);
                if (on_event) on_event('goal_destroyed', { goal: g, team: e.team });
              }
              for (let i = 0; i < 6; i++) add_particle(g.x, g.y, '#ffdd00', 25, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 3);
            }
          }
        }

        if (e.hp <= 0 && !e.dead) { e.dead = true; e.respawn_timer = D.RESPAWN_BASE + e.level * D.RESPAWN_PER_LEVEL; }
      } else if (e.type === 'creep' || e.type === 'boss') {
        if (e.target && (e.target.dead || dist(e, e.target) > 400)) e.target = null;
        if (!e.target) {
          let best = null, best_d = e.aggro_r || 200;
          for (const o of entities) {
            if (o === e || o.dead || o.team === e.team) continue;
            if (o.type === 'champion' && o.invisible) continue;
            const d = dist(e, o);
            if (d < best_d) { best_d = d; best = o; }
          }
          e.target = best;
        }
        // attack cooldown
        if (e.atk_cd > 0) e.atk_cd -= dt;
        if (e.target) {
          const d = dist(e, e.target);
          const atk_dist = e.r + (e.target.r || 30) + 10;
          const atk_rng = e.atk_range || atk_dist;
          if (d > atk_rng) {
            // move toward target
            const a = Math.atan2(e.target.y - e.y, e.target.x - e.x);
            // charge type: burst of speed when charging
            if (e.atk_type === 'charge' && d < 200 && e.atk_cd <= 0) {
              e.x += Math.cos(a) * e.charge_spd;
              e.y += Math.sin(a) * e.charge_spd;
              // charge damage on contact
              if (d < atk_dist) {
                deal_damage(e, e.target, e.charge_dmg);
                e.atk_cd = 2;
                for (let i = 0; i < 6; i++) add_particle(e.target.x, e.target.y, e.color, 15, (Math.random()-0.5)*4, (Math.random()-0.5)*4, 3);
              }
            } else {
              e.x += Math.cos(a) * e.spd;
              e.y += Math.sin(a) * e.spd;
            }
            e.angle = a;
          } else if (e.atk_cd <= 0) {
            // attack!
            e.atk_cd = 1.5;
            const a = Math.atan2(e.target.y - e.y, e.target.x - e.x);
            e.angle = a;
            if (e.atk_type === 'ranged') {
              // fire projectile
              projectiles.push({
                owner: e, x: e.x, y: e.y, dx: Math.cos(a) * e.proj_speed, dy: Math.sin(a) * e.proj_speed,
                dmg: e.atk, r: 4, max_dist: e.atk_range || 150, dist_traveled: 0,
                color: e.proj_color || '#fff', hit: new Set(), slow: 0, stun: 0, piercing: false,
              });
            } else if (e.atk_type === 'aoe') {
              // area damage around self
              for (const o of entities) {
                if (o === e || o.dead || o.team === e.team) continue;
                if (dist(e, o) < (e.aoe_r || 60)) {
                  deal_damage(e, o, e.aoe_dmg || e.atk);
                }
              }
              for (let i = 0; i < 8; i++) {
                const pa = (i / 8) * Math.PI * 2;
                add_particle(e.x + Math.cos(pa) * (e.aoe_r || 60) * 0.5, e.y + Math.sin(pa) * (e.aoe_r || 60) * 0.5, e.color, 20, Math.cos(pa)*2, Math.sin(pa)*2, 3);
              }
            } else if (e.atk_type === 'pull') {
              // pull target toward self
              if (d < (e.pull_r || 100)) {
                deal_damage(e, e.target, e.pull_dmg || e.atk);
                const pull_a = Math.atan2(e.y - e.target.y, e.x - e.target.x);
                e.target.x += Math.cos(pull_a) * 30;
                e.target.y += Math.sin(pull_a) * 30;
                for (let i = 0; i < 4; i++) add_particle(e.target.x, e.target.y, '#a040c0', 15, 0, -2, 2);
              }
            } else {
              // melee attack
              deal_damage(e, e.target, e.atk);
            }
          }
        } else {
          // return home
          const dx = e.home_x - e.x, dy = e.home_y - e.y;
          const d = Math.hypot(dx, dy);
          if (d > 20) { e.x += (dx/d) * e.spd * 0.5; e.y += (dy/d) * e.spd * 0.5; }
        }
        e.x = clamp(e.x, 20, D.MAP.W - 20);
        e.y = clamp(e.y, 20, D.MAP.H - 20);
      } else if (e.type === 'turret') {
        e.timer -= dt;
        if (e.timer <= 0 || (e.owner && e.owner.dead)) {
          e.dead = true;
          for (let i = 0; i < 6; i++) add_particle(e.x, e.y, '#a0a040', 20, (Math.random()-0.5)*3, (Math.random()-0.5)*3, 2);
          continue;
        }
        e.atk_timer -= dt;
        if (e.atk_timer <= 0) {
          const target = nearest_enemy(e, 250);
          if (target) {
            e.angle = Math.atan2(target.y - e.y, target.x - e.x);
            add_projectile(e, e.x, e.y, e.angle, e.dps, 10, 250, 4, e.color);
            e.atk_timer = 0.5;
          }
        }
      }
    }

    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      p.x += p.dx; p.y += p.dy;
      p.dist_traveled += p.speed;
      if (p.x < 0 || p.x > D.MAP.W || p.y < 0 || p.y > D.MAP.H || p.dist_traveled > p.range) {
        projectiles.splice(i, 1); continue;
      }
      for (const e of entities) {
        if (e === p.owner || e.dead) continue;
        if (p.owner.type === 'champion' && e.type === 'champion' && e.team === p.owner.team) continue;
        if (p.hit.has(e.id)) continue;
        if (dist(p, e) < p.r + (e.r || 25)) {
          deal_damage(p.owner, e, p.dmg, { slow: p.slow, stun: p.stun });
          if (!p.piercing) { projectiles.splice(i, 1); break; }
          p.hit.add(e.id);
        }
      }
    }

    for (let i = shards_dropped.length - 1; i >= 0; i--) {
      shards_dropped[i].timer -= dt;
      if (shards_dropped[i].timer <= 0) { shards_dropped.splice(i, 1); continue; }
      for (const e of entities) {
        if (e.type !== 'champion' || e.dead) continue;
        if (dist(e, shards_dropped[i]) < 40) {
          const amt = Math.min(shards_dropped[i].amount, D.MAX_SHARDS_CARRIED - e.shards);
          e.shards += amt;
          shards_dropped[i].amount -= amt;
          if (shards_dropped[i].amount <= 0) { shards_dropped.splice(i, 1); break; }
        }
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.dx; p.y += p.dy;
      p.life--;
      if (p.life <= 0) particles.splice(i, 1);
    }

    for (let i = attack_effects.length - 1; i >= 0; i--) {
      attack_effects[i].timer--;
      if (attack_effects[i].timer <= 0) attack_effects.splice(i, 1);
    }
  }

  return {
    init, spawn_champion, spawn_creep, spawn_boss, update, use_ability, basic_attack, try_channel,
    cancel_channel, get state() { return state; }, get entities() { return entities; },
    get particles() { return particles; }, get projectiles() { return projectiles; },
    get shards_dropped() { return shards_dropped; }, get attack_effects() { return attack_effects; },
    dist, clamp, grant_xp, deal_damage,
    nearest_enemy, nearest_creep, nearest_goal, get_allies, get_enemies, get_enemy_goals, get_ally_goals,
    set on_event(fn) { on_event = fn; },
  };
})();

if (typeof module !== 'undefined') module.exports = Game;
