import * as THREE from 'three';
import type { GameState } from '../game/GameState';
import { createFlashlightModel, createPhoneModel, type Materials } from './ProceduralAssets';

/**
 * Manages Emma's first-person held smartphone (with live CanvasTexture screen)
 * and flashlight with subtle breathing/walk sway.
 */
export class ViewModel {
  readonly phoneGroup: THREE.Group;
  readonly torchGroup: THREE.Group;
  private screenCanvas: HTMLCanvasElement;
  private screenCtx: CanvasRenderingContext2D;
  private screenTex: THREE.CanvasTexture;
  private lastDraw = 0;

  constructor(camera: THREE.PerspectiveCamera, materials: Materials) {
    this.phoneGroup = createPhoneModel(materials);
    this.phoneGroup.position.set(0.3, -0.31, -0.54);
    this.phoneGroup.rotation.set(0.15, -0.25, 0.12);
    this.phoneGroup.visible = false;
    camera.add(this.phoneGroup);

    this.torchGroup = createFlashlightModel(materials);
    this.torchGroup.position.set(-0.3, -0.28, -0.5);
    this.torchGroup.rotation.set(0.1, 0.18, -0.15);
    this.torchGroup.visible = false;
    camera.add(this.torchGroup);

    this.screenCanvas = document.createElement('canvas');
    this.screenCanvas.width = 128;
    this.screenCanvas.height = 256;
    this.screenCtx = this.screenCanvas.getContext('2d')!;
    this.screenTex = new THREE.CanvasTexture(this.screenCanvas);
    this.screenTex.colorSpace = THREE.SRGBColorSpace;

    const screenMesh = this.phoneGroup.userData.screen as THREE.Mesh | undefined;
    if (screenMesh) {
      const mat = screenMesh.material as THREE.MeshStandardMaterial;
      mat.map = this.screenTex;
      mat.emissiveMap = this.screenTex;
      mat.emissive.setHex(0xffffff);
      mat.emissiveIntensity = 0.9;
      mat.needsUpdate = true;
    }
  }

  update(time: number, state: GameState, callerName: string | null) {
    this.phoneGroup.visible = state.phase === 'playing' && state.phoneOpen;
    this.torchGroup.visible = state.phase === 'playing' && state.flashlightOn;

    const sway = Math.sin(time * 2.1 + state.panic * 0.04) * (0.004 + state.panic * 0.00012);
    this.phoneGroup.position.y = -0.31 + sway;
    this.torchGroup.position.y = -0.28 - sway;

    if (this.phoneGroup.visible && time - this.lastDraw > 0.25) {
      this.lastDraw = time;
      this.drawScreen(state, callerName);
    }
  }

  private drawScreen(state: GameState, callerName: string | null) {
    const ctx = this.screenCtx;
    ctx.fillStyle = '#0c1626';
    ctx.fillRect(0, 0, 128, 256);

    ctx.fillStyle = '#ffd594';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(state.timeString, 64, 52);

    ctx.fillStyle = state.battery <= 15 ? '#ff4d6a' : '#8fd8c2';
    ctx.font = '12px sans-serif';
    ctx.fillText(`${Math.round(state.battery)}%`, 64, 74);

    if (callerName) {
      ctx.fillStyle = '#1e3552';
      ctx.fillRect(14, 108, 100, 62);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText(callerName, 64, 136);
      ctx.fillStyle = '#82e0aa';
      ctx.font = '11px sans-serif';
      ctx.fillText('CONNECTED', 64, 156);
    } else {
      ctx.fillStyle = '#9bb0c8';
      ctx.font = '11px sans-serif';
      ctx.fillText(state.lightExposure >= 0.4 ? 'IN LIGHT' : 'DARKNESS', 64, 138);
    }
    this.screenTex.needsUpdate = true;
  }
}
