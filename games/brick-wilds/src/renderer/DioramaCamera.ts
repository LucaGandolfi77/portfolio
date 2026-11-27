import * as THREE from 'three';

/**
 * Fixed-angle isometric diorama camera with smooth look-ahead,
 * elastic 2-player local co-op zoom, Story Mode cinematic panning, and screen shake.
 */
export class DioramaCamera {
  readonly camera: THREE.PerspectiveCamera;
  private readonly target = new THREE.Vector3(0, 0, 0);
  private readonly desiredTarget = new THREE.Vector3(0, 0, 0);
  private readonly baseOffset = new THREE.Vector3(0, 18, 17);
  private currentZoom = 1.0;
  private shakeTime = 0;
  private shakeIntensity = 0;

  private readonly raycaster = new THREE.Raycaster();
  private readonly groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.8);
  private readonly ndc = new THREE.Vector2();

  constructor(aspect: number) {
    this.camera = new THREE.PerspectiveCamera(42, aspect, 0.5, 160);
    this.camera.position.copy(this.baseOffset);
    this.camera.lookAt(this.target);
  }

  resize(width: number, height: number): void {
    this.camera.aspect = Math.max(0.4, width / Math.max(1, height));
    this.camera.updateProjectionMatrix();
  }

  triggerShake(intensity = 0.35, duration = 0.22): void {
    this.shakeIntensity = Math.max(this.shakeIntensity, intensity);
    this.shakeTime = Math.max(this.shakeTime, duration);
  }

  snapTo(pos: THREE.Vector3): void {
    this.target.copy(pos);
    this.desiredTarget.copy(pos);
    this.camera.position.copy(pos).add(this.baseOffset);
    this.camera.lookAt(this.target);
  }

  updateCinematic(dt: number, camPos: [number, number, number], lookAt: [number, number, number], orbitTime: number): void {
    const alpha = 1 - Math.exp(-3.2 * dt);
    const desiredCam = new THREE.Vector3(
      camPos[0] + Math.sin(orbitTime * 0.45) * 2.2,
      camPos[1],
      camPos[2] + Math.cos(orbitTime * 0.45) * 1.4,
    );
    const desiredLook = new THREE.Vector3(lookAt[0], lookAt[1], lookAt[2]);
    this.camera.position.lerp(desiredCam, alpha);
    this.target.lerp(desiredLook, alpha);
    this.camera.lookAt(this.target);
  }

  update(dt: number, focusPoints: THREE.Vector3[]): void {
    if (focusPoints.length === 0) return;

    this.desiredTarget.set(0, 0, 0);
    for (const p of focusPoints) {
      this.desiredTarget.add(p);
    }
    this.desiredTarget.divideScalar(focusPoints.length);

    let desiredZoom = 1.0;
    if (focusPoints.length >= 2) {
      const dist = focusPoints[0].distanceTo(focusPoints[1]);
      desiredZoom = THREE.MathUtils.clamp(1.0 + Math.max(0, dist - 7) * 0.045, 1.0, 1.55);
    }

    const alpha = 1 - Math.exp(-7 * dt);
    this.target.lerp(this.desiredTarget, alpha);
    this.currentZoom = THREE.MathUtils.lerp(this.currentZoom, desiredZoom, alpha);

    this.camera.position.set(
      this.target.x + this.baseOffset.x * this.currentZoom,
      this.target.y + this.baseOffset.y * this.currentZoom,
      this.target.z + this.baseOffset.z * this.currentZoom,
    );

    if (this.shakeTime > 0) {
      this.shakeTime = Math.max(0, this.shakeTime - dt);
      const decay = this.shakeTime > 0 ? this.shakeIntensity * (this.shakeTime / 0.25) : 0;
      this.camera.position.x += (Math.random() - 0.5) * decay * 2;
      this.camera.position.y += (Math.random() - 0.5) * decay * 1.4;
      this.camera.position.z += (Math.random() - 0.5) * decay * 2;
    }

    this.camera.lookAt(this.target);
  }

  screenToGround(clientX: number, clientY: number, width: number, height: number, out: THREE.Vector3): boolean {
    this.ndc.set((clientX / Math.max(1, width)) * 2 - 1, -(clientY / Math.max(1, height)) * 2 + 1);
    this.raycaster.setFromCamera(this.ndc, this.camera);
    return this.raycaster.ray.intersectPlane(this.groundPlane, out) !== null;
  }
}
