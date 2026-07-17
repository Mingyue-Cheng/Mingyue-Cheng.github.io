# Scenario Card Justified Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the shared scenario-card module with aligned internal geometry and controlled two-edge body-text justification on both homepage surfaces.

**Architecture:** Keep the existing semantic HTML and content unchanged. Update the focused Node verifier first, then implement the new contract only in the shared scenario stylesheet so `index.html` and `research.html` remain synchronized.

**Tech Stack:** Static CSS, Node.js built-in test runner, local HTTP preview, Codex in-app Browser, GitHub Pages

**Design spec:** `docs/superpowers/specs/2026-07-17-scenario-card-justified-layout-design.md`

---

### Task 1: Define the new shared layout contract

**Files:**
- Modify: `scripts/verify-scenario-cards.mjs:74-96`
- Test: `scripts/verify-scenario-cards.mjs`

- [ ] **Step 1: Replace the old left-alignment assertions with the new contract**

Inside `shared stylesheet implements the approved visual and responsive contract`, add these exact checks:

```js
  const card = cssRule(scenarioCss, '.scenario-card');
  for (const declaration of ['display: flex;', 'flex-direction: column;']) {
    assert.ok(card.includes(declaration), `Missing card layout declaration: ${declaration}`);
  }

  const header = cssRule(scenarioCss, '.scenario-card-header');
  assert.ok(header.includes('min-height: 68px;'), 'Desktop card headers must share a minimum height');

  for (const selector of ['.scenario-card-body', '.research-section .scenario-card-body']) {
    const body = cssRule(scenarioCss, selector);
    for (const declaration of [
      'text-align: justify;',
      'text-align-last: left;',
      'text-justify: inter-word;',
      'hyphens: none;',
      '-webkit-hyphens: none;',
      'word-break: normal;'
    ]) {
      assert.ok(body.includes(declaration), `Missing ${selector} declaration: ${declaration}`);
    }
  }
```

Retain the existing grid, breakpoint, hover, reduced-motion, modifier, and pointer-cursor assertions.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test --test-name-pattern="shared stylesheet implements" scripts/verify-scenario-cards.mjs
```

Expected: FAIL because `.scenario-card` does not yet declare `display: flex` and the body still declares `text-align: left`.

### Task 2: Implement aligned card geometry and controlled justification

**Files:**
- Modify: `files/assets/scenario-cards.css`
- Test: `scripts/verify-scenario-cards.mjs`

- [ ] **Step 1: Update the shared card shell and accent**

Add the following declarations to the existing rules:

```css
.scenario-card {
  display: flex;
  flex-direction: column;
}

.scenario-card-accent {
  flex: 0 0 4px;
}
```

- [ ] **Step 2: Align desktop headers and normalize horizontal padding**

Update the header rule to include the shared minimum height and `20px` horizontal padding:

```css
.scenario-card-header {
  display: flex;
  min-height: 68px;
  align-items: center;
  gap: 11px;
  padding: 18px 20px 10px;
}
```

- [ ] **Step 3: Apply controlled two-edge alignment to body copy**

Replace the existing body alignment declarations with:

```css
.scenario-card-body {
  flex: 1;
  margin: 0;
  padding: 0 20px 21px;
  color: var(--text);
  font-size: 13.5px;
  line-height: 1.67;
  text-align: justify;
  text-align-last: left;
  text-justify: inter-word;
  hyphens: none;
  -webkit-hyphens: none;
  overflow-wrap: normal;
  word-break: normal;
}

.research-section .scenario-card-body {
  text-align: justify;
  text-align-last: left;
  text-justify: inter-word;
  hyphens: none;
  -webkit-hyphens: none;
  word-break: normal;
}
```

- [ ] **Step 4: Release the shared header height in one-column layouts**

Inside the existing `@media (max-width: 900px)` block, add:

```css
  .scenario-card-header {
    min-height: 0;
  }
```

Keep the existing `480px` padding overrides.

- [ ] **Step 5: Run the complete verifier and confirm GREEN**

Run:

```bash
node --test scripts/verify-scenario-cards.mjs
git diff --check
```

Expected: all focused tests pass with zero failures and `git diff --check` emits no output.

### Task 3: Verify the rendered module and publish narrowly

**Files:**
- Modify: `docs/superpowers/plans/2026-07-17-scenario-card-justified-layout.md`
- Modify: `files/assets/scenario-cards.css`
- Modify: `scripts/verify-scenario-cards.mjs`

- [ ] **Step 1: Preview both pages at desktop and mobile widths**

Run a local static server and inspect `index.html` and `research.html` at `1440px`, `901px`, `834px`, and `390px`. Confirm:

- three equal desktop columns above `900px`;
- aligned card tops, bottoms, header/body starts, and horizontal padding;
- justified body lines with left-aligned final lines and no split English words;
- one-column layout at `834px` and `390px`;
- no horizontal overflow.

- [ ] **Step 2: Stage only the intended files and commit**

Run:

```bash
git add docs/superpowers/plans/2026-07-17-scenario-card-justified-layout.md files/assets/scenario-cards.css scripts/verify-scenario-cards.mjs
git diff --cached --name-only
git diff --cached --check
git commit -m "Refine scenario card alignment"
```

Expected: the commit contains only the plan, shared CSS, and focused verifier.

- [ ] **Step 3: Push and verify GitHub Pages**

Run:

```bash
git push origin main
git fetch origin main
git rev-list --left-right --count HEAD...origin/main
```

Expected: push succeeds and the ahead/behind count is `0 0`. After the Pages workflow succeeds, both public pages load the updated stylesheet and render the aligned module.
