import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const awardsHtml = readFileSync(join(root, 'awards.html'), 'utf8');
const newsHtml = readFileSync(join(root, 'news.html'), 'utf8');
const publicationsHtml = readFileSync(join(root, 'publications.html'), 'utf8');
const projectsHtml = readFileSync(join(root, 'projects.html'), 'utf8');
const count = (source, pattern) => (source.match(pattern) || []).length;

function sectionBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing start marker: ${startMarker}`);
  assert.ok(end > start, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

test('homepage metadata describes the current research portfolio', () => {
  const head = sectionBetween(indexHtml, '<head>', '</head>');

  assert.match(
    head,
    /<link rel="canonical" href="https:\/\/mingyue-cheng\.github\.io\/">/
  );
  assert.match(
    head,
    /<meta name="description" content="[^"]*LLMs and Agentic AI[^"]*prediction intelligence[^"]*AI for Science[^"]*">/
  );
  assert.match(
    head,
    /<meta property="og:description" content="[^"]*prediction intelligence[^"]*AI for Science[^"]*">/
  );
  assert.match(
    head,
    /<meta name="twitter:description" content="[^"]*prediction intelligence[^"]*AI for Science[^"]*">/
  );
  assert.match(
    head,
    /<meta name="keywords" content="[^"]*Time Series Intelligence[^"]*">/
  );
  assert.match(head, /<meta property="og:image:alt" content="Portrait of Mingyue Cheng">/);
  assert.doesNotMatch(
    head,
    /Research in Time Series Analysis, LLM Agents, and (?:Table|Tabular) Mining/
  );
});

test('homepage provides keyboard-first landmarks and navigation', () => {
  assert.match(
    indexHtml,
    /<body>\s*<a class="skip-link" href="#main-content" data-i18n="nav\.skip">Skip to main content<\/a>/
  );
  assert.match(indexHtml, /<main id="main-content" tabindex="-1">/);
  assert.equal(count(indexHtml, /<main\b/g), 1);
  assert.equal(count(indexHtml, /<\/main>/g), 1);
  assert.match(
    indexHtml,
    /<nav class="nav-links" id="primary-nav" aria-label="Primary navigation" data-i18n-aria-label="a11y\.primaryNav">/
  );
  assert.match(
    indexHtml,
    /<a href="index\.html#home" class="nav-logo" aria-current="page" data-i18n="nav\.logo">/
  );
  assert.match(
    indexHtml,
    /<button class="nav-toggle" type="button" aria-label="Toggle navigation" data-i18n-aria-label="a11y\.toggleNav" aria-controls="primary-nav" aria-expanded="false">/
  );
});

test('language switching keeps accessible names synchronized', () => {
  assert.match(
    indexHtml,
    /document\.querySelectorAll\('\[data-i18n-aria-label\]'\)\.forEach\(el => \{/
  );
  assert.match(
    indexHtml,
    /const key = el\.getAttribute\('data-i18n-aria-label'\);[\s\S]*?el\.setAttribute\('aria-label', dictionary\[key\]\);/
  );

  for (const [key, english, chinese] of [
    ['a11y.primaryNav', 'Primary navigation', '主导航'],
    ['a11y.switchLanguage', 'Switch language', '切换语言'],
    ['a11y.toggleNav', 'Toggle navigation', '展开或收起导航'],
    ['a11y.profileHome', 'Refresh homepage', '刷新主页'],
    ['a11y.publicationFilters', 'Filter publications by research area', '按研究方向筛选论文'],
    ['a11y.backToTop', 'Back to top', '返回顶部']
  ]) {
    assert.match(indexHtml, new RegExp(`"${key}": "${english}"`));
    assert.match(indexHtml, new RegExp(`"${key}": "${chinese}"`));
  }

  assert.match(
    indexHtml,
    /class="profile-home-link"[^>]*data-i18n-aria-label="a11y\.profileHome"/
  );
  assert.match(
    indexHtml,
    /class="language-toggle"[^>]*data-i18n-aria-label="a11y\.switchLanguage"/
  );
  assert.match(
    indexHtml,
    /class="pub-filters" role="group" aria-label="Filter publications by research area" data-i18n-aria-label="a11y\.publicationFilters"/
  );
  assert.match(
    indexHtml,
    /id="back-to-top" aria-label="Back to top" data-i18n-aria-label="a11y\.backToTop"/
  );
  assert.match(
    indexHtml,
    /<a class="pub-all-link" href="publications\.html" data-i18n="pub\.viewAll">View all publications →<\/a>/
  );
  assert.equal(count(indexHtml, /"pub\.viewAll":/g), 2);
  assert.match(indexHtml, /"pub\.viewAll": "View all publications →"/);
  assert.match(indexHtml, /"pub\.viewAll": "查看全部论文 →"/);
});

test('homepage selected-publication filters and year groups remain accessible', () => {
  const publications = sectionBetween(
    indexHtml,
    '<!-- ===== Selected Publications ===== -->',
    '<!-- ===== Open Source Projects ===== -->'
  );
  const filterButtons = [...publications.matchAll(/<button class="pub-filter-btn[^"]*"[^>]*>/g)]
    .map((match) => match[0]);

  assert.equal(filterButtons.length, 5);
  for (const button of filterButtons) {
    assert.match(button, /type="button"/);
    assert.match(button, /aria-pressed="(?:true|false)"/);
  }
  assert.match(publications, /data-filter="ai4science"[^>]*>AI for Science<\/button>/);
  assert.doesNotMatch(publications, /data-filter="recsys"/);

  const yearToggles = [...publications.matchAll(
    /<button\b(?=[^>]*class="pub-year-toggle")(?=[^>]*aria-expanded="true")(?=[^>]*aria-controls="([^"]+)")[^>]*>/g
  )].map((match) => match[1]);
  assert.deepEqual(yearToggles, [
    'publication-list-preprints',
    'publication-list-surveys',
    'publication-list-2026',
    'publication-list-2025',
    'publication-list-2024',
    'publication-list-legacy'
  ]);
  assert.equal(new Set(yearToggles).size, yearToggles.length);
  for (const controlledId of yearToggles) {
    assert.match(publications, new RegExp(`<ol class="pub-list" id="${controlledId}">`));
  }
  const visibleEntries = [...publications.replace(/<!--[\s\S]*?-->/g, '').matchAll(
    /<li data-tags="[^"]+">[\s\S]*?<\/li>/g
  )];
  assert.equal(visibleEntries.length, 70);
  assert.match(publications, /<a\b[^>]*href="publications\.html"[^>]*>View all publications →<\/a>/);
  for (const [key, label] of [
    ['pub.preprint', '📘 Preprint'],
    ['pub.survey', '📘 Released Survey'],
    ['pub.year2026', '🐎 Year of the Fire Horse (Bing Wu Year, 2026)'],
    ['pub.year2025', '🐍 Year of the Wood Snake (Yi Si Year, 2025)'],
    ['pub.year2024', '🐉 Year of the Wood Dragon (Jia Chen Year, 2024)'],
    ['pub.legacy', '📘 2023 and Before']
  ]) {
    assert.match(
      publications,
      new RegExp(`class="pub-year-toggle"[^>]*data-i18n="${key.replace('.', '\\.')}"[^>]*>${label.replace(/[()]/g, '\\$&')}<\\/button>`)
    );
  }
  assert.doesNotMatch(publications, /Representative Work|pub\.representative/);

  assert.match(indexHtml, /document\.querySelectorAll\('\.pub-year-toggle'\)/);
  assert.match(
    indexHtml,
    /collapsedState\.set\(h, h\.getAttribute\('data-default-collapsed'\) === 'true'\);/
  );
  const collapsedYears = [...publications.matchAll(/<h3\b(?=[^>]*id="(year-[^"]+)")(?=[^>]*data-default-collapsed="true")[^>]*>/g)]
    .map((match) => match[1]);
  assert.deepEqual(collapsedYears, ['year-2025', 'year-2024', 'year-2023']);
  assert.doesNotMatch(indexHtml, /const startsExpanded =/);
  assert.match(indexHtml, /collapsedState\.set\(h, !collapsedState\.get\(h\)\);/);
  assert.match(
    indexHtml,
    /toggle\.setAttribute\('aria-expanded', String\(!collapsed\)\);/
  );
  assert.match(
    indexHtml,
    /button\.setAttribute\('aria-pressed', String\(button === btn\)\);/
  );
});

test('homepage presents WebMind as the latest open-source project', () => {
  const openSource = sectionBetween(
    indexHtml,
    '<!-- ===== Open Source Projects ===== -->',
    '<!-- ===== Datasets ===== -->'
  );
  const webMindCard = sectionBetween(
    openSource,
    '<div class="os-card-name">WebMind</div>',
    '<div class="os-card-name">CastClaw（观星阁）</div>'
  );

  assert.match(
    openSource,
    /<div class="os-grid">\s*<div class="os-card">[\s\S]*?<div class="os-card-name">WebMind<\/div>/
  );
  assert.match(
    webMindCard,
    /<span class="os-year">2026\.09<\/span>\s*<a class="os-github" href="https:\/\/github\.com\/AgentR1\/WebMind" target="_blank" rel="noopener">GitHub<\/a>/
  );
  assert.match(webMindCard, /data-repo="AgentR1\/WebMind"/);
  assert.match(webMindCard, /<span class="os-inline-highlight">WebMind<\/span> is a <strong>web-task skill<\/strong> for <strong>AI agents<\/strong>/);
  assert.match(webMindCard, /<strong>isolated, persistent browser environment<\/strong>/);
  assert.match(webMindCard, /<strong>no Google sign-in<\/strong>/);
  assert.match(webMindCard, /does not use personal data from the user's everyday Chrome profile by default/);
  assert.match(webMindCard, /<strong>topic research<\/strong>, <strong>information collection<\/strong>, and <strong>repeatable web workflows<\/strong>/);
  assert.equal(count(openSource, /<div class="os-card-name">WebMind<\/div>/g), 1);
  assert.equal(count(openSource, /href="https:\/\/github\.com\/AgentR1\/WebMind"/g), 1);
});

test('homepage keeps NeoResearch source-preserved but hidden', () => {
  const openSource = sectionBetween(
    indexHtml,
    '<!-- ===== Open Source Projects ===== -->',
    '<!-- ===== Datasets ===== -->'
  );
  const renderedOpenSource = openSource.replace(/<!--[\s\S]*?-->/g, '');

  assert.doesNotMatch(renderedOpenSource, /NeoResearch（智多星）/);
  assert.match(
    openSource,
    /<!-- Temporarily hidden: NeoResearch open source project\.[\s\S]*?<div class="os-card-name">NeoResearch（智多星）<\/div>[\s\S]*?<a class="os-github" href="https:\/\/ustc-time-series\.github\.io\/star-cast\/" target="_blank" rel="noopener">Website<\/a>[\s\S]*?<span class="os-inline-highlight">NeoResearch（智多星）<\/span>[\s\S]*?-->/
  );
});

test('open-source subpage mirrors homepage projects and venue badges', () => {
  const homepageOpenSource = sectionBetween(
    indexHtml,
    '<!-- ===== Open Source Projects ===== -->',
    '<!-- ===== Datasets ===== -->'
  );
  const subpageOpenSource = sectionBetween(
    projectsHtml,
    '<!-- ===== Open Source ===== -->',
    '<!-- ===== Benchmarks & Datasets ===== -->'
  );
  const visible = (source) => source.replace(/<!--[\s\S]*?-->/g, '');
  const cardNames = (source) => [...visible(source).matchAll(
    /<div class="os-card-name">([^<]+)<\/div>/g
  )].map((match) => match[1]);
  const normalizedMatches = (source, pattern) => [...visible(source).matchAll(pattern)]
    .map((match) => match[1].replace(/\s+/g, ' ').trim());
  const venueBadges = (source, className) => [...visible(source).matchAll(
    new RegExp(`<span class="${className}">([^<]+)<\\/span>`, 'g')
  )].map((match) => match[1]);

  assert.deepEqual(cardNames(subpageOpenSource), cardNames(homepageOpenSource));
  for (const pattern of [
    /<span class="os-year">([^<]+)<\/span>/g,
    /<a\b[^>]*href="([^"]+)"[^>]*>/g,
    /data-repo="([^"]+)"/g,
    /<div class="os-card-desc">([\s\S]*?)<\/div>/g
  ]) {
    assert.deepEqual(
      normalizedMatches(subpageOpenSource, pattern),
      normalizedMatches(homepageOpenSource, pattern)
    );
  }
  assert.deepEqual(
    venueBadges(subpageOpenSource, 'os-venue'),
    venueBadges(homepageOpenSource, 'os-venue')
  );
  assert.doesNotMatch(visible(subpageOpenSource), /NeoResearch（智多星）/);
  assert.match(
    subpageOpenSource,
    /<!-- Temporarily hidden: NeoResearch open source project\.[\s\S]*?<div class="os-card-name">NeoResearch（智多星）<\/div>[\s\S]*?-->/
  );

  const homepageDatasets = sectionBetween(
    indexHtml,
    '<!-- ===== Datasets ===== -->',
    '<!-- ===== Education ===== -->'
  );
  const subpageDatasets = sectionBetween(
    projectsHtml,
    '<!-- ===== Benchmarks & Datasets ===== -->',
    '</main>'
  );
  assert.deepEqual(
    venueBadges(subpageDatasets, 'dataset-venue'),
    venueBadges(homepageDatasets, 'dataset-venue')
  );
  for (const pattern of [
    /<span class="dataset-name">([^<]+)<\/span>/g,
    /<span class="os-year">([^<]+)<\/span>/g,
    /<a\b[^>]*href="([^"]+)"[^>]*>/g,
    /data-repo="([^"]+)"/g,
    /<div class="dataset-card-desc">([\s\S]*?)<\/div>/g
  ]) {
    assert.deepEqual(
      normalizedMatches(subpageDatasets, pattern),
      normalizedMatches(homepageDatasets, pattern)
    );
  }
});

test('accepted open-source cards display their venue badges', () => {
  const agentR1Meta = sectionBetween(
    indexHtml,
    '<div class="os-card-name">Agent-R1</div>',
    '<div class="os-card-desc"><span class="os-inline-highlight">Agent-R1</span>'
  );
  const tabClawMeta = sectionBetween(
    indexHtml,
    '<div class="os-card-name">TabClaw</div>',
    '<div class="os-card-desc"><span class="os-inline-highlight">TabClaw</span>'
  );
  const paperScoutMeta = sectionBetween(
    indexHtml,
    '<div class="os-card-name">PaperScout</div>',
    '<div class="os-card-desc"><span class="os-inline-highlight">PaperScout</span>'
  );

  assert.match(
    agentR1Meta,
    /<span class="os-year">2025\.04<\/span>\s*<span class="os-venue">CIKM 2026<\/span>\s*<a class="os-github" href="https:\/\/github\.com\/AgentR1\/Agent-R1"/
  );
  assert.equal(count(agentR1Meta, /CIKM 2026/g), 1);
  assert.match(
    tabClawMeta,
    /<span class="os-year">2026\.03<\/span>\s*<span class="os-venue">CIKM 2026<\/span>\s*<a class="os-github" href="https:\/\/github\.com\/ustc-table-mining\/TabClaw"/
  );
  assert.equal(count(tabClawMeta, /CIKM 2026/g), 1);
  assert.match(
    paperScoutMeta,
    /<span class="os-year">2026\.01<\/span>\s*<span class="os-venue">EMNLP 2026<\/span>\s*<a class="os-github" href="https:\/\/github\.com\/AgentR1\/PaperScout"/
  );
  assert.equal(count(paperScoutMeta, /EMNLP 2026/g), 1);
});

test('accepted dataset cards display their venue badges', () => {
  const chemTableMeta = sectionBetween(
    indexHtml,
    '<span class="dataset-name">ChemTable</span>',
    '<strong>Benchmarking Multimodal LLMs on Recognition and Understanding over Chemical Tables</strong>'
  );
  const hohMeta = sectionBetween(
    indexHtml,
    '<span class="dataset-name">HoH</span>',
    '<strong>HoH: A Dynamic Benchmark for Evaluating the Impact of Outdated Information on RAG</strong>'
  );

  assert.match(
    chemTableMeta,
    /<span class="os-year">2025\.06<\/span>\s*<span class="dataset-venue">KDD 2026<\/span>\s*<a class="dataset-repo-link" href="https:\/\/github\.com\/ustc-ai4science\/ChemTable"/
  );
  assert.equal(count(chemTableMeta, /KDD 2026/g), 1);
  assert.match(
    hohMeta,
    /<span class="os-year">2025\.06<\/span>\s*<span class="dataset-venue">ACL 2025<\/span>\s*<a class="dataset-repo-link" href="https:\/\/github\.com\/0russwest0\/HoH"/
  );
  assert.equal(count(hohMeta, /ACL 2025/g), 1);
  assert.match(indexHtml, /\.os-venue,\s*\.dataset-venue\s*\{/);
});

test('homepage supports visible focus and reduced-motion preferences', () => {
  assert.match(indexHtml, /\.skip-link\s*\{[\s\S]*?transform: translateY\(-150%\);[\s\S]*?\}/);
  assert.match(indexHtml, /\.skip-link:focus\s*\{[\s\S]*?transform: translateY\(0\);[\s\S]*?\}/);
  assert.match(indexHtml, /:focus-visible\s*\{[\s\S]*?outline: 3px solid/);
  assert.match(indexHtml, /@media \(prefers-reduced-motion: reduce\)\s*\{/);
  assert.match(indexHtml, /window\.matchMedia\('\(prefers-reduced-motion: reduce\)'\)\.matches/);
});

test('homepage content polish stays current and layout-stable', () => {
  assert.match(
    indexHtml,
    /<img class="profile-photo" src="\.\/HomePage_files\/Mycheng-6\.png" alt="Mingyue Cheng" width="358" height="441" decoding="async">/
  );
  assert.match(indexHtml, /data-i18n="profile\.title">Ph\.D\. &nbsp;·&nbsp; Associate Researcher<\/div>/);
  assert.match(indexHtml, />Professional Experience<\/h2>/);
  assert.match(indexHtml, /Computer Science and Technology, Ph\.D\. degree,/);
  assert.match(indexHtml, /Last updated in August 2026\./);
  assert.match(indexHtml, /最后更新于 2026 年 8 月。/);
  assert.match(indexHtml, /"pub\.filterKnowledge": "AI for Science"/);
  assert.match(indexHtml, /"pub\.filterKnowledge": "科学智能"/);
  for (const [key, english, chinese] of [
    ['pub.preprint', '📘 Preprint', '📘 预印本'],
    ['pub.survey', '📘 Released Survey', '📘 已发布综述'],
    ['pub.year2026', '🐎 Year of the Fire Horse (Bing Wu Year, 2026)', '🐎 丙午马年（2026）'],
    ['pub.year2025', '🐍 Year of the Wood Snake (Yi Si Year, 2025)', '🐍 乙巳蛇年（2025）'],
    ['pub.year2024', '🐉 Year of the Wood Dragon (Jia Chen Year, 2024)', '🐉 甲辰龙年（2024）'],
    ['pub.legacy', '📘 2023 and Before', '📘 2023 年及以前']
  ]) {
    assert.equal(count(indexHtml, new RegExp(`"${key.replace('.', '\\.')}":`, 'g')), 2);
    assert.ok(indexHtml.includes(`"${key}": "${english}"`));
    assert.ok(indexHtml.includes(`"${key}": "${chinese}"`));
  }
  assert.doesNotMatch(indexHtml, /"pub\.representative":/);
  assert.doesNotMatch(indexHtml, /"pub\.filterRec":/);
  assert.doesNotMatch(indexHtml, /citations\?user=74IhSx8AAAAJ&hl/);
  assert.match(indexHtml, /citations\?user=74IhSx8AAAAJ&amp;hl/);
});

test('CAS Strategic Priority Research Program grant is synchronized across grant surfaces', () => {
  const grantTitle = 'The Strategic Priority Research Program (B) of the Chinese Academy of Sciences';
  const homepageGrant = `2026.08–2029.07, the Strategic Priority Research Program (B) of the Chinese Academy of Sciences`;
  const chineseGrant = '2026.08–2029.07，中国科学院战略性先导科技专项（B类）';
  const homepageGrants = sectionBetween(indexHtml, '<!-- ===== Research Grants ===== -->', '<!-- ===== Related Links ===== -->');
  const awardsGrants = sectionBetween(awardsHtml, '<!-- Research Grants -->', '</div>\n\n  </div>\n</div>');

  assert.match(
    homepageGrants,
    /<li data-i18n="grants\.casPriority">2026\.08–2029\.07, the Strategic Priority Research Program \(B\) of the Chinese Academy of Sciences<\/li>/
  );
  assert.ok(homepageGrants.indexOf(homepageGrant) < homepageGrants.indexOf('2026.01–2028.12'));
  assert.match(indexHtml, /"grants\.casPriority": "2026\.08–2029\.07, the Strategic Priority Research Program \(B\) of the Chinese Academy of Sciences"/);
  assert.ok(indexHtml.includes(`"grants.casPriority": "${chineseGrant}"`));

  assert.match(
    awardsGrants,
    /<span class="grant-period">2026\.08–2029\.07<\/span>\s*<div class="grant-title">The Strategic Priority Research Program \(B\) of the Chinese Academy of Sciences<\/div>/
  );
  assert.ok(awardsGrants.indexOf(grantTitle) < awardsGrants.indexOf('National Natural Science Foundation of China'));
  assert.match(awardsHtml, /\.grant-card\s*\{[\s\S]*?grid-template-columns: 120px 1fr;/);
  assert.match(
    awardsHtml,
    /@media \(max-width: 680px\)[\s\S]*?\.grant-card\s*\{\s*grid-template-columns: 108px 1fr;\s*\}/
  );
});

test('New Generation AI Major Project grant is synchronized across grant surfaces', () => {
  const grantTitle = 'New Generation Artificial Intelligence–National Science and Technology Major Project';
  const homepageGrant = `2026.08–2028.07, ${grantTitle}`;
  const chineseGrant = '2026.08–2028.07，新一代人工智能国家科技重大专项';
  const homepageGrants = sectionBetween(indexHtml, '<!-- ===== Research Grants ===== -->', '<!-- ===== Related Links ===== -->');
  const awardsGrants = sectionBetween(awardsHtml, '<!-- Research Grants -->', '</div>\n\n  </div>\n</div>');

  assert.match(
    homepageGrants,
    /<li data-i18n="grants\.newGenerationAI">2026\.08–2028\.07, New Generation Artificial Intelligence–National Science and Technology Major Project<\/li>/
  );
  assert.ok(homepageGrants.indexOf(homepageGrant) < homepageGrants.indexOf('grants.casPriority'));
  assert.ok(indexHtml.includes(`"grants.newGenerationAI": "${homepageGrant}"`));
  assert.ok(indexHtml.includes(`"grants.newGenerationAI": "${chineseGrant}"`));

  assert.match(
    awardsGrants,
    /<span class="grant-period">2026\.08–2028\.07<\/span>\s*<div class="grant-title">New Generation Artificial Intelligence–National Science and Technology Major Project<\/div>/
  );
  assert.ok(awardsGrants.indexOf(grantTitle) < awardsGrants.indexOf('The Strategic Priority Research Program'));
});

test('complete Publications page keeps the requested preprint order', () => {
  const expectedTitles = [
    'Position: Beyond Model-Centric Prediction — Agentic Time Series Forecasting',
    'CastFSR: A Fast--Slow--Reflect Agentic Reasoning Framework for Context-Aware Time Series Forecasting',
    'CastFlow: Learning Role-Specialized Agentic Workflows for Time Series Forecasting',
    'Cast-R1: Learning Tool-Augmented Sequential Decision Policies for Time Series Forecasting',
    'PaperArena: An Evaluation Benchmark for Tool-Augmented Agentic Reasoning on Scientific Literature',
    'StepPO: Step-Aligned Policy Optimization for Agentic Reinforcement Learning'
  ];
  const preprintSections = [[
    'publications page',
    sectionBetween(
      publicationsHtml,
      '<!-- ===== Preprint ===== -->',
      '<!-- ===== Released Survey ===== -->'
    )
  ]];

  for (const [name, source] of preprintSections) {
    const preprints = source.replace(/<!--[\s\S]*?-->/g, '');
    const entries = [...preprints.matchAll(/<li data-tags="[^"]+">[\s\S]*?<\/li>/g)]
      .map((match) => match[0]);
    const titles = entries.map((entry) => entry.match(/<strong>([^<]+)<\/strong>\. \(Preprint\)/)?.[1] || '');
    const castFsrEntry = entries[1] || '';

    assert.deepEqual(titles, expectedTitles, `${name} preprint order`);
    assert.match(castFsrEntry, /^<li data-tags="timeseries agent llm">/, `${name} tags`);
    assert.match(
      castFsrEntry,
      /Xiaoyu Tao, <strong>Mingyue Cheng<\/strong>, Bokai Pan, Chuang Jiang, Huanjian Zhang, Tian Gao, Yaguo Liu, Qi Liu, Enhong Chen/,
      `${name} authors`
    );
    assert.match(
      castFsrEntry,
      /<strong>CastFSR: A Fast--Slow--Reflect Agentic Reasoning Framework for Context-Aware Time Series Forecasting<\/strong>\. \(Preprint\)/,
      `${name} title`
    );
    assert.match(
      castFsrEntry,
      /\[<a href="https:\/\/arxiv\.org\/abs\/2608\.03031" target="_blank" rel="noopener">ArXiv<\/a>\]/,
      `${name} arXiv link`
    );
    assert.equal(count(castFsrEntry, /https:\/\/arxiv\.org\/abs\/2608\.03031/g), 1, `${name} arXiv link count`);
    assert.equal(count(preprints, /CastFSR:/g), 1, `${name} CastFSR count`);
  }
});

test('PaperScout Findings of EMNLP 2026 acceptance is synchronized on both publication lists', () => {
  const title = 'PaperScout: An Autonomous Agent for Academic Paper Search with Process-Aware Sequence-Level Policy Optimization';
  const authors = 'Tingyue Pan, Jie Ouyang, <strong>Mingyue Cheng</strong>, Qingchuan Li, Zirui Liu, Daoyu Wang, Mingfan Pan, Shuo Yu, Qi Liu';
  const pdf = 'https://arxiv.org/pdf/2601.10029.pdf';
  const homepageSelected = sectionBetween(
    indexHtml,
    '<!-- ===== Selected Publications ===== -->',
    '<!-- ===== Open Source Projects ===== -->'
  );
  const publicationsPreprints = sectionBetween(
    publicationsHtml,
    '<!-- ===== Preprint ===== -->',
    '<!-- ===== Released Survey ===== -->'
  );
  const locations = [
    {
      name: 'homepage',
      entries: [...homepageSelected.matchAll(/<li data-tags="[^"]+">[\s\S]*?<\/li>/g)].map((match) => match[0])
    },
    {
      name: 'publications page',
      entries: [...sectionBetween(publicationsHtml, '<!-- ===== 2026 ===== -->', '<!-- ===== 2025 ===== -->')
        .matchAll(/<li data-tags="[^"]+">[\s\S]*?<\/li>/g)].map((match) => match[0])
    }
  ];

  for (const location of locations) {
    const entry = location.entries.find((candidate) => candidate.includes(title)) || '';
    assert.match(entry, /^<li data-tags="agent llm ai4science">/, `${location.name} tags`);
    assert.equal(entry.includes(authors), true, `${location.name} authors`);
    assert.match(entry, /<em>Findings of EMNLP 2026 Accepted<\/em>\./, `${location.name} status`);
    assert.equal(entry.includes(`href="${pdf}"`), true, `${location.name} PDF`);
    assert.equal(location.entries.filter((candidate) => candidate.includes(title)).length, 1, `${location.name} entry count`);
  }
  assert.equal(publicationsPreprints.includes(title), false, 'publications page stale preprint placement');
});

test('table mining survey shows ACM CSUR acceptance on both publication lists', () => {
  const title = 'A Survey on Table Mining with Large Language Models: Challenges, Advancements and Prospects';

  for (const [name, source] of [
    ['homepage', indexHtml],
    ['publications page', publicationsHtml]
  ]) {
    const entries = [...source.matchAll(/<li data-tags="[^"]+">[\s\S]*?<\/li>/g)].map((match) => match[0]);
    const entry = entries.find((candidate) => candidate.includes(title)) || '';

    assert.match(entry, /<em>ACM Computing Surveys \(ACM CSUR\) Accepted<\/em>\./, `${name} status`);
    assert.doesNotMatch(entry, /\(Preprint\)/, `${name} stale preprint status`);
    assert.equal(entries.filter((candidate) => candidate.includes(title)).length, 1, `${name} entry count`);
  }
});

test('ACM CSUR survey is selected on the homepage and filed in the complete 2026 list', () => {
  const title = 'A Survey on Table Mining with Large Language Models: Challenges, Advancements and Prospects';
  const homepageSelected = sectionBetween(
    indexHtml,
    '<!-- ===== Selected Publications ===== -->',
    '<!-- ===== Open Source Projects ===== -->'
  );
  const releasedSurveys = sectionBetween(
    publicationsHtml,
    '<!-- ===== Released Survey ===== -->',
    '<!-- ===== 2026 ===== -->'
  );
  const publications2026 = sectionBetween(
    publicationsHtml,
    '<!-- ===== 2026 ===== -->',
    '<!-- ===== 2025 ===== -->'
  );

  assert.equal(homepageSelected.includes(title), true, 'homepage representative selection');
  assert.equal(releasedSurveys.includes(title), false, 'publications page released-survey placement');
  assert.equal(publications2026.includes(title), true, 'publications page 2026 placement');
});

test('knowledge-oriented RAG survey leads the complete 2026 publication list', () => {
  const title = 'A Survey on Knowledge-Oriented Retrieval-Augmented Generation';
  const sections = [[
    'publications page',
    sectionBetween(publicationsHtml, '<!-- ===== 2026 ===== -->', '<!-- ===== 2025 ===== -->')
  ]];

  for (const [name, publications2026] of sections) {
    const entries = [...publications2026.matchAll(/<li data-tags="[^"]+">[\s\S]*?<\/li>/g)].map((match) => match[0]);
    const surveyEntry = entries.find((entry) => entry.includes(title)) || '';

    assert.equal(entries[0], surveyEntry, `${name} leading 2026 placement`);
    assert.equal(entries.filter((entry) => entry.includes(title)).length, 1, `${name} entry count`);
  }
});

test('OneCast TKDD acceptance is synchronized in the 2026 publication list', () => {
  const title = 'OneCast: Structured Decomposition and Modular Generation for Cross-Domain Time Series Forecasting';
  const authors = 'Tingyue Pan, <strong>Mingyue Cheng*</strong>, Shilong Zhang, Zhiding Liu, Xiaoyu Tao, Yucong Luo, Jintao Zhang, Qi Liu';
  const status = '<em>ACM Transactions on Knowledge Discovery from Data (ACM TKDD) Accepted</em>.';
  const pdf = 'https://arxiv.org/pdf/2510.24028';
  const homepageSelected = sectionBetween(
    indexHtml,
    '<!-- ===== Selected Publications ===== -->',
    '<!-- ===== Open Source Projects ===== -->'
  );
  const locations = [
    {
      name: 'homepage',
      entries: [...homepageSelected.matchAll(/<li data-tags="[^"]+">[\s\S]*?<\/li>/g)].map((match) => match[0]),
      isCompleteList: false
    },
    {
      name: 'publications page',
      entries: [...sectionBetween(publicationsHtml, '<!-- ===== 2026 ===== -->', '<!-- ===== 2025 ===== -->')
        .matchAll(/<li data-tags="[^"]+">[\s\S]*?<\/li>/g)].map((match) => match[0]),
      isCompleteList: true
    }
  ];

  for (const location of locations) {
    const entry = location.entries.find((candidate) => candidate.includes(title)) || '';

    assert.match(entry, /^<li data-tags="timeseries">/, `${location.name} OneCast tags`);
    assert.equal(entry.includes(authors), true, `${location.name} OneCast authors`);
    assert.equal(entry.includes(status), true, `${location.name} OneCast status`);
    assert.equal(entry.includes(`href="${pdf}"`), true, `${location.name} OneCast PDF`);
    assert.equal(location.entries.filter((candidate) => candidate.includes(title)).length, 1, `${location.name} OneCast count`);
    if (location.isCompleteList) {
      assert.equal(location.entries[2], entry, `${location.name} OneCast third-place ordering`);
    }
  }
});

test('CIKM 2026 Demo Track papers remain at the end of the complete 2026 list', () => {
  const agentR1Title = 'Agent-R1: A Unified and Modular Framework for Agentic Reinforcement Learning';
  const tabClawTitle = 'TabClaw: An Interactive and Self-Evolving Agent for Spreadsheet Manipulation and Table Reasoning';
  const sections = [[
    'publications page',
    sectionBetween(publicationsHtml, '<!-- ===== 2026 ===== -->', '<!-- ===== 2025 ===== -->')
  ]];

  for (const [name, source] of sections) {
    const entries = [...source.matchAll(/<li data-tags="[^"]+">[\s\S]*?<\/li>/g)].map((match) => match[0]);
    const agentR1Entry = entries.find((entry) => entry.includes(agentR1Title)) || '';
    const tabClawEntry = entries.find((entry) => entry.includes(tabClawTitle)) || '';

    assert.equal(entries.at(-2), agentR1Entry, `${name} Agent-R1 ordering`);
    assert.equal(entries.at(-1), tabClawEntry, `${name} TabClaw ordering`);
    assert.match(agentR1Entry, /^<li data-tags="llm agent">/, `${name} Agent-R1 tags`);
    assert.match(
      agentR1Entry,
      /<strong>Mingyue Cheng<\/strong>, Shuo Yu, Daoyu Wang, Qingchuan Li, Xiaoyu Tao, Jie Ouyang, Yucong Luo, Yitong Zhou, Qi Liu\*, Enhong Chen, <strong>Agent-R1: A Unified and Modular Framework for Agentic Reinforcement Learning<\/strong>\. <em>ACM CIKM2026 Demo Track Accepted<\/em>\./,
      `${name} Agent-R1 metadata`
    );
    assert.doesNotMatch(agentR1Entry, /<a\b/, `${name} Agent-R1 links`);

    assert.match(tabClawEntry, /^<li data-tags="table agent llm">/, `${name} TabClaw tags`);
    assert.match(
      tabClawEntry,
      /<strong>Mingyue Cheng<\/strong>, Shuo Yu, Daoyu Wang, Qingchuan Li, Xiaoyu Tao, Qingyang Mao, Yitong Zhou, Qi Liu\*, <strong>TabClaw: An Interactive and Self-Evolving Agent for Spreadsheet Manipulation and Table Reasoning<\/strong>\. <em>ACM CIKM2026 Demo Track Accepted<\/em>\./,
      `${name} TabClaw metadata`
    );
    assert.doesNotMatch(tabClawEntry, /<a\b/, `${name} TabClaw links`);

    assert.equal(count(source, /Agent-R1: A Unified and Modular Framework/g), 1, `${name} Agent-R1 count`);
    assert.equal(count(source, /TabClaw: An Interactive and Self-Evolving Agent/g), 1, `${name} TabClaw count`);
  }
});

test('CIKM 2026 main-track papers are synchronized and removed from Preprint', () => {
  const papers = [
    {
      title: 'Mind2Report: A Cognitive Deep Research Agent for Expert-Level Commercial Report Synthesis',
      authors: '<strong>Mingyue Cheng</strong>, Daoyu Wang, Qi Liu*, Shuo Yu, Xiaoyu Tao, Yuqian Wang, Chengzhong Chu, Yu Duan, Mingkang Long, Enhong Chen',
      tags: 'llm agent',
      pdf: 'https://arxiv.org/pdf/2601.04879',
      code: 'https://github.com/Melmaphother/Mind2Report'
    },
    {
      title: 'Time Series Forecasting as Reasoning: A Slow-Thinking Approach with Reinforced LLMs',
      authors: 'Yitong Zhou, Yucong Luo, <strong>Mingyue Cheng*</strong>, Jiahao Wang, Daoyu Wang, Tingyue Pan, Jintao Zhang, Qi Liu, Enhong Chen',
      tags: 'timeseries agent llm',
      pdf: 'https://arxiv.org/pdf/2506.10630',
      code: 'https://github.com/lqzxt/Time-R1'
    },
    {
      title: 'AlphaCast: A Human Wisdom-LLM Intelligence Co-Reasoning Framework for Interactive Time Series Forecasting',
      authors: 'Xiaohan Zhang, Tian Gao, <strong>Mingyue Cheng*</strong>, Bokai Pan, Ze Guo, Yaguo Liu, Xiaoyu Tao, Qi Liu',
      tags: 'timeseries agent',
      pdf: 'https://arxiv.org/pdf/2511.08947',
      code: 'https://github.com/SkyeGT/AlphaCast_Official'
    }
  ];
  const homepageSelected = sectionBetween(
    indexHtml,
    '<!-- ===== Selected Publications ===== -->',
    '<!-- ===== Open Source Projects ===== -->'
  );
  const locations = [
    {
      name: 'homepage',
      preprints: '',
      publications2026: homepageSelected
    },
    {
      name: 'publications page',
      preprints: sectionBetween(publicationsHtml, '<!-- ===== Preprint ===== -->', '<!-- ===== Released Survey ===== -->'),
      publications2026: sectionBetween(publicationsHtml, '<!-- ===== 2026 ===== -->', '<!-- ===== 2025 ===== -->')
    }
  ];

  for (const location of locations) {
    for (const paper of papers) {
      assert.equal(location.preprints.includes(paper.title), false, `${location.name} stale preprint placement for ${paper.title}`);
      const entries = [...location.publications2026.matchAll(/<li data-tags="[^"]+">[\s\S]*?<\/li>/g)].map((match) => match[0]);
      const entry = entries.find((candidate) => candidate.includes(paper.title)) || '';
      assert.match(entry, new RegExp(`^<li data-tags="${paper.tags}">`), `${location.name} tags for ${paper.title}`);
      assert.equal(entry.includes(paper.authors), true, `${location.name} authors for ${paper.title}`);
      assert.match(entry, /<em>ACM CIKM 2026 Accepted<\/em>\./, `${location.name} status for ${paper.title}`);
      assert.equal(entry.includes(`href="${paper.pdf}"`), true, `${location.name} PDF for ${paper.title}`);
      assert.equal(entry.includes(`href="${paper.code}"`), true, `${location.name} code for ${paper.title}`);
      assert.equal(entries.filter((candidate) => candidate.includes(paper.title)).length, 1, `${location.name} count for ${paper.title}`);
    }
  }
});

test('August 2026 news is synchronized across the homepage and News page', () => {
  const expected = [
    '<strong>[Aug. 2026]</strong> 🎉 Congratulations on our paper <strong>PaperScout</strong> being accepted to <strong>Findings of EMNLP 2026</strong>!',
    '<strong>[Aug. 2026]</strong> 🎉 We are excited to present our tutorial, “<strong>Context-Aware Time Series Forecasting: From Pattern Extrapolation to Cognitive Reasoning</strong>,” at <strong>IEEE ICDM 2026</strong>. See you in <strong>Shenyang</strong>!',
    '<strong>[Aug. 2026]</strong> 🎉 I will serve as the <strong>Publication Chair</strong> for <strong>ICEBE 2026</strong>.',
    '<strong>[Aug. 2026]</strong> 🎉 Congratulations on our papers <strong>Mind2Report</strong>, <strong>Time-R1</strong>, and <strong>AlphaCast</strong> being accepted to <strong>ACM CIKM 2026</strong>!',
    '<strong>[Aug. 2026]</strong> 🎉 Congratulations on our survey <strong>A Survey on Table Mining with Large Language Models: Challenges, Advancements and Prospects</strong> being accepted by <strong>ACM Computing Surveys (ACM CSUR)</strong>!',
    '<strong>[Aug. 2026]</strong> 🎉 Congratulations on our demo papers <strong>Agent-R1</strong> and <strong>TabClaw</strong> being accepted to the <strong>ACM CIKM 2026 Demo Track</strong>!'
  ];
  const homepageNews = sectionBetween(indexHtml, '<ul class="news-list" id="newsList">', '</ul>');
  const newsPage2026 = sectionBetween(
    newsHtml,
    '<div class="news-year-heading">2026</div>',
    '<div class="news-year-heading">2025</div>'
  );
  const homepageEntries = [...homepageNews.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => match[1]);
  const newsPageEntries = [...newsPage2026.matchAll(/<li class="news-item"><span class="news-dot"><\/span><span class="news-body">([\s\S]*?)<\/span><\/li>/g)].map((match) => match[1]);

  assert.deepEqual(homepageEntries.slice(0, 6), expected, 'homepage August news order and copy');
  assert.deepEqual(newsPageEntries.slice(0, 6), expected, 'News page August news order and copy');
  assert.match(homepageEntries[6], /<strong>\[Jul\. 2026\]<\/strong>/, 'homepage resumes with July news');
  assert.match(newsPageEntries[6], /<strong>\[Jul\. 2026\]<\/strong>/, 'News page resumes with July news');
  assert.equal(count(homepageNews, /ACM CIKM 2026 Demo Track/g), 1, 'homepage combined CIKM news count');
  assert.equal(count(newsPage2026, /ACM CIKM 2026 Demo Track/g), 1, 'News page combined CIKM news count');
});
