/* Offline Editor Studio — editor surface with a local syntax highlighter */

const TOKEN_RE = /(\/\/[^\n]*|#[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\b\d+(?:\.\d+)?\b)|(\b(?:function|const|let|var|return|if|else|for|while|class|import|export|from|new|try|catch|finally|throw|await|async|def|elif|pass|lambda|with|as|in|is|not|and|or|None|True|False|self|public|private|static|void|this|null|undefined|true|false|break|continue|switch|case|default|typeof|interface|type|enum)\b)/g;

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function highlight(src) {
  let out = '';
  let last = 0;
  let m;
  TOKEN_RE.lastIndex = 0;
  while ((m = TOKEN_RE.exec(src))) {
    out += esc(src.slice(last, m.index));
    const text = m[0];
    let cls = '';
    if (m[1]) {
      const lineStart = src.lastIndexOf('\n', m.index - 1) + 1;
      const prefix = src.slice(lineStart, m.index);
      cls = (text[0] === '#' && !/^[ \t]*$/.test(prefix)) ? '' : 'tok-comment';
    } else if (m[2]) cls = 'tok-string';
    else if (m[3]) cls = 'tok-number';
    else if (m[4]) cls = 'tok-keyword';
    out += cls ? `<span class="${cls}">${esc(text)}</span>` : esc(text);
    last = m.index + text.length;
  }
  out += esc(src.slice(last));
  return out + '\n';
}

export class Editor {
  constructor({ textarea, pre, gutter, onChange, onCaret }) {
    this.ta = textarea;
    this.pre = pre;
    this.gutter = gutter;
    this.onChange = onChange;
    this.onCaret = onCaret;
    this.language = 'Text';

    this.ta.addEventListener('input', () => {
      this.render();
      this.onChange && this.onChange();
    });
    this.ta.addEventListener('scroll', () => this.syncScroll());
    ['click', 'keyup', 'select', 'focus'].forEach(evt => {
      this.ta.addEventListener(evt, () => this.onCaret && this.onCaret(this.caret()));
    });
    this.ta.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        e.preventDefault();
        this.insert('  ');
      }
    });
  }

  getValue() { return this.ta.value; }

  setValue(value) {
    this.ta.value = value || '';
    this.render();
    this.ta.scrollTop = 0;
    this.ta.scrollLeft = 0;
    this.syncScroll();
    this.onCaret && this.onCaret(this.caret());
  }

  setLanguage(language) { this.language = language; }

  render() {
    const value = this.getValue();
    this.pre.innerHTML = highlight(value);
    const count = value.split('\n').length;
    this.gutter.textContent = Array.from({ length: count }, (_, i) => i + 1).join('\n');
    this.syncScroll();
  }

  syncScroll() {
    this.pre.scrollTop = this.ta.scrollTop;
    this.pre.scrollLeft = this.ta.scrollLeft;
    this.gutter.scrollTop = this.ta.scrollTop;
  }

  caret() {
    const pos = this.ta.selectionStart;
    const before = this.ta.value.slice(0, pos);
    return {
      line: before.split('\n').length,
      col: before.length - before.lastIndexOf('\n')
    };
  }

  insert(text) {
    const start = this.ta.selectionStart;
    const end = this.ta.selectionEnd;
    this.ta.setRangeText(text, start, end, 'end');
    this.ta.dispatchEvent(new Event('input'));
  }

  jumpToLine(line, col = 1) {
    const lines = this.ta.value.split('\n');
    const target = Math.max(1, Math.min(lines.length, line | 0));
    let offset = 0;
    for (let i = 0; i < target - 1; i++) offset += lines[i].length + 1;
    offset += Math.min(Math.max(0, col - 1), lines[target - 1].length);
    this.ta.focus();
    this.ta.setSelectionRange(offset, offset);
    const lineHeight = parseFloat(getComputedStyle(this.ta).lineHeight) || 24;
    this.ta.scrollTop = Math.max(0, (target - 3) * lineHeight);
    this.syncScroll();
  }

  focus() { this.ta.focus(); }
}
