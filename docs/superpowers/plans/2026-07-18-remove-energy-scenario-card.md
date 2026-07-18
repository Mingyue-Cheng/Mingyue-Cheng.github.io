# Remove Energy Scenario Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the AI for Energy Systems scenario card and rebalance the two remaining cards on both public pages.

**Architecture:** The shared card stylesheet remains the single layout source for `index.html` and `research.html`. Structural assertions in `scripts/verify-scenario-cards.mjs` protect page parity, the exact two-card order, i18n cleanup, and responsive grid constraints.

**Tech Stack:** Static HTML, CSS Grid, Node.js built-in test runner, local HTTP server, browser inspection, GitHub Pages.

---

### Task 1: Encode the two-card contract

**Files:**
- Modify: `scripts/verify-scenario-cards.mjs`

- [ ] **Step 1: Change the expected card order and counts**

Update canonical order from `science, energy, user` to `science, user`; require two articles, headings, bodies, icons, and emphasis spans on both pages.

```js
const expectedCards = ['science', 'user'];
assert.equal(countMatches(section, /<article\b/g), 2);
assert.equal(countMatches(section, /class="scenario-card__icon"/g), 2);
assert.doesNotMatch(section, /scenario-card--energy/);
```

- [ ] **Step 2: Change stylesheet assertions**

Require a centered two-column desktop grid, centered single-column responsive grid, and absence of the Energy modifier.

```js
assert.match(gridRule, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
assert.match(gridRule, /max-width:\s*900px/);
assert.match(gridRule, /margin:\s*0\s+auto/);
assert.match(mediaBlock, /max-width:\s*720px/);
assert.doesNotMatch(scenarioCss, /\.scenario-card--energy/);
```

- [ ] **Step 3: Remove Energy dictionary expectations**

Keep Science and User Modeling translations exact, and assert that `research.energyTitle` and `research.energyBody` no longer exist.

```js
for (const removedKey of ['research.energyTitle', 'research.energyBody']) {
  assert.doesNotMatch(indexHtml, new RegExp(`['"]${escapeRegex(removedKey)}['"]\\s*:`));
}
```

- [ ] **Step 4: Run the updated tests and verify RED**

Run: `node --test scripts/verify-scenario-cards.mjs`

Expected: failures showing the current pages still have three cards and the current stylesheet still has three columns.

- [ ] **Step 5: Commit the failing contract**

```bash
git add scripts/verify-scenario-cards.mjs
git commit -m "test: require two scenario cards"
```

### Task 2: Remove the Energy card and rebalance the grid

**Files:**
- Modify: `index.html`
- Modify: `research.html`
- Modify: `files/assets/scenario-cards.css`
- Test: `scripts/verify-scenario-cards.mjs`

- [ ] **Step 1: Remove the card markup from both pages**

Delete only each `<article class="scenario-card scenario-card--energy">…</article>` block. Leave the Science and User Modeling articles in that order and leave Energy Systems content elsewhere on the pages intact.

- [ ] **Step 2: Remove unused homepage translation keys**

Delete `research.energyTitle` and `research.energyBody` from both the English and Chinese dictionaries in `index.html`.

- [ ] **Step 3: Implement the centered responsive layout**

Change the shared stylesheet to:

```css
.scenario-grid {
  display: grid;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 16px;
}

@media (max-width: 900px) {
  .scenario-grid {
    max-width: 720px;
    grid-template-columns: minmax(0, 1fr);
  }
}
```

Delete the unused `.scenario-card--energy` accent rule and preserve the Science and User Modeling accents.

- [ ] **Step 4: Run the scenario tests and verify GREEN**

Run: `node --test scripts/verify-scenario-cards.mjs`

Expected: 9 tests pass, 0 fail.

- [ ] **Step 5: Check the scoped diff**

Run: `git diff --check && git diff -- index.html research.html files/assets/scenario-cards.css scripts/verify-scenario-cards.mjs`

Expected: no whitespace errors; only the card removal, i18n cleanup, grid changes, and matching assertions appear.

- [ ] **Step 6: Commit the implementation**

```bash
git add index.html research.html files/assets/scenario-cards.css
git commit -m "feat: remove energy scenario card"
```

### Task 3: Verify and publish

**Files:**
- Verify: `index.html`
- Verify: `research.html`
- Verify: `files/assets/scenario-cards.css`

- [ ] **Step 1: Inspect locally in a real browser**

Serve the worktree over HTTP and inspect the homepage and Research page at desktop, tablet, and mobile widths. Confirm two centered cards, equal desktop widths, a centered mobile column, no overflow, and correct homepage English/Chinese switching.

- [ ] **Step 2: Run final automated verification**

Run:

```bash
node --test scripts/verify-scenario-cards.mjs
git diff --check HEAD~2..HEAD
git status --short
```

Expected: all tests pass, no whitespace errors, and the worktree is clean.

- [ ] **Step 3: Integrate without unrelated files**

Fast-forward the completed branch into `main`. Verify that the pre-existing `.DS_Store`, `.superpowers/`, and `HomePage_files/Mycheng-7.jpg` changes remain untracked or unstaged.

- [ ] **Step 4: Push and verify deployment**

Push `main`, confirm `HEAD` equals `origin/main`, wait for GitHub Pages success, and check the live homepage and Research page for exactly two scenario cards and the deployed two-column stylesheet.
