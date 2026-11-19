import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const read = (file) => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8');
const home = read('index.html');
const sharedScript = read('files/assets/site-language.js');
const plain = (html) => html.replace(/<[^>]*>/g, '').replaceAll('&amp;', '&').replaceAll('&nbsp;', ' ').replace(/\s+/g, ' ').trim();
const active = (html) => html.replace(/<!--[\s\S]*?-->/g, '');
const literal = home.match(/const i18n = (\{[\s\S]*?\n\});\n\nlet currentLang/)?.[1];
const homeCopy = vm.runInNewContext(`(${literal})`);
const sharedLiteral = sharedScript.match(/const translations = (\{[\s\S]*?\n  \});\n\n  const navTargets/)?.[1];
const sharedCopy = vm.runInNewContext(`(${sharedLiteral})`);
const homepageProjectLabels = {
  en: {
    'opensource.category.timeseries': 'Time Series Mining（Context-aware Prediction Intelligence）',
    'opensource.category.ai4ai': 'AI for AI',
    'opensource.category.science': 'AI for Science（Scientific Tool and Knowledge）',
    'opensource.name.castClaw': 'CastClaw',
    'opensource.name.paperScout': 'PaperScout'
  },
  zh: {
    'opensource.category.timeseries': '时序数据挖掘（情境感知预测智能）',
    'opensource.category.ai4ai': 'AI for AI',
    'opensource.category.science': 'AI for Science（Scientific Tool and Knowledge）',
    'opensource.name.castClaw': 'CastClaw（星辰）',
    'opensource.name.paperScout': 'PaperScout（科言乐问）'
  }
};
const pages = ['index.html', 'research.html', 'news.html', 'publications.html', 'projects.html', 'awards.html', 'service.html', 'resources.html', 'prediction-intelligence.html'];
const publicationFilters = [
  ['all', 'filterAll', 'All', '全部'],
  ['llm', 'filterReasoning', 'Cognitive Reasoning', '认知推理'],
  ['agent', 'filterAgent', 'Agentic AI', '智能体'],
  ['timeseries', 'filterTime', 'Time Series Mining', '时序数据挖掘'],
  ['table', 'filterTable', 'Tabular Data Mining', '表格数据挖掘'],
  ['ai4ds', 'filterDataScience', 'AI for AI', 'AI for AI'],
  ['ai4science', 'filterKnowledge', 'AI for Science', '科学智能'],
  ['recsys', 'filterRec', 'Recommender Systems', '推荐系统']
];
const introEn = 'My research focuses on cognitive intelligence: enabling machines to understand, reason, and interact. I study LLM agents and autonomous learning as general intelligent mechanisms, with time-series and structured data and scientific literature and tools as core research objects. Autonomous interactive learning, continual adaptation, and human–AI collaboration support long-term capability development.';
const introZh = '我的研究面向认知智能，致力于让机器能理解、会思考、可交互。以大模型智能体与自主学习为通用智能机制，以时序与结构化数据、科技文献与科学工具为核心研究对象，通过自主交互学习、持续适应与人机协同，促进智能系统认知能力的长期提升。';
const homepageScienceDirectionCopy = {
  en: 'Focusing on scientific literature retrieval, multimodal document understanding, and knowledge extraction from text, figures, and tables, with an emphasis on cross-paper knowledge integration and literature-grounded reasoning to support scientific discovery.',
  zh: '聚焦科技文献检索、多模态文献理解与文本、图表中的知识抽取，重点研究跨文献知识整合与文献证据驱动推理，支撑科学知识发现。'
};
const organizationCopy = {
  en: {
    organizations: 'Academic Organization Service',
    ieeeDeal: 'IEEE Task Force on Data-Efficient Agentic Learning (DEAL)',
    ieeeAi4tst: 'IEEE Task Force on AI for Time Series and Spatio-Temporal Data',
    ccfAipr: 'Technical Committee on Artificial Intelligence and Pattern Recognition, China Computer Federation (CCF) — Executive Committee Member',
    cipsIr: 'Information Retrieval Technical Committee, Chinese Information Processing Society of China (CIPS) — Corresponding Member'
  },
  zh: {
    organizations: '学术组织任职',
    ieeeDeal: 'IEEE 数据高效智能体学习工作组（DEAL）',
    ieeeAi4tst: 'IEEE 时间序列与时空数据人工智能工作组（AI4TST）',
    ccfAipr: '中国计算机学会人工智能与模式识别专业委员会 — 执行委员',
    cipsIr: '中国中文信息学会信息检索专业委员会 — 通讯委员'
  }
};

function keyedMarkup(html, attribute, key) {
  const escaped = key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const match = active(html).match(new RegExp(`<([a-z][\\w-]*)\\b[^>]*\\b${attribute}="${escaped}"[^>]*>([\\s\\S]*?)<\\/\\1>`));
  assert.ok(match, `Missing ${attribute}="${key}"`);
  return match[2];
}

for (const lang of ['en', 'zh']) {
  test(`${lang}: November GeoMind and WSDM announcements match the homepage and the News page`, () => {
    const geoMindKey = 'news.geomindKdd2027';
    const expectedGeoMind = lang === 'en'
      ? '<strong>[Nov. 2026]</strong> 🎉 Congratulations on our paper <strong>GeoMind</strong> being accepted to the <strong>ACM SIGKDD 2027 Research Track (August Cycle)</strong>!'
      : '<strong>[2026 年 11 月]</strong> 🎉 祝贺我们的论文 <strong>GeoMind</strong> 被 <strong>ACM SIGKDD 2027 研究轨（8 月轮次）</strong> 录用！';
    assert.equal(homeCopy[lang][geoMindKey], expectedGeoMind);
    assert.equal(sharedCopy[lang].pages['news.html'].content[geoMindKey], expectedGeoMind);
    assert.equal(keyedMarkup(home, 'data-i18n', geoMindKey), homeCopy.en[geoMindKey]);
    assert.equal(keyedMarkup(read('news.html'), 'data-page-i18n', geoMindKey), homeCopy.en[geoMindKey]);
    const historicalGeoMind = sharedCopy[lang].pages['news.html'].content['news.geomindPreprint'];
    assert.match(historicalGeoMind, lang === 'en' ? /\[Apr\. 2026\]/ : /\[2026 年 4 月\]/);
    assert.match(historicalGeoMind, lang === 'en' ? /preprint/ : /预印本/);
    assert.ok(historicalGeoMind.includes('https://arxiv.org/abs/2604.21501'));
    assert.equal(keyedMarkup(read('news.html'), 'data-page-i18n', 'news.geomindPreprint'), sharedCopy.en.pages['news.html'].content['news.geomindPreprint']);
    const key = 'news.wsdm2027Papers';
    const announcement = homeCopy[lang][key];
    assert.equal(sharedCopy[lang].pages['news.html'].content[key], announcement);
    assert.equal(keyedMarkup(home, 'data-i18n', key), homeCopy.en[key]);
    assert.equal(keyedMarkup(read('news.html'), 'data-page-i18n', key), homeCopy.en[key]);
    const text = plain(announcement);
    assert.match(text, lang === 'en' ? /\[Nov\. 2026\]/ : /\[2026\s*年\s*11\s*月\]/);
    assert.match(text, /WSDM\s*2027/);
    assert.match(text, lang === 'en' ? /accepted/i : /录用|接收/);
    assert.match(text, /One Forecast, One World|AdaCast/);
    assert.match(text, /PaperArena/);
    assert.match(text, /SheetCompass/);
  });

  test(`${lang}: ICML 2027 Area Chair news is synchronized and translatable on both news surfaces`, () => {
    const key = 'news.icml2027AC';
    const expected = lang === 'en'
      ? '<strong>[Oct. 2026]</strong> 🎉 I will serve as an <strong>Area Chair (AC)</strong> for <strong>ICML 2027</strong>.'
      : '<strong>[2026 年 10 月]</strong> 🎉 我即将担任 <strong>ICML 2027</strong> 的<strong>领域主席（Area Chair，AC）</strong>。';
    assert.equal(homeCopy[lang][key], expected);
    assert.equal(sharedCopy[lang].pages['news.html'].content?.[key], expected);
    assert.equal(keyedMarkup(home, 'data-i18n', key), homeCopy.en[key]);
    assert.equal(keyedMarkup(read('news.html'), 'data-page-i18n', key), homeCopy.en[key]);
  });

  test(`${lang}: project navigation and section titles use the requested display name`, () => {
    const expected = lang === 'en' ? 'Open Project' : '开源项目';
    assert.equal(homeCopy[lang]['nav.opensource'], expected);
    assert.equal(homeCopy[lang]['opensource.heading'], expected);
    assert.equal(sharedCopy[lang].nav.projects, expected);
    assert.equal(sharedCopy[lang].pages['projects.html'].content['opensource.heading'], expected);
    if (lang === 'en') assert.equal(sharedCopy[lang].pages['projects.html'].title, 'Open Project & Benchmarks');
  });

  test(`${lang}: time-series project and dataset categories use their requested labels`, () => {
    for (const key of ['opensource.category.timeseries', 'datasets.category.timeseries']) {
      const expected = homepageProjectLabels[lang][key]
        || `${lang === 'en' ? 'Time Series Mining' : '时序数据挖掘'}（Context-aware Prediction Intelligence）`;
      assert.equal(homeCopy[lang][key], expected, `Homepage ${key}`);
      assert.equal(sharedCopy[lang].pages['projects.html'].content[key], expected, `Projects ${key}`);
    }
  });

  test(`${lang}: Research retains its contact note without the removed collections`, () => {
    const research = read('research.html');
    const notes = [...research.matchAll(/<div class="research-note-box" id="research-contact-note">([\s\S]*?)<\/div>/g)];
    assert.equal(notes.length, 1, 'Research contact fallback must exist exactly once');
    assert.equal((research.match(/<div class="research-note-box"/g) || []).length, 1);
    assert.equal(plain(notes[0][1]), plain(sharedCopy.en.pages['research.html'].join));
    assert.equal(sharedCopy[lang].pages['research.html'].collections, undefined);
    assert.doesNotMatch(research, /Research collections:|href="https:\/\/(?:agentr1|ustc-time-series|ustcagi-sci)\.github\.io\/"/);
  });

  test(`${lang}: homepage direction cards retain their identities and introduction states cognitive intelligence`, () => {
    const homeScience = plain(homeCopy[lang]['research.science']);
    assert.equal(homeScience.includes('SciToken'), false);
    assert.equal(homeScience.includes('SciTime'), false);

    const homeTimeseries = plain(homeCopy[lang]['research.timeseries']);
    assert.equal(homeTimeseries.includes('SciTime'), false);
    assert.equal(homeTimeseries.includes('SciToken'), false);
    const intro = plain(homeCopy[lang]['research.intro']);
    assert.match(intro, lang === 'en' ? /cognitive intelligence/ : /认知智能/);
    assert.match(intro, lang === 'en' ? /scientific literature,? and tools/ : /科技文献与科学工具/);
  });

  test(`${lang}: homepage literature mining keeps a concise scientific-literature focus`, () => {
    const body = plain(homeCopy[lang]['research.science']);
    assert.match(body, lang === 'en' ? /scientific literature/i : /科技文献/);
    assert.match(body, lang === 'en' ? /knowledge|reasoning/i : /知识|推理/);
    assert.ok(body.length < (lang === 'en' ? 400 : 180), 'Homepage direction is a summary');
  });

  test(`${lang}: science project and dataset headings use their requested labels on both pages`, () => {
    const projectLabel = homepageProjectLabels[lang]['opensource.category.science'];
    assert.equal(homeCopy[lang]['opensource.category.science'], projectLabel);
    assert.equal(sharedCopy[lang].pages['projects.html'].content['opensource.category.science'], projectLabel);
    const expected = lang === 'en'
      ? 'AI for Science（Scientific Tool and Knowledge）'
      : '科学智能（科学工具与知识）';
    assert.equal(homeCopy[lang]['datasets.category.science'], expected);
    assert.equal(sharedCopy[lang].pages['projects.html'].content['datasets.category.science'], expected);
  });

  test(`${lang}: full academic organization names and appointments remain on the service page`, () => {
    for (const [suffix, value] of Object.entries(organizationCopy[lang])) {
      const key = `service.${suffix}`;
      assert.equal(sharedCopy[lang].pages['service.html'].content?.[key], value, key);
      keyedMarkup(read('service.html'), 'data-page-i18n', key);
    }
  });

  test(`${lang}: the full service page preserves all three 2027 Area Chair appointments`, () => {
    const expected = lang === 'en' ? 'Area Chair 2027' : '领域主席 2027';
    for (const key of ['service.icmlAreaChair', 'service.iclrAreaChair', 'service.wwwAreaChair']) {
      assert.equal(sharedCopy[lang].pages['service.html'].content?.[key], expected, key);
      keyedMarkup(read('service.html'), 'data-page-i18n', key);
    }
  });

  test(`${lang}: homepage introduction remains concise and distinct from the full Research page`, () => {
    const intro = plain(homeCopy[lang]['research.intro']);
    assert.match(intro, lang === 'en' ? /cognitive intelligence/i : /认知智能/);
    assert.ok(intro.length < (lang === 'en' ? 450 : 200));
    assert.equal(plain(keyedMarkup(home, 'data-i18n', 'research.intro')), plain(homeCopy.en['research.intro']));
  });

  test(`${lang}: Research directions and recruitment preserve their identities and destinations`, () => {
    const research = sharedCopy[lang].pages['research.html'];
    const hrefs = (html) => [...html.matchAll(/href="([^"]+)"/g)].map(match => match[1]);
    assert.deepEqual(hrefs(research.join), hrefs(homeCopy[lang]['research.join']));
    for (const key of ['agent', 'timeseries', 'science']) {
      assert.equal(typeof homeCopy[lang][`research.${key}`], 'string');
    }
    assert.equal(plain(homeCopy[lang]['research.applications']), lang === 'en'
      ? 'Application Areas: Prediction Intelligence (time series forecasting for decision support and user behavior prediction for personalized recommendations), AI for AI (enhancing LLM capabilities and continual agent evolution), and AI for Science (autonomous scientific research and AI for chemistry).'
      : '应用方向：预测智能（面向智能决策的时序预测、面向个性化推荐的用户行为预测）、AI for AI（大模型能力增强与智能体持续进化）、AI for Science（自主科研与化学智能）。');
    const researchDirections = ['forecasting', 'ai', 'science'].map((prefix) => plain(research.scenarios[`${prefix}Title`]));
    for (const [index, phrase] of ['Prediction Intelligence', 'AI for AI', 'AI for Science'].entries()) assert.ok(researchDirections[index].includes(phrase), phrase);
    assert.equal(research.scenarios.applicationsSummary, undefined);
    assert.equal(research.scenarios.relationsIntro, undefined);
  });

  test(`${lang}: common navigation and footer labels match the homepage`, () => {
    const aliases = { logo: 'logo', research: 'research', news: 'news', publications: 'publications', projects: 'opensource', awards: 'award', service: 'service', resources: 'resources' };
    for (const [key, alias] of Object.entries(aliases)) {
      assert.equal(sharedCopy[lang].nav[key], homeCopy[lang][`nav.${alias}`], key);
    }
    assert.equal(sharedCopy[lang].common.footer, homeCopy[lang]['footer.bottom']);
  });

  test(`${lang}: publication filters use the homepage taxonomy after language changes`, () => {
    const content = sharedCopy[lang].pages['publications.html'].content || {};
    for (const suffix of ['filterAll', 'filterReasoning', 'filterAgent', 'filterTime', 'filterTable', 'filterDataScience', 'filterKnowledge', 'filterRec', 'note', 'preprint', 'year2027', 'year2026', 'year2025', 'year2024', 'legacy']) {
      const normalizeYear = (value) => suffix === 'legacy' ? value.replace(' 年', '') : value;
      assert.equal(normalizeYear(content[`pub.${suffix}`]), normalizeYear(homeCopy[lang][`pub.${suffix}`]), suffix);
      keyedMarkup(read('publications.html'), 'data-page-i18n', `pub.${suffix}`);
    }
  });

  test(`${lang}: publication filter labels match the requested seven-category taxonomy`, () => {
    for (const [, suffix, english, chinese] of publicationFilters) {
      const expected = lang === 'en' ? english : chinese;
      assert.equal(homeCopy[lang][`pub.${suffix}`], expected);
      assert.equal(sharedCopy[lang].pages['publications.html'].content[`pub.${suffix}`], expected);
    }
  });

  test(`${lang}: project categories agree while homepage summaries remain shorter than full descriptions`, () => {
    const content = sharedCopy[lang].pages['projects.html'].content || {};
    for (const key of Object.keys(homeCopy[lang]).filter((key) => /^(?:opensource|datasets)\.category\./.test(key) || ['datasets.castWorldKicker', 'datasets.scholarQuestKicker'].includes(key))) {
      assert.equal(content[key], homeCopy[lang][key], key);
      keyedMarkup(read('projects.html'), 'data-page-i18n', key);
    }
    for (const key of ['opensource.agentR1', 'opensource.agentWorld', 'opensource.alphaCast', 'opensource.castFsr', 'opensource.adaCast', 'opensource.castMind', 'opensource.castClaw', 'opensource.neoResearch', 'opensource.paperScout', 'opensource.academicSearch', 'datasets.world2ts', 'datasets.castWorld', 'datasets.paperArena', 'datasets.scholarQuest', 'datasets.chemTable', 'datasets.kuaiSearch', 'datasets.hoh']) {
      const summary = plain(homeCopy[lang][key]);
      assert.ok(summary.length > 10, key);
      assert.ok(summary.length < plain(content[key]).length, `${key} is summarized only on the homepage`);
      assert.equal(plain(keyedMarkup(home, 'data-i18n', key)), plain(homeCopy.en[key]));
    }
  });
}

test('both publication surfaces expose All and seven ordered matching filters', () => {
  const expected = publicationFilters.map(([filter, suffix, english]) => [filter, `pub.${suffix}`, english]);
  for (const path of ['index.html', 'publications.html']) {
    const buttons = [...active(read(path)).matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)]
      .filter(match => /\bclass="pub-filter-btn(?:\s[^"]*)?"/.test(match[1]))
      .map(match => [
        match[1].match(/\bdata-filter="([^"]+)"/)?.[1],
        match[1].match(/\bdata-(?:page-)?i18n="([^"]+)"/)?.[1],
        plain(match[2])
      ]);
    assert.deepEqual(buttons, expected, path);
  }
});

test('project fallback headings and navigation consistently show Open Project', () => {
  for (const path of pages) {
    const nav = active(read(path)).match(/<a href="projects\.html"[^>]*>([^<]+)<\/a>/);
    assert.ok(nav, `${path} must retain the projects link`);
    assert.equal(nav[1], 'Open Project', path);
  }
  assert.equal(plain(keyedMarkup(home, 'data-i18n', 'opensource.heading')), 'Open Project');
  const projectHeadings = [...active(read('projects.html')).matchAll(/data-page-i18n="opensource.heading">([^<]+)</g)];
  assert.equal(projectHeadings.length, 2);
  for (const match of projectHeadings) assert.equal(match[1], 'Open Project');
});

test('time-series category fallback headings use their requested labels on both pages', () => {
  for (const [path, attribute] of [['index.html', 'data-i18n'], ['projects.html', 'data-page-i18n']]) {
    for (const key of ['opensource.category.timeseries', 'datasets.category.timeseries']) {
      const expected = homepageProjectLabels.en[key]
        || 'Time Series Mining（Context-aware Prediction Intelligence）';
      assert.equal(plain(keyedMarkup(read(path), attribute, key)), expected, `${path}/${key}`);
    }
  }
});

test('homepage language switching preserves the requested project labels and distinct dataset category', () => {
  const translate = home.match(/function translatePage\(lang\) \{[\s\S]*?\n\}\n\nfunction initLanguageToggle/)?.[0]
    .replace(/\n\nfunction initLanguageToggle$/, '');
  assert.ok(translate, 'Homepage translation function must exist');
  const elements = [...Object.keys(homepageProjectLabels.en), 'datasets.category.timeseries'].map(key => ({
    innerHTML: keyedMarkup(home, 'data-i18n', key),
    getAttribute: name => name === 'data-i18n' ? key : null
  }));
  const document = {
    documentElement: { lang: 'en' },
    querySelectorAll: selector => selector === '[data-i18n]' ? elements : [],
    getElementById: () => null
  };
  const context = vm.createContext({ document });
  vm.runInContext(`const i18n = ${literal}; ${translate}`, context);
  for (const lang of ['en', 'zh', 'en']) {
    vm.runInContext(`translatePage('${lang}');`, context);
    assert.equal(document.documentElement.lang, lang === 'zh' ? 'zh-CN' : 'en');
    for (const element of elements) {
      const key = element.getAttribute('data-i18n');
      const expected = homepageProjectLabels[lang][key]
        || `${lang === 'en' ? 'Time Series Mining' : '时序数据挖掘'}（Context-aware Prediction Intelligence）`;
      assert.equal(element.innerHTML, expected, key);
    }
  }
});

test('homepage literature mining and Research directions match their own English runtime translations', () => {
  const homepageDirection = keyedMarkup(home, 'data-i18n', 'research.science');
  assert.equal(homepageDirection, homeCopy.en['research.science']);
  const research = read('research.html');
  for (const prefix of ['forecasting', 'ai', 'science']) {
    for (const suffix of ['Title', 'Body', 'Role']) {
      const key = `${prefix}${suffix}`;
      assert.equal(plain(keyedMarkup(research, 'data-page-i18n', key)), plain(sharedCopy.en.pages['research.html'].scenarios[key]), key);
    }
  }
});

test('PaperScout uses its English homepage title while the projects page retains its Chinese name', () => {
  for (const path of ['index.html', 'projects.html']) {
    const names = [...active(read(path)).matchAll(/<div class="os-card-name"[^>]*>([\s\S]*?)<\/div>/g)].map((match) => plain(match[1]));
    assert.deepEqual(names.filter((name) => name.startsWith('PaperScout')), [path === 'index.html' ? 'PaperScout' : 'PaperScout（科言乐问）'], path);
  }
  assert.equal(keyedMarkup(home, 'data-i18n', 'opensource.name.paperScout'), homepageProjectLabels.en['opensource.name.paperScout']);
});

test('CastClaw keeps its project name and bilingual human–AI collaboration descriptions', () => {
  const expected = 'CastClaw（星辰）';
  for (const [path, attribute] of [['index.html', 'data-i18n'], ['projects.html', 'data-page-i18n']]) {
    const html = active(read(path));
    const names = [...html.matchAll(/<div class="os-card-name"[^>]*>([\s\S]*?)<\/div>/g)].map((match) => plain(match[1]));
    assert.deepEqual(names.filter((name) => name.startsWith('CastClaw')), [path === 'index.html' ? 'CastClaw' : expected], path);
    assert.ok(plain(keyedMarkup(html, attribute, 'opensource.castClaw')).length > 20, path);
    for (const href of ['https://github.com/ustc-time-series/CastClaw', 'https://ustc-time-series.github.io/cast-claw/', 'https://ustc-time-series.github.io/cast-claw/docs/']) {
      assert.ok(html.includes(`href="${href}"`), `${path} must retain ${href}`);
    }
  }
  assert.equal(keyedMarkup(home, 'data-i18n', 'opensource.name.castClaw'), homepageProjectLabels.en['opensource.name.castClaw']);
  for (const lang of ['en', 'zh']) {
    const copy = homeCopy[lang]['opensource.castClaw'];
    assert.ok(plain(copy).length > 20, `${lang} concise homepage description`);
    const fullCopy = plain(sharedCopy[lang].pages['projects.html'].content['opensource.castClaw']);
    assert.ok(fullCopy.startsWith(expected), `${lang} full projects description`);
    for (const description of [plain(copy), fullCopy]) {
      assert.match(description, lang === 'en' ? /human[–-]AI collaboration/i : /人机协同/);
    }
  }
});

test('homepage and news archive use the current CastClaw Chinese name', () => {
  for (const [path, expectedCount] of [['index.html', 1], ['news.html', 3]]) {
    const html = active(read(path)).replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    assert.equal((html.match(/<strong>CastClaw（星辰）<\/strong>/g) || []).length, expectedCount, path);
    assert.equal(html.includes('观星阁'), false, `${path} must not display the former name`);
  }
});

test('science project and dataset fallback headings use their requested labels on both pages', () => {
  for (const [key, expected] of [
    ['opensource.category.science', homepageProjectLabels.en['opensource.category.science']],
    ['datasets.category.science', 'AI for Science（Scientific Tool and Knowledge）']
  ]) {
    assert.equal(plain(keyedMarkup(home, 'data-i18n', key)), expected);
    assert.equal(plain(keyedMarkup(read('projects.html'), 'data-page-i18n', key)), expected);
  }
});

test('academic organization fallback text matches the full service archive translations', () => {
  for (const [suffix, expected] of Object.entries(organizationCopy.en)) {
    assert.equal(plain(keyedMarkup(read('service.html'), 'data-page-i18n', `service.${suffix}`)), expected);
  }
});

test('default homepage markup and metadata no longer describe the superseded research positioning', () => {
  assert.equal(plain(keyedMarkup(home, 'data-i18n', 'research.intro')), plain(homeCopy.en['research.intro']));
  for (const path of ['index.html', 'publications.html']) {
    const html = read(path);
    for (const match of html.matchAll(/<meta (?:name|property)="(?:description|og:description|twitter:description)" content="([^"]+)"/g)) {
      assert.match(match[1], /LLM-driven reasoning and AI agents/, path);
    }
  }
  assert.equal((home.match(/data-i18n="profile.thesis"/g) || []).length, 1, 'the hero has one compact cognitive-intelligence summary');
});

test('Research replaces its former applications with three named directions', () => {
  const research = active(read('research.html'));
  assert.doesNotMatch(research, /<article class="scenario-card/);
  for (const label of ['Prediction Intelligence', 'AI for AI', 'AI for Science']) assert.ok(research.includes(label), label);
  assert.doesNotMatch(research, /Personalized Intelligence|Research collections|research-relations-heading|research-scenario-heading/);
});

test('complete project and dataset pages use the homepage categories without dropping archive entries', () => {
  const projects = active(read('projects.html'));
  for (const [attribute, expected] of [['data-os-category', ['agents', 'timeseries', 'ai4ai', 'science']], ['data-dataset-category', ['timeseries', 'science', 'retrieval']]]) {
    const values = (html) => [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))].map((match) => match[1]);
    assert.deepEqual(values(projects), expected);
    assert.deepEqual(values(active(home)), expected);
  }
  const names = [...projects.matchAll(/<div class="os-card-name">([\s\S]*?)<\/div>/g)].map((match) => plain(match[1]));
  assert.deepEqual(names, ['Agent-R1', 'AgentWorld', 'AlphaCast', 'CastFSR', 'AdaCast', 'CastMind（星思）', 'CastClaw（星辰）', 'CastFactory（炼星坊）', 'NeoResearch', 'PaperScout（科言乐问）', 'Academic Search']);
  for (const source of [active(home), projects]) {
    const datasetNames = html => [...html.matchAll(/<span class="dataset-name">([^<]+)<\/span>/g)].map(match => match[1]);
    assert.deepEqual(datasetNames(source), ['World2TS', 'CastWorld', 'PaperArena', 'ScholarQuest', 'ChemTable', 'KuaiSearch', 'HoH']);
    const timeseries = source.match(/<section\b[^>]*data-dataset-category="timeseries"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(timeseries, 'Time-series datasets retain their category');
    assert.deepEqual(datasetNames(timeseries), ['World2TS', 'CastWorld']);
    const card = [...timeseries.matchAll(/<article class="dataset-card">[\s\S]*?<\/article>/g)][1]?.[0];
    assert.ok(card, 'CastWorld follows World2TS as its own dataset card');
    assert.match(card, /<span class="os-year">2026\.11<\/span>/);
    assert.deepEqual([...card.matchAll(/href="([^"]+)"/g)].map(match => match[1]).sort(), [
      'https://arxiv.org/abs/2611.15262',
      'https://castworld-bench.github.io/',
      'https://github.com/CastWorld-Bench/CastWorld',
      'https://github.com/CastWorld-Bench/CastWorld/blob/main/docs/AB_DATA.md'
    ].sort());
    const science = source.match(/<section\b[^>]*data-dataset-category="science"[^>]*>([\s\S]*?)<\/section>/)?.[1];
    assert.ok(science, 'Science datasets retain their category');
    assert.deepEqual(datasetNames(science), ['PaperArena', 'ScholarQuest', 'ChemTable']);
    const scholarQuest = [...science.matchAll(/<article class="dataset-card">[\s\S]*?<\/article>/g)][1]?.[0];
    assert.ok(scholarQuest, 'ScholarQuest follows PaperArena as its own dataset card');
    assert.match(scholarQuest, /<span class="os-year">2026\.06<\/span>/);
    assert.match(scholarQuest, /href="https:\/\/arxiv\.org\/abs\/2606\.20235"/);
  }
});

test('English hero fallbacks agree with the shared runtime translations', () => {
  for (const path of ['research.html', 'news.html', 'projects.html', 'awards.html', 'service.html', 'resources.html']) {
    const html = read(path);
    const page = sharedCopy.en.pages[path];
    assert.equal(plain(html.match(/class="page-hero-title"[^>]*>([\s\S]*?)<\//)?.[1] || ''), plain(page.title), path);
    assert.equal(plain(html.match(/<p class="page-hero-sub"[^>]*>([\s\S]*?)<\/p>/)?.[1] || ''), plain(page.subtitle), path);
  }
});

test('Research updates its own footer while public pages retain shared-asset versions', () => {
  for (const path of pages) {
    const html = active(read(path));
    const updatedDay = path === 'research.html' ? 14 : 7;
    assert.ok(html.includes(`© 2026 Mingyue Cheng. Last updated on November ${updatedDay}, 2026.`), path);
    assert.match(html, /site-theme\.css\?v=20260917-consistency/, path);
    assert.match(html, /site-content\.css\?v=20261107-concise/, path);
    if (path !== 'index.html') {
      const versions = { 'research.html': '20261119-prediction-intelligence', 'news.html': '20261114-geomind', 'projects.html': '20261119-agentworld', 'publications.html': '20261119-ai-for-ai-filter' };
      const version = versions[path] ?? '20261107-concise';
      assert.ok(html.includes(`site-language.js?v=${version}`), path);
    }
  }
});

test('shared styles own both application-card surfaces and standard page heroes', () => {
  const css = read('files/assets/site-content.css');
  for (const suffix of ['.scenario-card', '.scenario-card-header', '.scenario-card-icon', '.scenario-card-title', '.scenario-card-body', '.scenario-card-topics', '.scenario-card-topics span']) {
    assert.ok(css.includes(`.research-section ${suffix},\n.research-main ${suffix} {`), `${suffix} must have one shared declaration block`);
  }
  const theme = read('files/assets/site-theme.css');
  for (const suffix of ['', '-title', '-sub']) {
    assert.ok(theme.includes(`html .page-hero${suffix},\nhtml .pub-hero${suffix} {`), `Shared hero ${suffix}`);
  }
});

// Execute the actual shared script against text nodes used by each real page.
// Storage and DOM are the only doubles; translation logic is never mocked.
for (const path of ['research.html', 'projects.html', 'publications.html', 'service.html']) {
  test(`${path}: saved language and round-trip switching update all bound content`, () => {
    for (const initialLang of ['en', 'zh']) {
      const elements = [...active(read(path)).matchAll(/<([a-z][\w-]*)\b[^>]*data-page-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)].map((match) => ({
        key: match[2], innerHTML: match[3], getAttribute(name) { return name === 'data-page-i18n' ? this.key : null; }
      }));
      assert.ok(elements.length > 0, `${path} needs content bindings`);
      const footer = { textContent: '' };
      const subtitle = { textContent: '' };
      const toggle = { attributes: {}, setAttribute(key, value) { this.attributes[key] = value; }, addEventListener(type, callback) { if (type === 'click') this.click = callback; } };
      const storage = new Map([['homepage-language', initialLang]]);
      const document = {
        readyState: 'complete', documentElement: { lang: 'en' },
        querySelector(selector) {
          if (selector === '.page-hero-sub') return subtitle;
          if (selector === '.footer-bottom') return footer;
          return null;
        },
        querySelectorAll(selector) {
          if (selector === '[data-page-i18n]') return elements;
          if (selector === '.footer-bottom') return [footer];
          return [];
        },
        getElementById(id) { return id === 'languageToggle' ? toggle : null; }
      };
      vm.runInNewContext(sharedScript, { document, window: { location: { pathname: `/${path}` } }, localStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value) } });
      for (const lang of [initialLang, initialLang === 'en' ? 'zh' : 'en', initialLang]) {
        if (document.documentElement.lang !== (lang === 'zh' ? 'zh-CN' : 'en')) toggle.click();
        const page = sharedCopy[lang].pages[path];
        const dictionary = { ...page.scenarios, ...page.content };
        for (const element of elements) {
          assert.ok(dictionary[element.key], `${path}/${lang}/${element.key} needs a translation`);
          assert.equal(element.innerHTML, dictionary[element.key], `${path}/${lang}/${element.key}`);
        }
        const expectedFooter = path === 'research.html'
          ? (lang === 'en' ? '© 2026 Mingyue Cheng. Last updated on November 14, 2026.' : '© 2026 程明月。最后更新于 2026 年 11 月 14 日。')
          : homeCopy[lang]['footer.bottom'];
        assert.equal(footer.textContent, expectedFooter);
        if (path !== 'publications.html') assert.equal(subtitle.textContent, page.subtitle);
      }
    }
  });
}
