# Research Cognitive Intelligence Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Introduce the user's cognitive-intelligence research layout on Research only, in English and Chinese, without changing the homepage.

**Architecture:** Keep the static shell and shared language engine. Rebuild the Research content with semantic sections and a Research-only stylesheet; update only its two translation dictionaries. Preserve current application/community/contact destinations.

**Tech Stack:** HTML, CSS, browser JavaScript, Node's built-in test runner.

---

### Task 1: Research contracts before implementation

**Files:** Create `scripts/verify-research-cognitive.mjs`; update obsolete Research assertions in `scripts/verify-scenario-cards.mjs` and `scripts/verify-cross-page-consistency.mjs`.

- [x] Add checks for ordered `pillar-card--agent`, `pillar-card--knowledge`, `pillar-card--structured` articles and `agentQuestion`, `knowledgeQuestion`, `structuredQuestion` content keys.
- [x] Check understanding/reasoning/interaction separately from the autonomous-learning/evolution/human–AI-collaboration support strip.
- [x] Exercise the existing shared language script in its VM harness with the new Research nodes through EN → ZH → EN.
- [x] Run `node --test scripts/verify-research-cognitive.mjs`; confirm failures identify missing new content rather than syntax errors.
- [x] Revise only superseded Research-parity expectations; retain homepage and unrelated-page coverage.

### Task 2: Semantic Research content and translations

**Files:** Modify `research.html` and only the EN/ZH Research entries of `files/assets/site-language.js`.

- [x] Set the hero and description metadata to cognitive intelligence and the exact mechanism/two-object relationship.
- [x] Replace the old vision/pillars block with three direction cards, each containing role, title, scope, independent question and topic list.
- [x] Add `research-relations-heading` with general mechanisms, two research objects and bidirectional feedback labels.
- [x] Add `cognitive-framework-heading` with three capabilities and a distinct long-term mechanisms strip.
- [x] Preserve application cards and community/contact links. Update the Research-only script query version to `20261020-cognitive-research`.
- [x] Add every visible new text key to both Research dictionaries; do not modify engine logic or other page dictionaries.

### Task 3: Restrained responsive layout

**Files:** Create `files/assets/research-page.css`; link it last in `research.html`.

- [x] Scope the stylesheet under `.research-page`; use existing navy palette, compact spacing and small line icons.
- [x] Keep direction cards full-width in a single column; display the two research objects side by side only where width allows.
- [x] Use three capability columns on desktop and a single column on mobile. Allow topic labels and long titles to wrap.
- [x] Disable decorative hover movement and respect reduced motion. Avoid large empty areas, fixed heights or text justification gaps.

### Task 4: Verification and local handoff

- [x] Run `npm test`, `node --check files/assets/site-language.js`, and `git diff --check`.
- [x] Check the shared language diff is confined to Research dictionaries and that `shasum -a 256 index.html` matches the recorded baseline.
- [x] Serve the existing checkout locally and inspect Research at desktop and mobile widths in both languages; test navigation/language switching and overflow.
- [x] Obtain independent spec and code-quality review, fix actionable findings, then re-run the full checks.
- [x] Report the local Research result and explicitly state no homepage change and no push.

## Verification outcome

- Full suite: 334/334 passing; JavaScript syntax and diff whitespace checks pass.
- Browser QA: English/Chinese at 1280, 768, 390 and 320 px; no horizontal overflow or page errors. Language round trips, mobile menu/Escape and no-JavaScript fallback pass.
- Independent specification and code-quality reviews approved.
- Homepage SHA-256 unchanged; all non-Research translations and shared engine bytes unchanged.
- Existing local server reused; no server ownership or unrelated files changed. No commit or push performed.

## Follow-up: publication and default-expanded homepage papers

The user then authorized push and requested all homepage paper-year groups be expanded by default. Add two regression tests against the real heading defaults and actual collapse/filter runtime; verify the expected RED failures, remove only the three older-year collapse flags and update the explanatory comment, then re-run tests and browser checks before selectively committing/pushing this combined release. The earlier unchanged-homepage checksum describes the completed Research-only stage, not the newly authorized release.

- Both new tests failed against the old defaults and pass after the three flag removals.
- Updated the obsolete homepage-quality expectation while retaining toggle/filter and paper-integrity assertions.
- Combined full suite: 336/336 passing; inline/shared JavaScript syntax and whitespace checks pass.
- Browser checks at desktop/mobile widths in EN/ZH confirm all five groups visible on load, all 72 records retained, manual toggling/filter-state restoration functional, and all groups expanded after reload.
- Independent release scope audit approved; unrelated files remain excluded from staging.
