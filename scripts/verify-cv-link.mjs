import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const cvPath = 'output/pdf/Mingyue_Cheng_CV_EN.pdf';
const badges = html.match(/<div class="profile-badges">([\s\S]*?)<\/div>/)?.[1] || '';
const cvLinks = [...badges.matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)]
  .filter(([, attributes]) => attributes.includes(`href="${cvPath}"`));

test('homepage profile links expose the requested English CV once', () => {
  assert.equal(cvLinks.length, 1, 'the CV belongs in the existing profile badge row');
  const [, attributes, label] = cvLinks[0];
  assert.match(attributes, /\bclass="badge"/);
  assert.match(attributes, /\btarget="_blank"/);
  assert.match(attributes, /\brel="noopener"/);
  assert.match(attributes, /\bdata-i18n="profile\.cv"/);
  assert.equal(label, 'CV (PDF)');
  assert.equal(html.split(`href="${cvPath}"`).length - 1, 1);
});

test('the CV link points to the existing PDF document', () => {
  const pdf = readFileSync(join(root, cvPath));
  assert.equal(pdf.subarray(0, 5).toString('ascii'), '%PDF-');
  assert.ok(pdf.length > 1000, 'the linked PDF must not be empty');
});

test('the CV label switches languages without changing its destination', () => {
  assert.equal(cvLinks.length, 1);
  const [, attributes, label] = cvLinks[0];
  const link = {
    innerHTML: label,
    attributes: new Map([...attributes.matchAll(/([\w-]+)="([^"]*)"/g)]
      .map(([, name, value]) => [name, value])),
    getAttribute(name) { return this.attributes.get(name) ?? null; },
    setAttribute(name, value) { this.attributes.set(name, value); }
  };
  const document = {
    documentElement: { lang: 'en' },
    querySelectorAll(selector) { return selector === '[data-i18n]' ? [link] : []; },
    getElementById() { return null; }
  };
  const dictionary = html.match(/const i18n = (\{[\s\S]*?\n\});\n\nlet currentLang/)?.[1];
  const translate = html.match(/function translatePage\(lang\) \{[\s\S]*?\n\}\n\nfunction initLanguageToggle/)?.[0]
    ?.replace(/\n\nfunction initLanguageToggle$/, '');
  assert.ok(dictionary && translate, 'use the actual homepage translation routine');
  const context = vm.createContext({ document });
  vm.runInContext(`const i18n = ${dictionary};\n${translate}`, context);
  for (const [lang, expected] of [['en', 'CV (PDF)'], ['zh', '英文简历 (PDF)'], ['en', 'CV (PDF)']]) {
    vm.runInContext(`translatePage('${lang}');`, context);
    assert.equal(link.innerHTML, expected);
    assert.equal(link.getAttribute('href'), cvPath);
  }
});
