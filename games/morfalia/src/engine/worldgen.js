/* ===== MORFALIA · Deterministic 5-Region World Generator (42×32 Expanded World) ===== */
import { MAP_W, MAP_H, REGIONS } from '../data/config.js';
import { LORE_LOGS } from '../data/story.js';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeGrid(fill) {
  return Array.from({ length: MAP_H }, () => Array.from({ length: MAP_W }, () => fill));
}

function paintCircle(grid, cx, cy, r, tile) {
  for (let y = Math.max(1, cy - r); y <= Math.min(MAP_H - 2, cy + r); y++) {
    for (let x = Math.max(1, cx - r); x <= Math.min(MAP_W - 2, cx + r); x++) {
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r + 0.35) {
        grid[y][x] = tile;
      }
    }
  }
}

function key(x, y) {
  return `${x},${y}`;
}

export function generateRegionWorld(regionId) {
  const meta = REGIONS.find((r) => r.id === regionId);
  const seedMap = { landa: 101, costa: 202, creste: 303, foresta: 404, isole: 505 };
  const rand = mulberry32(seedMap[regionId] || 999);

  let baseTile = 'withered';
  if (regionId === 'costa') baseTile = 'ash';
  if (regionId === 'creste') baseTile = 'rock';
  if (regionId === 'foresta') baseTile = 'withered';
  if (regionId === 'isole') baseTile = 'crystal_floor';

  const tiles = makeGrid(baseTile);
  const objects = {};

  const setObj = (x, y, obj) => {
    if (x < 1 || x >= MAP_W - 1 || y < 1 || y >= MAP_H - 1) return;
    if (tiles[y][x] === 'water' || tiles[y][x] === 'mist') return;
    const k = key(x, y);
    if (objects[k]) return;
    objects[k] = { x, y, ...obj };
  };

  // --- Expanded Region-specific Geography (42×32) ---
  if (regionId === 'landa') {
    // East-south pond & western brook
    paintCircle(tiles, 28, 19, 3, 'water');
    paintCircle(tiles, 10, 23, 2, 'water');
    // Starter grass groves
    paintCircle(tiles, 20, 18, 2, 'grass');
    paintCircle(tiles, 26, 17, 1, 'grass');
    paintCircle(tiles, 11, 10, 2, 'grass');
    // Ancient stone road from southern meadow to Santuario del Seme
    for (let y = 10; y <= 24; y++) tiles[y][21] = 'path';
    for (let x = 14; x <= 28; x++) tiles[15][x] = 'path';
    // Cracked Glass Terrarium where Mimo woke up
    setObj(19, 18, { type: 'terrarium', solid: true });
    // Starter workbench near sanctuary
    setObj(23, 12, { type: 'workbench', solid: true });
  } else if (regionId === 'costa') {
    // Wide ocean along bottom & right edge + lagoon
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (y >= MAP_H - 5 || x >= MAP_W - 4) tiles[y][x] = 'water';
      }
    }
    paintCircle(tiles, 24, 24, 4, 'water');
    paintCircle(tiles, 14, 8, 2, 'water');
    // Golden sand coves near entrance & northern cape
    paintCircle(tiles, 9, 15, 3, 'sand');
    paintCircle(tiles, 22, 13, 2, 'sand');
    // Wooden piers
    for (let x = 20; x <= 28; x++) tiles[22][x] = 'bridge';
    for (let x = 26; x <= 32; x++) tiles[10][x] = 'path';
  } else if (regionId === 'creste') {
    // Winding mountain river with twin wooden bridges
    for (let y = 3; y <= 26; y++) tiles[y][13] = 'water';
    for (let y = 14; y <= 28; y++) tiles[y][30] = 'water';
    tiles[14][13] = 'bridge';
    tiles[15][13] = 'bridge';
    tiles[21][30] = 'bridge';
    tiles[22][30] = 'bridge';
    // Old stone road to Centrale Eolica
    for (let y = 8; y <= 26; y++) tiles[y][21] = 'path';
    paintCircle(tiles, 29, 15, 3, 'withered');
    paintCircle(tiles, 8, 12, 2, 'withered');
  } else if (regionId === 'foresta') {
    // Lush clearing around Mother Tree + mystic mist rings + forest ponds
    paintCircle(tiles, 21, 13, 6, 'grass');
    paintCircle(tiles, 14, 9, 3, 'mist');
    paintCircle(tiles, 28, 10, 3, 'mist');
    paintCircle(tiles, 27, 21, 3, 'mist');
    paintCircle(tiles, 12, 22, 3, 'mist');
    paintCircle(tiles, 16, 23, 2, 'water');
    paintCircle(tiles, 31, 16, 2, 'water');
    for (let x = 6; x <= 18; x++) tiles[16][x] = 'path';
  } else if (regionId === 'isole') {
    // Sky-cloud sea border + 2 floating island channels
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (x <= 3 || x >= MAP_W - 4 || y <= 2 || y >= MAP_H - 3) {
          tiles[y][x] = 'water';
        }
      }
    }
    paintCircle(tiles, 12, 16, 3, 'water');
    paintCircle(tiles, 30, 16, 3, 'water');
    // Central garden ring & crystal bridges
    paintCircle(tiles, 21, 17, 4, 'grass');
    for (let y = 9; y <= 26; y++) tiles[y][21] = 'path';
    for (let x = 10; x <= 32; x++) tiles[17][x] = 'path';
    tiles[17][12] = 'bridge';
    tiles[17][30] = 'bridge';
  }

  // --- Place Sanctuary Station (ruined initially) ---
  const sp = meta.sanctuaryPos;
  tiles[sp.y][sp.x] = 'path';
  objects[key(sp.x, sp.y)] = {
    x: sp.x,
    y: sp.y,
    type: 'sanctuary',
    solid: true,
    repaired: false,
    name: meta.sanctuaryName
  };

  const keepClear = new Set([
    key(sp.x, sp.y),
    key(sp.x, sp.y + 1),
    key(sp.x - 1, sp.y + 1),
    key(sp.x + 1, sp.y + 1),
    key(meta.spawnPos.x, meta.spawnPos.y),
    key(meta.spawnPos.x + 1, meta.spawnPos.y),
    key(meta.spawnPos.x - 1, meta.spawnPos.y),
    key(meta.spawnPos.x, meta.spawnPos.y - 1)
  ]);

  // --- Place the 2 Custodian Lore Logs for this region ---
  const regionLogs = LORE_LOGS.filter((l) => l.region === regionId);
  for (const log of regionLogs) {
    if (tiles[log.pos.y][log.pos.x] === 'water' || tiles[log.pos.y][log.pos.x] === 'mist') {
      tiles[log.pos.y][log.pos.x] = 'path';
    }
    objects[key(log.pos.x, log.pos.y)] = {
      x: log.pos.x,
      y: log.pos.y,
      type: 'lore_capsule',
      solid: true,
      logId: log.id,
      read: false
    };
    keepClear.add(key(log.pos.x, log.pos.y));
  }

  // --- Scatter Abundant Natural Resources & Obstacles ---
  const nodeTable = {
    landa: [
      { type: 'node_wood', count: 22 },
      { type: 'node_stone', count: 18 },
      { type: 'node_clay', count: 15 },
      { type: 'node_berry', count: 14 },
      { type: 'node_herb', count: 14 },
      { type: 'bramble', count: 10 },
      { type: 'dead_tree', count: 11 }
    ],
    costa: [
      { type: 'node_sand', count: 24 },
      { type: 'node_shell', count: 18 },
      { type: 'node_wood', count: 16 },
      { type: 'node_stone', count: 14 },
      { type: 'bramble', count: 10 },
      { type: 'dead_tree', count: 11 }
    ],
    creste: [
      { type: 'node_iron', count: 22 },
      { type: 'node_stone', count: 20 },
      { type: 'node_spark', count: 16 },
      { type: 'boulder', count: 14 },
      { type: 'node_clay', count: 11 },
      { type: 'node_wood', count: 11 }
    ],
    foresta: [
      { type: 'node_mushroom', count: 24 },
      { type: 'node_pollen', count: 19 },
      { type: 'node_wood', count: 16 },
      { type: 'node_berry', count: 14 },
      { type: 'dead_tree', count: 12 },
      { type: 'bramble', count: 11 }
    ],
    isole: [
      { type: 'node_crystal', count: 24 },
      { type: 'node_spark', count: 15 },
      { type: 'node_iron', count: 14 },
      { type: 'node_pollen', count: 14 },
      { type: 'boulder', count: 12 }
    ]
  };

  for (const entry of nodeTable[regionId] || []) {
    let placed = 0;
    let tries = 0;
    while (placed < entry.count && tries < 500) {
      tries++;
      const x = 2 + Math.floor(rand() * (MAP_W - 4));
      const y = 2 + Math.floor(rand() * (MAP_H - 4));
      const k = key(x, y);
      if (keepClear.has(k) || objects[k]) continue;
      if (tiles[y][x] === 'water' || tiles[y][x] === 'mist' || tiles[y][x] === 'path' || tiles[y][x] === 'bridge') continue;
      const isObstacle = entry.type === 'boulder' || entry.type === 'dead_tree' || entry.type === 'bramble';
      objects[k] = {
        x,
        y,
        type: entry.type,
        solid: isObstacle
      };
      placed++;
    }
  }

  // Initial friendly wild Biomini exploring each region
  const starterMap = {
    landa: [
      { id: 'fogliolo', x: 23.2, y: 18.4 },
      { id: 'trifoglino', x: 11.5, y: 10.5 }
    ],
    costa: [
      { id: 'sabbietta', x: 10.5, y: 16.2 },
      { id: 'medusella', x: 23.0, y: 14.0 }
    ],
    creste: [
      { id: 'piumavento', x: 22.5, y: 20.0 },
      { id: 'quarzo', x: 17.5, y: 11.5 }
    ],
    foresta: [
      { id: 'lumifungo', x: 20.5, y: 16.5 },
      { id: 'lichenino', x: 24.5, y: 12.0 }
    ],
    isole: [
      { id: 'nubolino', x: 22.0, y: 18.0 },
      { id: 'prisma', x: 17.5, y: 16.5 }
    ]
  };

  const residents = (starterMap[regionId] || []).map((s) => ({
    id: s.id,
    x: s.x,
    y: s.y,
    targetX: s.x,
    targetY: s.y,
    hearts: 1,
    giftTimer: 25,
    hasGift: false,
    met: false
  }));

  return {
    id: regionId,
    tiles,
    objects,
    residents,
    harmony: 0,
    sanctuaryRepaired: false,
    habitatsFound: []
  };
}

export function replenishRegionNodes(region) {
  const pool = {
    landa: ['node_wood', 'node_stone', 'node_clay', 'node_berry', 'node_herb'],
    costa: ['node_sand', 'node_shell', 'node_wood', 'node_stone'],
    creste: ['node_iron', 'node_stone', 'node_spark', 'node_clay'],
    foresta: ['node_mushroom', 'node_pollen', 'node_wood', 'node_berry'],
    isole: ['node_crystal', 'node_spark', 'node_pollen', 'node_iron']
  }[region.id] || ['node_wood', 'node_stone'];

  let spawned = 0;
  for (let tries = 0; tries < 120 && spawned < 10; tries++) {
    const x = 2 + Math.floor(Math.random() * (MAP_W - 4));
    const y = 2 + Math.floor(Math.random() * (MAP_H - 4));
    const k = `${x},${y}`;
    if (region.objects[k]) continue;
    const t = region.tiles[y][x];
    if (t === 'water' || t === 'mist' || t === 'path' || t === 'bridge' || t === 'soil') continue;
    const type = pool[Math.floor(Math.random() * pool.length)];
    region.objects[k] = { x, y, type, solid: false };
    spawned++;
  }
}
