import { expect, test } from '@playwright/test';

/* Piano Fall is a static ES-module PWA: no build, served from the repo. */
const APP = '/games/piano-fall/';
test.use({ video: 'off', viewport: { width: 900, height: 420 } });

function collectErrors(page) {
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('response', (r) => r.url().includes('/games/') && r.status() >= 400 && errors.push(`${r.status()} ${r.url()}`));
  return errors;
}

/** A one-track MIDI file: a C-major scale on channel 1, chords on channel 2. */
function midiFile() {
  const vlq = (n) => { const b = [n & 0x7f]; while ((n >>= 7)) b.unshift((n & 0x7f) | 0x80); return b; };
  const ev = [];
  [72, 74, 76, 77, 79, 77, 76, 74].forEach((m, i) => ev.push([i * 480, [0x90, m, 100]], [i * 480 + 440, [0x80, m, 0]]));
  [[48, 52, 55], [53, 57, 60]].forEach((ch, j) => ch.forEach((m) => ev.push([j * 1920, [0x91, m, 70]], [j * 1920 + 1900, [0x81, m, 0]])));
  ev.sort((a, b) => a[0] - b[0]);
  const data = [0x00, 0xff, 0x51, 0x03, 0x07, 0xa1, 0x20];
  let last = 0;
  for (const [tick, bytes] of ev) { data.push(...vlq(tick - last), ...bytes); last = tick; }
  data.push(0x00, 0xff, 0x2f, 0x00);
  return Buffer.from([0x4d, 0x54, 0x68, 0x64, 0, 0, 0, 6, 0, 0, 0, 1, 0x01, 0xe0,
    0x4d, 0x54, 0x72, 0x6b, 0, 0, (data.length >> 8) & 255, data.length & 255, ...data]);
}

test.describe('Piano Fall', () => {
  test('the library lists the songs and a song plays to a 3-star result', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(APP);
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await expect(page.locator('.song-card')).toHaveCount(54);
    await page.locator('.tab', { hasText: 'Pop originali' }).click();
    expect(await page.locator('.song-card').count()).toBeGreaterThanOrEqual(15);
    await page.locator('#search').fill('vespa');
    await expect(page.locator('.song-card')).toHaveCount(1);
    await page.locator('.song-card').click();
    await expect(page.locator('#detail')).toBeVisible();
    await page.evaluate(() => { window.__piano.autoplay = true; });
    await page.locator('#btnStart').click();
    await expect(page.locator('#hud')).toBeVisible();
    await page.evaluate(() => window.__piano.ff(90));
    await expect(page.locator('#results')).toBeVisible();
    const r = await page.evaluate(() => window.__piano.lastResult);
    expect(r.stars).toBe(3);
    expect(r.score).toBeGreaterThan(10000);
    await expect(page.locator('#rStars')).toHaveText('★★★');
    expect(errors).toEqual([]);
  });

  test('practice mode waits for the right key', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(APP);
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    const state = await page.evaluate(() => {
      const p = window.__piano;
      p.start('twinkle', 'practice');
      p.ff(6);
      const s = p.state;
      const before = { waiting: s.waiting, time: s.time };
      p.press(s.notes[0].midi); p.release(s.notes[0].midi);
      p.ff(0.5);
      return { before, after: { waiting: s.waiting, time: s.time, hits: s.hits } };
    });
    expect(state.before.waiting).toBe(true);
    expect(state.before.time).toBe(0);
    expect(state.after.hits).toBe(1);
    expect(state.after.time).toBeGreaterThan(0.3);
    expect(errors).toEqual([]);
  });

  test('a MIDI file becomes a song: melody to play, chords to the band', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto(APP);
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await page.locator('#midiFile').setInputFiles({ name: 'Scala.mid', mimeType: 'audio/midi', buffer: midiFile() });
    await expect(page.locator('#detail')).toBeVisible();
    await expect(page.locator('#dTitle')).toHaveText('Scala');
    const song = await page.evaluate(() => window.__piano.songs().find((s) => s.cat === 'midi'));
    expect(song.notes).toBe(8);
    await page.reload();
    await expect(page.locator('.tab', { hasText: 'MIDI' })).toBeVisible();
    expect(errors).toEqual([]);
  });

  test('every song starts and its band plays without errors', async ({ page }) => {
    const errors = collectErrors(page);
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    await page.goto(APP);
    await expect(page.locator('html')).toHaveAttribute('data-ready', '1');
    await page.locator('.song-card').first().click();   // a real gesture unlocks the audio
    const out = await page.evaluate(() => {
      const p = window.__piano;
      p.autoplay = true;
      const rows = [];
      for (const s of p.songs()) {
        p.start(s.id, 'play');
        p.ff(9);
        rows.push({ id: s.id, band: p.state.bi + p.state.di, hits: p.state.hits });
      }
      return { audio: p.audio(), rows };
    });
    expect(out.rows).toHaveLength(54);
    for (const r of out.rows) {
      expect(r.hits, r.id).toBeGreaterThan(0);
      expect(r.band, r.id).toBeGreaterThan(0);
    }
    expect(errors).toEqual([]);
  });

  test('installs as a PWA: manifest, icons and service worker', async ({ page }) => {
    await page.goto(APP);
    const manifest = await page.evaluate(async () => (await fetch(document.querySelector('link[rel="manifest"]').href)).json());
    expect(manifest.short_name).toBe('Piano Fall');
    expect(manifest.icons.some((i) => i.purpose === 'maskable')).toBe(true);
    await expect.poll(() => page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => !!r)), { timeout: 15_000 }).toBe(true);
  });
});
