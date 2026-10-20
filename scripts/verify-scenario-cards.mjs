import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');
const indexHtml = read('index.html');
const researchHtml = read('research.html');
const siteLanguageJs = read('files/assets/site-language.js');
const cssPath = join(root, 'files/assets/scenario-cards.css');
const scenarioCss = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';
const sharedContentCss = read('files/assets/site-content.css');
const stylesheetLink = '<link rel="stylesheet" href="files/assets/scenario-cards.css?v=20260815">';
const researchIntroEnglish = 'My research focuses on cognitive intelligence: enabling machines to understand, reason, and interact. I study LLM agents and autonomous learning as general intelligent mechanisms, with scientific knowledge and tools and structured data as two core research objects. The three directions address independent scientific questions while sharing foundations in cognitive intelligence. Autonomous learning, continual evolution, and human–AI collaboration support long-term capability improvement.';
const researchCssPath = join(root, 'files/assets/research-page.css');
const researchCss = existsSync(researchCssPath) ? readFileSync(researchCssPath, 'utf8') : '';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cssRuleBlocks(source, selector) {
  const styles = [...source.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)];
  const cssSource = styles.length ? styles.map((match) => match[1]).join('\n') : source;
  const cleanSource = cssSource.replace(/\/\*[\s\S]*?\*\//g, '');
  const pattern = /([^{}]+)\{([^{}]*)\}/g;
  return [...cleanSource.matchAll(pattern)]
    .filter((match) => match[1].split(',').some((part) => part.trim() === selector))
    .map((match) => {
      let depth = 0;
      for (let index = 0; index < match.index; index += 1) {
        if (cleanSource[index] === '{') depth += 1;
        if (cleanSource[index] === '}') depth -= 1;
      }
      return { body: match[2], depth };
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

test('Homepage application cards share the neighboring research-card surface', () => {
  const researchCard = cssRule(indexHtml, '.research-list li');
  const scenarioCard = cssRule(sharedContentCss, '.research-section .scenario-card');
  for (const property of ['padding', 'border', 'border-radius', 'background', 'box-shadow']) {
    assert.equal(
      finalDeclarationValue(scenarioCard, property),
      finalDeclarationValue(researchCard, property),
      `Homepage application cards must share the research-card ${property}`
    );
  }
  assert.equal(
    finalDeclarationValue(scenarioCard, 'border-left'),
    finalDeclarationValue(cssRule(indexHtml, '.primary-directions li'), 'border-left')
  );
  assertFinalDeclarations(cssRule(sharedContentCss, '.research-section .scenario-card-body'), {
    color: 'var(--text)',
    'line-height': '1.8',
    'text-align': 'justify',
    'text-align-last': 'left',
  }, 'Homepage application prose');
});

test('Homepage application icons and topics use one Prussian-blue palette', () => {
  assertFinalDeclarations(cssRule(sharedContentCss, '.research-section .scenario-card'), {
    '--scenario-color': 'var(--accent)',
    '--scenario-tint': 'var(--accent-light)',
  }, 'Homepage application palette');
  for (const variant of ['science', 'industrial', 'user']) {
    assert.equal(
      cssRuleBlocks(sharedContentCss, `.research-section .scenario-card--${variant}`).length,
      0,
      `${variant} must not override the unified homepage palette`
    );
  }
  assertFinalDeclarations(cssRule(sharedContentCss, '.research-section .scenario-card-icon'), {
    color: 'var(--scenario-color)',
    background: 'var(--scenario-tint)',
  }, 'Homepage application icon');
  assertFinalDeclarations(cssRule(sharedContentCss, '.research-section .scenario-card-topics span'), {
    color: 'var(--scenario-color)',
    background: 'var(--scenario-tint)',
  }, 'Homepage application topic');
});

test('Homepage application topic dividers stay aligned when desktop labels wrap', () => {
  const compactDesktop = sectionBetween(
    sharedContentCss,
    '@media (min-width: 901px) and (max-width: 1050px)',
    '@media (prefers-reduced-motion: reduce)'
  );
  assertFinalDeclarations(cssRule(compactDesktop, '.research-section .scenario-card-topics'), {
    'min-height': '67px',
    'align-content': 'flex-start',
  }, 'Compact desktop topic row');
});

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
  expectedModifiers = ['science', 'industrial', 'user']
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
  expectedModifiers = ['science', 'industrial', 'user']
) {
  const expectedCardCount = expectedModifiers.length;

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
    startTagsWithClass(section, 'p', 'scenario-card-body').length,
    expectedCardCount,
    `${pageLabel} scenario section must contain exactly ${expectedCardCount} prose descriptions`
  );
  assert.equal(matchCount(section, /<(?:ul|li)\b/g), 0, `${pageLabel} scenario cards must not use domain lists`);
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
  assert.doesNotMatch(section, /role="list(item)?"/, `${pageLabel} cards must not use list roles`);
  assert.doesNotMatch(section, /scenario-card--energy/, `${pageLabel} must not contain an Energy card`);
  assert.doesNotMatch(section, /scenario-card--prediction/, `${pageLabel} must not duplicate Prediction Intelligence`);
  assertCanonicalOrder(section, pageLabel, expectedModifiers);

  const articles = {};
  for (const modifier of expectedModifiers) {
    const article = articleFor(section, modifier);
    assert.equal(
      startTagsWithClass(article, 'p', 'scenario-card-body').length,
      1,
      `${pageLabel} ${modifier} article must contain one scenario-card-body`
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
  assert.doesNotMatch(scenarioCss, /\.scenario-card--prediction\b/);

  for (const modifier of ['science', 'industrial', 'user']) {
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

  const body = cssRule(scenarioCss, '.scenario-card-body');
  assertFinalDeclarations(
    body,
    {
      margin: '0',
      'font-size': '14px',
      'line-height': '1.7',
      'overflow-wrap': 'break-word',
      'text-align': 'justify',
      'text-align-last': 'left',
      'text-justify': 'inter-word',
      hyphens: 'none',
      '-webkit-hyphens': 'none'
    },
    'Scenario description'
  );
  assert.doesNotMatch(scenarioCss, /\.scenario-card-list\b/);
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

  for (const modifier of ['science', 'industrial', 'user']) {
    const article = articles[modifier];
    for (const [tagName, className, suffix] of [
      ['h4', 'scenario-card-title', 'Title'],
      ['p', 'scenario-card-body', 'Body'],
      ['div', 'scenario-card-topics', 'Topics']
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

test('homepage scenario cards use concise domain summaries', () => {
  const researchArea = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  const scienceArticle = articleFor(researchArea, 'science');
  const industrialArticle = articleFor(researchArea, 'industrial');
  const userArticle = articleFor(researchArea, 'user');

  assert.match(
    scienceArticle,
    /<p class="scenario-card-body" data-i18n="research\.scienceBody">Focusing on scientific tools, scientific knowledge mining, and autonomous scientific discovery\.<\/p>/,
    'Science Intelligence must use the shared Focusing on phrasing for scientific tools, knowledge mining, and autonomous discovery'
  );
  assert.match(
    industrialArticle,
    /<h4 class="scenario-card-title" data-i18n="research\.industrialTitle">Industrial Intelligence<\/h4>/,
    'The middle card must be titled Industrial Intelligence'
  );
  assert.match(
    industrialArticle,
    /<p class="scenario-card-body" data-i18n="research\.industrialBody">Focusing on forecasting and decision support for complex, evolving real-world systems\.<\/p>/,
    'Industrial Intelligence must use the shared Focusing on phrasing for forecasting and decision support'
  );
  assert.match(
    userArticle,
    /<p class="scenario-card-body" data-i18n="research\.userBody">Focusing on user behavior and preference modeling for adaptive, personalized recommendations\.<\/p>/,
    'Recommender Systems must use the shared Focusing on phrasing for user behavior, preference modeling, and personalization'
  );
  assert.match(
    userArticle,
    /<h4 class="scenario-card-title" data-i18n="research\.userTitle">Recommender Systems<\/h4>/,
    'The homepage user-modeling card must remain titled Recommender Systems'
  );
});

test('homepage scenario summaries and topics stay synchronized with both dictionaries', () => {
  const expected = {
    'research.scenarioTitle': ['Application Domains', '应用领域'],
    'research.scenarioIntro': [
      'Real-world settings for developing and evaluating intelligent systems.',
      '在真实任务中发展智能方法，并检验其有效性。'
    ],
    'research.scienceTitle': ['Science Intelligence', '科学智能'],
    'research.scienceBody': [
      'Focusing on scientific tools, scientific knowledge mining, and autonomous scientific discovery.',
      '聚焦科学工具、科学知识挖掘与自主科学发现。'
    ],
    'research.scienceTopics': [
      '<span>Literature mining</span><span>Scientific modeling</span>',
      '<span>科技文献挖掘</span><span>科学建模</span>'
    ],
    'research.industrialTitle': ['Industrial Intelligence', '工业智能'],
    'research.industrialBody': [
      'Focusing on forecasting and decision support for complex, evolving real-world systems.',
      '聚焦持续演变的复杂系统中的预测与决策支持。'
    ],
    'research.industrialTopics': [
      '<span>Energy &amp; traffic</span><span>Cloud &amp; finance</span>',
      '<span>能源与交通</span><span>云服务与金融</span>'
    ],
    'research.userTitle': ['Recommender Systems', '推荐系统'],
    'research.userBody': [
      'Focusing on user behavior and preference modeling for adaptive, personalized recommendations.',
      '聚焦用户行为与偏好建模，支持自适应的个性化推荐。'
    ],
    'research.userTopics': [
      '<span>Behavior modeling</span><span>Contextual reasoning</span>',
      '<span>行为与偏好建模</span><span>情境推理</span>'
    ]
  };

  for (const [key, values] of Object.entries(expected)) {
    assert.deepEqual(decodedTranslationEntries(key), values, `Unexpected values for ${key}`);
    const markup = indexHtml.match(new RegExp(
      `<([a-z][\\w-]*)\\b[^>]*\\bdata-i18n="${escapeRegex(key)}"[^>]*>([\\s\\S]*?)<\\/\\1>`
    ));
    assert.ok(markup, `Missing homepage translation hook for ${key}`);
    assert.equal(markup[2].trim(), values[0], `${key} initial markup must match its English translation`);
  }

  for (const removedKey of [
    'research.energyTitle',
    'research.energyBody',
    'research.predictionTitle',
    'research.predictionBody'
  ]) {
    const removedKeyPattern = new RegExp(`["']${escapeRegex(removedKey)}["']\\s*:`);
    assert.equal(removedKeyPattern.test(indexHtml), false, `${removedKey} must be absent`);
  }

  // research.science now describes the dedicated primary direction, not a legacy application card.
  for (const oldKey of ['research.energy', 'research.recsys']) {
    assert.doesNotMatch(indexHtml, new RegExp(`"${escapeRegex(oldKey)}"\\s*:`));
  }
});

test('homepage LLMs and Agentic AI direction copy stays synchronized', () => {
  const oldAgentFocus = 'autonomous interactive learning and reasoning mechanisms';
  const newAgentFocus = 'autonomous interactive learning';
  const expectedEnglishAgent =
    '<span class="research-label">🤖<strong>LLMs and Agentic AI:</strong></span> Developing <span class="research-keyword">autonomous interactive learning</span> for large language models, including <span class="research-keyword">environment-interactive Agentic RL</span>, <span class="research-keyword">tool-augmented reasoning</span>, <span class="research-keyword">multi-agent orchestration</span>, and continual capability evolution through context, knowledge, and memory.';
  const homepageSection = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );

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
  assert.equal(indexHtml.includes(oldAgentFocus), false, 'Old agent focus wording must be absent');
  assert.equal(indexHtml.includes(newAgentFocus), true, 'New agent focus wording must be present');
});

test('Time Series Intelligence direction copy stays synchronized', () => {
  const oldTitle = 'Time-Series Analysis';
  const supersededTitle = 'Temporal Data Mining';
  const oldFocus = 'context-aware predictive intelligence for complex systems';
  const oldObservationFrame = 'dynamic system observations';
  const oldReasoning = 'slow-thinking temporal reasoning';
  const expectedEnglishTimeseries =
    '<span class="research-label">📊<strong>Time Series Intelligence:</strong></span> Developing <span class="research-keyword">context-aware predictive intelligence</span>, with a focus on <span class="research-keyword">multimodal context representation</span>, <span class="research-keyword">slow-thinking reasoning</span>, <span class="research-keyword">uncertainty-aware forecasting</span>, and <span class="research-keyword">autonomous agentic interaction</span>.';
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

  assert.match(visibleTimeseries, new RegExp(escapeRegex(expectedEnglishTimeseries)));
  assert.equal(
    decodedTranslationEntries('research.timeseries')[0],
    expectedEnglishTimeseries,
    'English research.timeseries translation must match the visible homepage copy'
  );
  assert.match(
    decodedTranslationEntries('research.timeseries')[1],
    /^<span class="research-label">📊<strong>时间序列智能：<\/strong><\/span> 发展/,
    'Chinese research.timeseries translation must use 时间序列智能 without a space after the icon'
  );
  assert.doesNotMatch(decodedTranslationEntries('research.timeseries')[1], /科语 SciTime/);

  for (const [label, source] of [
    ['homepage research.timeseries item', visibleTimeseries],
    ['English research.timeseries translation', decodedTranslationEntries('research.timeseries')[0]]
  ]) {
    assert.equal(source.includes(oldTitle), false, `${label} must not use the old title`);
    assert.equal(source.includes(supersededTitle), false, `${label} must not use the superseded title`);
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

test('homepage keeps its three primary directions and shared Research collection links', () => {
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

  assert.equal(
    matchCount(homepageDirections, /<li\b(?![^>]*\bhidden\b)[^>]*>/g),
    3,
    'Homepage must expose LLMs, Time Series Intelligence and Scientific Literature Mining as primary directions'
  );
  assert.match(homepageDirections, /<li class="primary-direction primary-direction--agent" data-i18n="research\.agent">/);
  assert.match(homepageDirections, /<li class="primary-direction primary-direction--timeseries" data-i18n="research\.timeseries">/);
  assert.match(homepageDirections, /<li class="primary-direction primary-direction--science" data-i18n="research\.science">/);
  assert.ok(
    homepageDirections.indexOf('Time Series Intelligence') < homepageDirections.indexOf('Scientific Literature Mining'),
    'Scientific Literature Mining must follow Time Series Intelligence'
  );
  assert.doesNotMatch(
    homepageDirections,
    /primary-direction--prediction|prediction-intelligence\.html|research\.prediction(?:Title|Body)/,
    'Homepage must not expose the Prediction Intelligence direction'
  );
  assert.match(
    homepageDirections,
    /<li class="primary-direction primary-direction--knowledge" data-i18n="research\.knowledge" hidden>/,
    'Scientific Knowledge Cognition must remain hidden on the homepage'
  );
  assert.ok(
    homepageDirections.indexOf('LLMs and Agentic AI') <
      homepageDirections.indexOf('Time Series Intelligence'),
    'Homepage primary directions must keep LLMs before Time Series Intelligence'
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
    'Research collections: 🤖 <a href="https://agentr1.github.io/" target="_blank" rel="noopener">LLMs and Agentic AI（认知大模型）</a> · 📊 <a href="https://ustc-time-series.github.io/" target="_blank" rel="noopener">Time Series Intelligence（科语）</a> · 📚 <a href="https://ustcagi-sci.github.io/" target="_blank" rel="noopener">Science Intelligence（科言）</a>';
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

  assert.ok(siteLanguageJs.includes("join: 'Prospective students and research collaborators"));
  assert.ok(siteLanguageJs.includes("join: '欢迎脚踏实地、积极主动的本科生和研究生"));
});

test('research technical pillars stack vertically at every breakpoint in canonical order', () => {
  const pillars = sectionBetween(
    researchHtml,
    '<!-- Core Technical Pillars -->',
    '<!-- /Research Framework -->'
  );
  const cards = startTagsWithClass(pillars, 'article', 'pillar-card');
  assert.deepEqual(
    cards.map((tag) => classTokens(tag).filter((token) => token.startsWith('pillar-card--'))),
    [['pillar-card--agent'], ['pillar-card--knowledge'], ['pillar-card--structured']],
    'Research directions must appear as agents, scientific knowledge and tools, then structured data'
  );

  const gridRules = cssRuleBlocks(researchCss, '.research-page .pillar-grid');
  assert.ok(gridRules.length > 0, 'The research pillar grid must exist');
  for (const { body } of gridRules) {
    const columns = finalDeclarationValue(body, 'grid-template-columns');
    if (columns !== undefined) {
      assert.equal(columns, 'minmax(0, 1fr)', 'All breakpoints must keep one full-width pillar per row');
    }
  }
  assert.equal(finalDeclarationValue(gridRules[0].body, 'display'), 'grid');
});

test('research collections omit table research without removing its publication category', () => {
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
    /<button class="pub-filter-btn" type="button" aria-pressed="false" data-filter="table" data-i18n="pub\.filterTable">Tabular Data Intelligence<\/button>/
  );
  assert.match(indexHtml, /<li data-tags="[^"]*\btable\b[^"]*">/);
  assert.match(
    indexHtml,
    /<meta property="og:description" content="[^"]*LLM-driven reasoning and AI agents[^"]*science intelligence[^"]*">/
  );
  assert.match(
    indexHtml,
    /<meta name="twitter:description" content="[^"]*LLM-driven reasoning and AI agents[^"]*science intelligence[^"]*">/
  );
});

test('research page preserves domain identities shared with the homepage', () => {
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
    'h4'
  );
  const researchArticles = assertScenarioStructure(
    researchSection,
    'Research page',
    'h3'
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
    cssRule(sharedContentCss, '.research-section .scenario-grid').includes(
      'grid-template-columns: repeat(3, minmax(0, 1fr));'
    ),
    'The three Homepage scenarios must use a balanced three-column layout'
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
      'grid-template-columns: repeat(3, minmax(0, 1fr));'
    ),
    'The three Research-page scenarios must use a balanced three-column layout'
  );

  assert.match(
    researchArticles.industrial,
    /<h3 class="scenario-card-title" data-page-i18n="industrialTitle">Industrial Intelligence<\/h3>/,
    'The Research page must include the Industrial Intelligence scenario'
  );
  assert.match(
    researchArticles.user,
    /<p class="scenario-card-body" data-page-i18n="userBody">Focusing on user behavior and preference modeling for adaptive, personalized recommendations\.<\/p>/,
    'The Research-page Recommender Systems card must use the shared Focusing on phrasing'
  );

  for (const modifier of ['science', 'industrial', 'user']) {
    const researchTitle = researchArticles[modifier].match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/);
    const homepageTitle = homepageArticles[modifier].match(/<h4\b[^>]*>([\s\S]*?)<\/h4>/);
    assert.ok(researchTitle && homepageTitle, `${modifier} must have a domain heading on both pages`);
    assert.equal(
      visibleText(researchTitle[1]),
      visibleText(homepageTitle[1]),
      `${modifier} domain identity must match across pages`
    );
  }
});

test('research page keeps the shared language engine and complete framework translation', () => {
  assert.ok(!researchHtml.includes('.sc-card'), 'Obsolete .sc-card styles must be removed');
  assert.ok(!researchHtml.includes('.scenario-cards'), 'Obsolete .scenario-cards styles must be removed');
  assert.ok(!researchHtml.includes('.icon-recommend'), 'Obsolete recommendation icon CSS must be removed');
  assert.ok(!researchHtml.includes('.icon-energy'), 'Obsolete energy icon CSS must be removed');

  assert.ok(
    siteLanguageJs.includes("document.querySelectorAll('.rd-section-label, .scenario-section-label')"),
    'Research heading must remain compatible with site-language.js'
  );
  assert.ok(
    siteLanguageJs.includes("document.querySelectorAll('[data-page-i18n]')"),
    'Research scenario content must remain compatible with site-language.js'
  );
  assert.ok(
    researchHtml.includes('<script src="files/assets/site-language.js?v=20261020-cognitive-research"></script>'),
    'Research page must request the current site-language.js content version'
  );
  assert.ok(
    siteLanguageJs.includes(
      "labels: ['三大核心研究主线', '三条主线如何关联', '共享认知框架', '应用领域']"
    )
  );
  for (const key of [
    'agentTitle',
    'agentBody',
    'agentQuestion',
    'agentRole',
    'agentTopics',
    'knowledgeTitle',
    'knowledgeBody',
    'knowledgeQuestion',
    'knowledgeRole',
    'knowledgeTopics',
    'structuredTitle',
    'structuredBody',
    'structuredQuestion',
    'structuredRole',
    'structuredTopics',
    'understandTitle',
    'understandBody',
    'reasonTitle',
    'reasonBody',
    'interactTitle',
    'interactBody',
    'mechanismsTitle',
    'mechanismsBody',
    'scienceTitle',
    'scienceBody',
    'industrialTitle',
    'industrialBody',
    'userTitle',
    'userBody'
  ]) {
    assert.ok(
      researchHtml.includes(`data-page-i18n="${key}"`),
      `Research scenario markup must expose the ${key} translation hook`
    );
  }
  for (const chineseLabel of [
    '科学工具',
    '科技文献挖掘',
    '科学建模',
    '科学知识挖掘',
    '自主科学发现',
    '工业智能',
    '云服务',
    '持续演变的复杂系统',
    '用户行为与偏好',
    '行为与偏好建模',
    '情境推理',
    '自适应的个性化推荐',
    '个性化推荐'
  ]) {
    assert.ok(siteLanguageJs.includes(chineseLabel), `Missing Research-page translation: ${chineseLabel}`);
  }
});

test('research directions each expose a scientific question without the old vision card', () => {
  const directions = sectionBetween(researchHtml, '<!-- Core Technical Pillars -->', '<!-- /Research Framework -->');
  for (const prefix of ['agent', 'knowledge', 'structured']) {
    const question = directions.match(new RegExp(`<p\\b[^>]*data-page-i18n="${prefix}Question"[^>]*>([\\s\\S]*?)<\\/p>`));
    assert.ok(question, `${prefix} needs its own scientific question`);
    assert.ok(visibleText(question[1]).length > 30, `${prefix} question must have substantive content`);
  }
  assert.equal(startTagsWithClass(directions, 'article', 'research-vision-card').length, 0);
  assert.doesNotMatch(researchHtml, /<!-- Research Vision -->|data-page-i18n="researchQuestion"/);
});

test('research hero uses the supplied English introduction in fallback markup and translation', () => {
  const hero = researchHtml.match(/<p class="page-hero-sub">([\s\S]*?)<\/p>/);
  assert.ok(hero, 'Research hero introduction must exist');
  assert.equal(hero[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(), researchIntroEnglish);
  assert.ok(siteLanguageJs.includes("subtitle: '" + researchIntroEnglish + "'"));
});

test('research introduction and all three scientific questions survive language switching', () => {
  const literal = siteLanguageJs.match(/const translations = (\{[\s\S]*?\n  \});\n\n  const navTargets/)?.[1];
  const translations = vm.runInNewContext(`(${literal})`);
  const questions = ['agent', 'knowledge', 'structured'].map((prefix) => {
    const key = `${prefix}Question`;
    const markup = researchHtml.match(new RegExp(`<p\\b[^>]*data-page-i18n="${key}"[^>]*>([\\s\\S]*?)<\\/p>`));
    assert.ok(markup, `${key} must have a translation target`);
    return { key, innerHTML: markup[1], getAttribute(name) { return name === 'data-page-i18n' ? this.key : null; } };
  });
  for (const initialLanguage of ['en', 'zh']) {
    const subtitle = { textContent: '' };
    const elements = questions.map((question) => ({ ...question }));
    let onToggle;
    const toggle = {
      textContent: '',
      setAttribute() {},
      addEventListener: (type, handler) => { if (type === 'click') onToggle = handler; }
    };
    const storage = new Map([['homepage-language', initialLanguage]]);
    const document = {
      readyState: 'complete',
      documentElement: { lang: '' },
      querySelector: (selector) => selector === '.page-hero-sub' ? subtitle : null,
      querySelectorAll: (selector) => selector === '[data-page-i18n]' ? elements : [],
      getElementById: (id) => id === 'languageToggle' ? toggle : null
    };
    vm.runInNewContext(siteLanguageJs, {
      document,
      localStorage: {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => storage.set(key, value)
      },
      window: { location: { pathname: '/research.html' } }
    }, { filename: 'site-language.js' });
    for (const lang of [initialLanguage, initialLanguage === 'en' ? 'zh' : 'en', initialLanguage]) {
      if (document.documentElement.lang !== (lang === 'zh' ? 'zh-CN' : 'en')) onToggle();
      for (const question of elements) {
        assert.equal(question.innerHTML, translations[lang].pages['research.html'].scenarios[question.key]);
      }
      assert.equal(storage.get('homepage-language'), lang);
      if (lang === 'en') assert.equal(subtitle.textContent, researchIntroEnglish);
    }
  }
});

test('research hero introduction uses left-aligned prose without justification gaps', () => {
  assertFinalDeclarations(cssRule(researchCss, '.research-page .page-hero-sub'), {
    'text-align': 'left'
  }, 'Research intro alignment');
});

test('research framework prose uses left alignment with safe line wrapping', () => {
  assertFinalDeclarations(cssRule(researchCss, '.research-page .pillar-card-desc'), {
    'text-align': 'left',
    'overflow-wrap': 'anywhere'
  }, 'Research direction prose');
});

test('research hero gives the cognitive framework full-width emphasis', () => {
  const hero = sectionBetween(researchHtml, '<!-- ===== Hero ===== -->', '<!-- ===== Main ===== -->');

  assert.equal(matchCount(hero, /class="page-hero-copy"/g), 1);
  assert.equal(matchCount(hero, /class="page-hero-visual"/g), 0);
  assert.equal(matchCount(hero, /cognitive-pipeline/g), 0);
  assert.doesNotMatch(researchHtml, /\.cognitive-pipeline\b|\.pipeline-(?:panel|grid|path|node|stage|label|signal)\b/);

  const contentRule = cssRule(researchHtml, '.page-hero-content');
  assert.ok(contentRule.includes('display: block;'));
  assert.ok(cssRule(researchHtml, '.page-hero-sub').includes('max-width: none;'));
});
