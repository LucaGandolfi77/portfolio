/*
 * The director: picks the shot for a moment of film time, moves the camera,
 * animates the figures, joins shots with transitions and lays out the words.
 * Everything is a pure function of time, so seeking is frame-exact.
 */
import { CAST } from './draw/cast';
import { clamp, ease, glow, lerp, rgba, soft, type Ctx } from './draw/core';
import { drawPuppet, seedOf, type PoseName } from './draw/puppet';
import { GROUND, thread } from './draw/scenery';
import { SPEAKERS } from './script';
import { SHOT_VIEWS } from './shots';
import type { Actor, Key, S, ShotView, Transition } from './shots/types';
import { CHAPTERS, DURATION, SHOTS, TITLE_TIME, activeCue, shotIndexAt, type Chapter, type Cue, type Lang, type Shot } from './timeline';

export interface RenderOptions {
  lang: Lang;
  captions: boolean;
  reducedMotion: boolean;
  /** CSS pixels at the bottom covered by the player controls. */
  inset?: number;
}

/** Seconds a transition between two shots lasts. */
export const TRANSITION = 1.25;
const SERIF = "'Cormorant Garamond Variable', 'Cormorant Garamond', Georgia, serif";
const SANS = "'Inter Variable', Inter, system-ui, sans-serif";

interface Resolved {
  x: number;
  y: number;
  s: number;
  face: 1 | -1;
  pose: PoseName;
  from: PoseName;
  blend: number;
  mood: NonNullable<Actor['mood']>;
  item: Actor['item'] | null;
  alpha: number;
}

/** When a key (or camera move) of a shot starts, in shot seconds. */
export function triggerTime(shot: Shot, l: number, d = 0): number {
  if (l < 0) return d;
  const cue = shot.cues[Math.min(l, shot.cues.length - 1)];
  return cue.start - shot.start + d;
}

const keyCache = new WeakMap<Actor, Array<Key & { at: number }>>();

export function resolveActor(a: Actor, shot: Shot, t: number): Resolved {
  let keys = keyCache.get(a);
  if (!keys) {
    keys = (a.keys ?? []).map((k) => ({ ...k, at: triggerTime(shot, k.l, k.d) })).sort((p, q) => p.at - q.at);
    keyCache.set(a, keys);
  }
  const pose = a.pose ?? 'stand';
  const r: Resolved = { x: a.x, y: a.y ?? GROUND, s: a.s ?? 1, face: a.face ?? 1, pose, from: pose, blend: 1, mood: a.mood ?? 'calm', item: a.item ?? null, alpha: a.alpha ?? 1 };
  for (const k of keys) {
    if (t < k.at) break;
    const since = t - k.at;
    const toward = (from: number, to: number, move: number): number => lerp(from, to, ease(since / Math.max(0.05, move)));
    if (k.x !== undefined) r.x = toward(r.x, k.x, k.move ?? 1.4);
    if (k.y !== undefined) r.y = toward(r.y, k.y, k.move ?? 1.4);
    if (k.s !== undefined) r.s = toward(r.s, k.s, k.move ?? 1.4);
    if (k.alpha !== undefined) r.alpha = toward(r.alpha, k.alpha, k.move ?? 0.8);
    if (k.face !== undefined) r.face = k.face;
    if (k.mood !== undefined) r.mood = k.mood;
    if (k.item !== undefined) r.item = k.item;
    if (k.pose !== undefined && k.pose !== r.pose) {
      r.from = r.pose;
      r.pose = k.pose;
      r.blend = ease(since / Math.min(0.75, Math.max(0.2, k.move ?? 0.6)));
    }
  }
  return r;
}

/**
 * Keeps whoever is talking inside the frame: if the planned camera would
 * leave them near an edge or outside it, it slides over, smoothly.
 */
export function followSpeaker(view: ShotView, shot: Shot, t: number, camX: number, halfWidth: number): number {
  const framing = (cue: Cue | undefined): number => {
    if (!cue) return camX;
    const actor = view.actors?.find((a) => a.voice === cue.who);
    if (!actor) return camX;
    const r = resolveActor(actor, shot, t);
    if (r.alpha < 0.5) return camX;
    const lying = r.pose === 'lie' || r.pose === 'fallen';
    const head = r.x + (lying ? -108 : 22) * r.face * r.s;
    const slack = halfWidth * 0.5;
    return clamp(camX, head - slack, head + slack);
  };
  const now = shot.start + t;
  let i = -1;
  while (i + 1 < shot.cues.length && shot.cues[i + 1].start - 0.3 <= now) i++;
  if (i < 0) return camX;
  return lerp(framing(shot.cues[i - 1]), framing(shot.cues[i]), ease((now - shot.cues[i].start + 0.3) / 1.2));
}

export function cameraAt(view: ShotView, shot: Shot, t: number): [number, number, number] {
  let [x, y, z] = view.cam ?? [0, 0, 1];
  const moves = (view.moves ?? []).map((m) => ({ ...m, at: triggerTime(shot, m.l, m.d) })).sort((p, q) => p.at - q.at);
  for (const m of moves) {
    if (t < m.at) break;
    const k = ease((t - m.at) / (m.move ?? 2.6));
    if (m.x !== undefined) x = lerp(x, m.x, k);
    if (m.y !== undefined) y = lerp(y, m.y, k);
    if (m.z !== undefined) z = lerp(z, m.z, k);
  }
  return [x, y, z];
}

export class FilmRenderer {
  readonly canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private buffer: HTMLCanvasElement;
  private bctx: CanvasRenderingContext2D;
  private vignette: HTMLCanvasElement;
  private grain: HTMLCanvasElement;
  private ghost = document.createElement('canvas');
  private dpr = 1;
  private cssW = 360;
  private cssH = 640;
  private quality = 1;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) throw new Error('Canvas 2D is not available');
    this.ctx = ctx;
    this.buffer = document.createElement('canvas');
    this.bctx = this.buffer.getContext('2d', { alpha: false })!;
    this.vignette = document.createElement('canvas');
    this.grain = makeGrain();
    this.resize();
  }

  resize(): void {
    const rect = this.canvas.getBoundingClientRect();
    this.cssW = Math.max(1, rect.width);
    this.cssH = Math.max(1, rect.height);
    const raw = window.devicePixelRatio || 1;
    /* A pixel budget keeps large screens smooth. */
    const budget = Math.sqrt((2_300_000 * this.quality) / (this.cssW * this.cssH));
    this.dpr = Math.max(0.7, Math.min(2, raw, budget));
    const w = Math.round(this.cssW * this.dpr);
    const h = Math.round(this.cssH * this.dpr);
    if (this.canvas.width !== w || this.canvas.height !== h) {
      this.canvas.width = this.buffer.width = w;
      this.canvas.height = this.buffer.height = h;
      this.paintVignette(w, h);
    }
  }

  /** 1 = full resolution; lower when the device cannot keep up. */
  setQuality(q: number): void {
    const next = clamp(q, 0.4, 1);
    if (Math.abs(next - this.quality) < 0.01) return;
    this.quality = next;
    this.resize();
  }

  private paintVignette(w: number, h: number): void {
    this.vignette.width = w;
    this.vignette.height = h;
    const g = this.vignette.getContext('2d')!;
    const r = Math.hypot(w, h) / 2;
    const grad = g.createRadialGradient(w / 2, h * 0.46, r * 0.42, w / 2, h / 2, r * 1.04);
    grad.addColorStop(0, 'rgba(3,2,6,0)');
    grad.addColorStop(0.6, 'rgba(3,2,6,0.16)');
    grad.addColorStop(1, 'rgba(3,2,6,0.62)');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
  }

  /** A clean layer with the same transform as `like`, for faded figures. */
  private scratch(like: Ctx): Ctx {
    if (this.ghost.width !== this.canvas.width || this.ghost.height !== this.canvas.height) {
      this.ghost.width = this.canvas.width;
      this.ghost.height = this.canvas.height;
    }
    const g = this.ghost.getContext('2d')!;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.clearRect(0, 0, this.ghost.width, this.ghost.height);
    g.setTransform(like.getTransform());
    return g;
  }

  private drawShot(ctx: Ctx, index: number, t: number, time: number, reduced: boolean): void {
    const shot = SHOTS[index];
    const view = SHOT_VIEWS[shot.id];
    const w = this.canvas.width;
    const h = this.canvas.height;
    const dur = shot.end - shot.start;
    const unit = Math.min(w, h) / 720;
    /* In landscape the stage sits a little higher, above the captions. */
    const lift = w > h * 1.15 ? 80 : 0;
    let [camX, camY, camZ] = cameraAt(view, shot, t);
    /* A tall screen is narrow: close-ups are gentler there. */
    if (h > w) camZ = 1 + (camZ - 1) * 0.62;
    camX = followSpeaker(view, shot, t, camX, w / 2 / (unit * camZ));
    if (!reduced) {
      camZ *= 1 + 0.045 * (t / dur);
      camX += Math.sin(time * 0.31) * 5 / camZ;
      camY += Math.cos(time * 0.23) * 4 / camZ;
    }
    const cue = activeCue(time);

    const s: S = {
      ctx,
      t,
      p: clamp(t / dur),
      dur,
      time,
      since: (i) => t - triggerTime(shot, i),
      on: (i, over = 2, delay = 0) => ease((t - triggerTime(shot, i) - delay) / over),
      layer: (depth, draw) => {
        const zoom = 1 + (camZ - 1) * (0.35 + 0.65 * Math.min(depth, 1.5));
        const k = unit * zoom;
        ctx.save();
        ctx.setTransform(k, 0, 0, k, w / 2 - camX * depth * k, h / 2 - lift * unit - camY * depth * k);
        draw();
        ctx.restore();
      },
      actor: (a) => {
        const r = resolveActor(a, shot, t);
        if (r.alpha <= 0.01) return;
        const look = CAST[a.who];
        const size = r.s * (look.size ?? 1);
        const lying = r.pose === 'lie' || r.pose === 'fallen';
        const before = resolveActor(a, shot, Math.max(0, t - 0.08));
        const speed = t > 0.08 ? Math.abs(r.x - before.x) / 0.08 : 0;
        const walk = lying ? 0 : clamp(Math.max(speed / 55, a.marching && r.pose !== 'stand' && r.pose !== 'sit' ? a.marching : 0));
        const phase = (r.x / (34 * size)) * r.face + (a.marching ? time * 6.2 : 0);
        const seed = a.seed ?? seedOf(a.who);
        const speaking = !!a.voice && cue?.who === a.voice && time < cue.end - 0.5;
        const faded = r.alpha < 0.99;
        const target = faded ? this.scratch(ctx) : ctx;
        target.save();
        if (a.shadow && !a.flat) soft(target, r.x, r.y + 3, 78 * size, 15 * size, '#000000', 0.6);
        target.translate(r.x, r.y);
        target.scale(size * r.face, size);
        drawPuppet(target, {
          look, pose: r.pose, from: r.from, blend: r.blend, mood: r.mood, t: time, seed, walk, phase,
          talking: speaking, item: r.item ?? undefined, item2: a.item2,
          ambient: view.light.ambient, shade: view.light.shade, rim: view.light.rim, lightX: view.light.x,
          facing: r.face, flat: a.flat,
        });
        target.restore();
        if (faded) {
          ctx.save();
          ctx.setTransform(1, 0, 0, 1, 0, 0);
          ctx.globalAlpha *= clamp(r.alpha);
          ctx.drawImage(target.canvas, 0, 0);
          ctx.restore();
        }
      },
    };

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = '#06040a';
    ctx.fillRect(0, 0, w, h);
    view.back(s);
    if (view.actors?.length) s.layer(1, () => view.actors!.forEach((a) => s.actor(a)));
    view.mid?.(s);
    view.front?.(s);
    if (view.grade) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = rgba(view.grade[0], view.grade[1]);
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();
  }

  private composite(kind: Transition, q: number): void {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const k = ease(q);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (kind === 'black') {
      if (q > 0.5) ctx.drawImage(this.buffer, 0, 0);
      ctx.fillStyle = `rgba(4,2,6,${1 - Math.abs(q - 0.5) * 2})`;
      ctx.fillRect(0, 0, w, h);
    } else if (kind === 'iris') {
      ctx.save();
      ctx.beginPath();
      const r = k * Math.hypot(w, h) * 0.58;
      ctx.arc(w / 2, h / 2, Math.max(1, r), 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(this.buffer, 0, 0);
      ctx.restore();
      ctx.strokeStyle = `rgba(255,214,130,${0.9 * (1 - k)})`;
      ctx.lineWidth = Math.max(2, w * 0.006);
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, Math.max(1, r), 0, Math.PI * 2);
      ctx.stroke();
    } else if (kind === 'wipe' || kind === 'thread') {
      const lean = w * 0.22;
      const x = -lean - 20 + k * (w + lean * 2 + 40);
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(-40, -10);
      ctx.lineTo(x + lean, -10);
      ctx.lineTo(x - lean, h + 10);
      ctx.lineTo(-40, h + 10);
      ctx.clip();
      ctx.drawImage(this.buffer, 0, 0);
      ctx.restore();
      const unit = Math.min(w, h) / 720;
      thread(ctx, [[x + lean, -20], [x + lean * 0.5 + 26 * unit, h * 0.25], [x - 20 * unit, h * 0.5], [x - lean * 0.5 + 24 * unit, h * 0.75], [x - lean, h + 20]], 1, q * 4, 3.4 * unit, Math.sin(q * Math.PI));
    } else {
      ctx.globalAlpha = k;
      ctx.drawImage(this.buffer, 0, 0);
      ctx.globalAlpha = 1;
      if (kind === 'light') {
        glow(ctx, w / 2, h * 0.45, Math.max(w, h) * 0.85, '#ffdca0', Math.sin(q * Math.PI) * 0.75);
        ctx.fillStyle = `rgba(255,236,200,${Math.sin(q * Math.PI) * 0.18})`;
        ctx.fillRect(0, 0, w, h);
      }
    }
    ctx.restore();
  }

  render(time: number, options: RenderOptions): void {
    const ctx = this.ctx;
    const t = clamp(time, 0, DURATION - 0.001);
    const index = shotIndexAt(t);
    const shot = SHOTS[index];
    const local = t - shot.start;
    const view = SHOT_VIEWS[shot.id];
    const trans = view.trans ?? 'fade';
    if (index > 0 && local < TRANSITION) {
      const prev = SHOTS[index - 1];
      this.drawShot(ctx, index - 1, prev.end - prev.start, prev.end - 0.001, options.reducedMotion);
      this.drawShot(this.bctx, index, local, t, options.reducedMotion);
      this.composite(options.reducedMotion ? 'fade' : trans, local / TRANSITION);
    } else this.drawShot(ctx, index, local, t, options.reducedMotion);

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(this.vignette, 0, 0);
    this.paintGrain(options.reducedMotion ? 0 : t);
    const chapter = CHAPTERS[shot.chapter];
    if (shot.id === chapter.shots[0].id) this.titleCard(chapter, t - chapter.start, options.lang);
    const cue = activeCue(t);
    if (cue && options.captions) this.caption(cue, t, options.lang, options.inset ?? 0);
    /* The film opens from black. */
    if (t < 1.4) {
      ctx.fillStyle = `rgba(4,2,6,${1 - t / 1.4})`;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
    ctx.restore();
  }

  private paintGrain(t: number): void {
    const ctx = this.ctx;
    const pattern = ctx.createPattern(this.grain, 'repeat');
    if (!pattern) return;
    const step = Math.floor(t * 12);
    const dx = (step * 83) % 256;
    const dy = (step * 149) % 256;
    ctx.save();
    ctx.globalAlpha = 0.09;
    ctx.globalCompositeOperation = 'overlay';
    ctx.translate(-dx, -dy);
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, this.canvas.width + 256, this.canvas.height + 256);
    ctx.restore();
  }

  /** Font size of the captions, in canvas pixels. */
  private type(): number {
    /* Wide screens have little height to spare: smaller words there. */
    const wide = this.cssW > this.cssH;
    return clamp(Math.min(this.cssW, this.cssH) * (wide ? 0.04 : 0.047), wide ? 14 : 16, 29) * this.dpr;
  }

  private titleCard(chapter: Chapter, local: number, lang: Lang): void {
    const a = clamp((local - 0.5) / 0.9) * clamp((TITLE_TIME - 0.1 - local) / 0.8);
    if (a <= 0) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const f = this.type();
    const cy = h * 0.36;
    const first = chapter.ordinal === 0;
    ctx.save();
    ctx.globalAlpha = a;
    soft(ctx, w / 2, cy, Math.min(w * 0.75, f * 22), f * 10, '#050309', 0.92);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,0,0,0.9)';
    ctx.shadowBlur = f * 0.6;
    ctx.fillStyle = chapter.accent;
    ctx.font = `600 ${f * 0.72}px ${SANS}`;
    spaced(ctx, first ? 'D’APRÈS VICTOR HUGO' : chapter.roman, w / 2, cy - f * 3.1, f * 0.28);
    ctx.fillStyle = '#fbf1da';
    const title = first ? 'Les Misérables' : chapter.titleFr;
    const big = Math.min(f * (first ? 3.1 : 2.5), (w * 0.86) / Math.max(7, title.length) * 2.1);
    ctx.font = `italic 500 ${big}px ${SERIF}`;
    ctx.fillText(title, w / 2, cy - f * 0.9);
    const reach = Math.min(w * 0.32, f * 7) * ease((local - 0.7) / 2);
    ctx.strokeStyle = chapter.accent;
    ctx.lineWidth = Math.max(1, f * 0.07);
    ctx.beginPath();
    ctx.moveTo(w / 2 - reach, cy + f * 0.9);
    ctx.lineTo(w / 2 + reach, cy + f * 0.9);
    ctx.stroke();
    ctx.fillStyle = chapter.accent;
    ctx.fillRect(w / 2 - f * 0.13, cy + f * 0.77, f * 0.26, f * 0.26);
    ctx.fillStyle = '#e8dcc0';
    ctx.font = `500 ${f * 0.82}px ${SANS}`;
    spaced(ctx, chapter.title[lang].toUpperCase(), w / 2, cy + f * 2.3, f * 0.2, w * 0.9);
    ctx.restore();
  }

  private caption(cue: Cue, t: number, lang: Lang, inset: number): void {
    const a = clamp((t - cue.start) / 0.35) * clamp((cue.end - t) / 0.3);
    if (a <= 0) return;
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    const f = this.type();
    const portrait = h > w;
    /* The words step above the controls while these are showing. */
    const bottom = h - Math.max(portrait ? h * 0.115 : h * 0.065, inset * this.dpr);
    const max = Math.min(w * 0.88, f * (portrait ? 29 : 36));
    const rise = (1 - ease((t - cue.start) / 0.6)) * f * 0.4;
    const speaker = SPEAKERS[cue.who];
    const quoted = !!cue.french;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';

    ctx.font = quoted ? `italic 600 ${f * 1.22}px ${SERIF}` : `600 ${f * 1.04}px ${SERIF}`;
    const main = wrap(ctx, cue.french ?? cue.text[lang], max);
    const mainH = f * (quoted ? 1.5 : 1.32);
    ctx.font = `500 ${f * 0.84}px ${SANS}`;
    const sub = quoted ? wrap(ctx, cue.text[lang], max) : [];
    const subH = f * 1.18;
    const name = speaker[lang];
    const total = main.length * mainH + sub.length * subH + (sub.length ? f * 0.45 : 0) + (name ? f * 1.25 : 0);
    const top = bottom - total + rise;

    const band = ctx.createLinearGradient(0, top - f * 3.2, 0, h);
    band.addColorStop(0, 'rgba(4,2,8,0)');
    band.addColorStop(0.32, `rgba(4,2,8,${portrait ? 0.62 : 0.46})`);
    band.addColorStop(1, `rgba(4,2,8,${portrait ? 0.82 : 0.74})`);
    ctx.fillStyle = band;
    ctx.fillRect(0, top - f * 3.2, w, h - top + f * 3.2);

    ctx.shadowColor = 'rgba(0,0,0,0.95)';
    ctx.shadowBlur = f * 0.35;
    ctx.shadowOffsetY = f * 0.07;
    let y = top;
    if (name) {
      ctx.fillStyle = speaker.color;
      ctx.font = `700 ${f * 0.66}px ${SANS}`;
      spaced(ctx, name.toUpperCase(), w / 2, y + f * 0.75, f * 0.16, w * 0.9);
      y += f * 1.25;
    }
    ctx.font = quoted ? `italic 600 ${f * 1.22}px ${SERIF}` : `600 ${f * 1.04}px ${SERIF}`;
    ctx.fillStyle = quoted ? '#ffe8b8' : cue.who === 'n' ? '#f2e8d2' : '#ffffff';
    for (const l of main) {
      ctx.fillText(l, w / 2, y + mainH * 0.78);
      y += mainH;
    }
    if (sub.length) {
      y += f * 0.45;
      ctx.font = `500 ${f * 0.84}px ${SANS}`;
      ctx.fillStyle = '#e4d8c4';
      for (const l of sub) {
        ctx.fillText(l, w / 2, y + subH * 0.76);
        y += subH;
      }
    }
    ctx.restore();
  }

  /** The still behind the title screen: a living picture from the film. */
  renderPoster(now = 0): void {
    const shot = SHOTS.findIndex((s) => s.id === 'pl-gate');
    const len = SHOTS[shot].end - SHOTS[shot].start;
    const local = 9 + ((now / 1000) % Math.max(4, len - 12));
    this.drawShot(this.ctx, shot, local, SHOTS[shot].start + local, true);
    this.ctx.save();
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.drawImage(this.vignette, 0, 0);
    this.ctx.restore();
  }

  toBlob(): Promise<Blob | null> {
    return new Promise((resolve) => this.canvas.toBlob((blob) => resolve(blob), 'image/png'));
  }
}

function wrap(ctx: Ctx, text: string, max: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  /* Aim for lines of similar length rather than one short orphan. */
  const full = ctx.measureText(text).width;
  const target = full > max ? Math.min(max, (full / Math.ceil(full / max)) * 1.08) : max;
  let line = '';
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > target) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** Letter-spaced centred text (canvas letterSpacing is not everywhere). */
function spaced(ctx: Ctx, text: string, x: number, y: number, gap: number, max = Infinity): void {
  const widths = [...text].map((c) => ctx.measureText(c).width);
  const natural = widths.reduce((s, v) => s + v, 0);
  let space = gap;
  if (natural + gap * (text.length - 1) > max) space = Math.max(0, (max - natural) / Math.max(1, text.length - 1));
  let cx = x - (natural + space * (text.length - 1)) / 2;
  const align = ctx.textAlign;
  ctx.textAlign = 'left';
  [...text].forEach((c, i) => {
    ctx.fillText(c, cx, y);
    cx += widths[i] + space;
  });
  ctx.textAlign = align;
}

function makeGrain(): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const img = g.createImageData(256, 256);
  let seed = 9173;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    const v = seed >>> 24;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}
