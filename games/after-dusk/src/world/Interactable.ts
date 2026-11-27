import * as THREE from 'three';

export type InteractKind =
  | 'door'
  | 'window'
  | 'switch'
  | 'charger'
  | 'powerbank'
  | 'flashlight'
  | 'key'
  | 'photo'
  | 'tv'
  | 'drawer'
  | 'medicine'
  | 'security'
  | 'note'
  | 'zone'
  | 'clue'
  | 'errand';

export interface DoorData {
  pivot: THREE.Group;
  open: boolean;
  locked: boolean;
  collider: THREE.Box3;
  closedBox: THREE.Box3;
  baseAngle: number;
  currentAngle: number;
  targetAngle: number;
  swingDir: number;
}

export interface WindowData {
  curtainL: THREE.Mesh;
  curtainR: THREE.Mesh;
  moonGlow: THREE.Mesh;
  width: number;
  closed: boolean;
  progress: number; // 0 = open, 1 = closed
  errandId?: string;
}

export interface Interactable {
  id: string;
  kind: InteractKind;
  label: string;
  object: THREE.Object3D;
  pos?: THREE.Vector3;
  data?: DoorData | WindowData | { reveal?: string; text?: string; target?: string; spawn?: [number, number] | string; requires?: string; errandId?: string };
}

export interface RoomInfo {
  name: string;
  center: THREE.Vector3;
  radius: number;
}

export interface World {
  group: THREE.Group;
  colliders: THREE.Box3[];
  interactables: Interactable[];
  navNodes: THREE.Vector3[];
  navEdges: number[][];
  rooms: RoomInfo[];
  bounds: THREE.Box3;
  shadowsSpawn: THREE.Vector3[];
  wallSegments?: Array<[number, number, number, number]>;
}
