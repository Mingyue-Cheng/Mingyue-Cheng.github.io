import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const cssPath = fileURLToPath(new URL('../files/assets/site-content.css', import.meta.url));
const css = existsSync(cssPath) ? readFileSync(cssPath, 'utf8') : '';
const clean = (source) => source.replace(/\/\*[\s\S]*?\*\//g, '');
const proseSelectors = [
  ".section p",
  ".profile-thesis",
  ".profile-affil",
  ".research-section p",
  ".research-section li",
  ".research-section .research-note",
  ".research-section .scenario-intro",
  ".research-section .scenario-card-body",
  ".research-main .scenario-card-body",
  ".research-vision-desc",
  ".pillar-card-desc",
  ".research-note-box",
  ".pub-list",
  ".pub-list li",
  ".pub-note",
  ".os-card-desc",
  ".dataset-card-desc",
  ".page-hero-sub",
  ".pub-hero-sub",
  ".pi-hero-lead",
  ".research-thesis p",
  ".framework-stage > p",
  ".timeline-list",
  ".timeline-list li",
  ".services-list",
  ".services-list li",
  ".news-list",
  ".news-list li",
  ".news-body",
  ".plain-list li",
  ".sys-list li",
  ".venue-name",
  ".journal-name",
  ".grant-title",
  ".award-title",
  ".award-note",
  ".resource-meta",
  ".related-card-role",
  ".footer-desc",
  ".section .industry-support-copy",
  ".section-summary",
  ".pdec-copy span",
  ".stage-signals li",
  ".weakness-card p",
  ".route-card p",
  ".route-gate",
  ".outcome-panel p"
];

function mediaBlock(query) {
  const source = clean(css);
  const marker = `@media ${query}`;
  const start = source.indexOf(marker);
  assert.ok(start >= 0, `Missing media query: ${query}`);
  const open = source.indexOf('{', start);
  let depth = 1;
  for (let end = open + 1; end < source.length; end += 1) {
    if (source[end] === '{') depth += 1;
    if (source[end] === '}') depth -= 1;
    if (depth === 0) return source.slice(open + 1, end);
  }
  assert.fail(`Unclosed media query: ${query}`);
}

function declarations(selector, source = css) {
  const result = {};
  const stripped = clean(source);
  for (const match of stripped.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (source === css) {
      const prefix = stripped.slice(0, match.index);
      const depth = (prefix.match(/\{/g) || []).length - (prefix.match(/\}/g) || []).length;
      if (depth > 0) continue;
    }
    if (!match[1].split(',').some((part) => part.trim() === selector)) continue;
    for (const declaration of match[2].split(';')) {
      const colon = declaration.indexOf(':');
      if (colon < 0) continue;
      result[declaration.slice(0, colon).trim()] = declaration.slice(colon + 1).trim();
    }
  }
  return result;
}

test('open-source and dataset cards share calm white surfaces', () => {
  for (const selector of ['.os-card', '.dataset-card']) {
    const rule = declarations(selector);
    assert.equal(rule.background, '#fff', `${selector} should use a white surface`);
    assert.equal(rule['border-color'], '#dce6eb');
    assert.equal(rule['border-radius'], '14px');
    assert.equal(rule['box-shadow'], '0 3px 14px rgba(var(--accent-rgb), 0.04)');
  }
});

test('decorative card stripes and glow are removed without hiding card content', () => {
  for (const selector of ['.os-card::before', '.dataset-card::before', '.dataset-card::after']) {
    assert.equal(declarations(selector).display, 'none', `${selector} should be hidden`);
  }
  for (const selector of ['.os-card:hover', '.dataset-card:hover']) {
    assert.equal(declarations(selector).transform, 'none', `${selector} must not lift`);
  }
  assert.doesNotMatch(css, /(?:line-clamp|text-overflow\s*:\s*ellipsis|max-height\s*:|overflow\s*:\s*hidden)/);
});

test('card metadata and project titles can wrap within the available width', () => {
  for (const selector of ['.os-card-title-row', '.dataset-card-title-row', '.dataset-title-main', '.os-card-meta', '.dataset-card-meta']) {
    const rule = declarations(selector);
    assert.equal(rule['flex-wrap'], 'wrap', `${selector} needs wrapping`);
    assert.equal(rule['min-width'], '0');
    assert.equal(rule['max-width'], '100%');
  }
  for (const selector of ['.os-card-meta', '.dataset-card-meta']) {
    assert.equal(declarations(selector).gap, '7px');
  }
});

test('long descriptions retain restrained emphasis even while hovering a dataset card', () => {
  for (const selector of ['.os-card-desc', '.dataset-card-desc', '.dataset-card:hover .dataset-card-desc']) {
    assert.equal(declarations(selector).color, '#516773', selector);
  }
  for (const selector of ['.os-card-desc strong', '.dataset-card-desc strong', '.dataset-card:hover .dataset-card-desc strong']) {
    const rule = declarations(selector);
    assert.equal(rule['font-weight'], '600', selector);
    assert.equal(rule.color, '#354e5b', selector);
  }
  assert.equal(declarations('.dataset-card:hover .dataset-kicker').transform, 'none');
  assert.equal(declarations('.dataset-card:hover .dataset-repo-link').transform, 'none');
});

test('research scenarios share the surface treatment without overriding homepage layout', () => {
  const rule = declarations('.research-main .scenario-card');
  assert.equal(rule.background, '#fff');
  assert.equal(rule['border-radius'], '14px');
  assert.equal(rule['border-color'], '#dce6eb');
  assert.equal(declarations('.research-main .scenario-card:hover').transform, 'none');
  assert.equal(declarations('.research-main .scenario-card-accent').display, 'none');
  assert.equal(declarations('.research-main .scenario-card-icon').color, 'var(--scenario-color)');
  assert.equal(declarations('.research-main .scenario-card--science')['--scenario-color'], '#087a63');
  assert.equal(declarations('.research-main .scenario-card--user')['--scenario-color'], '#9b641d');
  assert.equal(declarations('html[lang] .research-main .scenario-card-body')['text-align'], 'justify',
    'research prose must share the site-wide justification contract');
  assert.doesNotMatch(css, /\.research-section\s+\.scenario-card\s*\{/,
    'homepage scenario layout is owned by its existing page rules');
});

test('prose is justified at every width with language-aware specificity and natural last lines', () => {
  for (const selector of proseSelectors) {
    const rule = declarations(`html[lang] ${selector}`);
    assert.equal(rule['text-align'], 'justify', selector);
    assert.equal(rule['text-align-last'], 'left', selector);
    assert.equal(rule['text-justify'], 'auto', selector);
    assert.equal(rule.hyphens, 'none', selector);
    assert.equal(rule['-webkit-hyphens'], 'none', selector);
    assert.equal(rule['overflow-wrap'], 'break-word', selector);
    assert.equal(rule['word-break'], 'normal', selector);
  }
  const mobile = mediaBlock('(max-width: 680px)');
  assert.doesNotMatch(mobile, /text-align\s*:\s*(?:left|start)/,
    'mobile content must not override justified prose');
  assert.doesNotMatch(clean(css), /(?:^|[{}])\s*(?:html\[lang\]\s+)?(?:\*|body|p|li)\s*\{/,
    'alignment should target reading content, not every element');
  for (const selector of ['.os-card-title-row', '.dataset-card-title-row', '.os-card-meta', '.dataset-card-meta']) {
    assert.equal(declarations(selector)['text-align'], 'left', 'Keep titles and metadata controls unchanged');
  }
});

test('mobile card metadata stays beside its own card and filters remain usable touch targets', () => {
  const mobile = mediaBlock('(max-width: 680px)');
  for (const selector of ['.os-card-title-row', '.dataset-card-title-row']) {
    assert.equal(declarations(selector, mobile)['flex-direction'], 'column', selector);
  }
  assert.equal(declarations('.dataset-card-meta', mobile)['margin-left'], '0');
  assert.equal(declarations('.pub-filters')['flex-wrap'], 'wrap');
  assert.ok(Number.parseInt(declarations('.pub-filter-btn')['min-height'], 10) >= 40);
  assert.equal(declarations('.pub-filter-btn')['max-width'], '100%');
  for (const selector of ['.pub-filter-btn.active', '.pub-filter-btn[aria-pressed="true"]']) {
    assert.equal(declarations(selector).background, 'var(--accent)');
    assert.equal(declarations(selector).color, '#fff');
  }
});

test('interactive content has a clear focus indicator and respects reduced motion', () => {
  for (const selector of ['a:focus-visible', '.pub-filter-btn:focus-visible']) {
    assert.equal(declarations(selector).outline, '3px solid var(--accent)');
    assert.equal(declarations(selector)['outline-offset'], '3px');
  }
  const reduced = mediaBlock('(prefers-reduced-motion: reduce)');
  for (const selector of ['.os-card', '.dataset-card', '.research-main .scenario-card', '.pub-filter-btn']) {
    assert.equal(declarations(selector, reduced).transition, 'none', selector);
  }
});

test('shared content CSS does not change page containers, navigation, or hide real prose', () => {
  assert.doesNotMatch(clean(css), /(?:^|[{}])\s*\.(?:container|footer-shell|nav-inner|nav-links|profile-wrap)\b/);
  assert.doesNotMatch(clean(css), /(?:\.os-card-desc|\.dataset-card-desc|\.scenario-card-body)[^{]*\{[^}]*display\s*:\s*none/);
});
