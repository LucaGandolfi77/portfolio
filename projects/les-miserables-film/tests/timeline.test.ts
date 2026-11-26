import { describe, expect, it } from 'vitest';
import { CAST } from '../src/film/draw/cast';
import { effectsBetween, EFFECTS } from '../src/film/cues';
import { SCRIPT, SPEAKERS } from '../src/film/script';
import { SHOT_VIEWS } from '../src/film/shots';
import { cameraAt, resolveActor, TRANSITION } from '../src/film/stage';
import { CHAPTERS, CUES, DURATION, SHOTS, activeCue, chapterAt, formatTime, shotIndexAt } from '../src/film/timeline';

describe('timeline', () => {
  it('is a long film built from the script', () => {
    expect(CHAPTERS).toHaveLength(SCRIPT.length);
    expect(CUES.length).toBeGreaterThan(200);
    expect(DURATION).toBeGreaterThan(24 * 60);
    expect(DURATION).toBeLessThan(35 * 60);
  });

  it('has no gaps or overlaps between chapters and shots', () => {
    for (const list of [CHAPTERS, SHOTS]) {
      expect(list[0].start).toBe(0);
      expect(list.at(-1)!.end).toBe(DURATION);
      for (let i = 1; i < list.length; i++) expect(list[i].start).toBeCloseTo(list[i - 1].end, 6);
    }
  });

  it('finds the chapter, shot and line of any moment', () => {
    for (let t = 0; t < DURATION; t += 3.7) {
      const shot = SHOTS[shotIndexAt(t)];
      expect(t).toBeGreaterThanOrEqual(shot.start);
      expect(t).toBeLessThan(shot.end);
      expect(chapterAt(t)).toBe(CHAPTERS[shot.chapter]);
      const cue = activeCue(t);
      if (cue) expect(shot.cues).toContain(cue);
    }
  });

  it('keeps lines apart, inside their shot and clear of the transition', () => {
    for (const shot of SHOTS) {
      shot.cues.forEach((cue, i) => {
        expect(cue.start).toBeGreaterThanOrEqual(shot.start + TRANSITION);
        expect(cue.end).toBeLessThanOrEqual(shot.end);
        expect(cue.end - cue.start).toBeGreaterThanOrEqual(3);
        if (i > 0) expect(cue.start).toBeGreaterThan(shot.cues[i - 1].end);
      });
    }
  });

  it('gives every line a speaker and both languages', () => {
    for (const cue of CUES) {
      expect(SPEAKERS[cue.who]).toBeDefined();
      expect(cue.text.en.trim().length).toBeGreaterThan(0);
      expect(cue.text.it.trim().length).toBeGreaterThan(0);
    }
  });

  it('formats film time', () => {
    expect(formatTime(0)).toBe('00:00');
    expect(formatTime(754)).toBe('12:34');
  });
});

describe('pictures', () => {
  it('has exactly one picture for every shot of the script', () => {
    expect(Object.keys(SHOT_VIEWS).sort()).toEqual(SHOTS.map((s) => s.id).sort());
  });

  it('casts known characters and only times things on existing lines', () => {
    for (const shot of SHOTS) {
      const view = SHOT_VIEWS[shot.id];
      const lines = [...(view.moves ?? []).map((m) => m.l), ...(view.sfx ?? []).map((e) => e[0])];
      for (const actor of view.actors ?? []) {
        expect(CAST[actor.who], `${shot.id}: ${actor.who}`).toBeDefined();
        lines.push(...(actor.keys ?? []).map((k) => k.l));
      }
      for (const l of lines) expect(l, shot.id).toBeLessThan(shot.cues.length);
    }
  });

  it('puts the speaker on stage in most spoken lines', () => {
    let spoken = 0;
    let seen = 0;
    for (const shot of SHOTS) {
      for (const cue of shot.cues) {
        if (cue.who === 'n') continue;
        spoken++;
        const actor = SHOT_VIEWS[shot.id].actors?.find((a) => a.voice === cue.who);
        if (actor && resolveActor(actor, shot, cue.start - shot.start + 1.5).alpha > 0.5) seen++;
      }
    }
    expect(seen / spoken).toBeGreaterThan(0.95);
  });

  it('keeps actors and camera finite through every shot', () => {
    for (const shot of SHOTS) {
      const view = SHOT_VIEWS[shot.id];
      for (let t = 0; t <= shot.end - shot.start; t += 0.5) {
        const [x, y, z] = cameraAt(view, shot, t);
        expect([x, y, z].every(Number.isFinite)).toBe(true);
        expect(z).toBeGreaterThanOrEqual(1);
        for (const actor of view.actors ?? []) {
          const r = resolveActor(actor, shot, t);
          expect([r.x, r.y, r.s, r.alpha, r.blend].every(Number.isFinite), shot.id).toBe(true);
        }
      }
    }
  });

  it('plays each sound effect once, in order', () => {
    expect(EFFECTS.length).toBeGreaterThan(60);
    let heard = 0;
    for (let t = -0.001; t < DURATION; t += 0.25) heard += effectsBetween(t, t + 0.25).length;
    expect(heard).toBe(EFFECTS.length);
    for (const e of EFFECTS) {
      const shot = SHOTS[shotIndexAt(e.at)];
      expect(e.at).toBeGreaterThanOrEqual(shot.start);
    }
  });
});
