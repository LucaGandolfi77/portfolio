import * as THREE from 'three';
import { CONFIG } from '../game/GameConfig';
import type { Interactable, World } from '../world/Interactable';

export class InteractionSystem {
  private ray = new THREE.Raycaster();
  private map = new Map<string, Interactable>();
  current: Interactable | null = null;

  constructor(private camera: THREE.PerspectiveCamera, private world: World) {
    this.setWorld(world);
  }

  setWorld(world: World) {
    this.world = world;
    this.map.clear();
    for (const item of world.interactables) this.map.set(item.id, item);
  }

  update(): Interactable | null {
    this.ray.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    this.ray.far = CONFIG.interactionRange;
    const objects = this.world.interactables.map((i) => i.object);
    const hits = this.ray.intersectObjects(objects, true);
    this.current = null;
    for (const hit of hits) {
      let obj: THREE.Object3D | null = hit.object;
      while (obj && !obj.userData.interactableId) obj = obj.parent;
      if (obj) {
        this.current = this.map.get(obj.userData.interactableId as string) ?? null;
        break;
      }
    }
    return this.current;
  }
}
