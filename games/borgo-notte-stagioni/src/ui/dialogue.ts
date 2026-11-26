import { CAST, type Line } from '../game/story';

/*
 * Dialogue box: portrait (initials on the character colour), name, role,
 * the line typed out. A tap, a click, E or Enter completes the line, then
 * moves to the next one.
 */
export class Dialogue {
  private root: HTMLElement;
  private portrait: HTMLElement;
  private name: HTMLElement;
  private role: HTMLElement;
  private text: HTMLElement;
  private lines: Line[] = [];
  private index = 0;
  private shown = 0;
  private done: (() => void) | null = null;

  constructor() {
    this.root = document.getElementById('dialogue')!;
    this.portrait = this.root.querySelector('.dlg-portrait')!;
    this.name = this.root.querySelector('.dlg-name')!;
    this.role = this.root.querySelector('.dlg-role')!;
    this.text = this.root.querySelector('.dlg-text')!;
    this.root.addEventListener('pointerdown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.advance();
    });
  }

  get open(): boolean {
    return !this.root.hidden;
  }

  play(lines: Line[], done: () => void): void {
    this.lines = lines;
    this.index = 0;
    this.done = done;
    this.root.hidden = false;
    this.render();
  }

  private render(): void {
    const line = this.lines[this.index];
    const who = CAST[line.who];
    this.portrait.textContent = who.name.replace(/^(il|lo|la|Zio|Zia|Maresciallo) /i, '').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
    this.portrait.style.background = who.color;
    this.name.textContent = who.name;
    this.role.textContent = who.role;
    this.shown = 0;
    this.text.textContent = '';
  }

  /** Typewriter: ~45 characters per second. */
  update(dt: number): void {
    if (!this.open) return;
    const full = this.lines[this.index].text;
    if (this.shown < full.length) {
      this.shown = Math.min(full.length, this.shown + dt * 45);
      this.text.textContent = full.slice(0, Math.floor(this.shown));
    }
  }

  advance(): void {
    if (!this.open) return;
    const full = this.lines[this.index].text;
    if (this.shown < full.length) {
      this.shown = full.length;
      this.text.textContent = full;
      return;
    }
    this.index++;
    if (this.index >= this.lines.length) {
      this.root.hidden = true;
      const done = this.done;
      this.done = null;
      done?.();
      return;
    }
    this.render();
  }

  close(): void {
    this.root.hidden = true;
    this.done = null;
  }
}
