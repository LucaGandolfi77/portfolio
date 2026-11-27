import * as THREE from 'three';
import type { ErrandDef } from '../data/types';
import type { GameState } from '../game/GameState';
import type { LightPool } from '../renderer/LightingManager';
import type { Shadow } from '../enemies/Shadow';
import type { World } from '../world/Interactable';

/**
 * Live nocturnal radar / minimap with glowing LightPools, floorplan walls,
 * player FOV cone, and pulsing highlights for active objectives, exits,
 * chargers/powerbanks, clues, and nearby Shadows.
 * Tap or press [M] to toggle expanded view + legend.
 */
export class Minimap {
  private wrap: HTMLElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private titleEl: HTMLElement;
  private legendEl: HTMLElement;
  expanded = false;

  constructor(container: HTMLElement) {
    this.wrap = document.createElement('div');
    this.wrap.className = 'minimap-wrap hidden';
    this.wrap.innerHTML = `
      <div class="minimap-head">
        <span class="minimap-zone">MAP</span>
        <span class="minimap-key">[M]</span>
      </div>
      <canvas class="minimap-canvas" width="240" height="240"></canvas>
      <div class="minimap-legend hidden">
        <span><i class="dot gold"></i>Objective</span>
        <span><i class="dot cyan"></i>Exit</span>
        <span><i class="dot teal"></i>Charge</span>
        <span><i class="dot amber"></i>Light</span>
      </div>`;
    container.appendChild(this.wrap);

    this.canvas = this.wrap.querySelector('canvas')!;
    this.ctx = this.canvas.getContext('2d')!;
    this.titleEl = this.wrap.querySelector('.minimap-zone')!;
    this.legendEl = this.wrap.querySelector('.minimap-legend')!;

    this.wrap.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleExpand();
    });
  }

  setVisible(v: boolean) {
    this.wrap.classList.toggle('hidden', !v);
  }

  toggleExpand() {
    this.expanded = !this.expanded;
    this.wrap.classList.toggle('expanded', this.expanded);
    this.legendEl.classList.toggle('hidden', !this.expanded);
  }

  render(
    time: number,
    state: GameState,
    zoneName: string,
    world: World,
    playerPos: THREE.Vector3,
    playerYaw: number,
    pools: LightPool[],
    shadows: Shadow[],
    activeErrand: ErrandDef | null
  ) {
    this.titleEl.textContent = zoneName;
    const ctx = this.ctx;
    const W = this.canvas.width;
    const H = this.canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Background radar grid
    ctx.fillStyle = 'rgba(7, 11, 20, 0.9)';
    ctx.fillRect(0, 0, W, H);

    const b = world.bounds;
    const spanX = Math.max(12, b.max.x - b.min.x);
    const spanZ = Math.max(12, b.max.z - b.min.z);
    const pad = 16;
    const scale = Math.min((W - pad * 2) / spanX, (H - pad * 2) / spanZ);
    const cx = (b.min.x + b.max.x) / 2;
    const cz = (b.min.z + b.max.z) / 2;
    const toX = (x: number) => W / 2 + (x - cx) * scale;
    const toY = (z: number) => H / 2 + (z - cz) * scale;

    // Subtle grid lines
    ctx.strokeStyle = 'rgba(130, 160, 200, 0.08)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 4; i++) {
      ctx.beginPath(); ctx.moveTo((W / 4) * i, 0); ctx.lineTo((W / 4) * i, H); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, (H / 4) * i); ctx.lineTo(W, (H / 4) * i); ctx.stroke();
    }

    // Active LightPools (warm safe circles)
    for (const p of pools) {
      if (!p.active) continue;
      const px = toX(p.center.x);
      const py = toY(p.center.z);
      const pr = Math.max(6, p.radius * scale);
      const grd = ctx.createRadialGradient(px, py, 1, px, py, pr);
      grd.addColorStop(0, 'rgba(255, 210, 138, 0.36)');
      grd.addColorStop(1, 'rgba(255, 210, 138, 0.0)');
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(px, py, pr, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floorplan walls
    if (world.wallSegments?.length) {
      ctx.strokeStyle = 'rgba(180, 204, 232, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      for (const [x1, z1, x2, z2] of world.wallSegments) {
        ctx.moveTo(toX(x1), toY(z1));
        ctx.lineTo(toX(x2), toY(z2));
      }
      ctx.stroke();
    }

    // Points of Interest & Objective Highlights
    const pulse = 0.5 + 0.5 * Math.sin(time * 5.2);
    for (const item of world.interactables) {
      if (!item.object.visible) continue;
      const pos = item.pos ?? item.object.position;
      const ix = toX(pos.x);
      const iy = toY(pos.z);
      const data = item.data as { errandId?: string; target?: string } | undefined;

      const isTrashStep =
        activeErrand?.id === 'take_trash' &&
        ((state.slots.carryingTrash && item.id === 'outdoor_trash_bin') ||
          (!state.slots.carryingTrash && item.id === 'trash_bag'));

      const isActiveErrand =
        isTrashStep ||
        (activeErrand && activeErrand.id !== 'take_trash' && data?.errandId === activeErrand.id) ||
        (activeErrand && activeErrand.zone !== state.zone && item.kind === 'zone' &&
          (data?.target === activeErrand.zone || (state.zone === 'home' && data?.target === 'street')));

      if (isActiveErrand) {
        // Pulsing gold objective halo + diamond star
        ctx.strokeStyle = `rgba(255, 210, 112, ${0.4 + pulse * 0.6})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ix, iy, 6 + pulse * 6, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffd574';
        ctx.beginPath();
        ctx.moveTo(ix, iy - 5);
        ctx.lineTo(ix + 5, iy);
        ctx.lineTo(ix, iy + 5);
        ctx.lineTo(ix - 5, iy);
        ctx.closePath();
        ctx.fill();
      } else if (item.kind === 'zone') {
        ctx.fillStyle = '#3ec2db';
        ctx.fillRect(ix - 3.5, iy - 3.5, 7, 7);
      } else if (item.kind === 'charger' || item.kind === 'powerbank' || item.kind === 'flashlight' || item.kind === 'key') {
        ctx.fillStyle = '#6ce0b8';
        ctx.beginPath();
        ctx.arc(ix, iy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      } else if (item.kind === 'clue' || item.kind === 'photo' || item.kind === 'note') {
        ctx.fillStyle = '#c9a6ff';
        ctx.beginPath();
        ctx.arc(ix, iy, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Nearby Shadows (red radar blip when close or high threat)
    for (const s of shadows) {
      if (!s.group.visible) continue;
      const dist = s.group.position.distanceTo(playerPos);
      if (dist > 14 && state.threat < 55) continue;
      const sx = toX(s.group.position.x);
      const sy = toY(s.group.position.z);
      ctx.fillStyle = `rgba(255, 62, 92, ${0.55 + pulse * 0.4})`;
      ctx.beginPath();
      ctx.arc(sx, sy, 4 + pulse * 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Player position & viewing cone
    const px = toX(playerPos.x);
    const py = toY(playerPos.z);
    // Camera forward in XZ is (-sin(yaw), -cos(yaw))
    const dirAngle = Math.atan2(-Math.cos(playerYaw), -Math.sin(playerYaw));
    ctx.fillStyle = 'rgba(255, 226, 168, 0.24)';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.arc(px, py, 20, dirAngle - 0.52, dirAngle + 0.52);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(px, py, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffd594';
    ctx.lineWidth = 1.6;
    ctx.stroke();
  }
}
