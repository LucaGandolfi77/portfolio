/* ============================================================
   Bar Blu — story runner (pure)
   ------------------------------------------------------------
   Steps through the parsed script and hands the UI one event at
   a time: a line to show, a stage command to perform, a set of
   choices. Conditions and effects use a tiny safe expression
   language (no eval): numbers, 'strings', true/false, variables,
   trust.<who>, seen.<scene>, ! && || == != < <= > >= + - ( ).
   ============================================================ */

/* ---------------- expressions ---------------- */

const TOKEN = /\s*(\d+(?:\.\d+)?|'[^']*'|"[^"]*"|[A-Za-z_][\w.]*|&&|\|\||==|!=|>=|<=|[-+!<>()])/y;

function tokenize(src) {
  const out = [];
  TOKEN.lastIndex = 0;
  let pos = 0;
  while (pos < src.length) {
    if (/^\s*$/.test(src.slice(pos))) break;
    TOKEN.lastIndex = pos;
    const m = TOKEN.exec(src);
    if (!m) throw new Error(`bad expression "${src}" at ${pos}`);
    out.push(m[1]);
    pos = TOKEN.lastIndex;
  }
  return out;
}

export function evaluate(src, lookup) {
  const toks = tokenize(src);
  let i = 0;
  const peek = () => toks[i];
  const take = () => toks[i++];
  const primary = () => {
    const t = take();
    if (t === undefined) throw new Error(`unexpected end in "${src}"`);
    if (t === '(') { const v = or(); if (take() !== ')') throw new Error(`missing ) in "${src}"`); return v; }
    if (t === '!') return !primary();
    if (t === '-') return -primary();
    if (/^\d/.test(t)) return Number(t);
    if (t[0] === "'" || t[0] === '"') return t.slice(1, -1);
    if (t === 'true') return true;
    if (t === 'false') return false;
    if (/^[A-Za-z_]/.test(t)) return lookup(t);
    throw new Error(`unexpected "${t}" in "${src}"`);
  };
  const sum = () => {
    let v = primary();
    while (peek() === '+' || peek() === '-') v = take() === '+' ? v + primary() : v - primary();
    return v;
  };
  const cmp = () => {
    let v = sum();
    while (['==', '!=', '<', '<=', '>', '>='].includes(peek())) {
      const op = take();
      const r = sum();
      // eslint-disable-next-line eqeqeq
      v = op === '==' ? v == r : op === '!=' ? v != r : op === '<' ? v < r : op === '<=' ? v <= r : op === '>' ? v > r : v >= r;
    }
    return v;
  };
  const and = () => { let v = cmp(); while (peek() === '&&') { take(); const r = cmp(); v = v && r; } return v; };
  function or() { let v = and(); while (peek() === '||') { take(); const r = and(); v = v || r; } return v; }
  const v = or();
  if (i < toks.length) throw new Error(`trailing "${toks[i]}" in "${src}"`);
  return v;
}

/* ---------------- state ---------------- */

export function newStoryState() {
  return { knot: null, vars: {}, trust: {}, seen: {}, picked: {}, log: [] };
}

function makeLookup(state) {
  return (name) => {
    if (name.startsWith('trust.')) return state.trust[name.slice(6)] || 0;
    if (name.startsWith('seen.')) return state.seen[name.slice(5)] || 0;
    const v = state.vars[name];
    return v === undefined ? 0 : v;
  };
}

/** "x = 3; trust.ugo += 1; flag; !flag" */
export function applyEffect(state, expr) {
  const lookup = makeLookup(state);
  for (const part of expr.split(';').map((s) => s.trim()).filter(Boolean)) {
    const m = /^([\w.]+)\s*(=|\+=|-=)\s*(.+)$/.exec(part);
    let name, value;
    if (m) {
      name = m[1];
      const rhs = evaluate(m[3], lookup);
      const cur = lookup(name);
      value = m[2] === '=' ? rhs : m[2] === '+=' ? Number(cur) + Number(rhs) : Number(cur) - Number(rhs);
    } else if (/^!?[\w.]+$/.test(part)) {
      name = part.replace(/^!/, '');
      value = !part.startsWith('!');
    } else throw new Error(`bad effect "${part}"`);
    if (name.startsWith('trust.')) state.trust[name.slice(6)] = Math.max(-3, Math.min(6, Number(value)));
    else if (name.startsWith('seen.')) throw new Error('seen.* is read-only');
    else state.vars[name] = value;
  }
}

/** Replaces {name} in text with variable values (unknown names are left alone). */
export function interpolate(text, state) {
  const lookup = makeLookup(state);
  return text.replace(/\{([\w.]+)\}/g, (all, name) => {
    if (name.startsWith('trust.') || name.startsWith('seen.') || name in state.vars) return String(lookup(name));
    return all;
  });
}

/* ---------------- runner ---------------- */

export class Runner {
  constructor(script, state = newStoryState()) {
    this.knots = script.knots;
    this.state = state;
    this.stack = [];
    this.pending = null;      // choice node waiting for an answer
    this.onKnot = null;       // called with the scene name on every scene change
  }

  test(cond) {
    return !cond || !!evaluate(cond, makeLookup(this.state));
  }

  goto(target) {
    if (!this.knots[target]) throw new Error(`unknown scene "${target}"`);
    this.stack = [{ nodes: this.knots[target], i: 0 }];
    this.pending = null;
    this.state.knot = target;
    this.state.seen[target] = (this.state.seen[target] || 0) + 1;
    if (this.onKnot) this.onKnot(target);
  }

  /** The next event: { t:'say'|'narr'|'cmd'|'choices'|'end' , … } */
  next() {
    if (this.pending) return this.pending.event;
    for (;;) {
      const frame = this.stack[this.stack.length - 1];
      if (!frame) return { t: 'end', reason: 'fallthrough', knot: this.state.knot };
      if (frame.i >= frame.nodes.length) { this.stack.pop(); continue; }
      const node = frame.nodes[frame.i++];
      if (node.cond && !this.test(node.cond)) continue;
      switch (node.t) {
        case 'goto': this.goto(node.target); break;
        case 'fx': applyEffect(this.state, node.expr); break;
        case 'say':
          return { t: 'say', who: node.who, dir: node.dir, text: interpolate(node.text, this.state) };
        case 'narr':
          return { t: 'narr', text: interpolate(node.text, this.state) };
        case 'cmd':
          if (node.name === 'end') return { t: 'end', reason: node.args[0] || 'end', knot: this.state.knot };
          return { t: 'cmd', name: node.name, args: node.args.map((a) => interpolate(a, this.state)) };
        case 'choice': {
          const options = [];
          node.options.forEach((o, idx) => {
            const key = `${o.where}`;
            if (o.kind === 'once' && this.state.picked[key]) return;
            if (!this.test(o.cond)) return;
            options.push({ index: idx, text: interpolate(o.text, this.state), kind: o.kind });
          });
          if (!options.length) continue;
          const event = { t: 'choices', options, drink: options.every((o) => o.kind === 'drink') };
          this.pending = { node, event };
          return event;
        }
        default: throw new Error(`unknown node ${node.t}`);
      }
    }
  }

  /** Answers the pending choice with one of its option indexes. */
  choose(index) {
    if (!this.pending) throw new Error('no choice pending');
    const opt = this.pending.node.options[index];
    if (!opt) throw new Error(`no option ${index}`);
    this.pending = null;
    this.state.picked[opt.where] = true;
    this.state.vars.last = opt.text;
    this.stack.push({ nodes: opt.body, i: 0 });
  }
}
