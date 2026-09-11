# Site Visual Polish Implementation Plan

> **For agentic workers:** Use superpowers:subagent-driven-development. Preserve the shared working tree and do not commit or push this preview-only iteration.

**Goal:** Apply the approved Prussian-blue visual language across the site and improve long-form reading without removing academic content or year groups.

**Architecture:** Two final shared CSS layers separate theme/navigation from content presentation. Homepage disclosure behavior remains alongside its existing language and publication scripts. Existing academic markup, URLs, translation keys, and progressive fallback remain authoritative.

**Tech Stack:** Static HTML, CSS custom properties, vanilla JavaScript, dependency-free Node tests, browser viewport QA.

## Task 1 — Shared theme and navigation

- [x] Add `scripts/verify-site-theme.mjs` contracts for all nine pages, final stylesheet ordering, Prussian-blue tokens, and a 900px navigation breakpoint; run the test and observe failure.
- [x] Create `files/assets/site-theme.css`; use `--accent: #003153`, `--accent-dark: #00243d`, `--accent-light: #e8f0f4`, `--accent-rgb: 0, 49, 83`, and the current homepage navigation geometry. Preserve active links and keyboard behavior.
- [x] Update the eight subpages and `files/assets/prediction-intelligence.css` to replace old brand-blue literals while preserving semantic colors. Load `site-theme.css?v=20260911` then `site-content.css?v=20260911` after existing styles. Root agent adds the same two links to `index.html`.
- [x] Run `node --test scripts/verify-site-theme.mjs` and existing shell/navigation tests.

## Task 2 — Content presentation

- [x] Add `scripts/verify-site-content.mjs` contracts first; run to observe missing styles.
- [x] Create `files/assets/site-content.css`: white cards, 14px radii, light borders/shadows, consistent link/metadata wrapping, no decorative green top stripes, restrained prose emphasis. Keep green/amber domain distinctions.
- [x] At widths up to 680px use left-aligned prose and at least 40px filter targets. Keep full text accessible; do not line-clamp or truncate titles. Harmonize Research scenario cards without changing their text.
- [x] Run `node --test scripts/verify-site-content.mjs` and existing scenario tests.

## Task 3 — Homepage reading hierarchy

- [x] Add runtime tests for the first-six news disclosure, bilingual label changes, older-year defaults, filter expansion, and restoration of user collapse choices.
- [x] Keep all news in `#newsList`; initialize a native `#newsToggle` with `aria-controls="newsList"`, hiding only entries after six when JavaScript is available. Its dynamic `data-i18n` key alternates between `news.expand` and `news.collapse`.
- [x] Mark 2025, 2024, and 2023-and-before headings `data-default-collapsed="true"`. Initialize the existing state with `h.getAttribute('data-default-collapsed') === 'true'`. Keep Preprint, Released Survey, and 2026 expanded, retain all six heading buttons, and preserve topic filtering.
- [x] Preserve no-JavaScript full content and open a collapsed target when visiting its year/list fragment.
- [x] Run focused tests followed by `npm test` and `git diff --check`.

## Task 4 — Integration and review

- [x] Review content/links against the existing source and inspect shared CSS cascade at 390px, 820px, 900px, 901px, and desktop width.
- [x] Check English/Chinese, navigation keyboard behavior, news expansion/collapse, publication filtering/restoration, no horizontal overflow, and no console errors.
- [x] Perform independent specification review followed by code-quality review; address actionable findings, refresh local preview, and leave unrelated files untouched.

## Verification result

- Full repository suite: 141/141 passing; `git diff --check` clean.
- Nine pages checked in the browser at 390px, 820px and 901px; exact `#003153` accent and no horizontal overflow.
- Chinese switching checked across all nine pages; 900px open menu resets at 901px. Projects/News resize state was rechecked after rendering to avoid reading before the resize event completed.
- Homepage news: 6 → 19 → 6 visible; language switching preserves expansion. Publication topic filtering restores manually expanded and default-collapsed year choices.
- Independent review confirmed unchanged markup/order/links for all 19 news entries and 70 papers, plus unchanged body content for all eight subpages. Specification and code-quality reviews passed.
- Existing unrelated files preserved. Local preview only; no commit or push.
