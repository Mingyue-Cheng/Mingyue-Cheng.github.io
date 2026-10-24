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
const intro = 'My research focuses on cognitive intelligence: enabling machines to understand, reason, and interact. I study LLM agents and autonomous learning as general intelligent mechanisms, with scientific knowledge and tools and structured data as two core research objects. The three directions address independent scientific questions while sharing foundations in cognitive intelligence. Autonomous learning, continual evolution, and human–AI collaboration support long-term capability improvement.';
const labels = {
  en: ['Core Research Directions', 'How the Directions Connect', 'Shared Cognitive Framework', 'Application Domains'],
  zh: ['三大核心研究主线', '三条主线如何关联', '共享认知框架', '应用领域']
};
const directionKeys = ['agent', 'knowledge', 'structured'].flatMap((prefix) =>
  ['Title', 'Body', 'Question', 'Role', 'Topics'].map((suffix) => `${prefix}${suffix}`)
);
const relationKeys = ['relationsIntro', 'mechanismLabel', 'mechanismTitle', 'mechanismTopics', 'feedbackLabel', 'knowledgeObjectTitle', 'knowledgeObjectBody', 'structuredObjectTitle', 'structuredObjectBody', 'synergyLabel'];
const frameworkKeys = ['understandTitle', 'understandBody', 'reasonTitle', 'reasonBody', 'interactTitle', 'interactBody', 'mechanismsTitle', 'mechanismsBody'];
const requiredKeys = [...directionKeys, ...relationKeys, ...frameworkKeys];
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
  section('cognitive-framework-heading');
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
    for (const key of ['agentTopics', 'knowledgeTopics', 'structuredTopics', 'mechanismTopics']) {
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

test('Research distinguishes shared cognitive capabilities from long-term supporting mechanisms', () => {
  const relations = section('research-relations-heading');
  for (const key of relationKeys) assert.match(relations, new RegExp(`data-page-i18n="${key}"`));
  const framework = section('cognitive-framework-heading');
  for (const key of frameworkKeys) assert.match(framework, new RegExp(`data-page-i18n="${key}"`));
  const capabilityCards = [...framework.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)]
    .filter((match) => /data-page-i18n="(?:understand|reason|interact)Title"/.test(match[1]));
  assert.equal(capabilityCards.length, 3, 'Understand, reason and interact must be three peer capabilities');
  assert.deepEqual(capabilityCards.map((match) => match[1].match(/data-page-i18n="(understand|reason|interact)Title"/)?.[1]), ['understand', 'reason', 'interact']);
  for (const card of capabilityCards) assert.doesNotMatch(card[1], /data-page-i18n="mechanisms(?:Title|Body)"/);
  for (const lang of ['en', 'zh']) {
    const copy = translations[lang].pages['research.html'].scenarios;
    const mechanisms = plain(copy.mechanismsBody);
    const expected = lang === 'en' ? [/autonomous learning/i, /evolution/i, /human[–-]AI collaboration/i] : [/自主学习/, /演化|进化/, /人机协作|人机协同/];
    for (const term of expected) assert.match(mechanisms, term);
  }
});

test('Research uses an isolated stylesheet after shared styles and retains existing destinations', () => {
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
  assert.match(html, /site-language\.js\?v=20261024-ai-for-science/);
  for (const destination of ['https://agentr1.github.io/', 'https://ustc-time-series.github.io/', 'https://ustcagi-sci.github.io/', 'https://ustcagi.github.io/', 'mailto:mycheng@ustc.edu.cn']) {
    assert.ok(html.includes(`href="${destination}"`), `Retain ${destination}`);
    for (const lang of ['en', 'zh']) {
      const page = translations[lang].pages['research.html'];
      assert.ok(`${page.collections} ${page.join}`.includes(`href="${destination}"`), `${lang}: retain ${destination} after switching`);
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
    const notes = [{ innerHTML: '' }, { innerHTML: '' }];
    const toggle = { setAttribute() {}, addEventListener(type, handler) { if (type === 'click') this.click = handler; } };
    const storage = new Map([['homepage-language', initialLang]]);
    const document = {
      readyState: 'complete', documentElement: { lang: '' },
      querySelector(selector) { return ({ '.page-hero-title': hero, '.page-hero-sub': subtitle, '.research-note-box': notes[0] })[selector] || null; },
      querySelectorAll(selector) { return ({ '[data-page-i18n]': elements, '.rd-section-label, .scenario-section-label': headings, '.research-note-box': notes })[selector] || []; },
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
      assert.equal(notes[0].innerHTML, page.collections);
      assert.equal(notes[1].innerHTML, page.join);
    }
  }
});
