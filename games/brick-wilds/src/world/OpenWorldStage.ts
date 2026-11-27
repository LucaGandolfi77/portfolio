import * as THREE from 'three';
import { BRICK_PALETTE } from '../data/brickPalette';
import {
  HIDDEN_COLLECTIBLES,
  OPEN_WORLD_CAVES,
  OPEN_WORLD_NPCS,
  type CaveDef,
  type HiddenCollectibleDef,
  type OpenWorldNpcDef,
} from '../data/openWorldContent';
import type { BeastId } from '../data/types';
import type { ActiveHazardZone } from '../entities/ProjectileManager';
import type { BrickBlueprints } from '../renderer/BrickBlueprints';
import type { BrickEngine, BrickInstanceSpec } from '../renderer/BrickEngine';
import type { WeatherKind } from '../renderer/WeatherAndDayNight';

export interface OpenWorldRegion {
  id: string;
  nameEn: string;
  nameIt: string;
  centerX: number;
  centerZ: number;
  islandRadius?: number;
  mapColor: string;
  weather: WeatherKind;
  skyTop: number;
  skyBottom: number;
  beasts: BeastId[];
  bossId?: BeastId;
}

export interface SignalTower {
  id: string;
  regionId: string;
  pos: THREE.Vector3;
  beaconMesh: THREE.Group;
  activated: boolean;
}

export interface OpenWorldChest {
  id: string;
  pos: THREE.Vector3;
  mesh: THREE.Group;
  opened: boolean;
}

export interface OpenWorldNpcActor {
  def: OpenWorldNpcDef;
  pos: THREE.Vector3;
  mesh: THREE.Group;
  marker: THREE.Group;
}

export interface CaveEntranceActor {
  def: CaveDef;
  pos: THREE.Vector3;
  mesh: THREE.Group;
}

export interface CollectibleActor {
  def: HiddenCollectibleDef;
  pos: THREE.Vector3;
  mesh: THREE.Group;
  collected: boolean;
}

export const OPEN_WORLD_REGIONS: OpenWorldRegion[] = [
  {
    id: 'meadow',
    nameEn: 'Hearth-Haven Meadow',
    nameIt: 'Prateria Hearth-Haven',
    centerX: 0,
    centerZ: 0,
    mapColor: '#52b74b',
    weather: 'clear',
    skyTop: 0x3ba9d6,
    skyBottom: 0xa8e6ff,
    beasts: ['opti-raptor', 'solar-stag'],
  },
  {
    id: 'glacier',
    nameEn: 'Frost-Spire Glacier',
    nameIt: 'Ghiacciaio Frost-Spire',
    centerX: -12,
    centerZ: -44,
    mapColor: '#bae6fd',
    weather: 'snow',
    skyTop: 0x1a365d,
    skyBottom: 0x7dd3fc,
    beasts: ['cryo-mammoth', 'frost-scorpion', 'stalker-lynx'],
    bossId: 'apex-rex',
  },
  {
    id: 'lagoon',
    nameEn: 'Crystal-Coast Lagoon',
    nameIt: 'Laguna Crystal-Coast',
    centerX: 0,
    centerZ: 44,
    mapColor: '#38bdf8',
    weather: 'clear',
    skyTop: 0x0284c7,
    skyBottom: 0xbae6fd,
    beasts: ['volt-crab', 'aero-hawk'],
    bossId: 'leviathan-mech',
  },
  {
    id: 'marsh',
    nameEn: 'Emerald-Marsh Swamps',
    nameIt: 'Palude Emerald-Marsh',
    centerX: 44,
    centerZ: 8,
    mapColor: '#2d7d46',
    weather: 'rain',
    skyTop: 0x164e3f,
    skyBottom: 0x6ee7b7,
    beasts: ['venom-viper', 'aero-hawk', 'stalker-lynx'],
    bossId: 'leviathan-mech',
  },
  {
    id: 'canyon',
    nameEn: 'Rust-Canyon Badlands',
    nameIt: 'Canyon Rust-Canyon',
    centerX: -46,
    centerZ: 4,
    mapColor: '#d9532f',
    weather: 'clear',
    skyTop: 0xd9532f,
    skyBottom: 0xffcf77,
    beasts: ['solar-stag', 'magma-beetle', 'thunder-rhino'],
    bossId: 'pyro-wyvern',
  },
  {
    id: 'volcano',
    nameEn: 'Obsidian Volcanic Ridge',
    nameIt: 'Cresta Vulcanica Obsidian',
    centerX: 42,
    centerZ: -42,
    mapColor: '#7c2d12',
    weather: 'embers',
    skyTop: 0x1e1b4b,
    skyBottom: 0x9a3412,
    beasts: ['magma-beetle', 'thunder-rhino', 'stalker-lynx'],
    bossId: 'solar-colossus',
  },
  // 4 Distant Ocean Islands (reachable by swimming!)
  {
    id: 'coral-isle',
    nameEn: 'Coral Palm Island',
    nameIt: 'Isola Corallina del Sud',
    centerX: 4,
    centerZ: 102,
    islandRadius: 20,
    mapColor: '#fde047',
    weather: 'clear',
    skyTop: 0x0ea5e9,
    skyBottom: 0x99f6e4,
    beasts: ['volt-crab', 'aero-hawk'],
    bossId: 'leviathan-mech',
  },
  {
    id: 'sunken-isle',
    nameEn: 'Sunken Ruins Island',
    nameIt: 'Isola delle Rovine Perdute',
    centerX: -94,
    centerZ: -56,
    islandRadius: 21,
    mapColor: '#f59e0b',
    weather: 'clear',
    skyTop: 0x1e3a8a,
    skyBottom: 0xfde047,
    beasts: ['chrono-scarab', 'venom-viper'],
    bossId: 'pharaoh-sphinx',
  },
  {
    id: 'storm-isle',
    nameEn: 'Tempest Crag Island',
    nameIt: 'Isola Tempesta',
    centerX: -102,
    centerZ: 42,
    islandRadius: 19,
    mapColor: '#818cf8',
    weather: 'rain',
    skyTop: 0x312e81,
    skyBottom: 0x818cf8,
    beasts: ['thunder-rhino', 'aero-hawk', 'samurai-mantis'],
    bossId: 'pyro-wyvern',
  },
  {
    id: 'abyss-isle',
    nameEn: 'Abyss Atoll Island',
    nameIt: 'Isola dell’Abisso',
    centerX: 90,
    centerZ: 74,
    islandRadius: 21,
    mapColor: '#9333ea',
    weather: 'embers',
    skyTop: 0x050714,
    skyBottom: 0x6d28d9,
    beasts: ['samurai-mantis', 'steam-golem', 'stalker-lynx'],
    bossId: 'void-kraken',
  },
  // 3 Outer Ocean Islands (Ultra-Expanded 440x440 World!)
  {
    id: 'polar-isle',
    nameEn: 'Polar Star Atoll',
    nameIt: 'Atollo Glaciale Polare',
    centerX: -12,
    centerZ: -162,
    islandRadius: 24,
    mapColor: '#e0f2fe',
    weather: 'snow',
    skyTop: 0x0f172a,
    skyBottom: 0x7dd3fc,
    beasts: ['cryo-mammoth', 'frost-scorpion'],
    bossId: 'apex-rex',
  },
  {
    id: 'neon-isle',
    nameEn: 'Neo-Archipelago Isle',
    nameIt: 'Isola Arcipelago Neon',
    centerX: 142,
    centerZ: -118,
    islandRadius: 24,
    mapColor: '#f472b6',
    weather: 'rain',
    skyTop: 0x1e1038,
    skyBottom: 0xf472b6,
    beasts: ['samurai-mantis', 'stalker-lynx'],
    bossId: 'pyro-wyvern',
  },
  {
    id: 'clockwork-isle',
    nameEn: 'Clockwork Wreck Isle',
    nameIt: 'Isola dei Relitti Steampunk',
    centerX: -146,
    centerZ: 118,
    islandRadius: 24,
    mapColor: '#fbbf24',
    weather: 'embers',
    skyTop: 0x451a03,
    skyBottom: 0xfbbf24,
    beasts: ['steam-golem', 'chrono-scarab'],
    bossId: 'pharaoh-sphinx',
  },
  {
    id: 'ocean',
    nameEn: 'Great Brick Ocean',
    nameIt: 'Grande Oceano di Mattoncini',
    centerX: 0,
    centerZ: 90,
    mapColor: '#0284c7',
    weather: 'clear',
    skyTop: 0x0369a1,
    skyBottom: 0x7dd3fc,
    beasts: ['aero-hawk'],
  },
];

const ISLANDS = OPEN_WORLD_REGIONS.filter((r) => Boolean(r.islandRadius));
const OCEAN_REGION = OPEN_WORLD_REGIONS.find((r) => r.id === 'ocean')!;

/**
 * Pure helper (tested in Vitest): determines if (x, z) is swimmable Ocean or Sea!
 */
export function isOpenWorldWaterAt(x: number, z: number): boolean {
  const dist = Math.hypot(x, z);
  // Shallow lagoon bay on the south mainland coast
  if (dist > 48 && dist <= 68 && z > 36 && Math.abs(x) < 26) {
    return true;
  }
  if (dist <= 68) return false;
  // Check if standing on any of the 4 Distant Ocean Islands
  for (const isle of ISLANDS) {
    if (Math.hypot(x - isle.centerX, z - isle.centerZ) <= (isle.islandRadius ?? 18)) {
      return false;
    }
  }
  return true;
}

/**
 * Pure helper (tested in Vitest): deterministic terraced brick elevation (hills & mountains!)
 * Returns 0 on water/flat meadow/portals, up to +6.4m on alpine & volcanic mountain peaks!
 */
export function getOpenWorldElevationAt(x: number, z: number): number {
  if (isOpenWorldWaterAt(x, z)) return 0;
  // Keep central Hearth-Haven Meadow & spawn portal flat
  const distCenter = Math.hypot(x, z);
  if (distCenter < 18) return 0;

  // Smooth multi-frequency hills + mountain ridges quantized into crisp brick steps (0.8m per layer)
  const wave1 = Math.sin(x * 0.048) * Math.cos(z * 0.048);
  const wave2 = Math.sin(x * 0.11 + 1.4) * Math.sin(z * 0.095 - 0.7) * 0.55;
  let raw = (wave1 + wave2 + 0.65) * 1.4;

  // Boost mountain ranges in Glacier (North), Volcano (NE), Canyon (West) & Polar/Storm Islands
  const glacierPeak = Math.exp(-((x + 16) ** 2 + (z + 44) ** 2) / 520) * 5.2;
  const volcanoPeak = Math.exp(-((x - 36) ** 2 + (z + 36) ** 2) / 520) * 5.8;
  const canyonMesa = Math.exp(-((x + 48) ** 2 + (z - 2) ** 2) / 440) * 3.4;
  const polarPeak = Math.exp(-((x + 12) ** 2 + (z + 162) ** 2) / 260) * 4.2;

  // Gently taper elevation down to 0 near coastlines & island shores so swimming entry is smooth
  let shoreFade = 1;
  if (distCenter <= 68) {
    shoreFade = Math.min(1, Math.max(0, (68 - distCenter) / 10));
  } else {
    for (const isle of ISLANDS) {
      const dIsle = Math.hypot(x - isle.centerX, z - isle.centerZ);
      const rIsle = isle.islandRadius ?? 20;
      if (dIsle <= rIsle) {
        shoreFade = Math.min(1, Math.max(0, (rIsle - dIsle) / 6));
        break;
      }
    }
  }

  raw = Math.max(0, (raw + glacierPeak + volcanoPeak + canyonMesa + polarPeak) * shoreFade);
  // Quantize into crisp brick terraces (0.8m steps, max 6.4m)
  const steps = Math.min(8, Math.floor(raw / 0.8));
  return steps * 0.8;
}

/**
 * Pure helper (tested in Vitest): determines which region (Mainland, 7 Islands, or Ocean) (x, z) is in.
 */
export function getOpenWorldRegionAt(x: number, z: number): OpenWorldRegion {
  for (const isle of ISLANDS) {
    if (Math.hypot(x - isle.centerX, z - isle.centerZ) <= (isle.islandRadius ?? 18) + 2) {
      return isle;
    }
  }
  if (Math.hypot(x, z) > 68) {
    return OCEAN_REGION;
  }
  if (Math.hypot(x, z) < 22) return OPEN_WORLD_REGIONS[0];
  let best = OPEN_WORLD_REGIONS[0];
  let bestD = Infinity;
  for (let i = 1; i < 6; i++) {
    const r = OPEN_WORLD_REGIONS[i];
    const d = Math.hypot(x - r.centerX, z - r.centerZ);
    if (d < bestD) {
      bestD = d;
      best = r;
    }
  }
  return best;
}

/**
 * Massive 280x280 Seamless Brick-Built Open-World featuring:
 * - 6 Mainland Regions
 * - Surrounding Swimmable Ocean & Sea
 * - 4 Distant Ocean Islands
 * - 3 Explorable Underground Caverns
 * - 6 Interactive NPCs with Dialogues & Quests
 * - 6 Signal Towers & 16 Treasure Chests
 */
export class OpenWorldStage {
  readonly group = new THREE.Group();
  readonly worldRadius = 212;
  readonly returnPortalPos = new THREE.Vector3(0, 0, -6);
  readonly towers: SignalTower[] = [];
  readonly chests: OpenWorldChest[] = [];
  readonly hazards: ActiveHazardZone[] = [];
  readonly npcs: OpenWorldNpcActor[] = [];
  readonly caves: CaveEntranceActor[] = [];
  readonly collectibles: CollectibleActor[] = [];

  private readonly engine: BrickEngine;
  private readonly portalRing: THREE.Mesh;
  private time = 0;

  constructor(
    engine: BrickEngine,
    blueprints: BrickBlueprints,
    activatedTowerIds: string[],
    collectedRelicIds: string[] = [],
  ) {
    this.engine = engine;
    const landSpecs: BrickInstanceSpec[] = [];

    // 1. Giant Swimmable Brick Ocean Sheet (440x440 world!)
    const oceanGeo = new THREE.CylinderGeometry(224, 224, 0.5, 56);
    const oceanMat = engine.getMaterial(BRICK_PALETTE.skyBlue, { transparent: true, opacity: 0.82 });
    const oceanMesh = new THREE.Mesh(oceanGeo, oceanMat);
    oceanMesh.position.y = -0.58;
    oceanMesh.receiveShadow = true;
    this.group.add(oceanMesh);

    // 2. Mainland (r <= 68) + 7 Distant & Outer Ocean Islands with 3D Hills, Mountains & Rich Terrain Shaders
    for (let x = -204; x <= 204; x += 6) {
      for (let z = -204; z <= 204; z += 6) {
        if (Math.hypot(x, z) > 214) continue;
        if (isOpenWorldWaterAt(x, z)) continue;

        const reg = getOpenWorldRegionAt(x, z);
        const elev = getOpenWorldElevationAt(x, z);
        const alt = (Math.abs(x + z) / 6) % 2 === 0;
        const hash = Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1;

        // Altitude-aware rich brick coloring: beaches, lush hills, rocky slopes & snow-capped peaks!
        let color: number = BRICK_PALETTE.limeGreen;
        if (elev >= 4.8 && reg.id !== 'volcano') {
          color = alt ? BRICK_PALETTE.snowWhite : BRICK_PALETTE.pureWhite; // Snow-capped alpine peaks!
        } else if (elev >= 3.2 && reg.id === 'volcano') {
          color = alt ? BRICK_PALETTE.obsidian : BRICK_PALETTE.fireGlow; // Glowing volcanic summit!
        } else if (elev >= 2.4 && (reg.id === 'meadow' || reg.id === 'marsh')) {
          color = alt ? BRICK_PALETTE.darkGray : BRICK_PALETTE.lightGray; // Rocky mountain slopes
        } else if (reg.id === 'meadow') {
          color = hash > 0.72 ? 0x65c957 : alt ? BRICK_PALETTE.limeGreen : BRICK_PALETTE.forestGreen;
        } else if (reg.id === 'glacier' || reg.id === 'polar-isle') {
          color = alt ? BRICK_PALETTE.snowWhite : BRICK_PALETTE.iceCyan;
        } else if (reg.id === 'lagoon' || reg.id === 'coral-isle') {
          color = alt ? BRICK_PALETTE.warmSand : BRICK_PALETTE.brightYellow;
        } else if (reg.id === 'marsh') {
          color = alt ? BRICK_PALETTE.forestGreen : BRICK_PALETTE.barkBrown;
        } else if (reg.id === 'canyon' || reg.id === 'clockwork-isle') {
          color = elev >= 1.6 ? BRICK_PALETTE.sunsetOrange : alt ? BRICK_PALETTE.terracotta : BRICK_PALETTE.warmSand;
        } else if (reg.id === 'volcano') {
          color = alt ? BRICK_PALETTE.obsidian : BRICK_PALETTE.charcoal;
        } else if (reg.id === 'sunken-isle') {
          color = alt ? BRICK_PALETTE.warmSand : BRICK_PALETTE.terracotta;
        } else if (reg.id === 'storm-isle') {
          color = alt ? BRICK_PALETTE.darkGray : BRICK_PALETTE.royalPurple;
        } else if (reg.id === 'abyss-isle') {
          color = alt ? BRICK_PALETTE.obsidian : BRICK_PALETTE.royalPurple;
        } else if (reg.id === 'neon-isle') {
          color = alt ? BRICK_PALETTE.obsidian : BRICK_PALETTE.coralPink;
        }

        // Solid terraced column from bedrock up to `elev` so mountains have rich brick cliff sides!
        const colHeight = 1.2 + elev;
        landSpecs.push({ x, y: elev - colHeight / 2, z, sx: 6, sy: colHeight, sz: 6, color });

        // Wildflowers & coastal rocks on lower terrain + trees/peaks on hills
        if (hash > 0.9 && reg.id === 'meadow' && elev <= 1.6) {
          landSpecs.push({ x: x + 1.2, y: elev + 0.2, z: z - 1.0, sx: 0.55, sy: 0.4, sz: 0.55, color: BRICK_PALETTE.brightYellow });
          landSpecs.push({ x: x - 1.1, y: elev + 0.2, z: z + 1.1, sx: 0.55, sy: 0.4, sz: 0.55, color: BRICK_PALETTE.coralPink });
        } else if (hash < 0.08 && Math.hypot(x, z) > 14) {
          if (reg.id === 'meadow' || reg.id === 'marsh' || reg.id === 'coral-isle') {
            landSpecs.push({ x, y: elev + 1.1, z, sx: 0.9, sy: 2.2, sz: 0.9, color: BRICK_PALETTE.barkBrown });
            landSpecs.push({ x, y: elev + 2.6, z, sx: 2.6, sy: 1.1, sz: 2.6, color: BRICK_PALETTE.limeGreen });
            landSpecs.push({ x, y: elev + 3.5, z, sx: 1.5, sy: 0.85, sz: 1.5, color: BRICK_PALETTE.forestGreen });
          } else if (reg.id === 'glacier' || reg.id === 'polar-isle') {
            landSpecs.push({ x, y: elev + 1.3, z, sx: 1.3, sy: 2.6, sz: 1.3, color: BRICK_PALETTE.iceCyan });
            landSpecs.push({ x, y: elev + 2.9, z, sx: 0.7, sy: 1.1, sz: 0.7, color: BRICK_PALETTE.snowWhite });
          } else if (reg.id === 'canyon' || reg.id === 'sunken-isle' || reg.id === 'clockwork-isle') {
            landSpecs.push({ x, y: elev + 1.6, z, sx: 2.5, sy: 3.1, sz: 2.2, color: BRICK_PALETTE.terracotta });
          } else if (reg.id === 'volcano' || reg.id === 'abyss-isle' || reg.id === 'neon-isle') {
            landSpecs.push({ x, y: elev + 1.5, z, sx: 1.9, sy: 3.0, sz: 1.9, color: BRICK_PALETTE.obsidian });
            landSpecs.push({
              x,
              y: elev + 3.2,
              z,
              sx: 1.0,
              sy: 0.6,
              sz: 1.0,
              color: reg.id === 'volcano' ? BRICK_PALETTE.fireGlow : BRICK_PALETTE.visorCyan,
            });
          } else if (reg.id === 'storm-isle') {
            landSpecs.push({ x, y: elev + 1.6, z, sx: 1.2, sy: 3.2, sz: 1.2, color: BRICK_PALETTE.shockGlow });
          }
        }
      }
    }

    this.group.add(engine.createInstancedBatch(landSpecs, { includeStuds: true }));

    // 3. Base Return Portal
    const gate = new THREE.Group();
    gate.position.copy(this.returnPortalPos);
    const pL = engine.createBrick(0.9, 3.6, 0.9, BRICK_PALETTE.darkGray, { studs: true });
    pL.position.set(-2.0, 1.8, 0);
    const pR = engine.createBrick(0.9, 3.6, 0.9, BRICK_PALETTE.darkGray, { studs: true });
    pR.position.set(2.0, 1.8, 0);
    const top = engine.createBrick(5.2, 0.85, 1.1, BRICK_PALETTE.limeGreen, { studs: true });
    top.position.set(0, 3.9, 0);
    this.portalRing = new THREE.Mesh(
      new THREE.TorusGeometry(1.5, 0.18, 10, 24),
      new THREE.MeshBasicMaterial({ color: BRICK_PALETTE.limeGreen }),
    );
    this.portalRing.position.set(0, 1.9, 0);
    gate.add(pL, pR, top, this.portalRing);
    this.group.add(gate);

    // 4. Signal Towers (Mainland 6 regions — seated on terrain elevation!)
    for (let i = 0; i < 6; i++) {
      const reg = OPEN_WORLD_REGIONS[i];
      const tx = reg.id === 'meadow' ? 8 : reg.centerX;
      const tz = reg.id === 'meadow' ? 8 : reg.centerZ;
      const ty = getOpenWorldElevationAt(tx, tz);
      const activated = activatedTowerIds.includes(`tower-${reg.id}`);
      const tower = new THREE.Group();
      tower.position.set(tx, ty, tz);
      const base = engine.createBrick(2.4, 0.6, 2.4, BRICK_PALETTE.darkGray, { studs: true });
      base.position.y = 0.3;
      const spire = engine.createBrick(1.0, 5.2, 1.0, BRICK_PALETTE.pureWhite, { studs: true });
      spire.position.y = 3.1;
      const beacon = engine.createBrick(1.3, 1.3, 1.3, activated ? BRICK_PALETTE.visorCyan : BRICK_PALETTE.brightRed, {
        studs: true,
        emissive: true,
      });
      beacon.position.y = 6.2;
      tower.add(base, spire, beacon);
      this.group.add(tower);
      this.towers.push({
        id: `tower-${reg.id}`,
        regionId: reg.id,
        pos: new THREE.Vector3(tx, ty, tz),
        beaconMesh: beacon,
        activated,
      });
    }

    // 5. 3 Explorable Cave Entrances
    for (const cDef of OPEN_WORLD_CAVES) {
      const cy = getOpenWorldElevationAt(cDef.entranceX, cDef.entranceZ);
      const arch = new THREE.Group();
      arch.position.set(cDef.entranceX, cy, cDef.entranceZ);
      const rockL = engine.createBrick(1.6, 3.4, 2.2, BRICK_PALETTE.charcoal, { studs: true });
      rockL.position.set(-2.0, 1.7, 0);
      const rockR = engine.createBrick(1.6, 3.4, 2.2, BRICK_PALETTE.charcoal, { studs: true });
      rockR.position.set(2.0, 1.7, 0);
      const roof = engine.createBrick(5.6, 1.3, 2.4, BRICK_PALETTE.darkGray, { studs: true });
      roof.position.set(0, 3.9, 0);
      const portal = engine.createBrick(2.4, 2.8, 0.4, cDef.crystalColor, {
        studs: false,
        emissive: true,
        transparent: true,
        opacity: 0.72,
      });
      portal.position.set(0, 1.5, 0);
      arch.add(rockL, rockR, roof, portal);
      this.group.add(arch);
      this.caves.push({ def: cDef, pos: new THREE.Vector3(cDef.entranceX, cy, cDef.entranceZ), mesh: arch });
    }

    // 6. 6 Interactive Open-World NPCs seated on hills/islands
    for (const nDef of OPEN_WORLD_NPCS) {
      const ny = getOpenWorldElevationAt(nDef.x, nDef.z);
      const npc = new THREE.Group();
      npc.position.set(nDef.x, ny, nDef.z);
      const body = engine.createBrick(0.75, 0.9, 0.5, nDef.color, { studs: false });
      body.position.y = 0.7;
      const head = engine.createBrick(0.54, 0.54, 0.54, BRICK_PALETTE.skinWarm, { studs: true, shape: 'cylinder' });
      head.position.y = 1.45;
      const marker = engine.createBrick(0.36, 0.72, 0.36, BRICK_PALETTE.brightYellow, { studs: false, emissive: true });
      marker.position.y = 2.55;
      npc.add(body, head, marker);
      this.group.add(npc);
      this.npcs.push({ def: nDef, pos: new THREE.Vector3(nDef.x, ny, nDef.z), mesh: npc, marker });
    }

    // 7. Treasure Chests on Mainland + Distant Islands
    const chestCoords: [number, number][] = [
      [10, -8],
      [-11, 9],
      [-24, -42],
      [48, 12],
      [-50, -6],
      [46, -34],
      [0, 112],
      [-98, -62],
      [-104, 46],
      [96, 78],
    ];
    chestCoords.forEach(([cx, cz], idx) => {
      const cy = getOpenWorldElevationAt(cx, cz);
      const mesh = engine.createBrick(1.3, 0.9, 0.95, BRICK_PALETTE.brightYellow, { studs: true, emissive: true });
      mesh.position.set(cx, cy + 0.45, cz);
      this.group.add(mesh);
      this.chests.push({ id: `ow-chest-${idx}`, pos: new THREE.Vector3(cx, cy, cz), mesh, opened: false });
    });

    // 8. Elemental Hazards
    const hazList: Array<{ type: ActiveHazardZone['type']; x: number; z: number }> = [
      { type: 'campfire', x: -38, z: 10 },
      { type: 'campfire', x: 35, z: -36 },
      { type: 'cryo-vent', x: -16, z: -34 },
      { type: 'shock-crystal', x: 36, z: 14 },
      { type: 'shock-crystal', x: -100, z: 38 },
      { type: 'campfire', x: 86, z: 68 },
    ];
    hazList.forEach((h, i) => {
      const hy = getOpenWorldElevationAt(h.x, h.z);
      const mesh = blueprints.buildElementalHazard(h.type);
      mesh.position.set(h.x, hy, h.z);
      this.group.add(mesh);
      this.hazards.push({
        id: `ow-haz-${i}`,
        type: h.type,
        pos: new THREE.Vector3(h.x, hy + 0.8, h.z),
        radius: 1.35,
        mesh,
        destroyed: false,
      });
    });

    // 9. 20 Hidden Collectibles seated on terrain/waves
    for (const cDef of HIDDEN_COLLECTIBLES) {
      const already = collectedRelicIds.includes(cDef.id);
      const cy = getOpenWorldElevationAt(cDef.x, cDef.z);
      const shape = cDef.kind === 'ocean-pearl' ? 'cylinder' : 'box';
      const mesh = engine.createBrick(0.72, 0.72, 0.72, cDef.color, {
        studs: shape === 'box',
        emissive: true,
        shape,
      });
      mesh.position.set(cDef.x, cy + 0.95, cDef.z);
      mesh.visible = !already;
      this.group.add(mesh);
      this.collectibles.push({
        def: cDef,
        pos: new THREE.Vector3(cDef.x, cy + 0.95, cDef.z),
        mesh,
        collected: already,
      });
    }
  }

  markTowerActivated(towerId: string): void {
    const tw = this.towers.find((t) => t.id === towerId);
    if (!tw || tw.activated) return;
    tw.activated = true;
    const mat = this.engine.getMaterial(BRICK_PALETTE.visorCyan, { emissive: true });
    tw.beaconMesh.traverse((obj) => {
      if (obj instanceof THREE.Mesh) obj.material = mat;
    });
  }

  findNearestUnactivatedTower(pos: THREE.Vector3, maxDist = 4.6): SignalTower | null {
    for (const tw of this.towers) {
      if (!tw.activated && Math.hypot(pos.x - tw.pos.x, pos.z - tw.pos.z) < maxDist) return tw;
    }
    return null;
  }

  findNearestNpc(pos: THREE.Vector3, maxDist = 4.2): OpenWorldNpcActor | null {
    for (const n of this.npcs) {
      if (Math.hypot(pos.x - n.pos.x, pos.z - n.pos.z) < maxDist) return n;
    }
    return null;
  }

  findNearestCave(pos: THREE.Vector3, maxDist = 4.6): CaveEntranceActor | null {
    for (const c of this.caves) {
      if (Math.hypot(pos.x - c.pos.x, pos.z - c.pos.z) < maxDist) return c;
    }
    return null;
  }

  isNearReturnPortal(pos: THREE.Vector3): boolean {
    return Math.hypot(pos.x - this.returnPortalPos.x, pos.z - this.returnPortalPos.z) < 3.5;
  }

  update(dt: number): void {
    this.time += dt;
    this.portalRing.rotation.z = this.time * 1.4;
    for (const tw of this.towers) {
      tw.beaconMesh.rotation.y += dt * (tw.activated ? 2.4 : 0.8);
    }
    for (const n of this.npcs) {
      n.marker.rotation.y += dt * 2.5;
      n.marker.position.y = 2.55 + Math.sin(this.time * 4 + n.pos.x) * 0.18;
    }
    for (const col of this.collectibles) {
      if (col.collected) continue;
      col.mesh.rotation.y += dt * 3.0;
      col.mesh.rotation.x = Math.sin(this.time * 2 + col.pos.x) * 0.25;
      col.mesh.position.y = col.pos.y + Math.sin(this.time * 3.5 + col.pos.z) * 0.22;
    }
  }
}
