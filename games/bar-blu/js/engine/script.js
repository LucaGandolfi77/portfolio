/* ============================================================
   Bar Blu — script parser (pure)
   ------------------------------------------------------------
   The story is written as plain text, one file per night:

     === knot_name             a scene
     @bg bar-notte             a stage command (handled by the UI)
     LUCA: Testo               a spoken line (speaker in capitals)
     LUCA (piano): Testo       …with a stage direction
     > Testo                   narration (the ">" is optional)
     ~ trust.ugo += 1          an effect on the story state
     -> altro_knot             go to another scene
     {cond} riga               any line can be conditional
     * [Scelta] -> knot        a choice (indented lines are its body)
     + [☕ Caffè]               a drink served at the counter
     - [Domanda]               a choice that disappears once taken

   After a block of choices has run its body, the story carries on
   with the first line below the block ("gather").
   ============================================================ */

const SAY = /^([A-ZÀ-ÖØ-Þ][A-ZÀ-ÖØ-Þ' .]{0,30}?)\s*(?:\(([^)]*)\))?:\s+(.*)$/;
const CHOICE = /^([*+-])\s+(?:\{([^}]*)\}\s*)?\[([^\]]*)\]\s*(?:->\s*([\w.]+))?\s*$/;

/** Splits "a 'b c' d" into ['a', 'b c', 'd']. */
export function splitArgs(text) {
  const out = [];
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g;
  let m;
  while ((m = re.exec(text))) out.push(m[1] ?? m[2] ?? m[3]);
  return out;
}

/** Peels a leading "{condition}" off a line. */
function takeCond(text) {
  if (!text.startsWith('{')) return { cond: null, rest: text };
  let depth = 0;
  for (let i = 0; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}' && --depth === 0) return { cond: text.slice(1, i).trim(), rest: text.slice(i + 1).trim() };
  }
  return { cond: null, rest: text };
}

function parseLine(text, where) {
  if (text.startsWith('{')) {
    const { cond, rest } = takeCond(text);
    if (cond !== null && !rest.startsWith('[')) {
      const node = parseLine(rest, where);
      node.cond = cond;
      return node;
    }
  }
  if (text.startsWith('->')) return { t: 'goto', target: text.slice(2).trim(), where };
  if (text.startsWith('~')) return { t: 'fx', expr: text.slice(1).trim(), where };
  if (text.startsWith('@')) {
    const [name, ...args] = splitArgs(text.slice(1));
    return { t: 'cmd', name, args, where };
  }
  const say = SAY.exec(text);
  if (say) return { t: 'say', who: say[1].trim().toLowerCase(), dir: say[2] || null, text: say[3], where };
  return { t: 'narr', text: text.replace(/^>\s?/, ''), where };
}

/**
 * Parses one or more script sources into { knots: { name: [nodes] }, order: [names] }.
 * Throws with file:line on a malformed line.
 */
export function parseScript(sources) {
  const knots = {};
  const order = [];
  for (const [file, src] of Object.entries(sources)) {
    const lines = src.split('\n').map((raw, i) => ({
      raw: raw.replace(/\s+$/, ''),
      indent: raw.match(/^ */)[0].length,
      text: raw.trim(),
      where: `${file}:${i + 1}`,
    })).filter((l) => l.text && !l.text.startsWith('#') && !l.text.startsWith('//'));

    let i = 0;
    const block = (minIndent) => {
      const nodes = [];
      while (i < lines.length) {
        const l = lines[i];
        if (l.text.startsWith('===')) break;
        if (l.indent < minIndent) break;
        const cm = CHOICE.exec(l.text);
        if (cm) {
          const options = [];
          const indent = l.indent;
          while (i < lines.length && lines[i].indent === indent && CHOICE.test(lines[i].text)) {
            const m = CHOICE.exec(lines[i].text);
            const where = lines[i].where;
            i++;
            const body = block(indent + 1);
            if (m[4]) body.push({ t: 'goto', target: m[4], where });
            options.push({ kind: m[1] === '+' ? 'drink' : m[1] === '-' ? 'once' : 'choice', cond: m[2] ? m[2].trim() : null, text: m[3].trim(), body, where });
          }
          nodes.push({ t: 'choice', options, where: l.where });
          continue;
        }
        nodes.push(parseLine(l.text, l.where));
        i++;
      }
      return nodes;
    };

    while (i < lines.length) {
      const l = lines[i];
      if (!l.text.startsWith('===')) throw new Error(`${l.where}: text outside a scene: "${l.text}"`);
      const name = l.text.replace(/^=+/, '').replace(/=+$/, '').trim();
      if (!/^[\w.]+$/.test(name)) throw new Error(`${l.where}: bad scene name "${name}"`);
      if (knots[name]) throw new Error(`${l.where}: scene "${name}" defined twice`);
      i++;
      knots[name] = block(0);
      order.push(name);
    }
  }
  return { knots, order };
}

/** Walks every node (choice bodies included). */
export function walkNodes(nodes, fn) {
  for (const n of nodes) {
    fn(n);
    if (n.t === 'choice') for (const o of n.options) walkNodes(o.body, fn);
  }
}
