/* ===== MORFALIA · Deterministic 5-Region World Generator (60×46 Grand World) ===== */
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

  // --- Grand 60×46 Region Geography ---
  if (regionId === 'landa') {
    // Eastern lake, western river pond & northern oasis
    paintCircle(tiles, 41, 28, 4, 'water');
    paintCircle(tiles, 14, 33, 3, 'water');
    paintCircle(tiles, 46, 12, 3, 'water');
    // Starter green groves & wildflower meadows
    paintCircle(tiles, 29, 26, 3, 'grass');
    paintCircle(tiles, 37, 25, 2, 'grass');
    paintCircle(tiles, 16, 14, 3, 'grass');
    paintCircle(tiles, 44, 34, 2, 'flowers');
    // Ancient stone road network
    for (let y = 13; y <= 36; y++) tiles[y][30] = 'path';
    for (let x = 18; x <= 42; x++) tiles[22][x] = 'path';
    tiles[33][14] = 'bridge';
    // Cracked Glass Terrarium where Mimo woke up
    setObj(27, 26, { type: 'terrarium', solid: true });
    // Starter workbench near sanctuary
    setObj(33, 16, { type: 'workbench', solid: true });
  } else if (regionId === 'costa') {
    // Wide ocean along bottom & right edge + coral lagoons & sandy coves
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (y >= MAP_H - 7 || x >= MAP_W - 6) tiles[y][x] = 'water';
      }
    }
    paintCircle(tiles, 34, 34, 5, 'water');
    paintCircle(tiles, 20, 12, 3, 'water');
    paintCircle(tiles, 12, 22, 4, 'sand');
    paintCircle(tiles, 31, 18, 3, 'sand');
    paintCircle(tiles, 43, 24, 3, 'sand');
    // Twin wooden piers
    for (let x = 28; x <= 40; x++) tiles[31][x] = 'bridge';
    for (let x = 38; x <= 46; x++) tiles[14][x] = 'path';
    for (let y = 14; y <= 25; y++) tiles[y][38] = 'path';
  } else if (regionId === 'creste') {
    // Twin winding mountain rivers with bridges & terraced plateaus
    for (let y = 4; y <= 38; y++) tiles[y][18] = 'water';
    for (let y = 18; y <= 41; y++) tiles[y][43] = 'water';
    tiles[20][18] = 'bridge';
    tiles[21][18] = 'bridge';
    tiles[30][43] = 'bridge';
    tiles[31][43] = 'bridge';
    // Old stone road to Centrale Eolica
    for (let y = 10; y <= 38; y++) tiles[y][30] = 'path';
    for (let x = 14; x <= 46; x++) tiles[24][x] = 'path';
    paintCircle(tiles, 41, 21, 4, 'withered');
    paintCircle(tiles, 11, 16, 3, 'withered');
  } else if (regionId === 'foresta') {
    // Lush clearing around Mother Tree + 6 mystic mist rings + forest lakes
    paintCircle(tiles, 30, 18, 7, 'grass');
    paintCircle(tiles, 19, 13, 4, 'mist');
    paintCircle(tiles, 41, 14, 4, 'mist');
    paintCircle(tiles, 39, 31, 4, 'mist');
    paintCircle(tiles, 17, 32, 4, 'mist');
    paintCircle(tiles, 48, 22, 3, 'mist');
    paintCircle(tiles, 22, 34, 3, 'water');
    paintCircle(tiles, 45, 23, 3, 'water');
    for (let x = 8; x <= 25; x++) tiles[23][x] = 'path';
    for (let y = 18; y <= 35; y++) tiles[y][30] = 'path';
  } else if (regionId === 'isole') {
    // Sky-cloud sea border + 4 floating sky-island channels
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (x <= 4 || x >= MAP_W - 5 || y <= 3 || y >= MAP_H - 4) {
          tiles[y][x] = 'water';
        }
      }
    }
    paintCircle(tiles, 17, 23, 4, 'water');
    paintCircle(tiles, 43, 23, 4, 'water');
    paintCircle(tiles, 30, 31, 3, 'water');
    // Central garden ring & crystal bridges
    paintCircle(tiles, 30, 23, 5, 'grass');
    paintCircle(tiles, 14, 13, 3, 'grass');
    paintCircle(tiles, 46, 13, 3, 'grass');
    for (let y = 12; y <= 38; y++) tiles[y][30] = 'path';
    for (let x = 12; x <= 48; x++) tiles[23][x] = 'path';
    tiles[23][17] = 'bridge';
    tiles[23][43] = 'bridge';
    tiles[31][30] = 'bridge';
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
      { type: 'node_wood', count: 42 },
      { type: 'node_stone', count: 34 },
      { type: 'node_clay', count: 28 },
      { type: 'node_berry', count: 26 },
      { type: 'node_herb', count: 26 },
      { type: 'bramble', count: 18 },
      { type: 'dead_tree', count: 20 }
    ],
    costa: [
      { type: 'node_sand', count: 44 },
      { type: 'node_shell', count: 32 },
      { type: 'node_wood', count: 28 },
      { type: 'node_stone', count: 24 },
      { type: 'bramble', count: 18 },
      { type: 'dead_tree', count: 20 }
    ],
    creste: [
      { type: 'node_iron', count: 40 },
      { type: 'node_stone', count: 36 },
      { type: 'node_spark', count: 28 },
      { type: 'boulder', count: 26 },
      { type: 'node_clay', count: 20 },
      { type: 'node_wood', count: 20 }
    ],
    foresta: [
      { type: 'node_mushroom', count: 42 },
      { type: 'node_pollen', count: 34 },
      { type: 'node_wood', count: 28 },
      { type: 'node_berry', count: 24 },
      { type: 'dead_tree', count: 22 },
      { type: 'bramble', count: 20 }
    ],
    isole: [
      { type: 'node_crystal', count: 44 },
      { type: 'node_spark', count: 26 },
      { type: 'node_iron', count: 24 },
      { type: 'node_pollen', count: 24 },
      { type: 'boulder', count: 20 }
    ]
  };

  for (const entry of nodeTable[regionId] || []) {
    let placed = 0;
    let tries = 0;
    while (placed < entry.count && tries < 800) {
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

  // Initial friendly wild Biomini wandering each region
  const starterMap = {
    landa: [
      { id: 'fogliolo', x: 32.5, y: 26.2 },
      { id: 'trifoglino', x: 16.5, y: 14.5 },
      { id: 'ghirino', x: 42.0, y: 33.5 },
      { id: 'castorino', x: 15.5, y: 31.0 }
    ],
    costa: [
      { id: 'sabbietta', x: 13.5, y: 23.0 },
      { id: 'medusella', x: 31.5, y: 19.0 },
      { id: 'stellamar', x: 42.5, y: 23.5 },
      { id: 'gabbianello', x: 24.0, y: 15.0 }
    ],
    creste: [
      { id: 'piumavento', x: 31.5, y: 29.0 },
      { id: 'quarzo', x: 24.0, y: 16.5 },
      { id: 'tuonino', x: 40.5, y: 21.0 },
      { id: 'capriolo', x: 12.5, y: 16.0 }
    ],
    foresta: [
      { id: 'lumifungo', x: 28.5, y: 21.5 },
      { id: 'lichenino', x: 34.5, y: 16.5 },
      { id: 'cerbiatto', x: 25.0, y: 14.0 },
      { id: 'riccioforo', x: 33.0, y: 20.0 }
    ],
    isole: [
      { id: 'nubolino', x: 31.5, y: 24.5 },
      { id: 'prisma', x: 26.5, y: 22.5 },
      { id: 'celestino', x: 14.5, y: 13.5 },
      { id: 'siderio', x: 45.5, y: 13.5 }
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
  for (let tries = 0; tries < 180 && spawned < 16; tries++) {
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
