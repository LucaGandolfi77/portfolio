// Mob definitions for Emberfall Online — MVP Greenvale zone

export interface MobDefinition {
  id: string;
  name: string;
  level: number;
  hp: number;
  attack: number;
  defense: number;
  speed: number;
  aggroRange: number;    // distance to start chasing
  deaggroRange: number;  // distance to stop chasing
  attackRange: number;
  attackCooldown: number; // ms between attacks
  xpReward: number;
  coinDrop: number;
  lootTableId: string;
  respawnTime: number;   // ms after death
  type: "normal" | "elite" | "boss";
}

export const MOB_DEFS: Record<string, MobDefinition> = {
  ember_rat: {
    id: "ember_rat",
    name: "Ember Rat",
    level: 1,
    hp: 40,
    attack: 6,
    defense: 2,
    speed: 3.5,
    aggroRange: 10,
    deaggroRange: 20,
    attackRange: 1.5,
    attackCooldown: 1200,
    xpReward: 15,
    coinDrop: 5,
    lootTableId: "ember_rat_loot",
    respawnTime: 30000,
    type: "normal",
  },
  cinderbound_scout: {
    id: "cinderbound_scout",
    name: "Cinderbound Scout",
    level: 2,
    hp: 80,
    attack: 10,
    defense: 5,
    speed: 3,
    aggroRange: 12,
    deaggroRange: 22,
    attackRange: 1.8,
    attackCooldown: 1500,
    xpReward: 30,
    coinDrop: 12,
    lootTableId: "cinderbound_loot",
    respawnTime: 40000,
    type: "normal",
  },
  thornback_beetle: {
    id: "thornback_beetle",
    name: "Thornback Beetle",
    level: 3,
    hp: 120,
    attack: 14,
    defense: 10,
    speed: 2,
    aggroRange: 8,
    deaggroRange: 18,
    attackRange: 2,
    attackCooldown: 2000,
    xpReward: 50,
    coinDrop: 20,
    lootTableId: "thornback_loot",
    respawnTime: 45000,
    type: "normal",
  },
  ash_hound: {
    id: "ash_hound",
    name: "Ash Hound",
    level: 4,
    hp: 160,
    attack: 18,
    defense: 8,
    speed: 4.5,
    aggroRange: 14,
    deaggroRange: 24,
    attackRange: 2,
    attackCooldown: 1400,
    xpReward: 70,
    coinDrop: 30,
    lootTableId: "ashhound_loot",
    respawnTime: 50000,
    type: "normal",
  },
  cinder_warden: {
    id: "cinder_warden",
    name: "Cinder Warden",
    level: 6,
    hp: 500,
    attack: 28,
    defense: 18,
    speed: 3,
    aggroRange: 16,
    deaggroRange: 30,
    attackRange: 2.5,
    attackCooldown: 2000,
    xpReward: 300,
    coinDrop: 150,
    lootTableId: "cinder_warden_loot",
    respawnTime: 300000,
    type: "boss",
  },
};

// Loot tables
export interface LootEntry {
  itemId: string;
  dropRate: number; // 0-1
  minQty: number;
  maxQty: number;
}

export const LOOT_TABLES: Record<string, LootEntry[]> = {
  ember_rat_loot: [
    { itemId: "heal_potion", dropRate: 0.3, minQty: 1, maxQty: 2 },
    { itemId: "iron_sword", dropRate: 0.05, minQty: 1, maxQty: 1 },
  ],
  cinderbound_loot: [
    { itemId: "heal_potion", dropRate: 0.4, minQty: 1, maxQty: 2 },
    { itemId: "mana_potion", dropRate: 0.25, minQty: 1, maxQty: 1 },
    { itemId: "iron_helm", dropRate: 0.08, minQty: 1, maxQty: 1 },
    { itemId: "iron_chest", dropRate: 0.05, minQty: 1, maxQty: 1 },
    { itemId: "strength_gem", dropRate: 0.03, minQty: 1, maxQty: 1 },
  ],
  thornback_loot: [
    { itemId: "heal_potion", dropRate: 0.5, minQty: 1, maxQty: 3 },
    { itemId: "iron_gloves", dropRate: 0.1, minQty: 1, maxQty: 1 },
    { itemId: "leather_boots", dropRate: 0.08, minQty: 1, maxQty: 1 },
    { itemId: "copper_ring", dropRate: 0.05, minQty: 1, maxQty: 1 },
    { itemId: "speed_gem", dropRate: 0.04, minQty: 1, maxQty: 1 },
  ],
  ashhound_loot: [
    { itemId: "heal_potion", dropRate: 0.5, minQty: 2, maxQty: 3 },
    { itemId: "mana_potion", dropRate: 0.35, minQty: 1, maxQty: 2 },
    { itemId: "ember_blade", dropRate: 0.06, minQty: 1, maxQty: 1 },
    { itemId: "ashward_helm", dropRate: 0.05, minQty: 1, maxQty: 1 },
    { itemId: "strength_gem", dropRate: 0.08, minQty: 1, maxQty: 1 },
    { itemId: "speed_gem", dropRate: 0.08, minQty: 1, maxQty: 1 },
  ],
  cinder_warden_loot: [
    { itemId: "heal_potion", dropRate: 1.0, minQty: 3, maxQty: 5 },
    { itemId: "mana_potion", dropRate: 1.0, minQty: 2, maxQty: 3 },
    { itemId: "ember_blade", dropRate: 0.25, minQty: 1, maxQty: 1 },
    { itemId: "ashward_helm", dropRate: 0.25, minQty: 1, maxQty: 1 },
    { itemId: "ember_necklace", dropRate: 0.15, minQty: 1, maxQty: 1 },
    { itemId: "cinder_belt", dropRate: 0.15, minQty: 1, maxQty: 1 },
    { itemId: "moon_ring", dropRate: 0.1, minQty: 1, maxQty: 1 },
  ],
};

// Spawn points for Greenvale zone
export interface SpawnPoint {
  mobDefId: string;
  x: number;
  z: number;
  radius: number; // random spawn within this radius
  count: number;  // how many to keep alive
}

export const GREENVALE_SPAWNS: SpawnPoint[] = [
  { mobDefId: "ember_rat", x: 15, z: 10, radius: 8, count: 5 },
  { mobDefId: "ember_rat", x: -10, z: 20, radius: 6, count: 4 },
  { mobDefId: "cinderbound_scout", x: 25, z: -15, radius: 10, count: 4 },
  { mobDefId: "cinderbound_scout", x: -20, z: -10, radius: 8, count: 3 },
  { mobDefId: "thornback_beetle", x: 30, z: 25, radius: 10, count: 3 },
  { mobDefId: "ash_hound", x: -30, z: -25, radius: 12, count: 3 },
  { mobDefId: "ash_hound", x: 35, z: 5, radius: 10, count: 2 },
  { mobDefId: "cinder_warden", x: 0, z: -35, radius: 3, count: 1 },
];
