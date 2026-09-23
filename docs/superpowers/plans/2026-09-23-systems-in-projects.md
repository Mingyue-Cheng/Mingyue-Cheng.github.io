# Systems Product integration into Open Project

> **For agentic workers:** Use superpowers:executing-plans to implement this scoped follow-up in the current checkout. Preserve unrelated edits and leave changes uncommitted and unpushed.

**Goal:** Show the existing two Systems Product cards inside `projects.html` without creating a new subpage or changing the homepage module.

**Architecture:** Reuse static card markup and the existing shared product stylesheet. Add matching `systems.*` content to the existing subpage language dictionaries. Preserve the shared stylesheet cascade and navigation conventions.

**Tech stack:** Static HTML, CSS, vanilla JavaScript i18n, Node test runner.

## Task 1: Test first

- [x] Extend `scripts/verify-system-products.mjs` to require the projects-page section, section order, in-page jump link and exactly matching homepage card bodies.
- [x] Require all five English/Chinese product translations to match the homepage and execute the real shared translation code on the new bindings through EN → ZH → EN.
- [x] Require the shared component stylesheet on both pages before the theme/content stylesheets. Update existing cache-version expectations to `20260923-systems-in-projects`.
- [x] Run focused tests and confirm the missing integration produces expected failures.

## Task 2: Integrate the existing module

- [x] Add the labelled Systems Product section as the first section in `projects.html`'s main container, plus an in-page jump link. Keep the homepage cards unchanged.
- [x] Load the existing `system-products.css` before shared theme/content styles; update its comment to reflect reuse on both pages.
- [x] Add matching `systems.*` English/Chinese keys to the projects dictionaries in `files/assets/site-language.js`.
- [x] Refresh the language script version on all eight existing subpages. Do not create a separate page, global nav entry or new dependency.

## Task 3: Verify and hand off locally

- [x] Run focused/full tests, `node --check files/assets/site-language.js` and `git diff --check`.
- [x] Use a task-owned local browser preview to inspect desktop and narrow-screen layouts, EN/ZH copy, loaded logos, in-page navigation and lack of horizontal overflow.
- [x] Request a read-only review while performing browser QA, then resolve any actionable findings.
- [x] Review final scope, preserve unrelated dirty files and report that changes remain local.

## Verification results

- Before implementation, five focused checks failed on the missing projects-page section, cards, translations and stylesheet, as expected. All 14 focused tests now pass.
- Full suite: 300 tests passed, zero failures. JavaScript syntax and whitespace checks pass.
- Browser checks passed at 1138, 807, 680, 390 and 320 CSS pixels through EN → ZH → EN (15 cases). Desktop cards have equal heights; narrow screens stack the cards without horizontal overflow.
- Both original 1254-pixel logos load and render uncropped at 80 × 80 CSS pixels. The first background-frame probe ran before lazy images loaded; the follow-up check after scrolling confirmed both originals and all 15 cases passed.
- The Systems Product jump link resolves to `#systems-product`; the heading remains below the sticky header. Desktop English, mobile English and mobile Chinese screenshots were visually inspected.
- Independent read-only review found no blocking issues or new regressions. `index.html` is unchanged; seven other subpages only refresh the shared language-script version.
- No separate product page, new global navigation item, commit, push or deployment was created.
