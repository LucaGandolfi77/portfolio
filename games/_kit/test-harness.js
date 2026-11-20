/* Game Kit — minimal node test harness (no dependencies) */

export function test(name, fn) {
  try { fn(); console.log(`  ✓ ${name}`); return true; }
  catch (e) { console.error(`  ✗ ${name}: ${e.message}`); return false; }
}
export function eq(actual, expected, msg = '') {
  if (actual !== expected) throw new Error(`${msg} expected ${expected}, got ${actual}`);
}
export function ok(value, msg = 'expected truthy') { if (!value) throw new Error(msg); }
export function near(actual, expected, tolerance = 0.001, msg = '') {
  if (Math.abs(actual - expected) > tolerance) throw new Error(`${msg} expected ~${expected}, got ${actual}`);
}
export function summary(passed, total) {
  console.log(`\n${passed}/${total} tests passed`);
  if (passed !== total) process.exitCode = 1;
}
