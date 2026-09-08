const gid = id => document.getElementById(id);
const Editor = {
  highlight(txt) {
    return txt.replace(/(function|const|let|var|return|if|else|for|while|class|import|export|from|new|try|catch|await|async)\b/g, '<span style="color:#e0a800;font-weight:bold">$1</span>');
  },
  init() {
    gid('btn-save').addEventListener('click', () => {
      const text = gid('code').value; const blob = new Blob([text], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'edit.txt'; a.click(); URL.revokeObjectURL(url);
    });
    gid('btn-bm').addEventListener('click', () => { const line = gid('code').selectionStart; const bm = { line, text: gid('code').value.substring(line, line + 200), saved: new Date().toISOString() }; const list = gid('file-list'); const item = document.createElement('li'); item.className = 'file-item'; item.textContent = 'Bookmark linea ' + (line > 0 ? Math.round(line / gid('code').value.split('\n').length * 100) : 1) + '%'; list.appendChild(item); });
    gid('file-in').addEventListener('change', async e => { const f = e.target.files[0]; if (!f) return; const text = await f.text(); gid('code').value = text; gid('tab-editor').click(); });
    document.getElementById('theme-dark').addEventListener('click', () => { document.documentElement.style.setProperty('--bg', '#141824'); document.documentElement.style.setProperty('--surface', '#1e2330'); gid('code').style.background = '#1e2330'; gid('code').style.color = '#e8e8f0'; });
    document.getElementById('theme-light').addEventListener('click', () => { document.documentElement.style.setProperty('--bg', '#f5f2eb'); document.documentElement.style.setProperty('--surface', '#fff'); gid('code').style.background = '#fff'; gid('code').style.color = '#18122a'; });
    document.querySelectorAll('.tab').forEach(t => t.addEventListener('click', () => { document.querySelectorAll('.tab').forEach(x => x.classList.remove('active')); t.classList.add('active'); document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active')); gid('tab-' + t.dataset.tab).classList.add('active'); }));
  }
};
document.addEventListener('DOMContentLoaded', () => Editor.init());
