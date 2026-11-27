import * as THREE from 'three';

/** Lightweight GPU particle rain outdoors + floating dust motes indoors. */
export class WeatherFX {
  private rain: THREE.Points;
  private rainPos: Float32Array;
  private dust: THREE.Points;
  private dustPos: Float32Array;
  private isOutdoor = false;

  constructor(scene: THREE.Scene) {
    const rainCount = 320;
    this.rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      this.rainPos[i * 3] = (Math.random() - 0.5) * 32;
      this.rainPos[i * 3 + 1] = Math.random() * 12;
      this.rainPos[i * 3 + 2] = (Math.random() - 0.5) * 32;
    }
    const rGeo = new THREE.BufferGeometry();
    rGeo.setAttribute('position', new THREE.BufferAttribute(this.rainPos, 3));
    this.rain = new THREE.Points(
      rGeo,
      new THREE.PointsMaterial({ color: 0x9ab4d4, size: 0.06, transparent: true, opacity: 0.38, depthWrite: false })
    );
    this.rain.visible = false;
    scene.add(this.rain);

    const dustCount = 90;
    this.dustPos = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      this.dustPos[i * 3] = (Math.random() - 0.5) * 14;
      this.dustPos[i * 3 + 1] = 0.4 + Math.random() * 2.2;
      this.dustPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
    }
    const dGeo = new THREE.BufferGeometry();
    dGeo.setAttribute('position', new THREE.BufferAttribute(this.dustPos, 3));
    this.dust = new THREE.Points(
      dGeo,
      new THREE.PointsMaterial({ color: 0xffe4b5, size: 0.035, transparent: true, opacity: 0.22, depthWrite: false })
    );
    scene.add(this.dust);
  }

  setOutdoor(outdoor: boolean) {
    this.isOutdoor = outdoor;
    this.rain.visible = outdoor;
    this.dust.visible = !outdoor;
  }

  update(dt: number, playerPos: THREE.Vector3) {
    if (this.isOutdoor) {
      this.rain.position.set(playerPos.x, 0, playerPos.z);
      for (let i = 0; i < this.rainPos.length; i += 3) {
        this.rainPos[i + 1] -= dt * 11;
        if (this.rainPos[i + 1] < 0) this.rainPos[i + 1] = 12;
      }
      this.rain.geometry.attributes.position.needsUpdate = true;
    } else {
      for (let i = 0; i < this.dustPos.length; i += 3) {
        this.dustPos[i + 1] += Math.sin(performance.now() * 0.001 + i) * dt * 0.06;
      }
      this.dust.geometry.attributes.position.needsUpdate = true;
    }
  }
}
