/* CelloOS — Calculator */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};
  function create(root) {
    root.innerHTML = '<div class="calc"><div class="calc-display" data-el="d">0</div><div class="calc-grid">' +
      ['C','±','%','/','7','8','9','×','4','5','6','−','1','2','3','+','0','.','=',''].map(function (k, i) {
        return '<button data-k="' + k + '"' + (i === 19 ? ' disabled' : '') + '>' + k + '</button>';
      }).join('') + '</div></div>';
    var d = root.querySelector('[data-el="d"]');
    var cur = '0', acc = null, op = null, fresh = true;
    function show() { d.textContent = cur; }
    function calc(a, b, o) {
      if (o === '+') return a + b; if (o === '−') return a - b;
      if (o === '×') return a * b; if (o === '/') return b === 0 ? NaN : a / b;
      return b;
    }
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-k]'); if (!b) return;
      var k = b.dataset.k;
      if (k === 'C') { cur = '0'; acc = null; op = null; fresh = true; }
      else if (k === '±') cur = String(-parseFloat(cur));
      else if (k === '%') cur = String(parseFloat(cur) / 100);
      else if (k === '=') {
        if (op !== null) { cur = String(Math.round(calc(parseFloat(acc), parseFloat(cur), op) * 1e9) / 1e9); op = null; acc = null; fresh = true; }
      } else if (['+','−','×','/'].indexOf(k) !== -1) {
        acc = parseFloat(cur); op = k; fresh = true;
      } else {
        if (fresh || cur === '0') { cur = k === '.' ? '0.' : k; fresh = false; }
        else cur += k;
      }
      show();
    });
    return {};
  }
  O.wm.register('calc', { title: 'Calcolatrice', icon: '🧮', create: create });
}());
