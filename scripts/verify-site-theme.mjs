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
const MOBILE_900_CONTEXT = [{ name: 'media', prelude: '(max-width:900px)' }];
const UNDERLINE_REVEAL_SELECTORS = [
  'html .site-header .nav-links a:hover::after',
  'html .site-header .nav-links a:focus-visible::after',
  'html .site-header .nav-links a.active::after',
  'html .site-header .nav-links a[aria-current="page"]::after'
];
const MOBILE_CURRENT_STATE_SELECTORS = [
  'html .site-header.js-mobile-nav .nav-links a.active',
  'html .site-header.js-mobile-nav .nav-links a[aria-current="page"]'
];

// Resolves authored declarations for one exact selector/context, including source order and !important.
function normalizeCssSyntax(value, { lowercase = false, tight = '' } = {}) {
  const output = [];
  let quote = '';
  let pendingSpace = false;

  for (let index = 0; index < value.length; index += 1) {
    const character = value[index];
    if (quote) {
      output.push(character);
      if (character === '\\' && index + 1 < value.length) {
        output.push(value[index + 1]);
        index += 1;
      } else if (character === quote) {
        quote = '';
      }
      continue;
    }

    if (character === '"' || character === "'") {
      if (pendingSpace && output.length > 0 && !tight.includes(output.at(-1))) output.push(' ');
      pendingSpace = false;
      quote = character;
      output.push(character);
      continue;
    }
    if (character === '\\' && index + 1 < value.length) {
      if (pendingSpace && output.length > 0 && !tight.includes(output.at(-1))) output.push(' ');
      pendingSpace = false;
      output.push(character, value[index + 1]);
      index += 1;
      continue;
    }
    if (/\s/.test(character)) {
      pendingSpace = true;
      continue;
    }

    if (tight.includes(character) && character !== '(') {
      if (output.at(-1) === ' ') output.pop();
    } else if (pendingSpace && output.length > 0 && !tight.includes(output.at(-1))) {
      output.push(' ');
    }
    pendingSpace = false;
    output.push(lowercase ? character.toLowerCase() : character);
  }

  return output.join('').trim();
}

const normalizeCssValue = (value) => normalizeCssSyntax(value, { tight: '(),' });
const normalizeCssSelector = (selector) => normalizeCssSyntax(selector, { tight: '>+~=' });
const normalizeAtRulePrelude = (prelude) => normalizeCssSyntax(
  prelude,
  { lowercase: true, tight: '():,' }
);

function maskCssComments(source) {
  const characters = [...source];
  let quote = '';

  for (let index = 0; index < characters.length; index += 1) {
    const character = characters[index];
    if (quote) {
      if (character === '\\' && index + 1 < characters.length) index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '\\' && index + 1 < characters.length) {
      index += 1;
      continue;
    }
    if (character !== '/' || characters[index + 1] !== '*') continue;

    characters[index] = ' ';
    characters[index + 1] = ' ';
    index += 2;
    while (index < characters.length && !(characters[index] === '*' && characters[index + 1] === '/')) {
      if (characters[index] !== '\n' && characters[index] !== '\r') characters[index] = ' ';
      index += 1;
    }
    if (index < characters.length) {
      characters[index] = ' ';
      if (index + 1 < characters.length) characters[index + 1] = ' ';
      index += 1;
    }
  }

  return characters.join('');
}

function splitCssTopLevel(source, delimiter) {
  const parts = [];
  let start = 0;
  let quote = '';
  let parentheses = 0;
  let brackets = 0;
  let braces = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === '\\' && index + 1 < source.length) index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '\\' && index + 1 < source.length) {
      index += 1;
      continue;
    }
    if (character === '(') parentheses += 1;
    else if (character === ')') parentheses = Math.max(0, parentheses - 1);
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets = Math.max(0, brackets - 1);
    else if (character === '{') braces += 1;
    else if (character === '}') braces = Math.max(0, braces - 1);
    else if (character === delimiter && parentheses === 0 && brackets === 0 && braces === 0) {
      parts.push(source.slice(start, index));
      start = index + 1;
    }
  }
  parts.push(source.slice(start));
  return parts;
}

function findTopLevelColon(source) {
  let quote = '';
  let parentheses = 0;
  let brackets = 0;
  let braces = 0;

  for (let index = 0; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === '\\' && index + 1 < source.length) index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '\\' && index + 1 < source.length) {
      index += 1;
      continue;
    }
    if (character === '(') parentheses += 1;
    else if (character === ')') parentheses = Math.max(0, parentheses - 1);
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets = Math.max(0, brackets - 1);
    else if (character === '{') braces += 1;
    else if (character === '}') braces = Math.max(0, braces - 1);
    else if (character === ':' && parentheses === 0 && brackets === 0 && braces === 0) return index;
  }
  return -1;
}

function parseCssDeclarations(body) {
  return splitCssTopLevel(body, ';').flatMap((entry) => {
    const separator = findTopLevelColon(entry);
    if (separator === -1) return [];
    const property = entry.slice(0, separator).trim().toLowerCase();
    if (!property) return [];

    let rawValue = entry.slice(separator + 1).trim();
    const importantMatch = rawValue.match(/!\s*important\s*$/i);
    const important = Boolean(importantMatch);
    if (importantMatch) rawValue = rawValue.slice(0, importantMatch.index).trim();
    return [{ property, value: normalizeCssValue(rawValue), important }];
  });
}

function findCssRuleBoundary(source, start, end) {
  let quote = '';
  let parentheses = 0;
  let brackets = 0;

  for (let index = start; index < end; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === '\\' && index + 1 < end) index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '\\' && index + 1 < end) {
      index += 1;
      continue;
    }
    if (character === '(') parentheses += 1;
    else if (character === ')') parentheses = Math.max(0, parentheses - 1);
    else if (character === '[') brackets += 1;
    else if (character === ']') brackets = Math.max(0, brackets - 1);
    else if ((character === '{' || character === ';') && parentheses === 0 && brackets === 0) {
      return { character, index };
    }
  }
  return null;
}

function findMatchingCssBrace(source, openingBrace, end) {
  let quote = '';
  let depth = 1;

  for (let index = openingBrace + 1; index < end; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === '\\' && index + 1 < end) index += 1;
      else if (character === quote) quote = '';
      continue;
    }
    if (character === '"' || character === "'") {
      quote = character;
      continue;
    }
    if (character === '\\' && index + 1 < end) {
      index += 1;
      continue;
    }
    if (character === '{') depth += 1;
    else if (character === '}') {
      depth -= 1;
      if (depth === 0) return index;
    }
  }
  return -1;
}

function parseAtRuleHeader(header) {
  const match = header.trim().match(/^@([\w-]+)([\s\S]*)$/);
  if (!match) return null;
  return { name: match[1].toLowerCase(), prelude: normalizeAtRulePrelude(match[2]) };
}

function parseCssRules(source) {
  const sanitized = maskCssComments(source);
  const rules = [];

  function parseRuleList(start, end, context) {
    let cursor = start;
    while (cursor < end) {
      while (cursor < end && /[\s;]/.test(sanitized[cursor])) cursor += 1;
      if (cursor >= end) break;

      const boundary = findCssRuleBoundary(sanitized, cursor, end);
      if (!boundary) break;
      if (boundary.character === ';') {
        cursor = boundary.index + 1;
        continue;
      }

      const closingBrace = findMatchingCssBrace(sanitized, boundary.index, end);
      assert.notEqual(closingBrace, -1, 'CSS block must have a closing brace');
      const header = sanitized.slice(cursor, boundary.index).trim();
      if (header.startsWith('@')) {
        const atRule = parseAtRuleHeader(header);
        if (atRule) parseRuleList(boundary.index + 1, closingBrace, [...context, atRule]);
      } else if (header) {
        const selectors = splitCssTopLevel(header, ',').map(normalizeCssSelector);
        rules.push({
          context,
          declarations: parseCssDeclarations(sanitized.slice(boundary.index + 1, closingBrace)),
          selectors
        });
      }
      cursor = closingBrace + 1;
    }
  }

  parseRuleList(0, sanitized.length, []);
  return rules;
}

function sameCssContext(actual, expected) {
  return actual.length === expected.length && actual.every((atRule, index) => (
    atRule.name === expected[index].name && atRule.prelude === expected[index].prelude
  ));
}

function resolveMatchingCssDeclarations(source, context, matchesSelectors) {
  const normalizedContext = context.map(({ name, prelude }) => ({
    name: name.toLowerCase(),
    prelude: normalizeAtRulePrelude(prelude)
  }));
  const declarations = new Map();
  let matchedRule = false;

  for (const rule of parseCssRules(source)) {
    if (!sameCssContext(rule.context, normalizedContext)) continue;
    if (!matchesSelectors(rule.selectors)) continue;
    matchedRule = true;
    for (const declaration of rule.declarations) {
      const previous = declarations.get(declaration.property);
      if (!previous || declaration.important || !previous.important) {
        declarations.set(declaration.property, declaration);
      }
    }
  }

  return { declarations, matchedRule };
}

function resolveCssDeclarations(source, selector, context = []) {
  const normalizedSelector = normalizeCssSelector(selector);
  return resolveMatchingCssDeclarations(
    source,
    context,
    (selectors) => selectors.length === 1 && selectors[0] === normalizedSelector
  );
}

function haveSameSelectorMultiset(actualSelectors, expectedSelectors) {
  if (actualSelectors.length !== expectedSelectors.length) return false;

  const unmatched = [...expectedSelectors];
  for (const selector of actualSelectors) {
    const matchIndex = unmatched.indexOf(selector);
    if (matchIndex === -1) return false;
    unmatched.splice(matchIndex, 1);
  }
  return unmatched.length === 0;
}

function resolveCssSelectorGroupDeclarations(source, selectors, context = []) {
  const normalizedSelectors = selectors.map(normalizeCssSelector);
  return resolveMatchingCssDeclarations(
    source,
    context,
    (actualSelectors) => haveSameSelectorMultiset(actualSelectors, normalizedSelectors)
  );
}

function formatCssContext(context) {
  return context.length === 0
    ? 'the top level'
    : context.map(({ name, prelude }) => `@${name} ${prelude}`).join(' inside ');
}

function assertCssDeclarations(source, selector, expected, context = []) {
  const resolved = resolveCssDeclarations(source, selector, context);
  assert.ok(resolved.matchedRule, `${selector} must have a CSS rule in ${formatCssContext(context)}`);
  for (const [property, value] of Object.entries(expected)) {
    assert.equal(
      resolved.declarations.get(property)?.value,
      normalizeCssValue(value),
      `${selector} must set ${property}: ${value} in ${formatCssContext(context)}`
    );
  }
}

function assertCssSelectorGroupDeclarations(source, selectors, expected, context = []) {
  const resolved = resolveCssSelectorGroupDeclarations(source, selectors, context);
  const label = selectors.join(', ');
  assert.ok(resolved.matchedRule, `${label} must be one exact CSS selector group in ${formatCssContext(context)}`);
  for (const [property, value] of Object.entries(expected)) {
    assert.equal(
      resolved.declarations.get(property)?.value,
      normalizeCssValue(value),
      `${label} must set ${property}: ${value} in ${formatCssContext(context)}`
    );
  }
}

function assertCssDeclarationIsNot(source, selector, property, forbiddenValue, context = []) {
  const resolved = resolveCssDeclarations(source, selector, context);
  assert.ok(resolved.matchedRule, `${selector} must have a CSS rule in ${formatCssContext(context)}`);
  assert.notEqual(
    resolved.declarations.get(property)?.value,
    normalizeCssValue(forbiddenValue),
    `${selector} must not set ${property}: ${forbiddenValue} in ${formatCssContext(context)}`
  );
}

test('CSS contract reader excludes conditional rules from desktop declarations', () => {
  for (const conditionalCss of [
    '@media print { .target { display: grid; } }',
    '@supports (display: grid) { .target { display: grid; } }'
  ]) {
    assert.throws(() => assertCssDeclarations(conditionalCss, '.target', { display: 'grid' }, []));
  }
});

test('CSS contract reader applies later declarations for a repeated selector', () => {
  const repeated = '.target { display: grid; } .target { display: flex; }';
  assert.throws(() => assertCssDeclarations(repeated, '.target', { display: 'grid' }, []));
  assertCssDeclarations(repeated, '.target', { display: 'flex' }, []);
});

test('CSS contract reader honors important declarations during cascade resolution', () => {
  const important = '.target { display: grid ! /* priority */ ImPoRtAnT; } .target { display: flex; }';
  assertCssDeclarations(important, '.target', { display: 'grid' }, []);

  const laterImportant = `${important} .target { display: block !important; }`;
  assertCssDeclarations(laterImportant, '.target', { display: 'block' }, []);
});

test('CSS contract reader requires an exact unconditional 900px media context', () => {
  const landscapeOnly = `
    @media (max-width: 900px) and (orientation: landscape) {
      .target { display: grid; }
    }
  `;
  assert.throws(() => (
    assertCssDeclarations(landscapeOnly, '.target', { display: 'grid' }, MOBILE_900_CONTEXT)
  ));
});

test('CSS contract reader ignores commented-out media blocks', () => {
  const commentedOut = `
    /* @media (max-width: 900px) { .target { display: grid; } } */
    @media print { .target { display: grid; } }
  `;
  assert.throws(() => (
    assertCssDeclarations(commentedOut, '.target', { display: 'grid' }, MOBILE_900_CONTEXT)
  ));
});

test('CSS contract reader cascades across repeated exact 900px media blocks', () => {
  const repeatedMedia = `
    @media (max-width: 900px) { .target { display: grid; } }
    @media /* equivalent query */ ( max-width : 900PX ) { .target { display: none; } }
  `;
  assert.throws(() => (
    assertCssDeclarations(repeatedMedia, '.target', { display: 'grid' }, MOBILE_900_CONTEXT)
  ));
  assertCssDeclarations(repeatedMedia, '.target', { display: 'none' }, MOBILE_900_CONTEXT);
});

test('CSS contract reader tolerates strings, grouped selectors, and declaration reordering', () => {
  const validCss = `
    .decoy::before { content: "}; /* not a comment */ ; {"; }
    @media (max-width: 900px) {
      .other[data-label=",;{}/* literal */"],
      .escaped\\,comma,
      .target {
        color: var(--accent);
        width: 100%;
      }
    }
  `;
  assertCssDeclarations(validCss, '.decoy::before', {
    content: '"}; /* not a comment */ ; {"'
  });
  const groupedSelectors = [
    '.other[data-label=",;{}/* literal */"]',
    String.raw`.escaped\,comma`,
    '.target'
  ];
  assertCssSelectorGroupDeclarations(
    validCss,
    groupedSelectors,
    { width: '100%', color: 'var(--accent)' },
    MOBILE_900_CONTEXT
  );
  assert.throws(() => (
    assertCssDeclarations(validCss, '.target', { width: '100%' }, MOBILE_900_CONTEXT)
  ));
});

for (const [label, property, invalidValue, validValue] of [
  ['calc', 'max-height', 'calc (100dvh - 76px)', 'calc(100dvh - 76px)'],
  ['var', 'color', 'var (--accent)', 'var(--accent)'],
  ['transform', 'transform', 'translateX (-50%) scaleX(0)', 'translateX(-50%) scaleX(0)']
]) {
  test(`CSS value normalization preserves invalid whitespace before ${label} functions`, () => {
    assert.throws(() => (
      assertCssDeclarations(`.target { ${property}: ${invalidValue}; }`, '.target', {
        [property]: validValue
      })
    ));
  });
}

test('single-selector contracts reject a target arm inside an invalid selector group', () => {
  for (const invalidGroup of [
    '.broken > > .oops, .target { display: grid; }',
    '[], .target { display: grid; }'
  ]) {
    assert.throws(() => assertCssDeclarations(invalidGroup, '.target', { display: 'grid' }));
  }
});

test('exact A1 selector-group contracts reject an additional invalid arm', () => {
  const invalidGroup = `${UNDERLINE_REVEAL_SELECTORS.join(', ')}, .broken > > .oops {
    transform: translateX(-50%) scaleX(1);
  }`;
  assert.throws(() => assertCssSelectorGroupDeclarations(
    invalidGroup,
    UNDERLINE_REVEAL_SELECTORS,
    { transform: 'translateX(-50%) scaleX(1)' }
  ));
});

test('exact selector-group identity is order independent but multiplicity exact', () => {
  const reordered = '.b, .a { opacity: 1; }';
  assertCssSelectorGroupDeclarations(reordered, ['.a', '.b'], { opacity: '1' });

  for (const invalid of [
    '.a { opacity: 1; }',
    '.a, .b, .c { opacity: 1; }',
    '.a, .b, .b { opacity: 1; }'
  ]) {
    assert.throws(() => (
      assertCssSelectorGroupDeclarations(invalid, ['.a', '.b'], { opacity: '1' })
    ));
  }
});

test('reordered equivalent selector groups participate in source-order cascade', () => {
  const cascade = '.a, .b { opacity: 1; } .b, .a { opacity: 0; }';
  assert.throws(() => (
    assertCssSelectorGroupDeclarations(cascade, ['.a', '.b'], { opacity: '1' })
  ));
  assertCssSelectorGroupDeclarations(cascade, ['.a', '.b'], { opacity: '0' });
});

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
    const contentVersion = '20260917-consistency';
    assert.deepEqual(styles.slice(-2), [
      '<link rel="stylesheet" href="files/assets/site-theme.css?v=20260917-consistency">',
      `<link rel="stylesheet" href="files/assets/site-content.css?v=${contentVersion}">`
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

test('the shared header uses the approved A1 surface treatment', () => {
  assertCssDeclarations(theme, 'html .site-header', {
    padding: '0',
    'border-bottom': '1px solid #dfe8ed',
    background: 'rgba(255, 255, 255, 0.96)',
    'box-shadow': '0 7px 22px rgba(var(--accent-rgb), 0.05)'
  });
});

test('desktop navigation uses the balanced three-column A1 grid', () => {
  assertCssDeclarations(theme, 'html .site-header .nav-inner', {
    display: 'grid',
    'grid-template-columns': 'minmax(0, 1fr) auto minmax(0, 1fr)',
    'min-height': '68px'
  });
});

test('desktop Homepage brand is a left-aligned 44px target', () => {
  assertCssDeclarations(theme, 'html .site-header .nav-logo', {
    position: 'relative',
    'min-height': '44px',
    'justify-self': 'start'
  });
});

test('Homepage brand retains its 7px square mark', () => {
  assertCssDeclarations(theme, 'html .site-header .nav-logo::before', {
    width: '7px',
    height: '7px'
  });
});

test('current Homepage brand has a visible centered 20px marker', () => {
  assertCssDeclarations(theme, 'html .site-header .nav-logo[aria-current="page"]::after', {
    content: '""',
    position: 'absolute',
    left: '50%',
    width: '20px',
    height: '2px',
    background: 'var(--accent)',
    transform: 'translateX(-50%)'
  });
  assertCssDeclarationIsNot(
    theme,
    'html .site-header .nav-logo[aria-current="page"]::after',
    'display',
    'none'
  );
});

test('desktop primary navigation stays geometrically centered', () => {
  assertCssDeclarations(theme, 'html .site-header .nav-links', {
    'justify-content': 'center',
    'justify-self': 'center',
    width: 'max-content'
  });
});

test('desktop navigation links retain 44px interaction targets', () => {
  assertCssDeclarations(theme, 'html .site-header .nav-links a', { 'min-height': '44px' });
});

test('desktop language control uses the compact right-aligned rectangle', () => {
  assertCssDeclarations(theme, 'html .site-header .language-toggle', {
    'min-width': '58px',
    height: '36px',
    'border-radius': '8px',
    'justify-self': 'end'
  });
});

test('navigation links use a centered short underline in the hidden state', () => {
  assertCssDeclarations(theme, 'html .site-header .nav-links a::after', {
    left: '50%',
    width: '20px',
    transform: 'translateX(-50%) scaleX(0)',
    'transform-origin': 'center'
  });
});

test('the exact four-state navigation underline group reveals without shifting', () => {
  assertCssSelectorGroupDeclarations(
    theme,
    UNDERLINE_REVEAL_SELECTORS,
    { transform: 'translateX(-50%) scaleX(1)' }
  );
});

test('global keyboard focus uses a solid accent ring', () => {
  assertCssDeclarations(theme, 'html :focus-visible', { outline: '3px solid var(--accent)' });
});

test('the unified mobile menu activates at 900px and preserves its no-JavaScript fallback', () => {
  assertCssDeclarations(theme, 'html .site-header .nav-links', { display: 'flex' }, MOBILE_900_CONTEXT);
  assertCssDeclarations(
    theme,
    'html .site-header.js-mobile-nav .nav-links',
    { display: 'none' },
    MOBILE_900_CONTEXT
  );
  assertCssDeclarations(
    theme,
    'html .site-header.nav-open .nav-links',
    { display: 'flex' },
    MOBILE_900_CONTEXT
  );
  assertCssDeclarations(
    theme,
    'html .site-header.js-mobile-nav .nav-toggle',
    { display: 'inline-flex' },
    MOBILE_900_CONTEXT
  );
  assert.doesNotMatch(theme, /@media\s*\(max-width:\s*760px\)/);
});

test('mobile navigation uses the approved three-control grid row', () => {
  assertCssDeclarations(theme, 'html .site-header .nav-inner', {
    'grid-template-columns': 'minmax(0, 1fr) auto auto',
    'min-height': '64px'
  }, MOBILE_900_CONTEXT);
});

test('mobile Homepage brand retains a 44px target', () => {
  assertCssDeclarations(
    theme,
    'html .site-header .nav-logo',
    { 'min-height': '44px' },
    MOBILE_900_CONTEXT
  );
});

test('mobile language control retains a 44px target', () => {
  assertCssDeclarations(
    theme,
    'html .site-header .language-toggle',
    { height: '44px' },
    MOBILE_900_CONTEXT
  );
});

test('mobile menu toggle retains a 44px square target', () => {
  assertCssDeclarations(theme, 'html .site-header .nav-toggle', {
    width: '44px',
    height: '44px'
  }, MOBILE_900_CONTEXT);
});

test('mobile navigation links span the full grid width', () => {
  assertCssDeclarations(theme, 'html .site-header .nav-links', {
    'grid-column': '1 / -1',
    width: '100%'
  }, MOBILE_900_CONTEXT);
});

test('mobile navigation links retain 44px interaction targets', () => {
  assertCssDeclarations(
    theme,
    'html .site-header .nav-links a',
    { 'min-height': '44px' },
    MOBILE_900_CONTEXT
  );
  assertCssDeclarations(
    theme,
    'html .site-header.js-mobile-nav .nav-links a',
    { 'min-height': '44px' },
    MOBILE_900_CONTEXT
  );
});

test('enhanced mobile menu uses the inset scroll-safe panel', () => {
  assertCssDeclarations(theme, 'html .site-header.js-mobile-nav .nav-links', {
    'max-height': 'calc(100dvh - 76px)',
    'overflow-y': 'auto',
    'overscroll-behavior': 'contain',
    margin: '0 0 10px',
    padding: '6px 10px 10px',
    border: '1px solid var(--border)',
    'border-radius': '10px',
    background: '#f6f9fa'
  }, MOBILE_900_CONTEXT);
});

test('enhanced mobile menu remains one non-wrapping vertical column', () => {
  assertCssDeclarations(
    theme,
    'html .site-header.js-mobile-nav .nav-links',
    { 'flex-wrap': 'nowrap' },
    MOBILE_900_CONTEXT
  );
});

test('enhanced mobile navigation alone hides decorative underlines', () => {
  assertCssDeclarations(
    theme,
    'html .site-header.js-mobile-nav .nav-links a::after',
    { display: 'none' },
    MOBILE_900_CONTEXT
  );
});

test('no-JavaScript mobile fallback retains its current-page underline', () => {
  const fallbackUnderline = resolveCssDeclarations(
    theme,
    'html .site-header .nav-links a::after',
    MOBILE_900_CONTEXT
  );
  assert.notEqual(
    fallbackUnderline.declarations.get('display')?.value,
    normalizeCssValue('none'),
    'the broad mobile navigation underline selector must not set display: none'
  );
});

test('the exact active/current mobile group uses the inset accent state', () => {
  assertCssSelectorGroupDeclarations(
    theme,
    MOBILE_CURRENT_STATE_SELECTORS,
    {
      'border-radius': '7px',
      background: 'var(--accent-light)',
      color: 'var(--accent)',
      'box-shadow': 'inset 3px 0 0 var(--accent)'
    },
    MOBILE_900_CONTEXT
  );
});

test('navigation retains reduced-motion feedback', () => {
  assert.match(theme, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(theme, /transition-duration:\s*0\.01ms\s*!important/);
});
