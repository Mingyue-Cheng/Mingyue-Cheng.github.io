import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => {
  const url = new URL(`../${path}`, import.meta.url);
  return existsSync(url) ? readFileSync(url, 'utf8') : '';
};
const pages = [
  'index.html', 'research.html', 'publications.html', 'projects.html',
  'news.html', 'awards.html', 'service.html', 'resources.html',
  'prediction-intelligence.html'
];
const theme = read('files/assets/site-theme.css');
const oldBlue = /#(?:003087|00226b|0a57d6|2d61a6|2563eb|1456c7|78a3ff|e8edf7)\b|rgba?\(\s*(?:0,\s*48,\s*135|37,\s*99,\s*235)\s*[,)]/i;

test('the shared palette provides Prussian-blue accents and coordinated neutral surfaces', () => {
  for (const [name, value] of Object.entries({
    accent: '#003153', 'accent-dark': '#00243d', 'accent-light': '#e8f0f4',
    'accent-rgb': '0, 49, 83', border: '#dce5eb', 'bg-alt': '#f4f7f9'
  })) {
    assert.ok(theme.includes(`--${name}: ${value};`), `${name} must be ${value}`);
  }
});

for (const page of pages) {
  const html = read(page);
  test(`${page} loads the theme and content layers after all older CSS`, () => {
    const head = html.match(/<head>([\s\S]*?)<\/head>/)?.[1] || '';
    const styles = [...head.matchAll(/<style\b[\s\S]*?<\/style>|<link\b[^>]*rel="stylesheet"[^>]*>/g)]
      .map((match) => match[0].startsWith('<style') ? '<style>' : match[0]);
    assert.deepEqual(styles.slice(-2), [
      '<link rel="stylesheet" href="files/assets/site-theme.css?v=20260911">',
      '<link rel="stylesheet" href="files/assets/site-content.css?v=20260911">'
    ]);
    for (const name of ['site-theme', 'site-content']) {
      assert.equal(styles.filter((style) => style.includes(`${name}.css`)).length, 1);
    }
  });

  test(`${page} uses the shared browser color and retains no former brand-blue accents`, () => {
    assert.ok(/<meta name="theme-color" content="#003153">/.test(html), 'browser theme must use Prussian blue');
    assert.equal(html.match(oldBlue)?.[0], undefined, 'old brand-blue accent remains');
  });
}

test('the prediction stylesheet uses the same palette without changing semantic category colors', () => {
  const prediction = read('files/assets/prediction-intelligence.css');
  assert.equal(prediction.match(oldBlue)?.[0], undefined, 'old brand-blue accent remains');
  for (const color of ['#087f8c', '#12805c', '#a16207', '#6d4aff']) {
    assert.ok(prediction.includes(color), `semantic color ${color} must remain available`);
  }
});

test('navigation overrides language-specific legacy rules and keeps its desktop geometry', () => {
  assert.match(theme, /html \.site-header \.nav-inner\s*\{[^}]*flex-wrap:\s*nowrap;/);
  assert.match(theme, /html \.site-header \.nav-logo\s*\{[^}]*white-space:\s*nowrap;/);
  assert.match(theme, /html \.site-header \.nav-logo::before\s*\{[^}]*width:\s*7px;[^}]*height:\s*7px;/);
  assert.match(theme, /html \.site-header \.nav-links\s*\{[^}]*min-width:\s*0;[^}]*gap:\s*clamp\(/);
  assert.match(theme, /html \.site-header \.language-toggle\s*\{[^}]*height:\s*34px;/);
  assert.match(theme, /html \.site-header \.nav-toggle\s*\{[^}]*width:\s*40px;[^}]*height:\s*40px;/);
});

test('the unified mobile menu activates at 900px and preserves visible no-JavaScript links', () => {
  const mobile = theme.slice(theme.indexOf('@media (max-width: 900px)'));
  assert.match(mobile, /html \.site-header \.nav-links\s*\{[^}]*display:\s*flex;[^}]*position:\s*static;[^}]*flex-basis:\s*100%;/);
  assert.match(mobile, /html \.site-header\.js-mobile-nav \.nav-links\s*\{[^}]*display:\s*none;/);
  assert.match(mobile, /html \.site-header\.nav-open \.nav-links\s*\{[^}]*display:\s*flex;/);
  assert.match(mobile, /html \.site-header\.js-mobile-nav \.nav-toggle\s*\{[^}]*display:\s*inline-flex;/);
  assert.match(mobile, /html \.site-header\.js-mobile-nav \.nav-links a\s*\{[^}]*min-height:\s*44px;/);
  assert.doesNotMatch(theme, /@media\s*\(max-width:\s*760px\)/);
});

test('navigation retains active, keyboard focus and reduced-motion feedback', () => {
  assert.match(theme, /\.nav-links a\.active/);
  assert.match(theme, /\.nav-links a\[aria-current="page"\]/);
  assert.match(theme, /:focus-visible\s*\{[^}]*outline:\s*3px solid rgba\(var\(--accent-rgb\)/);
  assert.match(theme, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(theme, /transition-duration:\s*0\.01ms\s*!important/);
});
