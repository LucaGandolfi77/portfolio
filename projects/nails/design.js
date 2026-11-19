/* Nail Art AR — design state and color presets */

export const DEFAULT_DESIGN = {
  c1: '#ff0055',
  c2: '#ffcc00',
  shape: 'round',
  length: 1.25,
  gloss: 0.55,
  lighting: true,
  sparkle: false
};

export const PRESETS = [
  { id: 'french',  name: 'French', c1: '#f4d9d2', c2: '#fff8f2', shape: 'almond',   length: 1.15, gloss: 0.55, lighting: true,  sparkle: false },
  { id: 'ombre',   name: 'Ombré',  c1: '#2b1055', c2: '#ff6ec7', shape: 'coffin',   length: 1.55, gloss: 0.72, lighting: true,  sparkle: false },
  { id: 'neon',    name: 'Neon',   c1: '#00f5a0', c2: '#00d9f5', shape: 'stiletto', length: 1.9,  gloss: 0.85, lighting: true,  sparkle: false },
  { id: 'chrome',  name: 'Chrome', c1: '#e6eaf2', c2: '#8e9bb2', shape: 'square',   length: 1.2,  gloss: 1,    lighting: true,  sparkle: false },
  { id: 'nude',    name: 'Nude',   c1: '#c98f7a', c2: '#e8b79f', shape: 'round',    length: 1.05, gloss: 0.38, lighting: true,  sparkle: false },
  { id: 'glitter', name: 'Glitter',c1: '#7b2ff7', c2: '#f107a3', shape: 'almond',   length: 1.45, gloss: 0.9,  lighting: true,  sparkle: true }
];

export class Design {
  constructor(onChange = () => {}) {
    this.state = { ...DEFAULT_DESIGN };
    this.onChange = onChange;
    this.activePreset = null;
  }

  set(patch, preset = null) {
    Object.assign(this.state, patch);
    this.activePreset = preset;
    this.onChange(this.state, preset);
  }

  applyPreset(id) {
    const preset = PRESETS.find(p => p.id === id);
    if (!preset) return;
    const { id: _id, name: _name, ...values } = preset;
    this.set(values, id);
  }

  matchesPreset(preset) {
    return ['c1', 'c2', 'shape', 'length', 'gloss', 'lighting', 'sparkle']
      .every(k => String(this.state[k]) === String(preset[k]));
  }
}
