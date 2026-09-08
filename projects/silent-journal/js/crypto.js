/**
 * Silent Journal — Crypto (Web Crypto SubtleCrypto, zero external deps)
 * AES-256-GCM, chiave derivata da passphrase via PBKDF2
 */

const Crypto = {
  key: null,
  salt: null,

  async setPassphrase(pw) {
    const enc = new TextEncoder();
    const base = await window.crypto.subtle.importKey(
      'raw', enc.encode(pw), { name: 'PBKDF2' }, false, ['deriveKey']
    );
    this.salt = window.crypto.getRandomValues(new Uint8Array(16));
    this.key = await window.crypto.subtle.deriveKey(
      { name: 'PBKDF2', salt: this.salt, iterations: 100000, hash: 'SHA-256' },
      base, { name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']
    );
    return true;
  },

  async encrypt(text) {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const buf = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv }, this.key, enc.encode(text)
    );
    const combined = new Uint8Array(iv.length + buf.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(buf), iv.length);
    return btoa(String.fromCharCode(...combined));
  },

  async decrypt(b64) {
    const raw = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
    const iv = raw.slice(0, 12);
    const data = raw.slice(12);
    const dec = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv }, this.key, data
    );
    return new TextDecoder().decode(dec);
  }
};
