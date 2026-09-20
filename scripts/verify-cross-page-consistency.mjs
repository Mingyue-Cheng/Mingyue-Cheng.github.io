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
const pages = ['index.html', 'research.html', 'news.html', 'publications.html', 'projects.html', 'awards.html', 'service.html', 'resources.html', 'prediction-intelligence.html'];
const introEn = 'My research centers on LLM-driven reasoning and AI agents, with a focus on context-aware reasoning, autonomous interactive, and continual learning and adaptation. This work is motivated by complex tasks in time-series intelligence and science intelligence (scientific knowledge and tool mining). These application-driven directions are framed by 科言 SciToken — understanding the scientific world, and 科语 SciTime — modeling the dynamic world.';
const introZh = '以大模型推理与智能体为核心研究方向，聚焦情境感知推理、自主交互学习、持续学习与适应，以时序智能和科学智能（科学知识与工具挖掘）中的复杂任务为应用牵引。其中，以“科言 SciToken：理解科学世界”和“科语 SciTime：建模动态世界”凝练科学智能与时序智能两条应用牵引方向。';
const scienceDirectionCopy = {
  en: '科言 SciToken — Understanding the scientific world. Focusing on scientific data, scientific tools, scientific knowledge, and capability enhancement of scientific foundation models.',
  zh: '科言 SciToken：理解科学世界。重点研究科学数据、科学工具、科学知识与科学基础模型能力增强等。'
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
  test(`${lang}: SciToken and SciTime retain their distinct research identities`, () => {
    const research = sharedCopy[lang].pages['research.html'];
    const science = lang === 'en'
      ? '科言 SciToken — Understanding the scientific world.'
      : '科言 SciToken：理解科学世界。';
    const timeseries = lang === 'en'
      ? '科语 SciTime — Modeling the dynamic world.'
      : '科语 SciTime：建模动态世界。';
    for (const [key, bodyKey, tagline, otherBrand] of [
      ['science', 'scienceIntelligenceBody', science, 'SciTime'],
      ['timeseries', 'timeseriesBody', timeseries, 'SciToken']
    ]) {
      const homeBody = plain(homeCopy[lang][`research.${key}`]);
      const researchBody = plain(research.scenarios[bodyKey]);
      assert.ok(homeBody.includes(tagline), `${key} homepage direction needs its brand positioning`);
      assert.ok(researchBody.startsWith(tagline), `${key} Research direction needs its brand positioning`);
      assert.equal(homeBody.includes(otherBrand), false, `${key} must not use the other parent brand`);
      assert.equal(researchBody.includes(otherBrand), false, `${bodyKey} must not use the other parent brand`);
    }
    for (const intro of [plain(homeCopy[lang]['research.intro']), research.subtitle]) {
      assert.ok(intro.includes('科言 SciToken'));
      assert.ok(intro.includes('科语 SciTime'));
    }
    assert.doesNotMatch(research.scenarios.agentBody, /SciToken|SciTime/);
  });

  test(`${lang}: Science Intelligence covers all four research focuses on both pages`, () => {
    const homepageDirection = homeCopy[lang]['research.science'];
    assert.ok(homepageDirection, 'Homepage needs a Science Intelligence direction');
    const body = homepageDirection.replace(/^<span class="research-label">[\s\S]*?<\/span>\s*/, '');
    const research = sharedCopy[lang].pages['research.html'].scenarios;
    assert.equal(plain(body), scienceDirectionCopy[lang]);
    assert.equal(plain(research.scienceIntelligenceBody || ''), scienceDirectionCopy[lang]);
    assert.equal(research.scienceIntelligenceTitle, lang === 'en' ? 'Science Intelligence' : '科学智能');
  });

  test(`${lang}: science dataset headings include Scientific Tool and Knowledge on both pages`, () => {
    const expected = lang === 'en'
      ? 'Science Intelligence（Scientific Tool and Knowledge）'
      : '科学智能（科学工具与知识）';
    assert.equal(homeCopy[lang]['datasets.category.science'], expected);
    assert.equal(sharedCopy[lang].pages['projects.html'].content['datasets.category.science'], expected);
  });

  test(`${lang}: academic organization names and appointments agree across both service surfaces`, () => {
    const expected = {
      ...organizationCopy[lang],
      pc: lang === 'en' ? 'Program Committee Member' : '程序委员会委员',
      journal: lang === 'en' ? 'Journal Reviewer' : '期刊审稿人'
    };
    for (const [suffix, value] of Object.entries(expected)) {
      const key = `service.${suffix}`;
      assert.equal(homeCopy[lang][key], value, key);
      assert.equal(sharedCopy[lang].pages['service.html'].content?.[key], value, key);
      keyedMarkup(home, 'data-i18n', key);
      keyedMarkup(read('service.html'), 'data-page-i18n', key);
    }
  });

  test(`${lang}: inline ICLR Area Chair role agrees between homepage and service page`, () => {
    const expected = lang === 'en' ? 'Area Chair 2027' : '领域主席 2027';
    assert.equal(homeCopy[lang]['service.iclrAreaChair'], expected);
    assert.equal(sharedCopy[lang].pages['service.html'].content?.['service.iclrAreaChair'], expected);
    assert.equal(homeCopy[lang]['service.areaChair'], undefined);
    assert.equal(sharedCopy[lang].pages['service.html'].content?.['service.areaChair'], undefined);
    keyedMarkup(home, 'data-i18n', 'service.iclrAreaChair');
    keyedMarkup(read('service.html'), 'data-page-i18n', 'service.iclrAreaChair');
  });

  test(`${lang}: homepage and Research share the latest introduction`, () => {
    const expected = lang === 'en' ? introEn : introZh;
    assert.equal(plain(homeCopy[lang]['research.intro']), expected);
    assert.equal(sharedCopy[lang].pages['research.html'].subtitle, expected);
  });

  test(`${lang}: duplicated research directions, applications, and recruitment agree`, () => {
    const research = sharedCopy[lang].pages['research.html'];
    for (const key of ['scenarioIntro', 'scienceTitle', 'scienceBody', 'scienceTopics', 'industrialTitle', 'industrialBody', 'industrialTopics', 'userTitle', 'userBody', 'userTopics']) {
      assert.equal(plain(research.scenarios[key] || ''), plain(homeCopy[lang][`research.${key}`]), key);
    }
    assert.equal(research.labels.at(-1), homeCopy[lang]['research.scenarioTitle']);
    for (const [key, bodyKey] of [['agent', 'agentBody'], ['timeseries', 'timeseriesBody'], ['science', 'scienceIntelligenceBody']]) {
      const direction = homeCopy[lang][`research.${key}`];
      assert.equal(typeof direction, 'string', `Missing research.${key} translation`);
      const homepageBody = direction.replace(/^<span class="research-label">[\s\S]*?<\/span>\s*/, '');
      assert.equal(plain(homepageBody), plain(research.scenarios[bodyKey]), key);
    }
    assert.equal(research.collections, homeCopy[lang]['research.collections']);
    assert.equal(research.join, homeCopy[lang]['research.join']);
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
    for (const suffix of ['filterAll', 'filterAgent', 'filterTime', 'filterKnowledge', 'filterTable', 'filterRec', 'note', 'preprint', 'year2026', 'year2025', 'year2024', 'legacy']) {
      assert.equal(content[`pub.${suffix}`], homeCopy[lang][`pub.${suffix}`], suffix);
      keyedMarkup(read('publications.html'), 'data-page-i18n', `pub.${suffix}`);
    }
  });

  test(`${lang}: shared project descriptions and category names match the homepage`, () => {
    const content = sharedCopy[lang].pages['projects.html'].content || {};
    const keys = Object.keys(homeCopy[lang]).filter((key) => /^(?:opensource|datasets)\.(?:category\.|agentR1$|clawR1$|castClaw$|castMind$|paperScout$|academicSearch$|futureCast$|futureCastKicker$)/.test(key));
    assert.ok(keys.length >= 13, 'All shared descriptions and category names must be covered');
    for (const key of keys) {
      assert.equal(content[key], homeCopy[lang][key], key);
      keyedMarkup(read('projects.html'), 'data-page-i18n', key);
    }
  });
}

test('Science Intelligence fallback copy matches both English runtime translations', () => {
  const homepageDirection = keyedMarkup(home, 'data-i18n', 'research.science');
  assert.equal(homepageDirection, homeCopy.en['research.science']);
  const research = read('research.html');
  assert.equal(plain(keyedMarkup(research, 'data-page-i18n', 'scienceIntelligenceTitle')), 'Science Intelligence');
  assert.equal(plain(keyedMarkup(research, 'data-page-i18n', 'scienceIntelligenceBody')), scienceDirectionCopy.en);
});

test('PaperScout project titles include the Chinese name on both pages', () => {
  for (const path of ['index.html', 'projects.html']) {
    const names = [...active(read(path)).matchAll(/<div class="os-card-name">([\s\S]*?)<\/div>/g)].map((match) => plain(match[1]));
    assert.deepEqual(names.filter((name) => name.startsWith('PaperScout')), ['PaperScout（科言乐问）'], path);
  }
});

test('science dataset fallback headings include Scientific Tool and Knowledge on both pages', () => {
  const expected = 'Science Intelligence（Scientific Tool and Knowledge）';
  assert.equal(plain(keyedMarkup(home, 'data-i18n', 'datasets.category.science')), expected);
  assert.equal(plain(keyedMarkup(read('projects.html'), 'data-page-i18n', 'datasets.category.science')), expected);
});

test('academic organization fallback text matches the English translations on both pages', () => {
  for (const [suffix, expected] of Object.entries(organizationCopy.en)) {
    assert.equal(plain(keyedMarkup(home, 'data-i18n', `service.${suffix}`)), expected);
    assert.equal(plain(keyedMarkup(read('service.html'), 'data-page-i18n', `service.${suffix}`)), expected);
  }
});

test('default homepage markup and metadata no longer describe the superseded research positioning', () => {
  assert.equal(plain(keyedMarkup(home, 'data-i18n', 'research.intro')), introEn);
  for (const path of ['index.html', 'research.html', 'publications.html']) {
    const html = read(path);
    for (const match of html.matchAll(/<meta (?:name|property)="(?:description|og:description|twitter:description)" content="([^"]+)"/g)) {
      assert.match(match[1], /LLM-driven reasoning and AI agents/, path);
    }
  }
  assert.equal(home.includes('data-i18n="profile.thesis"'), false, 'the hero should not duplicate the research introduction');
});

test('Research application fallback markup matches homepage summaries and topics', () => {
  const research = read('research.html');
  for (const key of ['scenarioIntro', 'scienceTitle', 'scienceBody', 'scienceTopics', 'industrialTitle', 'industrialBody', 'industrialTopics', 'userTitle', 'userBody', 'userTopics']) {
    assert.equal(plain(keyedMarkup(research, 'data-page-i18n', key)), plain(homeCopy.en[`research.${key}`]), key);
  }
});

test('complete project and dataset pages use the homepage categories without dropping archive entries', () => {
  const projects = active(read('projects.html'));
  for (const [attribute, expected] of [['data-os-category', ['agents', 'timeseries', 'science']], ['data-dataset-category', ['timeseries', 'science', 'retrieval']]]) {
    const values = (html) => [...html.matchAll(new RegExp(`${attribute}="([^"]+)"`, 'g'))].map((match) => match[1]);
    assert.deepEqual(values(projects), expected);
    assert.deepEqual(values(active(home)), expected);
  }
  const names = [...projects.matchAll(/<div class="os-card-name">([\s\S]*?)<\/div>/g)].map((match) => plain(match[1]));
  assert.deepEqual(names, ['Agent-R1', 'Claw-R1', 'WebMind', 'TabClaw', 'CastClaw（观星阁）', 'CastMind（星思）', 'CastFactory（炼星坊）', 'PaperScout（科言乐问）', 'Academic Search']);
  assert.match(read('projects.html'), /<!-- Temporarily hidden: NeoResearch open source project\.[\s\S]*?NeoResearch（智多星）[\s\S]*?-->/);
  assert.equal((projects.match(/class="dataset-card"/g) || []).length, 5);
});

test('English hero fallbacks agree with the shared runtime translations', () => {
  for (const path of ['research.html', 'news.html', 'projects.html', 'awards.html', 'service.html', 'resources.html']) {
    const html = read(path);
    const page = sharedCopy.en.pages[path];
    assert.equal(plain(html.match(/class="page-hero-title"[^>]*>([\s\S]*?)<\//)?.[1] || ''), plain(page.title), path);
    assert.equal(plain(html.match(/<p class="page-hero-sub"[^>]*>([\s\S]*?)<\/p>/)?.[1] || ''), plain(page.subtitle), path);
  }
});

test('all public pages share the current footer and shared-asset versions', () => {
  for (const path of pages) {
    const html = active(read(path));
    assert.match(html, /© 2026 Mingyue Cheng\. Last updated in September 2026\./, path);
    assert.match(html, /site-theme\.css\?v=20260917-consistency/, path);
    assert.match(html, /site-content\.css\?v=20260917-consistency/, path);
    if (path !== 'index.html') assert.match(html, /site-language\.js\?v=20260921-research-brands/, path);
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
        assert.equal(footer.textContent, homeCopy[lang]['footer.bottom']);
        if (path !== 'publications.html') assert.equal(subtitle.textContent, page.subtitle);
      }
    }
  });
}
