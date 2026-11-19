/* GEOM DASH — player physics, collision and flow mechanics */

import { GROUND, PHYS } from './config.js';

export function createPlayer() {
  return {
    x: PHYS.playerX,
    y: GROUND - PHYS.playerH,
    w: PHYS.playerW,
    h: PHYS.playerH,
    vy: 0,
    onGround: true,
    coyote: 0,
    buffer: 0,
    jumping: false,
    doubleUsed: false,
    doubleUnlocked: false,
    shield: false,
    flow: 0,
    alive: true,
    trail: [],
    trailClock: 0
  };
}

export function queueJump(player) { player.buffer = PHYS.jumpBuffer; }

export function releaseJump(player) {
  if (player.vy < -180) player.vy *= PHYS.jumpCut;
}

function overlaps(player, obstacle) {
  return player.x < obstacle.x + obstacle.w &&
    player.x + player.w > obstacle.x &&
    player.y < obstacle.y + obstacle.h &&
    player.y + player.h > obstacle.y;
}

export function updatePlayer(player, dt, gravityScale, obstacles, events) {
  const eventsOut = events || { died: false, near: 0, landed: false, jumped: false, doubled: false, shield: false };

  if (player.buffer > 0) player.buffer -= dt;
  if (player.coyote > 0) player.coyote -= dt;

  const canGroundJump = player.onGround || player.coyote > 0;
  if (player.buffer > 0 && (canGroundJump || (player.doubleUnlocked && !player.doubleUsed))) {
    if (!canGroundJump) {
      player.doubleUsed = true;
      eventsOut.doubled = true;
    } else {
      eventsOut.jumped = true;
    }
    player.vy = PHYS.jumpVelocity;
    player.jumping = true;
    player.onGround = false;
    player.coyote = 0;
    player.buffer = 0;
  }

  player.vy = Math.min(PHYS.maxFall, player.vy + PHYS.gravity * gravityScale * dt);
  player.y += player.vy * dt;

  if (player.y + player.h >= GROUND) {
    if (!player.onGround && player.vy > 120) eventsOut.landed = true;
    player.y = GROUND - player.h;
    player.vy = 0;
    player.onGround = true;
    player.jumping = false;
    player.doubleUsed = false;
    player.coyote = PHYS.coyoteTime;
  } else {
    player.onGround = false;
  }
  if (player.y < 0) { player.y = 0; player.vy = 0; }

  for (let i = 0; i < obstacles.length; i++) {
    const obstacle = obstacles[i];
    if (!obstacle.active) continue;

    if (!obstacle.near && obstacle.x + obstacle.w < player.x + player.w + 26 && !overlaps(player, obstacle)) {
      const verticalGap = obstacle.y > player.y
        ? obstacle.y - (player.y + player.h)
        : player.y - (obstacle.y + obstacle.h);
      if (verticalGap >= 0 && verticalGap < 46) {
        obstacle.near = true;
        player.flow = Math.min(100, player.flow + 6);
        eventsOut.near++;
        if (player.flow >= 100 && !player.doubleUnlocked) player.doubleUnlocked = true;
      }
    }

    if (overlaps(player, obstacle)) {
      if (player.shield) {
        player.shield = false;
        player.flow = Math.max(0, player.flow - 30);
        obstacle.active = false;
        eventsOut.shield = true;
      } else {
        player.alive = false;
        eventsOut.died = true;
        return eventsOut;
      }
    }
  }

  player.trailClock += dt;
  if (player.trailClock >= 0.025) {
    player.trailClock = 0;
    player.trail.unshift({ x: player.x + player.w / 2, y: player.y + player.h / 2, life: 1 });
    if (player.trail.length > 16) player.trail.pop();
  }
  for (let i = player.trail.length - 1; i >= 0; i--) {
    player.trail[i].life -= dt * 2.6;
    if (player.trail[i].life <= 0) player.trail.splice(i, 1);
  }

  return eventsOut;
}
