import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const mobileScript = indexHtml.match(/\/\/ Mobile navigation([\s\S]*?)\/\/ Scroll highlight for nav links/)?.[1] || '';

const count = (source, pattern) => (source.match(pattern) || []).length;

test('homepage hero states the research thesis in both languages', () => {
  assert.match(
    indexHtml,
    /<p class="profile-thesis" data-i18n="profile\.thesis">I build prediction intelligence for complex systems by combining time-series observations, scientific knowledge, and agentic reasoning\.<\/p>/
  );
  assert.match(
    indexHtml,
    /"profile\.thesis": "面向复杂系统，我致力于融合时间序列观测、科学知识与智能体推理，构建预测智能。"/
  );
});

test('homepage hero omits the retired action-button markup', () => {
  const actionMarkupCount = count(indexHtml, /class="profile-actions\b/g)
    + count(indexHtml, /class="profile-action(?:\s|")/g);
  assert.equal(actionMarkupCount, 0, 'the profile action group and its three links should be removed');
  assert.match(indexHtml, /<div class="profile-badges">/);
});

test('homepage stylesheet omits CSS dedicated to retired action buttons', () => {
  assert.equal(
    count(indexHtml, /^\s*(?:\.profile-actions|\.profile-action|\.profile-action:hover|\.profile-action--primary|\.profile-action--primary:hover)\s*\{/gm),
    0,
    'desktop and mobile profile action rules should be removed'
  );
});

test('homepage dictionaries omit retired action translation keys', () => {
  assert.equal(
    count(indexHtml, /"(?:a11y\.profileActions|profile\.actionResearch|profile\.actionPublications|profile\.actionJoin)":/g),
    0,
    'retired action keys should be absent from both language dictionaries'
  );
});

test('homepage retains the sections previously targeted by action links', () => {
  assert.match(indexHtml, /id="join-collaborate"[^>]*data-i18n="research\.join"/);
  assert.match(indexHtml, /id="selected-publications"[^>]*data-i18n="pub\.heading"/);
});

class FakeEventTarget {
  constructor() {
    this.listeners = new Map();
  }

  addEventListener(type, listener) {
    const listeners = this.listeners.get(type) || [];
    listeners.push(listener);
    this.listeners.set(type, listeners);
  }

  dispatchEvent(event) {
    if (!event.target) event.target = this;
    event.currentTarget = this;
    for (const listener of this.listeners.get(event.type) || []) listener.call(this, event);
    if (event.bubbles && this.parentElement) this.parentElement.dispatchEvent(event);
  }
}

class FakeClassList {
  constructor(tokens = []) {
    this.tokens = new Set(tokens);
  }

  add(...tokens) {
    tokens.forEach((token) => this.tokens.add(token));
  }

  remove(...tokens) {
    tokens.forEach((token) => this.tokens.delete(token));
  }

  contains(token) {
    return this.tokens.has(token);
  }

  toggle(token, force) {
    const next = force === undefined ? !this.contains(token) : Boolean(force);
    if (next) this.add(token);
    else this.remove(token);
    return next;
  }
}

class FakeElement extends FakeEventTarget {
  constructor(document, { tagName = 'div', classes = [], href = '' } = {}) {
    super();
    this.ownerDocument = document;
    this.tagName = tagName.toUpperCase();
    this.classList = new FakeClassList(classes);
    this.attributes = new Map();
    this.children = [];
    this.parentElement = null;
    this.hidden = false;
    this.noLayoutRect = false;
    this.style = { display: 'block', visibility: 'visible' };
    if (href) this.setAttribute('href', href);
  }

  append(...children) {
    children.forEach((child) => {
      child.parentElement = this;
      this.children.push(child);
    });
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.get(name) ?? null;
  }

  getClientRects() {
    return this.noLayoutRect ? [] : [{}];
  }

  querySelectorAll(selector) {
    return selector === 'a[href]'
      ? this.children.filter((child) => child.tagName === 'A' && child.getAttribute('href'))
      : [];
  }

  closest(selector) {
    if (selector === 'a[href]' && this.tagName === 'A' && this.getAttribute('href')) return this;
    return this.parentElement?.closest(selector) || null;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  click() {
    this.dispatchEvent({ type: 'click', bubbles: true });
  }
}

class FakeDocument extends FakeEventTarget {
  constructor() {
    super();
    this.activeElement = null;
    this.elements = new Map();
  }

  querySelector(selector) {
    return this.elements.get(selector) || null;
  }

  getElementById(id) {
    return this.elements.get(`#${id}`) || null;
  }
}

function createMobileNavHarness() {
  const document = new FakeDocument();
  const window = new FakeEventTarget();
  const header = new FakeElement(document, { tagName: 'header', classes: ['site-header'] });
  const toggle = new FakeElement(document, { tagName: 'button', classes: ['nav-toggle'] });
  const nav = new FakeElement(document, { tagName: 'nav', classes: ['nav-links'] });
  const links = Array.from({ length: 6 }, (_, index) => (
    new FakeElement(document, { tagName: 'a', href: `page-${index}.html` })
  ));
  nav.append(...links);
  header.append(nav, toggle);
  document.elements.set('.site-header', header);
  document.elements.set('.nav-toggle', toggle);
  document.elements.set('#primary-nav', nav);

  links[0].hidden = true;
  links[1].setAttribute('aria-hidden', 'true');
  links[2].style.display = 'none';
  links[3].style.visibility = 'hidden';
  links[4].noLayoutRect = true;

  const getComputedStyle = (element) => ({
    display: element.style.display,
    visibility: element.style.visibility
  });

  vm.runInNewContext(mobileScript, { document, getComputedStyle, window }, { filename: 'index-mobile-nav.js' });
  return { document, header, links, nav, toggle, window };
}

function assertClosed({ header, toggle }) {
  assert.equal(header.classList.contains('nav-open'), false);
  assert.equal(toggle.getAttribute('aria-expanded'), 'false');
}

test('homepage inline mobile navigation executes the keyboard and visibility contract', () => {
  const harness = createMobileNavHarness();
  assert.equal(harness.header.classList.contains('js-mobile-nav'), true);
  assertClosed(harness);

  harness.toggle.click();
  assert.equal(harness.header.classList.contains('nav-open'), true);
  assert.equal(harness.toggle.getAttribute('aria-expanded'), 'true');
  assert.equal(harness.document.activeElement, harness.links[5], 'focus skips every non-visible link');

  harness.document.dispatchEvent({ type: 'keydown', key: 'Escape' });
  assertClosed(harness);
  assert.equal(harness.document.activeElement, harness.toggle);

  harness.toggle.click();
  harness.links[5].click();
  assertClosed(harness);

  harness.toggle.click();
  harness.toggle.noLayoutRect = true;
  harness.window.dispatchEvent({ type: 'resize' });
  assertClosed(harness);
});

test('homepage inline mobile navigation remains event driven', () => {
  assert.doesNotMatch(mobileScript, /\bset(?:Timeout|Interval)\s*\(/);
  assert.doesNotMatch(mobileScript, /window\.innerWidth\s*>/);
});
