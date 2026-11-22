/**
 * scanner.js — fotocamera + decodifica QR con jsQR.
 * Nessun frame lascia il dispositivo.
 */

export class ScanError extends Error {
  constructor(code, cause) {
    super(code);
    this.name = 'ScanError';
    this.code = code;
    this.cause = cause;
  }
}

function secureContext() {
  return (
    typeof window !== 'undefined' &&
    (window.isSecureContext || location.hostname === 'localhost' || location.hostname === '127.0.0.1')
  );
}

function mapCameraError(error) {
  const name = error && error.name;
  if (name === 'NotAllowedError' || name === 'SecurityError') return new ScanError('DENIED', error);
  if (name === 'NotFoundError' || name === 'OverconstrainedError' || name === 'DevicesNotFoundError') {
    return new ScanError('NOT_FOUND', error);
  }
  if (name === 'NotReadableError' || name === 'TrackStartError' || name === 'AbortError') {
    return new ScanError('BUSY', error);
  }
  return new ScanError('GENERIC', error);
}

async function imageFromFile(file) {
  if (typeof createImageBitmap === 'function') {
    try {
      return await createImageBitmap(file);
    } catch {
      /* fallback sotto */
    }
  }
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new ScanError('IMAGE'));
    };
    img.src = url;
  });
}

export class QrScanner {
  constructor({ video, canvas, onResult, onStatus } = {}) {
    if (!video || !canvas) throw new Error('QrScanner richiede video e canvas');
    this.video = video;
    this.canvas = canvas;
    this.onResult = typeof onResult === 'function' ? onResult : () => {};
    this.onStatus = typeof onStatus === 'function' ? onStatus : () => {};
    this.stream = null;
    this.track = null;
    this.running = false;
    this.raf = 0;
    this.lastTick = 0;
    this.deviceId = '';
    this.torchOn = false;
  }

  get supported() {
    return Boolean(
      secureContext() &&
        typeof navigator !== 'undefined' &&
        navigator.mediaDevices &&
        typeof navigator.mediaDevices.getUserMedia === 'function'
    );
  }

  async start(deviceId) {
    this.stop();
    if (!secureContext()) throw new ScanError('INSECURE');
    if (!this.supported) throw new ScanError('UNSUPPORTED');

    const videoConstraints = deviceId
      ? { deviceId: { exact: deviceId } }
      : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } };

    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: videoConstraints });
    } catch (error) {
      throw mapCameraError(error);
    }

    this.stream = stream;
    this.track = stream.getVideoTracks()[0] || null;
    this.deviceId = this.track && this.track.getSettings ? this.track.getSettings().deviceId || '' : '';
    this.torchOn = false;
    this.video.srcObject = stream;
    this.video.setAttribute('playsinline', '');
    this.video.muted = true;
    try {
      await this.video.play();
    } catch {
      /* Safari a volte richiede un secondo play */
      try {
        await this.video.play();
      } catch (error) {
        this.stop();
        throw new ScanError('GENERIC', error);
      }
    }

    this.running = true;
    this.lastTick = 0;
    this.onStatus('running');
    this.loop();
    return this.capabilities();
  }

  loop() {
    if (!this.running) return;
    this.raf = requestAnimationFrame(() => this.loop());

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (now - this.lastTick < 160) return;
    this.lastTick = now;

    const video = this.video;
    if (!video || video.readyState < 2 || !video.videoWidth || !video.videoHeight) return;

    const maxSide = 960;
    const scale = Math.min(1, maxSide / Math.max(video.videoWidth, video.videoHeight));
    const width = Math.max(1, Math.round(video.videoWidth * scale));
    const height = Math.max(1, Math.round(video.videoHeight * scale));
    if (this.canvas.width !== width) this.canvas.width = width;
    if (this.canvas.height !== height) this.canvas.height = height;

    const ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, width, height);

    let imageData;
    try {
      imageData = ctx.getImageData(0, 0, width, height);
    } catch {
      return;
    }
    const jsQR = globalThis.jsQR;
    if (typeof jsQR !== 'function') return;
    const result = jsQR(imageData.data, width, height, { inversionAttempts: 'attemptBoth' });
    if (result && result.data) {
      this.stop();
      this.onResult({ data: result.data });
    }
  }

  stop() {
    this.running = false;
    if (this.raf) {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
    }
    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        try {
          track.stop();
        } catch {
          /* ignore */
        }
      }
    }
    this.stream = null;
    this.track = null;
    this.torchOn = false;
    if (this.video) {
      try {
        this.video.pause();
      } catch {
        /* ignore */
      }
      this.video.srcObject = null;
    }
    this.onStatus('idle');
  }

  capabilities() {
    const track = this.track;
    if (!track || typeof track.getCapabilities !== 'function') {
      return { torch: false, zoom: null, deviceId: this.deviceId };
    }
    let caps = {};
    try {
      caps = track.getCapabilities() || {};
    } catch {
      caps = {};
    }
    return {
      torch: Boolean(caps.torch),
      zoom:
        caps.zoom && Number.isFinite(caps.zoom.min) && Number.isFinite(caps.zoom.max)
          ? { min: caps.zoom.min, max: caps.zoom.max, step: caps.zoom.step || 0.1 }
          : null,
      deviceId: this.deviceId
    };
  }

  async setTorch(on) {
    if (!this.track || typeof this.track.applyConstraints !== 'function') return false;
    try {
      await this.track.applyConstraints({ advanced: [{ torch: Boolean(on) }] });
      this.torchOn = Boolean(on);
      return true;
    } catch {
      return false;
    }
  }

  async setZoom(value) {
    if (!this.track || typeof this.track.applyConstraints !== 'function') return false;
    const zoom = Number(value);
    if (!Number.isFinite(zoom)) return false;
    try {
      await this.track.applyConstraints({ advanced: [{ zoom }] });
      return true;
    } catch {
      return false;
    }
  }

  async listCameras() {
    if (!navigator.mediaDevices || typeof navigator.mediaDevices.enumerateDevices !== 'function') {
      return [];
    }
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return devices
        .filter((device) => device.kind === 'videoinput')
        .map((device, index) => ({
          id: device.deviceId,
          label: device.label || `Camera ${index + 1}`
        }));
    } catch {
      return [];
    }
  }
}

async function decodeSource(source, width, height, maxSide = 1400) {
  const canvas = document.createElement('canvas');
  const scale = Math.min(1, maxSide / Math.max(width, height));
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new ScanError('IMAGE');
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const jsQR = globalThis.jsQR;
  if (typeof jsQR !== 'function') throw new ScanError('GENERIC');
  const result = jsQR(imageData.data, canvas.width, canvas.height, {
    inversionAttempts: 'attemptBoth'
  });
  return result && result.data ? result.data : '';
}

/** Decodifica un'immagine caricata o trascinata. */
export async function scanImageFile(file) {
  if (!file || !/^image\//.test(file.type || '')) throw new ScanError('IMAGE');
  const source = await imageFromFile(file);
  const width = source.width || source.naturalWidth || 0;
  const height = source.height || source.naturalHeight || 0;
  if (!width || !height) throw new ScanError('IMAGE');
  try {
    return await decodeSource(source, width, height);
  } finally {
    if (source.close) source.close();
  }
}
