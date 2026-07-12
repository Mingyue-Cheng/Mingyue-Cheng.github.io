import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');
const indexHtml = read('index.html');
const researchHtml = read('research.html');
const siteLanguageJs = read('files/assets/site-language.js');
const cssPath = join(root, 'files/assets/scenario-cards.css');
const scenarioCss = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';
const stylesheetLink = '<link rel="stylesheet" href="files/assets/scenario-cards.css">';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cssRule(source, selector) {
  const match = source.match(new RegExp(`${escapeRegex(selector)}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Missing CSS rule: ${selector}`);
  return match[1];
}

function sectionBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing start marker: ${startMarker}`);
  assert.ok(end > start, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

function matchCount(source, pattern) {
  return (source.match(pattern) || []).length;
}

function assertCanonicalOrder(source) {
  const positions = ['science', 'energy', 'user'].map((modifier) =>
    source.indexOf(`scenario-card--${modifier}`)
  );
  assert.ok(positions.every((position) => position >= 0), 'All three domain modifiers must exist');
  assert.ok(positions[0] < positions[1] && positions[1] < positions[2], 'Cards must be Science, Energy, User');
}

function articleFor(source, modifier) {
  const pattern = new RegExp(`<article class="scenario-card scenario-card--${modifier}">[\\s\\S]*?<\\/article>`);
  const match = source.match(pattern);
  assert.ok(match, `Missing ${modifier} article`);
  return match[0];
}

function visibleText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function decodedTranslationEntries(key) {
  const pattern = new RegExp(`"${escapeRegex(key)}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, 'g');
  return [...indexHtml.matchAll(pattern)].map((match) => JSON.parse(`"${match[1]}"`));
}

test('shared stylesheet is linked by both pages', () => {
  assert.ok(existsSync(cssPath), 'files/assets/scenario-cards.css must exist');

  for (const [name, source] of [['index.html', indexHtml], ['research.html', researchHtml]]) {
    assert.equal(source.split(stylesheetLink).length - 1, 1, `${name} must load the stylesheet once`);
    const styleEnd = source.indexOf('</style>');
    const linkPosition = source.indexOf(stylesheetLink);
    const headEnd = source.indexOf('</head>');
    assert.ok(styleEnd < linkPosition && linkPosition < headEnd, `${name} must load shared CSS after inline CSS`);
  }
});

test('shared stylesheet implements the approved visual and responsive contract', () => {
  assert.match(scenarioCss, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(scenarioCss, /@media \(max-width:\s*900px\)[\s\S]*?\.scenario-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(scenarioCss, /@media \(hover:\s*hover\) and \(pointer:\s*fine\)/);
  assert.match(scenarioCss, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.doesNotMatch(scenarioCss, /cursor:\s*pointer/);

  for (const modifier of ['science', 'energy', 'user']) {
    assert.match(scenarioCss, new RegExp(`\\.scenario-card--${modifier}\\s*\\{`));
  }

  const reset = cssRule(scenarioCss, '.research-section .scenario-card-body');
  for (const declaration of [
    'text-align: left;',
    'text-align-last: auto;',
    'text-justify: auto;',
    'hyphens: none;',
    '-webkit-hyphens: none;'
  ]) {
    assert.ok(reset.includes(declaration), `Missing high-specificity reset: ${declaration}`);
  }
});

test('homepage uses semantic scenario cards in canonical order', () => {
  const section = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );

  assert.match(section, /<section class="scenario-section" aria-labelledby="homepage-scenario-heading">/);
  assert.match(section, /<h3 id="homepage-scenario-heading" class="scenario-heading" data-i18n="research\.scenarioTitle">/);
  assert.equal(matchCount(section, /<article class="scenario-card scenario-card--/g), 3);
  assert.equal(matchCount(section, /<h4 class="scenario-card-title" data-i18n="research\.(science|energy|user)Title">/g), 3);
  assert.equal(matchCount(section, /<p class="scenario-card-body" data-i18n="research\.(science|energy|user)Body">/g), 3);
  assert.equal(matchCount(section, /<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">/g), 3);
  assert.equal(matchCount(section, /class="scenario-card-emphasis"/g), 3);
  assert.doesNotMatch(section, /role="list(item)?"/);
  assertCanonicalOrder(section);

  for (const modifier of ['science', 'energy', 'user']) {
    assert.equal(matchCount(articleFor(section, modifier), /class="scenario-card-emphasis"/g), 1);
  }
});

test('homepage dictionaries provide complete split scenario translations', () => {
  const expected = {
    'research.scienceTitle': ['AI for Science', 'AI for Science'],
    'research.scienceBody': [
      'Using <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> as the technical foundation for structured scientific data modeling and scientific literature mining.',
      '以 <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> 为技术，面向结构化科学数据建模以及科技文献挖掘。'
    ],
    'research.energyTitle': ['AI for Energy Systems', '电力能源智能'],
    'research.energyBody': [
      'Building <strong class="scenario-card-emphasis">context-aware forecasting agents</strong> for load, solar, and wind systems, with renewable analytics for dispatch, storage, grid balancing, and risk-aware operation.',
      '构建面向负荷、光伏与风电的<strong class="scenario-card-emphasis">上下文感知预测智能体</strong>，服务可再生能源分析、调度优化、储能控制、平衡与风险管理。'
    ],
    'research.userTitle': ['AI for User Modeling', 'AI for User Modeling'],
    'research.userBody': [
      'Modeling <strong class="scenario-card-emphasis">behavioral sequences and preference dynamics</strong> to support explainable recommendation, user simulation, and LLM-based interactive decision support.',
      '刻画<strong class="scenario-card-emphasis">用户行为序列与偏好演化</strong>，支撑可解释推荐、用户模拟，以及大模型驱动的人机交互式决策支持。'
    ]
  };

  for (const [key, values] of Object.entries(expected)) {
    assert.deepEqual(decodedTranslationEntries(key), values, `Unexpected values for ${key}`);
  }

  for (const oldKey of ['research.science', 'research.energy', 'research.recsys']) {
    assert.doesNotMatch(indexHtml, new RegExp(`"${escapeRegex(oldKey)}"\\s*:`));
  }
});

test('research page matches the homepage scenario contract', () => {
  const homepageSection = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  const researchSection = sectionBetween(researchHtml, '<!-- Broader Scenarios -->', '<!-- Notes -->');

  assert.match(researchSection, /<section class="scenario-section" aria-labelledby="research-scenario-heading">/);
  assert.match(researchSection, /<h2 id="research-scenario-heading" class="scenario-heading scenario-section-label">/);
  assert.equal(matchCount(researchSection, /<article class="scenario-card scenario-card--/g), 3);
  assert.equal(matchCount(researchSection, /<h3 class="scenario-card-title">/g), 3);
  assert.equal(matchCount(researchSection, /<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">/g), 3);
  assert.equal(matchCount(researchSection, /class="scenario-card-emphasis"/g), 3);
  assert.doesNotMatch(researchSection, /role="list(item)?"/);
  assertCanonicalOrder(researchSection);

  for (const modifier of ['science', 'energy', 'user']) {
    assert.equal(
      visibleText(articleFor(researchSection, modifier)),
      visibleText(articleFor(homepageSection, modifier)),
      `${modifier} copy must match across pages`
    );
  }
});

test('research page keeps shared primary icons and partial label translation', () => {
  assert.ok(!researchHtml.includes('.sc-card'), 'Obsolete .sc-card styles must be removed');
  assert.ok(!researchHtml.includes('.scenario-cards'), 'Obsolete .scenario-cards styles must be removed');
  assert.ok(!researchHtml.includes('.icon-recommend'), 'Obsolete recommendation icon CSS must be removed');
  assert.ok(!researchHtml.includes('.icon-energy'), 'Obsolete energy icon CSS must be removed');

  for (const selector of ['.visual-icon i', '.icon-network', '.icon-series', '.icon-literature']) {
    assert.ok(researchHtml.includes(selector), `Shared primary icon rule must remain: ${selector}`);
  }

  assert.ok(
    siteLanguageJs.includes("document.querySelectorAll('.rd-section-label, .scenario-section-label')"),
    'Research heading must remain compatible with site-language.js'
  );
  assert.ok(siteLanguageJs.includes("labels: ['主要研究方向', '应用与评测场景']"));
});

test('research hero introduction keeps clean two-edge alignment', () => {
  const rule = cssRule(researchHtml, '.page-hero-sub');
  for (const declaration of [
    'text-align: justify;',
    'text-align-last: left;',
    'text-justify: inter-word;',
    'hyphens: none;',
    '-webkit-hyphens: none;'
  ]) {
    assert.ok(rule.includes(declaration), `Missing Research intro alignment rule: ${declaration}`);
  }
});
