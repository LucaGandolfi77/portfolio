/* Scale Puzzle — pure procedural pattern generator */
import { seeded } from './rng.js';

const SHAPES = {
  diagonal: (s, rng) => {
    const out = [];
    const flip = rng() < 0.5, reverse = rng() < 0.5;
    for (let i = 0; i < s; i++) out.push({ r: i, c: flip ? s - 1 - i : i });
    return reverse ? out.reverse() : out;
  },
  spiral: (s) => {
    const out = [];
    let top = 0, bottom = s - 1, left = 0, right = s - 1;
    while (top <= bottom && left <= right) {
      for (let c = left; c <= right; c++) out.push({ r: top, c });
      top++;
      for (let r = top; r <= bottom; r++) out.push({ r, c: right });
      right--;
      if (top <= bottom) { for (let c = right; c >= left; c--) out.push({ r: bottom, c }); bottom--; }
      if (left <= right) { for (let r = bottom; r >= top; r--) out.push({ r, c: left }); left++; }
    }
    return out;
  },
  zigzag: (s, rng) => {
    const out = [];
    const startTop = rng() < 0.5;
    for (let c = 0; c < s; c++) {
      const col = rng() < 0.5 ? c : s - 1 - c;
      for (let k = 0; k < s; k++) {
        const r = (startTop ? k : s - 1 - k);
        out.push({ r, c: col });
      }
    }
    return out;
  },
  cross: (s, rng) => {
    const mid = Math.floor(s / 2), out = [];
    for (let i = 0; i < s; i++) out.push({ r: mid, c: i });
    for (let i = 0; i < s; i++) if (i !== mid) out.push({ r: i, c: mid });
    return rng() < 0.5 ? out : out.reverse();
  },
  snake: (s, rng) => {
    const out = [];
    for (let r = 0; r < s; r++) {
      const cols = [];
      for (let c = 0; c < s; c++) cols.push(c);
      if (r % 2 === 1) cols.reverse();
      cols.forEach(c => out.push({ r, c }));
    }
    return out;
  },
  random: (s, rng) => {
    const cells = [];
    for (let r = 0; r < s; r++) for (let c = 0; c < s; c++) cells.push({ r, c });
    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    return cells.slice(0, Math.max(3, Math.floor(s * 1.6)));
  }
};

const NAMES = Object.keys(SHAPES);

export function gridSize(level) {
  return Math.min(9, 3 + Math.floor((level - 1) / 8));
}

export function generate(level, seed = null, mode = 'classic') {
  const rng = seeded(seed == null ? level * 2654435761 + 101 : seed);
  const size = gridSize(level);
  const shape = NAMES[Math.floor(rng() * NAMES.length)];
  let cells = SHAPES[shape](size, rng);

  // limit length based on level & mode
  const maxLen = Math.min(size * size, 3 + Math.floor(level / 3) + (mode === 'speed' ? 1 : 0));
  if (cells.length > maxLen) cells = cells.slice(0, maxLen);
  if (cells.length < 3) cells = cells.concat(SHAPES.random(size, rng).filter(c => !cells.some(x => x.r === c.r && x.c === c.c))).slice(0, 3);

  // dedupe consecutive
  const sequence = cells.filter((v, i) => i === 0 || v.r !== cells[i - 1].r || v.c !== cells[i - 1].c);
  return {
    level, size, shape, seed: seed == null ? level * 2654435761 + 101 : seed,
    sequence: sequence.map(v => ({ r: v.r, c: v.c })), length: sequence.length
  };
}

export function sameCell(a, b) { return !!a && !!b && a.r === b.r && a.c === b.c; }
export function keyOf(cell) { return cell.r + '-' + cell.c; }

export function solutionMap(pattern) {
  return new Map(pattern.sequence.map((c, i) => [keyOf(c), i + 1]));
}

export function bounds(size) { return { min: 0, max: size - 1 }; }
