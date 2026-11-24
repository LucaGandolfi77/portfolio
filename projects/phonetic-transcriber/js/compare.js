/**
 * compare.js — distanza di Levenshtein e allineamento per il confronto chiavi.
 */

export function levenshtein(a, b) {
  const left = String(a || ''), right = String(b || '');
  const rows = left.length + 1, cols = right.length + 1;
  const matrix = Array.from({ length: rows }, (_, i) => {
    const row = new Array(cols);
    for (let j = 0; j < cols; j += 1) row[j] = i === 0 ? j : j === 0 ? i : 0;
    return row;
  });
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost);
    }
  }
  return { distance: matrix[rows - 1][cols - 1], matrix, left, right };
}

export function similarity(a, b) {
  const { distance } = levenshtein(a, b);
  const longest = Math.max(String(a || '').length, String(b || '').length);
  if (!longest) return 100;
  return Math.max(0, Math.round((1 - distance / longest) * 100));
}

/** Allinea i caratteri per renderli come heatmap (match / sostituzione / inserimento). */
export function alignment(a, b) {
  const left = String(a || '').split('');
  const right = String(b || '').split('');
  const { matrix } = levenshtein(left.join(''), right.join(''));
  const out = [];
  let i = left.length, j = right.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && left[i - 1] === right[j - 1] && matrix[i][j] === matrix[i - 1][j - 1]) {
      out.push({ type: 'match', a: left[i - 1], b: right[j - 1] }); i -= 1; j -= 1;
    } else if (i > 0 && j > 0 && matrix[i][j] === matrix[i - 1][j - 1] + 1) {
      out.push({ type: 'swap', a: left[i - 1], b: right[j - 1] }); i -= 1; j -= 1;
    } else if (j > 0 && matrix[i][j] === matrix[i][j - 1] + 1) {
      out.push({ type: 'insert', a: '', b: right[j - 1] }); j -= 1;
    } else if (i > 0) {
      out.push({ type: 'delete', a: left[i - 1], b: '' }); i -= 1;
    }
  }
  return out.reverse();
}
