#!/usr/bin/env node
/* Writes the shapes of js/world/layout.js to blender/world.json, so the painter and the game agree. */
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as L from '../js/world/layout.js';
import { STATUES, ADA } from '../js/data/places.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const { WORLD, LEAN, ISLANDS, SHALLOWS, PIERS, HOUSES, TOWER, WILLOWS, CAMPS, WALLS, SHARDS, BOAT_AT } = L;
writeFileSync(join(ROOT, 'blender', 'world.json'), JSON.stringify({ WORLD, LEAN, ISLANDS, SHALLOWS, PIERS, HOUSES, TOWER, WILLOWS, CAMPS, WALLS, SHARDS, BOAT_AT, STATUES: [...STATUES, ADA] }, null, 1) + '\n');
console.log('blender/world.json written');
