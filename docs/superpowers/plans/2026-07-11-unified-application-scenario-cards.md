# Unified Application Scenario Cards Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the divergent homepage and Research-page scenario modules with one readable, accessible, bilingual-safe implementation of the approved Unified Domain Cards design.

**Architecture:** Both HTML pages load one focused shared stylesheet and use the same scenario-card class contract, while retaining page-appropriate heading levels. A dependency-free Node test file verifies stylesheet linkage, responsive rules, semantic markup, canonical ordering, bilingual homepage keys, Research-page compatibility, and preservation of shared primary-direction icons before browser checks validate the rendered result.

**Tech Stack:** Static HTML, CSS, inline SVG, existing vanilla JavaScript i18n, Node.js 25 built-in `node:test`, Python local HTTP server, Codex in-app Browser.

**Design spec:** `docs/superpowers/specs/2026-07-11-unified-application-scenario-cards-design.md`

---

## File map

- Create `files/assets/scenario-cards.css` — the only owner of scenario heading, grid, card, domain accent, SVG, responsive, hover, and reduced-motion styles.
- Create `scripts/verify-scenario-cards.mjs` — dependency-free structural and i18n regression tests.
- Modify `index.html` — load shared CSS, replace the homepage scenario DOM, remove obsolete local rules, and split English/Chinese scenario keys.
- Modify `research.html` — load shared CSS, replace the Research-page scenario DOM/copy/order, and remove only obsolete scenario rules.
- Preserve `files/assets/site-language.js` — its existing `.scenario-section-label` selector remains the Research-page heading translation interface.

## Task 1: Shared stylesheet and linkage contract

**Files:**
- Create: `scripts/verify-scenario-cards.mjs`
- Create: `files/assets/scenario-cards.css`
- Modify: `index.html:1405-1406`
- Modify: `research.html:668-669`

- [ ] **Step 1: Write the failing shared-style tests**

Create `scripts/verify-scenario-cards.mjs` with this complete initial content:

```js
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');
const indexHtml = read('index.html');
const researchHtml = read('research.html');
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
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
node --test scripts/verify-scenario-cards.mjs
```

Expected: `2` tests fail. The first reports that `files/assets/scenario-cards.css` does not exist; the second reports a missing three-column grid contract.

- [ ] **Step 3: Add the shared stylesheet**

Create `files/assets/scenario-cards.css` with exactly this content:

```css
.scenario-section {
  margin: 18px 0 8px;
}

.scenario-heading-row {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 16px;
}

.scenario-heading-row::after {
  content: "";
  flex: 1;
  height: 1px;
  background: var(--border);
}

.scenario-heading,
.scenario-heading.scenario-section-label {
  margin: 0;
  color: var(--accent);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.4;
  letter-spacing: 0;
  text-align: left;
  text-transform: none;
}

.scenario-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  align-items: stretch;
  gap: 16px;
}

.scenario-card {
  --scenario-color: var(--accent);
  position: relative;
  min-width: 0;
  overflow: hidden;
  border: 1px solid var(--border);
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbff 100%);
  box-shadow: 0 7px 22px rgba(0, 48, 135, 0.055);
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

.scenario-card--science { --scenario-color: #059669; }
.scenario-card--energy { --scenario-color: #0891b2; }
.scenario-card--user { --scenario-color: #d97706; }

.scenario-card-accent {
  width: 100%;
  height: 4px;
  background: linear-gradient(90deg, var(--accent) 0%, var(--scenario-color) 100%);
}

.scenario-card-header {
  display: flex;
  align-items: center;
  gap: 11px;
  padding: 18px 19px 10px;
}

.scenario-card-icon {
  flex: 0 0 36px;
  display: inline-flex;
  width: 36px;
  height: 36px;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border);
  border-radius: 9px;
  background: #fff;
  color: var(--scenario-color);
}

.scenario-card-icon svg {
  width: 21px;
  height: 21px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.scenario-card-title {
  margin: 0;
  color: var(--accent);
  font-size: 16px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: 0;
  text-align: left;
}

.scenario-card-body {
  margin: 0;
  padding: 0 19px 20px;
  color: var(--text);
  font-size: 13.5px;
  line-height: 1.67;
  text-align: left;
  text-align-last: auto;
  text-justify: auto;
  hyphens: none;
  -webkit-hyphens: none;
  overflow-wrap: anywhere;
  word-break: normal;
}

.research-section .scenario-card-body {
  text-align: left;
  text-align-last: auto;
  text-justify: auto;
  hyphens: none;
  -webkit-hyphens: none;
}

.scenario-card-emphasis {
  color: var(--accent);
  font-weight: 700;
}

@media (hover: hover) and (pointer: fine) {
  .scenario-card:hover {
    border-color: rgba(0, 48, 135, 0.22);
    box-shadow: 0 12px 30px rgba(0, 48, 135, 0.09);
    transform: translateY(-2px);
  }
}

@media (max-width: 900px) {
  .scenario-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
}

@media (max-width: 480px) {
  .scenario-heading-row {
    gap: 10px;
    margin-bottom: 13px;
  }

  .scenario-card-header {
    padding: 16px 16px 9px;
  }

  .scenario-card-body {
    padding: 0 16px 18px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .scenario-card {
    transition: none;
  }
}
```

- [ ] **Step 4: Link the stylesheet from both pages**

In both `index.html` and `research.html`, place this link immediately after the closing inline `</style>` and before `</head>`:

```html
</style>
<link rel="stylesheet" href="files/assets/scenario-cards.css">
</head>
```

- [ ] **Step 5: Run the focused tests and verify GREEN**

Run:

```bash
node --test --test-name-pattern="shared stylesheet" scripts/verify-scenario-cards.mjs
node --test scripts/verify-scenario-cards.mjs
```

Expected: both commands report `2` passing tests and `0` failures.

- [ ] **Step 6: Commit the shared foundation**

```bash
git add scripts/verify-scenario-cards.mjs files/assets/scenario-cards.css index.html research.html
git diff --cached --check
git commit -m "Add shared scenario card styles"
```

Expected: the commit contains the verifier, shared CSS, and one stylesheet link in each page.

## Task 2: Homepage semantic markup and bilingual keys

**Files:**
- Modify: `scripts/verify-scenario-cards.mjs`
- Modify: `index.html:373-426`
- Modify: `index.html:455-467`
- Modify: `index.html:1314`
- Modify: `index.html:1484-1491`
- Modify: `index.html:2237-2240`
- Modify: `index.html:2310-2313`

- [ ] **Step 1: Extend the verifier with homepage contract tests**

Add these helpers after `cssRule()`:

```js
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

function decodedTranslationEntries(key) {
  const pattern = new RegExp(`"${escapeRegex(key)}"\\s*:\\s*"((?:\\\\.|[^"\\\\])*)"`, 'g');
  return [...indexHtml.matchAll(pattern)].map((match) => JSON.parse(`"${match[1]}"`));
}
```

Append these two tests:

```js
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
```

- [ ] **Step 2: Run the homepage tests and verify RED**

Run:

```bash
node --test --test-name-pattern="homepage" scripts/verify-scenario-cards.mjs
```

Expected: `2` homepage tests fail because the current module uses `div`/`ul`/`li` markup and the combined `research.science`, `research.energy`, and `research.recsys` keys.

- [ ] **Step 3: Remove the obsolete homepage-only scenario CSS**

Delete the complete `.research-scenarios`, `.research-scenarios-title`, `.scenario-list`, `.scenario-list li`, and `.scenario-label` blocks from `index.html:373-426`.

Replace the Chinese selector groups at `index.html:455-467` with:

```css
html[lang="zh-CN"] .research-list {
  line-height: 1.75;
}
html[lang="zh-CN"] .research-list li {
  word-break: normal;
  overflow-wrap: anywhere;
}
```

Delete this obsolete rule from the `max-width: 680px` block:

```css
.scenario-list { grid-template-columns: 1fr; }
```

- [ ] **Step 4: Replace the homepage scenario markup**

Replace `index.html:1484-1491` with:

```html
    <section class="scenario-section" aria-labelledby="homepage-scenario-heading">
      <div class="scenario-heading-row">
        <h3 id="homepage-scenario-heading" class="scenario-heading" data-i18n="research.scenarioTitle">Broader Application and Evaluation Scenarios</h3>
      </div>
      <div class="scenario-grid">
        <article class="scenario-card scenario-card--science">
          <div class="scenario-card-accent" aria-hidden="true"></div>
          <div class="scenario-card-header">
            <span class="scenario-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M9 3h6M10 3v5L5 17a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M8 14h8"></path>
              </svg>
            </span>
            <h4 class="scenario-card-title" data-i18n="research.scienceTitle">AI for Science</h4>
          </div>
          <p class="scenario-card-body" data-i18n="research.scienceBody">Using <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> as the technical foundation for structured scientific data modeling and scientific literature mining.</p>
        </article>
        <article class="scenario-card scenario-card--energy">
          <div class="scenario-card-accent" aria-hidden="true"></div>
          <div class="scenario-card-header">
            <span class="scenario-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m13 2-7 12h6l-1 8 7-12h-6z"></path>
              </svg>
            </span>
            <h4 class="scenario-card-title" data-i18n="research.energyTitle">AI for Energy Systems</h4>
          </div>
          <p class="scenario-card-body" data-i18n="research.energyBody">Building <strong class="scenario-card-emphasis">context-aware forecasting agents</strong> for load, solar, and wind systems, with renewable analytics for dispatch, storage, grid balancing, and risk-aware operation.</p>
        </article>
        <article class="scenario-card scenario-card--user">
          <div class="scenario-card-accent" aria-hidden="true"></div>
          <div class="scenario-card-header">
            <span class="scenario-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="8" r="3"></circle>
                <path d="M6 20c.7-4 2.7-6 6-6s5.3 2 6 6M4 8h2m12 0h2"></path>
              </svg>
            </span>
            <h4 class="scenario-card-title" data-i18n="research.userTitle">AI for User Modeling</h4>
          </div>
          <p class="scenario-card-body" data-i18n="research.userBody">Modeling <strong class="scenario-card-emphasis">behavioral sequences and preference dynamics</strong> to support explainable recommendation, user simulation, and LLM-based interactive decision support.</p>
        </article>
      </div>
    </section>
```

- [ ] **Step 5: Split the English and Chinese i18n keys**

Replace the three combined English keys with:

```js
    "research.scenarioTitle": "Broader Application and Evaluation Scenarios",
    "research.scienceTitle": "AI for Science",
    "research.scienceBody": "Using <strong class=\"scenario-card-emphasis\">LLMs and Agentic AI</strong> as the technical foundation for structured scientific data modeling and scientific literature mining.",
    "research.energyTitle": "AI for Energy Systems",
    "research.energyBody": "Building <strong class=\"scenario-card-emphasis\">context-aware forecasting agents</strong> for load, solar, and wind systems, with renewable analytics for dispatch, storage, grid balancing, and risk-aware operation.",
    "research.userTitle": "AI for User Modeling",
    "research.userBody": "Modeling <strong class=\"scenario-card-emphasis\">behavioral sequences and preference dynamics</strong> to support explainable recommendation, user simulation, and LLM-based interactive decision support.",
```

Replace the three combined Chinese keys with:

```js
    "research.scenarioTitle": "应用与评测场景",
    "research.scienceTitle": "AI for Science",
    "research.scienceBody": "以 <strong class=\"scenario-card-emphasis\">LLMs and Agentic AI</strong> 为技术，面向结构化科学数据建模以及科技文献挖掘。",
    "research.energyTitle": "电力能源智能",
    "research.energyBody": "构建面向负荷、光伏与风电的<strong class=\"scenario-card-emphasis\">上下文感知预测智能体</strong>，服务可再生能源分析、调度优化、储能控制、平衡与风险管理。",
    "research.userTitle": "AI for User Modeling",
    "research.userBody": "刻画<strong class=\"scenario-card-emphasis\">用户行为序列与偏好演化</strong>，支撑可解释推荐、用户模拟，以及大模型驱动的人机交互式决策支持。",
```

- [ ] **Step 6: Run the focused and full tests and verify GREEN**

Run:

```bash
node --test --test-name-pattern="homepage" scripts/verify-scenario-cards.mjs
node --test scripts/verify-scenario-cards.mjs
```

Expected: the focused command reports `2` homepage tests passing; the full command reports `4` tests passing and `0` failures.

- [ ] **Step 7: Commit the homepage migration**

```bash
git add scripts/verify-scenario-cards.mjs index.html
git diff --cached --check
git commit -m "Refine homepage scenario cards"
```

Expected: only the verifier and `index.html` are committed.

## Task 3: Research-page markup, copy, and compatibility cleanup

**Files:**
- Modify: `scripts/verify-scenario-cards.mjs`
- Modify: `research.html:294-362`
- Modify: `research.html:463-518`
- Modify: `research.html:602-623`
- Modify: `research.html:781-825`

- [ ] **Step 1: Extend the verifier with Research-page tests**

Add this source read after `researchHtml`:

```js
const siteLanguageJs = read('files/assets/site-language.js');
```

Add this helper after `articleFor()`:

```js
function visibleText(html) {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}
```

Append these tests:

```js
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
```

- [ ] **Step 2: Run the Research-page tests and verify RED**

Run:

```bash
node --test --test-name-pattern="research page" scripts/verify-scenario-cards.mjs
```

Expected: `2` tests fail because `research.html` still uses `.scenario-cards`/`.sc-card`, the old order, non-semantic titles, and page-specific copy.

- [ ] **Step 3: Remove only obsolete Research-page styles**

Apply these exact cleanup boundaries:

1. Delete `.scenario-section-label` through `.sc-card-icon` at `research.html:295-362`.
2. Keep `.visual-icon`, `.icon-network`, `.icon-series`, `.icon-table`, and `.icon-literature` intact.
3. Delete `.icon-recommend` through `.icon-energy` and `.sc-card-title` through `.sc-card-desc strong` at `research.html:463-518`.
4. Delete the complete `@media (max-width: 840px)` scenario block.
5. In `@media (max-width: 680px)`, replace the grouped scenario rules with these primary-card-only rules:

```css
  .rd-card-desc { text-align: left; }
  .rd-card { min-width: 0; }
```

After cleanup, the shared visual-marker section must still begin with:

```css
/* ===== CSS-drawn visual markers ===== */
.visual-icon i,
.visual-icon::before,
.visual-icon::after {
  content: "";
  position: absolute;
  display: block;
}
```

- [ ] **Step 4: Replace the Research-page scenario markup**

Replace `research.html:781-825` with:

```html
    <!-- Broader Scenarios -->
    <section class="scenario-section" aria-labelledby="research-scenario-heading">
      <div class="scenario-heading-row">
        <h2 id="research-scenario-heading" class="scenario-heading scenario-section-label">Broader Application and Evaluation Scenarios</h2>
      </div>
      <div class="scenario-grid">
        <article class="scenario-card scenario-card--science">
          <div class="scenario-card-accent" aria-hidden="true"></div>
          <div class="scenario-card-header">
            <span class="scenario-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="M9 3h6M10 3v5L5 17a2 2 0 0 0 1.7 3h10.6a2 2 0 0 0 1.7-3l-5-9V3M8 14h8"></path>
              </svg>
            </span>
            <h3 class="scenario-card-title">AI for Science</h3>
          </div>
          <p class="scenario-card-body">Using <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> as the technical foundation for structured scientific data modeling and scientific literature mining.</p>
        </article>
        <article class="scenario-card scenario-card--energy">
          <div class="scenario-card-accent" aria-hidden="true"></div>
          <div class="scenario-card-header">
            <span class="scenario-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <path d="m13 2-7 12h6l-1 8 7-12h-6z"></path>
              </svg>
            </span>
            <h3 class="scenario-card-title">AI for Energy Systems</h3>
          </div>
          <p class="scenario-card-body">Building <strong class="scenario-card-emphasis">context-aware forecasting agents</strong> for load, solar, and wind systems, with renewable analytics for dispatch, storage, grid balancing, and risk-aware operation.</p>
        </article>
        <article class="scenario-card scenario-card--user">
          <div class="scenario-card-accent" aria-hidden="true"></div>
          <div class="scenario-card-header">
            <span class="scenario-card-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                <circle cx="12" cy="8" r="3"></circle>
                <path d="M6 20c.7-4 2.7-6 6-6s5.3 2 6 6M4 8h2m12 0h2"></path>
              </svg>
            </span>
            <h3 class="scenario-card-title">AI for User Modeling</h3>
          </div>
          <p class="scenario-card-body">Modeling <strong class="scenario-card-emphasis">behavioral sequences and preference dynamics</strong> to support explainable recommendation, user simulation, and LLM-based interactive decision support.</p>
        </article>
      </div>
    </section>
```

Keep the existing `<!-- Notes -->` marker and research-note boxes immediately after the new section.

- [ ] **Step 5: Run the focused and full tests and verify GREEN**

Run:

```bash
node --test --test-name-pattern="research page" scripts/verify-scenario-cards.mjs
node --test scripts/verify-scenario-cards.mjs
```

Expected: the focused command reports `2` Research-page tests passing; the full command reports `6` tests passing and `0` failures.

- [ ] **Step 6: Commit the Research-page migration**

```bash
git add scripts/verify-scenario-cards.mjs research.html
git diff --cached --check
git commit -m "Unify research scenario cards"
```

Expected: only the verifier and `research.html` are committed.

## Task 4: Browser verification at four widths and in both language flows

**Files:**
- Verify: `index.html`
- Verify: `research.html`
- Verify: `files/assets/scenario-cards.css`

- [ ] **Step 1: Start a local HTTP server**

Run from the repository root:

```bash
python3 -m http.server 8017 --bind 127.0.0.1
```

Expected: the process reports `Serving HTTP on 127.0.0.1 port 8017`. Keep it running in a terminal session for the remaining browser checks.

- [ ] **Step 2: Verify the homepage at `1440px`, `834px`, `680px`, and `390px`**

Open `http://127.0.0.1:8017/index.html#Research` with the in-app Browser. At each viewport, evaluate:

```js
() => {
  const grid = document.querySelector('.scenario-grid');
  const body = document.querySelector('.scenario-card-body');
  const gridStyle = getComputedStyle(grid);
  const bodyStyle = getComputedStyle(body);
  return {
    cards: grid.querySelectorAll('.scenario-card').length,
    columns: gridStyle.gridTemplateColumns.split(' ').filter(Boolean).length,
    overflowFree: document.documentElement.scrollWidth === document.documentElement.clientWidth,
    textAlign: bodyStyle.textAlign,
    textAlignLast: bodyStyle.textAlignLast,
    hyphens: bodyStyle.hyphens || bodyStyle.webkitHyphens,
    emphasis: grid.querySelectorAll('.scenario-card-emphasis').length,
    icons: grid.querySelectorAll('svg[focusable="false"]').length
  };
}
```

Expected at `1440px`:

```js
{
  cards: 3,
  columns: 3,
  overflowFree: true,
  textAlign: 'left',
  textAlignLast: 'auto',
  hyphens: 'none',
  emphasis: 3,
  icons: 3
}
```

Expected at `834px`, `680px`, and `390px`: the same values except `columns: 1`. Capture one desktop and one mobile screenshot and visually confirm that no English word is automatically hyphenated.

- [ ] **Step 3: Verify homepage English/Chinese toggling without DOM loss**

Before each click, take a fresh DOM snapshot, locate `#languageToggle`, and confirm its count is exactly `1`. Record this state before the first click and after each of two clicks:

```js
() => ({
  lang: document.documentElement.lang,
  heading: document.querySelector('.scenario-heading').textContent.trim(),
  titles: [...document.querySelectorAll('.scenario-card-title')].map((node) => node.textContent.trim()),
  cards: document.querySelectorAll('.scenario-card').length,
  emphasis: document.querySelectorAll('.scenario-card-emphasis').length,
  icons: document.querySelectorAll('.scenario-card-icon svg').length
})
```

Expected English state:

```js
{
  lang: 'en',
  heading: 'Broader Application and Evaluation Scenarios',
  titles: ['AI for Science', 'AI for Energy Systems', 'AI for User Modeling'],
  cards: 3,
  emphasis: 3,
  icons: 3
}
```

Expected Chinese state:

```js
{
  lang: 'zh-CN',
  heading: '应用与评测场景',
  titles: ['AI for Science', '电力能源智能', 'AI for User Modeling'],
  cards: 3,
  emphasis: 3,
  icons: 3
}
```

Expected: two clicks alternate between these states and return to the initial state; the card, emphasis, and SVG counts never change.

- [ ] **Step 4: Verify the Research page and its partial heading translation**

Open `http://127.0.0.1:8017/research.html`. Repeat the width check from Step 2. Then use the same unique `#languageToggle` interaction recipe and evaluate:

```js
() => ({
  lang: document.documentElement.lang,
  heading: document.querySelector('.scenario-heading').textContent.trim(),
  titles: [...document.querySelectorAll('.scenario-card-title')].map((node) => node.textContent.trim()),
  cards: document.querySelectorAll('.scenario-card').length
})
```

Expected: the heading alternates between `Broader Application and Evaluation Scenarios` and `应用与评测场景`; the three English card titles stay in canonical order; `cards` stays `3`.

- [ ] **Step 5: Stop the local server**

Send `Ctrl-C` to the server terminal session.

Expected: the server exits cleanly and port `8017` is released.

## User-requested follow-up: Clean two-edge Research intro alignment

**Allowed files:**
- Modify: `scripts/verify-scenario-cards.mjs`
- Modify: `research.html`
- Modify: `docs/superpowers/plans/2026-07-11-unified-application-scenario-cards.md`

- [ ] **RED: Append the Research intro alignment regression test**

Append this exact test, which reads the base `.page-hero-sub` rule and requires the clean two-edge alignment declarations:

```js
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
```

Run:

```bash
node --test --test-name-pattern="research hero introduction" scripts/verify-scenario-cards.mjs
```

Expected RED: exactly `1` test fails because the base rule lacks `text-justify: inter-word;`, uses `hyphens: auto;`, and lacks `-webkit-hyphens: none;`.

- [ ] **GREEN: Refine only the base Research intro rule**

Keep the existing font size, color, line height, and max width. Make the base `.page-hero-sub` rule end exactly with:

```css
  max-width: 74ch;
  text-align: justify;
  text-align-last: left;
  text-justify: inter-word;
  hyphens: none;
  -webkit-hyphens: none;
}
```

Preserve the existing `@media (max-width:680px)` behavior unchanged:

```css
.page-hero-sub {
  text-align: left;
  text-align-last: left;
  hyphens: manual;
}
```

Rerun the targeted test and the full static verifier. Expected GREEN: targeted `1/1` pass and full suite `7/7` pass. Recheck `research.html` at `1187px` desktop width to confirm clean two-edge alignment without automatic word splits; the `<=680px` view must remain left-aligned. Stage only the three allowed files, verify cached diff and scope, and commit with exact subject `Refine research intro alignment`.

## Task 5: Final repository verification and scope audit

**Files:**
- Verify: `docs/superpowers/plans/2026-07-11-unified-application-scenario-cards.md`
- Verify: `files/assets/scenario-cards.css`
- Verify: `scripts/verify-scenario-cards.mjs`
- Verify: `index.html`
- Verify: `research.html`

- [ ] **Step 1: Run the complete static verifier**

```bash
node --test scripts/verify-scenario-cards.mjs
```

Expected: `7` tests pass, `0` fail, and the process exits `0`.

- [ ] **Step 2: Run whitespace and patch-integrity checks**

```bash
git diff --check 162ca94..HEAD
git diff --check
```

Expected: both commands produce no output and exit `0`.

- [ ] **Step 3: Verify the complete file scope since the design commit**

```bash
git diff --name-only 162ca94..HEAD
```

Expected sorted file set:

```text
docs/superpowers/plans/2026-07-11-unified-application-scenario-cards.md
files/assets/scenario-cards.css
index.html
research.html
scripts/verify-scenario-cards.mjs
```

- [ ] **Step 4: Verify working-tree cleanliness without touching user files**

```bash
git status --short
```

Expected in an isolated implementation worktree: no output. Expected in the current workspace: only the pre-existing entries below; none may be staged or modified by this implementation.

```text
 M HomePage_files/.DS_Store
?? .superpowers/
?? HomePage_files/Mycheng-7.jpg
```

- [ ] **Step 5: Review the implementation commits**

```bash
git log --format='%s' 162ca94..HEAD
```

Expected five commits, newest first:

```text
Refine research intro alignment
Unify research scenario cards
Refine homepage scenario cards
Add shared scenario card styles
Document unified scenario cards implementation plan
```

Verify the five exact subjects and that no push has occurred because publication was not requested.
