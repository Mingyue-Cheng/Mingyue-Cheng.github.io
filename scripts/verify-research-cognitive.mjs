import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const html = read('research.html');
const script = read('files/assets/site-language.js');
const active = (source) => source.replace(/<!--[\s\S]*?-->/g, '');
const plain = (source) => source.replace(/<[^>]*>/g, ' ').replaceAll('&amp;', '&').replace(/\s+/g, ' ').trim();
const normalize = (source) => source.replace(/\s+/g, ' ').trim();
const literal = script.match(/const translations = (\{[\s\S]*?\n  \});\n\n  const navTargets/)?.[1];
assert.ok(literal, 'The existing shared translation dictionary must remain readable');
const translations = vm.runInNewContext(`(${literal})`);
const description = 'Research by Mingyue Cheng on cognitive intelligence: LLM agents and autonomous learning, scientific knowledge and tool mining, and cognitive intelligence for structured data.';
const intro = "I study cognitive intelligence: enabling machines to understand, reason, and interact. My work spans three directions with independent scientific questions, connected through autonomous learning, continual evolution, and human–AI collaboration.";
const labels = {
  en: ['Core Research Directions', 'How the Directions Connect', 'Application Domains'],
  zh: ['三大核心研究主线', '三条主线如何关联', '应用领域']
};
const directionKeys = ['agent', 'knowledge', 'structured'].flatMap((prefix) =>
  ['Title', 'Body', 'Question', 'Role', 'Topics'].map((suffix) => `${prefix}${suffix}`)
);
const relationKeys = ['relationsIntro'];
const requiredKeys = [...directionKeys, ...relationKeys, 'applicationsSummary'];
const boundNodes = [...active(html).matchAll(/<([a-z][\w-]*)\b[^>]*data-page-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)]
  .map((match) => ({ key: match[2], innerHTML: match[3], getAttribute(name) { return name === 'data-page-i18n' ? this.key : null; } }));
const labelNodes = [...active(html).matchAll(/<h2\b[^>]*class="[^"]*(?:rd-section-label|scenario-section-label)[^"]*"[^>]*>([\s\S]*?)<\/h2>/g)]
  .map((match) => ({ textContent: plain(match[1]) }));

function section(id) {
  const match = active(html).match(new RegExp(`<section\\b[^>]*aria-labelledby="${id}"[^>]*>([\\s\\S]*?)<\\/section>`));
  assert.ok(match, `Missing semantic section labelled by ${id}`);
  return match[1];
}

test('Research frames cognitive intelligence in its hero, metadata, and ordered sections', () => {
  assert.match(html, /<h1 class="page-hero-title">Cognitive Intelligence<\/h1>/);
  assert.equal(plain(html.match(/<p class="page-hero-sub">([\s\S]*?)<\/p>/)?.[1] || ''), intro);
  for (const tag of ['<meta name="description"', '<meta property="og:description"']) {
    assert.ok(html.includes(`${tag} content="${description}">`), `${tag} must describe the cognitive-intelligence agenda`);
  }
  assert.deepEqual(labelNodes.map((node) => node.textContent), labels.en);
  section('research-relations-heading');
  section('research-scenario-heading');
  assert.doesNotMatch(active(html), /id="cognitive-framework-heading"|class="cognitive-framework|class="research-relation-map/);
  for (const marker of ['<!-- Research Framework -->', '<!-- Core Technical Pillars -->', '<!-- /Research Framework -->', '<!-- Broader Scenarios -->']) {
    assert.equal(html.split(marker).length - 1, 1, `${marker} remains a unique maintenance boundary`);
  }
  assert.doesNotMatch(html, /<!-- Research Vision -->/);
  const framework = html.slice(html.indexOf('<!-- Research Framework -->'), html.indexOf('<!-- Broader Scenarios -->'));
  assert.doesNotMatch(active(framework), /research-vision-card|research-vision-heading|data-page-i18n="(?:researchQuestion|visionTitle|visionBody)"/);
});

test('Research exposes three ordered directions with independent scientific questions and topics', () => {
  const cards = [...active(html).matchAll(/<article class="pillar-card pillar-card--([^"\s]+)">([\s\S]*?)<\/article>/g)];
  assert.deepEqual(cards.map((match) => match[1]), ['agent', 'knowledge', 'structured']);
  for (const [, prefix, card] of cards) {
    for (const suffix of ['Title', 'Body', 'Question', 'Role', 'Topics']) {
      assert.match(card, new RegExp(`data-page-i18n="${prefix}${suffix}"`), `${prefix} needs its own ${suffix.toLowerCase()}`);
    }
  }
  for (const lang of ['en', 'zh']) {
    const page = translations[lang].pages['research.html'];
    assert.equal(page.title, lang === 'en' ? 'Cognitive Intelligence' : '认知智能');
    assert.deepEqual(Array.from(page.labels), labels[lang]);
    const copy = page.scenarios;
    for (const key of requiredKeys) {
      assert.equal(typeof copy[key], 'string', `${lang}: ${key} must be inside research.scenarios`);
      assert.ok(plain(copy[key]).length > 0, `${lang}: ${key} must not be empty`);
    }
    const questions = ['agent', 'knowledge', 'structured'].map((prefix) => plain(copy[`${prefix}Question`]));
    assert.equal(new Set(questions).size, 3, `${lang}: each direction needs an independent question`);
    for (const key of ['agentTopics', 'knowledgeTopics', 'structuredTopics']) {
      assert.ok((copy[key].match(/<span>/g) || []).length >= 2, `${lang}: ${key} must preserve translated topic spans`);
      assert.equal(plain(copy[key].replace(/<span>[\s\S]*?<\/span>/g, '')), '', `${lang}: ${key} should contain only topic spans`);
    }
  }
  const copy = translations.en.pages['research.html'].scenarios;
  assert.match(plain(copy.agentTopics), /Agent Harness/);
  assert.match(plain(copy.agentTopics), /memory/i);
  assert.match(plain(copy.knowledgeBody), /scientific (?:knowledge|literature)/i);
  assert.match(plain(copy.knowledgeBody), /tools?/i);
  const structured = plain(`${copy.structuredBody} ${copy.structuredTopics}`);
  for (const object of [/time series/i, /tables?/i, /graphs?/i]) assert.match(structured, object);
});

test('Research gives relationships and applications concise prose while preserving evidence links', () => {
  const relations = section('research-relations-heading');
  assert.equal((relations.match(/<p\b/g) || []).length, 1);
  assert.match(relations, /data-page-i18n="relationsIntro"/);
  const applications = section('research-scenario-heading');
  assert.equal((applications.match(/<p\b/g) || []).length, 1);
  assert.match(applications, /data-page-i18n="applicationsSummary"/);
  assert.doesNotMatch(applications, /<article|scenario-card/);
  for (const lang of ['en', 'zh']) {
    const copy = translations[lang].pages['research.html'].scenarios;
    for (const label of lang === 'en' ? ['AI for Science', 'Personalized Intelligence', 'Forecasting Intelligence'] : ['科学智能', '个性化智能', '预测智能']) assert.ok(copy.applicationsSummary.includes(label));
  }
  const evidenceLists = [...active(html).matchAll(/<div class="research-evidence-links">([\s\S]*?)<\/div>/g)];
  assert.equal(evidenceLists.length, 3);
  for (const [, links] of evidenceLists) assert.equal((links.match(/<a\b/g) || []).length, 3);
});

test('Research uses an isolated stylesheet after shared styles and retains contact destinations', () => {
  assert.match(html, /<body\b[^>]*class="[^"]*\bresearch-page\b[^"]*"/);
  const cssPath = new URL('../files/assets/research-page.css', import.meta.url);
  assert.ok(existsSync(cssPath), 'Research needs its page-scoped stylesheet');
  const sheets = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map((match) => match[1]);
  assert.match(sheets.at(-1), /^files\/assets\/research-page\.css(?:\?|$)/);
  const css = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const selectors = [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap((match) => match[1].trim().split(','));
  assert.ok(selectors.length > 0, 'The Research stylesheet must contain layout rules');
  for (const selector of selectors) assert.match(selector.trim(), /^\.research-page(?:\b|\s|\.)/, `Unscoped Research selector: ${selector}`);
  for (const page of readdirSync(new URL('..', import.meta.url)).filter((path) => path.endsWith('.html') && path !== 'research.html')) {
    assert.doesNotMatch(read(page), /files\/assets\/research-page\.css/, `${page} must not load Research-only styles`);
  }
  assert.match(html, /site-language\.js\?v=20261107-research-note/);
  for (const destination of ['https://ustcagi.github.io/', 'mailto:mycheng@ustc.edu.cn']) {
    assert.ok(html.includes(`href="${destination}"`), `Retain ${destination}`);
    for (const lang of ['en', 'zh']) {
      const page = translations[lang].pages['research.html'];
      assert.ok(page.join.includes(`href="${destination}"`), `${lang}: retain ${destination} after switching`);
    }
  }
});

test('Research runs every new binding through saved language and bilingual round trips', () => {
  for (const key of requiredKeys) assert.equal(boundNodes.filter((node) => node.key === key).length, 1, `${key} needs one visible translation target`);
  for (const node of boundNodes) {
    const expected = translations.en.pages['research.html'].scenarios[node.key];
    assert.equal(typeof expected, 'string', `English translation missing for ${node.key}`);
    assert.equal(normalize(node.innerHTML), normalize(expected), `${node.key} fallback must match English`);
  }
  for (const initialLang of ['en', 'zh']) {
    const elements = boundNodes.map((node) => ({ ...node }));
    const headings = labelNodes.map((node) => ({ ...node }));
    const hero = { textContent: '' };
    const subtitle = { textContent: '' };
    const contactNote = { innerHTML: '' };
    const toggle = { setAttribute() {}, addEventListener(type, handler) { if (type === 'click') this.click = handler; } };
    const storage = new Map([['homepage-language', initialLang]]);
    const document = {
      readyState: 'complete', documentElement: { lang: '' },
      querySelector(selector) { return ({ '.page-hero-title': hero, '.page-hero-sub': subtitle, '#research-contact-note': contactNote })[selector] || null; },
      querySelectorAll(selector) { return ({ '[data-page-i18n]': elements, '.rd-section-label, .scenario-section-label': headings })[selector] || []; },
      getElementById(id) { return id === 'languageToggle' ? toggle : null; }
    };
    vm.runInNewContext(script, { document, window: { location: { pathname: '/research.html' } }, localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) } });
    for (const lang of [initialLang, initialLang === 'en' ? 'zh' : 'en', initialLang]) {
      if (document.documentElement.lang !== (lang === 'zh' ? 'zh-CN' : 'en')) toggle.click();
      const page = translations[lang].pages['research.html'];
      assert.equal(document.documentElement.lang, lang === 'zh' ? 'zh-CN' : 'en');
      assert.equal(storage.get('homepage-language'), lang);
      assert.equal(hero.textContent, lang === 'en' ? 'Cognitive Intelligence' : '认知智能');
      assert.equal(subtitle.textContent, page.subtitle);
      if (lang === 'en') assert.equal(subtitle.textContent, intro);
      assert.deepEqual(headings.map((node) => node.textContent), labels[lang]);
      for (const node of elements) assert.equal(node.innerHTML, page.scenarios[node.key], `${lang}: ${node.key}`);
      assert.equal(contactNote.innerHTML, page.join);
    }
  }
});
