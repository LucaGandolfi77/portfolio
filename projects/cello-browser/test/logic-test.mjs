import { test, eq, ok, summary } from '../../../games/_kit/test-harness.js';

const store = new Map();
globalThis.localStorage = {
  getItem: k => store.has(k) ? store.get(k) : null,
  setItem: (k, v) => store.set(k, String(v)),
  removeItem: k => store.delete(k)
};
globalThis.window = { addEventListener() {} };
globalThis.document = { body: { dataset: {} }, getElementById: () => null };

const B = new URL('../js/', import.meta.url).href;
await import(B + 'core/bus.js');
await import(B + 'core/vfs.js');
const O = globalThis.window.CelloOS;

let passed = 0, total = 0;
const run = (n, f) => { total++; if (test(n, f)) passed++; };

run('seed has welcome document', () => {
  ok(O.vfs.exists('/Cello/Documents/WELCOME.TXT'));
  ok(O.vfs.read('/Cello/Documents/WELCOME.TXT').includes('BENVENUTO'));
});
run('ls returns dirs first and sorted', () => {
  const items = O.vfs.ls('/Cello');
  eq(items[0].type, 'dir');
  ok(items.length >= 2);
});
run('write and read a file', () => {
  ok(O.vfs.write('/Cello/Documents/TEST.TXT', 'hello 1994'));
  eq(O.vfs.read('/Cello/Documents/TEST.TXT'), 'hello 1994');
});
run('mkdir and rm', () => {
  ok(O.vfs.mkdir('/Cello/TEMP'));
  ok(O.vfs.exists('/Cello/TEMP'));
  ok(O.vfs.rm('/Cello/TEMP'));
  ok(!O.vfs.exists('/Cello/TEMP'));
});
run('mv copies content and removes source', () => {
  O.vfs.write('/A.TXT', 'data');
  ok(O.vfs.mv('/A.TXT', '/Cello/Documents/B.TXT'));
  eq(O.vfs.read('/Cello/Documents/B.TXT'), 'data');
  ok(!O.vfs.exists('/A.TXT'));
});
run('paths are normalized', () => {
  eq(O.vfs.norm('//Cello//Documents/'), '/Cello/Documents');
});
run('invalid writes fail', () => {
  ok(!O.vfs.write('/Cello/Documents', 'x'));
  ok(!O.vfs.mkdir('/Cello/Documents/WELCOME.TXT'));
});
run('state persists to localStorage', () => {
  const raw = localStorage.getItem('cello.os.vfs');
  ok(raw && raw.includes('WELCOME.TXT'));
});

summary(passed, total);
