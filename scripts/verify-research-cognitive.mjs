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
const description = 'Research by Mingyue Cheng on large language models and agents, time-series data mining, and scientific literature mining, with a focus on Forecasting Intelligence, AI for AI, and AI for Science.';
const intro = 'My research centers on large language models and agents, time-series data mining, and scientific literature mining. I pursue three connected directions: Forecasting Intelligence, AI for AI, and AI for Science, with a focus on predictive reasoning, autonomous learning, and scientific discovery.';
const labels = {
  en: ['Research Foundations', 'Research Directions'],
  zh: ['研究基础', '重点研究方向']
};
const foundationKeys = ['foundationLlm', 'foundationTimeseries', 'foundationLiterature'].flatMap((prefix) =>
  ['Title', 'Body'].map((suffix) => `${prefix}${suffix}`)
);
const directionKeys = ['forecasting', 'ai', 'science'].flatMap((prefix) =>
  ['Title', 'Body', 'Role'].map((suffix) => `${prefix}${suffix}`)
);
const requiredKeys = [...foundationKeys, ...directionKeys];
const selectedWorks = {
  forecasting: [['AlphaCast', 'https://arxiv.org/abs/2511.08947'], ['Time-R1', 'https://github.com/ustc-time-series/Time-R1']],
  ai: [['Agent-R1', 'https://github.com/AgentR1/Agent-R1'], ['MemWeaver', 'https://arxiv.org/abs/2510.07713']],
  science: [['PaperScout', 'https://agentr1.github.io/paperscout/'], ['PaperArena', 'https://paperarena-ai.github.io/']]
};
const boundNodes = [...active(html).matchAll(/<([a-z][\w-]*)\b[^>]*data-page-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)]
  .map((match) => ({ key: match[2], innerHTML: match[3], getAttribute(name) { return name === 'data-page-i18n' ? this.key : null; } }));
const labelNodes = [...active(html).matchAll(/<h2\b[^>]*class="[^"]*(?:rd-section-label|scenario-section-label)[^"]*"[^>]*>([\s\S]*?)<\/h2>/g)]
  .map((match) => ({ textContent: plain(match[1]) }));

function section(id) {
  const match = active(html).match(new RegExp(`<section\\b[^>]*aria-labelledby="${id}"[^>]*>([\\s\\S]*?)<\\/section>`));
  assert.ok(match, `Missing semantic section labelled by ${id}`);
  return match[1];
}

test('Research introduces its foundations before three directions in its hero and sections', () => {
  assert.match(html, /<h1 class="page-hero-title">Research<\/h1>/);
  assert.equal(plain(html.match(/<p class="page-hero-sub">([\s\S]*?)<\/p>/)?.[1] || ''), intro);
  for (const tag of ['<meta name="description"', '<meta property="og:description"']) {
    assert.ok(html.includes(`${tag} content="${description}">`), `${tag} must describe the foundations and research directions`);
  }
  assert.deepEqual(labelNodes.map((node) => node.textContent), labels.en);
  section('research-foundations-heading');
  section('research-directions-heading');
  assert.ok(html.indexOf('aria-labelledby="research-foundations-heading"') < html.indexOf('aria-labelledby="research-directions-heading"'));
  assert.doesNotMatch(active(html), /id="(?:cognitive-framework|research-relations|research-scenario)-heading"|class="cognitive-framework|class="research-relation-map/);
  for (const marker of ['<!-- Research Foundations -->', '<!-- Research Directions -->', '<!-- Contact -->']) {
    assert.equal(html.split(marker).length - 1, 1, `${marker} remains a unique maintenance boundary`);
  }
  assert.doesNotMatch(html, /<!-- Research Vision -->/);
  const content = section('research-foundations-heading') + section('research-directions-heading');
  assert.doesNotMatch(content, /research-vision-card|research-topics|contribution|Personalized Intelligence|Research collections|data-page-i18n="(?:researchQuestion|visionTitle|visionBody|relationsIntro|applicationsSummary|\w+Topics)"/i);
});

test('Research exposes three supporting foundations and three independent scientific directions', () => {
  const foundations = section('research-foundations-heading');
  assert.match(foundations, /<div class="foundation-grid">/);
  const foundationCards = [...foundations.matchAll(/<article class="foundation-card foundation-card--([^"\s]+)">([\s\S]*?)<\/article>/g)];
  assert.deepEqual(foundationCards.map((match) => match[1]), ['llm', 'timeseries', 'literature']);
  for (const [, name, card] of foundationCards) {
    const prefix = { llm: 'foundationLlm', timeseries: 'foundationTimeseries', literature: 'foundationLiterature' }[name];
    for (const suffix of ['Title', 'Body']) assert.match(card, new RegExp(`data-page-i18n="${prefix}${suffix}"`));
    assert.doesNotMatch(card, /pillar-question|research-evidence/);
  }
  const directions = section('research-directions-heading');
  assert.match(directions, /<div class="pillar-grid">/);
  const cards = [...directions.matchAll(/<article class="pillar-card pillar-card--([^"\s]+)">([\s\S]*?)<\/article>/g)];
  assert.deepEqual(cards.map((match) => match[1]), ['forecasting', 'ai', 'science']);
  for (const [, prefix, card] of cards) {
    for (const suffix of ['Title', 'Body', 'Role']) {
      assert.match(card, new RegExp(`data-page-i18n="${prefix}${suffix}"`), `${prefix} needs its own ${suffix.toLowerCase()}`);
    }
  }
  for (const lang of ['en', 'zh']) {
    const page = translations[lang].pages['research.html'];
    assert.equal(page.title, lang === 'en' ? 'Research' : '研究方向');
    assert.deepEqual(Array.from(page.labels), labels[lang]);
    const copy = page.scenarios;
    for (const key of requiredKeys) {
      assert.equal(typeof copy[key], 'string', `${lang}: ${key} must be inside research.scenarios`);
      assert.ok(plain(copy[key]).length > 0, `${lang}: ${key} must not be empty`);
    }
    const descriptions = ['forecasting', 'ai', 'science'].map((prefix) => plain(copy[`${prefix}Body`]));
    assert.equal(new Set(descriptions).size, 3, `${lang}: each direction needs its own description`);
    for (const [index, prefix] of ['forecasting', 'ai', 'science'].entries()) {
      assert.ok(copy[`${prefix}Role`].startsWith(`0${index + 1} · `), `${lang}: ${prefix} role number must match the displayed order`);
      assert.equal((copy[`${prefix}Body`].match(/<strong>/g) || []).length, 2, `${lang}: ${prefix} must emphasize only two compact phrases`);
    }
    assert.ok(page.subtitle.includes(lang === 'en'
      ? 'Forecasting Intelligence, AI for AI, and AI for Science'
      : 'Forecasting Intelligence、AI for AI 和 AI for Science'), `${lang}: introduction must follow the displayed direction order`);
    assert.ok(page.subtitle.includes(lang === 'en'
      ? 'predictive reasoning, autonomous learning, and scientific discovery'
      : '预测推理、自主学习和科学发现'), `${lang}: research goals must follow the displayed direction order`);
    assert.equal(copy.aiTitle, 'AI for AI');
    assert.equal(copy.scienceTitle, 'AI for Science');
    assert.equal(copy.forecastingTitle, 'Forecasting Intelligence');
    assert.equal(copy.foundationLiteratureTitle, lang === 'en' ? 'Scientific Literature Mining' : '科技文献挖掘');
    assert.ok(page.subtitle.startsWith(lang === 'en'
      ? 'My research centers on large language models and agents, time-series data mining, and scientific literature mining.'
      : '我的研究以大模型与智能体、时序数据挖掘和科技文献挖掘为基础，'), `${lang}: introduction must name all three foundations`);
    assert.doesNotMatch(Object.keys(copy).join(' '), /(?:agent|knowledge|structured)(?:Title|Body|Question|Role|Topics)|relationsIntro|applicationsSummary/);
  }
  const copy = translations.en.pages['research.html'].scenarios;
  for (const concept of [/reasoning/i, /planning/i, /tools?/i, /memory/i, /agent harnesses/i, /reliable interaction/i]) assert.match(plain(copy.foundationLlmBody), concept);
  for (const concept of [/representation learning/i, /forecasting/i, /cross-domain/i, /temporal patterns and dependencies/i]) assert.match(plain(copy.foundationTimeseriesBody), concept);
  for (const concept of [/scientific literature retrieval/i, /multimodal/i, /text/i, /figures/i, /tables/i, /extraction and integration/i, /knowledge and evidence/i, /across papers/i]) assert.match(plain(copy.foundationLiteratureBody), concept);
  for (const concept of [/autonomous learning in large language models/i, /continual evolution in agents/i, /model parameters/i, /memory and interaction/i]) assert.match(plain(copy.aiBody), concept);
  for (const concept of [/AI-ready scientific infrastructure/i, /autonomous research agents/i, /scientific data, literature, and tools/i, /hypothesis generation/i, /experiment planning and execution/i, /evidence-based validation/i, /human oversight/i]) assert.match(plain(copy.scienceBody), concept);
  for (const concept of [/context-aware forecasting/i, /evidence-driven predictive reasoning/i, /active context acquisition/i, /long-term goal/i, /mechanisms underlying temporal dynamics/i]) assert.match(plain(copy.forecastingBody), concept);
});

test('Research directions show two selected works each without former evidence or question blocks', () => {
  const directions = section('research-directions-heading');
  assert.doesNotMatch(directions, /research-evidence|representativeLabel|Representative work|代表性工作/i);
  assert.doesNotMatch(directions, /pillar-question|question-label|questionLabel|(?:forecasting|ai|science)Question|Scientific question|核心科学问题/i);
  const cards = [...directions.matchAll(/<article class="pillar-card pillar-card--([^"\s]+)">([\s\S]*?)<\/article>/g)];
  for (const [, prefix, card] of cards) {
    const rows = [...card.matchAll(/<([a-z][\w-]*)\b[^>]*class="[^"]*\bdirection-works\b[^"]*"[^>]*>([\s\S]*?)<\/\1>/g)];
    assert.equal(rows.length, 1, `${prefix}: selected works must occupy one compact row`);
    assert.doesNotMatch(rows[0][2], /<(?:ul|ol|li)\b/i, `${prefix}: selected works must remain inline`);
    assert.equal((rows[0][2].match(/data-page-i18n="selectedWorksLabel"/g) || []).length, 1, `${prefix}: selected works need their translated label`);
    const links = [...rows[0][2].matchAll(/<a\b([^>]*)href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g)];
    assert.deepEqual(links.map(([, , href, , content]) => [plain(content), href]), selectedWorks[prefix], `${prefix}: selected works and destinations`);
    for (const [, before, , after] of links) {
      assert.match(`${before}${after}`, /target="_blank"/);
      assert.match(`${before}${after}`, /rel="noopener"/);
    }
  }
  assert.equal(boundNodes.filter((node) => node.key === 'selectedWorksLabel').length, 3);
  const removedKeys = ['representativeLabel', 'questionLabel', 'forecastingQuestion', 'aiQuestion', 'scienceQuestion'];
  for (const key of removedKeys) assert.equal(boundNodes.filter((node) => node.key === key).length, 0, `${key} must not have a visible binding`);
  for (const lang of ['en', 'zh']) {
    const copy = translations[lang].pages['research.html'].scenarios;
    assert.equal(copy.selectedWorksLabel, lang === 'en' ? 'Selected work' : '代表成果');
    for (const key of removedKeys) assert.equal(copy[key], undefined, `${lang}: removed ${key} must not remain`);
  }
});

test('Research uses an isolated stylesheet after shared styles and retains contact destinations', () => {
  assert.match(html, /<body\b[^>]*class="[^"]*\bresearch-page\b[^"]*"/);
  const cssPath = new URL('../files/assets/research-page.css', import.meta.url);
  assert.ok(existsSync(cssPath), 'Research needs its page-scoped stylesheet');
  const sheets = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g)].map((match) => match[1]);
  assert.match(sheets.at(-1), /^files\/assets\/research-page\.css(?:\?|$)/);
  const css = readFileSync(cssPath, 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  assert.doesNotMatch(css, /\.pillar-question\b|\.question-label\b/);
  const selectors = [...css.matchAll(/([^{}]+)\{[^{}]*\}/g)].flatMap((match) => match[1].trim().split(','));
  assert.ok(selectors.length > 0, 'The Research stylesheet must contain layout rules');
  for (const selector of selectors) assert.match(selector.trim(), /^\.research-page(?:\b|\s|\.)/, `Unscoped Research selector: ${selector}`);
  for (const page of readdirSync(new URL('..', import.meta.url)).filter((path) => path.endsWith('.html') && path !== 'research.html')) {
    assert.doesNotMatch(read(page), /files\/assets\/research-page\.css/, `${page} must not load Research-only styles`);
  }
  assert.match(html, /site-language\.js\?v=20261114-research-editorial/);
  assert.equal(sheets.at(-1), 'files/assets/research-page.css?v=20261114-research-editorial');
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
      assert.equal(hero.textContent, lang === 'en' ? 'Research' : '研究方向');
      assert.equal(subtitle.textContent, page.subtitle);
      if (lang === 'en') assert.equal(subtitle.textContent, intro);
      assert.deepEqual(headings.map((node) => node.textContent), labels[lang]);
      for (const node of elements) assert.equal(node.innerHTML, page.scenarios[node.key], `${lang}: ${node.key}`);
      assert.equal(contactNote.innerHTML, page.join);
    }
  }
});
