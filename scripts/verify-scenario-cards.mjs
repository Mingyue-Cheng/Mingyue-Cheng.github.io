import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');
const indexHtml = read('index.html');
const researchHtml = read('research.html');
const cssPath = join(root, 'files/assets/scenario-cards.css');
const scenarioCss = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';
const stylesheetLink = '<link rel="stylesheet" href="files/assets/scenario-cards.css">';

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cssRule(source, selector) {
  const match = source.match(new RegExp(`${escapeRegex(selector)}\\s*\\{([^}]*)\\}`));
  assert.ok(match, `Missing CSS rule: ${selector}`);
  return match[1];
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

test('shared stylesheet implements the approved visual and responsive contract', () => {
  assert.match(scenarioCss, /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(scenarioCss, /@media \(max-width:\s*900px\)[\s\S]*?\.scenario-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/);
  assert.match(scenarioCss, /@media \(hover:\s*hover\) and \(pointer:\s*fine\)/);
  assert.match(scenarioCss, /@media \(prefers-reduced-motion:\s*reduce\)/);
  assert.doesNotMatch(scenarioCss, /cursor:\s*pointer/);

  for (const modifier of ['science', 'energy', 'user']) {
    assert.match(scenarioCss, new RegExp(`\\.scenario-card--${modifier}\\s*\\{`));
  }

  const reset = cssRule(scenarioCss, '.research-section .scenario-card-body');
  for (const declaration of [
    'text-align: left;',
    'text-align-last: auto;',
    'text-justify: auto;',
    'hyphens: none;',
    '-webkit-hyphens: none;'
  ]) {
    assert.ok(reset.includes(declaration), `Missing high-specificity reset: ${declaration}`);
  }
});
