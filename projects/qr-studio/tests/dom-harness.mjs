/**
 * dom-harness.mjs — DOM minimale per smoke test di QR Studio in Node.
 * Non è un browser: copre solo le API usate da app.js durante init e
 * interazioni semplici (input, click, cambio lingua, download).
 */

const VOID = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr'
]);

function kebab(name) {
  return String(name).replace(/[A-Z]/g, (char) => '-' + char.toLowerCase());
}

function decodeEntities(value) {
  return String(value)
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function classNames(element) {
  return (element.getAttribute('class') || '').split(/\s+/).filter(Boolean);
}

function prepareEvent(event) {
  if (!event.type) return false;
  if (!event.target) event.target = null;
  if (typeof event.preventDefault !== 'function') {
    event.preventDefault = () => {
      event.defaultPrevented = true;
    };
  }
  if (typeof event.stopPropagation !== 'function') {
    event.stopPropagation = () => {
      event._stopped = true;
    };
  }
  return true;
}

function invoke(bus, event) {
  const listeners = bus.listeners.get(event.type) || [];
  for (const listener of [...listeners]) listener.call(bus, event);
}

class EventBus {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    if (typeof listener !== 'function') return;
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }

  removeEventListener(type, listener) {
    const list = this.listeners.get(type);
    if (!list) return;
    const index = list.indexOf(listener);
    if (index >= 0) list.splice(index, 1);
  }

  dispatchEvent(event) {
    if (!prepareEvent(event)) return true;
    if (!event.target) event.target = this;
    event.currentTarget = this;
    invoke(this, event);
    return !event.defaultPrevented;
  }
}

function createCanvasContext(canvas) {
  const calls = [];
  const record = (name) => (...args) => {
    calls.push({ name, args });
  };
  return {
    canvas,
    calls,
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    lineCap: 'butt',
    lineJoin: 'miter',
    clearRect: record('clearRect'),
    fillRect: record('fillRect'),
    beginPath: record('beginPath'),
    rect: record('rect'),
    moveTo: record('moveTo'),
    lineTo: record('lineTo'),
    quadraticCurveTo: record('quadraticCurveTo'),
    bezierCurveTo: record('bezierCurveTo'),
    closePath: record('closePath'),
    arcTo: record('arcTo'),
    arc: record('arc'),
    fill: record('fill'),
    stroke: record('stroke'),
    save: record('save'),
    restore: record('restore'),
    translate: record('translate'),
    scale: record('scale'),
    drawImage: record('drawImage'),
    getImageData: () => ({ data: new Uint8ClampedArray(4), width: 1, height: 1 })
  };
}

export class FakeElement extends EventBus {
  constructor(tagName, ownerDocument) {
    super();
    this.tagName = String(tagName).toUpperCase();
    this.ownerDocument = ownerDocument;
    this.attributes = new Map();
    this.children = [];
    this.parentNode = null;
    this.style = {
      setProperty() {},
      removeProperty() {},
      getPropertyValue() {
        return '';
      }
    };
    this._text = '';
    this._innerHTML = '';
    this._value = null;
    this._checked = null;
    this._width = null;
    this._height = null;
    this._context = null;
    this._dataset = null;
  }

  get parentElement() {
    return this.parentNode instanceof FakeElement ? this.parentNode : null;
  }

  get id() {
    return this.getAttribute('id') || '';
  }

  set id(value) {
    this.setAttribute('id', value);
  }

  get className() {
    return this.getAttribute('class') || '';
  }

  set className(value) {
    this.setAttribute('class', value);
  }

  get classList() {
    const element = this;
    return {
      add(...names) {
        const set = new Set(classNames(element));
        for (const name of names) set.add(name);
        element.setAttribute('class', [...set].join(' '));
      },
      remove(...names) {
        const set = new Set(classNames(element));
        for (const name of names) set.delete(name);
        element.setAttribute('class', [...set].join(' '));
      },
      toggle(name, force) {
        const has = classNames(element).includes(name);
        const should = force === undefined ? !has : Boolean(force);
        if (should && !has) this.add(name);
        if (!should && has) this.remove(name);
        return should;
      },
      contains(name) {
        return classNames(element).includes(name);
      },
      get length() {
        return classNames(element).length;
      },
      item(index) {
        return classNames(element)[index] || null;
      }
    };
  }

  get dataset() {
    if (!this._dataset) {
      const element = this;
      this._dataset = new Proxy(
        {},
        {
          get(target, property) {
            if (typeof property !== 'string') return undefined;
            return element.getAttribute('data-' + kebab(property));
          },
          set(target, property, value) {
            element.setAttribute('data-' + kebab(property), String(value));
            return true;
          },
          has(target, property) {
            return typeof property === 'string' && element.hasAttribute('data-' + kebab(property));
          }
        }
      );
    }
    return this._dataset;
  }

  get textContent() {
    if (this._text) return this._text;
    return this.children.map((child) => child.textContent).join('');
  }

  set textContent(value) {
    this._text = String(value);
    this.children = [];
    this._innerHTML = '';
  }

  get innerHTML() {
    return this._innerHTML;
  }

  set innerHTML(value) {
    this._innerHTML = String(value);
    this.children = [];
    this._text = '';
  }

  get value() {
    if (this._value !== null) return this._value;
    if (this.tagName === 'SELECT') {
      const options = this.children.filter((child) => child.tagName === 'OPTION');
      const selected = options.find((option) => option.hasAttribute('selected')) || options[0];
      return selected ? selected.value : '';
    }
    return this.getAttribute('value') ?? '';
  }

  set value(value) {
    this._value = String(value);
  }

  get checked() {
    return this._checked === null ? this.hasAttribute('checked') : this._checked;
  }

  set checked(value) {
    this._checked = Boolean(value);
  }

  get disabled() {
    return this.hasAttribute('disabled');
  }

  set disabled(value) {
    if (value) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
  }

  get hidden() {
    return this.hasAttribute('hidden');
  }

  set hidden(value) {
    if (value) this.setAttribute('hidden', '');
    else this.removeAttribute('hidden');
  }

  get required() {
    return this.hasAttribute('required');
  }

  set required(value) {
    if (value) this.setAttribute('required', '');
    else this.removeAttribute('required');
  }

  get href() {
    return this.getAttribute('href') || '';
  }

  set href(value) {
    this.setAttribute('href', value);
  }

  get target() {
    return this.getAttribute('target') || '';
  }

  set target(value) {
    this.setAttribute('target', value);
  }

  get rel() {
    return this.getAttribute('rel') || '';
  }

  set rel(value) {
    this.setAttribute('rel', value);
  }

  get download() {
    return this.getAttribute('download') || '';
  }

  set download(value) {
    this.setAttribute('download', value);
  }

  get dateTime() {
    return this.getAttribute('datetime') || '';
  }

  set dateTime(value) {
    this.setAttribute('datetime', value);
  }

  get type() {
    return this.getAttribute('type') || '';
  }

  set type(value) {
    this.setAttribute('type', value);
  }

  get name() {
    return this.getAttribute('name') || '';
  }

  set name(value) {
    this.setAttribute('name', value);
  }

  get placeholder() {
    return this.getAttribute('placeholder') || '';
  }

  set placeholder(value) {
    this.setAttribute('placeholder', value);
  }

  get elements() {
    const found = [];
    const walk = (element) => {
      for (const child of element.children) {
        if (['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON'].includes(child.tagName) && child.name) {
          found.push(child);
        }
        walk(child);
      }
    };
    walk(this);
    return found;
  }

  get width() {
    return this._width === null ? Number(this.getAttribute('width')) || 300 : this._width;
  }

  set width(value) {
    this._width = Number(value);
    this.setAttribute('width', String(value));
  }

  get height() {
    return this._height === null ? Number(this.getAttribute('height')) || 150 : this._height;
  }

  set height(value) {
    this._height = Number(value);
    this.setAttribute('height', String(value));
  }

  get files() {
    return [];
  }

  append(...nodes) {
    for (const node of nodes) {
      if (node == null) continue;
      const element = typeof node === 'string' ? this.ownerDocument.createTextNode(node) : node;
      element.parentNode = this;
      this.children.push(element);
    }
  }

  appendChild(node) {
    this.append(node);
    return node;
  }

  remove() {
    if (!this.parentNode) return;
    const index = this.parentNode.children.indexOf(this);
    if (index >= 0) this.parentNode.children.splice(index, 1);
    this.parentNode = null;
  }

  setAttribute(name, value) {
    this.attributes.set(String(name).toLowerCase(), String(value));
  }

  getAttribute(name) {
    const key = String(name).toLowerCase();
    return this.attributes.has(key) ? this.attributes.get(key) : null;
  }

  hasAttribute(name) {
    return this.attributes.has(String(name).toLowerCase());
  }

  removeAttribute(name) {
    this.attributes.delete(String(name).toLowerCase());
  }

  querySelector(selector) {
    return queryAll(this, selector, false)[0] || null;
  }

  querySelectorAll(selector) {
    return queryAll(this, selector, false);
  }

  matches(selector) {
    return String(selector)
      .split(',')
      .some((part) => matchesSimple(this, part.trim()));
  }

  closest(selector) {
    let node = this;
    while (node) {
      if (node instanceof FakeElement && node.matches(selector)) return node;
      node = node.parentNode;
    }
    return null;
  }

  click() {
    this.ownerDocument.__clicks.push(this);
    this.dispatchEvent({ type: 'click', target: this });
  }

  focus() {}

  select() {}

  scrollIntoView() {}

  getBoundingClientRect() {
    return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 };
  }

  getContext(kind) {
    if (kind !== '2d') return null;
    if (!this._context) this._context = createCanvasContext(this);
    return this._context;
  }

  toBlob(callback, type) {
    callback(new Blob([new Uint8Array([0x89, 0x50, 0x4e, 0x47])], { type: type || 'image/png' }));
  }

  dispatchEvent(event) {
    if (!prepareEvent(event)) return true;
    if (!event.target) event.target = this;
    let node = this;
    while (node) {
      event.currentTarget = node;
      invoke(node, event);
      if (event._stopped) break;
      if (node === this.ownerDocument) break;
      node = node.parentNode;
    }
    return !event.defaultPrevented;
  }
}

class FakeTextNode {
  constructor(text, ownerDocument) {
    this.nodeType = 3;
    this.textContent = text;
    this.ownerDocument = ownerDocument;
    this.parentNode = null;
  }

  remove() {
    if (!this.parentNode) return;
    const index = this.parentNode.children.indexOf(this);
    if (index >= 0) this.parentNode.children.splice(index, 1);
    this.parentNode = null;
  }
}

export class FakeDocument extends EventBus {
  constructor(source) {
    super();
    this.readyState = 'complete';
    this.hidden = false;
    this.defaultView = null;
    this.documentElement = null;
    this.head = null;
    this.body = null;
    this.__clicks = [];
    this._parse(source);
  }

  createElement(tagName) {
    return new FakeElement(tagName, this);
  }

  createTextNode(text) {
    return new FakeTextNode(String(text), this);
  }

  getElementById(id) {
    return this._find((element) => element.id === id);
  }

  querySelector(selector) {
    return queryAll(this, selector, true)[0] || null;
  }

  querySelectorAll(selector) {
    return queryAll(this, selector, true);
  }

  _find(predicate) {
    if (!this.documentElement) return null;
    const walk = (element) => {
      if (predicate(element)) return element;
      for (const child of element.children) {
        const found = walk(child);
        if (found) return found;
      }
      return null;
    };
    return walk(this.documentElement);
  }

  _parse(source) {
    const tagPattern = /<!--[\s\S]*?-->|<!doctype[^>]*>|<![^>]*>|<\/?([a-zA-Z][\w:-]*)\b([^>]*)>/gi;
    const stack = [];
    for (const match of source.matchAll(tagPattern)) {
      const raw = match[0];
      if (raw.startsWith('<!--') || raw.startsWith('<!')) continue;
      const tag = match[1].toLowerCase();
      const closing = raw.startsWith('</');
      if (closing) {
        const index = stack.map((element) => element.tagName.toLowerCase()).lastIndexOf(tag);
        if (index >= 0) stack.length = index;
        continue;
      }

      const element = this.createElement(tag);
      const rawAttributes = match[2] || '';
      const attrPattern = /([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
      for (const attr of rawAttributes.matchAll(attrPattern)) {
        const name = attr[1];
        if (!name || name === '/') continue;
        const value = attr[2] ?? attr[3] ?? attr[4] ?? '';
        element.setAttribute(name, decodeEntities(value));
      }

      const parent = stack[stack.length - 1];
      if (parent) parent.append(element);
      if (tag === 'html') this.documentElement = element;
      if (tag === 'head') this.head = element;
      if (tag === 'body') this.body = element;

      const selfClosing = /\/\s*>$/.test(raw) || VOID.has(tag);
      if (!selfClosing) stack.push(element);
    }

    if (!this.documentElement) {
      this.documentElement = this.createElement('html');
    }
    if (!this.head) {
      this.head = this.createElement('head');
      this.documentElement.children.unshift(this.head);
      this.head.parentNode = this.documentElement;
    }
    if (!this.body) {
      this.body = this.createElement('body');
      this.documentElement.append(this.body);
    }
    this.documentElement.parentNode = this;
  }
}

function matchesSimple(element, selector) {
  if (!(element instanceof FakeElement) || !selector) return false;
  if (selector.startsWith('#')) return element.id === selector.slice(1);
  if (selector.startsWith('.')) return classNames(element).includes(selector.slice(1));

  if (selector.startsWith('[')) {
    const match = selector.match(/^\[([\w-]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\]\s]+)))?\]$/);
    if (!match) return false;
    const name = match[1];
    if (!element.hasAttribute(name)) return false;
    const expected = match[2] ?? match[3] ?? match[4];
    return expected === undefined ? true : element.getAttribute(name) === expected;
  }

  return element.tagName.toLowerCase() === selector.toLowerCase();
}

function matchesChain(element, parts) {
  let index = parts.length - 1;
  if (!matchesSimple(element, parts[index])) return false;
  let node = element.parentElement;
  for (index -= 1; index >= 0; index -= 1) {
    while (node && !matchesSimple(node, parts[index])) node = node.parentElement;
    if (!node) return false;
    node = node.parentElement;
  }
  return true;
}

function queryAll(root, selector, includeRoot) {
  const elementRoot = root instanceof FakeDocument ? root.documentElement : root;
  if (!elementRoot) return [];
  const selectors = String(selector)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean);
  const found = [];
  const seen = new Set();

  const visit = (element) => {
    for (const part of selectors) {
      const parts = part.split(/\s+/);
      if (matchesChain(element, parts) && !seen.has(element)) {
        seen.add(element);
        found.push(element);
      }
    }
    for (const child of element.children) {
      if (child instanceof FakeElement) visit(child);
    }
  };

  if (includeRoot) visit(elementRoot);
  else for (const child of elementRoot.children) if (child instanceof FakeElement) visit(child);
  return found;
}

export function createLocalStorage() {
  const store = new Map();
  return {
    get length() {
      return store.size;
    },
    key(index) {
      return [...store.keys()][index] ?? null;
    },
    getItem(key) {
      return store.has(String(key)) ? store.get(String(key)) : null;
    },
    setItem(key, value) {
      store.set(String(key), String(value));
    },
    removeItem(key) {
      store.delete(String(key));
    },
    clear() {
      store.clear();
    }
  };
}

export function createHarness(source) {
  const document = new FakeDocument(source);
  const location = {
    protocol: 'https:',
    hostname: 'localhost',
    href: 'https://localhost/projects/qr-studio/',
    pathname: '/projects/qr-studio/',
    hash: '',
    toString() {
      return this.href;
    }
  };
  const history = {
    replaceState(_state, _title, url) {
      if (typeof url === 'string' && url.startsWith('#')) location.hash = url;
    },
    pushState(_state, _title, url) {
      if (typeof url === 'string' && url.startsWith('#')) location.hash = url;
    }
  };
  const navigator = {
    language: 'en',
    mediaDevices: undefined
  };
  const localStorage = createLocalStorage();

  const window = new EventBus();
  window.document = document;
  window.location = location;
  window.history = history;
  window.navigator = navigator;
  window.localStorage = localStorage;
  window.isSecureContext = true;
  window.scrollTo = () => {
    window.__scrolls += 1;
  };
  window.confirm = () => true;
  window.matchMedia = () => ({
    matches: false,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {}
  });
  window.self = window;
  window.__scrolls = 0;
  document.defaultView = window;

  return { document, window, location, history, navigator, localStorage };
}
