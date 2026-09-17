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
const researchIntroEnglish = 'My research centers on LLM-driven reasoning and AI agents, with a focus on context-aware reasoning, autonomous interactive, and continual learning and adaptation. This work is motivated by complex tasks in time-series intelligence and science intelligence (scientific knowledge and tool mining).';

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
    /<p class="scenario-card-body" data-i18n="research\.scienceBody">Connecting scientific data and knowledge to support reasoning and autonomous discovery\.<\/p>/,
    'AI for Science must retain the scientific data, knowledge, and discovery focus'
  );
  assert.match(
    industrialArticle,
    /<h4 class="scenario-card-title" data-i18n="research\.industrialTitle">Industrial Systems<\/h4>/,
    'The middle card must be titled Industrial Systems'
  );
  assert.match(
    industrialArticle,
    /<p class="scenario-card-body" data-i18n="research\.industrialBody">Forecasting and decision support for complex, evolving real-world systems\.<\/p>/,
    'Industrial Systems must retain the real-world forecasting and decision support focus'
  );
  assert.match(
    userArticle,
    /<p class="scenario-card-body" data-i18n="research\.userBody">Understanding behaviors and preferences to deliver adaptive, personalized recommendations\.<\/p>/,
    'Recommender Systems must retain the behavior, preferences, and personalization focus'
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
    'research.scienceTitle': ['AI for Science', 'AI for Science'],
    'research.scienceBody': [
      'Connecting scientific data and knowledge to support reasoning and autonomous discovery.',
      '融合科学数据与知识，支持科学推理与自主发现。'
    ],
    'research.scienceTopics': [
      '<span>Literature mining</span><span>Scientific modeling</span>',
      '<span>科技文献挖掘</span><span>科学建模</span>'
    ],
    'research.industrialTitle': ['Industrial Systems', '工业系统'],
    'research.industrialBody': [
      'Forecasting and decision support for complex, evolving real-world systems.',
      '面向持续演变的复杂系统，开展预测与决策支持。'
    ],
    'research.industrialTopics': [
      '<span>Energy &amp; traffic</span><span>Cloud &amp; finance</span>',
      '<span>能源与交通</span><span>云服务与金融</span>'
    ],
    'research.userTitle': ['Recommender Systems', '推荐系统'],
    'research.userBody': [
      'Understanding behaviors and preferences to deliver adaptive, personalized recommendations.',
      '理解用户行为与偏好，实现自适应的个性化推荐。'
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
    '<!-- Core Technical Pillars -->',
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
  assert.match(
    researchDirectionsSection,
    /<h3 class="pillar-card-title" data-page-i18n="agentTitle">LLMs and Agentic AI<\/h3>/
  );
  assert.match(normalizedResearchDirectionsSection, new RegExp(escapeRegex(expectedResearchCard)));
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
    '<!-- Core Technical Pillars -->',
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
    /^<span class="research-label">📊<strong>时间序列智能：<\/strong>/,
    'Chinese research.timeseries translation must use 时间序列智能 without a space after the icon'
  );
  assert.match(
    researchDirectionsSection,
    /<h3 class="pillar-card-title" data-page-i18n="timeseriesTitle">Time Series Intelligence<\/h3>/
  );
  assert.ok(siteLanguageJs.includes("timeseriesTitle: 'Time Series Intelligence'"));
  assert.ok(siteLanguageJs.includes("timeseriesTitle: '时间序列智能'"));
  assert.match(
    researchHtml,
    /<meta name="description" content="[^"]*time-series intelligence[^"]*">/
  );
  assert.match(
    researchHtml,
    /<meta property="og:description" content="[^"]*time-series intelligence[^"]*">/
  );
  assert.match(normalizedResearchDirectionsSection, new RegExp(escapeRegex(expectedResearchCard)));

  for (const [label, source] of [
    ['homepage research.timeseries item', visibleTimeseries],
    ['English research.timeseries translation', decodedTranslationEntries('research.timeseries')[0]],
    ['research direction cards', researchDirectionsSection]
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

test('homepage keeps two technical directions while Research retains Prediction Intelligence as its vision', () => {
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
  const researchFramework = sectionBetween(
    researchHtml,
    '<!-- Research Framework -->',
    '<!-- Broader Scenarios -->'
  );
  const researchVision = sectionBetween(
    researchFramework,
    '<!-- Research Vision -->',
    '<!-- Core Technical Pillars -->'
  );
  const technicalPillars = sectionBetween(
    researchFramework,
    '<!-- Core Technical Pillars -->',
    '<!-- /Research Framework -->'
  );
  const normalizedResearchVision = researchVision.replace(/\s+/g, ' ');

  assert.equal(
    matchCount(homepageDirections, /<li\b(?![^>]*\bhidden\b)[^>]*>/g),
    2,
    'Homepage must expose only LLMs and Time Series Intelligence as primary directions'
  );
  assert.match(homepageDirections, /<li class="primary-direction primary-direction--agent" data-i18n="research\.agent">/);
  assert.match(homepageDirections, /<li class="primary-direction primary-direction--timeseries" data-i18n="research\.timeseries">/);
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
  assert.equal(
    startTagsWithClass(researchVision, 'article', 'research-vision-card').length,
    1,
    'Research page must present one full-width research vision'
  );
  assert.match(
    normalizedResearchVision,
    /<article class="research-vision-card">[\s\S]*?<a class="research-vision-title" href="prediction-intelligence\.html" data-page-i18n="visionTitle">Prediction Intelligence<\/a>[\s\S]*?<p class="research-vision-desc" data-page-i18n="visionBody"> Building <strong>context-aware<\/strong>, <strong>reasoning-driven<\/strong>, and <strong>uncertainty-aware predictive intelligence<\/strong> for <strong>complex and evolving systems<\/strong>, enabling <strong>explainable forecasting<\/strong> and <strong>trustworthy decision support<\/strong>\. <\/p>/
  );
  assert.ok(
    siteLanguageJs.includes(
      "visionBody: 'Building <strong>context-aware</strong>, <strong>reasoning-driven</strong>, and <strong>uncertainty-aware predictive intelligence</strong> for <strong>complex and evolving systems</strong>, enabling <strong>explainable forecasting</strong> and <strong>trustworthy decision support</strong>.'"
    ),
    'Research-page English vision translation must retain the approved copy'
  );
  assert.equal(
    startTagsWithClass(technicalPillars, 'article', 'pillar-card').length,
    2,
    'Research page must present exactly two core technical pillars'
  );
  assert.match(technicalPillars, /<article class="pillar-card pillar-card--agent">/);
  assert.match(technicalPillars, /<article class="pillar-card pillar-card--timeseries">/);
  assert.ok(
    technicalPillars.indexOf('LLMs and Agentic AI') <
      technicalPillars.indexOf('Time Series Intelligence'),
    'Technical pillars must keep LLMs and Agentic AI before Time Series Intelligence'
  );
  assert.doesNotMatch(
    researchFramework,
    /Scientific Knowledge Cognition|\brd-card\b|\bprimary-cards\b/,
    'Research page must remove the obsolete flat primary-direction card system'
  );

  const visionRule = cssRule(researchHtml, '.research-vision-card');
  assert.ok(visionRule.includes('display: flex;'));
  assert.ok(visionRule.includes('width: 100%;'));
  const visionCopyRule = cssRule(researchHtml, '.research-vision-copy');
  assert.equal(
    finalDeclarationValue(visionCopyRule, 'flex'),
    '1',
    'Research vision copy must expand into the remaining card width'
  );
  assert.equal(
    finalDeclarationValue(visionCopyRule, 'max-width'),
    'none',
    'Research vision copy must not preserve the old 790px width cap'
  );
  const pillarGridRule = cssRule(researchHtml, '.pillar-grid');
  assert.ok(pillarGridRule.includes('display: grid;'));
  assert.ok(pillarGridRule.includes('grid-template-columns: repeat(2, minmax(0, 1fr));'));
  const responsivePrimary = sectionBetween(
    researchHtml,
    '@media (max-width: 960px)',
    '@media (max-width: 680px)'
  );
  assert.ok(
    cssRule(responsivePrimary, '.pillar-grid').includes(
      'grid-template-columns: minmax(0, 1fr);'
    )
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
    'Research collections: 🤖 <a href="https://agentr1.github.io/" target="_blank" rel="noopener">LLMs and Agentic AI</a> · 📊 <a href="https://ustc-time-series.github.io/" target="_blank" rel="noopener">Time Series Intelligence</a> · 📚 <a href="https://ustcagi-sci.github.io/" target="_blank" rel="noopener">Science Intelligence</a>';
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
  assert.match(siteLanguageJs, /subtitle: '以大模型推理与智能体为核心研究方向，聚焦情境感知推理、自主交互学习、持续学习与适应，以时序智能和科学智能（科学知识与工具挖掘）中的复杂任务为应用牵引。'/);

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
    /<h3 class="scenario-card-title" data-page-i18n="industrialTitle">Industrial Systems<\/h3>/,
    'The Research page must include the Industrial Systems scenario'
  );
  assert.match(
    researchArticles.user,
    /<p class="scenario-card-body" data-page-i18n="userBody">Understanding behaviors and preferences to deliver adaptive, personalized recommendations\.<\/p>/,
    'The Research-page Recommender Systems card must retain its full research narrative'
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

test('research page keeps shared pillar icons and complete framework translation', () => {
  assert.ok(!researchHtml.includes('.sc-card'), 'Obsolete .sc-card styles must be removed');
  assert.ok(!researchHtml.includes('.scenario-cards'), 'Obsolete .scenario-cards styles must be removed');
  assert.ok(!researchHtml.includes('.icon-recommend'), 'Obsolete recommendation icon CSS must be removed');
  assert.ok(!researchHtml.includes('.icon-energy'), 'Obsolete energy icon CSS must be removed');

  for (const selector of ['.visual-icon i', '.icon-network', '.icon-series']) {
    assert.ok(researchHtml.includes(selector), `Shared pillar icon rule must remain: ${selector}`);
  }
  assert.doesNotMatch(researchHtml, /\.icon-literature\b/);

  assert.ok(
    siteLanguageJs.includes("document.querySelectorAll('.rd-section-label, .scenario-section-label')"),
    'Research heading must remain compatible with site-language.js'
  );
  assert.ok(
    siteLanguageJs.includes("document.querySelectorAll('[data-page-i18n]')"),
    'Research scenario content must remain compatible with site-language.js'
  );
  assert.ok(
    researchHtml.includes('<script src="files/assets/site-language.js?v=20260917-service"></script>'),
    'Research page must request the current site-language.js content version'
  );
  assert.ok(
    siteLanguageJs.includes(
      "labels: ['研究愿景', '核心技术支柱', '应用领域']"
    )
  );
  for (const key of [
    'researchQuestion',
    'visionTitle',
    'visionBody',
    'agentTitle',
    'agentBody',
    'timeseriesTitle',
    'timeseriesBody',
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
    '科学数据与知识',
    '科技文献挖掘',
    '科学建模',
    '科学推理',
    '自主发现',
    '可解释预测',
    '可信决策辅助',
    '工业系统',
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

test('research vision opens with the core agent reasoning question', () => {
  const vision = sectionBetween(researchHtml, '<!-- Research Vision -->', '<!-- Core Technical Pillars -->');
  const question = vision.match(/<p class="research-vision-desc research-question" data-page-i18n="researchQuestion">([\s\S]*?)<\/p>/);
  assert.ok(question, 'Core research question must appear in the research vision');
  assert.equal(
    question[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(),
    'How can agents reliably solve problems through reasoning and interaction when information is incomplete, environments change, and feedback is costly?'
  );
  assert.ok(question.index < vision.indexOf('<article class="research-vision-card">'));
  assertFinalDeclarations(cssRule(researchHtml, '.research-question'), {
    margin: '0 0 18px',
    'font-size': '16px'
  }, 'Core research question');
});

test('research hero uses the supplied English introduction in fallback markup and translation', () => {
  const hero = researchHtml.match(/<p class="page-hero-sub">([\s\S]*?)<\/p>/);
  assert.ok(hero, 'Research hero introduction must exist');
  assert.equal(hero[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(), researchIntroEnglish);
  assert.ok(siteLanguageJs.includes("subtitle: '" + researchIntroEnglish + "'"));
});

test('research introduction and core question survive language switching', () => {
  const questionMarkup = researchHtml.match(/<p class="research-vision-desc research-question" data-page-i18n="researchQuestion">([\s\S]*?)<\/p>/);
  assert.ok(questionMarkup, 'Research question must have a translation target');
  const expected = {
    en: 'How can agents reliably solve problems through reasoning and interaction when information is incomplete, environments change, and feedback is costly?',
    zh: '在信息不完整、环境会变化、反馈有成本的条件下，智能体如何通过推理与交互可靠地解决问题。'
  };
  for (const initialLanguage of ['en', 'zh']) {
    const subtitle = { textContent: '' };
    const question = {
      innerHTML: questionMarkup[1],
      getAttribute: (name) => name === 'data-page-i18n' ? 'researchQuestion' : null
    };
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
      querySelectorAll: (selector) => selector === '[data-page-i18n]' ? [question] : [],
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
      assert.equal(question.innerHTML.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(), expected[lang]);
      assert.match(question.innerHTML, /<strong>/);
      assert.equal(storage.get('homepage-language'), lang);
      if (lang === 'en') assert.equal(subtitle.textContent, researchIntroEnglish);
    }
  }
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

test('research framework prose keeps clean two-edge alignment', () => {
  for (const selector of ['.research-vision-desc', '.pillar-card-desc']) {
    const rule = cssRule(researchHtml, selector);
    for (const declaration of [
      'text-align: justify;',
      'text-align-last: left;',
      'text-justify: inter-word;',
      'hyphens: none;',
      '-webkit-hyphens: none;'
    ]) {
      assert.ok(rule.includes(declaration), `Missing ${selector} alignment rule: ${declaration}`);
    }
  }
});

test('research hero gives the three-tier framework full-width emphasis', () => {
  const hero = sectionBetween(researchHtml, '<!-- ===== Hero ===== -->', '<!-- ===== Main ===== -->');

  assert.equal(matchCount(hero, /class="page-hero-copy"/g), 1);
  assert.equal(matchCount(hero, /class="page-hero-visual"/g), 0);
  assert.equal(matchCount(hero, /cognitive-pipeline/g), 0);
  assert.doesNotMatch(researchHtml, /\.cognitive-pipeline\b|\.pipeline-(?:panel|grid|path|node|stage|label|signal)\b/);

  const contentRule = cssRule(researchHtml, '.page-hero-content');
  assert.ok(contentRule.includes('display: block;'));
  assert.ok(cssRule(researchHtml, '.page-hero-sub').includes('max-width: none;'));
});
