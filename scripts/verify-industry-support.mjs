import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const root = new URL('../', import.meta.url);
const html = readFileSync(new URL('index.html', root), 'utf8');
const css = readFileSync(new URL('files/assets/site-content.css', root), 'utf8');
const grants = html.split('<!-- ===== Research Grants ===== -->')[1]?.split('<!-- ===== Related Links ===== -->')[0] || '';
const brands = ['iflytek', 'huawei', 'tencent', 'kuaishou'];
const names = ['科大讯飞 iFLYTEK', '华为 Huawei', '腾讯 Tencent', '快手 Kuaishou'];
const sources = brands.map((brand) => `files/assets/industry/${brand}.png`);

test('homepage requests the refreshed content stylesheet after the logo update', () => {
  const href = html.match(/href="(files\/assets\/site-content\.css[^\"]*)"/)?.[1];
  assert.equal(href, 'files/assets/site-content.css?v=20260914-justify');
});

test('the five public grants stay in the timeline with industry support separate', () => {
  const timeline = grants.match(/<ul class="timeline-list">([\s\S]*?)<\/ul>/)?.[1] || '';
  assert.deepEqual([...timeline.matchAll(/data-i18n="([^"]+)"/g)].map((match) => match[1]), [
    'grants.newGenerationAI', 'grants.casPriority', 'grants.nsfc', 'grants.ustc', 'grants.anhui',
  ]);
  assert.match(grants, /<\/ul>\s*<div class="industry-support">/);
});

test('industry logos have the exact requested order and accessible image metadata', () => {
  const logos = [...grants.matchAll(/<img\b[^>]*>/g)].map(([tag]) => tag);
  assert.deepEqual(logos.map((tag) => tag.match(/src="([^"]+)"/)?.[1]), sources);
  logos.forEach((tag, index) => {
    assert.equal(tag.match(/alt="([^"]+)"/)?.[1], names[index]);
    assert.match(tag, /width="[1-9]\d*"/);
    assert.match(tag, /height="[1-9]\d*"/);
    assert.match(tag, /loading="lazy"/);
  });
  assert.match(grants, /<ul class="industry-support-logos" aria-labelledby="industry-support-label">/);
});

test('all logos are local PNG assets with documented official sources', () => {
  for (const source of sources) {
    const path = new URL(source, root);
    assert.ok(existsSync(path), `Missing logo: ${source}`);
    const bytes = readFileSync(path);
    assert.equal(bytes.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', source);
    assert.ok(bytes.length > 100, source);
  }
  const provenancePath = new URL('files/assets/industry/README.md', root);
  assert.ok(existsSync(provenancePath), 'Keep official source attribution with the assets');
  const provenance = readFileSync(provenancePath, 'utf8');
  for (const domain of ['huawei.com', 'tencent.com', 'kuaishou.com', 'iflytek.com']) {
    assert.ok(provenance.includes(domain), `Missing source: ${domain}`);
  }
});

test('bilingual industry copy is concise and translation cannot replace the logos', () => {
  const literal = html.match(/const i18n = (\{[\s\S]*?\n\});\n\nlet currentLang/)?.[1];
  assert.ok(literal, 'Homepage i18n dictionary exists');
  const i18n = vm.runInNewContext(`(${literal})`);
  assert.equal(i18n.en['grants.industry'], 'My research is also partially supported by industry grants from:');
  assert.equal(i18n.zh['grants.industry'], '部分研究亦获得以下企业科研项目支持：');
  assert.match(grants, /<p id="industry-support-label" class="industry-support-copy" data-i18n="grants.industry">[^<]+<\/p>\s*<ul class="industry-support-logos"/);
  const support = grants.slice(grants.indexOf('<div class="industry-support">'));
  assert.equal([...support.matchAll(/data-i18n=/g)].length, 1, 'Only the sentence is translated, not the logo container');
  assert.doesNotMatch(support, /<a\b|<script\b/);
});

test('logo layout is four columns on desktop and two on small screens without image distortion', () => {
  assert.match(css, /\.industry-support-logos\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(css, /@media\s*\(max-width:\s*600px\)\s*\{\s*\.industry-support-logos\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  const imageRule = css.match(/\.industry-support-logo img\s*\{([^}]+)\}/)?.[1] || '';
  assert.match(imageRule, /max-width:\s*100%/);
  assert.match(imageRule, /height:\s*auto/);
  assert.match(imageRule, /object-fit:\s*contain/);
  assert.doesNotMatch(imageRule, /filter:|transform:|animation:/);
});
