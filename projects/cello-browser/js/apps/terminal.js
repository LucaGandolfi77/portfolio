/* CelloOS — faux terminal operating on VFS */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};

  function create(root) {
    var cwd = '/';
    root.innerHTML = '<div class="term" data-el="out"></div>' +
      '<div class="term" style="height:auto;padding-top:0"><span data-el="prompt">C:\\&gt;</span> <input data-el="cmd" autocomplete="off" spellcheck="false" aria-label="Comando"></div>';
    var out = root.querySelector('[data-el="out"]'), input = root.querySelector('[data-el="cmd"]');
    var prompt = root.querySelector('[data-el="prompt"]');
    function write(text, cls) {
      var d = document.createElement('div');
      if (cls) d.className = cls;
      d.textContent = text;
      out.appendChild(d); out.scrollTop = out.scrollHeight;
    }
    function updatePrompt() { prompt.textContent = 'Cello:' + cwd + '>'; }
    function resolve(arg) {
      if (!arg) return cwd;
      if (arg.charAt(0) === '/') return O.vfs.norm(arg);
      return O.vfs.norm(cwd + '/' + arg);
    }
    function run(line) {
      write(prompt.textContent + ' ' + line);
      var parts = line.trim().split(/\s+/), cmd = (parts.shift() || '').toLowerCase();
      if (!cmd) return;
      if (cmd === 'help') write('comandi: help, ls, cd, pwd, cat, echo, mkdir, rm, open, date, ver, whoami, clear');
      else if (cmd === 'ls') O.vfs.ls(cwd).forEach(function (f) { write((f.type === 'dir' ? '<DIR> ' : '      ') + f.name); });
      else if (cmd === 'cd') {
        var target = resolve(parts[0]);
        var node = O.vfs.get(target);
        if (!node || node.type !== 'dir') write('Percorso non valido: ' + target);
        else { cwd = target; updatePrompt(); }
      }
      else if (cmd === 'pwd') write(cwd);
      else if (cmd === 'cat') {
        var p = resolve(parts[0]), txt = O.vfs.read(p);
        write(txt === null ? 'File non trovato' : txt);
      }
      else if (cmd === 'echo') {
        var rest = line.replace(/^echo\s*/i, '');
        var m = rest.match(/^(.+?)\s*>\s*(.+)$/);
        if (m) { write(O.vfs.write(resolve(m[2]), m[1]) ? 'OK' : 'Errore'); }
        else write(rest);
      }
      else if (cmd === 'mkdir') write(O.vfs.mkdir(resolve(parts[0])) ? 'OK' : 'Errore');
      else if (cmd === 'rm') write(O.vfs.rm(resolve(parts[0])) ? 'OK' : 'Errore');
      else if (cmd === 'open') {
        var app = parts[0];
        if (O.wm.apps[app]) { O.wm.openApp(app); write('Avvio ' + app + '…'); }
        else write('Programma sconosciuto: ' + app);
      }
      else if (cmd === 'date') write(new Date().toLocaleString());
      else if (cmd === 'ver') write('CelloOS 1.0 (1994 Edition)');
      else if (cmd === 'whoami') write('utente');
      else if (cmd === 'clear') out.innerHTML = '';
      else write('Comando sconosciuto: ' + cmd + ' — digita help');
    }
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { var v = input.value; input.value = ''; run(v); }
    });
    write('CelloOS [Versione 1.0]');
    write('Digitare HELP per l’elenco dei comandi.');
    updatePrompt();
    setTimeout(function () { input.focus(); }, 60);
    return {};
  }
  O.wm.register('terminal', { title: 'Terminale Cello', icon: '▮', create: create });
}());
