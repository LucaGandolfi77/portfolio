/* Offline Editor Studio — file import/export and helpers */

export const ACCEPT = '.txt,.js,.mjs,.ts,.jsx,.tsx,.py,.md,.html,.css,.json,.xml,.yml,.yaml,.csv,.sh';

const EXT_LANG = {
  js: 'JavaScript', mjs: 'JavaScript', ts: 'TypeScript', jsx: 'JavaScript', tsx: 'TypeScript',
  py: 'Python', md: 'Markdown', html: 'HTML', css: 'CSS', json: 'JSON',
  xml: 'XML', yml: 'YAML', yaml: 'YAML', csv: 'CSV', sh: 'Shell', txt: 'Text'
};

export function inferLanguage(name) {
  const ext = String(name || '').split('.').pop().toLowerCase();
  return EXT_LANG[ext] || 'Text';
}

export function sanitizeName(name) {
  const clean = String(name || '').trim().replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, ' ');
  return clean.slice(0, 80) || 'untitled.txt';
}

export function uniqueName(docs, desired) {
  const name = sanitizeName(desired);
  if (!docs.some(d => d.name === name)) return name;
  const dot = name.lastIndexOf('.');
  const stem = dot > 0 ? name.slice(0, dot) : name;
  const ext = dot > 0 ? name.slice(dot) : '';
  let i = 2;
  while (docs.some(d => d.name === `${stem} (${i})${ext}`)) i++;
  return `${stem} (${i})${ext}`;
}

export class FileManager {
  constructor(storage) {
    this.storage = storage;
  }

  async import(file) {
    if (!file) return null;
    const text = await file.text();
    const name = uniqueName(this.storage.data.docs, file.name || 'imported.txt');
    return this.storage.addDoc(name, text);
  }

  download(doc) {
    if (!doc) return;
    let name = sanitizeName(doc.name);
    if (!name.includes('.')) name += '.txt';
    const blob = new Blob([doc.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  bookmarkFromEditor(editor) {
    const { line, col } = editor.caret();
    const lines = editor.getValue().split('\n');
    const preview = (lines[line - 1] || '').trim().slice(0, 80) || '—';
    this.storage.addBookmark({
      docId: this.storage.data.activeId,
      docName: this.storage.activeDoc.name,
      line,
      col,
      preview
    });
  }
}
