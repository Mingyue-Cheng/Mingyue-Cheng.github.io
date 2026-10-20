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
const serviceHtml = readFileSync(join(root, 'service.html'), 'utf8');
const count = (source, pattern) => (source.match(pattern) || []).length;

function sectionBetween(source, startMarker, endMarker) {
  const start = source.indexOf(startMarker);
  const end = source.indexOf(endMarker, start + startMarker.length);
  assert.ok(start >= 0, `Missing start marker: ${startMarker}`);
  assert.ok(end > start, `Missing end marker: ${endMarker}`);
  return source.slice(start, end);
}

test('compact Related Links scopes its tighter section spacing', () => {
  const related = sectionBetween(indexHtml, '<!-- ===== Related Links ===== -->', '<!-- ===== Back to Top Button ===== -->');
  const css = sectionBetween(indexHtml, '/* ===== Related Links ===== */', '/* ===== Research Interests ===== */');
  assert.match(related, /<div class="section related-section">/);
  assert.equal(count(indexHtml, /class="section related-section"/g), 1);
  assert.match(css, /\.related-section\s*\{[^}]*padding:\s*16px 0 8px\s*;/);
  assert.match(css, /\.related-section \.section-heading\s*\{[^}]*margin-bottom:\s*8px\s*;/);
});

test('compact Related Links balances six cards across three default columns', () => {
  const css = sectionBetween(indexHtml, '/* ===== Related Links ===== */', '/* ===== Research Interests ===== */');
  const grid = css.match(/\.related-grid\s*\{([^}]*)\}/)?.[1] || '';
  const card = css.match(/\.related-card\s*\{([^}]*)\}/)?.[1] || '';
  assert.match(grid, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)\s*;/);
  assert.match(grid, /gap:\s*8px\s*;/);
  assert.match(card, /gap:\s*10px\s*;/);
  assert.match(card, /padding:\s*10px 12px\s*;/);
  assert.match(card, /border-radius:\s*10px\s*;/);
});

test('compact Related Links keeps readable text and smaller badges without truncation', () => {
  const css = sectionBetween(indexHtml, '/* ===== Related Links ===== */', '/* ===== Research Interests ===== */');
  const name = css.match(/\.related-card-name\s*\{([^}]*)\}/)?.[1] || '';
  const role = css.match(/\.related-card-role\s*\{([^}]*)\}/)?.[1] || '';
  const badge = css.match(/\.related-card-badge\s*\{([^}]*)\}/)?.[1] || '';
  assert.match(name, /font-size:\s*15px\s*;/);
  assert.match(name, /font-weight:\s*700\s*;/);
  assert.match(name, /line-height:\s*1\.35\s*;/);
  assert.match(role, /margin-top:\s*2px\s*;/);
  assert.match(role, /font-size:\s*12px\s*;/);
  assert.match(role, /line-height:\s*1\.45\s*;/);
  assert.match(badge, /padding:\s*3px 7px\s*;/);
  assert.match(badge, /font-size:\s*11px\s*;/);
  assert.match(badge, /line-height:\s*1\.5\s*;/);
  assert.doesNotMatch(css, /(?:line-clamp|text-overflow)\s*:|white-space:\s*nowrap|overflow(?:-[xy])?:\s*(?:hidden|clip)/);
});

test('compact Related Links keeps text and badges in a horizontal card layout', () => {
  const css = sectionBetween(indexHtml, '/* ===== Related Links ===== */', '/* ===== Research Interests ===== */');
  const card = css.match(/\.related-card\s*\{([^}]*)\}/)?.[1] || '';
  const main = css.match(/\.related-card-main\s*\{([^}]*)\}/)?.[1] || '';
  assert.match(card, /display:\s*flex\s*;/);
  assert.match(card, /align-items:\s*center\s*;/);
  assert.match(card, /justify-content:\s*space-between\s*;/);
  assert.match(main, /min-width:\s*0\s*;/);
  assert.doesNotMatch(css, /flex-direction:\s*column\s*;/);
  assert.doesNotMatch(css, /\.related-card-main\s*\{[^}]*width:\s*100%\s*;/);
});

test('compact Related Links provides an explicit keyboard focus outline', () => {
  const css = sectionBetween(indexHtml, '/* ===== Related Links ===== */', '/* ===== Research Interests ===== */');
  const focus = css.match(/\.related-card:focus-visible\s*\{([^}]*)\}/)?.[1] || '';
  assert.match(focus, /outline:\s*2px solid var\(--accent\)\s*;/);
  assert.match(focus, /outline-offset:\s*3px\s*;/);
});

test('compact Related Links changes to two columns at 800px and one at 680px', () => {
  const responsive = sectionBetween(indexHtml, '/* ===== Responsive ===== */', '@media (prefers-reduced-motion: reduce)');
  const tablet = sectionBetween(responsive, '@media (max-width: 800px)', '@media (max-width: 900px)');
  const mobile = sectionBetween(responsive, '@media (max-width: 680px)', '@media (max-width: 900px)');
  assert.ok(responsive.indexOf('@media (max-width: 800px)') < responsive.indexOf('@media (max-width: 900px)'));
  assert.match(tablet, /\.related-grid\s*\{\s*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)\s*;/);
  assert.match(mobile, /\.related-grid\s*\{\s*grid-template-columns:\s*1fr\s*;/);
});

test('Related Links follows the requested person order and preserves profile links', () => {
  const related = sectionBetween(indexHtml, '<!-- ===== Related Links ===== -->', '<!-- ===== Back to Top Button ===== -->');
  const cards = [...related.matchAll(/<a class="related-card" href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g)];
  const names = cards.map(match => match[3].match(/class="related-card-name">([^<]+)<\/div>/)?.[1]);
  assert.deepEqual(names, [
    'Prof. Enhong Chen', 'Prof. Qi Liu', 'Prof. Defu Lian',
    'Prof. Le Wu', 'Prof. Tong Xu', 'Prof. Hongke Zhao'
  ]);
  assert.deepEqual(cards.slice(0, 2).map(match => match[1]), [
    'http://staff.ustc.edu.cn/~cheneh/',
    'http://staff.ustc.edu.cn/~qiliuql/'
  ]);
  const [, href, attributes, body] = cards[2];
  assert.equal(href, 'https://faculty.ustc.edu.cn/liandefu/en/index.htm');
  assert.match(attributes, /target="_blank"/);
  assert.match(attributes, /rel="noopener"/);
  assert.match(body, /class="related-card-role">University of Science and Technology of China<\/div>/);
  assert.match(body, /class="related-card-badge">USTC<\/span>/);
  assert.doesNotMatch(related, /Fajie Yuan|fajieyuan|Westlake University|>WU</);
});

for (const { name, href, role, badge } of [
  {
    name: 'Prof. Le Wu', href: 'https://le-wu.com/',
    role: 'Hefei University of Technology', badge: 'HFUT'
  },
  {
    name: 'Prof. Tong Xu', href: 'http://staff.ustc.edu.cn/~tongxu/',
    role: 'University of Science and Technology of China', badge: 'USTC'
  }
]) {
  test(`Related Links shows the verified profile for ${name}`, () => {
    const related = sectionBetween(indexHtml, '<!-- ===== Related Links ===== -->', '<!-- ===== Back to Top Button ===== -->');
    const cards = [...related.matchAll(/<a class="related-card" href="([^"]+)"([^>]*)>([\s\S]*?)<\/a>/g)];
    const matches = cards.filter(match => match[3].includes(`<div class="related-card-name">${name}</div>`));
    assert.equal(matches.length, 1, `${name} should have exactly one card`);
    const [, actualHref, attributes, body] = matches[0];
    assert.equal(actualHref, href);
    assert.match(attributes, /target="_blank"/);
    assert.match(attributes, /rel="noopener"/);
    assert.ok(body.includes(`<div class="related-card-role">${role}</div>`));
    assert.ok(body.includes(`<span class="related-card-badge">${badge}</span>`));
  });
}

test('removing Zhenya Huang from Related Links preserves publication credits', () => {
  const related = sectionBetween(indexHtml, '<!-- ===== Related Links ===== -->', '<!-- ===== Back to Top Button ===== -->');
  assert.doesNotMatch(related, /Zhenya Huang|~huangzhy\//);
  for (const html of [indexHtml, publicationsHtml]) {
    assert.match(html, /Zhi Li, Zhenya Huang, Enhong Chen, Longfei Li, Jun Zhou, <strong>Empowering Sequential Recommender Systems/);
  }
});

test('replacing a related-person card preserves Fajie Yuan publication credits', () => {
  for (const html of [indexHtml, publicationsHtml]) {
    assert.match(html, /Jie Wang, Fajie Yuan, <strong>Mingyue Cheng<\/strong>, et al\., <strong>TransRec:/);
    assert.match(html, /<strong>Mingyue Cheng<\/strong>, Fajie Yuan<sup>\+<\/sup>, Qi Liu\*, Xin Xin, Enhong Chen/);
  }
});

test('the removed Tencent internship award is absent from both award listings', () => {
  for (const html of [indexHtml, awardsHtml]) {
    assert.doesNotMatch(html, /腾讯科技平台与事业群实习生\s*Mini\s*项目卓越奖/);
  }
  const homepageHonors = sectionBetween(indexHtml, '<!-- ===== Honors ===== -->', '<!-- ===== Professional Activities ===== -->');
  const awardsHonors = sectionBetween(awardsHtml, '<!-- Honors and Awards -->', '<!-- Research Grants -->');
  assert.equal(count(homepageHonors, /<li>/g), 11);
  assert.equal(count(awardsHonors, /class="award-card"/g), 11);
  assert.match(indexHtml, /data-i18n="experience\.tencent">Jun\. 2019 ~ Oct\. 2019, Research Intern/);
});

test('homepage metadata describes the current research portfolio', () => {
  const head = sectionBetween(indexHtml, '<head>', '</head>');

  assert.match(
    head,
    /<link rel="canonical" href="https:\/\/mingyue-cheng\.github\.io\/">/
  );
  assert.match(
    head,
    /<meta name="description" content="[^"]*LLM-driven reasoning and AI agents[^"]*time-series intelligence[^"]*science intelligence[^"]*">/
  );
  assert.match(
    head,
    /<meta property="og:description" content="[^"]*LLM-driven reasoning and AI agents[^"]*science intelligence[^"]*">/
  );
  assert.match(
    head,
    /<meta name="twitter:description" content="[^"]*LLM-driven reasoning and AI agents[^"]*science intelligence[^"]*">/
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

  assert.equal(filterButtons.length, 6);
  for (const button of filterButtons) {
    assert.match(button, /type="button"/);
    assert.match(button, /aria-pressed="(?:true|false)"/);
  }
  assert.match(publications, /data-filter="ai4science"[^>]*>Science Intelligence<\/button>/);
  assert.match(publications, /data-filter="recsys"[^>]*>Recommender Systems<\/button>/);

  const yearToggles = [...publications.matchAll(
    /<button\b(?=[^>]*class="pub-year-toggle")(?=[^>]*aria-expanded="true")(?=[^>]*aria-controls="([^"]+)")[^>]*>/g
  )].map((match) => match[1]);
  assert.deepEqual(yearToggles, [
    'publication-list-preprints',
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
  assert.equal(visibleEntries.length, 72);
  assert.match(publications, /<a\b[^>]*href="publications\.html"[^>]*>View all publications →<\/a>/);
  for (const [key, label] of [
    ['pub.preprint', '📘 Preprint'],
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

test('WebMind and the table-agent project are hidden from both project displays', () => {
  for (const html of [indexHtml, projectsHtml]) {
    const visible = html.replace(/<!--[\s\S]*?-->/g, '');
    assert.doesNotMatch(visible, /<div class="os-card-name">(?:WebMind|TabMind|TabClaw)<\/div>/);
    assert.doesNotMatch(visible, /data-repo="(?:AgentR1\/WebMind|ustc-table-mining\/TabClaw)"/);
    assert.doesNotMatch(visible, /data-(?:page-)?i18n="opensource\.(?:webMind|tabMind|tabClaw)"/);
  }
});

test('hidden WebMind and TabClaw cards remain recoverable without removing academic records', () => {
  const openSource = sectionBetween(
    projectsHtml,
    '<!-- ===== Open Source ===== -->',
    '<!-- ===== Benchmarks & Datasets ===== -->'
  );
  const hiddenCards = [...openSource.matchAll(/<!-- Temporarily hidden: (WebMind|TabClaw) open source project\.([\s\S]*?)-->/g)];
  assert.deepEqual(hiddenCards.map(match => match[1]), ['WebMind', 'TabClaw']);
  for (const [, name, markup] of hiddenCards) {
    assert.ok(markup.includes(`<div class="os-card-name">${name}</div>`));
    assert.match(markup, /class="os-card-desc"/);
    assert.match(markup, /class="os-github"/);
  }
  assert.match(publicationsHtml, /TabClaw: An Interactive and Self-Evolving Agent for Spreadsheet Manipulation and Table Reasoning/);
  assert.match(newsHtml, /<strong>TabClaw<\/strong>/);
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

test('open-source subpage matches shared homepage projects and venue badges', () => {
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
  const subpageOnlyCardNames = ['CastFactory（炼星坊）'];
  const visible = (source) => source.replace(/<!--[\s\S]*?-->/g, '');
  const cardNames = (source) => [...visible(source).matchAll(
    /<div class="os-card-name">([^<]+)<\/div>/g
  )].map((match) => match[1]);
  const sortedCards = (source) => visible(source)
    .split('<div class="os-card">').slice(1)
    .sort((left, right) => cardNames(left)[0].localeCompare(cardNames(right)[0]));
  const sharedSubpageOpenSource = sortedCards(subpageOpenSource)
    .filter((card) => !subpageOnlyCardNames.includes(cardNames(card)[0]))
    .join('<div class="os-card">');
  const sortedHomepageOpenSource = sortedCards(homepageOpenSource).join('<div class="os-card">');
  const normalizedMatches = (source, pattern) => [...visible(source).matchAll(pattern)]
    .map((match) => match[1].replace(/\s+/g, ' ').trim());
  const venueBadges = (source, className) => [...visible(source).matchAll(
    new RegExp(`<span class="${className}">([^<]+)<\\/span>`, 'g')
  )].map((match) => match[1]);

  assert.deepEqual(cardNames(sharedSubpageOpenSource), cardNames(sortedHomepageOpenSource));
  for (const pattern of [
    /<span class="os-year">([^<]+)<\/span>/g,
    /<a\b[^>]*href="([^"]+)"[^>]*>/g,
    /data-repo="([^"]+)"/g,
    /<div class="os-card-desc"[^>]*>([\s\S]*?)<\/div>/g
  ]) {
    assert.deepEqual(
      normalizedMatches(sharedSubpageOpenSource, pattern),
      normalizedMatches(sortedHomepageOpenSource, pattern)
    );
  }
  assert.deepEqual(
    venueBadges(sharedSubpageOpenSource, 'os-venue'),
    venueBadges(sortedHomepageOpenSource, 'os-venue')
  );
  assert.doesNotMatch(visible(subpageOpenSource), /NeoResearch（智多星）/);
  assert.match(
    subpageOpenSource,
    /<!-- Temporarily hidden: NeoResearch open source project\.[\s\S]*?<div class="os-card-name">NeoResearch（智多星）<\/div>[\s\S]*?-->/
  );

  const sortedDatasetCards = (source) => [...visible(source).matchAll(
    /<article class="dataset-card">[\s\S]*?<\/article>/g
  )].map(([card]) => card).sort((left, right) => {
    const name = (card) => normalizedMatches(card, /<span class="dataset-name">([^<]+)<\/span>/g)[0];
    return name(left).localeCompare(name(right));
  }).join('\n');
  const homepageDatasets = sortedDatasetCards(sectionBetween(
    indexHtml,
    '<!-- ===== Datasets ===== -->',
    '<!-- ===== Education ===== -->'
  ));
  const subpageDatasets = sortedDatasetCards(sectionBetween(
    projectsHtml,
    '<!-- ===== Benchmarks & Datasets ===== -->',
    '</main>'
  ));
  assert.deepEqual(
    venueBadges(subpageDatasets, 'dataset-venue'),
    venueBadges(homepageDatasets, 'dataset-venue')
  );
  for (const pattern of [
    /<span class="dataset-name">([^<]+)<\/span>/g,
    /<span class="os-year">([^<]+)<\/span>/g,
    /<a\b[^>]*href="([^"]+)"[^>]*>/g,
    /data-repo="([^"]+)"/g,
    /<div class="dataset-card-desc"[^>]*>([\s\S]*?)<\/div>/g
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
    '<div class="os-card-desc"'
  );
  const tabClawMeta = sectionBetween(
    projectsHtml,
    '<div class="os-card-name">TabClaw</div>',
    '<div class="os-card-desc"'
  );
  const paperScoutMeta = sectionBetween(
    indexHtml,
    '<div class="os-card-name">PaperScout（科言乐问）</div>',
    '<div class="os-card-desc"'
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
  assert.match(indexHtml, /<span class="profile-title" data-i18n="profile\.title">Ph\.D\. &nbsp;·&nbsp; Associate Researcher<\/span>/);
  assert.match(indexHtml, />Professional Experience<\/h2>/);
  assert.match(indexHtml, /Computer Science and Technology, Ph\.D\. degree,/);
  assert.match(indexHtml, /Last updated in September 2026\./);
  assert.match(indexHtml, /最后更新于 2026 年 9 月。/);
  assert.match(indexHtml, /"pub\.filterKnowledge": "Science Intelligence"/);
  assert.match(indexHtml, /"pub\.filterKnowledge": "科学智能"/);
  for (const [key, english, chinese] of [
    ['pub.preprint', '📘 Preprint', '📘 预印本'],
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
  assert.match(indexHtml, /"pub\.filterRec": "Recommender Systems"/);
  assert.match(indexHtml, /"pub\.filterRec": "推荐系统"/);
  assert.doesNotMatch(indexHtml, /citations\?user=74IhSx8AAAAJ&hl/);
  assert.match(indexHtml, /citations\?user=74IhSx8AAAAJ&amp;hl/);
});

for (const [page, html, start, end, headings] of [
  ['homepage', indexHtml, '<!-- ===== Professional Activities ===== -->', '<!-- ===== Research Grants ===== -->', /class="services-label" data-i18n="service\.([^"]+)"/g],
  ['service subpage', serviceHtml, '<div class="service-main">', '</main>', /class="section-heading" data-page-i18n="service\.([^"]+)"/g]
]) {
  test(`${page} places Conference Organization last in professional service`, () => {
    const services = sectionBetween(html, start, end);
    assert.deepEqual([...services.matchAll(headings)].map(match => match[1]), [
      'pc', 'journal', 'organizations', 'conferenceOrganization'
    ]);
    assert.equal(count(services, /data-(?:page-)?i18n="service\.icebePublicationChair"/g), 1);
    const organization = services.slice(services.indexOf('data-' + (page === 'homepage' ? '' : 'page-') + 'i18n="service.conferenceOrganization"'));
    assert.match(organization, /ICEBE/);
    assert.match(organization, /2026/);
    assert.match(organization, />Publication Chair<\/span>/);
  });
}

test('homepage merges ICLR Area Chair into its single program committee entry', () => {
  const services = sectionBetween(indexHtml, '<!-- ===== Professional Activities ===== -->', '<!-- ===== Research Grants ===== -->');
  assert.equal(services.includes('data-i18n="service.areaChair"'), false, 'the separate Area Chair group must be removed');
  assert.equal(count(services, /\(ICLR\)/g), 1, 'ICLR should only appear once in the service list');
  const pc = sectionBetween(services, 'data-i18n="service.pc"', 'data-i18n="service.journal"');
  assert.ok(pc.includes('International Conference on Learning Representations (ICLR): 2025, 2027 (<span data-i18n="service.iclrAreaChair">Area Chair 2027</span>)'));
});

test('service subpage merges ICLR Area Chair into the existing conference row', () => {
  assert.equal(serviceHtml.includes('<!-- Area Chair -->'), false, 'the separate Area Chair block must be removed');
  assert.equal(serviceHtml.includes('data-page-i18n="service.areaChair"'), false);
  assert.equal(count(serviceHtml, /class="venue-abbr">ICLR<\/span>/g), 1, 'ICLR should only appear once');
  const pc = sectionBetween(serviceHtml, '<!-- Program Committee -->', '<!-- Journal Reviewer -->');
  assert.match(pc, /class="venue-abbr">ICLR<\/span>\s*<\/div>\s*<div class="venue-years">2025, 2027<\/div>/);
  assert.match(pc, /class="venue-name">International Conference on Learning Representations <span class="venue-role" data-page-i18n="service\.iclrAreaChair">Area Chair 2027<\/span><\/div>/);
});

const serviceOrder = [
  'KDD', 'TheWebConf', 'WSDM', 'CIKM', 'ICDM', 'ICML', 'ICLR', 'NeurIPS',
  'ACL', 'EMNLP', 'AAAI', 'SIGSPATIAL', 'IJCAI', 'SDM', 'DASFAA'
];

test('homepage conference service follows the requested order with remaining entries last', () => {
  const pc = sectionBetween(indexHtml, 'data-i18n="service.pc"', 'data-i18n="service.journal"');
  const order = [...pc.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => {
    if (match[1].includes('IEEE Task Force on Data-Efficient Agentic Learning')) return 'IEEE DEAL';
    if (match[1].includes('IEEE Task Force on AI for Time Series')) return 'IEEE TF';
    return match[1].match(/\(([^)]+)\)/)?.[1];
  });
  assert.deepEqual(order, serviceOrder);
});

test('service subpage conference order matches the homepage', () => {
  const pc = sectionBetween(serviceHtml, '<!-- Program Committee -->', '<!-- Journal Reviewer -->');
  const order = [...pc.matchAll(/class="venue-abbr">([^<]+)<\/span>/g)].map((match) => match[1]);
  assert.deepEqual(order, serviceOrder);
});

test('new ICDM and EMNLP service entries do not invent reviewing years', () => {
  const homepagePc = sectionBetween(indexHtml, 'data-i18n="service.pc"', 'data-i18n="service.journal"');
  const servicePc = sectionBetween(serviceHtml, '<!-- Program Committee -->', '<!-- Journal Reviewer -->');
  for (const [abbr, fullName] of [
    ['ICDM', 'IEEE International Conference on Data Mining'],
    ['EMNLP', 'Conference on Empirical Methods in Natural Language Processing']
  ]) {
    assert.ok(homepagePc.includes(`<li>${fullName} (${abbr})</li>`));
    assert.ok(servicePc.includes(`<span class="venue-abbr">${abbr}</span>\n          </div>\n          <div class="venue-years"></div>\n          <div class="venue-name">${fullName}</div>`));
  }
});

test('homepage groups the four academic organization appointments outside conference reviewing', () => {
  const pc = sectionBetween(indexHtml, 'data-i18n="service.pc"', 'data-i18n="service.journal"');
  assert.doesNotMatch(pc, /IEEE Task Force|service\.(?:ccfAipr|cipsIr)/);
  const organizations = sectionBetween(indexHtml, '<!-- Academic Organizations -->', '\n    </div>');
  assert.match(organizations, /class="services-label" data-i18n="service.organizations">Academic Organization Service<\/div>/);
  assert.equal(count(organizations, /<li\b/g), 4);
  assert.deepEqual([...organizations.matchAll(/data-i18n="service\.(ieeeDeal|ieeeAi4tst|ccfAipr|cipsIr)"/g)].map((match) => match[1]), ['ieeeDeal', 'ieeeAi4tst', 'ccfAipr', 'cipsIr']);
  assert.match(organizations, /href="https:\/\/cis\.taskforce\.ieee\.org\/ai4tst\/"[^>]*data-i18n="service.ieeeAi4tst"/);
});

test('service subpage groups IEEE, CCF and CIPS in a separate academic organization section', () => {
  const pc = sectionBetween(serviceHtml, '<!-- Program Committee -->', '<!-- Journal Reviewer -->');
  assert.doesNotMatch(pc, /IEEE Task Force|service\.(?:ccfAipr|cipsIr)/);
  const organizations = sectionBetween(serviceHtml, '<!-- Academic Organizations -->', '\n    </div>');
  assert.match(organizations, /class="section-heading" data-page-i18n="service.organizations">Academic Organization Service<\/h2>/);
  assert.deepEqual([...organizations.matchAll(/class="venue-abbr">([^<]+)<\/span>/g)].map((match) => match[1]), ['IEEE DEAL', 'IEEE TF', 'CCF', 'CIPS']);
  assert.deepEqual([...organizations.matchAll(/data-page-i18n="service\.(ieeeDeal|ieeeAi4tst|ccfAipr|cipsIr)"/g)].map((match) => match[1]), ['ieeeDeal', 'ieeeAi4tst', 'ccfAipr', 'cipsIr']);
  assert.match(organizations, /href="https:\/\/cis\.taskforce\.ieee\.org\/ai4tst\/"[^>]*data-page-i18n="service.ieeeAi4tst"/);
  assert.doesNotMatch(organizations, /class="venue-years"/, 'no appointment dates were supplied');
});

for (const [abbr, fullName, years] of [
  ['TheWebConf', 'ACM International World Wide Web Conference', '2024, 2025, 2026, 2027'],
  ['WSDM', 'International Conference on Web Search and Data Mining', '2025, 2027'],
  ['AAAI', 'AAAI Conference on Artificial Intelligence', '2026, 2027'],
  ['ICLR', 'International Conference on Learning Representations', '2025, 2027']
]) {
  test(`${abbr} 2027 conference service is synchronized without duplicate records or lost earlier years`, () => {
    const homepagePc = sectionBetween(indexHtml, 'data-i18n="service.pc"', 'data-i18n="service.journal"');
    const entries = [...homepagePc.matchAll(/<li>([\s\S]*?)<\/li>/g)]
      .map((match) => match[1]).filter((entry) => entry.includes(`(${abbr})`));
    const roleKey = { ICLR: 'iclrAreaChair', TheWebConf: 'wwwAreaChair' }[abbr];
    const role = roleKey ? ` (<span data-i18n="service.${roleKey}">Area Chair 2027</span>)` : '';
    assert.deepEqual(entries, [`${fullName} (${abbr}): ${years}${role}`]);
    const servicePc = sectionBetween(serviceHtml, '<!-- Program Committee -->', '<!-- Journal Reviewer -->');
    const record = new RegExp(`class="venue-abbr">${abbr}<\\/span>\\s*<\\/div>\\s*<div class="venue-years">([^<]+)<\\/div>`, 'g');
    assert.deepEqual([...servicePc.matchAll(record)].map((match) => match[1]), [years]);
    if (roleKey) {
      assert.ok(servicePc.includes(`<div class="venue-name">${fullName} <span class="venue-role" data-page-i18n="service.${roleKey}">Area Chair 2027</span></div>`));
    }
  });
}

test('homepage lists Science China Information Sciences once under journal reviewing', () => {
  const journals = sectionBetween(indexHtml, 'data-i18n="service.journal"', '<!-- ===== Research Grants ===== -->')
    .replace(/<!--[\s\S]*?-->/g, '');
  assert.equal(count(journals, /<li>Science China Information Sciences \(SCIS\)<\/li>/g), 1);
});

test('service page lists Science China Information Sciences once under journal reviewing', () => {
  const journals = sectionBetween(serviceHtml, '<!-- Journal Reviewer -->', '</main>')
    .replace(/<!--[\s\S]*?-->/g, '');
  assert.equal(count(journals, /<span class="journal-name">Science China Information Sciences \(SCIS\)<\/span>/g), 1);
});

const updatedGrants = [
  {
    key: 'casPriority', period: '2026.07–2029.06',
    english: 'Chinese Academy of Sciences Strategic Priority Research Program for Basic and Interdisciplinary Frontier Research (Category B); Mechanisms and Methods for Autonomous Interactive Learning in Large Models; Project Lead',
    chinese: '中国科学院基础与交叉前沿科研先导专项（B类），大模型自主交互学习机制及方法，项目负责人',
  },
  {
    key: 'newGenerationAI', period: '2026.08–2028.07',
    english: 'New-Generation Artificial Intelligence National Science and Technology Major Project; Scientific Data Governance Toolchain and Datasets — Chemistry; Core Project Member',
    chinese: '新一代人工智能国家科技重大专项，科学数据治理工具链与数据集-化学领域，项目骨干',
  },
  {
    key: 'nsfc', period: '2026.01–2028.12',
    english: 'National Natural Science Foundation of China — Young Scientists Fund (Category C); Cross-Domain Context-Aware Time Series Representation Learning and Forecasting; Project Lead',
    chinese: '国家自然科学基金青年科学基金C类，跨域情境感知的时间序列表征学习及预测方法，项目负责人',
  },
  {
    key: 'ustcYouth', period: '2027.01–2028.12',
    english: 'USTC Youth Innovation Fund Project; Multi-Turn Interactive Learning and Continual Evolution for Large-Model Agents: Methods and Applications; Project Lead',
    chinese: '中国科学技术大学青年创新基金项目，大模型智能体多轮交互学习与持续进化方法研究及应用，项目负责人',
  },
  {
    key: 'ustc', period: '2025.01–2026.12',
    english: 'USTC New Medicine Joint Fund Cultivation Project (Double First-Class Discipline Development Special Program); Time Series Modeling Methods and Applications Using Perioperative Physiological Data; Project Lead',
    chinese: '中国科学技术大学新医学联合基金培育项目（双一流学科建设专项），基于围术期生理数据的时序建模方法及应用研究，项目负责人',
  },
  {
    key: 'anhui', period: '2024.09–2026.08',
    english: 'Anhui Provincial Natural Science Foundation; Table Semantic Understanding and Reasoning for Scientific Literature; Project Lead',
    chinese: '安徽省自然科学基金，面向科技文献的表格语义理解与推理研究，项目负责人',
  },
];

for (const [index, grant] of updatedGrants.entries()) {
  test(`${grant.key} grant details are synchronized across homepage languages and Awards`, () => {
    const homepageGrants = sectionBetween(indexHtml, '<!-- ===== Research Grants ===== -->', '<!-- ===== Related Links ===== -->');
    const english = `${grant.period}, ${grant.english}`;
    const chinese = `${grant.period}，${grant.chinese}`;
    assert.ok(homepageGrants.includes(`<li data-i18n="grants.${grant.key}">${english}</li>`), 'Homepage fallback has the full project details');
    assert.ok(indexHtml.includes(`"grants.${grant.key}": "${english}"`), 'English dictionary matches fallback');
    assert.ok(indexHtml.includes(`"grants.${grant.key}": "${chinese}"`), 'Chinese dictionary preserves the supplied project details');
    const cards = [...awardsHtml.matchAll(/<div class="grant-card">[\s\S]*?<div class="grant-title"[^>]*>[\s\S]*?<\/div>\s*<\/div>/g)].map(match => match[0]);
    assert.ok(cards[index]?.includes(`<span class="grant-period">${grant.period}</span>`), 'Awards period and order match');
    assert.ok(cards[index]?.includes(`>${grant.english}</div>`), 'Awards includes full English details');
  });
}

test('grant cards retain their responsive layout after the content update', () => {
  assert.match(awardsHtml, /\.grant-card\s*\{[\s\S]*?grid-template-columns: 120px 1fr;/);
  assert.match(
    awardsHtml,
    /@media \(max-width: 680px\)[\s\S]*?\.grant-card\s*\{\s*grid-template-columns: 108px 1fr;\s*\}/
  );
});

test('complete Publications page keeps the requested preprint order', () => {
  const expectedTitles = [
    'Position: Beyond Model-Centric Prediction — Agentic Time Series Forecasting',
    'CastFSR: A Fast--Slow--Reflect Agentic Reasoning Framework for Context-Aware Time Series Forecasting',
    'CastFlow: Learning Role-Specialized Agentic Workflows for Time Series Forecasting',
    'Cast-R1: Learning Tool-Augmented Sequential Decision Policies for Time Series Forecasting',
    'PaperArena: An Evaluation Benchmark for Tool-Augmented Agentic Reasoning on Scientific Literature',
    'StepPO: Step-Aligned Policy Optimization for Agentic Reinforcement Learning',
    'A Comprehensive Survey of the LLM-Based Agent: The Contextual Cognition Perspective'
  ];
  const preprintSections = [[
    'publications page',
    sectionBetween(
      publicationsHtml,
      '<!-- ===== Preprint ===== -->',
      '<!-- ===== 2026 ===== -->'
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
    '<!-- ===== 2026 ===== -->'
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
  const preprints = sectionBetween(
    publicationsHtml,
    '<!-- ===== Preprint ===== -->',
    '<!-- ===== 2026 ===== -->'
  );
  const publications2026 = sectionBetween(
    publicationsHtml,
    '<!-- ===== 2026 ===== -->',
    '<!-- ===== 2025 ===== -->'
  );

  assert.equal(homepageSelected.includes(title), true, 'homepage representative selection');
  assert.equal(preprints.includes(title), false, 'publications page stale preprint placement');
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
      assert.equal(location.entries[3], entry, `${location.name} OneCast follows the three accepted surveys`);
    }
  }
});

const icdmDemoPapers = [
  {
    name: 'CastClaw',
    title: 'CastClaw: A Human-in-the-Loop Autonomous Agent for Interactive Time Series Forecasting',
    authors: 'Xiaoyu Tao, <strong>Mingyue Cheng</strong>, Ze Guo, Bokai Pan, Qi Liu, Shijin Wang, Enhong Chen',
    tags: 'timeseries agent llm',
    code: 'https://github.com/ustc-time-series/CastClaw',
  },
  {
    name: 'AgentWorld',
    title: 'AgentWorld: A Data Factory for Training LLM Agents from Multi-Turn Interactions',
    authors: 'Daoyu Wang, <strong>Mingyue Cheng</strong>, Qingchuan Li, Shuo Yu, Jie Ouyang, Qi Liu, Enhong Chen',
    tags: 'llm agent',
    code: 'https://github.com/AgentR1/Claw-R1',
  },
];

for (const paper of icdmDemoPapers) {
  test(`${paper.name} ICDM 2026 Demo Track acceptance matches the supplied author order on both lists`, () => {
    const expected = `<li data-tags="${paper.tags}">${paper.authors}, <strong>${paper.title}</strong>. <em>IEEE ICDM 2026 Demo Track Accepted</em>. [<a href="${paper.code}" target="_blank" rel="noopener">Code</a>]</li>`;
    for (const [name, source] of [['homepage', indexHtml], ['publications', publicationsHtml]]) {
      const year = sectionBetween(source, '<!-- ===== 2026 ===== -->', '<!-- ===== 2025 ===== -->').replace(/<!--[\s\S]*?-->/g, '');
      const entries = [...year.matchAll(/<li data-tags="[^"]+">[\s\S]*?<\/li>/g)].map(match => match[0]);
      assert.deepEqual(entries.filter(entry => entry.includes(`<strong>${paper.title}</strong>`)), [expected], `${name}: exact authors, title, acceptance, tags, and existing code link`);
      const preprints = sectionBetween(source, '<!-- ===== Preprint ===== -->', '<!-- ===== 2026 ===== -->');
      assert.ok(!preprints.includes(paper.title), `${name}: no accepted paper duplicated under preprints`);
    }
  });
}

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
      preprints: sectionBetween(publicationsHtml, '<!-- ===== Preprint ===== -->', '<!-- ===== 2026 ===== -->'),
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

test('October 2026 WWW Area Chair announcement leads both news surfaces once', () => {
  const expected = '<strong>[Oct. 2026]</strong> 🎉 I will serve as an <strong>Area Chair (AC)</strong> for <strong>The Web Conference 2027 (WWW 2027)</strong>.';
  const homepageNews = sectionBetween(indexHtml, '<ul class="news-list" id="newsList">', '</ul>');
  const newsPage2026 = sectionBetween(newsHtml, '<div class="news-year-heading">2026</div>', '<div class="news-year-heading">2025</div>');
  const lists = [
    [...homepageNews.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => match[1]),
    [...newsPage2026.matchAll(/<span class="news-body">([\s\S]*?)<\/span>/g)].map(match => match[1]),
  ];
  for (const entries of lists) {
    assert.equal(entries[0], expected);
    assert.equal(entries.filter(entry => entry === expected).length, 1);
  }
});

test('September 2026 ICDM demo acceptance follows the latest WWW Area Chair announcement', () => {
  const expected = '<strong>[Sep. 2026]</strong> 🎉 Congratulations on our demo papers <strong>CastClaw</strong> and <strong>AgentWorld</strong> being accepted to the <strong>IEEE ICDM 2026 Demo Track</strong>!';
  const homepageNews = sectionBetween(indexHtml, '<ul class="news-list" id="newsList">', '</ul>');
  const newsPage2026 = sectionBetween(newsHtml, '<div class="news-year-heading">2026</div>', '<div class="news-year-heading">2025</div>');
  const lists = [
    [...homepageNews.matchAll(/<li>([\s\S]*?)<\/li>/g)].map(match => match[1]),
    [...newsPage2026.matchAll(/<span class="news-body">([\s\S]*?)<\/span>/g)].map(match => match[1]),
  ];
  for (const entries of lists) {
    assert.equal(entries[1], expected);
    assert.equal(entries.filter(entry => entry === expected).length, 1);
  }
});

test('September 2026 TKDE survey acceptance follows the latest ICDM demo news', () => {
  const expected = '<strong>[Sep. 2026]</strong> 🎉 Congratulations on our survey <strong>A Comprehensive Survey of Time Series Forecasting: Concepts, Challenges, and Future Directions</strong> being accepted by <strong>IEEE Transactions on Knowledge and Data Engineering (IEEE TKDE)</strong>!';
  const homepageNews = sectionBetween(indexHtml, '<ul class="news-list" id="newsList">', '</ul>');
  const newsPage2026 = sectionBetween(newsHtml, '<div class="news-year-heading">2026</div>', '<div class="news-year-heading">2025</div>');
  const homepageEntries = [...homepageNews.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((match) => match[1]);
  const newsPageEntries = [...newsPage2026.matchAll(/<span class="news-body">([\s\S]*?)<\/span>/g)].map((match) => match[1]);
  for (const entries of [homepageEntries, newsPageEntries]) {
    assert.equal(entries[2], expected);
    assert.equal(entries.filter((entry) => entry === expected).length, 1);
  }
  assert.ok(newsHtml.includes('<strong>[Apr. 2025]</strong> 📄 We preprinted a new survey: <strong>A Comprehensive Survey of Time Series Forecasting</strong>'), 'Keep the historical preprint announcement');
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

  for (const entries of [homepageEntries, newsPageEntries]) {
    const augustStart = entries.findIndex((entry) => entry.startsWith('<strong>[Aug. 2026]</strong>'));
    assert.ok(augustStart >= 0, 'August news remains present');
    assert.deepEqual(entries.slice(augustStart, augustStart + 6), expected, 'August news order and copy');
    assert.match(entries[augustStart + 6], /<strong>\[Jul\. 2026\]<\/strong>/, 'July news follows August');
  }
  assert.equal(count(homepageNews, /ACM CIKM 2026 Demo Track/g), 1, 'homepage combined CIKM news count');
  assert.equal(count(newsPage2026, /ACM CIKM 2026 Demo Track/g), 1, 'News page combined CIKM news count');
});
