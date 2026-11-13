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
const researchIntroEnglish = 'My research centers on large language models and agents, time-series data mining, and scientific literature mining. I pursue three connected directions: Forecasting Intelligence, AI for AI, and AI for Science, with a focus on predictive reasoning, autonomous learning, and scientific discovery.';
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
  expectedModifiers = ['science', 'user', 'industrial']
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
  expectedModifiers = ['science', 'user', 'industrial']
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

test('legacy scenario stylesheet remains available while compact Research uses its scoped styles', () => {
  assert.ok(existsSync(cssPath), 'files/assets/scenario-cards.css must exist');
  assert.doesNotMatch(researchHtml, /href="files\/assets\/scenario-cards\.css/);
  assert.match(researchHtml, /href="files\/assets\/research-page\.css(?:\?[^"]+)?"/);

  for (const [name, source] of [['index.html', indexHtml]]) {
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

test('homepage research directions use one concise bilingual paragraph in the requested order', () => {
  const researchArea = sectionBetween(indexHtml, '<!-- ===== Research Interests ===== -->', '<!-- ===== Latest News ===== -->');
  assert.doesNotMatch(researchArea, /<article class="scenario-card/);
  const paragraphs = [...researchArea.matchAll(/<p\b[^>]*data-i18n="research\.applications"[^>]*>([\s\S]*?)<\/p>/g)];
  assert.equal(paragraphs.length, 1, 'Research directions need one translatable paragraph');
  assert.match(paragraphs[0][0], /class="research-applications"/);
  const expectedEnglish = '<strong>Research Directions:</strong> Forecasting Intelligence, AI for AI, AI for Science, Recommender Systems.';
  const expectedChinese = '<strong>研究方向：</strong>预测智能、大模型自主学习与智能体持续进化、科学智能、推荐系统。';
  assert.equal(paragraphs[0][1], expectedEnglish);
  assert.deepEqual(decodedTranslationEntries('research.applications'), [expectedEnglish, expectedChinese]);
});













test('homepage keeps three concise primary directions without collection links', () => {
  const section = sectionBetween(indexHtml, '<!-- ===== Research Interests ===== -->', '<!-- ===== Latest News ===== -->');
  const directions = [...section.matchAll(/<li\b(?![^>]*\bhidden\b)[^>]*data-i18n="research\.(agent|timeseries|science)"[^>]*>([\s\S]*?)<\/li>/g)];
  assert.deepEqual(directions.map(match => match[1]), ['agent', 'timeseries', 'science']);
  for (const [, key, markup] of directions) {
    const [en, zh] = decodedTranslationEntries(`research.${key}`);
    assert.equal(markup, en);
    assert.ok(visibleText(en).length < 450, key);
    assert.ok(visibleText(zh).length < 200, key);
  }
  assert.doesNotMatch(section, /data-i18n="research\.collections"|primary-direction--prediction/);
});

test('research foundations use three responsive columns and directions remain in canonical vertical order', () => {
  const foundationRules = cssRuleBlocks(researchCss, '.research-page .foundation-grid');
  assert.equal(finalDeclarationValue(foundationRules[0]?.body || '', 'display'), 'grid');
  assert.equal(finalDeclarationValue(foundationRules[0].body, 'grid-template-columns'), 'repeat(3, minmax(0, 1fr))');
  const tabletStyles = sectionBetween(researchCss, '@media (min-width: 681px) and (max-width: 960px)', '@media (max-width: 680px)');
  assertFinalDeclarations(cssRule(tabletStyles, '.research-page .foundation-grid'), {
    'grid-template-columns': 'repeat(2, minmax(0, 1fr))'
  }, 'Research foundation tablet columns');
  assertFinalDeclarations(cssRule(tabletStyles, '.research-page .foundation-card--literature'), {
    'grid-column': '1 / -1'
  }, 'Research literature foundation tablet span');
  const mobileStyles = researchCss.slice(researchCss.indexOf('@media (max-width: 680px)'));
  assertFinalDeclarations(cssRule(mobileStyles, '.research-page .foundation-grid'), {
    'grid-template-columns': 'minmax(0, 1fr)'
  }, 'Research foundation mobile columns');
  const pillars = researchHtml.match(/<section\b[^>]*aria-labelledby="research-directions-heading"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(pillars, 'Research directions must have a semantic section');
  const cards = startTagsWithClass(pillars, 'article', 'pillar-card');
  assert.deepEqual(
    cards.map((tag) => classTokens(tag).filter((token) => token.startsWith('pillar-card--'))),
    [['pillar-card--forecasting'], ['pillar-card--ai'], ['pillar-card--science']],
    'Research directions must appear as Forecasting Intelligence, AI for AI, then AI for Science'
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
  assertFinalDeclarations(cssRule(researchCss, '.research-page .direction-works'), {
    'display': 'flex',
    'flex-wrap': 'wrap'
  }, 'Research selected-work row');
});

test('research pages omit table research without removing its publication category', () => {
  const homepageSection = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  for (const [name, source] of [
    ['homepage research section', homepageSection],
    ['research page', researchHtml]
  ]) {
    assert.doesNotMatch(source, /ustc-table-mining\.github\.io|🧮/, `${name} must omit Tabular Data Mining`);
  }

  assert.match(
    indexHtml,
    /<button class="pub-filter-btn" type="button" aria-pressed="false" data-filter="table" data-i18n="pub\.filterTable">Table Mining<\/button>/
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



test('research page keeps shared translations for its foundations and directions', () => {
  assert.ok(siteLanguageJs.includes("document.querySelectorAll('[data-page-i18n]')"));
  assert.match(researchHtml, /site-language\.js\?v=20261114-research-editorial/);
  for (const prefix of ['forecasting', 'ai', 'science']) for (const suffix of ['Title', 'Body', 'Role']) assert.ok(researchHtml.includes(`data-page-i18n="${prefix}${suffix}"`));
  for (const prefix of ['foundationLlm', 'foundationTimeseries', 'foundationLiterature']) for (const suffix of ['Title', 'Body']) assert.ok(researchHtml.includes(`data-page-i18n="${prefix}${suffix}"`));
  assert.doesNotMatch(researchHtml, /data-page-i18n="(?:relationsIntro|applicationsSummary|\w+Topics)"/);
});

test('research directions keep substantive descriptions without question blocks or the old vision card', () => {
  const directions = researchHtml.match(/<section\b[^>]*aria-labelledby="research-directions-heading"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  assert.ok(directions, 'Research directions must have a semantic section');
  for (const prefix of ['forecasting', 'ai', 'science']) {
    const description = directions.match(new RegExp(`<p\\b[^>]*data-page-i18n="${prefix}Body"[^>]*>([\\s\\S]*?)<\\/p>`));
    assert.ok(description, `${prefix} needs its own description`);
    assert.ok(visibleText(description[1]).length > 30, `${prefix} description must have substantive content`);
  }
  assert.doesNotMatch(directions, /pillar-question|data-page-i18n="(?:questionLabel|\w+Question)"/);
  assert.equal(startTagsWithClass(directions, 'article', 'research-vision-card').length, 0);
  assert.doesNotMatch(researchHtml, /<!-- Research Vision -->|data-page-i18n="researchQuestion"/);
});

test('research hero uses the supplied English introduction in fallback markup and translation', () => {
  const hero = researchHtml.match(/<p class="page-hero-sub">([\s\S]*?)<\/p>/);
  assert.ok(hero, 'Research hero introduction must exist');
  assert.equal(hero[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim(), researchIntroEnglish);
  const literal = siteLanguageJs.match(/const translations = (\{[\s\S]*?\n  \});\n\n  const navTargets/)?.[1];
  assert.equal(vm.runInNewContext(`(${literal})`).en.pages['research.html'].subtitle, researchIntroEnglish);
});

test('research introduction and all three direction descriptions survive language switching', () => {
  const literal = siteLanguageJs.match(/const translations = (\{[\s\S]*?\n  \});\n\n  const navTargets/)?.[1];
  const translations = vm.runInNewContext(`(${literal})`);
  const descriptions = ['forecasting', 'ai', 'science'].map((prefix) => {
    const key = `${prefix}Body`;
    const markup = researchHtml.match(new RegExp(`<p\\b[^>]*data-page-i18n="${key}"[^>]*>([\\s\\S]*?)<\\/p>`));
    assert.ok(markup, `${key} must have a translation target`);
    return { key, innerHTML: markup[1], getAttribute(name) { return name === 'data-page-i18n' ? this.key : null; } };
  });
  for (const initialLanguage of ['en', 'zh']) {
    const subtitle = { textContent: '' };
    const elements = descriptions.map((description) => ({ ...description }));
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
      for (const description of elements) {
        assert.equal(description.innerHTML, translations[lang].pages['research.html'].scenarios[description.key]);
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

test('research hero gives the foundations and directions full-width emphasis', () => {
  const hero = sectionBetween(researchHtml, '<!-- ===== Hero ===== -->', '<!-- ===== Main ===== -->');

  assert.equal(matchCount(hero, /class="page-hero-copy"/g), 1);
  assert.equal(matchCount(hero, /class="page-hero-visual"/g), 0);
  assert.equal(matchCount(hero, /cognitive-pipeline/g), 0);
  assert.doesNotMatch(researchHtml, /\.cognitive-pipeline\b|\.pipeline-(?:panel|grid|path|node|stage|label|signal)\b/);

  const contentRule = cssRule(researchHtml, '.page-hero-content');
  assert.ok(contentRule.includes('display: block;'));
  assert.ok(cssRule(researchHtml, '.page-hero-sub').includes('max-width: none;'));
});
