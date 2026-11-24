/* Tiny AI — device capability detection and model compatibility (pure-ish) */

export function detectCapabilities(nav = typeof navigator !== 'undefined' ? navigator : {}, win = typeof window !== 'undefined' ? window : {}) {
  return {
    webgpu: !!nav.gpu,
    webnn: !!nav.webnn,
    wasm: typeof WebAssembly !== 'undefined',
    cores: nav.hardwareConcurrency || 4,
    memoryGB: nav.deviceMemory || 0,
    online: nav.onLine !== false,
    secure: win.isSecureContext !== false
  };
}

export function fitsDevice(model, caps) {
  if (!model) return false;
  if (model.tier === 'cloud') return caps.online;
  if (model.tier === 'tiny') return true;
  const mb = (model.size || 0);
  if (model.tier === 'large') return caps.memoryGB >= 8 || caps.webgpu;
  if (model.tier === 'medium') return caps.memoryGB >= 4 || caps.webgpu;
  return mb <= 500 || caps.webgpu;
}

export function recommendModel(list, caps) {
  const usable = list.filter(m => fitsDevice(m, caps));
  return usable.find(m => m.tier === 'small' && m.id.includes('SmolLM2-135M'))
    || usable.find(m => m.tier === 'tiny')
    || usable[0] || null;
}

export function formatSize(mb) {
  if (!mb) return '—';
  return mb >= 1000 ? (mb / 1000).toFixed(1) + ' GB' : Math.round(mb) + ' MB';
}
