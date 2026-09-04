// Shared protocol types for Emberfall Online
// All network messages are validated with Zod schemas

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface EntitySnapshot {
  id: string;
  type: "player" | "npc" | "mob" | "item";
  name: string;
  pos: Vec3;
  ry?: number;
  level?: number;
  hp?: number;
  maxHp?: number;
  faction?: string;
  classType?: string;
}

export interface DamageEvent {
  sourceId: string;
  targetId: string;
  amount: number;
  isCrit: boolean;
  skill?: string;
}

export interface LootEvent {
  itemId: string;
  itemName: string;
  rarity: string;
  pos: Vec3;
}

export interface ChatMessage {
  channel: string;
  sender: string;
  senderId: string;
  message: string;
  ts: number;
}
