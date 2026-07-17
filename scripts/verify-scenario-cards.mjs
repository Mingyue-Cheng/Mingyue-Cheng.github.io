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

  const card = cssRule(scenarioCss, '.scenario-card');
  for (const declaration of ['display: flex;', 'flex-direction: column;']) {
    assert.ok(card.includes(declaration), `Missing card layout declaration: ${declaration}`);
  }

  const header = cssRule(scenarioCss, '.scenario-card-header');
  assert.ok(header.includes('min-height: 68px;'), 'Desktop card headers must share a minimum height');

  const oneColumnLayout = sectionBetween(
    scenarioCss,
    '@media (max-width: 900px)',
    '@media (max-width: 480px)'
  );
  const oneColumnHeader = cssRule(oneColumnLayout, '.scenario-card-header');
  assert.ok(oneColumnHeader.includes('min-height: 0;'), 'One-column headers must release the desktop minimum height');

  for (const selector of ['.scenario-card-body', '.research-section .scenario-card-body']) {
    const body = cssRule(scenarioCss, selector);
    for (const declaration of [
      'text-align: justify;',
      'text-align-last: left;',
      'text-justify: inter-word;',
      'hyphens: none;',
      '-webkit-hyphens: none;',
      'word-break: normal;'
    ]) {
      assert.ok(body.includes(declaration), `Missing ${selector} declaration: ${declaration}`);
    }
  }

  const chineseBody = cssRule(
    scenarioCss,
    'html[lang="zh-CN"] .research-section .scenario-card-body'
  );
  for (const declaration of [
    'text-align: justify;',
    'text-align-last: left;',
    'text-justify: inter-word;'
  ]) {
    assert.ok(chineseBody.includes(declaration), `Missing Chinese-mode body declaration: ${declaration}`);
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
      'Applying <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> to structured scientific data modeling, scientific literature mining, and evidence-grounded discovery.',
      '以 <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> 为技术，面向结构化科学数据建模、科技文献挖掘与证据驱动发现。'
    ],
    'research.energyTitle': ['AI for Energy Systems', '电力能源智能'],
    'research.energyBody': [
      'Building <strong class="scenario-card-emphasis">context-aware forecasting agents</strong> for load, solar, and wind systems, renewable analytics, grid balancing, and risk-aware operation.',
      '构建面向负荷、光伏与风电的<strong class="scenario-card-emphasis">上下文感知预测智能体</strong>，支撑可再生能源分析、调度与风险管理。'
    ],
    'research.userTitle': ['AI for User Modeling', 'AI for User Modeling'],
    'research.userBody': [
      'Modeling <strong class="scenario-card-emphasis">behavioral sequences and preference dynamics</strong> for explainable recommendation, user simulation, and interactive decision support.',
      '刻画<strong class="scenario-card-emphasis">用户行为序列与偏好演化</strong>，支撑可解释推荐、用户模拟与交互式决策支持。'
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

test('research hero includes an accessible responsive cognitive pipeline', () => {
  const hero = sectionBetween(researchHtml, '<!-- ===== Hero ===== -->', '<!-- ===== Main ===== -->');

  assert.equal(matchCount(hero, /class="page-hero-copy"/g), 1);
  assert.equal(matchCount(hero, /class="page-hero-visual"/g), 1);
  assert.equal(matchCount(hero, /<svg class="cognitive-pipeline"/g), 1);
  assert.ok(hero.includes('<svg class="cognitive-pipeline" viewBox="0 0 320 240" role="img" aria-labelledby="cognitive-pipeline-title cognitive-pipeline-desc" focusable="false">'));
  assert.ok(hero.includes('<title id="cognitive-pipeline-title">Research cognition pipeline</title>'));
  assert.ok(hero.includes('<desc id="cognitive-pipeline-desc">Time-series data and knowledge understanding converge into cognitive reasoning, supporting AI for Science and energy systems.</desc>'));
  assert.equal(matchCount(hero, /<rect class="pipeline-node(?: |")/g), 5);
  assert.equal(matchCount(hero, /<path class="pipeline-path(?: |")/g), 4);
  assert.equal(matchCount(hero, /class="pipeline-stage"/g), 3);
  assert.equal(matchCount(hero, /pipeline-node--core/g), 1);
  assert.equal(matchCount(hero, /pipeline-node--application/g), 2);

  const heroText = visibleText(hero);
  for (const label of [
    'Time-Series Data',
    'Knowledge Understanding',
    'Cognitive Reasoning',
    'AI for Science',
    'Energy Systems'
  ]) {
    assert.ok(heroText.includes(label), `Missing cognitive pipeline label: ${label}`);
  }

  const contentRule = cssRule(researchHtml, '.page-hero-content');
  for (const declaration of [
    'display: grid;',
    'grid-template-columns: minmax(0, 1fr) minmax(290px, 320px);',
    'gap: clamp(32px, 4vw, 56px);',
    'align-items: center;'
  ]) {
    assert.ok(contentRule.includes(declaration), `Missing research hero layout rule: ${declaration}`);
  }

  const stageRule = cssRule(researchHtml, '.pipeline-stage');
  assert.ok(stageRule.includes('fill: #4f6074;'));
  assert.ok(stageRule.includes('font-size: 10px;'));
  assert.ok(cssRule(researchHtml, '.pipeline-label').includes('font-size: 11px;'));
  assert.ok(cssRule(researchHtml, '.pipeline-label--core').includes('font-size: 11.5px;'));

  const responsive = sectionBetween(researchHtml, '@media (max-width: 960px)', '@media (max-width: 680px)');
  assert.ok(cssRule(responsive, '.page-hero-content').includes('grid-template-columns: 1fr;'));
  assert.ok(cssRule(responsive, '.page-hero-visual').includes('display: none;'));
});
