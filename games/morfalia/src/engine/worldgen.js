/* ===== MORFALIA · Deterministic 5-Region World Generator ===== */
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
      if ((x - cx) * (x - cx) + (y - cy) * (y - cy) <= r * r + 0.3) {
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
  const objects = {}; // key "x,y" -> { type, solid, item, lit, powered, logId, crop, watered, stage }

  const setObj = (x, y, obj) => {
    if (x < 1 || x >= MAP_W - 1 || y < 1 || y >= MAP_H - 1) return;
    if (tiles[y][x] === 'water' || tiles[y][x] === 'mist') return;
    const k = key(x, y);
    if (objects[k]) return;
    objects[k] = { x, y, ...obj };
  };

  // --- Region-specific geography ---
  if (regionId === 'landa') {
    // Small natural pond east-south
    paintCircle(tiles, 18, 12, 2, 'water');
    // A couple starter grass patches near spawn & sanctuary
    paintCircle(tiles, 12, 11, 1, 'grass');
    tiles[12][16] = 'grass';
    tiles[11][16] = 'grass';
    // Ancient dirt path from spawn to sanctuary
    for (let y = 8; y <= 13; y++) tiles[y][13] = 'path';
    // Cracked Glass Terrarium where Mimo woke up!
    setObj(11, 11, { type: 'terrarium', solid: true });
    // Broken starter bench near sanctuary
    setObj(15, 9, { type: 'workbench', solid: true });
  } else if (regionId === 'costa') {
    // Ocean along bottom & right edge
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (y >= MAP_H - 4 || x >= MAP_W - 3) tiles[y][x] = 'water';
      }
    }
    paintCircle(tiles, 15, 15, 3, 'water');
    // Small patch of golden sand near entrance
    paintCircle(tiles, 7, 10, 2, 'sand');
    // Wooden pier
    for (let x = 13; x <= 18; x++) tiles[14][x] = 'bridge';
  } else if (regionId === 'creste') {
    // Elevated mountain brook
    for (let y = 3; y <= 14; y++) tiles[y][8] = 'water';
    tiles[9][8] = 'bridge';
    tiles[10][8] = 'bridge';
    // Old stone road
    for (let y = 6; y <= 16; y++) tiles[y][13] = 'path';
    paintCircle(tiles, 18, 10, 2, 'withered');
  } else if (regionId === 'foresta') {
    // Misty patches around Mother Tree
    paintCircle(tiles, 13, 8, 5, 'grass');
    paintCircle(tiles, 9, 6, 2, 'mist');
    paintCircle(tiles, 17, 7, 2, 'mist');
    paintCircle(tiles, 16, 13, 2, 'mist');
    paintCircle(tiles, 10, 14, 2, 'water');
    for (let x = 4; x <= 11; x++) tiles[10][x] = 'path';
  } else if (regionId === 'isole') {
    // Cloud water border (sky sea)
    for (let y = 0; y < MAP_H; y++) {
      for (let x = 0; x < MAP_W; x++) {
        if (x <= 2 || x >= MAP_W - 3 || y <= 1 || y >= MAP_H - 2) {
          tiles[y][x] = 'water';
        }
      }
    }
    // Central garden ring
    paintCircle(tiles, 13, 11, 3, 'grass');
    for (let y = 7; y <= 16; y++) tiles[y][13] = 'path';
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
  // Clear 1-tile ring around sanctuary & spawn
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

  // --- Scatter Natural Resources & Obstacles ---
  const nodeTable = {
    landa: [
      { type: 'node_wood', count: 10 },
      { type: 'node_stone', count: 9 },
      { type: 'node_clay', count: 7 },
      { type: 'node_berry', count: 6 },
      { type: 'node_herb', count: 6 },
      { type: 'bramble', count: 5 },
      { type: 'dead_tree', count: 5 }
    ],
    costa: [
      { type: 'node_sand', count: 11 },
      { type: 'node_shell', count: 8 },
      { type: 'node_wood', count: 8 },
      { type: 'node_stone', count: 7 },
      { type: 'bramble', count: 5 },
      { type: 'dead_tree', count: 6 }
    ],
    creste: [
      { type: 'node_iron', count: 10 },
      { type: 'node_stone', count: 9 },
      { type: 'node_spark', count: 8 },
      { type: 'boulder', count: 7 },
      { type: 'node_clay', count: 5 },
      { type: 'node_wood', count: 5 }
    ],
    foresta: [
      { type: 'node_mushroom', count: 11 },
      { type: 'node_pollen', count: 9 },
      { type: 'node_wood', count: 8 },
      { type: 'node_berry', count: 6 },
      { type: 'dead_tree', count: 6 },
      { type: 'bramble', count: 5 }
    ],
    isole: [
      { type: 'node_crystal', count: 12 },
      { type: 'node_spark', count: 7 },
      { type: 'node_iron', count: 6 },
      { type: 'node_pollen', count: 6 },
      { type: 'boulder', count: 6 }
    ]
  };

  for (const entry of nodeTable[regionId] || []) {
    let placed = 0;
    let tries = 0;
    while (placed < entry.count && tries < 250) {
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

  // Initial residents (Fogliolo starts exploring near Landa's terrarium so player immediately meets a friendly creature!)
  const residents = [];
  if (regionId === 'landa') {
    residents.push({
      id: 'fogliolo',
      x: 15.2,
      y: 11.4,
      targetX: 15.2,
      targetY: 11.4,
      hearts: 1,
      giftTimer: 25,
      hasGift: false,
      met: false
    });
  }

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
  // Gently regrow a few natural pickups each morning so players can never run out
  const pool = {
    landa: ['node_wood', 'node_stone', 'node_clay', 'node_berry', 'node_herb'],
    costa: ['node_sand', 'node_shell', 'node_wood', 'node_stone'],
    creste: ['node_iron', 'node_stone', 'node_spark', 'node_clay'],
    foresta: ['node_mushroom', 'node_pollen', 'node_wood', 'node_berry'],
    isole: ['node_crystal', 'node_spark', 'node_pollen', 'node_iron']
  }[region.id] || ['node_wood', 'node_stone'];

  let spawned = 0;
  for (let tries = 0; tries < 70 && spawned < 6; tries++) {
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
