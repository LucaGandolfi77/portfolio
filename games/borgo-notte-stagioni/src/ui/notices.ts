/*
 * Banners (titles across the screen), toasts (short messages), the money
 * bump and the job timer. Timers tick with the game, not with setTimeout,
 * so they freeze while paused.
 */
const $ = (id: string): HTMLElement => document.getElementById(id)!;

export class Notices {
  private bannerTimer = 0;
  toastTimer = 0;

  banner(title: string, detail = '', seconds = 3.2): void {
    const el = $('banner');
    el.innerHTML = '';
    el.append(title);
    if (detail) {
      const small = document.createElement('small');
      small.textContent = detail;
      el.append(small);
    }
    el.hidden = false;
    el.style.animation = 'none';
    void el.offsetWidth;
    el.style.animation = '';
    this.bannerTimer = seconds;
  }

  toast(text: string, seconds = 2.2): void {
    const el = $('toast');
    el.textContent = text;
    el.hidden = false;
    this.toastTimer = seconds;
  }

  bumpMoney(): void {
    const money = $('money');
    money.classList.remove('bump');
    void money.offsetWidth;
    money.classList.add('bump');
  }

  timer(seconds: number | null): void {
    const el = $('job-timer');
    if (seconds === null || !Number.isFinite(seconds)) {
      el.textContent = '';
      return;
    }
    const left = Math.max(0, Math.ceil(seconds));
    el.textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
    el.classList.toggle('low', left <= 10);
  }

  tick(dt: number): void {
    if (this.bannerTimer > 0) {
      this.bannerTimer -= dt;
      if (this.bannerTimer <= 0) $('banner').hidden = true;
    }
    if (this.toastTimer > 0) {
      this.toastTimer -= dt;
      if (this.toastTimer <= 0) $('toast').hidden = true;
    }
  }
}
