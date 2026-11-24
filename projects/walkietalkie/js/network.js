/* Walkie Talkie — PeerJS mesh networking with host coordination */

const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

export function randomChannel(length = 4) {
  let out = '';
  for (let i = 0; i < length; i++) out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return out;
}

export class WalkieNetwork {
  constructor(handlers, settings) {
    this.h = handlers;
    this.settings = settings;
    this.peer = null;
    this.channel = '';
    this.isHost = false;
    this.selfId = null;
    this.hostId = null;
    this.localStream = null;
    this.records = new Map();
    this.pendingData = new Set();
    this.pendingCall = new Set();
    this.closed = false;
  }

  options() {
    const s = this.settings;
    const opts = {
      debug: 0,
      config: { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] }
    };
    if (s.signalingHost && s.signalingHost !== '0.peerjs.com') {
      opts.host = s.signalingHost;
      opts.port = Number(s.signalingPort) || 443;
      opts.secure = !!s.signalingSecure;
      opts.path = s.signalingPath || '/';
    }
    return opts;
  }

  record(id) {
    if (!this.records.has(id)) this.records.set(id, { id, data: null, call: null, stream: null });
    return this.records.get(id);
  }

  async startHost(localStream) {
    this.isHost = true;
    this.localStream = localStream;
    this.closed = false;
    this.channel = randomChannel();
    this.hostId = this.channel;
    this.peer = new Peer(this.channel, this.options());
    this.bind();
    return this.channel;
  }

  async join(channel, localStream) {
    this.isHost = false;
    this.localStream = localStream;
    this.closed = false;
    this.channel = String(channel || '').toUpperCase().trim();
    this.hostId = this.channel;
    this.peer = new Peer(undefined, this.options());
    this.bind();
    return this.channel;
  }

  bind() {
    this.peer.on('open', id => {
      this.selfId = id;
      this.h.onSelf?.(id);
      this.h.onStatus?.(this.isHost ? 'listening' : 'connecting');
      if (!this.isHost) this.forceConnect(this.hostId);
    });
    this.peer.on('connection', conn => this.incomingData(conn));
    this.peer.on('call', call => this.incomingCall(call));
    this.peer.on('error', err => {
      const msg = String(err?.message || err);
      if (/not found|unavailable/i.test(msg)) this.h.onError?.('noPeer');
      else this.h.onError?.(msg);
    });
    this.peer.on('disconnected', () => {
      this.h.onStatus?.('connecting');
      try { this.peer?.reconnect(); } catch (e) {}
    });
    this.peer.on('close', () => this.h.onStatus?.('offline'));
  }

  /* A joiner always opens a data channel and a call to the host. */
  forceConnect(id) {
    if (!id || id === this.selfId || this.closed) return;
    const rec = this.record(id);
    if (!rec.data && !this.pendingData.has(id)) {
      this.pendingData.add(id);
      const conn = this.peer.connect(id);
      this.setupData(conn, id);
    }
    if (!rec.call && !this.pendingCall.has(id)) {
      this.pendingCall.add(id);
      const call = this.peer.call(id, this.localStream);
      this.setupCall(call, id);
    }
  }

  /* For peer↔peer links only the lexicographically smaller ID initiates. */
  ensure(id) {
    if (!id || id === this.selfId || id === this.hostId || this.closed) return;
    if (this.selfId > id) return;
    this.forceConnect(id);
  }

  setupData(conn, id) {
    const rec = this.record(id);
    rec.data = conn;
    conn.on('open', () => {
      this.send(conn, { type: 'hello', senderId: this.selfId, channel: this.channel });
      if (this.isHost) {
        const others = [...this.records.keys()].filter(x => x !== id && x !== this.selfId);
        this.send(conn, { type: 'peers', ids: others });
        this.broadcast({ type: 'peer_join', peerId: id }, id);
      }
      this.h.onPeers?.(this.records.size);
      this.h.onStatus?.('connected');
    });
    conn.on('data', data => this.onData(data, conn));
    conn.on('close', () => this.remove(id));
    conn.on('error', () => this.remove(id));
  }

  incomingData(conn) {
    this.setupData(conn, conn.peer);
  }

  onData(data, conn) {
    if (!data || typeof data !== 'object') return;
    const from = data.senderId || conn.peer;
    switch (data.type) {
      case 'hello':
        this.record(conn.peer).name = data.name || '';
        break;
      case 'peers':
        (data.ids || []).forEach(id => this.ensure(id));
        break;
      case 'peer_join':
        if (data.peerId && data.peerId !== this.selfId) this.ensure(data.peerId);
        break;
      case 'peer_leave':
        if (data.peerId) this.remove(data.peerId, false);
        break;
      case 'talking_start':
        this.h.onTalking?.(from, true);
        break;
      case 'talking_end':
        this.h.onTalking?.(from, false);
        break;
      case 'chat':
        this.h.onChat?.(from, String(data.text || '').slice(0, 300));
        break;
    }
  }

  incomingCall(call) {
    if (!this.localStream) { call.close(); return; }
    call.answer(this.localStream);
    this.setupCall(call, call.peer);
  }

  setupCall(call, id) {
    const rec = this.record(id);
    rec.call = call;
    const timer = setTimeout(() => {
      if (!rec.stream) { try { call.close(); } catch (e) {} }
    }, 15000);
    call.on('stream', stream => {
      clearTimeout(timer);
      rec.stream = stream;
      this.h.onStream?.(id, stream);
      this.h.onPeers?.(this.records.size);
      this.h.onStatus?.('connected');
    });
    call.on('close', () => { clearTimeout(timer); this.remove(id); });
    call.on('error', () => { clearTimeout(timer); this.remove(id); });
  }

  remove(id, broadcast = true) {
    const rec = this.records.get(id);
    if (!rec) return;
    try { rec.data?.close(); } catch (e) {}
    try { rec.call?.close(); } catch (e) {}
    this.records.delete(id);
    this.pendingData.delete(id);
    this.pendingCall.delete(id);
    if (this.isHost && broadcast) this.broadcast({ type: 'peer_leave', peerId: id });
    this.h.onLeave?.(id);
    this.h.onPeers?.(this.records.size);
  }

  send(conn, msg) {
    if (conn?.open) { try { conn.send(msg); } catch (e) {} }
  }

  broadcast(msg, exclude = null) {
    this.records.forEach((rec, id) => {
      if (id !== exclude) this.send(rec.data, msg);
    });
  }

  sendTalking(active) {
    this.broadcast({ type: active ? 'talking_start' : 'talking_end', senderId: this.selfId });
  }

  sendChat(text) {
    const clean = String(text || '').trim().slice(0, 300);
    if (!clean) return;
    this.broadcast({ type: 'chat', senderId: this.selfId, text: clean });
    return clean;
  }

  close() {
    this.closed = true;
    this.records.forEach((rec, id) => this.remove(id, false));
    try { this.peer?.destroy(); } catch (e) {}
    this.peer = null;
    this.selfId = null;
    this.records.clear();
    this.h.onStatus?.('offline');
  }
}
