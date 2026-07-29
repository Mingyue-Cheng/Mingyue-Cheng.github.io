import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const readIfPresent = (relativePath) => {
  const path = join(root, relativePath);
  return existsSync(path) ? readFileSync(path, 'utf8') : '';
};

const pagePath = 'prediction-intelligence.html';
const cssPath = 'files/assets/prediction-intelligence.css';
const scriptPath = 'files/assets/prediction-intelligence.js';
const pageHtml = readIfPresent(pagePath);
const pageCss = readIfPresent(cssPath);
const pageJs = readIfPresent(scriptPath);
const indexHtml = readIfPresent('index.html');
const researchHtml = readIfPresent('research.html');

const count = (source, pattern) => (source.match(pattern) || []).length;

function predictionArticle(source) {
  const match = source.match(
    /<article class="scenario-card scenario-card--prediction">[\s\S]*?<\/article>/
  );
  assert.ok(match, 'Prediction Intelligence scenario card must exist');
  return match[0];
}

test('Prediction Intelligence page and focused assets exist', () => {
  for (const relativePath of [pagePath, cssPath, scriptPath]) {
    assert.ok(existsSync(join(root, relativePath)), `${relativePath} must exist`);
  }
});

test('page metadata and shell match the academic homepage', () => {
  assert.match(pageHtml, /<html lang="en">/);
  assert.match(pageHtml, /<title>Prediction Intelligence — Mingyue Cheng<\/title>/);
  assert.match(
    pageHtml,
    /<meta name="description" content="[^"]*predictability analysis, failure diagnosis, adaptive enhancement, and risk calibration[^"]*">/
  );
  assert.match(
    pageHtml,
    /<meta property="og:url" content="https:\/\/mingyue-cheng\.github\.io\/prediction-intelligence\.html">/
  );
  assert.match(
    pageHtml,
    /<link rel="stylesheet" href="files\/assets\/prediction-intelligence\.css\?v=20260728">/
  );
  assert.match(pageHtml, /<a class="skip-link" href="#main-content">Skip to content<\/a>/);
  assert.match(pageHtml, /<header class="site-header">/);
  assert.equal(count(pageHtml, /<nav class="nav-links" id="primary-nav">[\s\S]*?<\/nav>/g), 1);
  for (const href of [
    'research.html',
    'news.html',
    'publications.html',
    'projects.html',
    'awards.html',
    'service.html',
    'resources.html'
  ]) {
    assert.match(pageHtml, new RegExp(`<a href="${href}">`), `Missing nav link: ${href}`);
  }
  assert.match(pageHtml, /<main id="main-content">/);
  assert.match(pageHtml, /<footer class="site-footer">/);
  assert.match(pageHtml, /<script src="files\/assets\/site-language\.js\?v=20260719"><\/script>/);
  assert.match(
    pageHtml,
    /<script src="files\/assets\/prediction-intelligence\.js\?v=20260728"><\/script>/
  );
  assert.doesNotMatch(pageHtml, /<svg\b/, 'The page must use CSS-based visuals rather than inline SVG');
});

test('hero introduces the PDEC research framework', () => {
  assert.match(pageHtml, /<div class="pi-eyebrow"[^>]*>Research Framework<\/div>/);
  assert.match(pageHtml, /<h1\b[^>]*class="pi-hero-title"[^>]*>Prediction Intelligence<\/h1>/);
  assert.match(
    pageHtml,
    /Forecasting systems should do more than generate predictions\.[\s\S]*whether a task is predictable[\s\S]*human\s+participation is required\./
  );
  assert.match(pageHtml, /Predictability Analysis–Diagnosis–Enhancement–Calibration/);
  assert.equal(count(pageHtml, /<li class="pdec-step" data-stage="[PDEC]">/g), 4);
  for (const label of [
    'Predictability Analysis',
    'Failure Diagnosis',
    'Adaptive Enhancement',
    'Risk Calibration'
  ]) {
    assert.ok(pageHtml.includes(label), `Missing PDEC stage label: ${label}`);
  }
});

test('four research stages preserve the intended questions and outputs', () => {
  const stages = [
    ['predictability', 'Where and when is forecasting difficult?', 'Predictability map'],
    ['diagnosis', 'Why does the model fail?', 'Root-cause attribution'],
    ['enhancement', 'How can the weakness be repaired?', 'Targeted capability repair'],
    [
      'calibration',
      'When should the system trust, reason, defer, or collaborate?',
      'Reliability-aware routing'
    ]
  ];

  assert.equal(count(pageHtml, /<article class="framework-stage(?: [^"]+)?"/g), 4);
  for (const [id, question, output] of stages) {
    assert.match(
      pageHtml,
      new RegExp(
        `<article class="framework-stage[^"]*" id="${id}"[\\s\\S]*?${question.replace(
          /[.*+?^${}()|[\]\\]/g,
          '\\$&'
        )}[\\s\\S]*?${output}[\\s\\S]*?<\\/article>`
      ),
      `Stage ${id} must include its core question and output`
    );
  }
});

test('failure diagnosis and risk-aware decision routing are explicit', () => {
  for (const weakness of [
    'Historical Support Gap',
    'Context Gap',
    'Capability Gap',
    'Irreducible Uncertainty'
  ]) {
    assert.ok(pageHtml.includes(weakness), `Missing weakness class: ${weakness}`);
  }
  assert.equal(count(pageHtml, /<article class="weakness-card">/g), 4);

  for (const route of [
    'Small-Model Forecasting',
    'Tool-Augmented Reasoning',
    'LLM Collaboration',
    'Human-in-the-Loop Decision'
  ]) {
    assert.ok(pageHtml.includes(route), `Missing decision route: ${route}`);
  }
  assert.equal(count(pageHtml, /<article class="route-card(?: [^"]+)?"/g), 4);
  assert.match(pageHtml, /abstain, escalate, or request human review/i);
  assert.match(pageHtml, /Interpretable Forecasting &amp; Trustworthy Decision Support/);
});

test('page-specific language switching covers the full research narrative', () => {
  assert.match(pageJs, /const translations = \{/);
  assert.match(pageJs, /localStorage\.getItem\('homepage-language'\)/);
  assert.match(pageJs, /document\.querySelectorAll\('\[data-pi-i18n\]'\)/);
  for (const phrase of [
    '预测智能',
    '可预测性分析',
    '失败诊断',
    '自适应增强',
    '风险校准',
    '可解释预测与可信决策辅助'
  ]) {
    assert.ok(pageJs.includes(phrase), `Missing Chinese translation: ${phrase}`);
  }
});

test('homepage and Research cards link to the new subpage', () => {
  for (const [label, source] of [
    ['Homepage', indexHtml],
    ['Research page', researchHtml]
  ]) {
    const article = predictionArticle(source);
    assert.match(
      article,
      /<a class="scenario-card-title-link" href="prediction-intelligence\.html">[\s\S]*?Prediction Intelligence[\s\S]*?<\/a>/,
      `${label} Prediction Intelligence card must link to the subpage`
    );
  }
});

test('visual system is responsive, accessible, and consistent with the site', () => {
  for (const token of ['--accent:', '--teal:', '--purple:', '--border:', '--max-w:']) {
    assert.ok(pageCss.includes(token), `Missing shared visual token: ${token}`);
  }
  assert.match(pageCss, /\.pi-hero-grid\s*\{[\s\S]*?grid-template-columns:/);
  assert.match(pageCss, /\.framework-stages\s*\{[\s\S]*?display:\s*grid/);
  assert.match(pageCss, /\.route-grid\s*\{[\s\S]*?display:\s*grid/);
  assert.match(pageCss, /@media \(max-width:\s*900px\)/);
  assert.match(pageCss, /@media \(max-width:\s*760px\)/);
  assert.match(pageCss, /:focus-visible/);
  assert.match(pageCss, /@media \(prefers-reduced-motion:\s*reduce\)/);
});
