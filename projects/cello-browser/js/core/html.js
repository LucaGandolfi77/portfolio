/* CelloOS — shared HTML whitelist renderer and markdown converter */
(function () {
  'use strict';
  var O = window.CelloOS = window.CelloOS || {};

  function safeAttr(val) {
    if (!val) return '';
    return String(val).replace(/[&<>"']/g, function (c) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
    });
  }

  function resolveHref(base, href) {
    if (!href) return base;
    var hash = '', h = href.indexOf('#');
    if (h !== -1) { hash = href.slice(h); href = href.slice(0, h); }
    if (/^(https?|cello):\/\//i.test(href)) return href + hash;
    if (href.charAt(0) === '/') return href + hash;
    var dir = String(base || '/').replace(/\/[^/]*$/, '') + '/';
    return dir + href + hash;
  }

  var DISALLOWED = ['script','style','iframe','object','embed','applet','form','input','textarea',
    'select','button','canvas','svg','math','noscript','template','link','meta','base'];
  var ALLOWED = ['html','head','body','title','h1','h2','h3','h4','h5','h6','p','br','hr','a','b','i','em',
    'strong','u','s','sub','sup','ul','ol','li','pre','blockquote','div','span','table','thead','tbody',
    'tfoot','tr','th','td','caption','colgroup','col','dl','dt','dd','abbr','cite','code','q','samp','var',
    'figure','figcaption','details','summary','section','article','header','footer','nav','main','small','big'];
  var ATTRS = ['title','alt','border','cellpadding','cellspacing','colspan','rowspan','width','height','color',
    'size','face','bgcolor','align','valign','nowrap','class','id','name'];

  function renderNode(node, base) {
    if (node.nodeType === Node.TEXT_NODE) return document.createTextNode(node.textContent);
    if (node.nodeType !== Node.ELEMENT_NODE) return document.createDocumentFragment();
    var tag = node.tagName.toLowerCase();
    function unwrap() {
      var frag = document.createDocumentFragment();
      Array.prototype.forEach.call(node.childNodes, function (c) { frag.appendChild(renderNode(c, base)); });
      return frag;
    }
    if (DISALLOWED.indexOf(tag) !== -1) return unwrap();
    if (tag === 'img') {
      var box = document.createElement('div');
      box.className = 'broken-image';
      box.textContent = '[IMAGE: ' + (node.getAttribute('alt') || '') + ']';
      return box;
    }
    if (tag === 'blink') {
      var span = document.createElement('span');
      span.className = 'blink';
      Array.prototype.forEach.call(node.childNodes, function (c) { span.appendChild(renderNode(c, base)); });
      return span;
    }
    if (ALLOWED.indexOf(tag) === -1) return unwrap();
    var el = document.createElement(tag);
    Array.prototype.forEach.call(node.attributes, function (attr) {
      var name = attr.name.toLowerCase();
      if (name === 'href' && tag === 'a') el.setAttribute('href', resolveHref(base, attr.value));
      else if (ATTRS.indexOf(name) !== -1) el.setAttribute(name, safeAttr(attr.value));
    });
    if (tag === 'a' && !el.hasAttribute('href')) el.setAttribute('href', '#');
    Array.prototype.forEach.call(node.childNodes, function (c) { el.appendChild(renderNode(c, base)); });
    return el;
  }

  function renderHTML(target, html, base) {
    target.innerHTML = '';
    var doc = new DOMParser().parseFromString(html, 'text/html');
    Array.prototype.forEach.call(doc.body.childNodes, function (c) { target.appendChild(renderNode(c, base)); });
  }

  function mdToHtml(md) {
    var s = safeAttr(md), lines = s.split('\n'), out = [], inList = false;
    function inline(str) {
      str = str.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
      str = str.replace(/\*(.+?)\*/g, '<em>$1</em>');
      str = str.replace(/!\[(.+?)\]\((.+?)\)/g, '<div class="broken-image">[IMAGE: $1]</div>');
      str = str.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
      return str;
    }
    lines.forEach(function (line) {
      if (/^#{1,6}\s/.test(line)) {
        if (inList) { out.push('</ul>'); inList = false; }
        var level = line.match(/^#{1,6}/)[0].length;
        out.push('<h' + level + '>' + inline(line.slice(level + 1)) + '</h' + level + '>');
      } else if (/^- /.test(line)) {
        if (!inList) { out.push('<ul>'); inList = true; }
        out.push('<li>' + inline(line.slice(2)) + '</li>');
      } else if (!line.trim()) {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push('<br>');
      } else {
        if (inList) { out.push('</ul>'); inList = false; }
        out.push('<p>' + inline(line) + '</p>');
      }
    });
    if (inList) out.push('</ul>');
    return out.join('');
  }

  O.html = { safeAttr: safeAttr, resolveHref: resolveHref, renderNode: renderNode, renderHTML: renderHTML, mdToHtml: mdToHtml };
}());
