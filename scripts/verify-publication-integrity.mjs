import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pages = [
  ['index.html', readFileSync(join(root, 'index.html'), 'utf8')],
  ['publications.html', readFileSync(join(root, 'publications.html'), 'utf8')]
];
const indexHtml = pages[0][1];
const publicationsHtml = pages[1][1];
const newsHtml = readFileSync(join(root, 'news.html'), 'utf8');
const siteLanguagePath = join(root, 'files/assets/site-language.js');
const siteLanguageSource = readFileSync(siteLanguagePath, 'utf8');
const titleBaseline = JSON.parse(
  readFileSync(join(root, 'scripts/fixtures/publication-titles.json'), 'utf8')
);

function withoutComments(source) {
  return source.replace(/<!--[\s\S]*?-->/g, '');
}

function sectionBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing start marker: ${startMarker}`);
  assert.ok(end > start, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

const namedEntities = new Map([
  ['amp', '&'],
  ['apos', "'"],
  ['gt', '>'],
  ['hellip', '…'],
  ['lt', '<'],
  ['mdash', '—'],
  ['middot', '·'],
  ['nbsp', ' '],
  ['ndash', '–'],
  ['quot', '"']
]);

function decodeHtmlEntities(source) {
  return source.replace(/&(#(?:x[\da-f]+|\d+)|[a-z][a-z\d]+);/gi, (entity, body) => {
    if (body.startsWith('#')) {
      const hexadecimal = body[1]?.toLowerCase() === 'x';
      const digits = body.slice(hexadecimal ? 2 : 1);
      const codePoint = Number.parseInt(digits, hexadecimal ? 16 : 10);
      if (Number.isInteger(codePoint) && codePoint > 0 && codePoint <= 0x10ffff) {
        return String.fromCodePoint(codePoint);
      }
      return entity;
    }
    return namedEntities.get(body.toLowerCase()) ?? entity;
  });
}

function textFromHtml(source) {
  return decodeHtmlEntities(source.replace(/<[^>]+>/g, ''))
    .replace(/\s+/gu, ' ')
    .trim();
}

function normalizeText(source) {
  return textFromHtml(source)
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[–—-]/g, '-')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function extractArxivId(href) {
  return href.match(
    /^https?:\/\/(?:www\.)?arxiv\.org\/(?:abs|html|pdf)\/(\d{4}\.\d{4,5})(?:v\d+)?(?:\.pdf)?(?:[?#].*)?$/i
  )?.[1] || null;
}

function publicationEntries(source) {
  return [...withoutComments(source).matchAll(
    /<li\b(?=[^>]*\bdata-tags\s*=\s*(?:"[^"]*"|'[^']*'))[^>]*>[\s\S]*?<\/li>/gi
  )]
    .map((match) => match[0]);
}

function attributeValue(openTag, name) {
  const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = openTag.match(new RegExp(`\\b${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, 'i'));
  return match?.[1] ?? match?.[2] ?? null;
}

function publicationTitle(html) {
  const candidates = [...html.matchAll(/<strong\b([^>]*)>([\s\S]*?)<\/strong>/gi)]
    .map((match) => {
      const attributes = match[1];
      const text = textFromHtml(match[2]);
      const className = attributeValue(`<strong${attributes}>`, 'class') || '';
      const explicitTitle = attributeValue(`<strong${attributes}>`, 'data-publication-title') !== null
        || /(?:^|\s)publication-title(?:\s|$)/i.test(className);
      const metadata = /(?:^|\s)(?:badge|status|venue|award)(?:\s|$)/i.test(className);
      const semanticLength = (text.match(/[\p{L}\p{N}]/gu) || []).length;
      return { explicitTitle, metadata, semanticLength, text };
    })
    .filter((candidate) => candidate.text && !candidate.metadata);

  const explicit = candidates.filter((candidate) => candidate.explicitTitle);
  const pool = explicit.length ? explicit : candidates;
  return pool.reduce((best, candidate) => {
    if (!best || candidate.semanticLength > best.semanticLength) return candidate;
    return best;
  }, null)?.text || '';
}

function publicationRecords(source, page) {
  return publicationEntries(source).map((html) => {
    const title = publicationTitle(html);
    const hrefs = [...html.matchAll(/<a\b[^>]*>/gi)]
      .map((match) => attributeValue(match[0], 'href'))
      .filter(Boolean);
    return {
      page,
      html,
      title,
      normalizedTitle: normalizeText(title),
      arxivIds: hrefs.map(extractArxivId).filter(Boolean)
    };
  });
}

function arxivTitleConflictsFromRecords(publicationRecordsToCheck) {
  const titlesById = new Map();

  for (const record of publicationRecordsToCheck) {
    for (const id of record.arxivIds) {
      const titles = titlesById.get(id) || new Map();
      titles.set(record.normalizedTitle, record.title);
      titlesById.set(id, titles);
    }
  }

  return [...titlesById]
    .filter(([, titles]) => titles.size > 1)
    .map(([id, titles]) => `${id}: ${[...titles.values()].join(' | ')}`);
}

function arxivTitleConflicts(source, page = 'fixture.html') {
  return arxivTitleConflictsFromRecords(publicationRecords(source, page));
}

function assertCorePublicationSemantics(source) {
  const liveSource = withoutComments(source);
  const head = sectionBetween(liveSource, '<head>', '</head>');
  const body = sectionBetween(liveSource, '<body>', '</body>');
  assert.match(
    head,
    /<link rel="canonical" href="https:\/\/mingyue-cheng\.github\.io\/publications\.html">/,
    'canonical link must be live markup'
  );
  assert.equal((body.match(/<h1\b/g) || []).length, 1, 'exactly one live h1');
}

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
    event.target ||= this;
    event.currentTarget = this;
    for (const listener of this.listeners.get(event.type) || []) listener.call(this, event);
  }

  click() {
    this.dispatchEvent({ type: 'click' });
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
    const enabled = force === undefined ? !this.contains(token) : Boolean(force);
    if (enabled) this.add(token);
    else this.remove(token);
    return enabled;
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

class FakeElement extends FakeEventTarget {
  constructor({ tagName = 'div', classes = [], attributes = {} } = {}) {
    super();
    this.tagName = tagName.toUpperCase();
    this.classList = new FakeClassList(classes);
    this.attributes = new Map(Object.entries(attributes));
    this.style = { display: '', visibility: '' };
    this.children = [];
    this.parentElement = null;
    this.nextElementSibling = null;
    this.disabled = false;
    this._textContent = '';
    this._innerHTML = '';
    this.textContentWrites = 0;
    this.innerHTMLWrites = 0;
  }

  set textContent(value) {
    this._textContent = String(value);
    this._innerHTML = escapeHtml(value);
    this.textContentWrites += 1;
  }

  get textContent() {
    return this._textContent;
  }

  set innerHTML(value) {
    this._innerHTML = String(value);
    this._textContent = String(value).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    this.innerHTMLWrites += 1;
  }

  get innerHTML() {
    return this._innerHTML;
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

  scrollIntoView() {
    this.scrolledIntoView = true;
  }

  querySelector(selector) {
    if (selector === '.pub-year-toggle') {
      return this.children.find((child) => child.classList.contains('pub-year-toggle')) || null;
    }
    return null;
  }

  querySelectorAll(selector) {
    if (selector === 'li') return this.children.filter((child) => child.tagName === 'LI');
    if (selector === 'a[href]') return this.children.filter((child) => child.tagName === 'A');
    return [];
  }

  closest(selector) {
    if (selector === '.pub-year-heading' && this.classList.contains('pub-year-heading')) return this;
    return this.parentElement?.closest(selector) || null;
  }
}

class FakeDocument extends FakeEventTarget {
  constructor(pathname = '/publications.html') {
    super();
    this.readyState = 'complete';
    this.documentElement = { lang: '' };
    this.pathname = pathname;
    this.single = new Map();
    this.multiple = new Map();
  }

  getElementById(id) {
    return this.single.get(`#${id}`) || null;
  }

  querySelector(selector) {
    return this.single.get(selector) || null;
  }

  querySelectorAll(selector) {
    return this.multiple.get(selector) || [];
  }
}

function createLanguageHarness({ pathname = '/publications.html', storedLanguage = 'en' } = {}) {
  const document = new FakeDocument(pathname);
  const window = new FakeEventTarget();
  window.location = { pathname };
  window.getComputedStyle = () => ({ display: 'block', visibility: 'visible' });

  const subtitleSelector = pathname.endsWith('publications.html') ? '.pub-hero-sub' : '.page-hero-sub';
  const titleSelector = pathname.endsWith('publications.html') ? '.pub-hero-title' : '.page-hero-title';
  const subtitle = new FakeElement();
  const title = new FakeElement();
  const languageToggle = new FakeElement({ tagName: 'button' });
  document.single.set(subtitleSelector, subtitle);
  document.single.set(titleSelector, title);
  document.single.set('#languageToggle', languageToggle);

  const storage = new Map([['homepage-language', storedLanguage]]);
  const localStorage = {
    getItem(key) {
      return storage.get(key) ?? null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    }
  };

  vm.runInNewContext(siteLanguageSource, {
    document,
    getComputedStyle: window.getComputedStyle,
    localStorage,
    window
  }, { filename: siteLanguagePath });

  return { document, languageToggle, localStorage, subtitle, title };
}

function publicationBehaviorSource(source, startMarker, endMarker) {
  return sectionBetween(source, startMarker, endMarker).slice(startMarker.length);
}

function createPublicationBehaviorHarness({ collapsible, collapsedByDefault = false, hash = '' }) {
  const document = new FakeDocument('/index.html');
  const window = new FakeEventTarget();
  window.location = { hash };
  const allButton = new FakeElement({
    tagName: 'button',
    classes: ['pub-filter-btn', 'active'],
    attributes: { 'aria-pressed': 'true', 'data-filter': 'all' }
  });
  const timeButton = new FakeElement({
    tagName: 'button',
    classes: ['pub-filter-btn'],
    attributes: { 'aria-pressed': 'false', 'data-filter': 'timeseries' }
  });
  const agentButton = new FakeElement({
    tagName: 'button',
    classes: ['pub-filter-btn'],
    attributes: { 'aria-pressed': 'false', 'data-filter': 'llm-agent' }
  });
  const timeItem = new FakeElement({ tagName: 'li', attributes: { 'data-tags': 'timeseries' } });
  const agentItem = new FakeElement({ tagName: 'li', attributes: { 'data-tags': 'agent llm' } });
  const timeList = new FakeElement({ tagName: 'ol', attributes: { id: 'publication-list-2025' } });
  const agentList = new FakeElement({ tagName: 'ol', attributes: { id: 'publication-list-2026' } });
  timeList.append(timeItem);
  agentList.append(agentItem);
  const timeHeading = new FakeElement({ tagName: 'h3', classes: ['pub-year-heading'], attributes: { id: 'year-2025', 'data-default-collapsed': String(collapsedByDefault) } });
  const agentHeading = new FakeElement({ tagName: 'h3', classes: ['pub-year-heading'], attributes: { id: 'year-2026' } });
  timeHeading.nextElementSibling = timeList;
  agentHeading.nextElementSibling = agentList;

  let timeToggle = null;
  let agentToggle = null;
  if (collapsible) {
    timeToggle = new FakeElement({
      tagName: 'button',
      classes: ['pub-year-toggle'],
      attributes: { 'aria-expanded': 'true' }
    });
    agentToggle = new FakeElement({
      tagName: 'button',
      classes: ['pub-year-toggle'],
      attributes: { 'aria-expanded': 'true' }
    });
    timeHeading.append(timeToggle);
    agentHeading.append(agentToggle);
  }

  document.multiple.set('.pub-filter-btn', [allButton, timeButton, agentButton]);
  document.multiple.set('.pub-list li[data-tags]', [timeItem, agentItem]);
  document.multiple.set('.pub-year-heading', [timeHeading, agentHeading]);
  document.multiple.set('.pub-year-toggle', collapsible ? [timeToggle, agentToggle] : []);
  document.multiple.set('.pub-section-gap', []);

  return {
    agentButton,
    agentHeading,
    agentItem,
    agentList,
    agentToggle,
    allButton,
    document,
    window,
    timeButton,
    timeHeading,
    timeItem,
    timeList,
    timeToggle
  };
}

const records = pages.flatMap(([page, html]) => publicationRecords(html, page));

function findRecord(page, title) {
  const normalizedTitle = normalizeText(title);
  const matches = records.filter(
    (record) => record.page === page && record.normalizedTitle === normalizedTitle
  );
  assert.equal(matches.length, 1, `${page} must contain exactly one record for “${title}”`);
  return matches[0];
}

test('publication parsing accepts attribute reordering, extra classes, and single quotes', () => {
  const fixture = `
    <li aria-label='paper' class='publication featured' data-kind='article' data-tags='timeseries llm'>
      Ada Lovelace, <strong>Reasoning over Time</strong>.
      [<a rel='noopener' href='https://arxiv.org/pdf/2608.12345.pdf'>PDF</a>]
    </li>`;

  const fixtureRecords = publicationRecords(fixture, 'fixture.html');
  assert.equal(fixtureRecords.length, 1);
  assert.equal(fixtureRecords[0].title, 'Reasoning over Time');
  assert.deepEqual(fixtureRecords[0].arxivIds, ['2608.12345']);
});

test('publication normalization preserves Unicode letters and decodes named and numeric entities', () => {
  assert.equal(
    normalizeText('Δ&nbsp;Forecasting &amp; 时序 &#x3B1; &#945;'),
    'δ forecasting 时序 α α'
  );
});

test('publication title selection ignores a trailing presentation badge', () => {
  const fixture = `
    <li data-tags="llm">
      <strong>Ada Lovelace</strong>, <strong>ΔForecasting 与时序推理</strong>.
      <strong>Best Paper</strong>
      [<a href="https://arxiv.org/abs/2608.12345">ArXiv</a>]
    </li>`;

  const [record] = publicationRecords(fixture, 'fixture.html');
  assert.equal(record.title, 'ΔForecasting 与时序推理');
  assert.equal(record.normalizedTitle, 'δforecasting 与时序推理');
});

test('in-memory conflict fixtures expose one arXiv ID mapped to different titles', () => {
  const fixture = `
    <li data-tags="llm"><strong>Ada Lovelace</strong>, <strong>Reasoning Alpha</strong>.
      [<a href="https://arxiv.org/abs/2608.12345">ArXiv</a>]</li>
    <li class='featured' data-tags='timeseries'><strong>Grace Hopper</strong>, <strong>Reasoning Beta</strong>.
      [<a href='https://www.arxiv.org/pdf/2608.12345v2.pdf?download=1'>PDF</a>]</li>`;

  assert.deepEqual(
    arxivTitleConflicts(fixture),
    ['2608.12345: Reasoning Alpha | Reasoning Beta']
  );
});

test('publication title baseline locks the complete 72-paper order on both publication surfaces', () => {
  assert.equal(titleBaseline.publications.length, 72, 'fixture must intentionally list 72 publications');
  assert.deepEqual(
    publicationRecords(publicationsHtml, 'publications.html').map((record) => record.title),
    titleBaseline.publications
  );

  const selected = sectionBetween(
    indexHtml,
    '<!-- ===== Selected Publications ===== -->',
    '<!-- ===== Open Source Projects ===== -->'
  );
  assert.deepEqual(
    publicationRecords(selected, 'index.html').map((record) => record.title),
    titleBaseline.publications
  );
});

test('semantic checks reject a canonical link hidden inside comments', () => {
  const fixture = `<!doctype html><html><head>
    <!-- <link rel="canonical" href="https://mingyue-cheng.github.io/publications.html"> -->
  </head><body><h1>Publications</h1></body></html>`;

  assert.throws(
    () => assertCorePublicationSemantics(fixture),
    /canonical link must be live markup/
  );
});

test('semantic checks reject an h1 hidden inside comments', () => {
  const fixture = `<!doctype html><html><head>
    <link rel="canonical" href="https://mingyue-cheng.github.io/publications.html">
  </head><body><!-- <h1>Publications</h1> --></body></html>`;

  assert.throws(
    () => assertCorePublicationSemantics(fixture),
    /exactly one live h1/
  );
});

test('shared language runtime preserves the full English Publications subtitle HTML', () => {
  const harness = createLanguageHarness({ storedLanguage: 'en' });
  assert.equal(
    harness.subtitle.innerHTML,
    'Full publication list of <a href="index.html">Mingyue Cheng</a>. (* Corresponding Author, <sup>+</sup> Equal Contribution)'
  );
  assert.equal(harness.subtitle.innerHTMLWrites, 1, 'trusted Publications subtitle uses the explicit HTML path');
});

test('shared language runtime preserves the full Chinese Publications subtitle HTML', () => {
  const harness = createLanguageHarness({ storedLanguage: 'zh' });
  assert.equal(
    harness.subtitle.innerHTML,
    '<a href="index.html">程明月</a>的完整论文列表。（* 通讯作者，<sup>+</sup> 共同一作）'
  );
  assert.equal(harness.subtitle.innerHTMLWrites, 1, 'trusted Publications subtitle uses the explicit HTML path');
});

test('shared language runtime keeps ordinary page subtitles on textContent', () => {
  const harness = createLanguageHarness({ pathname: '/news.html', storedLanguage: 'en' });
  assert.equal(harness.subtitle.textContent, 'Latest news from USTC AGI Research Group.');
  assert.equal(harness.subtitle.innerHTMLWrites, 0, 'ordinary subtitles must not use the HTML setter');
  assert.equal(harness.subtitle.textContentWrites, 1);
});

test('the actual Publications filter script synchronizes active, aria, item, and section visibility', () => {
  const harness = createPublicationBehaviorHarness({ collapsible: false });
  const source = publicationBehaviorSource(
    publicationsHtml,
    '// Publication filter',
    '// Back to top'
  );
  vm.runInNewContext(source, { document: harness.document }, { filename: 'publications-filter.js' });

  harness.timeButton.click();

  assert.equal(harness.allButton.classList.contains('active'), false);
  assert.equal(harness.allButton.getAttribute('aria-pressed'), 'false');
  assert.equal(harness.timeButton.classList.contains('active'), true);
  assert.equal(harness.timeButton.getAttribute('aria-pressed'), 'true');
  assert.equal(harness.timeItem.style.display, '');
  assert.equal(harness.agentItem.style.display, 'none');
  assert.equal(harness.timeHeading.style.display, '');
  assert.equal(harness.timeList.style.display, '');
  assert.equal(harness.agentHeading.style.display, 'none');
  assert.equal(harness.agentList.style.display, 'none');
});

test('the actual homepage collapse and filter script keeps visual and ARIA state synchronized', () => {
  const harness = createPublicationBehaviorHarness({ collapsible: true });
  const source = publicationBehaviorSource(
    indexHtml,
    '// ===== Publication Year Collapse + Filter =====',
    '\nfunction initClustrMaps'
  );
  vm.runInNewContext(source, { document: harness.document, window: harness.window }, { filename: 'homepage-publication-filter.js' });

  harness.timeToggle.click();
  assert.equal(harness.timeHeading.classList.contains('pub-year-collapsed'), true);
  assert.equal(harness.timeToggle.getAttribute('aria-expanded'), 'false');
  assert.equal(harness.timeList.style.display, 'none');

  harness.timeButton.click();
  assert.equal(harness.timeButton.classList.contains('active'), true);
  assert.equal(harness.timeButton.getAttribute('aria-pressed'), 'true');
  assert.equal(harness.allButton.getAttribute('aria-pressed'), 'false');
  assert.equal(harness.timeItem.style.display, '');
  assert.equal(harness.agentItem.style.display, 'none');
  assert.equal(harness.timeHeading.style.display, '');
  assert.equal(harness.timeList.style.display, '');
  assert.equal(harness.timeToggle.disabled, true);
  assert.equal(harness.timeToggle.getAttribute('aria-expanded'), 'true');

  harness.allButton.click();
  assert.equal(harness.timeToggle.disabled, false);
  assert.equal(harness.timeHeading.classList.contains('pub-year-collapsed'), true);
  assert.equal(harness.timeToggle.getAttribute('aria-expanded'), 'false');
  assert.equal(harness.timeList.style.display, 'none');
});

test('older homepage years start collapsed and filters preserve subsequent user choices', () => {
  const harness = createPublicationBehaviorHarness({ collapsible: true, collapsedByDefault: true });
  const source = publicationBehaviorSource(indexHtml, '// ===== Publication Year Collapse + Filter =====', '\nfunction initClustrMaps');
  vm.runInNewContext(source, { document: harness.document, window: harness.window });
  assert.equal(harness.timeList.style.display, 'none');
  assert.equal(harness.timeToggle.getAttribute('aria-expanded'), 'false');
  assert.equal(harness.agentList.style.display, '');
  assert.equal(harness.timeHeading.style.display, '', 'Year heading remains visible');
  harness.timeButton.click();
  assert.equal(harness.timeList.style.display, '');
  harness.allButton.click();
  assert.equal(harness.timeList.style.display, 'none');
  harness.timeToggle.click();
  harness.agentButton.click();
  harness.allButton.click();
  assert.equal(harness.timeList.style.display, '', 'Returning to All preserves a manually expanded year');
});

test('year and list fragments reveal collapsed publications on load and hash changes', () => {
  for (const hash of ['#year-2025', '#publication-list-2025']) {
    const harness = createPublicationBehaviorHarness({ collapsible: true, collapsedByDefault: true, hash });
    const source = publicationBehaviorSource(indexHtml, '// ===== Publication Year Collapse + Filter =====', '\nfunction initClustrMaps');
    vm.runInNewContext(source, { document: harness.document, window: harness.window });
    assert.equal(harness.timeList.style.display, '');
    assert.equal(harness.timeToggle.getAttribute('aria-expanded'), 'true');
    assert.equal(harness.timeHeading.scrolledIntoView, true);
    harness.agentButton.click();
    harness.window.dispatchEvent({ type: 'hashchange' });
    assert.equal(harness.allButton.getAttribute('aria-pressed'), 'true');
    assert.equal(harness.timeHeading.style.display, '');
    assert.equal(harness.timeList.style.display, '');
  }
});

for (const [page, source] of pages) {
  test(`${page} merges the contextual-cognition survey into Preprint without a separate survey group`, () => {
    const title = 'A Comprehensive Survey of the LLM-Based Agent: The Contextual Cognition Perspective';
    const preprintSection = sectionBetween(source, '<!-- ===== Preprint ===== -->', '<!-- ===== 2026 ===== -->');
    const preprintList = preprintSection.match(/<ol\b[^>]*>[\s\S]*?<\/ol>/)?.[0] || '';
    const entries = publicationEntries(preprintList);
    assert.equal(entries.length, 7, `${page} must contain seven preprints in one list`);
    assert.equal(publicationTitle(entries.at(-1)), title, `${page} must append the survey after the existing preprints`);
    const entry = entries.at(-1);
    assert.equal(publicationRecords(source, page).filter(record => record.title === title).length, 1);
    assert.equal(textFromHtml(entry).split(title)[0].replace(/,\s*$/, ''),
      'Mingyue Cheng, Daoyu Wang, Shuo Yu, Qingchuan Li, Jie Ouyang, Yucong Luo, Yiju Zhang, Qi Liu*, Enhong Chen');
    assert.match(entry, /^<li data-tags="agent llm">/);
    assert.match(entry, /\. \(Preprint\) \[<a href="https:\/\/www\.preprints\.org\/manuscript\/202604\.0935" target="_blank" rel="noopener">Preprint<\/a>\]/);
    assert.doesNotMatch(source, /year-survey|publication-list-surveys|pub\.survey|Released Survey|已发布综述/);
  });

  test(`${page} keeps the requested author order for the time-series forecasting survey`, () => {
    const title = 'A Comprehensive Survey of Time Series Forecasting: Concepts, Challenges, and Future Directions';
    const records = publicationRecords(source, page).filter((record) => record.title === title);
    assert.equal(records.length, 1, `${page} must contain exactly one matching survey`);
    const authors = textFromHtml(records[0].html).split(title)[0].replace(/,\s*$/, '');
    assert.equal(authors, 'Mingyue Cheng, Xiaoyu Tao, Zhiding Liu, Qi Liu*, Jintao Zhang, Tingyue Pan, Shilong Zhang, Panjing He, Xiaohan Zhang, Daoyu Wang, Jiahao Wang, Enhong Chen');
  });

  test(`${page} files the TKDE accepted forecasting survey in 2026 with its original links`, () => {
    const title = 'A Comprehensive Survey of Time Series Forecasting: Concepts, Challenges, and Future Directions';
    const entry = findRecord(page, title).html;
    assert.match(entry, /<em>IEEE Transactions on Knowledge and Data Engineering \(IEEE TKDE\) Accepted<\/em>\./);
    assert.doesNotMatch(entry, /\(Preprint\)/);
    assert.match(entry, /^<li data-tags="timeseries">/);
    assert.ok(entry.includes('href="https://d197for5662m48.cloudfront.net/documents/publicationstatus/253323/preprint_pdf/0d1d8e876fb85a212190bc9200dcc3f3.pdf"'));
    assert.ok(entry.includes('href="https://github.com/USTCAGI/Awesome-Papers-Time-Series-Forecasting"'));
    assert.ok(sectionBetween(source, '<!-- ===== 2026 ===== -->', '<!-- ===== 2025 ===== -->').includes(entry));
    assert.ok(!sectionBetween(source, '<!-- ===== Preprint ===== -->', '<!-- ===== 2026 ===== -->').includes(title));
  });
}

test('Time-R1 uses the approved CIKM 2026 citation on both publication surfaces', () => {
  const title = 'Time Series Forecasting as Reasoning: A Slow-Thinking Approach with Reinforced LLMs';
  const authors = 'Yitong Zhou, Yucong Luo, <strong>Mingyue Cheng*</strong>, Jiahao Wang, Daoyu Wang, Tingyue Pan, Jintao Zhang, Qi Liu, Enhong Chen';

  for (const page of ['index.html', 'publications.html']) {
    const record = findRecord(page, title);
    assert.ok(
      record.html.startsWith(`<li data-tags="timeseries agent llm">${authors}, <strong>${title}</strong>.`),
      `${page} Time-R1 exact author order`
    );
    assert.match(record.html, /<em>ACM CIKM 2026 Accepted<\/em>\./, `${page} Time-R1 status`);
    assert.ok(
      record.html.includes('href="https://arxiv.org/pdf/2506.10630"'),
      `${page} Time-R1 PDF must use arXiv 2506.10630`
    );
    assert.ok(
      record.html.includes('href="https://github.com/lqzxt/Time-R1"'),
      `${page} Time-R1 code link`
    );
  }
});

test('one arXiv identifier never maps to different normalized publication titles', () => {
  const conflicts = arxivTitleConflictsFromRecords(records);

  assert.deepEqual(
    conflicts,
    [],
    `Each arXiv ID must identify one paper title; conflicts: ${conflicts.join('; ')}`
  );
});

test('TokenCast keeps arXiv 2508.09191 on the complete Publications page', () => {
  const record = findRecord(
    'publications.html',
    'From Values to Tokens: An LLM-Driven Framework for Context-aware Time Series Forecasting via Symbolic Discretization'
  );
  assert.deepEqual(record.arxivIds, ['2508.09191']);
});

test('StepPO title and authors stay pinned to the matching arXiv v1', () => {
  const title = 'StepPO: Step-Aligned Policy Optimization for Agentic Reinforcement Learning';
  const authors = 'Daoyu Wang, Qingchuan Li, <strong>Mingyue Cheng</strong>, Jie Ouyang, Shuo Yu, Qi Liu, Enhong Chen';
  const record = findRecord('publications.html', title);
  assert.ok(
    record.html.startsWith(`<li data-tags="agent llm">${authors}, <strong>${title}</strong>.`),
    'the StepPO v1 author order must remain synchronized with its pinned title'
  );
  assert.ok(
    record.html.includes('href="https://arxiv.org/pdf/2604.18401v1"'),
    'the StepPO PDF must not drift to the renamed latest arXiv version'
  );

  const newsItem = publicationEntries(
    newsHtml.replace(/<li class="news-item"/g, '<li data-tags="news"')
  ).find((entry) => entry.includes(title)) || '';
  assert.ok(newsItem, 'the StepPO news item should remain present');
  assert.ok(
    newsItem.includes('href="https://arxiv.org/abs/2604.18401v1"'),
    'the StepPO news link must point to the title-matching arXiv v1'
  );
});

test('homepage presents the complete year-grouped publication catalog with a link to Publications', () => {
  const selected = sectionBetween(
    indexHtml,
    '<!-- ===== Selected Publications ===== -->',
    '<!-- ===== Open Source Projects ===== -->'
  );
  const selectedEntries = publicationEntries(selected);
  const requiredTitles = titleBaseline.publications;

  assert.equal(
    selectedEntries.length,
    72,
    `Selected Publications must contain the complete 72-paper catalog; found ${selectedEntries.length}`
  );
  assert.match(selected, /<a\b[^>]*href="publications\.html"[^>]*>/, 'link to full publication list');
  for (const title of requiredTitles) {
    assert.equal(
      selectedEntries.filter((entry) => normalizeText(entry).includes(normalizeText(title))).length,
      1,
      `Selected Publications must contain “${title}” exactly once`
    );
  }
  const completeEntries = publicationEntries(publicationsHtml);
  assert.equal(completeEntries.length, 72, `Publications page must retain the complete list; found ${completeEntries.length}`);
  assert.deepEqual(selectedEntries.map(normalizeText), completeEntries.map(normalizeText));
});

test('Publications page has an accessible semantic shell and social metadata', () => {
  const livePublicationsHtml = withoutComments(publicationsHtml);
  const head = sectionBetween(livePublicationsHtml, '<head>', '</head>');
  const body = sectionBetween(livePublicationsHtml, '<body>', '</body>');

  assertCorePublicationSemantics(publicationsHtml);
  for (const property of ['og:title', 'og:description', 'og:url']) {
    assert.match(head, new RegExp(`<meta property="${property}" content="[^"]+">`));
  }
  assert.match(head, /<meta property="og:type" content="website">/);
  for (const name of ['twitter:card', 'twitter:title', 'twitter:description']) {
    assert.match(head, new RegExp(`<meta name="${name}" content="[^"]+">`));
  }

  assert.match(
    body,
    /^<body>\s*<a class="skip-link" href="#main-content">Skip to main content<\/a>/
  );
  assert.equal((body.match(/<main\b/g) || []).length, 1, 'exactly one main landmark');
  assert.equal((body.match(/<\/main>/g) || []).length, 1, 'main landmark closes once');
  assert.match(body, /<main id="main-content" tabindex="-1">/);
  assert.equal((body.match(/<h1\b/g) || []).length, 1, 'exactly one h1');
  assert.match(
    body,
    /<nav class="nav-links" id="primary-nav" aria-label="Primary navigation">[\s\S]*?<a href="publications\.html" aria-current="page">Publications<\/a>/
  );

  const filterGroup = body.match(
    /<div class="pub-filters" role="group" aria-label="Filter publications by research area">[\s\S]*?<\/div>/
  )?.[0] || '';
  assert.ok(filterGroup, 'publication filters need an accessible group label');
  const filterButtons = [...filterGroup.matchAll(/<button class="pub-filter-btn[^"]*"[^>]*>/g)]
    .map((match) => match[0]);
  assert.equal(filterButtons.length, 6);
  for (const button of filterButtons) {
    assert.match(button, /type="button"/);
    assert.match(button, /aria-pressed="(?:true|false)"/);
  }
  assert.equal(filterButtons.filter((button) => button.includes('aria-pressed="true"')).length, 1);
  assert.match(body, /Last updated in September 2026\./);
  assert.match(body, /<script src="files\/assets\/site-language\.js\?v=20260921-industrial-intelligence"><\/script>/);
});
