# Scenario Grid Edge Alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the two scenario cards align with both outer edges of their shared section on the homepage and Research page.

**Architecture:** Keep the shared stylesheet as the only layout source for both pages. Replace the centered capped grid contract with a full-width contract, while retaining the existing desktop two-column and responsive single-column behavior.

**Tech Stack:** Static CSS Grid, Node.js built-in test runner, in-app browser verification, GitHub Pages.

---

### Task 1: Encode the full-width grid contract

**Files:**
- Modify: `scripts/verify-scenario-cards.mjs`

- [ ] **Step 1: Update the base-grid assertions**

Require only the effective full-width and two-column declarations, and reject desktop cap/centering declarations:

```js
assertFinalDeclarations(
  baseGridRules[0].body,
  {
    'grid-template-columns': 'repeat(2, minmax(0, 1fr))',
    width: '100%'
  },
  'Base scenario grid'
);
assert.equal(finalDeclarationValue(baseGridRules[0].body, 'max-width'), undefined);
assert.equal(finalDeclarationValue(baseGridRules[0].body, 'margin'), undefined);
```

- [ ] **Step 2: Update the responsive-grid assertions**

Require the existing one-column declaration and reject the responsive width cap:

```js
assertFinalDeclarations(
  responsiveGridRules[0].body,
  { 'grid-template-columns': 'minmax(0, 1fr)' },
  'Responsive scenario grid'
);
assert.equal(finalDeclarationValue(responsiveGridRules[0].body, 'max-width'), undefined);
```

- [ ] **Step 3: Run the verifier and confirm RED**

Run: `node --test --test-name-pattern="shared stylesheet implements" scripts/verify-scenario-cards.mjs`

Expected: FAIL because the current stylesheet still ends with desktop `max-width: 900px`, `margin: 0 auto`, and responsive `max-width: 720px`.

- [ ] **Step 4: Commit the failing contract**

```bash
git add scripts/verify-scenario-cards.mjs
git commit -m "test: require edge-aligned scenario grid"
```

### Task 2: Stretch the shared scenario grid

**Files:**
- Modify: `files/assets/scenario-cards.css`
- Test: `scripts/verify-scenario-cards.mjs`

- [ ] **Step 1: Remove the desktop cap and centering**

Keep the base grid as:

```css
.scenario-grid {
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  align-items: stretch;
  gap: 16px;
}
```

- [ ] **Step 2: Remove the responsive cap**

Keep the responsive rule as:

```css
@media (max-width: 900px) {
  .scenario-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 12px;
  }
}
```

- [ ] **Step 3: Run all tests and confirm GREEN**

Run: `node --test scripts/verify-scenario-cards.mjs`

Expected: 9 tests pass, 0 fail.

- [ ] **Step 4: Check and commit the scoped diff**

Run: `git diff --check && git diff -- files/assets/scenario-cards.css scripts/verify-scenario-cards.mjs`

Expected: only removal of the three centering/cap declarations and matching verifier changes.

```bash
git add files/assets/scenario-cards.css
git commit -m "Align scenario cards to section edges"
```

### Task 3: Verify and publish

**Files:**
- Verify: `index.html`
- Verify: `research.html`
- Verify: `files/assets/scenario-cards.css`

- [ ] **Step 1: Inspect both pages in a real browser**

At desktop width, confirm the grid width equals its parent width and its left/right gaps are both zero. At `900px` and mobile widths, confirm one full-width column and no horizontal overflow.

- [ ] **Step 2: Run final verification**

Run: `node --test scripts/verify-scenario-cards.mjs && git diff --check`

Expected: 9 tests pass, no whitespace errors, and a clean feature worktree.

- [ ] **Step 3: Integrate and publish**

Fast-forward into `main`, keep pre-existing unrelated worktree files untouched, push `main`, wait for GitHub Pages success, verify the live CSS, and refresh the existing Codex preview.
