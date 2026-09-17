import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (relativePath) => readFileSync(join(root, relativePath), 'utf8');
const count = (source, pattern) => (source.match(pattern) || []).length;
const withoutComments = (source) => source.replace(/<!--[\s\S]*?-->/g, '');

const pages = [
  {
    path: 'research.html',
    title: 'Research — Mingyue Cheng',
    description: 'Research directions of Mingyue Cheng: Prediction Intelligence, LLMs and Agentic AI, Time Series Intelligence, and applications in AI for Science, industrial and complex systems, and recommender systems.',
    currentHref: 'research.html',
    h1Class: 'page-hero-title',
    mainVisualOrder: ['page-hero', 'research-main']
  },
  {
    path: 'news.html',
    title: 'News — Mingyue Cheng',
    description: 'Latest news and updates from USTC AGI Research Group.',
    currentHref: 'news.html',
    h1Class: 'page-hero-title',
    mainVisualOrder: ['page-hero', 'news-main']
  },
  {
    path: 'projects.html',
    title: 'Open Source & Benchmarks — Mingyue Cheng',
    description: "Open source frameworks and benchmark datasets from Mingyue Cheng's research group at USTC.",
    currentHref: 'projects.html',
    h1Class: 'page-hero-title',
    mainVisualOrder: ['page-hero', 'projects-main']
  },
  {
    path: 'awards.html',
    title: 'Honors & Awards — Mingyue Cheng',
    description: 'Honors, awards, and research grants of Mingyue Cheng at USTC.',
    currentHref: 'awards.html',
    h1Class: 'page-hero-title',
    mainVisualOrder: ['page-hero', 'awards-main']
  },
  {
    path: 'service.html',
    title: 'Professional Service — Mingyue Cheng',
    description: 'Professional service of Mingyue Cheng: program committee, journal reviewer, and editorial roles.',
    currentHref: 'service.html',
    h1Class: 'page-hero-title',
    mainVisualOrder: ['page-hero', 'service-main']
  },
  {
    path: 'resources.html',
    title: 'Resources — Mingyue Cheng',
    description: 'Resources shared by Mingyue Cheng, including academic guidelines and useful documents.',
    currentHref: 'resources.html',
    h1Class: 'section-heading',
    mainVisualOrder: ['page-hero', 'resources-main']
  },
  {
    path: 'prediction-intelligence.html',
    title: 'Prediction Intelligence — Mingyue Cheng',
    description: 'Prediction Intelligence research by Mingyue Cheng: predictability analysis, failure diagnosis, adaptive enhancement, and risk calibration for interpretable forecasting and trustworthy decision support.',
    currentHref: 'research.html',
    h1Class: 'pi-hero-title',
    mainVisualOrder: ['pi-hero', 'pi-section--intro', 'pi-outcome']
  }
].map((page) => ({
  ...page,
  canonical: `https://mingyue-cheng.github.io/${page.path}`,
  html: read(page.path)
}));

const voidElements = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr'
]);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(Number.parseInt(code, 16)));
}

function attribute(tag, name) {
  const escapedName = escapeRegex(name);
  const match = tag.match(
    new RegExp(`\\s${escapedName}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i')
  );
  const value = match?.[1] ?? match?.[2] ?? match?.[3];
  return value === undefined ? undefined : decodeHtml(value);
}

function hasAttribute(tag, name) {
  return new RegExp(`\\s${escapeRegex(name)}(?=\\s|=|/?>)`, 'i').test(tag);
}

function classTokens(tag) {
  return (attribute(tag, 'class') || '').split(/\s+/).filter(Boolean);
}

function findTagEnd(source, start, label) {
  let quote = '';
  for (let index = start + 1; index < source.length; index += 1) {
    const character = source[index];
    if (quote) {
      if (character === quote) quote = '';
    } else if (character === '"' || character === "'") {
      quote = character;
    } else if (character === '>') {
      return index;
    }
  }
  assert.fail(`${label} tags must be properly nested; an opening tag is unterminated`);
}

function tagToken(raw, start, end) {
  const match = raw.match(/^<\s*(\/?)\s*([A-Za-z][\w:-]*)/);
  if (!match) return null;
  return {
    raw,
    start,
    end,
    name: match[2].toLowerCase(),
    closing: Boolean(match[1]),
    selfClosing: /\/\s*>$/.test(raw)
  };
}

function tokenizeMarkup(source, label) {
  const tokens = [];
  let cursor = 0;

  while (cursor < source.length) {
    const start = source.indexOf('<', cursor);
    if (start < 0) break;

    if (source.startsWith('<!--', start)) {
      const commentEnd = source.indexOf('-->', start + 4);
      assert.ok(commentEnd >= 0, `${label} tags must be properly nested; an HTML comment is unterminated`);
      cursor = commentEnd + 3;
      continue;
    }

    const tagEnd = findTagEnd(source, start, label);
    const raw = source.slice(start, tagEnd + 1);
    const token = tagToken(raw, start, tagEnd + 1);
    if (!token) {
      cursor = tagEnd + 1;
      continue;
    }

    if (!token.closing && !token.selfClosing && (token.name === 'script' || token.name === 'style')) {
      const closingPattern = new RegExp(`<\\/\\s*${token.name}\\s*>`, 'gi');
      closingPattern.lastIndex = tagEnd + 1;
      const closingMatch = closingPattern.exec(source);
      assert.ok(closingMatch, `${label} tags must be properly nested; <${token.name}> is unclosed`);
      tokens.push(token);
      tokens.push({
        raw: closingMatch[0],
        start: closingMatch.index,
        end: closingMatch.index + closingMatch[0].length,
        name: token.name,
        closing: true,
        selfClosing: false
      });
      cursor = closingMatch.index + closingMatch[0].length;
      continue;
    }

    tokens.push(token);
    cursor = tagEnd + 1;
  }

  return tokens;
}

function parseHtmlDocument(source, label) {
  const tokens = tokenizeMarkup(source, label);
  const documentRoot = { name: '#document', children: [], parent: null };
  const stack = [documentRoot];
  const nodes = [];

  for (const token of tokens) {
    if (token.closing) {
      const openNode = stack.at(-1);
      assert.ok(
        openNode !== documentRoot && openNode.name === token.name,
        `${label} tags must be properly nested; found </${token.name}> while <${openNode.name}> is open`
      );
      openNode.close = token;
      stack.pop();
      continue;
    }

    const parent = stack.at(-1);
    const node = { ...token, parent, children: [], close: null };
    parent.children.push(node);
    nodes.push(node);
    if (!token.selfClosing && !voidElements.has(token.name)) stack.push(node);
  }

  assert.equal(
    stack.length,
    1,
    `${label} tags must be properly nested; <${stack.at(-1).name}> is unclosed`
  );

  const htmlNodes = nodes.filter((node) => node.name === 'html');
  const headNodes = nodes.filter((node) => node.name === 'head');
  const bodyNodes = nodes.filter((node) => node.name === 'body');
  assert.equal(htmlNodes.length, 1, `${label} must contain exactly one html element`);
  assert.equal(headNodes.length, 1, `${label} must contain exactly one head element`);
  assert.equal(bodyNodes.length, 1, `${label} must contain exactly one body element`);
  assert.equal(headNodes[0].parent, htmlNodes[0], `${label} head must be inside html`);
  assert.equal(bodyNodes[0].parent, htmlNodes[0], `${label} body must be inside html`);
  assert.ok(headNodes[0].start < bodyNodes[0].start, `${label} head must precede body`);

  return {
    source,
    nodes,
    html: htmlNodes[0],
    head: headNodes[0],
    body: bodyNodes[0]
  };
}

function isInside(node, ancestor) {
  for (let parent = node.parent; parent; parent = parent.parent) {
    if (parent === ancestor) return true;
  }
  return false;
}

function descendants(document, ancestor) {
  return document.nodes.filter((node) => isInside(node, ancestor));
}

function nodeInnerSource(document, node) {
  assert.ok(node.close, `${node.name} must have a closing tag`);
  return document.source.slice(node.end, node.close.start);
}

function singleNode(nodes, predicate, message) {
  const matches = nodes.filter(predicate);
  assert.equal(matches.length, 1, message);
  return matches[0];
}

function metadataNode(headNodes, page, tagName, keyName, keyValue, label) {
  return singleNode(
    headNodes,
    (node) => node.name === tagName && (attribute(node.raw, keyName) || '').toLowerCase() === keyValue,
    `${page.path} must contain exactly one ${label} metadata tag in head`
  );
}

export function validatePageShellSource(source, page) {
  const document = parseHtmlDocument(source, page.path);
  const bodyNodes = descendants(document, document.body);
  const main = singleNode(bodyNodes, (node) => node.name === 'main', `${page.path} must contain exactly one main`);
  const h1 = singleNode(bodyNodes, (node) => node.name === 'h1', `${page.path} must contain exactly one h1`);
  const header = singleNode(bodyNodes, (node) => node.name === 'header', `${page.path} must contain exactly one header`);
  const footer = singleNode(bodyNodes, (node) => node.name === 'footer', `${page.path} must contain exactly one footer`);
  const allSkipLinks = document.nodes.filter(
    (node) => node.name === 'a' && classTokens(node.raw).includes('skip-link')
  );
  assert.equal(allSkipLinks.length, 1, `${page.path} must contain exactly one skip link`);
  const skipLink = allSkipLinks[0];

  assert.ok(isInside(skipLink, document.body), `${page.path} skip link must be inside body`);
  assert.ok(skipLink.start < header.start, `${page.path} skip link must precede the header`);
  assert.ok(header.start < main.start && main.start < footer.start, `${page.path} content order must be header, main, footer`);
  assert.ok(isInside(h1, main), `${page.path} h1 must be inside main`);
  assert.ok(classTokens(h1.raw).includes(page.h1Class), `${page.path} h1 must preserve its ${page.h1Class} visual class`);

  const mainId = attribute(main.raw, 'id');
  assert.equal(mainId, 'main-content', `${page.path} main target id`);
  assert.equal(attribute(main.raw, 'tabindex'), '-1', `${page.path} main must accept programmatic focus`);
  assert.equal(attribute(skipLink.raw, 'href'), `#${mainId}`, `${page.path} skip link target must match main id`);
  assert.ok(!hasAttribute(skipLink.raw, 'hidden'), `${page.path} skip link must not be hidden`);
  assert.notEqual((attribute(skipLink.raw, 'aria-hidden') || '').toLowerCase(), 'true', `${page.path} skip link must not be aria-hidden`);
  assert.notEqual(attribute(skipLink.raw, 'tabindex'), '-1', `${page.path} skip link must remain focusable`);
  const skipStyle = attribute(skipLink.raw, 'style') || '';
  assert.doesNotMatch(skipStyle, /\bdisplay\s*:\s*none\b/i, `${page.path} skip link must remain visible`);
  assert.doesNotMatch(skipStyle, /\bvisibility\s*:\s*hidden\b/i, `${page.path} skip link must remain visible`);

  const mainNodes = descendants(document, main);
  let previousPosition = -1;
  for (const visualClass of page.mainVisualOrder) {
    const visualNode = mainNodes.find((node) => classTokens(node.raw).includes(visualClass));
    assert.ok(visualNode, `${page.path} must preserve the ${visualClass} visual class in main`);
    assert.ok(
      visualNode.start > previousPosition,
      `${page.path} main content order must preserve ${page.mainVisualOrder.join(' before ')}`
    );
    previousPosition = visualNode.start;
  }
}

export function validatePageNavigationSource(source, page) {
  const document = parseHtmlDocument(source, page.path);
  const bodyNodes = descendants(document, document.body);
  const nav = singleNode(
    bodyNodes,
    (node) => node.name === 'nav' && classTokens(node.raw).includes('nav-links'),
    `${page.path} must contain one primary nav-links element`
  );
  const currentLinks = descendants(document, nav).filter(
    (node) => node.name === 'a' && (attribute(node.raw, 'aria-current') || '').toLowerCase() === 'page'
  );

  assert.equal(currentLinks.length, 1, `${page.path} must have one aria-current="page" nav link`);
  assert.equal(attribute(currentLinks[0].raw, 'href'), page.currentHref, `${page.path} current nav destination`);
  assert.ok(classTokens(currentLinks[0].raw).includes('active'), `${page.path} current nav link must be visually active`);

  const headStyles = descendants(document, document.head)
    .filter((node) => node.name === 'style')
    .map((node) => nodeInnerSource(document, node))
    .join('\n');
  const activeRule = headStyles.match(/\.nav-links a\.active\s*\{([^}]*)\}/s)?.[1] || '';
  assert.match(activeRule, /color:\s*var\(--accent\)/, `${page.path} active nav state must set the accent color`);
  assert.match(activeRule, /font-weight:\s*600/, `${page.path} active nav state must set a visible font weight`);
}

export function validatePageMetadataSource(source, page) {
  const document = parseHtmlDocument(source, page.path);
  const headNodes = descendants(document, document.head);
  const titleNode = singleNode(
    headNodes,
    (node) => node.name === 'title',
    `${page.path} must contain exactly one title in head`
  );
  assert.equal(titleNode.children.length, 0, `${page.path} title must contain text only`);
  const title = decodeHtml(nodeInnerSource(document, titleNode)).replace(/\s+/g, ' ').trim();

  const descriptionNode = metadataNode(headNodes, page, 'meta', 'name', 'description', 'description');
  const canonicalNode = singleNode(
    headNodes,
    (node) => node.name === 'link' && (attribute(node.raw, 'rel') || '').toLowerCase().split(/\s+/).includes('canonical'),
    `${page.path} must contain exactly one canonical metadata tag in head`
  );
  const ogTypeNode = metadataNode(headNodes, page, 'meta', 'property', 'og:type', 'og:type');
  const ogTitleNode = metadataNode(headNodes, page, 'meta', 'property', 'og:title', 'og:title');
  const ogDescriptionNode = metadataNode(headNodes, page, 'meta', 'property', 'og:description', 'og:description');
  const ogUrlNode = metadataNode(headNodes, page, 'meta', 'property', 'og:url', 'og:url');
  const twitterCardNode = metadataNode(headNodes, page, 'meta', 'name', 'twitter:card', 'twitter:card');

  const description = attribute(descriptionNode.raw, 'content');
  const canonical = attribute(canonicalNode.raw, 'href');
  assert.equal(title, page.title, `${page.path} head title must use existing page copy`);
  assert.equal(description, page.description, `${page.path} head description must use existing page copy`);
  assert.equal(canonical, page.canonical, `${page.path} head canonical must match its public URL`);
  assert.equal(attribute(ogTypeNode.raw, 'content'), 'website', `${page.path} og:type`);
  assert.equal(attribute(ogTitleNode.raw, 'content'), title, `${page.path} og:title must match head title`);
  assert.equal(attribute(ogDescriptionNode.raw, 'content'), description, `${page.path} og:description must match head description`);
  assert.equal(attribute(ogUrlNode.raw, 'content'), canonical, `${page.path} og:url must match head canonical`);
  assert.equal(attribute(twitterCardNode.raw, 'content'), 'summary', `${page.path} twitter:card`);
}

export function validatePageChromeSource(source, page) {
  const document = parseHtmlDocument(source, page.path);
  const bodyNodes = descendants(document, document.body);
  const footer = singleNode(bodyNodes, (node) => node.name === 'footer', `${page.path} must contain one footer`);
  const footerSource = nodeInnerSource(document, footer);
  assert.equal(
    count(footerSource, /Last updated in August 2026\./g),
    1,
    `${page.path} must contain one August 2026 footer timestamp`
  );
  assert.doesNotMatch(footerSource, /Last updated in July 2026\./, `${page.path} must not retain the July footer`);
  const languageVersion = page.path === 'awards.html' ? '20260916-grants' : '20260831';
  const languageScripts = document.nodes.filter(
    (node) => node.name === 'script' && attribute(node.raw, 'src') === `files/assets/site-language.js?v=${languageVersion}`
  );
  assert.equal(languageScripts.length, 1, `${page.path} must load the current site-language.js cache key once`);
}

export function validateRobotsSource(source) {
  const robots = source;
  assert.match(robots, /^User-agent:\s*\*$/m);
  assert.match(robots, /^Allow:\s*\/$/m);
  assert.match(robots, /^Sitemap:\s*https:\/\/mingyue-cheng\.github\.io\/sitemap\.xml$/m);
}

export function validateSitemapSource(sitemap, expectedUrls) {
  const cleanSitemap = withoutComments(sitemap);
  const rootMatch = cleanSitemap.match(
    /^\s*(?:<\?xml[^?]*\?>\s*)?<urlset\b([^>]*)>([\s\S]*)<\/urlset>\s*$/i
  );
  assert.ok(rootMatch, 'sitemap must contain one complete urlset root');
  const urlsetTag = `<urlset${rootMatch[1]}>`;
  assert.equal(
    attribute(urlsetTag, 'xmlns'),
    'http://www.sitemaps.org/schemas/sitemap/0.9',
    'sitemap urlset must use the sitemap namespace'
  );
  const urlsetBody = rootMatch[2];
  const openingUrls = [...urlsetBody.matchAll(/<url\b[^>]*>/gi)];
  const closingUrls = [...urlsetBody.matchAll(/<\/url\s*>/gi)];
  assert.equal(expectedUrls.length, 9, 'sitemap expectation must contain exactly 9 URLs');
  assert.equal(openingUrls.length, 9, 'sitemap must contain exactly 9 url opening tags');
  assert.equal(closingUrls.length, 9, 'sitemap must contain exactly 9 url closing tags');

  const blockPattern = /<url\b([^>]*)>([\s\S]*?)<\/url\s*>/gi;
  const blocks = [...urlsetBody.matchAll(blockPattern)];
  assert.equal(blocks.length, 9, 'sitemap must contain exactly 9 complete url blocks');
  assert.equal(
    urlsetBody.replace(blockPattern, '').trim(),
    '',
    'sitemap urlset must contain only complete url blocks'
  );

  const entries = blocks.map((block, index) => {
    assert.equal(block[1].trim(), '', `sitemap url block ${index + 1} must not have attributes`);
    const content = block[2].match(
      /^\s*<loc>([^<]+)<\/loc>\s*<lastmod>([^<]+)<\/lastmod>\s*$/i
    );
    assert.ok(
      content,
      `sitemap url block ${index + 1} must contain exactly one loc and one lastmod`
    );
    return { loc: decodeHtml(content[1].trim()), lastmod: content[2].trim() };
  });

  assert.equal(new Set(entries.map((entry) => entry.loc)).size, 9, 'sitemap URLs must be unique');
  assert.deepEqual(entries.map((entry) => entry.loc), expectedUrls, 'sitemap URLs must match the public page set');
  for (const entry of entries) {
    assert.equal(entry.lastmod, '2026-08-31', `${entry.loc} must use the current lastmod`);
  }
}

const expectedSitemapUrls = [
  'https://mingyue-cheng.github.io/',
  'https://mingyue-cheng.github.io/research.html',
  'https://mingyue-cheng.github.io/news.html',
  'https://mingyue-cheng.github.io/publications.html',
  'https://mingyue-cheng.github.io/projects.html',
  'https://mingyue-cheng.github.io/awards.html',
  'https://mingyue-cheng.github.io/service.html',
  'https://mingyue-cheng.github.io/resources.html',
  'https://mingyue-cheng.github.io/prediction-intelligence.html'
];

test('owned pages have one keyboard-focusable semantic shell and balanced landmarks', () => {
  for (const page of pages) validatePageShellSource(page.html, page);
});

test('owned pages expose one visually active current navigation link', () => {
  for (const page of pages) validatePageNavigationSource(page.html, page);
});

test('owned pages provide canonical, Open Graph, and Twitter metadata from existing copy', () => {
  for (const page of pages) validatePageMetadataSource(page.html, page);
});

test('owned pages use the August 2026 footer and the current shared-script cache key', () => {
  for (const page of pages) validatePageChromeSource(page.html, page);
});

test('root robots and sitemap publish all public page URLs with the current lastmod', () => {
  assert.ok(existsSync(join(root, 'robots.txt')), 'robots.txt must exist at the repository root');
  assert.ok(existsSync(join(root, 'sitemap.xml')), 'sitemap.xml must exist at the repository root');

  validateRobotsSource(read('robots.txt'));
  validateSitemapSource(read('sitemap.xml'), expectedSitemapUrls);
});

function pageFixture(path = 'news.html') {
  const page = pages.find((candidate) => candidate.path === path);
  assert.ok(page, `Missing page fixture: ${path}`);
  return page;
}

test('mutation: rejects an h1 whose closing tag crosses the main boundary', () => {
  const page = pageFixture();
  const mutant = page.html
    .replace('</h1>', '')
    .replace('</main>', '</main></h1>');

  assert.throws(
    () => validatePageShellSource(mutant, page),
    /properly nested|inside main/i
  );
});

test('mutation: rejects a skip link moved outside the body', () => {
  const page = pageFixture();
  const skipLink = page.html.match(/<a class="skip-link"[^>]*>[^<]*<\/a>/)?.[0] || '';
  assert.ok(skipLink, 'fixture skip link');
  const mutant = page.html
    .replace(skipLink, '')
    .replace('</head>', `${skipLink}\n</head>`);

  assert.throws(
    () => validatePageShellSource(mutant, page),
    /skip link.*body/i
  );
});

for (const [label, attributeText] of [
  ['hidden', 'hidden'],
  ['aria-hidden', 'aria-hidden="true"'],
  ['negative tabindex', 'tabindex="-1"'],
  ['display none', 'style="display: none"'],
  ['hidden visibility', 'style="visibility: hidden"']
]) {
  test(`mutation: rejects a skip link with ${label}`, () => {
    const page = pageFixture();
    const mutant = page.html.replace(
      '<a class="skip-link"',
      `<a class="skip-link" ${attributeText}`
    );

    assert.throws(
      () => validatePageShellSource(mutant, page),
      /skip link.*(?:focusable|hidden|visible)/i
    );
  });
}

test('mutation: rejects Open Graph metadata that exists only inside script raw text', () => {
  const page = pageFixture();
  const ogTitle = page.html.match(/\s*<meta property="og:title"[^>]*>\s*/)?.[0] || '';
  assert.ok(ogTitle, 'fixture og:title');
  const mutant = page.html
    .replace(ogTitle, '\n')
    .replace('</head>', `  <script type="application/json">${ogTitle.trim()}</script>\n</head>`);

  assert.throws(
    () => validatePageMetadataSource(mutant, page),
    /og:title.*head/i
  );
});

test('mutation: rejects Open Graph values that disagree with head title and description', () => {
  const page = pageFixture();
  const mutant = page.html.replace(
    '<meta property="og:description" content="Latest news and updates from USTC AGI Research Group.">',
    '<meta property="og:description" content="A different description.">'
  );

  assert.throws(
    () => validatePageMetadataSource(mutant, page),
    /og:description.*(?:match|description|expected content)/i
  );
});

test('mutation: rejects reordered main visual regions', () => {
  const page = pageFixture();
  const heroStart = page.html.indexOf('<div class="page-hero">');
  const contentStart = page.html.indexOf('<div class="news-main">', heroStart);
  const mainEnd = page.html.indexOf('</main>', contentStart);
  assert.ok(heroStart >= 0 && contentStart > heroStart && mainEnd > contentStart, 'fixture main regions');
  const mutant = [
    page.html.slice(0, heroStart),
    page.html.slice(contentStart, mainEnd),
    page.html.slice(heroStart, contentStart),
    page.html.slice(mainEnd)
  ].join('');

  assert.throws(
    () => validatePageShellSource(mutant, page),
    /content order|visual class/i
  );
});

test('mutation: rejects replacing the page h1 visual class', () => {
  const page = pageFixture();
  const mutant = page.html.replace('class="page-hero-title"', 'class="mutated-title"');

  assert.throws(
    () => validatePageShellSource(mutant, page),
    /h1.*visual class/i
  );
});

test('mutation: rejects incomplete and structurally invalid sitemap url blocks', () => {
  const sitemap = read('sitemap.xml');
  const mutants = [
    sitemap.replace(
      '</urlset>',
      '  <url><loc>https://mingyue-cheng.github.io/incomplete.html</loc>\n</urlset>'
    ),
    sitemap.replace(
      '<lastmod>2026-08-31</lastmod>',
      '<lastmod>2026-08-31</lastmod><changefreq>monthly</changefreq>'
    ),
    sitemap.replace(
      '<loc>https://mingyue-cheng.github.io/</loc>',
      '<loc>https://mingyue-cheng.github.io/</loc><loc>https://mingyue-cheng.github.io/duplicate.html</loc>'
    ),
    sitemap.replace(
      '<loc>https://mingyue-cheng.github.io/research.html</loc>',
      '<loc>https://mingyue-cheng.github.io/</loc>'
    )
  ];

  for (const mutant of mutants) {
    assert.throws(
      () => validateSitemapSource(mutant, expectedSitemapUrls),
      /url.*(?:opening|closing|block|loc|lastmod|exactly|unique)/i
    );
  }
});
