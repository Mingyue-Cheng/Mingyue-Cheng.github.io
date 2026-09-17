# Cross-page Consistency Implementation Plan

**Goal:** Align repeated content, labels, and reading surfaces across the personal homepage and its eight subpages.

**Architecture:** Keep the existing static HTML and language dictionaries. Preserve no-JavaScript fallback content; guard repeated copy with cross-page equality tests. Move the duplicated application-card presentation into the existing shared stylesheet rather than adding another styling layer.

**Tech Stack:** Static HTML/CSS, vanilla JavaScript, Node test runner, isolated Playwright validation.

## Tasks

- [x] Add `scripts/verify-cross-page-consistency.mjs`: extract real homepage/subpage dictionaries; assert matching research copy, recruitment text, navigation, publication filters, project translations/categories, and footer dates. Run `node --test scripts/verify-cross-page-consistency.mjs` and verify expected failures against stale content.
- [x] Update `index.html`, `research.html`, and `files/assets/site-language.js`: apply the latest introduction, align the Chinese translation and profile summary, synchronize direction/application copy and research metadata.
- [x] Update `projects.html`: group existing cards under the same three research categories as the homepage; preserve all existing cards and links. Add translation hooks and the matching shared-language entries for duplicated content. NeoResearch remains source-preserved and hidden.
- [x] Update `files/assets/site-content.css` and `files/assets/site-theme.css`: share application-card presentation and normal subpage hero rules; retain all reading, focus, and reduced-motion contracts. Add a failing shared-style contract before changing the styles.
- [x] Align publication filters, shared navigation/accessibility labels, standard page titles, resource heading hierarchy, footer dates, sitemap dates, and shared-asset cache versions across all public pages. Update tests that intentionally pinned superseded copy/cache values.
- [x] Run `npm test` (248/248), `node --check files/assets/site-language.js`, and `git diff --check`. Check 54 rendered views (9 pages × 3 widths × 2 languages), 3 no-JavaScript fallbacks, language round trips, mobile navigation, and shared computed styles. Visually inspect desktop and mobile screenshots. Preserve unrelated worktree files.

## Execution decision

Proceed in the current local workspace under the user's standing instruction to work autonomously. Do not interrupt for routine design approval, create a separate preview location, commit, or publish. The existing local preview and prior pending edits must remain available.
