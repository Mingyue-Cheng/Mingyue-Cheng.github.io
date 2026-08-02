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
const stylesheetLink = '<link rel="stylesheet" href="files/assets/scenario-cards.css?v=20260728">';

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

function assertCanonicalOrder(
  source,
  pageLabel,
  expectedModifiers = ['prediction', 'science', 'user']
) {
  const cardTags = startTagsWithClass(source, 'article', 'scenario-card');
  const modifierTokens = cardTags.map((tag) =>
    classTokens(tag).filter((token) => token.startsWith('scenario-card--'))
  );
  assert.deepEqual(
    modifierTokens,
    expectedModifiers.map((modifier) => [`scenario-card--${modifier}`]),
    `${pageLabel} card modifiers must follow the expected canonical order`
  );
}

function articleFor(source, modifier) {
  const match = [...source.matchAll(/(<article\b[^>]*>)[\s\S]*?<\/article>/g)]
    .find((candidate) => classTokenCount(candidate[1], `scenario-card--${modifier}`) === 1);
  const article = match?.[0];
  assert.ok(article, `Missing ${modifier} article`);
  return article;
}

function assertScenarioStructure(
  section,
  pageLabel,
  cardTitleTagName,
  expectedModifiers = ['prediction', 'science', 'user']
) {
  const expectedCardCount = expectedModifiers.length;
  const expectedEmphasisCounts = { science: 5, user: 6, prediction: 5 };
  const expectedEmphasisTotal = expectedModifiers.reduce(
    (total, modifier) => total + expectedEmphasisCounts[modifier],
    0
  );

  assert.equal(
    matchCount(section, /<article\b/g),
    expectedCardCount,
    `${pageLabel} scenario section must contain exactly ${expectedCardCount} article start tags`
  );
  assert.equal(
    startTagsWithClass(section, 'article', 'scenario-card').length,
    expectedCardCount,
    `${pageLabel} scenario section must contain exactly ${expectedCardCount} scenario-card articles`
  );
  assert.equal(
    matchCount(section, new RegExp(`<${escapeRegex(cardTitleTagName)}\\b`, 'g')),
    expectedCardCount,
    `${pageLabel} scenario section must contain exactly ${expectedCardCount} ${cardTitleTagName} start tags`
  );
  assert.equal(
    startTagsWithClass(section, cardTitleTagName, 'scenario-card-title').length,
    expectedCardCount,
    `${pageLabel} scenario section must contain exactly ${expectedCardCount} scenario-card-title elements`
  );
  assert.equal(
    matchCount(section, /<p\b/g),
    expectedCardCount,
    `${pageLabel} scenario section must contain exactly ${expectedCardCount} paragraph start tags`
  );
  assert.equal(
    startTagsWithClass(section, 'p', 'scenario-card-body').length,
    expectedCardCount,
    `${pageLabel} scenario section must contain exactly ${expectedCardCount} scenario-card-body paragraphs`
  );
  assert.equal(
    startTagsWithClass(section, 'span', 'scenario-card-icon').length,
    expectedCardCount,
    `${pageLabel} scenario section must contain exactly ${expectedCardCount} scenario-card-icon spans`
  );
  assert.equal(
    classTokenCount(section, 'scenario-card-icon'),
    expectedCardCount,
    `${pageLabel} scenario section must contain exactly ${expectedCardCount} scenario-card-icon class tokens`
  );
  assert.equal(
    matchCount(section, /<svg\b/g),
    expectedCardCount,
    `${pageLabel} scenario section must contain exactly ${expectedCardCount} SVG start tags`
  );
  assert.equal(
    startTagsWithClass(section, 'strong', 'scenario-card-emphasis').length,
    expectedEmphasisTotal,
    `${pageLabel} scenario section must contain exactly ${expectedEmphasisTotal} emphasized strong elements`
  );
  assert.equal(
    classTokenCount(section, 'scenario-card-emphasis'),
    expectedEmphasisTotal,
    `${pageLabel} scenario section must contain exactly ${expectedEmphasisTotal} scenario-card-emphasis class tokens`
  );
  assert.doesNotMatch(section, /role="list(item)?"/, `${pageLabel} cards must not use list roles`);
  assert.doesNotMatch(section, /scenario-card--energy/, `${pageLabel} must not contain an Energy card`);
  assertCanonicalOrder(section, pageLabel, expectedModifiers);

  const articles = {};
  for (const modifier of expectedModifiers) {
    const article = articleFor(section, modifier);
    assert.equal(
      classTokenCount(article, 'scenario-card-emphasis'),
      expectedEmphasisCounts[modifier],
      `${pageLabel} ${modifier} article must contain exactly ${expectedEmphasisCounts[modifier]} emphasis class tokens`
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
      'grid-template-columns': 'repeat(3, minmax(0, 1fr))',
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

  for (const modifier of ['science', 'user', 'prediction']) {
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
      'text-align: justify;',
      'text-align-last: left;',
      'text-justify: inter-word;',
      'hyphens: none;',
      '-webkit-hyphens: none;',
      'word-break: normal;'
    ]) {
      assert.ok(body.includes(declaration), `Missing ${selector} declaration: ${declaration}`);
    }
    assert.equal(
      finalDeclarationValue(body, 'text-align'),
      'justify',
      `${selector} must justify scenario card text across both edges`
    );
    assert.equal(
      finalDeclarationValue(body, 'text-justify'),
      'inter-word',
      `${selector} must distribute spacing between words`
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
  const articles = assertScenarioStructure(section, 'Homepage', 'h4', ['science', 'user']);

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
  const scienceArticle = articleFor(researchArea, 'science');
  const userArticle = articleFor(researchArea, 'user');

  assert.match(
    userArticle,
    /<h4 class="scenario-card-title" data-i18n="research\.userTitle">Recommender Systems<\/h4>/,
    'The homepage user-modeling card must be titled Recommender Systems'
  );
  assert.match(
    scienceArticle,
    /<p class="scenario-card-body" data-i18n="research\.scienceBody">Using <strong class="scenario-card-emphasis">LLMs and Agentic AI<\/strong> for <strong class="scenario-card-emphasis">scientific literature mining<\/strong>, <strong class="scenario-card-emphasis">time-series and tabular data modeling<\/strong>, and <strong class="scenario-card-emphasis">autonomous research agents<\/strong> for <strong class="scenario-card-emphasis">scientific task solving and discovery<\/strong>\.<\/p>/,
    'The AI for Science body must distinguish methods, research contents, and goals'
  );
  assert.match(
    userArticle,
    /<p class="scenario-card-body" data-i18n="research\.userBody">Studying <strong class="scenario-card-emphasis">online user modeling<\/strong> and <strong class="scenario-card-emphasis">personalized recommender systems<\/strong> for <strong class="scenario-card-emphasis">Internet applications<\/strong>, with a focus on <strong class="scenario-card-emphasis">user behavior understanding<\/strong>, <strong class="scenario-card-emphasis">preference learning<\/strong>, and <strong class="scenario-card-emphasis">context-aware recommendation<\/strong>\.<\/p>/,
    'The Recommender Systems body must describe its application scope and research themes'
  );
  assert.doesNotMatch(
    userArticle,
    /<p class="scenario-card-body"[^>]*>\s*<strong class="scenario-card-emphasis">/,
    'The Recommender Systems body must not render the full sentence as emphasized text'
  );
});

test('homepage dictionaries provide complete split scenario translations', () => {
  const expected = {
    'research.scienceTitle': ['AI for Science', 'AI for Science'],
    'research.scienceBody': [
      'Using <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> for <strong class="scenario-card-emphasis">scientific literature mining</strong>, <strong class="scenario-card-emphasis">time-series and tabular data modeling</strong>, and <strong class="scenario-card-emphasis">autonomous research agents</strong> for <strong class="scenario-card-emphasis">scientific task solving and discovery</strong>.',
      '利用 <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> 开展<strong class="scenario-card-emphasis">科技文献挖掘</strong>、<strong class="scenario-card-emphasis">时序与表格数据建模</strong>和<strong class="scenario-card-emphasis">自主科研智能体</strong>研究，服务于<strong class="scenario-card-emphasis">科学任务求解与科学发现</strong>。'
    ],
    'research.userTitle': ['Recommender Systems', '推荐系统'],
    'research.userBody': [
      'Studying <strong class="scenario-card-emphasis">online user modeling</strong> and <strong class="scenario-card-emphasis">personalized recommender systems</strong> for <strong class="scenario-card-emphasis">Internet applications</strong>, with a focus on <strong class="scenario-card-emphasis">user behavior understanding</strong>, <strong class="scenario-card-emphasis">preference learning</strong>, and <strong class="scenario-card-emphasis">context-aware recommendation</strong>.',
      '面向<strong class="scenario-card-emphasis">互联网应用</strong>开展<strong class="scenario-card-emphasis">在线用户建模</strong>与<strong class="scenario-card-emphasis">个性化推荐系统</strong>研究，重点关注<strong class="scenario-card-emphasis">用户行为理解</strong>、<strong class="scenario-card-emphasis">偏好学习</strong>与<strong class="scenario-card-emphasis">情境感知推荐</strong>。'
    ],
    'research.predictionTitle': ['Prediction Intelligence', '预测智能'],
    'research.predictionBody': [
      'Building <span class="research-keyword">context-aware predictive intelligence</span> for <span class="research-keyword">complex systems</span> through <span class="research-keyword">multimodal context representation</span>, <span class="research-keyword">slow-thinking temporal reasoning</span>, <span class="research-keyword">uncertainty-aware forecasting</span>, and autonomous agentic interaction.',
      '面向<span class="research-keyword">复杂系统</span>构建<span class="research-keyword">情境感知预测智能</span>，研究<span class="research-keyword">多模态情境表征</span>、<span class="research-keyword">慢思考时序推理</span>与<span class="research-keyword">不确定性感知预测</span>，并结合自主智能体交互。'
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
    '<span class="research-label">🤖<strong>LLMs and Agentic AI:</strong></span> Developing <span class="research-keyword">autonomous interactive learning</span> for large language models, including <span class="research-keyword">environment-interactive Agentic RL</span>, <span class="research-keyword">tool-augmented reasoning</span>, <span class="research-keyword">multi-agent orchestration</span>, and continual capability evolution through context, knowledge, and memory.';
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
  assert.match(
    decodedTranslationEntries('research.agent')[1],
    /^<span class="research-label">🤖<strong>/,
    'Chinese research.agent translation must not include a space between the icon and title'
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
    '<span class="research-label">📊<strong>Time-Series Analysis:</strong></span> Developing <span class="research-keyword">context-aware predictive intelligence</span>, with a focus on <span class="research-keyword">multimodal context representation</span>, <span class="research-keyword">slow-thinking reasoning</span>, <span class="research-keyword">uncertainty-aware forecasting</span>, and <span class="research-keyword">autonomous agentic interaction</span>.';
  const expectedResearchCard =
    'Developing <strong>context-aware predictive intelligence</strong>, with a focus on <strong>multimodal context representation</strong>, <strong>slow-thinking reasoning</strong>, <strong>uncertainty-aware forecasting</strong>, and <strong>autonomous agentic interaction</strong>.';
  const homepageSection = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  const visibleTimeseriesMatch = homepageSection.match(
    /<li\b[^>]*data-i18n="research\.timeseries"[^>]*>[\s\S]*?<\/li>/
  );
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
  assert.match(
    decodedTranslationEntries('research.timeseries')[1],
    /^<span class="research-label">📊<strong>/,
    'Chinese research.timeseries translation must not include a space between the icon and title'
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
  }
  for (const [label, source] of [
    ['homepage research.timeseries item', visibleTimeseries],
    ['English research.timeseries translation', decodedTranslationEntries('research.timeseries')[0]]
  ]) {
    assert.equal(source.includes(oldReasoning), false, `${label} must not keep the old reasoning wording`);
  }
});

test('homepage stacks Prediction Intelligence below Time-Series Analysis', () => {
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
  const normalizedResearchDirections = researchDirections.replace(/\s+/g, ' ');

  assert.equal(
    matchCount(homepageDirections, /<li\b(?![^>]*\bhidden\b)[^>]*>/g),
    3,
    'Homepage must expose LLMs, Time-Series Analysis, and Prediction Intelligence as primary directions'
  );
  assert.match(homepageDirections, /<li class="primary-direction primary-direction--agent" data-i18n="research\.agent">/);
  assert.match(homepageDirections, /<li class="primary-direction primary-direction--timeseries" data-i18n="research\.timeseries">/);
  assert.match(
    homepageDirections,
    /<li class="primary-direction primary-direction--prediction">[\s\S]*?<a class="research-direction-link" href="prediction-intelligence\.html">[\s\S]*?<strong data-i18n="research\.predictionTitle">Prediction Intelligence<\/strong>[\s\S]*?<\/a>[\s\S]*?<span data-i18n="research\.predictionBody">Building <span class="research-keyword">context-aware predictive intelligence<\/span> for <span class="research-keyword">complex systems<\/span> through <span class="research-keyword">multimodal context representation<\/span>, <span class="research-keyword">slow-thinking temporal reasoning<\/span>, <span class="research-keyword">uncertainty-aware forecasting<\/span>, and autonomous agentic interaction\.<\/span>[\s\S]*?<\/li>/
  );
  assert.match(
    homepageDirections,
    /<span class="research-label">📈<a class="research-direction-link" href="prediction-intelligence\.html">/,
    'Prediction Intelligence must not include a space between its icon and title'
  );
  assert.match(
    homepageDirections,
    /<li class="primary-direction primary-direction--knowledge" data-i18n="research\.knowledge" hidden>/,
    'Scientific Knowledge Cognition must remain hidden on the homepage'
  );
  assert.ok(
    homepageDirections.indexOf('LLMs and Agentic AI') <
      homepageDirections.indexOf('Time-Series Analysis') &&
      homepageDirections.indexOf('Time-Series Analysis') <
        homepageDirections.indexOf('Prediction Intelligence'),
    'Homepage primary directions must keep LLMs first, followed by Time-Series Analysis and Prediction Intelligence'
  );

  const homepagePrimaryGridRule = cssRule(indexHtml, '.primary-directions');
  assert.ok(
    homepagePrimaryGridRule.includes('grid-template-columns: minmax(0, 1fr);'),
    'Homepage primary directions must use one full-width column'
  );
  assert.doesNotMatch(
    indexHtml,
    /\.primary-directions \.primary-direction--agent\s*\{/,
    'The LLM direction must not need a special grid span in a single-column layout'
  );
  assert.ok(
    cssRule(indexHtml, '.primary-directions li[hidden]').includes('display: none;'),
    'Homepage author styles must preserve the hidden Scientific Knowledge Cognition direction'
  );
  assert.equal(
    startTagsWithClass(researchDirections, 'div', 'rd-card')
      .filter((tag) => !/\shidden(?:\s|>)/.test(tag)).length,
    3,
    'Research page must expose LLMs, Time-Series Analysis, and Prediction Intelligence as primary directions'
  );
  assert.match(researchDirections, /<div class="rd-card rd-card--agent">/);
  assert.match(researchDirections, /<div class="rd-card rd-card--timeseries">/);
  assert.match(
    normalizedResearchDirections,
    /<div class="rd-card rd-card--prediction">[\s\S]*?<a class="rd-card-title rd-card-title-link" href="prediction-intelligence\.html">Prediction Intelligence<\/a>[\s\S]*?<p class="rd-card-desc">\s*Building <strong>context-aware predictive intelligence<\/strong> for <strong>complex systems<\/strong> through <strong>multimodal context representation<\/strong>, <strong>slow-thinking temporal reasoning<\/strong>, <strong>uncertainty-aware forecasting<\/strong>, and autonomous agentic interaction\.\s*<\/p>/
  );
  assert.match(
    researchDirections,
    /<div class="rd-card" hidden>[\s\S]*?<div class="rd-card-title">Scientific Knowledge Cognition<\/div>/,
    'Scientific Knowledge Cognition must remain hidden on the Research page while it is hidden on the homepage'
  );
  assert.ok(
    cssRule(researchHtml, '.rd-card[hidden]').includes('display: none;'),
    'Author styles must preserve the hidden Scientific Knowledge Cognition card'
  );
  assert.ok(
    researchDirections.indexOf('LLMs and Agentic AI') <
      researchDirections.indexOf('Time-Series Analysis') &&
      researchDirections.indexOf('Time-Series Analysis') <
        researchDirections.indexOf('Prediction Intelligence'),
    'Primary directions must keep LLMs first, followed by Time-Series Analysis and Prediction Intelligence'
  );

  const primaryGridRule = cssRule(researchHtml, '.primary-cards');
  assert.ok(primaryGridRule.includes('display: grid;'));
  assert.ok(primaryGridRule.includes('grid-template-columns: repeat(2, minmax(0, 1fr));'));
  assert.ok(cssRule(researchHtml, '.rd-card--agent').includes('grid-column: 1 / -1;'));
  const responsivePrimary = sectionBetween(
    researchHtml,
    '@media (max-width: 960px)',
    '@media (max-width: 680px)'
  );
  assert.ok(
    cssRule(responsivePrimary, '.primary-cards').includes(
      'grid-template-columns: minmax(0, 1fr);'
    )
  );
  assert.ok(cssRule(responsivePrimary, '.rd-card--agent').includes('grid-column: auto;'));

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
  const homepageArticles = assertScenarioStructure(
    homepageSection,
    'Homepage',
    'h4',
    ['science', 'user']
  );
  const researchArticles = assertScenarioStructure(
    researchSection,
    'Research page',
    'h3',
    ['science', 'user']
  );
  assert.doesNotMatch(
    researchSection,
    /scenario-card--prediction|Prediction Intelligence/,
    'Prediction Intelligence must not remain duplicated in the Research-page application scenarios'
  );
  assert.doesNotMatch(
    homepageSection,
    /scenario-card--prediction|Prediction Intelligence/,
    'Prediction Intelligence must not remain duplicated in the Homepage application scenarios'
  );
  assert.ok(
    cssRule(indexHtml, '.research-section .scenario-grid').includes(
      'grid-template-columns: repeat(2, minmax(0, 1fr));'
    ),
    'The two remaining Homepage scenarios must use a balanced two-column layout'
  );
  const homepageResponsive = sectionBetween(
    indexHtml,
    '@media (max-width: 900px)',
    '@media (max-width: 680px)'
  );
  assert.ok(
    cssRule(homepageResponsive, '.research-section .scenario-grid').includes(
      'grid-template-columns: minmax(0, 1fr);'
    ),
    'Homepage scenarios must stack into one column on narrow screens'
  );
  assert.ok(
    cssRule(researchHtml, '.research-main .scenario-grid').includes(
      'grid-template-columns: repeat(2, minmax(0, 1fr));'
    ),
    'The two remaining Research-page scenarios must use a balanced two-column layout'
  );

  assert.match(
    researchArticles.user,
    /<h3 class="scenario-card-title">Recommender Systems<\/h3>/,
    'The research-page user-modeling card must be titled Recommender Systems'
  );
  assert.match(
    researchArticles.user,
    /<p class="scenario-card-body">Studying <strong class="scenario-card-emphasis">online user modeling<\/strong> and <strong class="scenario-card-emphasis">personalized recommender systems<\/strong> for <strong class="scenario-card-emphasis">Internet applications<\/strong>, with a focus on <strong class="scenario-card-emphasis">user behavior understanding<\/strong>, <strong class="scenario-card-emphasis">preference learning<\/strong>, and <strong class="scenario-card-emphasis">context-aware recommendation<\/strong>\.<\/p>/,
    'The research-page Recommender Systems body must use the shared selective-emphasis pattern'
  );

  for (const modifier of ['science', 'user']) {
    assert.equal(
      visibleText(researchArticles[modifier]),
      visibleText(homepageArticles[modifier]),
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
  assert.ok(hero.includes('<title id="cognitive-pipeline-title">Research program pipeline</title>'));
  assert.ok(hero.includes('<desc id="cognitive-pipeline-desc">LLMs and Agentic AI and Time-Series Analysis converge into context representation and reasoning, supporting AI for Science and Big Data Applications.</desc>'));
  assert.equal(matchCount(hero, /<rect class="pipeline-node(?: |")/g), 5);
  assert.equal(matchCount(hero, /<path class="pipeline-path(?: |")/g), 4);
  assert.equal(matchCount(hero, /class="pipeline-stage"/g), 3);
  assert.equal(matchCount(hero, /pipeline-node--core/g), 1);
  assert.equal(matchCount(hero, /pipeline-node--application/g), 2);
  assert.equal(matchCount(hero, /pipeline-node--bigdata/g), 1);
  assert.equal(matchCount(hero, /pipeline-signal--orange/g), 1);

  const heroText = visibleText(hero);
  for (const label of [
    'DIRECTIONS',
    'CORE',
    'APPLICATIONS',
    'LLMs &amp; Agentic AI',
    'Time-Series Analysis',
    'Context Representation &amp; Reasoning',
    'AI for Science',
    'Big Data Applications'
  ]) {
    assert.ok(heroText.includes(label), `Missing research pipeline label: ${label}`);
  }
  assert.match(
    hero,
    /<text class="pipeline-label pipeline-label--core" x="165" y="108">\s*<tspan x="165" dy="0">Context<\/tspan>\s*<tspan x="165" dy="13">Representation<\/tspan>\s*<tspan x="165" dy="13">&amp; Reasoning<\/tspan>\s*<\/text>/
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
  assert.ok(cssRule(researchHtml, '.pipeline-label--core').includes('font-size: 10px;'));
  assert.ok(cssRule(researchHtml, '.pipeline-node--bigdata').includes('fill: #fff8ed;'));
  assert.ok(cssRule(researchHtml, '.pipeline-signal--orange').includes('fill: #d97706;'));

  const responsive = sectionBetween(researchHtml, '@media (max-width: 960px)', '@media (max-width: 680px)');
  assert.ok(cssRule(responsive, '.page-hero-content').includes('grid-template-columns: 1fr;'));
  assert.ok(cssRule(responsive, '.page-hero-visual').includes('display: none;'));
});
