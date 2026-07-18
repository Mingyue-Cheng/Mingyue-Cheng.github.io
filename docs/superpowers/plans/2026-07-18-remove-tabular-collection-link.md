# Remove Tabular Data Mining Collection Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the `Tabular Data Mining` research-collection link from the homepage and Research page while preserving the publication filter and SEO research descriptions.

**Architecture:** Keep the existing HTML and translation structure. Add one regression test around the collection surfaces, then remove only the matching collection anchors and separators from `index.html` and `research.html`.

**Tech Stack:** Static HTML, inline JavaScript translations, Node.js built-in test runner, GitHub Pages

---

### Task 1: Add the collection-removal regression contract

**Files:**
- Modify: `scripts/verify-scenario-cards.mjs`
- Test: `scripts/verify-scenario-cards.mjs`

- [ ] **Step 1: Add a focused failing test**

Add this test after the homepage dictionary test:

```js
test('research collections omit Tabular Data Mining without changing publication taxonomy', () => {
  const homepageSection = sectionBetween(
    indexHtml,
    '<!-- ===== Research Interests ===== -->',
    '<!-- ===== Latest News ===== -->'
  );
  const collectionTranslations = decodedTranslationEntries('research.collections');

  for (const [name, source] of [
    ['homepage collection', homepageSection],
    ['research page', researchHtml],
    ...collectionTranslations.map((source, index) => [`collection translation ${index + 1}`, source])
  ]) {
    assert.doesNotMatch(source, /ustc-table-mining\.github\.io|🧮/, `${name} must omit Tabular Data Mining`);
  }

  assert.match(
    indexHtml,
    /<button class="pub-filter-btn" data-filter="table" data-i18n="pub\.filterTable">Tabular Data Mining<\/button>/
  );
  assert.match(indexHtml, /<meta property="og:description" content="[^"]*Tabular Data Mining\."/);
  assert.match(indexHtml, /<meta name="twitter:description" content="[^"]*Tabular Data Mining\."/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test --test-name-pattern="research collections omit" scripts/verify-scenario-cards.mjs
```

Expected: FAIL because the collection link still appears in the homepage, translations, and Research page.

### Task 2: Remove the synchronized collection links

**Files:**
- Modify: `index.html`
- Modify: `research.html`
- Test: `scripts/verify-scenario-cards.mjs`

- [ ] **Step 1: Remove the homepage anchor and separator**

Delete this line from the visible `research.collections` block in `index.html`:

```html
      🧮 <a href="https://ustc-table-mining.github.io/" target="_blank" rel="noopener">Tabular Data Mining</a> ·
```

- [ ] **Step 2: Remove the link from both homepage translation strings**

In both English and Chinese `research.collections` values, remove:

```html
 · 🧮 <a href="https://ustc-table-mining.github.io/" target="_blank" rel="noopener">Tabular Data Mining</a>
```

Keep the separator between `Time Series Analysis` and `AI for Science`.

- [ ] **Step 3: Remove the Research page anchor**

In `research.html`, remove the separator after `Scientific Knowledge Cognition` and delete:

```html
      <a href="https://ustc-table-mining.github.io/" target="_blank" rel="noopener">Tabular Data Mining</a>
```

- [ ] **Step 4: Run the complete verifier and formatting check**

Run:

```bash
node --test scripts/verify-scenario-cards.mjs
git diff --check
```

Expected: all tests pass with zero failures and `git diff --check` emits no output.

### Task 3: Preview and publish

**Files:**
- Modify: `docs/superpowers/plans/2026-07-18-remove-tabular-collection-link.md`
- Modify: `index.html`
- Modify: `research.html`
- Modify: `scripts/verify-scenario-cards.mjs`

- [ ] **Step 1: Preview the homepage collection line in English and Chinese**

Open `index.html` locally, verify `LLMs and Agentic AI`, `Time Series Analysis`, and `AI for Science` remain in order, then switch to Chinese and confirm the removed link does not return.

- [ ] **Step 2: Stage only the intended implementation files and commit**

```bash
git add docs/superpowers/plans/2026-07-18-remove-tabular-collection-link.md index.html research.html scripts/verify-scenario-cards.mjs
git diff --cached --name-only
git diff --cached --check
git commit -m "Remove tabular collection link"
```

- [ ] **Step 3: Push and verify GitHub Pages**

```bash
git push origin main
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
```

Expected: the ahead/behind count is `0 0`, the Pages workflow succeeds, and neither live research-collection surface contains the removed link.
