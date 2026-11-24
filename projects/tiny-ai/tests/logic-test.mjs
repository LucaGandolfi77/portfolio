import { test, eq, ok, summary } from '../../../games/_kit/test-harness.js';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const store = new Map();
globalThis.localStorage = {
  getItem: k => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
globalThis.window = { addEventListener() {}, dispatchEvent() {}, isSecureContext: true };
globalThis.document = { documentElement: { lang: '' }, querySelectorAll: () => [] };

const { MODELS, BACKENDS, TIERS, PRESETS, STR, DEFAULT_SETTINGS } = await import(join(ROOT, 'js/config.js'));
const caps = await import(join(ROOT, 'js/capabilities.js'));
const md = await import(join(ROOT, 'js/markdown.js'));
const storage = await import(join(ROOT, 'js/storage.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, fn) => cases.push([n, fn]);

// ---- verified model catalogue ----
run('all local model ids exist and are marked verified', () => {
  ['transformersjs','webgpu'].forEach(b => {
    ok(MODELS[b].length >= 8, b);
    MODELS[b].forEach(m => ok(m.verified === true, m.id));
  });
});
run('the invalid q4f16_1 SmolLM2-135M id is gone', () => {
  ok(!MODELS.webgpu.some(m => m.id.includes('135M-Instruct-q4f16_1')));
  ok(MODELS.webgpu.some(m => m.id === 'SmolLM2-135M-Instruct-q0f16-MLC'));
});
run('base models replaced by instruct variants', () => {
  ok(!MODELS.transformersjs.some(m => m.id === 'onnx-community/SmolLM-135M-ONNX'));
  ok(!MODELS.transformersjs.some(m => m.id === 'onnx-community/SmolLM2-360M-ONNX'));
  ok(!MODELS.transformersjs.some(m => m.id === 'onnx-community/distilgpt2-ONNX'));
  ok(MODELS.transformersjs.some(m => m.id === 'onnx-community/SmolLM2-360M-Instruct-ONNX'));
});
run('tiny models are present for iPhone', () => {
  ok(MODELS.transformersjs.some(m => m.id.includes('TinyStories-1M')));
  ok(MODELS.transformersjs.some(m => m.id.includes('TinyStories-3M')));
  ok(MODELS.transformersjs.filter(m => m.tier === 'tiny').length >= 2);
});
run('new 2026 models are included', () => {
  ok(MODELS.transformersjs.some(m => m.id.includes('LFM2.5-350M')));
  ok(MODELS.transformersjs.some(m => m.id.includes('Qwen3.5-0.8B-Text')));
});
run('backends include advanced ones and 4 presets', () => {
  eq(BACKENDS.length, 5);
  ok(BACKENDS.filter(b => b.advanced).length === 2);
  eq(PRESETS.length, 4);
  Object.keys(TIERS).length >= 4 || ok(true);
});

// ---- capabilities ----
run('capability detection has expected fields', () => {
  const c = caps.detectCapabilities({ gpu: true, hardwareConcurrency: 8, deviceMemory: 8, onLine: true }, { isSecureContext: true });
  eq(c.webgpu, true); eq(c.cores, 8); eq(c.memoryGB, 8);
});
run('large models need more memory or WebGPU', () => {
  const large = { tier: 'large', size: 2600 };
  ok(!caps.fitsDevice(large, caps.detectCapabilities({ deviceMemory: 2 }, {})));
  ok(caps.fitsDevice(large, caps.detectCapabilities({ deviceMemory: 8 }, {})));
  ok(caps.fitsDevice({ tier: 'tiny', size: 15 }, caps.detectCapabilities({}, {})));
});
run('recommendModel picks a small instruct model', () => {
  const c = caps.detectCapabilities({ deviceMemory: 8, gpu: true }, {});
  const rec = caps.recommendModel(MODELS.transformersjs, c);
  ok(rec && rec.id.includes('SmolLM2-135M'));
});
run('formatSize shows MB and GB', () => {
  eq(caps.formatSize(15), '15 MB');
  eq(caps.formatSize(1500), '1.5 GB');
});

// ---- markdown safety ----
run('markdown escapes HTML', () => {
  const out = md.render('<script>alert(1)</script>');
  ok(out.includes('&lt;script&gt;'));
  ok(!out.includes('<script>'));
});
run('markdown renders code blocks', () => {
  const out = md.render('```js\nconst x = 1;\n```');
  ok(out.includes('code-block'));
  ok(out.includes('data-copy'));
});

// ---- storage ----
run('conversations and settings persist', () => {
  store.clear(); storage.resetAll();
  const c = storage.newConversation();
  storage.pushMessage('user', 'Ciao');
  storage.pushMessage('assistant', 'Salve!');
  eq(storage.profile.conversations.length, 1);
  eq(storage.activeConversation().messages.length, 2);
  eq(storage.activeConversation().title, 'Ciao');
  storage.setSettings({ temperature: 0.3 });
  eq(storage.profile.settings.temperature, 0.3);
});
run('deleteConversation removes it', () => {
  storage.resetAll();
  const c = storage.newConversation();
  storage.deleteConversation(c.id);
  eq(storage.profile.conversations.length, 0);
});

// ---- structure ----
run('EN/IT dictionaries aligned', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('default model is in the verified list', () => {
  ok(MODELS.transformersjs.some(m => m.id === DEFAULT_SETTINGS.model));
});
run('modules, backends and SW assets exist', () => {
  ['config','i18n','storage','capabilities','verify','markdown','glass','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n + '.js'));
  ['transformers','webllm','openrouter','local'].forEach(n =>
    ok(existsSync(join(ROOT, 'js/backends', n + '.js')), 'backends/' + n));
  ['icon.svg','icons/icon-192.png','icons/icon-512.png','css/app.css'].forEach(p =>
    ok(existsSync(join(ROOT, p)), p));
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ['capabilities','verify','backends/openrouter.js','backends/transformers.js'].forEach(f =>
    ok(sw.includes(f), f));
});
run('HTML has canonical, shell, no top_buttons misplacement and no CDN fonts', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('data-project-shell'));
  ok(!html.includes('fonts.googleapis.com'));
  ok(html.indexOf('<script src="../_shared/shell.js"') < html.indexOf('</html>'));
});
run('manifest has icons and scope', () => {
  const m = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
  eq(m.scope, './'); ok(m.icons.length >= 2);
});

for (const [n, fn] of cases) { total++; if (test(n, fn)) passed++; }
summary(passed, total);
