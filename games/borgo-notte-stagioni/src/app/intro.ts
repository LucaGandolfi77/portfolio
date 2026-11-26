import * as THREE from 'three';

/*
 * The opening film, rendered live in the engine: a dawn flight over
 * Fidenza with letterbox bars and captions, ending on the title. It can be
 * skipped and replayed from the title screen.
 */

interface Shot {
  from: [number, number, number];
  to: [number, number, number];
  look: [number, number, number];
  lookTo?: [number, number, number];
  dur: number;
  hours: number;
  caption?: string;
  sub?: string;
}

export const SHOTS: Shot[] = [
  { from: [-900, 220, 700], to: [-500, 140, 380], look: [-200, 0, 0], dur: 7, hours: 7.1, caption: 'Fidenza', sub: 'pianura padana, oggi' },
  { from: [-420, 46, 120], to: [-330, 30, 40], look: [-268, 12, 2], dur: 6.5, hours: 7.5, caption: 'Il Duomo di San Donnino guarda la piazza da otto secoli.' },
  { from: [-60, 22, -90], to: [60, 18, -60], look: [15, 4, -21], dur: 6, hours: 7.9, caption: 'Piazza Garibaldi si sveglia con il primo caffè.' },
  { from: [120, 14, -190], to: [180, 9, -150], look: [190, 2, -108], lookTo: [175, 4, -125], dur: 6.5, hours: 8.3, caption: 'Alla stazione scende qualcuno che mancava da dieci anni.', sub: 'Dario Corradi' },
  { from: [300, 80, 300], to: [520, 110, 600], look: [400, 10, 150], lookTo: [100, 0, 900], dur: 6.5, hours: 8.6, caption: 'Lo zio ha un taxi, un garage e un debito con l\'uomo sbagliato.' },
  { from: [600, 160, 1000], to: [200, 260, 400], look: [-100, 0, 200], dur: 6, hours: 9, caption: 'Quattro stagioni per sistemare le cose.' }
];

export class Intro {
  private t = 0;
  private shot = 0;
  private bars: HTMLElement;
  private caption: HTMLElement;
  private sub: HTMLElement;
  private root: HTMLElement;
  active = false;
  private onEnd: (() => void) | null = null;

  constructor() {
    this.root = document.getElementById('intro')!;
    this.bars = this.root;
    this.caption = this.root.querySelector('.intro-caption')!;
    this.sub = this.root.querySelector('.intro-sub')!;
    this.root.querySelector('.intro-skip')!.addEventListener('click', (e) => {
      e.stopPropagation();
      this.finish();
    });
  }

  start(onEnd: () => void): void {
    this.active = true;
    this.t = 0;
    this.shot = 0;
    this.onEnd = onEnd;
    this.root.hidden = false;
    this.root.classList.remove('ending');
    this.show();
  }

  private show(): void {
    const s = SHOTS[this.shot];
    this.caption.textContent = s.caption ?? '';
    this.sub.textContent = s.sub ?? '';
    this.caption.classList.remove('in');
    void this.caption.offsetWidth;
    this.caption.classList.add('in');
  }

  /** Moves the camera; returns the hour to show the sky at. */
  update(dt: number, camera: THREE.PerspectiveCamera): number {
    const s = SHOTS[this.shot];
    this.t += dt;
    const k = Math.min(1, this.t / s.dur);
    const e = k * k * (3 - 2 * k);
    camera.position.set(
      s.from[0] + (s.to[0] - s.from[0]) * e,
      s.from[1] + (s.to[1] - s.from[1]) * e,
      s.from[2] + (s.to[2] - s.from[2]) * e
    );
    const lt = s.lookTo ?? s.look;
    camera.lookAt(s.look[0] + (lt[0] - s.look[0]) * e, s.look[1] + (lt[1] - s.look[1]) * e, s.look[2] + (lt[2] - s.look[2]) * e);
    if (camera.fov !== 50) {
      camera.fov = 50;
      camera.updateProjectionMatrix();
    }
    if (this.t >= s.dur) {
      this.t = 0;
      this.shot++;
      if (this.shot >= SHOTS.length) {
        this.finish();
        return s.hours;
      }
      this.show();
    }
    const next = SHOTS[Math.min(this.shot, SHOTS.length - 1)];
    return next.hours;
  }

  finish(): void {
    if (!this.active) return;
    this.active = false;
    this.root.classList.add('ending');
    setTimeout(() => (this.root.hidden = true), 600);
    const end = this.onEnd;
    this.onEnd = null;
    end?.();
  }

  get bar(): HTMLElement {
    return this.bars;
  }
}
