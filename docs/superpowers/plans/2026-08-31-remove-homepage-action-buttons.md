# Remove Homepage Action Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the three homepage hero action buttons and all code used only by them.

**Architecture:** Keep the existing hero structure intact while deleting the self-contained action group. Lock the intended absence in the focused homepage positioning verifier, then validate the whole static site.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner.

---

### Task 1: Define the removal contract

**Files:**
- Modify: `scripts/verify-homepage-positioning.mjs`
- Test: `scripts/verify-homepage-positioning.mjs`

- [ ] **Step 1: Replace the positive action-button tests with a failing absence test**

```js
test('homepage hero omits the retired action button group and its dead code', () => {
  assert.doesNotMatch(indexHtml, /class="profile-actions"/);
  assert.doesNotMatch(indexHtml, /class="profile-action/);
  assert.doesNotMatch(indexHtml, /\.profile-actions?\b/);
  for (const key of ['a11y.profileActions', 'profile.actionResearch', 'profile.actionPublications', 'profile.actionJoin']) {
    assert.doesNotMatch(indexHtml, new RegExp(`"${key.replace('.', '\\.')}"`));
  }
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run: `node --test scripts/verify-homepage-positioning.mjs`

Expected: FAIL because the action group still exists in `index.html`.

### Task 2: Remove the action group implementation

**Files:**
- Modify: `index.html`
- Test: `scripts/verify-homepage-positioning.mjs`

- [ ] **Step 1: Delete the action group markup**

Remove the `<div class="profile-actions">` block containing all three links.

- [ ] **Step 2: Delete action-only styles**

Remove `.profile-actions`, `.profile-action`, `.profile-action:hover`, `.profile-action--primary`, `.profile-action--primary:hover`, and the mobile `.profile-action` height rule.

- [ ] **Step 3: Delete action-only translation keys**

Remove `a11y.profileActions`, `profile.actionResearch`, `profile.actionPublications`, and `profile.actionJoin` from both `i18n.en` and `i18n.zh`.

- [ ] **Step 4: Run the focused test and verify GREEN**

Run: `node --test scripts/verify-homepage-positioning.mjs`

Expected: all focused tests pass.

### Task 3: Verify and publish

**Files:**
- Verify: `index.html`
- Verify: `scripts/verify-homepage-positioning.mjs`

- [ ] **Step 1: Run complete automated verification**

Run: `npm test && node --check scripts/verify-homepage-positioning.mjs && git diff --check`

Expected: all tests pass and both checks exit 0.

- [ ] **Step 2: Render desktop and mobile homepage states**

Serve the repository locally and confirm the three buttons are absent with no horizontal overflow or broken images.

- [ ] **Step 3: Commit only the scoped files**

```bash
git add index.html scripts/verify-homepage-positioning.mjs docs/superpowers/specs/2026-08-31-remove-homepage-action-buttons-design.md docs/superpowers/plans/2026-08-31-remove-homepage-action-buttons.md
git commit -m "refactor: remove homepage action buttons"
```

- [ ] **Step 4: Push `main` and verify the live homepage**

Run: `git push origin main`

Expected: `origin/main` advances and the deployed homepage no longer contains `.profile-actions`.
