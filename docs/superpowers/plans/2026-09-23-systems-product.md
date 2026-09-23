# Systems Product Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add two bilingual, responsive 科言 system cards to the homepage.

**Architecture:** Static fallback markup and the existing homepage i18n dictionary provide all content. A homepage-only stylesheet controls the new cards; no new runtime script or shared-page changes are needed.

**Tech Stack:** HTML, CSS, existing vanilla JavaScript translations, Node.js test runner.

## Task 1: Test the contract first

**Create:** scripts/verify-system-products.mjs.

- [x] Read index.html and the optional files/assets/system-products.css. Extract the Systems Product section by its unique comments and assert two anchors with these exact ordered destinations:

```js
assert.deepEqual(links.map(link => link.href), [
  'https://lewen.bdaa.pro/',
  'https://writelearn.bdaa.pro/'
]);
```

- [x] Assert the two product names, unique heading/anchor IDs, safe `_blank`/`noopener noreferrer` links, and placement before Open Source. Check stylesheet loading and the exact English/Chinese copy from the design.
- [x] Execute the existing `translatePage()` function on the module's real translation bindings for en → zh → en; verify names/URLs remain static.
- [x] Verify CSS rules for two desktop columns, one mobile column, wrapping, visible keyboard focus, and reduced-motion behavior. Run `node --test scripts/verify-system-products.mjs`; expect missing-module failures before implementation.

## Task 2: Implement the homepage-only module

**Modify:** index.html. **Create:** files/assets/system-products.css.

- [x] Insert `<section class="section systems-products" aria-labelledby="systems-product">` before the existing Open Source marker, with the current container and section-heading patterns. The heading is `<h2 id="systems-product" class="section-heading" data-i18n="systems.heading">Systems Product</h2>`.
- [x] Add two `<a class="system-product-card" href="..." target="_blank" rel="noopener noreferrer">` cards using the design's exact ordered URLs, names and copy. Include decorative inline SVG icons, a 科言 brand label, description and footer containing the domain and translated action. Do not rename existing project cards.
- [x] Add all five `systems.*` keys to both inline i18n dictionaries, exactly matching the design's table. Load `files/assets/system-products.css?v=20260923` before site-theme.css and site-content.css, retaining the shared layers' existing final authority.
- [x] Implement the isolated visual contract:

```css
.system-product-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
.system-product-card { min-width: 0; display: flex; flex-direction: column; padding: 24px; border: 1px solid var(--border); border-radius: 14px; background: #fff; color: var(--accent); text-decoration: none; }
.system-product-card:focus-visible { outline: 3px solid rgba(var(--accent-rgb), 0.36); outline-offset: 3px; }
@media (max-width: 680px) { .system-product-grid { grid-template-columns: minmax(0, 1fr); } }
@media (prefers-reduced-motion: reduce) { .system-product-card { transition: none; } .system-product-card:hover { transform: none; } }
```

Use small gaps and restrained typography for the icon/header/name/description/footer, allow footer wrapping, and keep prose justified with a natural last line. Keep any hover lift within 2px.

## Task 3: Verify locally

- [x] Run the focused tests, `npm test` and `git diff --check`; require zero failures.
- [x] Inspect the module in a task-owned browser tab at desktop and mobile widths, checking EN/ZH/EN switching, exactly two cards, expected destinations, native link focusability and accessible names, and no horizontal overflow. Verify focus-visible and reduced-motion rules with CSS contract tests; physical keyboard navigation was not tested in the background QA tab.
- [x] Review the diff against the scope and existing dirty worktree. Preserve all unrelated/past changes. Leave source, design and plan uncommitted and unpushed.

## Verification results

- All 7 new tests initially failed because the module did not exist, as expected.
- The first full-suite run exposed an existing stylesheet-order contract. Loading the new stylesheet before the shared theme/content layers resolved the failure without changing the existing test.
- All 290 tests pass, including the 7 new module tests; `git diff --check` passes.
- Browser checks passed at 1138, 807, 680, 390 and 320 CSS pixels in EN → ZH → EN (15 cases). Desktop cards are equal-height columns; mobile cards stack without horizontal overflow.
- Desktop English, mobile English and mobile Chinese screenshots were visually inspected. Both native card links have accessible names, `tabIndex=0`, correct URLs and safe new-tab attributes.
- Independent read-only review reported no blocking findings. No commit, push or deployment was performed.
