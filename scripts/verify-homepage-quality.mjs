import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const newsHtml = readFileSync(join(root, 'news.html'), 'utf8');
const publicationsHtml = readFileSync(join(root, 'publications.html'), 'utf8');
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
});

test('publication filters and year groups expose native control state', () => {
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
  assert.match(publications, /data-filter="recsys"[^>]*>Recommender Systems<\/button>/);
  assert.match(publications, /data-filter="ai4science"[^>]*>AI for Science<\/button>/);

  const yearToggles = [...publications.matchAll(
    /<button type="button" class="pub-year-toggle" aria-expanded="true" aria-controls="([^"]+)">/g
  )].map((match) => match[1]);
  assert.equal(yearToggles.length, 6);
  assert.equal(new Set(yearToggles).size, yearToggles.length);
  for (const controlledId of yearToggles) {
    assert.match(publications, new RegExp(`<ol class="pub-list" id="${controlledId}">`));
  }

  assert.match(indexHtml, /document\.querySelectorAll\('\.pub-year-toggle'\)/);
  assert.match(
    indexHtml,
    /toggle\.setAttribute\('aria-expanded', String\(!collapsed\)\);/
  );
  assert.match(
    indexHtml,
    /button\.setAttribute\('aria-pressed', String\(button === btn\)\);/
  );
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
  assert.match(indexHtml, /"pub\.filterRec": "Recommender Systems"/);
  assert.match(indexHtml, /"pub\.filterKnowledge": "AI for Science"/);
  assert.match(indexHtml, /"pub\.filterRec": "推荐系统"/);
  assert.match(indexHtml, /"pub\.filterKnowledge": "科学智能"/);
  assert.doesNotMatch(indexHtml, /citations\?user=74IhSx8AAAAJ&hl/);
  assert.match(indexHtml, /citations\?user=74IhSx8AAAAJ&amp;hl/);
});

test('Preprints follow the requested synchronized paper order', () => {
  const expectedTitles = [
    'Position: Beyond Model-Centric Prediction — Agentic Time Series Forecasting',
    'CastFSR: A Fast--Slow--Reflect Agentic Reasoning Framework for Context-Aware Time Series Forecasting',
    'CastFlow: Learning Role-Specialized Agentic Workflows for Time Series Forecasting',
    'Cast-R1: Learning Tool-Augmented Sequential Decision Policies for Time Series Forecasting',
    'PaperScout: An Autonomous Agent for Academic Paper Search with Process-Aware Sequence-Level Policy Optimization',
    'PaperArena: An Evaluation Benchmark for Tool-Augmented Agentic Reasoning on Scientific Literature',
    'StepPO: Step-Aligned Policy Optimization for Agentic Reinforcement Learning'
  ];
  const preprintSections = [
    ['homepage', sectionBetween(
      indexHtml,
      '<ol class="pub-list" id="publication-list-preprints">',
      '</ol>'
    )],
    ['publications page', sectionBetween(
      publicationsHtml,
      '<!-- ===== Preprint ===== -->',
      '<!-- ===== Released Survey ===== -->'
    )]
  ];

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

test('ACM CSUR survey is filed as the leading 2026 publication on both pages', () => {
  const title = 'A Survey on Table Mining with Large Language Models: Challenges, Advancements and Prospects';
  const locations = [
    ['homepage',
      sectionBetween(indexHtml, '<ol class="pub-list" id="publication-list-surveys">', '</ol>'),
      sectionBetween(indexHtml, '<ol class="pub-list" id="publication-list-2026">', '</ol>')],
    ['publications page',
      sectionBetween(publicationsHtml, '<!-- ===== Released Survey ===== -->', '<!-- ===== 2026 ===== -->'),
      sectionBetween(publicationsHtml, '<!-- ===== 2026 ===== -->', '<!-- ===== 2025 ===== -->')]
  ];

  for (const [name, releasedSurveys, publications2026] of locations) {
    const first2026Entry = publications2026.match(/<li data-tags="[^"]+">[\s\S]*?<\/li>/)?.[0] || '';

    assert.equal(releasedSurveys.includes(title), false, `${name} released-survey placement`);
    assert.equal(publications2026.includes(title), true, `${name} 2026 placement`);
    assert.equal(first2026Entry.includes(title), true, `${name} leading 2026 placement`);
  }
});

test('CIKM 2026 Demo Track papers are synchronized after the leading CSUR entry', () => {
  const agentR1Title = 'Agent-R1: A Unified and Modular Framework for Agentic Reinforcement Learning';
  const tabClawTitle = 'TabClaw: An Interactive and Self-Evolving Agent for Spreadsheet Manipulation and Table Reasoning';
  const sections = [
    ['homepage', sectionBetween(indexHtml, '<ol class="pub-list" id="publication-list-2026">', '</ol>')],
    ['publications page', sectionBetween(publicationsHtml, '<!-- ===== 2026 ===== -->', '<!-- ===== 2025 ===== -->')]
  ];

  for (const [name, source] of sections) {
    const entries = [...source.matchAll(/<li data-tags="[^"]+">[\s\S]*?<\/li>/g)].map((match) => match[0]);
    const agentR1Entry = entries.find((entry) => entry.includes(agentR1Title)) || '';
    const tabClawEntry = entries.find((entry) => entry.includes(tabClawTitle)) || '';

    assert.equal(entries[1], agentR1Entry, `${name} Agent-R1 ordering`);
    assert.equal(entries[2], tabClawEntry, `${name} TabClaw ordering`);
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
      authors: '<strong>Mingyue Cheng</strong>, Daoyu Wang, Qi Liu, Shuo Yu, Xiaoyu Tao, Yuqian Wang, Chengzhong Chu, Yu Duan, Mingkang Long, Enhong Chen',
      tags: 'llm agent',
      pdf: 'https://arxiv.org/pdf/2601.04879',
      code: 'https://github.com/Melmaphother/Mind2Report'
    },
    {
      title: 'Time Series Forecasting as Reasoning: A Slow-Thinking Approach with Reinforced LLMs',
      authors: 'Yitong Zhou, Yucong Luo, <strong>Mingyue Cheng*</strong>, Jiahao Wang, Daoyu Wang, Tingyue Pan, Jintao Zhang, Qi Liu, Enhong Chen',
      tags: 'timeseries agent llm',
      pdf: 'https://www.arxiv.org/pdf/2508.09191',
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
  const locations = [
    {
      name: 'homepage',
      preprints: sectionBetween(indexHtml, '<ol class="pub-list" id="publication-list-preprints">', '</ol>'),
      publications2026: sectionBetween(indexHtml, '<ol class="pub-list" id="publication-list-2026">', '</ol>')
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

test('August 2026 acceptance news is synchronized across the homepage and News page', () => {
  const expected = [
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

  assert.deepEqual(homepageEntries.slice(0, 3), expected, 'homepage acceptance news order and copy');
  assert.deepEqual(newsPageEntries.slice(0, 3), expected, 'News page acceptance news order and copy');
  assert.match(homepageEntries[3], /<strong>\[Jul\. 2026\]<\/strong>/, 'homepage resumes with July news');
  assert.match(newsPageEntries[3], /<strong>\[Jul\. 2026\]<\/strong>/, 'News page resumes with July news');
  assert.equal(count(homepageNews, /ACM CIKM 2026 Demo Track/g), 1, 'homepage combined CIKM news count');
  assert.equal(count(newsPage2026, /ACM CIKM 2026 Demo Track/g), 1, 'News page combined CIKM news count');
});
