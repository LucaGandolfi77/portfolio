/*
 * The puppet: a jointed paper figure with a face. Feet at (0, 0), about 300
 * units tall at scale 1, drawn facing right (mirrored when face = -1).
 * Angles are in degrees from "hanging down", positive towards the front.
 */
import { TAU, blobPath, clamp, ellipse, glow, lerp, line, linear, mix, noise, poly, rgba, type Ctx, type Pt } from './core';
import type { Look } from './cast';

export type PoseName =
  | 'stand' | 'walk' | 'run' | 'bow' | 'kneel' | 'sit' | 'reach' | 'offer' | 'raise' | 'lift' | 'pray'
  | 'cower' | 'point' | 'lie' | 'hunch' | 'embrace' | 'carry' | 'fallen' | 'hold' | 'read' | 'aim' | 'think';
export type Mood = 'calm' | 'sad' | 'joy' | 'angry' | 'fear' | 'closed' | 'cry' | 'tender' | 'smirk';
export type Item =
  | 'candlestick' | 'bread' | 'bucket' | 'lantern' | 'doll' | 'letter' | 'coin' | 'torch' | 'flag'
  | 'cane' | 'musket' | 'pistol' | 'cloth' | 'hat' | 'iron' | 'bottle' | 'basket' | 'passport' | 'silver' | 'book' | 'broom'
  | 'crown' | 'scroll' | 'spear' | 'standard' | 'jug' | 'censer' | 'staff' | 'head' | 'chisel' | 'oillamp' | 'ring' | 'helmet' | 'bowl';

export interface Angles {
  lean: number; head: number; drop: number; tilt: number;
  hipF: number; kneeF: number; hipB: number; kneeB: number;
  shF: number; elF: number; shB: number; elB: number;
}

const P = (o: Partial<Angles> = {}): Angles => ({ lean: 0, head: 0, drop: 0, tilt: 0, hipF: 5, kneeF: 3, hipB: -5, kneeB: 2, shF: 8, elF: 12, shB: -8, elB: 10, ...o });

const POSES: Record<PoseName, Angles> = {
  stand: P(),
  walk: P({ lean: 4 }),
  run: P({ lean: 20, head: -8 }),
  bow: P({ lean: 34, head: 14, shF: 28, shB: 16 }),
  kneel: P({ drop: 62, lean: 10, head: 14, hipF: 82, kneeF: 84, hipB: 4, kneeB: 96, shF: 36, elF: 50, shB: 20, elB: 50 }),
  sit: P({ drop: 58, lean: 2, hipF: 84, kneeF: 84, hipB: 76, kneeB: 78, shF: 32, elF: 48, shB: 18, elB: 40 }),
  reach: P({ lean: 12, shF: 82, elF: 8 }),
  offer: P({ lean: 8, shF: 58, elF: 42, shB: 40, elB: 52 }),
  raise: P({ lean: -4, head: -10, shF: 158, elF: 12, shB: -22 }),
  lift: P({ drop: 34, lean: 46, head: -24, hipF: 62, kneeF: 70, hipB: -12, kneeB: 30, shF: 160, elF: 46, shB: 140, elB: 56 }),
  pray: P({ lean: 8, head: 16, shF: 46, elF: 96, shB: 34, elB: 104 }),
  cower: P({ drop: 26, lean: 28, head: 18, hipF: 40, kneeF: 56, hipB: 6, kneeB: 40, shF: 96, elF: 96, shB: 70, elB: 100 }),
  point: P({ lean: 4, shF: 96, elF: 0, shB: -14 }),
  lie: P({ tilt: -88, head: 8, shF: 8, elF: 26, shB: 4, elB: 14, hipF: 2, hipB: -2 }),
  hunch: P({ lean: 22, head: 22, shF: 16, elF: 20 }),
  embrace: P({ lean: 14, head: 16, shF: 74, elF: 42, shB: 62, elB: 46 }),
  carry: P({ lean: 30, head: -6, shF: 140, elF: 104, shB: 120, elB: 110 }),
  fallen: P({ tilt: -90, head: -14, shF: 38, elF: 24, shB: 14, hipF: 24, kneeF: 30 }),
  hold: P({ shF: 42, elF: 56 }),
  read: P({ head: 18, shF: 34, elF: 92, shB: 24, elB: 96 }),
  aim: P({ lean: 6, head: 4, shF: 86, elF: 4, shB: 60, elB: 52 }),
  think: P({ head: 16, shF: 30, elF: 128, shB: 14, elB: 56, lean: 6 }),
};

export interface PuppetState {
  look: Look;
  pose: PoseName;
  /** Previous pose and how far the change has gone (0..1). */
  from?: PoseName;
  blend?: number;
  mood: Mood;
  t: number;
  seed: number;
  /** 0..1 amount of walking motion and its phase (radians). */
  walk?: number;
  phase?: number;
  talking?: boolean;
  item?: Item;
  item2?: Item;
  /** Light: the tint of the scene and the colour of the lit edge. */
  ambient: string;
  shade: number;
  rim: string;
  /** Which side the light comes from, in world terms. */
  lightX: number;
  facing: 1 | -1;
  /** Draw as a flat silhouette (far crowds). */
  flat?: string;
  /** The saint carries his head in his hands: the body is drawn without it. */
  headless?: boolean;
}

const RAD = Math.PI / 180;
const dir = (deg: number, len: number): Pt => [Math.sin(deg * RAD) * len, Math.cos(deg * RAD) * len];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];

function angles(s: PuppetState): Angles {
  const to = POSES[s.pose];
  let a: Angles = to;
  if (s.from && (s.blend ?? 1) < 1) {
    const f = POSES[s.from];
    const k = clamp(s.blend ?? 1);
    a = { ...to };
    for (const key of Object.keys(to) as Array<keyof Angles>) a[key] = lerp(f[key], to[key], k);
  } else a = { ...to };
  const w = s.walk ?? 0;
  if (w > 0.01 && a.drop < 30) {
    const p = s.phase ?? 0;
    const run = s.pose === 'run' ? 1.55 : 1;
    const swing = Math.sin(p) * 27 * w * run;
    a.hipF = lerp(a.hipF, swing, w);
    a.hipB = lerp(a.hipB, -swing, w);
    a.kneeF = lerp(a.kneeF, Math.max(0, Math.sin(p + 1.9)) * 46 * run, w);
    a.kneeB = lerp(a.kneeB, Math.max(0, Math.sin(p + 1.9 + Math.PI)) * 46 * run, w);
    if (s.pose === 'walk' || s.pose === 'run' || s.pose === 'stand' || s.pose === 'hunch') {
      a.shF = lerp(a.shF, -swing * 0.85, w);
      a.shB = lerp(a.shB, swing * 0.85, w);
      a.elF += 14 * w * run;
    }
    a.drop += -Math.abs(Math.cos(p)) * 5 * w * run;
  }
  /* Breathing, and gestures while speaking. */
  const breath = Math.sin(s.t * 1.7 + s.seed);
  a.lean += breath * 0.7;
  a.head += Math.sin(s.t * 0.9 + s.seed * 2) * 1.6;
  if (s.talking) {
    a.head += Math.sin(s.t * 4.1 + s.seed) * 3.2;
    if (s.pose === 'stand' || s.pose === 'walk') {
      const g = 0.5 + 0.5 * Math.sin(s.t * 1.9 + s.seed);
      a.shF += 18 + g * 20;
      a.elF += 36 + g * 26;
    }
  }
  return a;
}

export function drawPuppet(ctx: Ctx, s: PuppetState): void {
  const L = s.look;
  const a = angles(s);
  const kid = L.child ?? false;
  const build = L.build ?? 1;
  const tint = (c: string): string => s.flat ?? mix(c, s.ambient, s.shade);
  const dark = (c: string, k = 0.35): string => s.flat ?? mix(tint(c), '#07060a', k);
  /* The lit edge sits on the side facing the light. */
  const rimSide = s.lightX * s.facing >= 0 ? 1 : -1;
  const rim = s.flat ?? s.rim;

  ctx.save();
  if (a.tilt) {
    ctx.translate(0, -40);
    ctx.rotate(a.tilt * RAD);
    ctx.translate(0, 150);
  }

  const legU = kid ? 56 : 66;
  const legL = kid ? 54 : 64;
  const torso = kid ? 90 : 110;
  const hip: Pt = [0, -(legU + legL) + a.drop];
  const neck: Pt = add(hip, [Math.sin(a.lean * RAD) * torso, -Math.cos(a.lean * RAD) * torso]);
  const across = (p: Pt, dx: number, dy = 0): Pt => {
    const c = Math.cos(a.lean * RAD);
    const n = Math.sin(a.lean * RAD);
    return [p[0] + dx * c - dy * n, p[1] + dx * n + dy * c];
  };
  const shF = across(neck, 13 * build, 15);
  const shB = across(neck, -15 * build, 13);

  const leg = (hipA: number, kneeA: number, front: boolean): void => {
    const root: Pt = [hip[0] + (front ? 8 : -8) * build, hip[1]];
    const knee = add(root, dir(hipA, legU));
    const foot = add(knee, dir(hipA - kneeA, legL));
    const col = front ? tint(L.legs) : dark(L.legs);
    line(ctx, [root, knee], col, 21 * build);
    line(ctx, [knee, foot], col, 15 * build);
    ellipse(ctx, foot[0] + 7, foot[1] - 2, 15, 7, dark('#1a1410', front ? 0.1 : 0.4));
  };

  const arm = (sh: Pt, shA: number, elA: number, front: boolean, item?: Item): void => {
    const elbow = add(sh, dir(shA, kid ? 50 : 62));
    const hand = add(elbow, dir(shA + elA, kid ? 46 : 56));
    const col = front ? tint(L.coat) : dark(L.coat);
    line(ctx, [sh, elbow], col, 22 * build);
    line(ctx, [elbow, hand], col, 17 * build);
    if (front && !s.flat) {
      ctx.save();
      ctx.globalAlpha *= 0.36;
      line(ctx, [[sh[0] + rimSide * 7, sh[1]], [elbow[0] + rimSide * 7, elbow[1]], [hand[0] + rimSide * 5, hand[1]]], rim, 3);
      ctx.restore();
      const cuff: Pt = [lerp(elbow[0], hand[0], 0.82), lerp(elbow[1], hand[1], 0.82)];
      if (L.shirt) ellipse(ctx, cuff[0], cuff[1], 9, 9, tint(L.shirt));
    }
    if (item && !front) drawItem(ctx, item, hand, s);
    ellipse(ctx, hand[0], hand[1], kid ? 7 : 9, kid ? 7 : 9, front ? tint(L.skin) : dark(L.skin, 0.2));
    if (item && front) {
      drawItem(ctx, item, hand, s);
      ellipse(ctx, hand[0] + 1, hand[1] + 1, kid ? 5 : 7, kid ? 4 : 5, tint(L.skin));
    }
  };

  const headAngle = a.lean * 0.6 + a.head;
  const R = kid ? 34 : 29;
  const head: Pt = add(neck, [Math.sin(headAngle * RAD) * (R + 7) + 3, -Math.cos(headAngle * RAD) * (R + 7)]);
  const sway = Math.sin(s.t * 2.1 + s.seed) * 3 + Math.sin(s.phase ?? 0) * 9 * (s.walk ?? 0);

  /* The halo of a saint glows behind everything. */
  if (L.halo && !s.flat) {
    const at: Pt = s.headless ? [head[0], head[1] + R * 0.4] : head;
    if (!s.headless) {
      const g = ctx.createRadialGradient(at[0], at[1], R * 0.6, at[0], at[1], R * 2.3);
      g.addColorStop(0, 'rgba(255,236,170,0.9)');
      g.addColorStop(0.55, 'rgba(255,214,120,0.38)');
      g.addColorStop(1, 'rgba(255,200,100,0)');
      ctx.fillStyle = g;
      ctx.fillRect(at[0] - R * 2.4, at[1] - R * 2.4, R * 4.8, R * 4.8);
      ctx.beginPath();
      ctx.arc(at[0], at[1], R * 1.55, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,226,140,0.85)';
      ctx.lineWidth = R * 0.12;
      ctx.stroke();
    }
  }
  if (L.cape) {
    /* The cloak hangs from the shoulders and swings behind. */
    const bottom = Math.min(-6, hip[1] + (legU + legL) * 0.92);
    const flutter = sway * 1.6 + Math.sin(s.t * 1.3 + s.seed) * 4 - (s.walk ?? 0) * 26;
    const capePath = blobPath([across(neck, 12 * build, -2), across(neck, -24 * build, 4), [hip[0] - 40 * build + flutter, (hip[1] + bottom) / 2], [hip[0] - 46 * build + flutter * 1.5, bottom], [hip[0] - 6 + flutter, bottom + 4], [hip[0] + 6, hip[1] + 10], across(neck, 14 * build, 30)]);
    ctx.fillStyle = dark(L.cape, 0.22);
    ctx.fill(capePath);
    if (!s.flat) {
      ctx.save();
      ctx.clip(capePath);
      ctx.globalAlpha *= 0.3;
      for (let i = 0; i < 3; i++) line(ctx, [across(neck, -14 + i * 9, 10), [hip[0] - 30 + i * 12 + flutter * 0.8, (hip[1] + bottom) / 2], [hip[0] - 36 + i * 14 + flutter * 1.3, bottom]], dark(L.cape, 0.6), 3);
      ctx.restore();
    }
  }
  leg(a.hipB, a.kneeB, false);
  arm(shB, a.shB, a.elB, false, s.item2);
  if (!s.headless) hairBack(ctx, L, head, R, sway, tint, dark, headAngle);
  if (!L.dress) leg(a.hipF, a.kneeF, true);

  /* Coat or dress: from the shoulders to a hem that follows the legs. */
  const seated = a.drop > 40;
  const long = L.coatLen;
  const spread = Math.abs(Math.sin(a.hipF * RAD)) * 46 * (s.walk ?? 0);
  let hemF: Pt;
  let hemB: Pt;
  let knee: Pt | null = null;
  if (L.dress) {
    if (seated) {
      knee = add(hip, dir(a.hipF, legU));
      const foot = add(knee, dir(a.hipF - a.kneeF, legL * (kid ? 0.6 : 0.96)));
      hemF = [foot[0] + 24 * build, foot[1]];
      hemB = [hip[0] - 36 * build, foot[1]];
    } else {
      const bottom = lerp(hip[1] + 40, -6, long);
      hemF = [hip[0] + 46 * build + spread + sway * 0.7, bottom];
      hemB = [hip[0] - 48 * build - spread + sway * 0.7, bottom];
    }
    if (kid || long < 0.9) {
      leg(a.hipB, a.kneeB, false);
      leg(a.hipF, a.kneeF, true);
    }
  } else {
    const drop = lerp(8, legU + legL - 34, long);
    const bottom = Math.min(-4, hip[1] + drop);
    const flare = 22 + long * 18;
    hemF = [hip[0] + flare * build + spread * 0.6 * long + Math.sin(a.hipF * RAD) * drop * 0.45, bottom - (seated ? 6 : 0)];
    hemB = [hip[0] - (flare + 4) * build - spread * long + sway * long + Math.min(0, Math.sin(a.hipB * RAD)) * drop * 0.5, bottom];
  }
  const coat: Pt[] = [
    across(neck, -6, -2),
    across(neck, 10, -1),
    across(neck, 27 * build, 20),
    across(hip, 19 * build, -34),
    ...(knee ? [[knee[0] + 8, knee[1] - 14] as Pt] : []),
    hemF,
    [lerp(hemF[0], hemB[0], 0.5), Math.max(hemF[1], hemB[1]) + 5],
    hemB,
    across(hip, -21 * build, -34),
    across(neck, -29 * build, 18),
  ];
  const coatPath = blobPath(coat);
  ctx.fillStyle = tint(L.coat);
  ctx.fill(coatPath);
  if (!s.flat) {
    ctx.save();
    ctx.clip(coatPath);
    const g = ctx.createLinearGradient(-48 * rimSide, 0, 48 * rimSide, 0);
    g.addColorStop(0, 'rgba(4,3,8,0.55)');
    g.addColorStop(0.55, 'rgba(4,3,8,0.05)');
    g.addColorStop(1, rgba(rim, 0.26));
    ctx.fillStyle = g;
    ctx.fillRect(-140, neck[1] - 40, 280, 340);
    /* Folds. */
    ctx.globalAlpha = 0.28;
    for (let i = 0; i < 3; i++) {
      const x = lerp(hemB[0], hemF[0], 0.22 + i * 0.28);
      line(ctx, [[x * 0.35, hip[1] - 12], [x * 0.7 + sway * 0.3, (hip[1] + hemF[1]) / 2], [x, hemF[1] + 4]], dark(L.coat, 0.6), 3.4);
    }
    ctx.globalAlpha = 1;
    /* Shirt, waistcoat, sash, apron. */
    if (L.shirt) poly(ctx, [across(neck, -2, 0), across(neck, 15, 1), across(neck, 17, 30), across(neck, 8, 48)], tint(L.shirt));
    if (L.vest) {
      poly(ctx, [across(neck, 17, 30), across(hip, 22 * build, -30), across(hip, 5, -16), across(neck, 8, 46)], tint(L.vest));
      for (let i = 0; i < 4; i++) {
        const b = across(neck, 16, 50 + i * 13);
        ellipse(ctx, b[0], b[1], 2, 2, tint('#f2d890'));
      }
    }
    if (L.sash) line(ctx, [across(neck, -22 * build, 22), across(hip, 20 * build, -22)], tint(L.sash), 9);
    if (L.armor) {
      /* Cuirass with bands, and leather strips below it. */
      const top = across(neck, -20 * build, 10);
      const chest: Pt[] = [across(neck, -22 * build, 8), across(neck, 20 * build, 6), across(neck, 25 * build, 34), across(hip, 21 * build, -6), across(hip, -21 * build, -4), across(neck, -25 * build, 32)];
      poly(ctx, chest, linear(ctx, chest[0][0], chest[0][1], chest[3][0], chest[3][1], [[0, tint(L.armor)], [0.5, tint(mix(L.armor, '#ffffff', 0.25))], [1, dark(L.armor, 0.3)]]));
      for (let i = 1; i < 5; i++) line(ctx, [across(neck, -22 * build, 8 + i * 22), across(neck, 22 * build, 8 + i * 22)], dark(L.armor, 0.45), 2.4);
      for (let i = 0; i < 6; i++) {
        const k = -18 + i * 7.5;
        line(ctx, [across(hip, k * build, -2), across(hip, (k + (i - 2.5) * 0.8) * build, 24 + (s.walk ?? 0) * Math.sin((s.phase ?? 0) + i) * 4)], dark('#6a4a2a', 0.1), 6);
      }
      void top;
    }
    if (L.toga) {
      /* The toga: a broad fold across the chest and over the left shoulder. */
      const drape: Pt[] = [across(neck, -26 * build, 4), across(neck, -4, 0), across(neck, 26 * build, 50), across(hip, 24 * build, 10), across(hip, 8, -20), across(neck, -10, 40)];
      poly(ctx, drape, tint(L.toga));
      line(ctx, [across(neck, -18, 8), across(neck, 6, 34), across(hip, 18, -8)], dark(L.toga, 0.22), 3);
      line(ctx, [across(neck, -12, 22), across(neck, 10, 52), across(hip, 14, 6)], dark(L.toga, 0.18), 2.4);
    }
    if (L.trim) {
      ctx.save();
      ctx.strokeStyle = tint(L.trim);
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(hemB[0] + 4, hemB[1] - 6);
      ctx.quadraticCurveTo((hemB[0] + hemF[0]) / 2, Math.max(hemF[1], hemB[1]) + 1, hemF[0] - 4, hemF[1] - 6);
      ctx.stroke();
      ctx.restore();
    }
    if (L.apron) poly(ctx, [across(hip, -4, -38), across(hip, 24 * build, -36), [hemF[0] - 5, hemF[1] - 14], [hemF[0] - 46, hemF[1] - 10]], tint(L.apron));
    if (!L.dress && long < 0.5) line(ctx, [across(hip, -20 * build, -8), across(hip, 20 * build, -10)], dark(L.coat, 0.55), 5);
    ctx.restore();
    /* A thin edge of light, kept inside the silhouette. */
    ctx.save();
    ctx.clip(coatPath);
    ctx.translate(-rimSide * 3.5, 1);
    ctx.globalAlpha *= 0.6;
    ctx.strokeStyle = rim;
    ctx.lineWidth = 3.2;
    ctx.stroke(coatPath);
    ctx.restore();
  }
  if (L.dress && !kid && long >= 0.9 && !seated) {
    ellipse(ctx, hemF[0] - 22, -3, 13, 6, dark('#1a1410', 0.1));
  }

  /* Neck and head. */
  line(ctx, [across(neck, 3, 6), [head[0] - 3, head[1] + R * 0.6]], dark(L.skin, 0.18), 14);
  if (L.shirt) poly(ctx, [across(neck, -12, -2), across(neck, 16, -3), across(neck, 12, 11), across(neck, 2, 3), across(neck, -6, 10)], tint(L.shirt));
  if (L.scarf) {
    line(ctx, [across(neck, -15, 2), across(neck, 4, 12), across(neck, 17, 0)], tint(L.scarf), 13);
    line(ctx, [across(neck, 3, 12), across(neck, -2 + sway, 36), across(neck, 2 + sway * 1.8, 58)], tint(L.scarf), 9);
  }
  if (!s.headless) face(ctx, s, head, R, headAngle, tint, dark, rim, rimSide);
  else {
    /* A clean, luminous collar where the head was: no wound is ever shown. */
    ellipse(ctx, neck[0] + 2, neck[1] - 2, 17, 8, tint(L.coat));
    if (!s.flat) glow(ctx, neck[0], neck[1] - 6, 46, '#fff4d0', 0.7);
  }
  if (L.cross && !s.flat) {
    const c = across(neck, 13, 42);
    line(ctx, [across(neck, 2, 5), c], tint('#e8c860'), 2);
    line(ctx, [[c[0], c[1] - 3], [c[0], c[1] + 20]], tint('#f2d470'), 5);
    line(ctx, [[c[0] - 7, c[1] + 4], [c[0] + 7, c[1] + 4]], tint('#f2d470'), 5);
  }

  arm(shF, a.shF, a.elF, true, s.item);
  ctx.restore();
}

type Tint = (c: string) => string;
type Dark = (c: string, k?: number) => string;

function hairBack(ctx: Ctx, L: Look, h: Pt, R: number, sway: number, tint: Tint, dark: Dark, ang: number): void {
  const c = dark(L.hairColor, 0.18);
  ctx.save();
  ctx.translate(h[0], h[1]);
  ctx.rotate(ang * RAD * 0.7);
  if (L.hair === 'long') {
    ctx.fillStyle = c;
    ctx.fill(blobPath([[-4, -R - 4], [R * 0.4, -R * 0.4], [-R * 0.2, R * 0.7], [-R * 0.5 + sway, R * 2.9], [-R * 1.5 + sway * 1.6, R * 3.2], [-R * 1.45 + sway * 0.5, R * 1.1], [-R * 1.25, -R * 0.35]]));
    for (let i = 0; i < 3; i++) line(ctx, [[-R * 0.8 + i * 6, -R * 0.4], [-R * 1.15 + i * 8 + sway * 0.4, R * 1.2], [-R * 1.25 + i * 9 + sway * 1.3, R * 2.7]], tint(L.hairColor), 2.4);
  } else if (L.hair === 'flow') {
    ctx.fillStyle = c;
    ctx.fill(blobPath([[0, -R - 3], [-R * 1.2, -R * 0.4], [-R * 1.3 + sway * 0.4, R * 1.05], [-R * 0.3 + sway * 0.3, R * 1.25], [R * 0.2, 0]]));
  } else if (L.hair === 'bun') {
    ellipse(ctx, -R * 1.02, -R * 0.36, R * 0.5, R * 0.52, c);
  } else if (L.hair === 'messy') {
    ctx.fillStyle = c;
    ctx.fill(blobPath([[-2, -R - 7], [-R * 0.7, -R * 0.95], [-R * 1.35, -R * 0.5], [-R * 1.05, 0], [-R * 1.4 + sway * 0.5, R * 0.8], [-R * 0.55, R * 0.6], [0, 0]]));
  }
  if (L.hat === 'hood') {
    ctx.fillStyle = dark(L.hatColor ?? '#333333', 0.2);
    ctx.fill(blobPath([[R * 0.3, -R * 1.35], [-R * 1.35, -R * 0.75], [-R * 1.5, R * 0.9], [-R * 0.7, R * 1.55], [R * 0.1, R * 0.4]]));
  }
  ctx.restore();
}

function face(ctx: Ctx, s: PuppetState, h: Pt, R: number, ang: number, tint: Tint, dark: Dark, rim: string, rimSide: number): void {
  const L = s.look;
  const kid = L.child ?? false;
  const nose = L.nose ?? 1;
  ctx.save();
  ctx.translate(h[0], h[1]);
  ctx.rotate(ang * RAD * 0.7);
  const shape = new Path2D();
  shape.moveTo(-R * 0.9, -R * 0.2);
  shape.bezierCurveTo(-R * 0.95, -R * 1.18, R * 0.82, -R * 1.2, R * 0.9, -R * 0.22);
  /* Brow, nose and chin in profile. */
  shape.quadraticCurveTo(R * 0.9, -R * 0.05, R * (0.9 + 0.24 * nose), R * 0.22);
  shape.quadraticCurveTo(R * (0.94 + 0.12 * nose), R * 0.34, R * 0.86, R * 0.37);
  shape.quadraticCurveTo(R * 0.88, R * 0.72, R * 0.52, R * (kid ? 0.92 : 1.04));
  shape.quadraticCurveTo(R * 0.05, R * 1.12, -R * 0.45, R * 0.66);
  shape.quadraticCurveTo(-R * 0.86, R * 0.35, -R * 0.9, -R * 0.2);
  ctx.fillStyle = tint(L.skin);
  ctx.fill(shape);
  if (!s.flat) {
    ctx.save();
    ctx.clip(shape);
    const g = ctx.createLinearGradient(-R * rimSide, 0, R * rimSide, 0);
    g.addColorStop(0, 'rgba(60,20,30,0.38)');
    g.addColorStop(0.6, 'rgba(60,20,30,0)');
    g.addColorStop(1, rgba(rim, 0.34));
    ctx.fillStyle = g;
    ctx.fillRect(-R * 1.4, -R * 1.4, R * 2.8, R * 2.8);
    if (L.blush) {
      const b = ctx.createRadialGradient(R * 0.46, R * 0.36, 0, R * 0.46, R * 0.36, R * 0.36);
      b.addColorStop(0, 'rgba(230,90,80,0.35)');
      b.addColorStop(1, 'rgba(230,90,80,0)');
      ctx.fillStyle = b;
      ctx.fillRect(0, 0, R, R * 0.8);
    }
    ctx.restore();

    /* Ear. */
    ellipse(ctx, -R * 0.34, R * 0.1, R * 0.17, R * 0.23, dark(L.skin, 0.1));
    ellipse(ctx, -R * 0.32, R * 0.11, R * 0.08, R * 0.13, dark(L.skin, 0.3));

    if (L.beard === 'stubble') {
      ctx.save();
      ctx.clip(shape);
      ctx.globalAlpha *= 0.42;
      ellipse(ctx, R * 0.44, R * 0.82, R * 0.74, R * 0.46, tint(L.beardColor ?? L.hairColor));
      ctx.restore();
    }

    /* Eyes, brows and mouth carry the feeling. */
    const m = s.mood;
    const blink = (s.t * 0.9 + s.seed * 1.7) % 4.3 < 0.13;
    const shut = m === 'closed' || blink;
    const openK = m === 'fear' ? 1.4 : m === 'joy' || m === 'smirk' ? 0.72 : m === 'sad' || m === 'cry' || m === 'tender' ? 0.8 : m === 'angry' ? 0.7 : 1;
    const eyeY = -R * 0.1;
    const eyes: Array<[number, number]> = [[R * 0.22, 1], [R * 0.64, 0.82]];
    for (const [ex, k] of eyes) {
      const w = R * (kid ? 0.17 : 0.135) * k;
      const hh = R * (kid ? 0.15 : 0.1) * openK;
      if (shut) {
        line(ctx, [[ex - w, eyeY], [ex, eyeY + R * 0.07], [ex + w, eyeY]], '#2a1612', R * 0.055);
      } else {
        ellipse(ctx, ex, eyeY, w, hh, tint('#fbf4ea'));
        const iris = Math.min(hh, w * 0.72);
        const look = Math.sin(s.t * 0.6 + s.seed) * w * 0.12;
        ellipse(ctx, ex + w * 0.18 + look, eyeY, iris, iris, '#1d110c');
        ellipse(ctx, ex + w * 0.36 + look, eyeY - iris * 0.4, iris * 0.3, iris * 0.3, 'rgba(255,255,255,0.9)');
        line(ctx, [[ex - w * 1.05, eyeY - hh * 0.5], [ex, eyeY - hh * 1.25], [ex + w * 1.05, eyeY - hh * 0.45]], '#2a1612', R * (L.lashes ? 0.07 : 0.045));
        if (L.lashes) line(ctx, [[ex + w * 0.9, eyeY - hh * 0.6], [ex + w * 1.35, eyeY - hh * 1.15]], '#2a1612', R * 0.045);
      }
      const inner = m === 'sad' || m === 'cry' || m === 'fear' ? -0.14 : m === 'angry' ? 0.15 : m === 'tender' ? -0.07 : 0;
      const lift = m === 'fear' ? -0.1 : m === 'joy' ? -0.05 : 0;
      const by = eyeY - R * (0.27 - lift * -1);
      const innerAtRight = ex < R * 0.4;
      line(
        ctx,
        [[ex - w * 1.1, by + R * (innerAtRight ? 0 : inner)], [ex, by - R * 0.05], [ex + w * 1.1, by + R * (innerAtRight ? inner : 0)]],
        dark(L.hairColor, L.hairColor > '#c' ? 0.15 : 0.05),
        R * (L.lashes ? 0.055 : 0.095) * k,
      );
    }
    if (m === 'cry') {
      const p = (s.t * 0.45 + s.seed) % 1;
      ctx.save();
      ctx.globalAlpha *= Math.sin(p * Math.PI);
      ellipse(ctx, R * 0.28, eyeY + R * 0.15 + p * R * 0.65, R * 0.045, R * 0.085, '#bfe4ff');
      ctx.restore();
    }

    /* Nose line. */
    line(ctx, [[R * 0.84, R * 0.05], [R * (0.86 + 0.2 * nose), R * 0.26], [R * 0.84, R * 0.3]], dark(L.skin, 0.32), R * 0.045);

    const mx = R * 0.55;
    const my = R * 0.62;
    const open = s.talking ? clamp(noise(s.t * 9 + s.seed * 3) * 1.25 - 0.12) : m === 'fear' ? 0.45 : 0;
    const lips = tint(L.lashes ? '#b8525a' : '#7a3a34');
    if (open > 0.08) {
      ellipse(ctx, mx, my + open * R * 0.05, R * 0.2, R * 0.05 + open * R * 0.16, '#3a0e12');
      if (L.gap) ctx.fillStyle = '#3a0e12';
      else ellipse(ctx, mx + R * 0.02, my - R * 0.01, R * 0.13, R * 0.035, '#efe2d4');
    } else {
      const curve = m === 'joy' ? 0.16 : m === 'tender' ? 0.09 : m === 'smirk' ? 0.12 : m === 'sad' || m === 'cry' ? -0.12 : m === 'angry' ? -0.08 : 0.015;
      const tilt = m === 'smirk' ? -R * 0.07 : 0;
      line(ctx, [[mx - R * 0.22, my], [mx, my + R * curve], [mx + R * 0.2, my - R * 0.02 + tilt]], lips, R * 0.065);
      if (m === 'joy') line(ctx, [[mx - R * 0.15, my + R * 0.03], [mx, my + R * curve * 0.85], [mx + R * 0.13, my + R * 0.01]], '#f4eadc', R * 0.035);
    }

    if (L.beard === 'full') {
      ctx.fillStyle = tint(L.beardColor ?? L.hairColor);
      ctx.fill(blobPath([[-R * 0.42, R * 0.1], [-R * 0.05, R * 0.5], [R * 0.52, R * 0.44], [R * 0.98, R * 0.6], [R * 0.78, R * 1.35], [R * 0.2, R * 1.62], [-R * 0.4, R * 0.95]]));
      line(ctx, [[R * 0.3, R * 0.5], [R * 0.62, R * 0.46], [R * 0.9, R * 0.58]], tint(mix(L.beardColor ?? L.hairColor, '#ffffff', 0.2)), R * 0.14);
      if (open > 0.08) ellipse(ctx, mx + R * 0.04, my + R * 0.1, R * 0.13, R * 0.03 + open * R * 0.1, '#3a0e12');
    }
    if (L.beard === 'side') {
      ctx.fillStyle = tint(L.beardColor ?? L.hairColor);
      ctx.fill(blobPath([[-R * 0.2, -R * 0.36], [R * 0.02, -R * 0.1], [R * 0.02, R * 0.5], [R * 0.24, R * 0.82], [-R * 0.16, R * 0.74], [-R * 0.24, R * 0.2]]));
    }
    if (L.beard === 'mustache') line(ctx, [[R * 0.26, R * 0.58], [R * 0.62, R * 0.43], [R * 0.98, R * 0.58]], tint(L.beardColor ?? L.hairColor), R * 0.13);
  }

  hairFront(ctx, L, R, tint, dark);
  s_flat = !!s.flat;
  hat(ctx, L, R, tint, dark, rim);
  ctx.restore();
}

function hairFront(ctx: Ctx, L: Look, R: number, tint: Tint, dark: Dark): void {
  if (L.hair === 'none') return;
  const c = tint(L.hairColor);
  ctx.fillStyle = c;
  const cap = (front: number, low: number): void => {
    ctx.fill(blobPath([[R * front, -R * 0.62], [R * 0.5, -R * 1.12], [-R * 0.2, -R * 1.24], [-R * 0.92, -R * 0.82], [-R * 1.08, R * low], [-R * 0.62, R * low * 0.7], [-R * 0.55, -R * 0.2], [-R * 0.2, -R * 0.62], [R * 0.35, -R * 0.72]]));
  };
  switch (L.hair) {
    case 'cropped':
      ctx.save();
      ctx.globalAlpha *= 0.8;
      cap(0.72, 0.1);
      ctx.restore();
      break;
    case 'short':
      cap(0.9, 0.22);
      break;
    case 'long':
      cap(0.9, 0.9);
      line(ctx, [[R * 0.86, -R * 0.6], [R * 0.2, -R * 0.9], [-R * 0.55, -R * 0.25]], tint(mix(L.hairColor, '#ffffff', 0.22)), R * 0.09);
      line(ctx, [[R * 0.78, -R * 0.55], [R * 1.0, R * 0.1], [R * 0.82, R * 0.28]], c, R * 0.1);
      break;
    case 'flow':
      cap(0.74, 0.66);
      break;
    case 'bun':
      cap(0.92, 0.12);
      line(ctx, [[R * 0.84, -R * 0.66], [R * 0.1, -R * 0.96], [-R * 0.7, -R * 0.5]], dark(L.hairColor, 0.22), R * 0.07);
      break;
    case 'shorn':
      cap(0.82, 0.38);
      for (let i = 0; i < 6; i++) line(ctx, [[-R * 0.9 + i * R * 0.3, -R * 0.9 + Math.abs(i - 3) * 3], [-R * 1.0 + i * R * 0.34, -R * 1.34 + (i % 2) * 6]], c, R * 0.13);
      break;
    case 'curly':
      cap(0.8, 0.3);
      for (const [x, y, r] of [[0.74, -0.8, 0.28], [0.36, -1.08, 0.34], [-0.14, -1.18, 0.34], [-0.66, -0.96, 0.34], [-0.96, -0.52, 0.3], [-1.0, -0.06, 0.26], [-0.8, 0.28, 0.2]]) ellipse(ctx, R * x, R * y, R * r, R * r, c);
      break;
    case 'messy':
      cap(0.92, 0.35);
      for (let i = 0; i < 7; i++) line(ctx, [[-R * 0.8 + i * R * 0.27, -R * 0.85], [-R * 0.7 + i * R * 0.32, -R * 1.2 - (i % 3) * R * 0.13]], c, R * 0.15);
      line(ctx, [[R * 0.5, -R * 0.82], [R * 0.95, -R * 0.4]], c, R * 0.12);
      break;
    case 'balding':
      ctx.fill(blobPath([[-R * 0.35, -R * 0.45], [-R * 0.88, -R * 0.75], [-R * 1.06, R * 0.18], [-R * 0.66, R * 0.3], [-R * 0.5, -R * 0.1]]));
      line(ctx, [[-R * 0.2, -R * 1.04], [R * 0.25, -R * 1.12], [R * 0.55, -R * 0.95]], c, R * 0.07);
      break;
  }
}

let s_flat = false;
function hat(ctx: Ctx, L: Look, R: number, tint: Tint, dark: Dark, rim: string): void {
  if (!L.hat) return;
  const c = tint(L.hatColor ?? '#222222');
  ctx.fillStyle = c;
  switch (L.hat) {
    case 'tophat':
      poly(ctx, [[-R * 0.74, -R * 0.72], [-R * 0.86, -R * 2.12], [R * 0.74, -R * 2.2], [R * 0.72, -R * 0.8]], c);
      ellipse(ctx, 0, -R * 0.76, R * 1.28, R * 0.2, c, -0.05);
      line(ctx, [[-R * 0.74, -R * 0.98], [R * 0.72, -R * 1.05]], dark(L.hatColor ?? '#222222', 0.55), R * 0.2);
      line(ctx, [[R * 0.6, -R * 1.15], [R * 0.62, -R * 2.0]], rim, 2);
      break;
    case 'bicorne':
      ctx.fill(blobPath([[R * 1.5, -R * 0.72], [R * 0.4, -R * 1.65], [-R * 0.6, -R * 1.6], [-R * 1.5, -R * 0.68], [0, -R * 0.86]]));
      ellipse(ctx, R * 0.25, -R * 1.2, R * 0.16, R * 0.16, tint('#e8c860'));
      break;
    case 'cap':
      ctx.fill(blobPath([[R * 0.6, -R * 0.78], [R * 0.3, -R * 1.36], [-R * 0.6, -R * 1.56], [-R * 1.25, -R * 0.92], [-R * 0.7, -R * 0.62]]));
      line(ctx, [[R * 0.35, -R * 0.74], [R * 1.22, -R * 0.62]], c, R * 0.18);
      break;
    case 'skull':
      ctx.fill(blobPath([[R * 0.34, -R * 1.08], [-R * 0.16, -R * 1.34], [-R * 0.7, -R * 1.06], [-R * 0.2, -R * 1.0]]));
      break;
    case 'bonnet':
      ctx.fill(blobPath([[R * 0.78, -R * 0.72], [R * 0.36, -R * 1.34], [-R * 0.55, -R * 1.42], [-R * 1.28, -R * 0.7], [-R * 1.08, R * 0.2], [-R * 0.66, -R * 0.3], [-R * 0.1, -R * 0.82]]));
      line(ctx, [[R * 0.78, -R * 0.72], [0, -R * 0.86], [-R * 0.9, -R * 0.1]], tint('#ffffff'), R * 0.08);
      break;
    case 'shako':
      poly(ctx, [[-R * 0.76, -R * 0.74], [-R * 0.68, -R * 1.9], [R * 0.8, -R * 1.86], [R * 0.72, -R * 0.78]], c);
      line(ctx, [[R * 0.4, -R * 0.74], [R * 1.14, -R * 0.62]], dark(L.hatColor ?? '#222222', 0.2), R * 0.14);
      ellipse(ctx, R * 0.05, -R * 2.08, R * 0.24, R * 0.24, tint('#c8302a'));
      ellipse(ctx, R * 0.45, -R * 1.28, R * 0.15, R * 0.19, tint('#e8c860'));
      break;
    case 'judge':
      poly(ctx, [[-R * 0.82, -R * 0.8], [-R * 0.62, -R * 1.58], [R * 0.58, -R * 1.64], [R * 0.74, -R * 0.84]], c);
      line(ctx, [[-R * 0.76, -R * 0.96], [R * 0.68, -R * 1.0]], tint('#d8a840'), R * 0.14);
      break;
    case 'hood':
      line(ctx, [[R * 0.52, -R * 1.18], [R * 0.0, -R * 0.96], [-R * 0.52, -R * 0.3], [-R * 0.55, R * 0.6]], c, R * 0.3);
      ctx.fill(blobPath([[R * 0.6, -R * 1.22], [-R * 0.2, -R * 1.42], [-R * 1.2, -R * 0.78], [-R * 0.7, -R * 0.5], [-R * 0.05, -R * 0.98]]));
      break;
    case 'galea': {
      /* Roman helmet: bowl, cheek guard, neck guard and a crest. */
      const metal = linear(ctx, -R, -R * 1.3, R, -R * 0.4, [[0, dark(L.hatColor ?? '#c8c4b8', 0.3)], [0.55, tint(mix(L.hatColor ?? '#c8c4b8', '#ffffff', 0.25))], [1, dark(L.hatColor ?? '#c8c4b8', 0.15)]]);
      ctx.fillStyle = metal;
      ctx.fill(blobPath([[R * 0.86, -R * 0.62], [R * 0.6, -R * 1.2], [-R * 0.3, -R * 1.36], [-R * 1.0, -R * 0.9], [-R * 1.32, -R * 0.24], [-R * 0.86, -R * 0.36], [-R * 0.5, -R * 0.62]]));
      poly(ctx, [[R * 0.06, -R * 0.62], [R * 0.36, -R * 0.62], [R * 0.4, R * 0.42], [R * 0.08, R * 0.5]], metal);
      line(ctx, [[R * 0.9, -R * 0.62], [-R * 0.5, -R * 0.66]], dark(L.hatColor ?? '#c8c4b8', 0.4), R * 0.1);
      const crest = blobPath([[R * 0.5, -R * 1.28], [R * 0.1, -R * 1.98], [-R * 0.8, -R * 2.0], [-R * 1.3, -R * 1.3], [-R * 0.8, -R * 1.2], [-R * 0.2, -R * 1.42]]);
      ctx.fillStyle = tint('#b01e1a');
      ctx.fill(crest);
      ctx.save();
      ctx.clip(crest);
      for (let i = 0; i < 9; i++) line(ctx, [[R * 0.4 - i * R * 0.2, -R * 1.24], [R * 0.2 - i * R * 0.22, -R * 2.0]], dark('#b01e1a', 0.4), R * 0.05);
      ctx.restore();
      break;
    }
    case 'laurel':
      for (let i = 0; i < 9; i++) {
        const a = Math.PI * (1.05 + i * 0.1);
        ellipse(ctx, Math.cos(a) * R * 0.98, -R * 0.42 + Math.sin(a) * R * 0.86, R * 0.2, R * 0.09, tint('#6a8a3a'), a + 1.1);
      }
      break;
    case 'diadem': {
      /* The imperial crown: a gold band with rays and a jewel. */
      const gold = linear(ctx, 0, -R * 1.4, 0, -R * 0.5, [[0, tint('#fff2b0')], [0.5, tint('#e8b840')], [1, dark('#b8862a', 0.1)]]);
      for (let i = 0; i < 7; i++) {
        const x = -R * 0.95 + i * R * 0.3;
        poly(ctx, [[x - R * 0.1, -R * 0.84], [x, -R * (1.38 + (i % 2) * 0.16)], [x + R * 0.1, -R * 0.84]], gold);
      }
      ctx.fillStyle = gold;
      ctx.fill(blobPath([[R * 0.96, -R * 0.62], [R * 0.9, -R * 0.92], [-R * 1.06, -R * 0.94], [-R * 1.1, -R * 0.58]]));
      ellipse(ctx, R * 0.3, -R * 0.76, R * 0.12, R * 0.12, tint('#c8203a'));
      ellipse(ctx, -R * 0.4, -R * 0.76, R * 0.09, R * 0.09, tint('#2a6ab8'));
      if (!s_flat) glow(ctx, R * 0.3, -R * 0.8, R * 0.6, '#fff0b0', 0.5);
      break;
    }
    case 'veil':
      ctx.fill(blobPath([[R * 0.68, -R * 0.9], [R * 0.2, -R * 1.34], [-R * 0.8, -R * 1.24], [-R * 1.3, -R * 0.4], [-R * 1.36, R * 1.2], [-R * 0.8, R * 1.6], [-R * 0.6, R * 0.2], [-R * 0.2, -R * 0.72]]));
      line(ctx, [[R * 0.68, -R * 0.9], [-R * 0.2, -R * 0.88], [-R * 0.66, R * 0.3]], dark(L.hatColor ?? '#888888', 0.25), R * 0.08);
      break;
    case 'coif':
      ctx.fill(blobPath([[R * 0.72, -R * 0.7], [R * 0.3, -R * 1.22], [-R * 0.6, -R * 1.26], [-R * 1.14, -R * 0.6], [-R * 0.9, R * 0.1], [-R * 0.5, -R * 0.5]]));
      break;
  }
}

/** Things held in the hand, drawn at the hand position. */
export function drawItem(ctx: Ctx, item: Item, h: Pt, s: Pick<PuppetState, 't' | 'ambient' | 'shade' | 'flat'>): void {
  const tint = (c: string): string => s.flat ?? mix(c, s.ambient, s.shade * 0.6);
  const [x, y] = h;
  const fire = (fx: number, fy: number, r: number): void => {
    const f = noise(s.t * 8 + fx);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = 'rgba(255,176,70,0.9)';
    ctx.fill(blobPath([[fx - r * 0.55, fy], [fx + (f - 0.5) * r, fy - r * 2.2 - f * r * 0.5], [fx + r * 0.55, fy], [fx, fy + r * 0.35]]));
    ellipse(ctx, fx, fy - r * 0.35, r * 0.24, r * 0.55, '#fff2c8');
    ctx.restore();
    const g = ctx.createRadialGradient(fx, fy - r, 0, fx, fy - r, r * 12);
    g.addColorStop(0, 'rgba(255,190,90,0.34)');
    g.addColorStop(1, 'rgba(255,150,60,0)');
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = g;
    ctx.fillRect(fx - r * 12, fy - r * 13, r * 24, r * 24);
    ctx.restore();
  };
  switch (item) {
    case 'candlestick':
      line(ctx, [[x, y + 6], [x, y - 24]], tint('#dfe4ea'), 6);
      ellipse(ctx, x, y + 8, 14, 5, tint('#c4ccd4'));
      ellipse(ctx, x, y - 24, 11, 4, tint('#eef2f6'));
      line(ctx, [[x, y - 26], [x, y - 52]], tint('#f4ead2'), 7);
      fire(x, y - 57, 6);
      break;
    case 'bread':
      ellipse(ctx, x + 6, y - 2, 24, 13, tint('#b8742e'), -0.25);
      for (let i = -1; i <= 1; i++) line(ctx, [[x + 2 + i * 11, y - 10], [x + 8 + i * 11, y]], tint('#e2b46a'), 3);
      break;
    case 'bucket':
      line(ctx, [[x - 22, y + 26], [x, y - 2], [x + 22, y + 26]], tint('#2c2620'), 3);
      poly(ctx, [[x - 26, y + 24], [x + 26, y + 24], [x + 20, y + 68], [x - 20, y + 68]], tint('#6a4a2c'));
      ellipse(ctx, x, y + 24, 26, 7, tint('#3a5a72'));
      line(ctx, [[x - 24, y + 36], [x + 24, y + 36]], tint('#2c2620'), 4);
      line(ctx, [[x - 21, y + 58], [x + 21, y + 58]], tint('#2c2620'), 4);
      break;
    case 'lantern':
      line(ctx, [[x, y], [x, y + 14]], '#241c14', 3);
      poly(ctx, [[x - 12, y + 14], [x + 12, y + 14], [x + 15, y + 46], [x - 15, y + 46]], 'rgba(255,196,96,0.85)');
      line(ctx, [[x - 15, y + 46], [x + 15, y + 46]], '#241c14', 5);
      line(ctx, [[x - 12, y + 14], [x + 12, y + 14]], '#241c14', 5);
      fire(x, y + 38, 5);
      break;
    case 'torch':
      line(ctx, [[x - 4, y + 20], [x + 6, y - 28]], tint('#5a3a1e'), 7);
      fire(x + 7, y - 32, 11);
      break;
    case 'doll':
      ellipse(ctx, x + 4, y + 30, 18, 28, tint('#f08aa8'));
      ellipse(ctx, x + 4, y - 6, 14, 15, tint('#f6d4bc'));
      ellipse(ctx, x + 2, y - 15, 17, 9, tint('#e8b040'));
      ellipse(ctx, x + 9, y - 5, 2, 2.4, '#2a1a30');
      line(ctx, [[x + 4, y + 8], [x + 24, y + 22]], tint('#f6d4bc'), 6);
      break;
    case 'letter':
    case 'passport':
      ctx.save();
      ctx.translate(x + 8, y - 8);
      ctx.rotate(-0.25);
      ctx.fillStyle = tint(item === 'passport' ? '#e8c22a' : '#f2ead8');
      ctx.fillRect(-14, -18, 28, 34);
      for (let i = 0; i < 4; i++) line(ctx, [[-9, -10 + i * 7], [9, -10 + i * 7]], 'rgba(60,40,20,0.55)', 1.5);
      ctx.restore();
      break;
    case 'coin':
      ellipse(ctx, x + 8, y - 8, 6, 6, '#f4e08a');
      ellipse(ctx, x + 7, y - 9, 2, 2, '#fffbe0');
      break;
    case 'flag': {
      line(ctx, [[x - 14, y + 70], [x + 18, y - 150]], tint('#4a3420'), 7);
      const pts: Pt[] = [];
      for (let i = 0; i <= 6; i++) pts.push([x + 18 + i * 22, y - 150 + Math.sin(s.t * 4 - i * 0.9) * i * 3.2 + i * 2]);
      for (let i = 6; i >= 0; i--) pts.push([x + 6 + i * 22, y - 70 + Math.sin(s.t * 4 - i * 0.9 - 0.6) * i * 4 + i * 4]);
      poly(ctx, pts, tint('#d8281e'));
      break;
    }
    case 'cane':
      line(ctx, [[x, y - 8], [x + 16, y + 118]], tint('#2c1c10'), 6);
      ellipse(ctx, x, y - 10, 7, 7, tint('#d8b050'));
      break;
    case 'musket':
      line(ctx, [[x - 46, y + 18], [x + 78, y - 26]], tint('#3c2a1a'), 9);
      line(ctx, [[x + 8, y - 4], [x + 108, y - 38]], tint('#8a9098'), 4);
      break;
    case 'pistol':
      line(ctx, [[x - 4, y + 8], [x + 2, y - 4], [x + 30, y - 8]], tint('#2a2420'), 7);
      line(ctx, [[x + 8, y - 7], [x + 38, y - 10]], tint('#9aa0a8'), 3);
      break;
    case 'cloth':
      poly(ctx, [[x, y - 4], [x + 22, y - 12], [x + 16, y + 8], [x + 24, y + 20], [x + 4, y + 18]], tint('#2e5a46'));
      break;
    case 'hat':
      poly(ctx, [[x - 18, y + 4], [x - 20, y - 36], [x + 18, y - 38], [x + 16, y + 4]], tint('#0e1018'));
      ellipse(ctx, x - 1, y + 4, 32, 6, tint('#0e1018'));
      break;
    case 'iron':
      line(ctx, [[x - 8, y + 8], [x + 44, y - 18]], tint('#3a3434'), 6);
      line(ctx, [[x + 30, y - 11], [x + 46, y - 19]], '#ff7a30', 7);
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      ellipse(ctx, x + 42, y - 17, 16, 16, 'rgba(255,110,30,0.28)');
      ctx.restore();
      break;
    case 'bottle':
      ellipse(ctx, x + 6, y - 6, 9, 18, tint('#2e6a3a'), 0.2);
      line(ctx, [[x + 9, y - 22], [x + 13, y - 34]], tint('#2e6a3a'), 5);
      break;
    case 'basket':
      poly(ctx, [[x - 20, y + 10], [x + 24, y + 10], [x + 16, y + 40], [x - 12, y + 40]], tint('#9a6a32'));
      line(ctx, [[x - 18, y + 12], [x + 2, y - 8], [x + 22, y + 12]], tint('#6a4620'), 4);
      break;
    case 'silver':
      for (let i = 0; i < 4; i++) ellipse(ctx, x + 10, y - 2 - i * 5, 22 - i, 5, tint(i % 2 ? '#f0f4f8' : '#c8d0da'));
      break;
    case 'book':
      poly(ctx, [[x - 14, y - 4], [x + 6, y - 12], [x + 8, y + 12], [x - 12, y + 18]], tint('#7a2a24'));
      poly(ctx, [[x + 6, y - 12], [x + 26, y - 6], [x + 28, y + 16], [x + 8, y + 12]], tint('#efe6d0'));
      break;
    case 'broom':
      line(ctx, [[x, y - 40], [x + 14, y + 60]], tint('#6a4a28'), 6);
      poly(ctx, [[x + 8, y + 54], [x + 22, y + 52], [x + 36, y + 88], [x + 2, y + 90]], tint('#b8903a'));
      break;
    case 'crown': {
      const gold = linear(ctx, 0, y - 34, 0, y + 4, [[0, tint('#fff4c0')], [0.45, tint('#f0c048')], [1, tint('#a8761e')]]);
      for (let i = 0; i < 6; i++) poly(ctx, [[x - 22 + i * 9, y - 14], [x - 18 + i * 9, y - 30 - (i % 2) * 6], [x - 13 + i * 9, y - 14]], gold);
      ctx.fillStyle = gold;
      ctx.fill(blobPath([[x - 26, y - 16], [x + 30, y - 16], [x + 30, y + 2], [x - 26, y + 2]]));
      ellipse(ctx, x + 2, y - 7, 5, 5, tint('#d01e3a'));
      ellipse(ctx, x - 14, y - 7, 3.5, 3.5, tint('#2a70c8'));
      ellipse(ctx, x + 18, y - 7, 3.5, 3.5, tint('#2aa86a'));
      if (!s.flat) glow(ctx, x + 2, y - 14, 70, '#ffe08a', 0.55);
      break;
    }
    case 'scroll':
      line(ctx, [[x - 4, y - 18], [x - 4, y + 22]], tint('#c8a870'), 9);
      line(ctx, [[x + 26, y - 18], [x + 26, y + 22]], tint('#c8a870'), 9);
      poly(ctx, [[x - 2, y - 16], [x + 24, y - 16], [x + 24, y + 20], [x - 2, y + 20]], tint('#efe2c4'));
      for (let i = 0; i < 4; i++) line(ctx, [[x + 3, y - 8 + i * 8], [x + 19, y - 8 + i * 8]], 'rgba(70,40,20,0.5)', 1.4);
      break;
    case 'spear':
      line(ctx, [[x - 10, y + 140], [x + 10, y - 150]], tint('#5a3a1e'), 6);
      poly(ctx, [[x + 6, y - 148], [x + 18, y - 196], [x + 18, y - 146]], tint('#d8d8d8'));
      break;
    case 'standard':
      line(ctx, [[x - 6, y + 120], [x + 6, y - 190]], tint('#4a2e14'), 7);
      poly(ctx, [[x - 22, y - 130], [x + 34, y - 130], [x + 30, y - 70], [x - 18, y - 70]], tint('#a01e1a'));
      line(ctx, [[x - 22, y - 130], [x + 34, y - 130]], tint('#e8b840'), 4);
      ctx.save();
      ctx.font = `bold 15px serif`;
      ctx.fillStyle = tint('#f4d060');
      ctx.textAlign = 'center';
      ctx.fillText('SPQR', x + 6, y - 96);
      ctx.restore();
      /* The eagle on top. */
      ctx.fillStyle = tint('#f0c048');
      ctx.fill(blobPath([[x + 6, y - 214], [x + 30, y - 228], [x + 18, y - 206], [x + 40, y - 200], [x + 8, y - 192], [x - 26, y - 200], [x - 4, y - 206], [x - 18, y - 228]]));
      break;
    case 'jug':
      ctx.fillStyle = tint('#a8603a');
      ctx.fill(blobPath([[x - 8, y - 30], [x + 8, y - 30], [x + 18, y - 6], [x + 14, y + 22], [x - 14, y + 22], [x - 18, y - 6]]));
      line(ctx, [[x + 12, y - 22], [x + 24, y - 10], [x + 16, y + 4]], tint('#8a4a2a'), 4);
      break;
    case 'censer':
      line(ctx, [[x, y], [x + 2, y + 50]], tint('#8a6a2a'), 2);
      ctx.fillStyle = tint('#d8a840');
      ctx.fill(blobPath([[x - 16, y + 50], [x + 20, y + 50], [x + 14, y + 72], [x - 10, y + 72]]));
      if (!s.flat) for (let i = 0; i < 5; i++) {
        const k = (s.t * 0.4 + i / 5) % 1;
        ellipse(ctx, x + 2 + Math.sin(s.t + i * 2) * 10 * k, y + 44 - k * 110, 6 + k * 18, 5 + k * 14, `rgba(230,225,215,${0.32 * (1 - k)})`);
      }
      break;
    case 'staff':
      line(ctx, [[x - 6, y - 70], [x + 8, y + 130]], tint('#6a4a2a'), 7);
      break;
    case 'head': {
      /* The saint's own head, serene, with its halo: an icon, never a wound. */
      const r = 25;
      const hy = y - 30;
      if (!s.flat) {
        const g = ctx.createRadialGradient(x + 6, hy, r * 0.6, x + 6, hy, r * 2.6);
        g.addColorStop(0, 'rgba(255,240,180,0.95)');
        g.addColorStop(0.5, 'rgba(255,214,120,0.4)');
        g.addColorStop(1, 'rgba(255,200,100,0)');
        ctx.fillStyle = g;
        ctx.fillRect(x + 6 - r * 2.7, hy - r * 2.7, r * 5.4, r * 5.4);
        ctx.beginPath();
        ctx.arc(x + 6, hy, r * 1.5, 0, TAU);
        ctx.strokeStyle = 'rgba(255,226,140,0.95)';
        ctx.lineWidth = 3.5;
        ctx.stroke();
      }
      /* Face, hair, a short beard; eyes closed in peace, a quiet mouth. */
      const cx = x + 6;
      ellipse(ctx, cx, hy + 2, r * 0.9, r * 1.05, tint('#f0d8c0'));
      ctx.fillStyle = tint('#4a3220');
      ctx.fill(blobPath([[cx - r * 0.95, hy + r * 0.05], [cx - r * 0.85, hy - r * 0.95], [cx + r * 0.85, hy - r * 0.95], [cx + r * 0.95, hy + r * 0.05], [cx + r * 0.62, hy - r * 0.5], [cx - r * 0.62, hy - r * 0.5]]));
      ctx.fill(blobPath([[cx - r * 0.86, hy + r * 0.25], [cx - r * 0.7, hy + r * 0.95], [cx, hy + r * 1.3], [cx + r * 0.7, hy + r * 0.95], [cx + r * 0.86, hy + r * 0.25], [cx + r * 0.5, hy + r * 0.72], [cx - r * 0.5, hy + r * 0.72]]));
      line(ctx, [[cx - r * 0.42, hy + r * 0.62], [cx, hy + r * 0.52], [cx + r * 0.42, hy + r * 0.62]], tint('#4a3220'), r * 0.16);
      line(ctx, [[cx - r * 0.16, hy + r * 0.76], [cx + r * 0.16, hy + r * 0.76]], tint('#8a4a40'), 2);
      for (const dx of [-0.36, 0.36]) line(ctx, [[cx + r * (dx - 0.17), hy - r * 0.02], [cx + r * dx, hy + r * 0.08], [cx + r * (dx + 0.17), hy - r * 0.02]], '#3a2218', 2.2);
      line(ctx, [[cx, hy + r * 0.08], [cx + r * 0.06, hy + r * 0.4]], tint('#c89a80'), 1.8);
      break;
    }
    case 'chisel':
      line(ctx, [[x - 4, y + 4], [x + 30, y - 24]], tint('#8a9098'), 5);
      line(ctx, [[x - 12, y + 10], [x - 2, y + 2]], tint('#6a4a2a'), 8);
      break;
    case 'oillamp':
      ctx.fillStyle = tint('#b87a48');
      ctx.fill(blobPath([[x - 18, y - 4], [x + 22, y - 6], [x + 30, y - 12], [x + 24, y + 4], [x - 16, y + 6]]));
      if (!s.flat) {
        ellipse(ctx, x + 28, y - 18, 3.5, 8, '#fff0c0');
        glow(ctx, x + 28, y - 18, 90, '#ffb050', 0.55);
      }
      break;
    case 'ring':
      ctx.beginPath();
      ctx.arc(x + 8, y - 8, 6, 0, TAU);
      ctx.strokeStyle = tint('#f0c848');
      ctx.lineWidth = 3;
      ctx.stroke();
      if (!s.flat) glow(ctx, x + 8, y - 8, 24, '#ffe08a', 0.6);
      break;
    case 'helmet':
      ctx.fillStyle = tint('#d8b458');
      ctx.fill(blobPath([[x - 20, y + 6], [x - 18, y - 22], [x + 18, y - 26], [x + 22, y + 4]]));
      ctx.fillStyle = tint('#b01e1a');
      ctx.fill(blobPath([[x - 12, y - 24], [x + 4, y - 48], [x + 20, y - 26]]));
      break;
    case 'bowl':
      ctx.fillStyle = tint('#9a6a3a');
      ctx.fill(blobPath([[x - 18, y - 6], [x + 22, y - 6], [x + 14, y + 10], [x - 10, y + 10]]));
      break;
  }
}

/** A seed so each character breathes and blinks on its own rhythm. */
export function seedOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 997;
  return h / 100;
}

export const TWO_PI = TAU;
