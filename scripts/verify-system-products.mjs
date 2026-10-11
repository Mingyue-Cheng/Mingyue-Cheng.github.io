import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const home = read('index.html');
const projects = read('projects.html');
const sharedScript = read('files/assets/site-language.js');
const css = existsSync(new URL('../files/assets/system-products.css', import.meta.url))
  ? read('files/assets/system-products.css') : '';
const section = home.match(/<!-- ===== Systems Product ===== -->([\s\S]*?)<!-- ===== \/Systems Product ===== -->/)?.[1] || '';
const projectSection = projects.match(/<!-- ===== Systems Product ===== -->([\s\S]*?)<!-- ===== \/Systems Product ===== -->/)?.[1] || '';
const literal = home.match(/const i18n = (\{[\s\S]*?\n\});\n\nlet currentLang/)?.[1];
const copy = vm.runInNewContext(`(${literal})`);
const sharedLiteral = sharedScript.match(/const translations = (\{[\s\S]*?\n  \});\n\n  const navTargets/)?.[1];
const sharedCopy = vm.runInNewContext(`(${sharedLiteral})`);
const plain = html => html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
const expected = {
  en: {
    'systems.heading': 'Systems Product',
    'systems.brand': '科言 · Science Intelligence',
    'systems.lewen': 'Discover scientific literature through quick search and in-depth retrieval.',
    'systems.wenxiu': 'Support academic writing with polishing, proofreading, and translation tools.',
    'systems.visit': 'Visit website'
  },
  zh: {
    'systems.heading': '系统产品',
    'systems.brand': '科言 · 科学智能',
    'systems.lewen': '面向科学文献智能获取，支持快速搜索与深度检索。',
    'systems.wenxiu': '面向学术写作，提供智能润色、批阅纠错与语言翻译工具。',
    'systems.visit': '访问系统'
  }
};

function boundElements(html = section, attribute = 'data-i18n') {
  return [...html.matchAll(new RegExp(`<([a-z][\\w-]*)\\b[^>]*${attribute}="([^"]+)"[^>]*>([\\s\\S]*?)<\\/\\1>`, 'g'))]
    .map(match => ({
      key: match[2], innerHTML: match[3],
      getAttribute(name) { return name === attribute ? this.key : null; }
    }));
}

test('Systems Product is a standalone labelled section immediately before Open Source', () => {
  assert.ok(section, 'Homepage must include the Systems Product module');
  assert.equal((home.match(/id="systems-product"/g) || []).length, 1);
  assert.match(section, /<section class="section systems-products" aria-labelledby="systems-product">/);
  assert.match(section, /<h2 id="systems-product" class="section-heading" data-i18n="systems.heading">Systems Product<\/h2>/);
  assert.match(home, /<!-- ===== \/Systems Product ===== -->\s*<!-- ===== Open Source Projects ===== -->/);
});

test('the two system cards preserve the requested names, order and safe website destinations', () => {
  const cards = [...section.matchAll(/<a\b([^>]*class="system-product-card"[^>]*)>([\s\S]*?)<\/a>/g)];
  assert.equal(cards.length, 2);
  for (const [index, [name, url, id]] of [
    ['科言乐问', 'https://lewen.bdaa.pro/', 'system-product-lewen-name'],
    ['科言文修', 'https://writelearn.bdaa.pro/', 'system-product-wenxiu-name']
  ].entries()) {
    const [, attributes, content] = cards[index];
    assert.ok(attributes.includes(`href="${url}"`));
    assert.match(attributes, /target="_blank"/);
    assert.match(attributes, /rel="noopener noreferrer"/);
    assert.ok(attributes.includes(`aria-labelledby="${id}"`));
    assert.match(content, new RegExp(`<h3 id="${id}" class="system-product-name">${name}<\\/h3>`));
    assert.ok(plain(content).includes(new URL(url).hostname));
  }
  assert.doesNotMatch(section, /<iframe\b|<script\b|data-repo=/);
});

test('each system card embeds its matching user-supplied logo instead of a placeholder icon', () => {
  for (const [page, html] of [['home', section], ['projects', projectSection]]) {
    const cards = [...html.matchAll(/<a\b[^>]*class="system-product-card"[^>]*>([\s\S]*?)<\/a>/g)];
    assert.equal(cards.length, 2);
    for (const [index, [key, name]] of [['lewen', '科言乐问'], ['wenxiu', '科言文修']].entries()) {
      const images = [...cards[index][1].matchAll(/<img\b[^>]*>/g)].map(match => match[0]);
      assert.equal(images.length, 1, `${page}/${name} needs one original logo`);
      for (const attribute of [
        'class="system-product-logo"', `src="files/assets/system-products/${key}-logo.png"`,
        `alt="${name} Logo"`, 'width="64"', 'height="64"', 'loading="lazy"', 'decoding="async"'
      ]) assert.ok(images[0].includes(attribute), `${page}/${name}: ${attribute}`);
      assert.doesNotMatch(cards[index][1], /<svg\b/);
    }
  }
});

for (const [page, html, attribute] of [
  ['home', section, 'data-i18n'], ['projects', projectSection, 'data-page-i18n']
]) {
  for (const [index, [key, name]] of [['lewen', '科言乐问'], ['wenxiu', '科言文修']].entries()) {
    test(`${page}: ${name} groups its logo, name and bilingual brand in one compact header`, () => {
      const cards = [...html.matchAll(/<a\b([^>]*class="system-product-card"[^>]*)>([\s\S]*?)<\/a>/g)];
      assert.equal(cards.length, 2);
      const [, attributes, content] = cards[index];
      const id = `system-product-${key}-name`;
      const header = content.match(/^\s*<div class="system-product-header">\s*(<img\b[^>]*>)\s*<div class="system-product-identity">([\s\S]*?)<\/div>\s*<\/div>/);
      assert.ok(header, `${page}/${name} must place its logo and identity inside the header`);
      assert.ok(header[1].includes(`src="files/assets/system-products/${key}-logo.png"`));
      assert.match(header[2], new RegExp(`^\\s*<h3 id="${id}" class="system-product-name">${name}<\\/h3>\\s*<span class="system-product-brand" ${attribute}="systems.brand">科言 · Science Intelligence<\\/span>\\s*$`));
      assert.ok(attributes.includes(`aria-labelledby="${id}"`));
      assert.equal((html.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1);
      assert.equal((content.match(/class="system-product-name"/g) || []).length, 1);
      assert.equal(plain(content).split(name).length - 1, 1, 'The visible product name must appear only once');
      assert.doesNotMatch(header[0], /system-product-desc/);
      assert.match(content.slice(header[0].length), new RegExp(`^\\s*<p class="system-product-desc" ${attribute}="systems.${key}">`));
    });
  }
}

test('product logo assets preserve the exact supplied originals and cannot be interchanged', () => {
  for (const [key, digest] of [
    ['lewen', '79cdf24697827860f9a500e4a347d302b63f36a96b6ce4919814ce58bfc22f7c'],
    ['wenxiu', '467863996ab00d28857e5b460d0f6273d85d160d8fe21bd4fe727eee185600c5']
  ]) {
    const file = new URL(`../files/assets/system-products/${key}-logo.png`, import.meta.url);
    assert.ok(existsSync(file), `${key} logo asset must exist`);
    assert.equal(createHash('sha256').update(readFileSync(file)).digest('hex'), digest);
  }
});

test('product logos have equal reserved space and retain their full uncropped proportions', () => {
  const rule = css.match(/\.system-product-logo\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(rule, /flex:\s*0 0 64px/);
  assert.match(rule, /width:\s*64px/);
  assert.match(rule, /height:\s*64px/);
  assert.match(rule, /object-fit:\s*contain/);
  assert.doesNotMatch(rule, /filter\s*:|transform\s*:/);
});

test('system product fallback and bilingual copy match the approved concise descriptions', () => {
  const elements = boundElements();
  assert.equal(elements.length, 7);
  for (const lang of ['en', 'zh']) {
    for (const [key, value] of Object.entries(expected[lang])) {
      assert.equal(copy[lang][key], value, `${lang}/${key}`);
    }
  }
  for (const element of elements) assert.equal(plain(element.innerHTML), expected.en[element.key]);
});

test('the real homepage language switch translates every product binding through a round trip', () => {
  const elements = boundElements();
  assert.equal(elements.length, 7);
  const translate = home.match(/function translatePage\(lang\) \{[\s\S]*?\n\}\n\nfunction initLanguageToggle/)?.[0]
    .replace(/\n\nfunction initLanguageToggle$/, '');
  assert.ok(translate);
  const document = {
    documentElement: { lang: 'en' },
    querySelectorAll: selector => selector === '[data-i18n]' ? elements : [],
    getElementById: () => null
  };
  const context = vm.createContext({ document });
  vm.runInContext(`const i18n = ${literal}; ${translate}`, context);
  for (const lang of ['en', 'zh', 'en']) {
    vm.runInContext(`translatePage('${lang}')`, context);
    assert.equal(document.documentElement.lang, lang === 'zh' ? 'zh-CN' : 'en');
    for (const element of elements) assert.equal(element.innerHTML, expected[lang][element.key]);
  }
});

test('system products share one stylesheet and the Prussian-blue palette across both pages', () => {
  for (const html of [home, projects]) {
    const stylesheet = html.match(/<link rel="stylesheet" href="(files\/assets\/system-products\.css[^"]*)">/)?.[1];
    assert.equal(stylesheet, 'files/assets/system-products.css?v=20261011-compact');
    assert.ok(html.indexOf('system-products.css') < html.indexOf('site-theme.css'),
      'Shared theme and content layers must keep final authority over component styles');
  }
  for (const declaration of ['color: var(--accent)', 'border: 1px solid var(--border)', 'border-radius: 14px', 'background: #fff']) {
    assert.ok(css.includes(declaration), declaration);
  }
});

test('Systems Product is integrated into the Open Project page before projects and benchmarks', () => {
  assert.ok(projectSection, 'The existing Open Project page must include Systems Product');
  assert.equal((projects.match(/id="systems-product"/g) || []).length, 1);
  assert.match(projectSection, /<section class="section-block systems-products" aria-labelledby="systems-product">/);
  assert.match(projectSection, /<h2 id="systems-product" class="section-heading" data-page-i18n="systems.heading">Systems Product<\/h2>/);
  assert.match(projects, /<!-- ===== \/Systems Product ===== -->\s*<!-- ===== Open Source ===== -->/);
  const headings = [...projects.matchAll(/<h2 id="([^"]+)" class="section-heading"/g)].map(match => match[1]);
  assert.deepEqual(headings, ['systems-product', 'opensource', 'datasets']);
  const jumpNav = projects.match(/<nav class="page-jump-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || '';
  const links = [...jumpNav.matchAll(/<a href="([^"]+)" data-page-i18n="([^"]+)"/g)].map(match => [match[1], match[2]]);
  assert.deepEqual(links, [
    ['#systems-product', 'systems.heading'], ['#opensource', 'opensource.heading'], ['#datasets', 'datasets.heading']
  ]);
});

test('both pages display the same two system cards, original logos and safe destinations', () => {
  const cards = html => [...html.matchAll(/<a\b[^>]*class="system-product-card"[^>]*>[\s\S]*?<\/a>/g)]
    .map(match => match[0].replaceAll('data-page-i18n=', 'data-i18n=').replace(/\s+/g, ' ').trim());
  assert.equal(cards(projectSection).length, 2);
  assert.deepEqual(cards(projectSection), cards(section));
});

test('projects reuse every English and Chinese system-product translation from the homepage', () => {
  const elements = boundElements(projectSection, 'data-page-i18n');
  assert.equal(elements.length, 7);
  for (const lang of ['en', 'zh']) {
    for (const [key, value] of Object.entries(expected[lang])) {
      assert.equal(sharedCopy[lang].pages['projects.html'].content[key], value, `${lang}/${key}`);
      assert.equal(sharedCopy[lang].pages['projects.html'].content[key], copy[lang][key]);
    }
  }
  for (const element of elements) assert.equal(plain(element.innerHTML), expected.en[element.key]);
});

test('the real shared language code translates the products and jump link through a round trip', () => {
  const jumpNav = projects.match(/<nav class="page-jump-nav"[^>]*>([\s\S]*?)<\/nav>/)?.[1] || '';
  const elements = boundElements(projectSection + jumpNav, 'data-page-i18n')
    .filter(element => element.key.startsWith('systems.'));
  assert.equal(elements.length, 8);
  const boundary = sharedScript.indexOf('  function initLanguageToggle()');
  assert.ok(boundary > 0);
  const runtime = sharedScript.slice(0, boundary).replace(/^\(function \(\) \{\n/, '');
  const document = {
    documentElement: { lang: 'en' },
    querySelector: () => null,
    querySelectorAll: selector => selector === '[data-page-i18n]' ? elements : [],
    getElementById: () => null
  };
  const context = vm.createContext({ document, window: { location: { pathname: '/projects.html' } } });
  vm.runInContext(runtime, context);
  for (const lang of ['en', 'zh', 'en']) {
    vm.runInContext(`applyLanguage('${lang}')`, context);
    assert.equal(document.documentElement.lang, lang === 'zh' ? 'zh-CN' : 'en');
    for (const element of elements) assert.equal(element.innerHTML, expected[lang][element.key]);
  }
});

test('system cards use two desktop columns and one mobile column with wrapping footers', () => {
  assert.match(css, /\.system-product-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
  assert.match(css, /@media \(max-width: 680px\)\s*\{\s*\.system-product-grid\s*\{[^}]*grid-template-columns:\s*minmax\(0, 1fr\)/);
  assert.match(css, /\.system-product-card\s*\{[^}]*min-width:\s*0/);
  assert.match(css, /\.system-product-footer\s*\{[^}]*flex-wrap:\s*wrap/);
  assert.match(css, /\.system-product-domain\s*\{[^}]*overflow-wrap:\s*anywhere/);
});

test('system cards use compact desktop and mobile spacing without clipping content', () => {
  const grid = css.match(/\.system-product-grid\s*\{([^}]+)\}/)?.[1] || '';
  const card = css.match(/\.system-product-card\s*\{([^}]+)\}/)?.[1] || '';
  const footer = css.match(/\.system-product-footer\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(grid, /gap:\s*14px;/);
  assert.match(card, /padding:\s*18px 20px;/);
  assert.match(footer, /padding-top:\s*10px;/);
  assert.match(css, /@media \(max-width: 680px\)[\s\S]*?\.system-product-card\s*\{\s*padding:\s*16px;/);
  assert.doesNotMatch(card, /(?:^|;)\s*(?:height|min-height|max-height)\s*:/);
  assert.doesNotMatch(css, /(?:line-clamp|text-overflow)\s*:|overflow\s*:\s*(?:hidden|clip)|white-space\s*:\s*nowrap/);
});

test('system product identity keeps the name above the brand beside the logo', () => {
  const header = css.match(/\.system-product-header\s*\{([^}]+)\}/)?.[1] || '';
  const identity = css.match(/\.system-product-identity\s*\{([^}]+)\}/)?.[1] || '';
  const name = css.match(/\.system-product-name\s*\{([^}]+)\}/)?.[1] || '';
  const brand = css.match(/\.system-product-brand\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(header, /display:\s*flex;/);
  assert.match(header, /align-items:\s*center;/);
  assert.match(header, /gap:\s*12px;/);
  assert.match(header, /margin-bottom:\s*12px;/);
  assert.doesNotMatch(header, /flex-wrap\s*:/);
  assert.match(identity, /min-width:\s*0;/);
  assert.match(name, /font-size:\s*22px;/);
  assert.match(name, /line-height:\s*1\.4;/);
  assert.match(name, /margin:\s*0 0 3px;/);
  assert.match(brand, /display:\s*block;/);
  assert.match(brand, /font-size:\s*12px;/);
  assert.match(brand, /line-height:\s*1\.5;/);
});

test('product descriptions use compact left-aligned text that overrides global paragraph alignment', () => {
  const rule = css.match(/html\[lang\] \.systems-products \.system-product-desc\s*\{([^}]+)\}/)?.[1] || '';
  assert.ok(rule, 'The description selector must outrank the shared global paragraph rules');
  assert.match(rule, /color:\s*#516773;/);
  assert.match(rule, /font-size:\s*14px;/);
  assert.match(rule, /line-height:\s*1\.65;/);
  assert.match(rule, /text-align:\s*left;/);
  assert.match(rule, /text-align-last:\s*left;/);
  assert.match(rule, /margin:\s*0 0 12px;/);
});

test('system cards retain visible keyboard focus and disable motion when requested', () => {
  assert.match(css, /\.system-product-card:focus-visible\s*\{[^}]*outline:\s*3px solid/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.system-product-card\s*\{[^}]*transition:\s*none/);
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.system-product-card:hover\s*\{[^}]*transform:\s*none/);
});
