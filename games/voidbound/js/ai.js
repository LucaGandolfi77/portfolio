const AI = (() => {
  'use strict';
  const D = VOIDBOUND;

  const STATES = { IDLE: 0, FARM: 1, PUSH: 2, FIGHT: 3, RETREAT: 4, SCORE: 5, DEFEND: 6, BOSS: 7 };

  function assign_lanes(bots) {
    const blue = bots.filter(b => b.team === 0);
    const red = bots.filter(b => b.team === 1);
    const lane_assignments = ['top', 'top', 'bot', 'bot', 'jungle'];
    for (let i = 0; i < blue.length; i++) {
      blue[i].lane = lane_assignments[i % lane_assignments.length];
      blue[i].ai_state = blue[i].lane === 'jungle' ? STATES.FARM : STATES.PUSH;
    }
    for (let i = 0; i < red.length; i++) {
      red[i].lane = lane_assignments[i % lane_assignments.length];
      red[i].ai_state = red[i].lane === 'jungle' ? STATES.FARM : STATES.PUSH;
    }
  }

  function move_toward(e, tx, ty, dt) {
    const dx = tx - e.x, dy = ty - e.y;
    const d = Math.hypot(dx, dy);
    if (d < 10) { e.vx = 0; e.vy = 0; return true; }
    e.vx = dx / d;
    e.vy = dy / d;
    return false;
  }

  function get_lane_waypoints(e) {
    const lane_data = D.MAP.lanes[e.lane];
    if (!lane_data) return null;
    return e.team === 0 ? lane_data.waypoints_blue : lane_data.waypoints_red;
  }

  function get_next_waypoint(e) {
    const wps = get_lane_waypoints(e);
    if (!wps) return null;
    let best_idx = 0, best_d = Infinity;
    for (let i = 0; i < wps.length; i++) {
      const d = Math.hypot(wps[i][0] - e.x, wps[i][1] - e.y);
      if (d < best_d) { best_d = d; best_idx = i; }
    }
    const next = best_idx < wps.length - 1 ? best_idx + 1 : best_idx;
    return wps[next];
  }

  function is_low_hp(e) { return e.hp / e.max_hp < 0.3; }
  function is_critical_hp(e) { return e.hp / e.max_hp < 0.15; }

  function update_bot(e, dt) {
    if (e.dead || e.stun_timer > 0) return;

    if (is_critical_hp(e) && e.ai_state !== STATES.RETREAT) {
      e.ai_state = STATES.RETREAT;
    }

    const enemy_nearby = Game.nearest_enemy(e, 300);
    const creep_nearby = Game.nearest_creep(e, 500);
    const goal_nearby = Game.nearest_goal(e, 120);
    const allied_goals = Game.get_ally_goals(e.team).filter(g => dist(e, g) < 600);
    const boss_alive = Game.state.boss_alive;

    switch (e.ai_state) {
      case STATES.IDLE:
        e.ai_state = e.lane === 'jungle' ? STATES.FARM : STATES.PUSH;
        break;

      case STATES.FARM:
        if (boss_alive && Game.state.time < D.MATCH_DURATION - D.BOSS_SPAWN_TIME + 30 && e.team === 0) {
          e.ai_state = STATES.BOSS; break;
        }
        if (enemy_nearby && dist(e, enemy_nearby) < 200 && !is_low_hp(e)) {
          e.ai_state = STATES.FIGHT; break;
        }
        if (e.shards >= 20 && goal_nearby && can_score_at(e, goal_nearby)) {
          e.ai_state = STATES.SCORE; break;
        }
        if (allied_goals.length > 0 && is_near_ally_goal_threatened(e, allied_goals)) {
          e.ai_state = STATES.DEFEND; break;
        }
        if (creep_nearby) {
          move_toward(e, creep_nearby.x, creep_nearby.y, dt);
          if (dist(e, creep_nearby) < e.range + 20) {
            e.angle = Math.atan2(creep_nearby.y - e.y, creep_nearby.x - e.x);
            Game.basic_attack(e);
          }
        } else {
          const wps = get_lane_waypoints(e);
          if (wps) {
            const center = wps[Math.floor(wps.length / 2)];
            move_toward(e, center[0] + (Math.random()-0.5)*200, center[1] + (Math.random()-0.5)*200, dt);
          }
        }
        break;

      case STATES.PUSH:
        if (boss_alive && Game.state.time < 120 && Math.random() < 0.3) {
          e.ai_state = STATES.BOSS; break;
        }
        if (enemy_nearby && dist(e, enemy_nearby) < 250 && !is_low_hp(e)) {
          e.ai_state = STATES.FIGHT; break;
        }
        if (e.shards >= 15 && goal_nearby && can_score_at(e, goal_nearby)) {
          e.ai_state = STATES.SCORE; break;
        }
        if (allied_goals.length > 0 && is_near_ally_goal_threatened(e, allied_goals)) {
          e.ai_state = STATES.DEFEND; break;
        }
        if (e.shards >= 10 && goal_nearby) {
          e.ai_state = STATES.SCORE; break;
        }
        if (creep_nearby && !is_low_hp(e)) {
          move_toward(e, creep_nearby.x, creep_nearby.y, dt);
          if (dist(e, creep_nearby) < e.range + 20) {
            e.angle = Math.atan2(creep_nearby.y - e.y, creep_nearby.x - e.x);
            Game.basic_attack(e);
            if (e.ability_cds[0] <= 0 && dist(e, creep_nearby) < 80) Game.use_ability(e, 0);
          }
        } else {
          const wp = get_next_waypoint(e);
          if (wp) move_toward(e, wp[0], wp[1], dt);
        }
        break;

      case STATES.FIGHT:
        if (is_low_hp(e)) { e.ai_state = STATES.RETREAT; break; }
        if (!enemy_nearby || dist(e, enemy_nearby) > 400) {
          e.ai_state = e.shards >= 15 ? STATES.SCORE : (e.lane === 'jungle' ? STATES.FARM : STATES.PUSH);
          break;
        }
        move_toward(e, enemy_nearby.x, enemy_nearby.y, dt);
        const d_to_enemy = dist(e, enemy_nearby);
        if (d_to_enemy < e.range + 20) {
          e.angle = Math.atan2(enemy_nearby.y - e.y, enemy_nearby.x - e.x);
          Game.basic_attack(e);
        }
        if (d_to_enemy < 200 && e.stun_timer <= 0) {
          if (e.ability_cds[0] <= 0) Game.use_ability(e, 0);
          else if (e.ability_cds[1] <= 0) Game.use_ability(e, 1);
        }
        if (e.ult_unlocked && e.ability_cds[2] <= 0 && d_to_enemy < 150 && enemy_nearby.hp / enemy_nearby.max_hp < 0.5) {
          Game.use_ability(e, 2);
        }
        break;

      case STATES.RETREAT:
        const base = e.team === 0 ? D.BASES.blue : D.BASES.red;
        move_toward(e, base.x, base.y, dt);
        if (e.hp / e.max_hp > 0.6 || dist(e, base) < 100) {
          e.ai_state = e.lane === 'jungle' ? STATES.FARM : STATES.PUSH;
        }
        if (enemy_nearby && dist(e, enemy_nearby) > 500 && e.hp / e.max_hp > 0.4) {
          e.ai_state = STATES.FIGHT;
        }
        break;

      case STATES.SCORE:
        if (e.shards <= 0 || !goal_nearby) {
          e.ai_state = e.lane === 'jungle' ? STATES.FARM : STATES.PUSH; break;
        }
        if (!can_score_at(e, goal_nearby)) {
          e.ai_state = STATES.PUSH; break;
        }
        if (enemy_nearby && dist(e, enemy_nearby) < 200 && !is_low_hp(e)) {
          e.ai_state = STATES.FIGHT; break;
        }
        if (dist(e, goal_nearby) > 60) {
          move_toward(e, goal_nearby.x, goal_nearby.y, dt);
        } else {
          e.vx = 0; e.vy = 0;
          Game.try_channel(e);
        }
        break;

      case STATES.DEFEND:
        const threat = allied_goals[0];
        if (!threat || dist(e, threat) > 700) {
          e.ai_state = e.lane === 'jungle' ? STATES.FARM : STATES.PUSH; break;
        }
        move_toward(e, threat.x, threat.y, dt);
        const def_enemy = Game.nearest_enemy(e, 200);
        if (def_enemy && dist(e, def_enemy) < e.range + 20) {
          e.angle = Math.atan2(def_enemy.y - e.y, def_enemy.x - e.x);
          Game.basic_attack(e);
          if (e.ability_cds[0] <= 0 && dist(e, def_enemy) < 80) Game.use_ability(e, 0);
        }
        break;

      case STATES.BOSS:
        const boss = Game.entities.find(o => o.type === 'boss' && !o.dead);
        if (!boss) { e.ai_state = e.lane === 'jungle' ? STATES.FARM : STATES.PUSH; break; }
        if (is_low_hp(e)) { e.ai_state = STATES.RETREAT; break; }
        const boss_d = dist(e, boss);
        if (boss_d > 400) {
          move_toward(e, boss.x, boss.y, dt);
        } else {
          move_toward(e, boss.x, boss.y, dt);
          if (boss_d < e.range + 40) {
            e.angle = Math.atan2(boss.y - e.y, boss.x - e.x);
            Game.basic_attack(e);
            if (e.ability_cds[0] <= 0 && boss_d < 100) Game.use_ability(e, 0);
            if (e.ability_cds[1] <= 0 && boss_d < 80) Game.use_ability(e, 1);
            if (e.ult_unlocked && e.ability_cds[2] <= 0 && boss.hp / boss.max_hp < 0.4) Game.use_ability(e, 2);
          }
        }
        const enemy_steal = Game.nearest_enemy(e, 300);
        if (enemy_steal && dist(enemy_steal, boss) < 250 && !is_low_hp(e)) {
          e.ai_state = STATES.FIGHT;
          e.ai_target = enemy_steal;
        }
        break;
    }

    if (e.shards >= 30 && e.ai_state !== STATES.SCORE && e.ai_state !== STATES.RETREAT) {
      const g = Game.nearest_goal(e, 500);
      if (g && can_score_at(e, g)) e.ai_state = STATES.SCORE;
    }
  }

  function can_score_at(e, goal) {
    if (!goal || !goal.alive) return false;
    if (goal.tier === 3 && Game.state.boss_exposed) return true;
    if (goal.tier === 3) {
      return Game.state.goals.filter(g => g.team === goal.team && g.lane !== 'base' && g.alive).length === 0;
    }
    if (goal.tier === 2) {
      return Game.state.goals.filter(g => g.team === goal.team && g.lane === goal.lane && g.tier === 1 && g.alive).length === 0;
    }
    return true;
  }

  function is_near_ally_goal_threatened(e, goals) {
    for (const g of goals) {
      const enemy = Game.nearest_enemy(e, 500);
      if (enemy && dist(enemy, g) < 300) return true;
    }
    return false;
  }

  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

  return { STATES, assign_lanes, update_bot };
})();

if (typeof module !== 'undefined') module.exports = AI;
