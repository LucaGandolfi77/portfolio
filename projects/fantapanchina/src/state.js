/* ============================================================================
   Store minimale con sottoscrizioni per chiave.
   La UI si iscrive solo alle slice che le interessano: niente re-render globale.
   ============================================================================ */

export class Store {
  constructor(initial) {
    this.state = initial;
    this.listeners = new Map();
    this.anyListeners = new Set();
  }

  get() { return this.state; }

  /** Applica un patch shallow e notifica le chiavi cambiate. */
  set(patch) {
    if (!patch) return;
    const changed = [];
    for (const key of Object.keys(patch)) {
      if (this.state[key] !== patch[key]) {
        this.state[key] = patch[key];
        changed.push(key);
      }
    }
    if (changed.length) this.notify(changed);
  }

  /** Mutazione controllata: il mutator riceve lo stato, ritorna chiavi cambiate. */
  update(mutator) {
    const changed = mutator(this.state) || [];
    const keys = Array.isArray(changed) ? changed : Object.keys(changed);
    if (keys.length) this.notify(keys);
  }

  notify(keys) {
    keys.forEach(key => {
      (this.listeners.get(key) || []).forEach(fn => {
        try { fn(this.state[key], this.state); } catch (e) { console.error('store listener', key, e); }
      });
    });
    this.anyListeners.forEach(fn => {
      try { fn(this.state, keys); } catch (e) { console.error('store any listener', e); }
    });
  }

  on(key, fn) {
    if (!this.listeners.has(key)) this.listeners.set(key, new Set());
    this.listeners.get(key).add(fn);
    return () => this.listeners.get(key).delete(fn);
  }

  onAny(fn) {
    this.anyListeners.add(fn);
    return () => this.anyListeners.delete(fn);
  }
}
