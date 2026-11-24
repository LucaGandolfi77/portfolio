/** barcode.js — scansione QR/barcode via BarcodeDetector (nativo). */

const FORMATS = ['qr_code', 'ean_13', 'ean_8', 'code_128', 'upc_a', 'upc_e', 'itf', 'codabar'];

export function isSupported() {
  return typeof window !== 'undefined' && 'BarcodeDetector' in window;
}

export async function createScanner() {
  if (!isSupported()) return null;
  const formats = (await BarcodeDetector.getSupportedFormats()).filter((format) => FORMATS.includes(format));
  if (!formats.length) return null;
  const detector = new BarcodeDetector({ formats });
  return {
    async detect(source) {
      try { return await detector.detect(source); }
      catch (e) { return []; }
    }
  };
}

export function drawBoxes(ctx, codes, width, height) {
  if (!ctx || !codes) return;
  ctx.save();
  ctx.lineWidth = 2;
  ctx.font = '600 11px ui-monospace, monospace';
  for (const code of codes) {
    const box = code.boundingBox;
    if (!box) continue;
    ctx.strokeStyle = '#67e8f9';
    ctx.strokeRect(box.x, box.y, box.width, box.height);
    const label = String(code.rawValue || '').slice(0, 48);
    const textWidth = ctx.measureText(label).width + 10;
    ctx.fillStyle = 'rgba(4,10,24,.8)';
    ctx.fillRect(box.x, Math.max(0, box.y - 20), textWidth, 18);
    ctx.fillStyle = '#eef2ff';
    ctx.fillText(label, box.x + 5, Math.max(12, box.y - 7));
  }
  ctx.restore();
}
