# Homepage Quality Repair Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Repair the homepage's publication correctness, content hierarchy, accessibility, SEO, mobile navigation, and automated verification without replacing the current visual system.

**Architecture:** Keep the existing static HTML and shared language script. Divide work into non-overlapping file domains, add focused Node test files for each domain, and integrate only after every domain passes its own tests and the full suite.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner, GitHub Actions.

---

### Task 1: Publication correctness and homepage selection

**Files:**
- Modify: `index.html`
- Modify: `publications.html`
- Modify: `scripts/verify-homepage-quality.mjs`
- Create: `scripts/verify-publication-integrity.mjs`

- [ ] **Step 1: Write failing tests**
  - Require the Time-R1 public record on both pages to use the user-approved CIKM author order and `https://arxiv.org/pdf/2506.10630`.
  - Parse publication links and fail when one arXiv identifier maps to multiple normalized paper titles.
  - Require the homepage selected list to contain 6–10 visible papers and a link to `publications.html`.
- [ ] **Step 2: Run the focused tests and confirm they fail for the current wrong Time-R1 link and oversized selected list**
  - Run: `node --test scripts/verify-publication-integrity.mjs`
  - Expected: FAIL mentioning `2508.09191` and/or selected-publication count.
- [ ] **Step 3: Apply the minimal publication changes**
  - Correct Time-R1 on both pages while leaving TokenCast on arXiv `2508.09191`.
  - Preserve the complete bibliography on `publications.html`.
  - Reduce the homepage section to 6–10 representative records and retain category filtering only where it remains useful.
  - Convert visible `[PDF]`/`[DOI]` placeholders in the retained homepage records to working links or omit unavailable placeholders.
- [ ] **Step 4: Run focused and existing tests**
  - Run: `node --test scripts/verify-publication-integrity.mjs scripts/verify-homepage-quality.mjs`
  - Expected: all tests pass.
- [ ] **Step 5: Self-review the diff for exact author order, title, venue, PDF, and code links**

### Task 2: Public-page semantics and SEO discovery

**Files:**
- Modify: `research.html`
- Modify: `news.html`
- Modify: `projects.html`
- Modify: `awards.html`
- Modify: `service.html`
- Modify: `resources.html`
- Modify: `prediction-intelligence.html`
- Create: `robots.txt`
- Create: `sitemap.xml`
- Create: `scripts/verify-page-shells.mjs`

- [ ] **Step 1: Write a failing page-shell verifier**
  - Require one skip link, one `main`, one `h1`, and the correct `aria-current="page"` on each owned page.
  - Require canonical, `og:title`, `og:description`, `og:url`, `twitter:card`, and consistent August 2026 footer text.
  - Require root sitemap/robots files and all public page URLs in the sitemap.
- [ ] **Step 2: Run the focused test and confirm current failures**
  - Run: `node --test scripts/verify-page-shells.mjs`
  - Expected: FAIL for missing landmarks, metadata, and root discovery files.
- [ ] **Step 3: Add semantic shells and metadata using existing page copy and visual styles**
  - Do not redesign page content.
  - Ensure wrappers close correctly and do not change the visible content order.
- [ ] **Step 4: Add root discovery files and normalize footer/cache versions**
- [ ] **Step 5: Run the focused test and `git diff --check`**
  - Expected: all focused tests pass and no whitespace errors.

### Task 3: Mobile navigation and automated verification

**Files:**
- Modify: `files/assets/site-language.js`
- Create: `scripts/verify-site-infrastructure.mjs`
- Create: `package.json`
- Create: `.github/workflows/verify-site.yml`

- [ ] **Step 1: Write failing tests for shared mobile-menu behavior and project commands**
  - Require Escape handling, focus transfer into the opened menu, focus restoration to the toggle, and menu closure after navigation.
  - Require `package.json` to expose `npm test` as `node --test scripts/*.mjs`.
  - Require the workflow to run `npm test` on push and pull request.
- [ ] **Step 2: Run the focused verifier and confirm it fails**
  - Run: `node --test scripts/verify-site-infrastructure.mjs`
  - Expected: FAIL for missing behavior/configuration.
- [ ] **Step 3: Implement the minimal shared navigation behavior and project configuration**
  - Preserve existing language switching and visible mobile-menu styling.
- [ ] **Step 4: Run `npm test` and confirm the complete suite passes**

### Task 4: Homepage positioning and Join/Collaborate paths

**Files:**
- Modify: `index.html`
- Modify: `scripts/verify-homepage-quality.mjs`

- [ ] **Step 1: Add failing assertions for a concise research thesis and three explicit paths**
  - Paths: Research, Selected Publications, and Join/Collaborate.
- [ ] **Step 2: Confirm the new assertions fail against the current hero**
- [ ] **Step 3: Add compact hero copy and actions using the existing button and color system**
  - Keep the current name, affiliation, portrait, and contact links.
  - Do not introduce a new visual theme.
- [ ] **Step 4: Run the homepage verifier and full `npm test`**

### Task 5: Integration, review, and browser verification

**Files:**
- Review all modified files; do not add unrelated cleanup.

- [ ] **Step 1: Inspect `git diff --stat`, `git diff --check`, and targeted diffs for ownership overlap**
- [ ] **Step 2: Run `npm test` from a clean command invocation**
- [ ] **Step 3: Run an internal-link/resource validator and confirm zero missing local targets**
- [ ] **Step 4: Preview locally and inspect desktop plus 390px mobile layouts**
  - Verify no horizontal overflow, broken images, console errors, inaccessible menu state, or malformed publication lists.
- [ ] **Step 5: Request an independent code review and resolve all critical/important findings**
- [ ] **Step 6: Commit only the scoped feature files; preserve unrelated user files in the original checkout**
