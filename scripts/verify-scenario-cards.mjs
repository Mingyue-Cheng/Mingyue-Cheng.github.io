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
const stylesheetLink = '<link rel="stylesheet" href="files/assets/scenario-cards.css?v=20260719">';

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

test('research page keeps the homepage container alignment contract', () => {
  const homepageInlineCss = sectionBetween(indexHtml, '<style>', '</style>');
  const researchInlineCss = sectionBetween(researchHtml, '<style>', '</style>');

  for (const [pageLabel, inlineCss] of [
    ['Homepage', homepageInlineCss],
    ['Research page', researchInlineCss]
  ]) {
    assertFinalDeclarations(
      cssRule(inlineCss, '.container'),
      {
        'max-width': 'var(--max-w)',
        margin: '0 auto',
        padding: '0 28px'
      },
      `${pageLabel} container`
    );
  }

  assert.equal(
    matchCount(researchInlineCss, /\.container\b/g),
    matchCount(homepageInlineCss, /\.container\b/g),
    'Research page must not add a breakpoint-only container padding override'
  );
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
      width: '100%'
    },
    'Base scenario grid'
  );
  assert.equal(
    finalDeclarationValue(baseGridRules[0].body, 'max-width'),
    undefined,
    'Base scenario grid must not set max-width so desktop cards align to both section edges'
  );
  assert.equal(
    finalDeclarationValue(baseGridRules[0].body, 'margin'),
    undefined,
    'Base scenario grid must not set margin so desktop cards align to both section edges'
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
    { 'grid-template-columns': 'minmax(0, 1fr)' },
    'Responsive scenario grid'
  );
  assert.equal(
    finalDeclarationValue(responsiveGridRules[0].body, 'max-width'),
    undefined,
    'Responsive scenario grid must not set max-width so the single column uses the full available width'
  );

  const oneColumnHeader = cssRule(oneColumnLayout, '.scenario-card-header');
  assert.ok(oneColumnHeader.includes('min-height: 0;'), 'One-column headers must release the desktop minimum height');

  for (const selector of ['.scenario-card-body', '.research-section .scenario-card-body']) {
    const body = cssRule(scenarioCss, selector);
    for (const declaration of [
      'text-align: left;',
      'text-align-last: left;',
      'hyphens: none;',
      '-webkit-hyphens: none;',
      'word-break: normal;'
    ]) {
      assert.ok(body.includes(declaration), `Missing ${selector} declaration: ${declaration}`);
    }
    assert.equal(
      finalDeclarationValue(body, 'text-align'),
      'left',
      `${selector} must not justify short scenario card text`
    );
    assert.equal(
      finalDeclarationValue(body, 'text-justify'),
      undefined,
      `${selector} must not force inter-word spacing`
    );
  }
  assert.equal(
    finalDeclarationValue(cssRule(scenarioCss, '.scenario-card-body'), 'overflow-wrap'),
    'break-word',
    'Scenario card text must wrap safely within narrow card widths'
  );
  assertFinalDeclarations(
    cssRule(scenarioCss, '.scenario-card-body'),
    {
      margin: '0 0 10px',
      'font-size': '14px',
      'line-height': '1.8'
    },
    'Scenario card body typography'
  );

  const chineseBody = cssRule(
    scenarioCss,
    'html[lang="zh-CN"] .research-section .scenario-card-body'
  );
  for (const declaration of [
    'text-align: left;',
    'text-align-last: left;'
  ]) {
    assert.ok(chineseBody.includes(declaration), `Missing Chinese-mode body declaration: ${declaration}`);
  }
  assert.equal(
    finalDeclarationValue(chineseBody, 'text-justify'),
    undefined,
    'Chinese-mode scenario bodies must not force inter-word spacing'
  );
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

test('homepage scenario bodies use consistent selective emphasis', () => {
  const researchArea = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  const userArticle = articleFor(researchArea, 'user');

  assert.match(
    userArticle,
    /<p class="scenario-card-body" data-i18n="research\.userBody">Recommendation systems and decision-support applications for <strong class="scenario-card-emphasis">power and energy systems<\/strong>\.<\/p>/,
    'The Big Data Applications body must use regular text with one emphasized key phrase'
  );
  assert.doesNotMatch(
    userArticle,
    /<p class="scenario-card-body"[^>]*>\s*<strong class="scenario-card-emphasis">/,
    'The Big Data Applications body must not render the full sentence as emphasized text'
  );
});

test('homepage dictionaries provide complete split scenario translations', () => {
  const expected = {
    'research.scienceTitle': ['AI for Science', 'AI for Science'],
    'research.scienceBody': [
      'Applying <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> to structured scientific data modeling, scientific literature mining.',
      '以 <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> 为技术，面向结构化科学数据建模与科技文献挖掘。'
    ],
    'research.userTitle': ['Big Data Applications', 'Big Data Applications'],
    'research.userBody': [
      'Recommendation systems and decision-support applications for <strong class="scenario-card-emphasis">power and energy systems</strong>.',
      'Recommendation systems and decision-support applications for <strong class="scenario-card-emphasis">power and energy systems</strong>.'
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

test('homepage LLMs and Agentic AI direction copy stays synchronized', () => {
  const oldAgentFocus = 'autonomous interactive learning and reasoning mechanisms';
  const newAgentFocus = 'autonomous interactive learning';
  const expectedEnglishAgent =
    '<span class="research-label">🤖 <strong>LLMs and Agentic AI:</strong></span> Developing <span class="research-keyword">autonomous interactive learning</span> for large language models, including <span class="research-keyword">environment-interactive Agentic RL</span>, <span class="research-keyword">tool-augmented reasoning</span>, <span class="research-keyword">multi-agent orchestration</span>, and continual capability evolution through context, knowledge, and memory.';
  const expectedResearchCard =
    'Developing <strong>autonomous interactive learning</strong> for large language models, including <strong>environment-interactive Agentic RL</strong>, <strong>tool-augmented reasoning</strong>, <strong>multi-agent orchestration</strong>, and continual capability evolution through context, knowledge, and memory.';
  const homepageSection = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  const researchDirectionsSection = sectionBetween(
    researchHtml,
    '<div class="rd-section-label">Primary Research Directions</div>',
    '<!-- Broader Scenarios -->'
  );
  const normalizedResearchDirectionsSection = researchDirectionsSection.replace(/\s+/g, ' ');

  assert.match(homepageSection, new RegExp(escapeRegex(expectedEnglishAgent)));
  assert.equal(
    decodedTranslationEntries('research.agent')[0],
    expectedEnglishAgent,
    'English research.agent translation must match the visible homepage copy'
  );
  assert.match(researchDirectionsSection, /<div class="rd-card-title">LLMs and Agentic AI<\/div>/);
  assert.match(normalizedResearchDirectionsSection, new RegExp(escapeRegex(expectedResearchCard)));
  assert.equal(indexHtml.includes(oldAgentFocus), false, 'Old agent focus wording must be absent');
  assert.equal(indexHtml.includes(newAgentFocus), true, 'New agent focus wording must be present');
});

test('Time-Series Analysis direction copy stays synchronized', () => {
  const oldTitle = 'Time-Series Cognition';
  const oldFocus = 'context-aware predictive intelligence for complex systems';
  const oldObservationFrame = 'dynamic system observations';
  const oldReasoning = 'slow-thinking temporal reasoning';
  const expectedEnglishTimeseries =
    '<span class="research-label">📊 <strong>Time-Series Analysis:</strong></span> Developing <span class="research-keyword">context-aware predictive intelligence</span>, with a focus on <span class="research-keyword">multimodal context representation</span>, <span class="research-keyword">slow-thinking reasoning</span>, <span class="research-keyword">uncertainty-aware forecasting</span>, and <span class="research-keyword">autonomous agentic interaction</span>.';
  const expectedResearchCard =
    'Developing <strong>context-aware predictive intelligence</strong>, with a focus on <strong>multimodal context representation</strong>, <strong>slow-thinking reasoning</strong>, <strong>uncertainty-aware forecasting</strong>, and <strong>autonomous agentic interaction</strong>.';
  const homepageSection = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  const visibleTimeseriesMatch = homepageSection.match(/<li data-i18n="research\.timeseries">[\s\S]*?<\/li>/);
  assert.ok(visibleTimeseriesMatch, 'Homepage must include a visible research.timeseries list item');
  const visibleTimeseries = visibleTimeseriesMatch[0];
  const researchDirectionsSection = sectionBetween(
    researchHtml,
    '<div class="rd-section-label">Primary Research Directions</div>',
    '<!-- Broader Scenarios -->'
  );
  const normalizedResearchDirectionsSection = researchDirectionsSection.replace(/\s+/g, ' ');

  assert.match(visibleTimeseries, new RegExp(escapeRegex(expectedEnglishTimeseries)));
  assert.equal(
    decodedTranslationEntries('research.timeseries')[0],
    expectedEnglishTimeseries,
    'English research.timeseries translation must match the visible homepage copy'
  );
  assert.match(researchDirectionsSection, /<div class="rd-card-title">Time-Series Analysis<\/div>/);
  assert.match(normalizedResearchDirectionsSection, new RegExp(escapeRegex(expectedResearchCard)));

  for (const [label, source] of [
    ['homepage research.timeseries item', visibleTimeseries],
    ['English research.timeseries translation', decodedTranslationEntries('research.timeseries')[0]],
    ['research direction cards', researchDirectionsSection]
  ]) {
    assert.equal(source.includes(oldTitle), false, `${label} must not use the old title`);
    assert.equal(source.includes(oldFocus), false, `${label} must not use the old predictive-intelligence wording`);
    assert.equal(source.includes(oldObservationFrame), false, `${label} must not keep the old observation framing`);
    assert.equal(source.includes(oldReasoning), false, `${label} must not keep the old reasoning wording`);
  }
});

test('research page visible directions and notes match the homepage content', () => {
  const homepageSection = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  const homepageDirections = sectionBetween(
    homepageSection,
    '<ul class="research-list primary-directions">',
    '</ul>'
  );
  const researchDirections = sectionBetween(
    researchHtml,
    '<div class="primary-cards">',
    '</div><!-- /primary-cards -->'
  );

  assert.equal(
    matchCount(homepageDirections, /<li\b(?![^>]*\bhidden\b)[^>]*>/g),
    2,
    'Homepage must expose exactly 2 primary directions'
  );
  assert.equal(
    matchCount(researchDirections, /<div class="rd-card"(?![^>]*\bhidden\b)[^>]*>/g),
    2,
    'Research page must expose the same 2 primary directions as the homepage'
  );
  assert.match(
    researchDirections,
    /<div class="rd-card" hidden>[\s\S]*?<div class="rd-card-title">Scientific Knowledge Cognition<\/div>/,
    'Scientific Knowledge Cognition must remain hidden on the Research page while it is hidden on the homepage'
  );

  const homepageCollection = homepageSection.match(
    /<div class="research-note" data-i18n="research\.collections">[\s\S]*?<\/div>/
  );
  const researchCollection = researchHtml.match(
    /<div class="research-note-box">\s*Research collections:[\s\S]*?<\/div>/
  );
  assert.ok(homepageCollection, 'Homepage research collections block must exist');
  assert.ok(researchCollection, 'Research-page collections block must exist');
  assert.equal(
    visibleText(researchCollection[0]),
    visibleText(homepageCollection[0]),
    'Research collections must match the homepage labels, icons, and order'
  );

  const expectedEnglishCollectionHtml =
    'Research collections: 🤖 <a href="https://agentr1.github.io/" target="_blank" rel="noopener">LLMs and Agentic AI</a> · 📊 <a href="https://ustc-time-series.github.io/" target="_blank" rel="noopener">Time Series Analysis</a> · 📚 <a href="https://ustcagi-sci.github.io/" target="_blank" rel="noopener">AI for Science</a>';
  const expectedChineseCollectionHtml = expectedEnglishCollectionHtml.replace(
    'Research collections: ',
    '研究主页：'
  );
  assert.ok(
    siteLanguageJs.includes(`collections: '${expectedEnglishCollectionHtml}'`),
    'English Research-page collections translation must match the homepage'
  );
  assert.ok(
    siteLanguageJs.includes(`collections: '${expectedChineseCollectionHtml}'`),
    'Chinese Research-page collections translation must match the homepage'
  );
  assert.ok(
    siteLanguageJs.includes('note.innerHTML = page.collections;'),
    'Research-page language switching must preserve the complete aligned collections markup'
  );
  assert.doesNotMatch(
    siteLanguageJs,
    /const links = Array\.from\(note\.querySelectorAll\('a'\)\)/,
    'Research-page language switching must not rebuild collections from links alone'
  );

  assert.equal(
    matchCount(
      siteLanguageJs,
      /join: '欢迎脚踏实地而又积极主动的本科生、研究生同学加入认知智能全国重点实验室 /g
    ),
    2,
    'English and Chinese Research-page join copy must match the homepage'
  );
  assert.doesNotMatch(siteLanguageJs, /join: 'Welcome motivated undergraduate and graduate students/);
  assert.match(
    siteLanguageJs,
    /subtitle: '我的研究主要面向复杂数据挖掘中的认知智能方法，以 大语言模型与智能体 AI 为核心，并围绕 时序认知 与 科学知识认知 展开。'/
  );
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

  assert.match(
    researchArticles.user,
    /<p class="scenario-card-body">Recommendation systems and decision-support applications for <strong class="scenario-card-emphasis">power and energy systems<\/strong>\.<\/p>/,
    'The research-page Big Data Applications body must use the shared selective-emphasis pattern'
  );

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
  assert.ok(
    researchHtml.includes('<script src="files/assets/site-language.js?v=20260719"></script>'),
    'Research page must request the current site-language.js content version'
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
  assert.ok(hero.includes('<desc id="cognitive-pipeline-desc">Time Series Analysis and Scientific Knowledge Cognition converge into cognitive reasoning, supporting AI for Science and energy systems.</desc>'));
  assert.equal(matchCount(hero, /<rect class="pipeline-node(?: |")/g), 5);
  assert.equal(matchCount(hero, /<path class="pipeline-path(?: |")/g), 4);
  assert.equal(matchCount(hero, /class="pipeline-stage"/g), 3);
  assert.equal(matchCount(hero, /pipeline-node--core/g), 1);
  assert.equal(matchCount(hero, /pipeline-node--application/g), 2);

  const heroText = visibleText(hero);
  for (const label of [
    'Time Series Analysis',
    'Scientific Knowledge Cognition',
    'Cognitive Reasoning',
    'AI for Science',
    'Energy Systems'
  ]) {
    assert.ok(heroText.includes(label), `Missing cognitive pipeline label: ${label}`);
  }
  assert.match(
    hero,
    /<text class="pipeline-label" x="64" y="153">\s*<tspan x="64" dy="0">Scientific<\/tspan>\s*<tspan x="64" dy="13">Knowledge<\/tspan>\s*<tspan x="64" dy="13">Cognition<\/tspan>\s*<\/text>/
  );

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
