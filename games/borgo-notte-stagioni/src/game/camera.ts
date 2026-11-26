import * as THREE from 'three';
import type { CollisionWorld } from '../data/colliders';

/*
 * Chase camera. Behind the car (wider and further back with speed), closer
 * on foot; the drag orbit adds to the yaw. It never goes inside a building:
 * the line from the target is sampled and the camera stops before a wall.
 */
export class ChaseCamera {
  readonly camera: THREE.PerspectiveCamera;
  private yaw = 0;
  private distance = 7;
  private pos = new THREE.Vector3();
  private look = new THREE.Vector3();
  mode: 'near' | 'far' = 'near';
  private first = true;

  constructor(aspect: number, far: number) {
    this.camera = new THREE.PerspectiveCamera(62, aspect, 0.3, far);
  }

  snap(): void {
    this.first = true;
  }

  update(
    dt: number,
    target: { x: number; y: number; z: number; heading: number; speed: number; driving: boolean },
    orbit: number,
    pitch: number,
    world: CollisionWorld
  ): void {
    const speed = Math.abs(target.speed);
    const far = this.mode === 'far' ? 1.5 : 1;
    const want = (target.driving ? 7.2 + Math.min(4, speed * 0.1) : 4.6) * far;
    const height = (target.driving ? 2.6 : 1.9) * far + pitch * 6;
    /* Reversing: keep looking forward instead of whipping around. */
    const desiredYaw = target.heading + Math.PI + orbit;
    let delta = desiredYaw - this.yaw;
    delta = Math.atan2(Math.sin(delta), Math.cos(delta));
    const ease = this.first ? 1 : Math.min(1, dt * (target.driving ? 3.2 : 4));
    this.yaw += delta * ease;
    this.distance += (want - this.distance) * Math.min(1, dt * 2);

    /* Back the camera off along the view line until it is outside buildings. */
    let d = this.distance;
    const dx = Math.sin(this.yaw);
    const dz = Math.cos(this.yaw);
    /* Above the roofs (jetpack) there is nothing to bump into. */
    for (let s = 1.5; target.y < 30 && s <= this.distance; s += 0.75) {
      if (!world.isFree(target.x + dx * s, target.z + dz * s, 0.25)) {
        d = Math.max(1.6, s - 0.6);
        break;
      }
    }
    const goal = new THREE.Vector3(target.x + dx * d, target.y + height, target.z + dz * d);
    const lead = target.driving ? Math.min(5, speed * 0.25) : 0;
    const lookGoal = new THREE.Vector3(
      target.x - dx * lead,
      target.y + (target.driving ? 1.2 : 1.4),
      target.z - dz * lead
    );
    if (this.first) {
      this.pos.copy(goal);
      this.look.copy(lookGoal);
      this.first = false;
    } else {
      this.pos.lerp(goal, Math.min(1, dt * 6));
      this.look.lerp(lookGoal, Math.min(1, dt * 8));
    }
    this.camera.position.copy(this.pos);
    this.camera.lookAt(this.look);
    const fov = 60 + (target.driving ? Math.min(14, speed * 0.35) : 0);
    if (Math.abs(this.camera.fov - fov) > 0.05) {
      this.camera.fov += (fov - this.camera.fov) * Math.min(1, dt * 3);
      this.camera.updateProjectionMatrix();
    }
  }

  /** Ground-plane forward of the view, for spawning out of sight. */
  forward(): { x: number; z: number } {
    return { x: -Math.sin(this.yaw), z: -Math.cos(this.yaw) };
  }
}
