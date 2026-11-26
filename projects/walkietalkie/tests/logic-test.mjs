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

const { STR, DEFAULT_SETTINGS, QUICK_MSGS } = await import(join(ROOT, 'js/config.js'));
const { randomChannel } = await import(join(ROOT, 'js/network.js'));
const { AudioEngine } = await import(join(ROOT, 'js/audio.js'));
const storage = await import(join(ROOT, 'js/storage.js'));

let passed = 0, total = 0;
const cases = [];
const run = (n, fn) => cases.push([n, fn]);

run('i18n dictionaries are aligned and complete', () => {
  eq(Object.keys(STR.en).sort().join(','), Object.keys(STR.it).sort().join(','));
  ok(Object.values(STR.en).every(v => typeof v === 'string' && v.length));
});
run('quick messages cover both languages', () => {
  ok(QUICK_MSGS.length >= 5);
  QUICK_MSGS.forEach(m => { ok(m.en && m.it, m.id); });
});
run('defaults include audio and signaling settings', () => {
  eq(DEFAULT_SETTINGS.volume, 0.8);
  eq(DEFAULT_SETTINGS.signalingHost, '0.peerjs.com');
  eq(DEFAULT_SETTINGS.signalingPort, 443);
  ok(DEFAULT_SETTINGS.echoCancel && DEFAULT_SETTINGS.noiseSuppression);
  ok(DEFAULT_SETTINGS.muted === false);
});
run('channel IDs are unambiguous and 4 chars', () => {
  for (let i = 0; i < 200; i++) {
    const id = randomChannel();
    eq(id.length, 4);
    ok(/^[A-HJ-KM-NP-Z2-9]{4}$/.test(id), id);
    ok(!/[01ILO]/.test(id));
  }
});
run('audio constraints reflect settings', () => {
  const s = { ...DEFAULT_SETTINGS, deviceId:'abc', echoCancel:false, noiseSuppression:true, autoGain:false };
  const a = new AudioEngine(s);
  const c = a.constraints();
  eq(c.audio.deviceId.exact, 'abc');
  eq(c.audio.echoCancellation, false);
  eq(c.audio.noiseSuppression, true);
  eq(c.audio.autoGainControl, false);
});
run('settings and recent channels persist', () => {
  store.clear(); storage.resetAll?.();
  storage.setSettings({ volume: 0.3 });
  storage.addRecent('K7Q2'); storage.addRecent('M4X9'); storage.addRecent('K7Q2');
  eq(storage.profile.settings.volume, 0.3);
  eq(storage.profile.recent.length, 2);
  eq(storage.profile.recent[0], 'K7Q2');
});
run('messages are bounded and clearable', () => {
  storage.resetAll?.();
  for (let i = 0; i < 80; i++) storage.pushMessage('P' + i, 'msg' + i);
  eq(storage.profile.messages.length, 60);
  storage.clearMessages();
  eq(storage.profile.messages.length, 0);
});
run('all modules, vendor, PWA assets and README exist', () => {
  ['config','i18n','storage','glass','audio','network','ui','main'].forEach(n =>
    ok(existsSync(join(ROOT, 'js', n + '.js')), 'js/' + n));
  ['vendor/peerjs.min.js','css/app.css','manifest.webmanifest','icon.svg',
   'icons/icon-192.png','icons/icon-512.png','README.md'].forEach(p =>
    ok(existsSync(join(ROOT, p)), p));
});
run('HTML is offline-ready, accessible and has shell inside body', () => {
  const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
  ok(html.includes('rel="canonical"'));
  ok(html.includes('data-project-shell'));
  ok(html.includes('./vendor/peerjs.min.js'));
  ok(!html.includes('unpkg.com') && !html.includes('jsdelivr'));
  ok(!html.includes('fonts.googleapis.com'));
  ok(html.indexOf('<script src="../_shared/shell.js"') < html.indexOf('</body>'));
  ok(html.indexOf('<script type="module"') < html.indexOf('</body>'));
  ok(html.includes('aria-live="polite"'));
  ok((html.match(/data-i18n="/g) || []).length > 20);
});
run('SW precaches every local module', () => {
  const sw = readFileSync(join(ROOT, 'sw.js'), 'utf8');
  ok(sw.includes('pf-walkie-shell-v1'));
  ['vendor/peerjs.min.js','js/network.js','js/audio.js','js/main.js','css/app.css'].forEach(f =>
    ok(sw.includes(f), f));
});
run('manifest declares icons and standalone display', () => {
  const m = JSON.parse(readFileSync(join(ROOT, 'manifest.webmanifest'), 'utf8'));
  eq(m.display, 'standalone');
  ok(m.icons.length >= 2);
  ok(m.icons.some(i => i.purpose === 'maskable'));
});
run('catalog and root SW are updated', () => {
  const data = readFileSync(join(ROOT, '..', '..', 'assets/js/projects-data.js'), 'utf8');
  ok(data.includes('"id": "p2p-walkie-talkie"'));
  ok(data.includes('"badge": "P2P Voice"'));
  ok(data.includes('mesh audio reale'));
  const root = readFileSync(join(ROOT, '..', '..', 'sw.js'), 'utf8');
  ok((root.includes("name.startsWith('portfolio-')") && root.includes('isNestedApp')));
});
run('i18n keys used in JS all exist', () => {
  for (const f of ['main.js','ui.js']) {
    const src = readFileSync(join(ROOT, 'js', f), 'utf8');
    [...src.matchAll(/\bt\('([a-zA-Z]+)'\)/g)].forEach(m => ok(STR.en[m[1]], f + ': ' + m[1]));
  }
});

run('mesh forms full peer graph and broadcasts chat', async () => {
  const registry = new Map(); let seq = 0;
  class FakePeer {
    constructor(id) {
      this.id = id || ('GUEST' + (++seq)); registry.set(this.id, this); this.ev = {};
      setTimeout(() => this.emit('open', this.id), 0);
    }
    on(k, f) { (this.ev[k] ||= []).push(f); return this; }
    emit(k, ...a) { (this.ev[k] || []).forEach(f => f(...a)); }
    connect(id) {
      const a = new FakeData(this.id, id), b = new FakeData(id, this.id);
      a.pair = b; b.pair = a;
      setTimeout(() => { registry.get(id)?.emit('connection', b); a.open = b.open = true; a.emit('open'); b.emit('open'); }, 0);
      return a;
    }
    call(id) {
      const a = new FakeCall(this.id, id), b = new FakeCall(id, this.id);
      a.pair = b; b.pair = a;
      setTimeout(() => {
        registry.get(id)?.emit('call', b);
        a.emit('stream', {}); b.emit('stream', {});
      }, 0);
      return a;
    }
    destroy() { registry.delete(this.id); }
    reconnect() {}
  }
  class FakeData {
    constructor(from, to) { this.peer = to; this.from = from; this.open = false; this.ev = {}; }
    on(k, f) { (this.ev[k] ||= []).push(f); return this; }
    emit(k, ...a) { (this.ev[k] || []).forEach(f => f(...a)); }
    send(m) { setTimeout(() => this.pair?.emit('data', { ...m }), 0); }
    close() { this.open = false; this.emit('close'); }
  }
  class FakeCall {
    constructor(from, to) { this.peer = to; this.from = from; this.ev = {}; }
    on(k, f) { (this.ev[k] ||= []).push(f); return this; }
    emit(k, ...a) { (this.ev[k] || []).forEach(f => f(...a)); }
    answer() { setTimeout(() => this.pair?.emit('stream', {}), 0); }
    close() { this.emit('close'); }
  }
  globalThis.Peer = FakePeer;
  const { WalkieNetwork } = await import(join(ROOT, 'js/network.js'));
  const seen = [];
  const h = { onChat: (id, text) => seen.push(id + ':' + text), onTalking: () => {},
    onStream: () => {}, onLeave: () => {}, onPeers: () => {}, onStatus: () => {}, onError: e => { throw new Error(e); } };
  const stream = { getAudioTracks: () => [] };
  const host = new WalkieNetwork(h, {});
  const channel = await host.startHost(stream);
  const a = new WalkieNetwork(h, {}), b = new WalkieNetwork(h, {});
  await a.join(channel, stream); await b.join(channel, stream);
  /* Poll instead of a fixed 60 ms: a busy CI runner can be slower. */
  const until = async (cond, timeout = 3000) => {
    const start = Date.now();
    while (!cond()) {
      if (Date.now() - start > timeout) throw new Error('timed out');
      await new Promise(r => setTimeout(r, 5));
    }
  };
  await until(() => host.records.size === 2 && a.records.size === 2 && b.records.size === 2);
  eq(host.records.size, 2); eq(a.records.size, 2); eq(b.records.size, 2);
  ok([...b.records.keys()].includes(a.selfId) && [...a.records.keys()].includes(b.selfId));
  a.sendChat('ping');
  await until(() => seen.length === 2);
  eq(seen.length, 2);
  ok(seen.every(s => s.endsWith(':ping')));
  host.close(); a.close(); b.close();
});

for (const [n, fn] of cases) {
  total++;
  try { await fn(); console.log(`  ✓ ${n}`); passed++; }
  catch (e) { console.error(`  ✗ ${n}: ${e.message}`); }
}
summary(passed, total);
