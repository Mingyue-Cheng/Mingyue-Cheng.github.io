import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const siteLanguagePath = join(root, 'files/assets/site-language.js');
const packagePath = join(root, 'package.json');
const workflowPath = join(root, '.github/workflows/verify-site.yml');

const readIfPresent = (path) => (existsSync(path) ? readFileSync(path, 'utf8') : '');
const siteLanguageSource = readIfPresent(siteLanguagePath);

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
    if (!event || !event.type) throw new TypeError('Fake events need a type');
    if (!event.target) event.target = this;
    event.currentTarget = this;
    for (const listener of this.listeners.get(event.type) || []) listener.call(this, event);
    if (event.bubbles && this.parentElement) this.parentElement.dispatchEvent(event);
    return true;
  }

  listenerCount(type) {
    return (this.listeners.get(type) || []).length;
  }
}

class FakeClassList {
  constructor(tokens = []) {
    this.tokens = new Set(tokens);
  }

  add(...tokens) {
    for (const token of tokens) this.tokens.add(token);
  }

  remove(...tokens) {
    for (const token of tokens) this.tokens.delete(token);
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
  constructor(document, { tagName = 'div', classes = [], id = '', href = '' } = {}) {
    super();
    this.ownerDocument = document;
    this.tagName = tagName.toUpperCase();
    this.classList = new FakeClassList(classes);
    this.id = id;
    this.hidden = false;
    this.style = { display: '', visibility: '' };
    this.textContent = '';
    this.innerHTML = '';
    this.children = [];
    this.parentElement = null;
    this.attributes = new Map();
    if (href) this.setAttribute('href', href);
  }

  append(...children) {
    for (const child of children) {
      child.parentElement = this;
      this.children.push(child);
    }
  }

  setAttribute(name, value) {
    this.attributes.set(name, String(value));
  }

  getAttribute(name) {
    return this.attributes.has(name) ? this.attributes.get(name) : null;
  }

  focus() {
    this.ownerDocument.activeElement = this;
  }

  click() {
    this.dispatchEvent({ type: 'click', bubbles: true });
  }

  closest(selector) {
    if ((selector === 'a' || selector === 'a[href]') && this.tagName === 'A') return this;
    return this.parentElement ? this.parentElement.closest(selector) : null;
  }

  contains(candidate) {
    return candidate === this || this.children.some((child) => child.contains(candidate));
  }

  getClientRects() {
    const unavailable = this.hidden || this.style.display === 'none';
    return unavailable ? [] : [{}];
  }

  querySelectorAll(selector) {
    if (selector === 'a' || selector === 'a[href]') {
      return this.children.filter((child) => child.tagName === 'A');
    }
    return [];
  }
}

class FakeDocument extends FakeEventTarget {
  constructor() {
    super();
    this.readyState = 'complete';
    this.activeElement = null;
    this.documentElement = { lang: '' };
    this.elements = new Map();
  }

  getElementById(id) {
    return this.elements.get(`#${id}`) || null;
  }

  querySelector(selector) {
    const navLinkMatch = selector.match(/^\.nav-links a\[href="([^"]+)"\]$/);
    if (navLinkMatch) {
      return this.elements.get('#primary-nav')
        ?.querySelectorAll('a[href]')
        .find((link) => link.getAttribute('href') === navLinkMatch[1]) || null;
    }
    return this.elements.get(selector) || null;
  }

  querySelectorAll(selector) {
    if (selector === '.research-note-box') return [];
    return [];
  }
}

function createHarness({ missing = null, width = 390, storedLanguage = 'en' } = {}) {
  const document = new FakeDocument();
  const window = new FakeEventTarget();
  window.location = { pathname: '/research.html' };
  window.innerWidth = width;
  window.document = document;

  const header = new FakeElement(document, { tagName: 'header', classes: ['site-header'] });
  const toggle = new FakeElement(document, { tagName: 'button', classes: ['nav-toggle'] });
  toggle.setAttribute('aria-expanded', 'false');
  const nav = new FakeElement(document, { tagName: 'nav', classes: ['nav-links'], id: 'primary-nav' });
  const logo = new FakeElement(document, { tagName: 'a', classes: ['nav-logo'], href: 'index.html' });
  const languageToggle = new FakeElement(document, { tagName: 'button', id: 'languageToggle' });
  const navLinks = ['research.html', 'news.html', 'publications.html'].map(
    (href) => new FakeElement(document, { tagName: 'a', href })
  );
  nav.append(...navLinks);
  header.append(logo, nav, languageToggle, toggle);

  if (missing !== 'header') document.elements.set('.site-header', header);
  if (missing !== 'toggle') document.elements.set('.nav-toggle', toggle);
  if (missing !== 'nav') document.elements.set('#primary-nav', nav);
  document.elements.set('.nav-logo', logo);
  document.elements.set('#languageToggle', languageToggle);

  const storage = new Map(storedLanguage ? [['homepage-language', storedLanguage]] : []);
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value))
  };

  const getComputedStyle = (element) => ({
    display: element.hidden ? 'none' : element.style.display || 'block',
    visibility: element.style.visibility || 'visible'
  });
  window.getComputedStyle = getComputedStyle;

  assert.doesNotThrow(
    () => vm.runInNewContext(siteLanguageSource, {
      document,
      getComputedStyle,
      localStorage,
      window
    }, { filename: siteLanguagePath }),
    'shared site script should initialize safely'
  );

  return {
    document,
    header,
    languageToggle,
    localStorage,
    logo,
    nav,
    navLinks,
    toggle,
    window
  };
}

function assertClosed({ header, toggle }) {
  assert.equal(header.classList.contains('nav-open'), false, 'closed menu must not have nav-open');
  assert.equal(toggle.getAttribute('aria-expanded'), 'false', 'closed menu must expose aria-expanded=false');
}

function assertOpen({ header, toggle }) {
  assert.equal(header.classList.contains('nav-open'), true, 'open menu must have nav-open');
  assert.equal(toggle.getAttribute('aria-expanded'), 'true', 'open menu must expose aria-expanded=true');
}

test('shared mobile navigation initializes only when its complete shell exists', () => {
  for (const missing of ['header', 'toggle', 'nav']) {
    const harness = createHarness({ missing });
    assert.equal(harness.toggle.listenerCount('click'), 0, `${missing}: do not partially bind toggle`);
    assert.equal(harness.document.listenerCount('keydown'), 0, `${missing}: do not partially bind Escape`);
    assert.equal(harness.window.listenerCount('resize'), 0, `${missing}: do not partially bind resize`);
  }
});

test('language switching remains functional beside the navigation behavior', () => {
  const harness = createHarness();
  assert.equal(harness.document.documentElement.lang, 'en');
  assert.equal(harness.logo.textContent, 'Homepage');
  assert.equal(harness.navLinks[0].textContent, 'Research');

  harness.languageToggle.click();

  assert.equal(harness.document.documentElement.lang, 'zh-CN');
  assert.equal(harness.localStorage.getItem('homepage-language'), 'zh');
  assert.equal(harness.languageToggle.textContent, 'EN');
  assert.equal(harness.logo.textContent, '主页');
  assert.equal(harness.navLinks[0].textContent, '研究');
});

test('opening the mobile menu synchronizes state and focuses its first visible link', () => {
  const harness = createHarness();
  harness.navLinks[0].hidden = true;

  harness.toggle.click();

  assertOpen(harness);
  assert.equal(harness.document.activeElement, harness.navLinks[1]);
});

test('focus skips computed-style-hidden links and continues to the next visible link', () => {
  const harness = createHarness();
  harness.navLinks[0].style.visibility = 'hidden';
  harness.navLinks[1].style.display = 'none';
  assert.equal(harness.navLinks[0].getClientRects().length, 1);

  harness.toggle.click();

  assertOpen(harness);
  assert.equal(harness.document.activeElement, harness.navLinks[2]);
});

test('Escape closes an open menu and returns focus to its toggle', () => {
  const harness = createHarness();
  harness.toggle.click();
  harness.document.dispatchEvent({ type: 'keydown', key: 'Escape' });

  assertClosed(harness);
  assert.equal(harness.document.activeElement, harness.toggle);
});

test('activating a navigation link closes the mobile menu', () => {
  const harness = createHarness();
  harness.toggle.click();
  harness.navLinks[1].click();

  assertClosed(harness);
});

test('entering each page desktop layout closes the menu and clears its expanded state', () => {
  const harness = createHarness();
  harness.toggle.click();
  harness.window.innerWidth = 800;
  harness.toggle.style.display = 'none';
  harness.window.dispatchEvent({ type: 'resize' });

  assertClosed(harness);
});

test('shared navigation uses event-driven state changes without arbitrary timers', () => {
  assert.doesNotMatch(siteLanguageSource, /\bset(?:Timeout|Interval)\s*\(/);
});

test('package.json exposes the dependency-free repository test command', () => {
  assert.ok(existsSync(packagePath), 'package.json must exist');
  const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
  assert.equal(packageJson.scripts?.test, 'node --test scripts/*.mjs');

  for (const key of ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies']) {
    assert.deepEqual(packageJson[key] || {}, {}, `${key} must stay empty`);
  }
});

test('GitHub Actions verifies pushes and pull requests with Node 20', () => {
  assert.ok(existsSync(workflowPath), '.github/workflows/verify-site.yml must exist');
  const workflow = readFileSync(workflowPath, 'utf8').replace(/#.*$/gm, '');
  const triggerBlock = workflow.match(/^on:\s*\n((?:^[ \t]+.*\n?)*)/m)?.[1] || '';

  assert.match(triggerBlock, /^\s{2}push:\s*$/m, 'workflow must run on push');
  assert.match(triggerBlock, /^\s{2}pull_request:\s*$/m, 'workflow must run on pull requests');
  assert.match(workflow, /^\s*-\s+uses:\s+actions\/checkout@v\d+\s*$/m);
  assert.match(workflow, /^\s*-\s+uses:\s+actions\/setup-node@v\d+\s*$/m);
  assert.match(workflow, /^\s+node-version:\s*['"]?20['"]?\s*$/m);
  assert.match(workflow, /^\s*-\s+run:\s+npm test\s*$/m);
});
