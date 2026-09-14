import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const newsSource = html.match(/\/\/ ===== Latest News Disclosure =====([\s\S]*?)\/\/ ===== Publication Year Collapse/)?.[1] || '';
const dictionary = html.match(/const i18n = (\{[\s\S]*?\n\});\n\nlet currentLang/)[1];
const translate = html.match(/function translatePage\(lang\) \{[\s\S]*?\n\}\n\nfunction initLanguageToggle/)[0]
  .replace(/\n\nfunction initLanguageToggle$/, '');

function newsHarness(count = 20, present = true) {
  const items = Array.from({ length: count }, () => ({ tagName: 'LI', hidden: false }));
  const attrs = new Map([['data-i18n', 'news.expand']]);
  const handlers = new Map();
  const button = {
    hidden: true, textContent: '', innerHTML: '',
    setAttribute: (name, value) => attrs.set(name, String(value)),
    getAttribute: (name) => attrs.get(name),
    addEventListener: (event, handler) => handlers.set(event, handler),
    click: () => handlers.get('click')?.()
  };
  const document = {
    documentElement: { lang: 'en' },
    getElementById: (id) => !present ? null : id === 'newsList' ? { children: items } : id === 'newsToggle' ? button : null,
    querySelectorAll: (selector) => selector === '[data-i18n]' ? [button] : []
  };
  assert.ok(newsSource, 'Homepage news disclosure must be present');
  const context = vm.createContext({ document });
  vm.runInContext(`const i18n = ${dictionary}; let currentLang = 'en'; ${translate}\n${newsSource}`, context);
  return { items, button, context, document };
}

test('homepage news keeps six recent items and can reveal every original item', () => {
  const { items, button } = newsHarness();
  assert.equal(items.filter((item) => !item.hidden).length, 6);
  assert.equal(button.hidden, false);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
  button.click();
  assert.equal(items.filter((item) => !item.hidden).length, 20);
  assert.equal(button.getAttribute('aria-expanded'), 'true');
  assert.equal(button.getAttribute('data-i18n'), 'news.collapse');
  button.click();
  assert.equal(items.filter((item) => !item.hidden).length, 6);
  assert.equal(button.getAttribute('aria-expanded'), 'false');
});

test('news disclosure label follows the existing language switch without resetting expansion', () => {
  const { items, button, context } = newsHarness();
  button.click();
  vm.runInContext("currentLang = 'zh'; translatePage('zh');", context);
  assert.equal(button.innerHTML, '收起较早动态');
  assert.equal(items.filter((item) => !item.hidden).length, 20);
  button.click();
  assert.equal(button.textContent, '展开全部动态');
});

test('news needs no disclosure when six or fewer items exist and tolerates missing markup', () => {
  for (const count of [0, 3, 6]) {
    const { items, button } = newsHarness(count);
    assert.equal(button.hidden, true);
    assert.equal(items.every((item) => !item.hidden), true);
  }
  assert.doesNotThrow(() => newsHarness(0, false));
});

test('news progressively enhances accessible markup without hiding source entries', () => {
  const list = html.match(/<ul class="news-list" id="newsList">([\s\S]*?)<\/ul>/)[1];
  assert.equal((list.match(/<li>/g) || []).length, 20);
  assert.doesNotMatch(list, /<li[^>]*\bhidden\b/);
  const button = html.match(/<button\b[^>]*id="newsToggle"[^>]*>/)?.[0];
  assert.ok(button, 'News uses a native disclosure button');
  assert.match(button, /type="button"/);
  assert.match(button, /aria-controls="newsList"/);
  assert.match(button, /\bhidden\b/);
});
