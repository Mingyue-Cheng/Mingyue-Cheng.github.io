import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const awardsHtml = readFileSync(join(root, 'awards.html'), 'utf8');
const languageScript = readFileSync(join(root, 'files/assets/site-language.js'), 'utf8');
const grants = [
  {
    key: 'casPriority', period: '2026.07–2029.06',
    en: 'Chinese Academy of Sciences Strategic Priority Research Program for Basic and Interdisciplinary Frontier Research (Category B); Mechanisms and Methods for Autonomous Interactive Learning in Large Models; Project Lead',
    zh: '中国科学院基础与交叉前沿科研先导专项（B类），大模型自主交互学习机制及方法，项目负责人',
  },
  {
    key: 'newGenerationAI', period: '2026.08–2028.07',
    en: 'New-Generation Artificial Intelligence National Science and Technology Major Project; Scientific Data Governance Toolchain and Datasets — Chemistry; Core Project Member',
    zh: '新一代人工智能国家科技重大专项，科学数据治理工具链与数据集-化学领域，项目骨干',
  },
  {
    key: 'nsfc', period: '2026.01–2028.12',
    en: 'National Natural Science Foundation of China — Young Scientists Fund (Category C); Cross-Domain Context-Aware Time Series Representation Learning and Forecasting; Project Lead',
    zh: '国家自然科学基金青年科学基金C类，跨域情境感知的时间序列表征学习及预测方法，项目负责人',
  },
  {
    key: 'ustcYouth', period: '2027.01–2028.12',
    en: 'USTC Youth Innovation Fund Project; Multi-Turn Interactive Learning and Continual Evolution for Large-Model Agents: Methods and Applications; Project Lead',
    zh: '中国科学技术大学青年创新基金项目，大模型智能体多轮交互学习与持续进化方法研究及应用，项目负责人',
  },
  {
    key: 'ustc', period: '2025.01–2026.12',
    en: 'USTC New Medicine Joint Fund Cultivation Project (Double First-Class Discipline Development Special Program); Time Series Modeling Methods and Applications Using Perioperative Physiological Data; Project Partner Lead',
    zh: '中国科学技术大学新医学联合基金培育项目（双一流学科建设专项），基于围术期生理数据的时序建模方法及应用研究，项目方负责人',
  },
  {
    key: 'anhui', period: '2024.09–2026.08',
    en: 'Anhui Provincial Natural Science Foundation; Table Semantic Understanding and Reasoning for Scientific Literature; Project Lead',
    zh: '安徽省自然科学基金，面向科技文献的表格语义理解与推理研究，项目负责人',
  },
];

function createHarness(storedLanguage) {
  const titles = [...awardsHtml.matchAll(/<div class="grant-title"([^>]*)>([^<]*)<\/div>/g)]
    .map((match) => ({
      textContent: match[2],
      getAttribute: (attribute) => attribute === 'data-grant-i18n'
        ? match[1].match(/data-grant-i18n="([^"]+)"/)?.[1] ?? null : null,
    }));
  const periods = [...awardsHtml.matchAll(/<span class="grant-period">([^<]*)<\/span>/g)]
    .map((match) => ({ textContent: match[1] }));
  const listeners = new Map();
  const toggle = {
    textContent: '',
    setAttribute() {},
    addEventListener: (type, handler) => listeners.set(type, handler),
    click: () => listeners.get('click')?.(),
  };
  const storage = new Map(storedLanguage ? [['homepage-language', storedLanguage]] : []);
  const document = {
    readyState: 'complete',
    documentElement: { lang: '' },
    getElementById: (id) => id === 'languageToggle' ? toggle : null,
    querySelector: () => null,
    querySelectorAll: (selector) => {
      if (selector === '[data-grant-i18n]') {
        return titles.filter((title) => title.getAttribute('data-grant-i18n'));
      }
      if (selector === '.grant-period') return periods;
      return [];
    },
  };
  const localStorage = {
    getItem: (key) => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
  };

  vm.runInNewContext(languageScript, {
    document,
    localStorage,
    window: { location: { pathname: '/awards.html' } },
  }, { filename: 'site-language.js' });
  return { document, localStorage, titles, periods, toggle };
}

function assertGrantLanguage(harness, lang) {
  assert.equal(harness.document.documentElement.lang, lang === 'zh' ? 'zh-CN' : 'en');
  for (const [index, grant] of grants.entries()) {
    assert.equal(harness.titles[index]?.textContent, grant[lang], `${grant.key}: full ${lang} details`);
    assert.equal(harness.periods[index]?.textContent, grant.period, `${grant.key}: date must not change with language`);
  }
}

test('Awards binds all six public grant titles to stable translation keys', () => {
  const harness = createHarness('en');
  assert.deepEqual(
    harness.titles.map((title) => title.getAttribute('data-grant-i18n')).filter(Boolean),
    grants.map((grant) => grant.key),
  );
});

test('Awards defaults to the full English grant details without a saved language', () => {
  assertGrantLanguage(createHarness(), 'en');
});

test('Awards applies the saved Chinese language to all updated grant details on load', () => {
  assertGrantLanguage(createHarness('zh'), 'zh');
});

for (const initialLanguage of ['en', 'zh']) {
  test(`Awards grant details survive a ${initialLanguage} language round trip`, () => {
    const harness = createHarness(initialLanguage);
    const otherLanguage = initialLanguage === 'en' ? 'zh' : 'en';
    const untouchedTitles = harness.titles.slice(grants.length).map((title) => title.textContent);
    const originalPeriods = harness.periods.map((period) => period.textContent);
    assertGrantLanguage(harness, initialLanguage);

    harness.toggle.click();
    assertGrantLanguage(harness, otherLanguage);
    assert.equal(harness.localStorage.getItem('homepage-language'), otherLanguage);

    harness.toggle.click();
    assertGrantLanguage(harness, initialLanguage);
    assert.equal(harness.localStorage.getItem('homepage-language'), initialLanguage);
    assert.deepEqual(harness.titles.slice(grants.length).map((title) => title.textContent), untouchedTitles);
    assert.deepEqual(harness.periods.map((period) => period.textContent), originalPeriods);
  });
}
