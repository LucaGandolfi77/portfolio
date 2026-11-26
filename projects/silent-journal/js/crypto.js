/**
 * Silent Journal — Crypto (Web Crypto SubtleCrypto, zero external deps)
 * AES-256-GCM per voce. Chiave derivata dalla passphrase con PBKDF2.
 *
 * Il sale PBKDF2 e un "verificatore" (una stringa cifrata nota) vengono
 * salvati in localStorage: senza il sale stabile la chiave non si puo' ricreare
 * dopo un ricaricamento, e le voci risulterebbero illeggibili.
 * Il sale non e' segreto; la segretezza sta nella passphrase.
 */

const META_KEY = 'sj_meta_v1';
const CHECK_TEXT = 'silent-journal-ok';
const ITERATIONS = 100000;

function bytesToB64(bytes) {
  let s = '';
  // a blocchi: String.fromCharCode(...bytes) su testi lunghi supera lo stack
  for (let i = 0; i < bytes.length; i += 0x8000) {
    s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  }
  return btoa(s);
}

function b64ToBytes(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

const Crypto = {
  key: null,

  readMeta() {
    try { return JSON.parse(localStorage.getItem(META_KEY) || 'null'); } catch (e) { return null; }
  },

  async deriveKey(pw, salt) {
    const base = await crypto.subtle.importKey('raw', new TextEncoder().encode(pw), { name: 'PBKDF2' }, false, ['deriveKey']);
    return crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
    );
  },

  /**
   * Sblocca il diario. Al primo utilizzo crea sale e verificatore; dopo,
   * controlla la passphrase contro il verificatore. Lancia errore se errata.
   * Ritorna 'created' oppure 'unlocked'.
   */
  async unlock(pw) {
    const meta = this.readMeta();
    if (!meta) {
      const salt = crypto.getRandomValues(new Uint8Array(16));
      const key = await this.deriveKey(pw, salt);
      this.key = key;
      const check = await this.encrypt(CHECK_TEXT);
      localStorage.setItem(META_KEY, JSON.stringify({ salt: bytesToB64(salt), check }));
      return 'created';
    }
    const key = await this.deriveKey(pw, b64ToBytes(meta.salt));
    this.key = key;
    try {
      const ok = await this.decrypt(meta.check);
      if (ok !== CHECK_TEXT) throw new Error('bad check');
    } catch (e) {
      this.key = null;
      throw new Error('Passphrase errata');
    }
    return 'unlocked';
  },

  async encrypt(text) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const buf = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, this.key, new TextEncoder().encode(text));
    const combined = new Uint8Array(iv.length + buf.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(buf), iv.length);
    return bytesToB64(combined);
  },

  async decrypt(b64) {
    const raw = b64ToBytes(b64);
    const dec = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: raw.slice(0, 12) }, this.key, raw.slice(12));
    return new TextDecoder().decode(dec);
  }
};
