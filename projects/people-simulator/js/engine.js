/* People Simulator — fixed-step simulation engine */
import { stateProfile, dominant, metrics, USA, DB } from './model.js';

export class Simulator {
  constructor(hooks = {}) {
    this.hooks = hooks;
    this.time = new Date(); this.time.setHours(8, 0, 0, 0);
    this.speed = 4;
    this.running = true;
    this.event = 'none';
    this.state = null;
    this.acc = 0;
    this.tickCount = 0;
  }
  setSpeed(v) { this.speed = v; }
  setEvent(v) { this.event = v; this.recompute(); }
  toggle() { this.running = !this.running; return this.running; }
  step() {
    this.time = new Date(this.time.getTime() + 3600000);
    this.recompute();
  }
  stepDay() {
    this.time = new Date(this.time.getTime() + 24 * 3600000);
    this.recompute();
  }
  setTime(date) { this.time = new Date(date); this.recompute(); }
  jumpTo(hour) {
    const d = new Date(this.time);
    d.setHours(hour, 0, 0, 0);
    this.time = d;
    this.recompute();
  }
  update(dt) {
    if (!this.running) return;
    this.acc += dt * this.speed;
    while (this.acc >= 1) { this.step(); this.acc -= 1; }
  }
  recompute(name = this.state) {
    const pop = name && DB[name] ? DB[name].pop : USA.pop;
    const p = stateProfile(name, this.time, this.event);
    this.state = {
      name: name || null, time: new Date(this.time), mix: p.mix,
      counts: Object.fromEntries(Object.keys(p.mix).map(k => [k, Math.round(pop * p.mix[k] / 100)])),
      dominant: dominant(p.mix), metrics: metrics(p.mix), population: pop
    };
    this.tickCount++;
    this.hooks.onChange?.(this.state);
    return this.state;
  }
  snapshot(name) { return this.recompute(name); }
}
