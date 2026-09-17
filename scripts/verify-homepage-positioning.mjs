import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const mobileScript = indexHtml.match(/\/\/ Mobile navigation([\s\S]*?)\/\/ Scroll highlight for nav links/)?.[1] || '';
const i18nLiteral = indexHtml.match(/const i18n = (\{[\s\S]*?\n\});\n\nlet currentLang/)?.[1] || '';
const translatePageScript = indexHtml.match(/function translatePage\(lang\) \{[\s\S]*?\n\}\n\nfunction initLanguageToggle/)?.[0]
  ?.replace(/\n\nfunction initLanguageToggle$/, '') || '';

const count = (source, pattern) => (source.match(pattern) || []).length;
const retiredActionClassNames = new Set(['profile-actions', 'profile-action', 'profile-action--primary']);
const retiredActionSelectorPattern = /\.(?:profile-action--primary|profile-actions|profile-action)(?![\w-])/;

function findRetiredActionClassTokens(source) {
  return [...source.matchAll(/<[A-Za-z][^>]*>/g)].flatMap(([tag]) => {
    const classValue = tag.match(/\bclass\s*=\s*(["'])(.*?)\1/is)?.[2] || '';
    return classValue.split(/\s+/).filter((token) => retiredActionClassNames.has(token));
  });
}

function extractStyleText(source) {
  return [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)]
    .map(([, styleText]) => styleText)
    .join('\n');
}

// This scoped scanner resolves only the default .profile-section padding cascade.
function maskPositioningCssComments(source) {
  const characters = [...source];
  let quote = '';

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (quote) {
      if (character === '\\' && index + 1 < characters.length) index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '\\' && index + 1 < characters.length) {
      index += 1;
      continue;
    }
    if (character !== '/' || characters[index + 1] !== '*') continue;

    characters[index] = ' ';
    characters[index + 1] = ' ';
    index += 2;
    while (index < characters.length && !(characters[index] === '*' && characters[index + 1] === '/')) {
      if (characters[index] !== '\n' && characters[index] !== '\r') characters[index] = ' ';
      index += 1;
    }
    if (index < characters.length) {
      characters[index] = ' ';
      if (index + 1 < characters.length) characters[index + 1] = ' ';
      index += 1;
    }
  }

  return characters.join('');
}

function splitPositioningCssTopLevel(source, delimiter) {
  const parts = [];
  let start = 0;
  let quote = '';
  let parentheses = 0;
  let brackets = 0;
  let braces = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === '\\' && index + 1 < source.length) index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '\\' && index + 1 < source.length) {
      index += 1;
      continue;
    }
    if (character === '(') parentheses += 1;
    else if (character === ')') parentheses = Math.max(0, parentheses - 1);
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets = Math.max(0, brackets - 1);
    else if (character === '{') braces += 1;
    else if (character === '}') braces = Math.max(0, braces - 1);
    else if (character === delimiter && parentheses === 0 && brackets === 0 && braces === 0) {
      parts.push(source.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(source.slice(start));
  return parts;
}

function findPositioningDeclarationColon(source) {
  let quote = '';
  let parentheses = 0;
  let brackets = 0;
  let braces = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === '\\' && index + 1 < source.length) index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '\\' && index + 1 < source.length) {
      index += 1;
      continue;
    }
    if (character === '(') parentheses += 1;
    else if (character === ')') parentheses = Math.max(0, parentheses - 1);
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets = Math.max(0, brackets - 1);
    else if (character === '{') braces += 1;
    else if (character === '}') braces = Math.max(0, braces - 1);
    else if (character === ':' && parentheses === 0 && brackets === 0 && braces === 0) return index;
  }
  return -1;
}

function parsePositioningDeclarations(body) {
  return splitPositioningCssTopLevel(body, ';').flatMap((entry) => {
    const separator = findPositioningDeclarationColon(entry);
    if (separator === -1) return [];
    const property = entry.slice(0, separator).trim().toLowerCase();
    if (!property) return [];
    let value = entry.slice(separator + 1).trim();
    const importantMatch = value.match(/!\s*important\s*$/i);
    const important = Boolean(importantMatch);
    if (importantMatch) value = value.slice(0, importantMatch.index).trim();
    return [{ important, property, value: value.replace(/\s+/g, ' ') }];
  });
}

function findPositioningRuleBoundary(source, start) {
  let quote = '';
  let parentheses = 0;
  let brackets = 0;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === '\\' && index + 1 < source.length) index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '\\' && index + 1 < source.length) {
      index += 1;
      continue;
    }
    if (character === '(') parentheses += 1;
    else if (character === ')') parentheses = Math.max(0, parentheses - 1);
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets = Math.max(0, brackets - 1);
    else if ((character === '{' || character === ';') && parentheses === 0 && brackets === 0) {
      return { character, index };
    }
  }
  return null;
}

function findPositioningClosingBrace(source, openingBrace) {
  let quote = '';
  let depth = 1;

  for (let index = openingBrace + 1; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === '\\' && index + 1 < source.length) index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '\\' && index + 1 < source.length) {
      index += 1;
      continue;
    }
    if (character === '{') depth += 1;
    else if (character === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function parseDefaultPositioningRules(source) {
  const css = maskPositioningCssComments(extractStyleText(source));
  const rules = [];
  let cursor = 0;

  while (cursor < css.length) {
    while (cursor < css.length && /[\s;]/.test(css[cursor])) cursor += 1;
    if (cursor >= css.length) break;
    const boundary = findPositioningRuleBoundary(css, cursor);
    if (!boundary) break;
    if (boundary.character === ';') {
      cursor = boundary.index + 1;
      continue;
    }

    const closingBrace = findPositioningClosingBrace(css, boundary.index);
    assert.notEqual(closingBrace, -1, 'inline CSS block must have a closing brace');
    const header = css.slice(cursor, boundary.index).trim();
    if (header && !header.startsWith('@')) {
      rules.push({
        declarations: parsePositioningDeclarations(css.slice(boundary.index + 1, closingBrace)),
        selectors: splitPositioningCssTopLevel(header, ',')
          .map((selector) => selector.trim().replace(/\s+/g, ' '))
          .filter(Boolean)
      });
    }
    cursor = closingBrace + 1;
  }

  return rules;
}

function applyPaddingSide(current, value, important) {
  return !current || important || !current.important ? { important, value } : current;
}

function splitPositioningCssWhitespace(source) {
  const tokens = [];
  let start = -1;
  let quote = '';
  let parentheses = 0;
  let brackets = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === '\\' && index + 1 < source.length) index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      if (start === -1) start = index;
      quote = character;
      continue;
    }
    if (character === '\\' && index + 1 < source.length) {
      if (start === -1) start = index;
      index += 1;
      continue;
    }
    if (character === '(') parentheses += 1;
    else if (character === ')') parentheses = Math.max(0, parentheses - 1);
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets = Math.max(0, brackets - 1);

    if (/\s/.test(character) && parentheses === 0 && brackets === 0) {
      if (start !== -1) {
        tokens.push(source.slice(start, index));
        start = -1;
      }
    } else if (start === -1) {
      start = index;
    }
  }
  if (start !== -1) tokens.push(source.slice(start));
  return tokens;
}

function expandPaddingShorthand(value) {
  const tokens = splitPositioningCssWhitespace(value);
  if (tokens.length < 1 || tokens.length > 4) return null;
  if (tokens.length === 1) return [tokens[0], tokens[0], tokens[0], tokens[0]];
  if (tokens.length === 2) return [tokens[0], tokens[1], tokens[0], tokens[1]];
  if (tokens.length === 3) return [tokens[0], tokens[1], tokens[2], tokens[1]];
  return tokens;
}

function resolveDefaultProfilePadding(source) {
  const sides = { bottom: null, left: null, right: null, top: null };
  let matchedRule = false;

  for (const rule of parseDefaultPositioningRules(source)) {
    if (!rule.selectors.includes('.profile-section')) continue;
    matchedRule = true;
    for (const declaration of rule.declarations) {
      if (declaration.property === 'padding') {
        const expanded = expandPaddingShorthand(declaration.value);
        if (!expanded) continue;
        for (const [index, side] of ['top', 'right', 'bottom', 'left'].entries()) {
          sides[side] = applyPaddingSide(sides[side], expanded[index], declaration.important);
        }
      } else if (/^padding-(?:top|right|bottom|left)$/.test(declaration.property)) {
        const side = declaration.property.slice('padding-'.length);
        sides[side] = applyPaddingSide(sides[side], declaration.value, declaration.important);
      }
    }
  }

  return { matchedRule, sides };
}

function assertDefaultProfilePadding(source) {
  const { matchedRule, sides } = resolveDefaultProfilePadding(source);
  assert.ok(matchedRule, 'the default .profile-section rule must exist');
  for (const [side, expected] of Object.entries({
    top: '38px', right: '0', bottom: '42px', left: '0'
  })) {
    assert.equal(sides[side]?.value, expected, `.profile-section padding-${side} must resolve to ${expected}`);
  }
}

function findRetiredActionSelectors(styleText) {
  const uncommented = styleText.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...uncommented.matchAll(/([^{}]+)\{/g)]
    .flatMap(([, selectorList]) => selectorList.split(','))
    .map((selector) => selector.trim())
    .filter((selector) => retiredActionSelectorPattern.test(selector));
}

test('homepage hero omits the removed research summary and its bilingual hooks', () => {
  assert.equal(/profile-thesis|profile\.thesis/.test(indexHtml), false,
    'the removed summary markup, styles, and translation keys must be absent');
  assert.equal(/I study LLM-driven reasoning|以大模型推理与智能体为核心，以时序智能/.test(indexHtml), false,
    'neither language dictionary should retain the removed summary');
  const sharedCss = readFileSync(join(root, 'files/assets/site-content.css'), 'utf8');
  assert.equal(sharedCss.includes('.profile-thesis'), false,
    'shared prose styles should not target the removed summary');
  assert.match(indexHtml, /<div class="profile-affil">[\s\S]*?<\/div>\s*<div class="profile-badges">/);
});

test('homepage displays the academic title once beside the name', () => {
  const heading = indexHtml.match(/<h1 class="profile-name">([\s\S]*?)<\/h1>/)?.[1] || '';
  assert.ok(heading.includes('Mingyue Cheng'), 'the English name remains the main heading');
  assert.equal(heading.includes('data-i18n="profile.title"'), true,
    'the academic title must be placed inside the name heading');
  assert.match(heading, /<span class="profile-title" data-i18n="profile\.title">Ph\.D\. &nbsp;·&nbsp; Associate Researcher<\/span>/);
  assert.equal(heading.includes('程明月'), false, 'the title replaces the Chinese name beside the English name');
  assert.equal(count(indexHtml, /data-i18n="profile\.title"/g), 1, 'the title appears only once');
  assert.equal(/<div class="profile-title"/.test(indexHtml), false, 'the old standalone title row is removed');
  assert.equal(indexHtml.includes('profile-name-cn'), false, 'unused Chinese-name styles are removed');
});

test('homepage name and academic title align on desktop and can wrap on narrow screens', () => {
  const style = extractStyleText(indexHtml);
  const nameRule = style.match(/\.profile-name\s*\{([^}]+)\}/)?.[1] || '';
  const titleRule = style.match(/\.profile-title\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(nameRule, /display:\s*flex/);
  assert.match(nameRule, /align-items:\s*baseline/);
  assert.match(nameRule, /flex-wrap:\s*wrap/);
  assert.match(titleRule, /margin:\s*0\s*;/);
});

test('homepage hero starts closer to the refined shared navigation', () => {
  assertDefaultProfilePadding(indexHtml);
});

test('homepage padding reader ignores comments and conditional impostors', () => {
  const invalid = `<style>
    /* .profile-section { padding: 38px 0 42px; } */
    /* @media (max-width: 900px) { .profile-section { padding: 38px 0 42px; } } */
    @media (max-width: 900px) { .profile-section { padding: 38px 0 42px; } }
    .profile-section { padding: 52px 0 42px; }
  </style>`;
  assert.throws(() => assertDefaultProfilePadding(invalid));
});

test('homepage padding reader applies later default-rule overrides', () => {
  const invalid = `<style>
    .profile-section { padding: 38px 0 42px; }
    .profile-section { padding: 52px 0 42px; }
  </style>`;
  assert.throws(() => assertDefaultProfilePadding(invalid));
});

test('homepage padding reader accounts for important longhand overrides', () => {
  const invalid = `<style>
    .profile-section {
      padding: 38px 0 42px;
      padding-top: 52px !important;
    }
  </style>`;
  assert.throws(() => assertDefaultProfilePadding(invalid));
});

test('homepage padding reader keeps functional shorthand values intact', () => {
  const invalid = `<style>
    .profile-section { padding: 38px 0 42px; }
    .profile-section { padding: calc(52px + 0px) 0 42px; }
  </style>`;
  assert.throws(() => assertDefaultProfilePadding(invalid));
});

test('homepage padding reader tolerates declaration order and CSS strings', () => {
  const valid = `<style>
    .decoy::before { content: "}; /* literal */ ; {"; }
    .profile-section {
      color: var(--text);
      padding: 38px 0 42px;
    }
  </style>`;
  assertDefaultProfilePadding(valid);
});

test('homepage translatePage applies surviving content and accessible-name translations', () => {
  assert.ok(i18nLiteral, 'inline i18n dictionary should be extractable');
  assert.ok(translatePageScript, 'translatePage implementation should be extractable');

  const dictionaryContext = {};
  vm.runInNewContext(`globalThis.dictionary = (${i18nLiteral});`, dictionaryContext);
  const profileTitle = {
    innerHTML: '',
    getAttribute(name) {
      return name === 'data-i18n' ? 'profile.title' : null;
    }
  };
  const researchIntro = {
    innerHTML: '',
    getAttribute(name) {
      return name === 'data-i18n' ? 'research.intro' : null;
    }
  };
  const profileHome = {
    attributes: new Map(),
    getAttribute(name) {
      return name === 'data-i18n-aria-label' ? 'a11y.profileHome' : this.attributes.get(name);
    },
    setAttribute(name, value) {
      this.attributes.set(name, value);
    }
  };
  const document = {
    documentElement: { lang: 'en' },
    querySelectorAll(selector) {
      if (selector === '[data-i18n]') return [profileTitle, researchIntro];
      if (selector === '[data-i18n-aria-label]') return [profileHome];
      return [];
    },
    getElementById() {
      return null;
    }
  };

  vm.runInNewContext(
    `const i18n = globalThis.dictionary; ${translatePageScript}\ntranslatePage('zh');`,
    { dictionary: dictionaryContext.dictionary, document }
  );

  assert.equal(document.documentElement.lang, 'zh-CN');
  assert.equal(profileTitle.innerHTML, '博士 &nbsp;·&nbsp; 副研究员');
  assert.equal(
    researchIntro.innerHTML.replace(/<[^>]*>/g, ''),
    '以大模型推理与智能体为核心研究方向，聚焦情境感知推理、自主交互学习、持续学习与适应，以时序智能和科学智能（科学知识与工具挖掘）中的复杂任务为应用牵引。'
  );
  for (const keyword of ['大模型推理与智能体', '情境感知推理', '自主交互学习', '持续学习与适应', '时序智能', '科学智能']) {
    assert.ok(researchIntro.innerHTML.includes('<span class="research-keyword">' + keyword + '</span>'));
  }
  assert.equal(profileHome.attributes.get('aria-label'), '刷新主页');
});

test('homepage hero omits the retired action-button markup', () => {
  assert.deepEqual(
    findRetiredActionClassTokens(indexHtml),
    [],
    'the profile action group and its three links should be removed'
  );
  assert.match(indexHtml, /<div class="profile-badges">/);
});

test('retired action markup detection handles class tokens, quote styles, and attribute order', () => {
  const markupFixture = `
    <div data-region="hero" class="utility profile-actions"></div>
    <a href="#papers" class='profile-action utility'>Papers</a>
    <a class='utility profile-action--primary' data-kind="cta" href="#join">Join</a>
  `;
  assert.deepEqual(
    findRetiredActionClassTokens(markupFixture),
    ['profile-actions', 'profile-action', 'profile-action--primary']
  );
});

test('homepage stylesheet omits CSS dedicated to retired action buttons', () => {
  assert.deepEqual(
    findRetiredActionSelectors(extractStyleText(indexHtml)),
    [],
    'desktop and mobile profile action rules should be removed'
  );
});

test('retired action CSS detection handles qualified, combined, and pseudo-class selectors', () => {
  const cssFixture = `
    <style>
      a.profile-action { color: navy; }
      .card, .utility.profile-actions { display: flex; }
      .profile-action--primary:hover { color: white; }
    </style>
  `;
  assert.deepEqual(
    findRetiredActionSelectors(extractStyleText(cssFixture)),
    ['a.profile-action', '.utility.profile-actions', '.profile-action--primary:hover']
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
