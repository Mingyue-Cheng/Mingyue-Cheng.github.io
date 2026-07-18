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

function cssRuleBlocks(source, selector) {
  const cleanSource = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const pattern = new RegExp(`${escapeRegex(selector)}\\s*\\{([^{}]*)\\}`, 'g');
  return [...cleanSource.matchAll(pattern)]
    .filter((match) => {
      const previousBoundary = Math.max(
        cleanSource.lastIndexOf('{', match.index - 1),
        cleanSource.lastIndexOf('}', match.index - 1)
      );
      return cleanSource.slice(previousBoundary + 1, match.index).trim() === '';
    })
    .map((match) => {
      let depth = 0;
      for (let index = 0; index < match.index; index += 1) {
        if (cleanSource[index] === '{') depth += 1;
        if (cleanSource[index] === '}') depth -= 1;
      }
      return { body: match[1], depth };
    });
}

function cssRule(source, selector) {
  const rules = cssRuleBlocks(source, selector);
  assert.ok(rules.length > 0, `Missing CSS rule: ${selector}`);
  return rules[0].body;
}

function normalizeCssValue(value) {
  return value
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .replace(/\(\s*/g, '(')
    .replace(/\s*\)/g, ')');
}

function finalDeclarationValue(ruleBody, property) {
  let finalValue;
  for (const declaration of ruleBody.split(';')) {
    const separator = declaration.indexOf(':');
    if (separator < 0) continue;
    const name = declaration.slice(0, separator).trim().toLowerCase();
    if (name === property.toLowerCase()) {
      finalValue = normalizeCssValue(declaration.slice(separator + 1));
    }
  }
  return finalValue;
}

function assertFinalDeclarations(ruleBody, expected, label) {
  for (const [property, value] of Object.entries(expected)) {
    assert.equal(
      finalDeclarationValue(ruleBody, property),
      value,
      `${label} must end with ${property}: ${value}`
    );
  }
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

function classTokens(source) {
  return [...source.matchAll(/\sclass\s*=\s*(["'])(.*?)\1/gs)]
    .flatMap((match) => match[2].split(/\s+/).filter(Boolean));
}

function classTokenCount(source, token) {
  return classTokens(source).filter((value) => value === token).length;
}

function startTags(source, tagName) {
  const pattern = new RegExp(`<${escapeRegex(tagName)}\\b[^>]*>`, 'g');
  return [...source.matchAll(pattern)].map((match) => match[0]);
}

function startTagsWithClass(source, tagName, token) {
  return startTags(source, tagName).filter((tag) => classTokenCount(tag, token) > 0);
}

function hasAttributeValue(tag, attribute, value) {
  const pattern = new RegExp(`\\s${escapeRegex(attribute)}\\s*=\\s*(["'])${escapeRegex(value)}\\1`);
  return pattern.test(tag);
}

function assertCanonicalOrder(source, pageLabel) {
  const cardTags = startTagsWithClass(source, 'article', 'scenario-card');
  const modifierTokens = cardTags.map((tag) =>
    classTokens(tag).filter((token) => token.startsWith('scenario-card--'))
  );
  assert.deepEqual(
    modifierTokens,
    [['scenario-card--science'], ['scenario-card--user']],
    `${pageLabel} card modifiers must be exactly Science, User`
  );
}

function articleFor(source, modifier) {
  const match = [...source.matchAll(/(<article\b[^>]*>)[\s\S]*?<\/article>/g)]
    .find((candidate) => classTokenCount(candidate[1], `scenario-card--${modifier}`) === 1);
  const article = match?.[0];
  assert.ok(article, `Missing ${modifier} article`);
  return article;
}

function assertScenarioStructure(section, pageLabel, cardTitleTagName) {
  assert.equal(
    matchCount(section, /<article\b/g),
    2,
    `${pageLabel} scenario section must contain exactly 2 article start tags`
  );
  assert.equal(
    startTagsWithClass(section, 'article', 'scenario-card').length,
    2,
    `${pageLabel} scenario section must contain exactly 2 scenario-card articles`
  );
  assert.equal(
    matchCount(section, new RegExp(`<${escapeRegex(cardTitleTagName)}\\b`, 'g')),
    2,
    `${pageLabel} scenario section must contain exactly 2 ${cardTitleTagName} start tags`
  );
  assert.equal(
    startTagsWithClass(section, cardTitleTagName, 'scenario-card-title').length,
    2,
    `${pageLabel} scenario section must contain exactly 2 scenario-card-title elements`
  );
  assert.equal(
    matchCount(section, /<p\b/g),
    2,
    `${pageLabel} scenario section must contain exactly 2 paragraph start tags`
  );
  assert.equal(
    startTagsWithClass(section, 'p', 'scenario-card-body').length,
    2,
    `${pageLabel} scenario section must contain exactly 2 scenario-card-body paragraphs`
  );
  assert.equal(
    startTagsWithClass(section, 'span', 'scenario-card-icon').length,
    2,
    `${pageLabel} scenario section must contain exactly 2 scenario-card-icon spans`
  );
  assert.equal(
    classTokenCount(section, 'scenario-card-icon'),
    2,
    `${pageLabel} scenario section must contain exactly 2 scenario-card-icon class tokens`
  );
  assert.equal(
    matchCount(section, /<svg\b/g),
    2,
    `${pageLabel} scenario section must contain exactly 2 SVG start tags`
  );
  assert.equal(
    startTagsWithClass(section, 'strong', 'scenario-card-emphasis').length,
    2,
    `${pageLabel} scenario section must contain exactly 2 emphasized strong elements`
  );
  assert.equal(
    classTokenCount(section, 'scenario-card-emphasis'),
    2,
    `${pageLabel} scenario section must contain exactly 2 scenario-card-emphasis class tokens`
  );
  assert.doesNotMatch(section, /role="list(item)?"/, `${pageLabel} cards must not use list roles`);
  assert.doesNotMatch(section, /scenario-card--energy/, `${pageLabel} must not contain an Energy card`);
  assertCanonicalOrder(section, pageLabel);

  const articles = {};
  for (const modifier of ['science', 'user']) {
    const article = articleFor(section, modifier);
    assert.equal(
      classTokenCount(article, 'scenario-card-emphasis'),
      1,
      `${pageLabel} ${modifier} article must contain exactly 1 emphasis class token`
    );
    articles[modifier] = article;
  }
  return articles;
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
  const gridRules = cssRuleBlocks(scenarioCss, '.scenario-grid');
  assert.equal(
    gridRules.length,
    2,
    'Shared stylesheet must contain exactly 2 scenario-grid rule blocks'
  );
  const baseGridRules = gridRules.filter((rule) => rule.depth === 0);
  assert.equal(
    baseGridRules.length,
    1,
    'Shared stylesheet must contain exactly 1 top-level scenario-grid rule block'
  );
  assertFinalDeclarations(
    baseGridRules[0].body,
    {
      'grid-template-columns': 'repeat(2, minmax(0, 1fr))',
      width: '100%',
      'max-width': '900px',
      margin: '0 auto'
    },
    'Base scenario grid'
  );

  assert.match(scenarioCss, /@media \(hover:\s*hover\) and \(pointer:\s*fine\)/);
  assert.match(scenarioCss, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.doesNotMatch(scenarioCss, /cursor:\s*pointer/);
  assert.doesNotMatch(scenarioCss, /\.scenario-card--energy\b/);

  for (const modifier of ['science', 'user']) {
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
  const responsiveGridRules = cssRuleBlocks(oneColumnLayout, '.scenario-grid');
  assert.equal(
    responsiveGridRules.length,
    1,
    'The 900px media block must contain exactly 1 scenario-grid rule block'
  );
  assertFinalDeclarations(
    responsiveGridRules[0].body,
    {
      'max-width': '720px',
      'grid-template-columns': 'minmax(0, 1fr)'
    },
    'Responsive scenario grid'
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
  const researchArea = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  const section = sectionBetween(
    researchArea,
    '<section class="scenario-section" aria-labelledby="homepage-scenario-heading">',
    '</section>'
  );

  assert.match(section, /<section class="scenario-section" aria-labelledby="homepage-scenario-heading">/);
  assert.match(section, /<h3 id="homepage-scenario-heading" class="scenario-heading" data-i18n="research\.scenarioTitle">/);
  const articles = assertScenarioStructure(section, 'Homepage', 'h4');

  for (const modifier of ['science', 'user']) {
    const article = articles[modifier];
    for (const [tagName, className, suffix] of [
      ['h4', 'scenario-card-title', 'Title'],
      ['p', 'scenario-card-body', 'Body']
    ]) {
      const key = `research.${modifier}${suffix}`;
      const matchingTags = startTagsWithClass(section, tagName, className)
        .filter((tag) => hasAttributeValue(tag, 'data-i18n', key));
      assert.equal(
        matchingTags.length,
        1,
        `${key} must appear once on a ${className} element`
      );
      assert.equal(
        startTagsWithClass(article, tagName, className)
          .filter((tag) => hasAttributeValue(tag, 'data-i18n', key)).length,
        1,
        `${key} must belong to the ${modifier} article`
      );
    }

  }
});

test('homepage dictionaries provide complete split scenario translations', () => {
  const expected = {
    'research.scienceTitle': ['AI for Science', 'AI for Science'],
    'research.scienceBody': [
      'Applying <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> to structured scientific data modeling, scientific literature mining.',
      '以 <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> 为技术，面向结构化科学数据建模与科技文献挖掘。'
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

  for (const removedKey of ['research.energyTitle', 'research.energyBody']) {
    const removedKeyPattern = new RegExp(`["']${escapeRegex(removedKey)}["']\\s*:`);
    assert.equal(removedKeyPattern.test(indexHtml), false, `${removedKey} must be absent`);
  }

  for (const oldKey of ['research.science', 'research.energy', 'research.recsys']) {
    assert.doesNotMatch(indexHtml, new RegExp(`"${escapeRegex(oldKey)}"\\s*:`));
  }
});

test('research collections omit Tabular Data Mining without changing publication taxonomy', () => {
  const homepageSection = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  const collectionTranslations = decodedTranslationEntries('research.collections');
  assert.equal(collectionTranslations.length, 2, 'Homepage must keep English and Chinese collection translations');

  for (const [name, source] of [
    ['homepage collection', homepageSection],
    ['research page', researchHtml],
    ...collectionTranslations.map((source, index) => [`collection translation ${index + 1}`, source])
  ]) {
    assert.doesNotMatch(source, /ustc-table-mining\.github\.io|🧮/, `${name} must omit Tabular Data Mining`);
  }

  assert.match(
    indexHtml,
    /<button class="pub-filter-btn" data-filter="table" data-i18n="pub\.filterTable">Tabular Data Mining<\/button>/
  );
  assert.match(indexHtml, /<meta property="og:description" content="[^"]*Tabular Data Mining\."/);
  assert.match(indexHtml, /<meta name="twitter:description" content="[^"]*Tabular Data Mining\."/);
});

test('research page matches the homepage scenario contract', () => {
  const homepageResearchArea = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  const homepageSection = sectionBetween(
    homepageResearchArea,
    '<section class="scenario-section" aria-labelledby="homepage-scenario-heading">',
    '</section>'
  );
  const researchArea = sectionBetween(researchHtml, '<!-- Broader Scenarios -->', '<!-- Notes -->');
  const researchSection = sectionBetween(
    researchArea,
    '<section class="scenario-section" aria-labelledby="research-scenario-heading">',
    '</section>'
  );

  assert.match(researchSection, /<section class="scenario-section" aria-labelledby="research-scenario-heading">/);
  assert.match(researchSection, /<h2 id="research-scenario-heading" class="scenario-heading scenario-section-label">/);
  const researchArticles = assertScenarioStructure(researchSection, 'Research page', 'h3');

  for (const modifier of ['science', 'user']) {
    assert.equal(
      visibleText(researchArticles[modifier]),
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
