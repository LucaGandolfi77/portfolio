/* CelloOS — path-based virtual file system backed by localStorage */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};
  var KEY = 'cello.os.vfs';
  var MAX_BYTES = 900000;

  function dir(children) { return { type: 'dir', children: children || {}, mtime: Date.now() }; }
  function file(content) { return { type: 'file', content: String(content || ''), mtime: Date.now() }; }

  function seed() {
    var root = dir({
      Cello: dir({
        Documents: dir({
          'WELCOME.TXT': file('BENVENUTO IN CELLOS!\n\nQuesto e un file di testo reale nel file system virtuale.\nAprilo con il Blocco note, modificalo e salva.\n\nBuon divertimento — 1994.\n'),
          'NOTE.TXT': file('Appunti\n=======\n\n- Esplora il desktop\n- Apri il browser Cello\n- Prova il terminale: help\n')
        }),
        Web: dir({
          'HOME.HTML': file('<h1>Home personale</h1><p>Pagina scritta dall’utente.</p>')
        })
      })
    });
    return root;
  }

  var root;
  function load() {
    try {
      var raw = localStorage.getItem(KEY);
      root = raw ? JSON.parse(raw) : seed();
    } catch (e) { root = seed(); }
    if (!root || root.type !== 'dir') root = seed();
    try { localStorage.setItem(KEY, JSON.stringify(root)); } catch (e) {}
    return root;
  }
  function persist() {
    try { localStorage.setItem(KEY, JSON.stringify(root)); }
    catch (e) { O.bus.emit('notify', { text: 'Spazio su disco esaurito', kind: 'error' }); }
  }
  function parts(path) {
    return String(path || '/').replace(/^\/+/, '').replace(/\/+$/, '').split('/').filter(Boolean);
  }
  function get(path) {
    var node = root, p = parts(path);
    for (var i = 0; i < p.length; i++) {
      if (!node || node.type !== 'dir' || !node.children[p[i]]) return null;
      node = node.children[p[i]];
    }
    return node;
  }
  function parentOf(path) {
    var p = parts(path), name = p.pop();
    return { parent: get('/' + p.join('/')), name: name };
  }
  function ls(path) {
    var node = get(path);
    if (!node || node.type !== 'dir') return [];
    return Object.keys(node.children).map(function (name) {
      var n = node.children[name];
      return { name: name, type: n.type, mtime: n.mtime, size: n.type === 'file' ? n.content.length : 0 };
    }).sort(function (a, b) {
      if (a.type !== b.type) return a.type === 'dir' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }
  function read(path) { var n = get(path); return n && n.type === 'file' ? n.content : null; }
  function write(path, content) {
    var target = parentOf(path);
    if (!target.parent || target.parent.type !== 'dir' || !target.name) return false;
    var existing = target.parent.children[target.name];
    if (existing && existing.type === 'dir') return false;
    var bytes = JSON.stringify(root).length + String(content).length;
    if (bytes > MAX_BYTES) { O.bus.emit('notify', { text: 'Disco pieno', kind: 'error' }); return false; }
    target.parent.children[target.name] = file(content);
    persist();
    O.bus.emit('vfs:change', { path: path, action: 'write' });
    return true;
  }
  function mkdir(path) {
    var target = parentOf(path);
    if (!target.parent || target.parent.type !== 'dir' || get(path)) return false;
    target.parent.children[target.name] = dir();
    persist();
    O.bus.emit('vfs:change', { path: path, action: 'mkdir' });
    return true;
  }
  function rm(path) {
    var target = parentOf(path);
    if (!target.parent || !target.parent.children[target.name]) return false;
    delete target.parent.children[target.name];
    persist();
    O.bus.emit('vfs:change', { path: path, action: 'rm' });
    return true;
  }
  function mv(from, to) {
    var content = read(from);
    if (content === null) return false;
    if (!write(to, content)) return false;
    return rm(from);
  }
  function exists(path) { return !!get(path); }
  function allFiles(node, base, out) {
    node = node || root; base = base || ''; out = out || [];
    if (node.type === 'file') { out.push(base); return out; }
    Object.keys(node.children).forEach(function (name) {
      allFiles(node.children[name], base + '/' + name, out);
    });
    return out;
  }

  load();
  O.vfs = {
    root: function () { return root; }, ls: ls, read: read, write: write, mkdir: mkdir,
    rm: rm, mv: mv, get: get, exists: exists, files: function () { return allFiles(); },
    norm: function (p) { return '/' + parts(p).join('/'); }, seed: function () { root = seed(); persist(); }
  };
}());
