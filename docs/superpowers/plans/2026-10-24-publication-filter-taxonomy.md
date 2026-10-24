# Publication Filter Taxonomy Implementation Plan

> **For agentic workers:** Use test-first implementation with the responsibilities below. Steps use checkbox syntax for tracking.

**Goal:** Display the seven requested publication categories consistently on the homepage and Publications page, with working bilingual filters.

**Architecture:** Preserve existing paper tags and single-select controls. Split llm/agent and derive the structured-data union in both inline predicates; reuse existing translation engines without changes.

**Tech Stack:** Static HTML, inline JavaScript, shared language dictionaries, Node test runner, headless Chrome.

---

### Task 1: Establish regression tests

**Files:** `scripts/verify-cross-page-consistency.mjs`, `scripts/verify-homepage-quality.mjs`, `scripts/verify-page-shells.mjs`, `scripts/verify-publication-integrity.mjs`.

- [x] Assert eight controls, exact user-requested English order, matching Chinese labels, and new translation keys `pub.filterReasoning` and `pub.filterStructured`.
- [x] Worker owns only `verify-publication-integrity.mjs`: update the old combined agent fixture and add tests of both actual inline scripts using exact tags and overlapping tags.
- [x] Run targeted tests before production edits; observed failures for absent labels and the missing structured union.

### Task 2: Implement minimal production changes

**Files:** `index.html`, `publications.html`, `files/assets/site-language.js`.

- [x] Replace the old six-button group with All and seven categories, using data-filter order `all, llm, agent, structured, timeseries, table, ai4science, recsys`.
- [x] Use identical matching logic on both pages:

```js
const isMatch = filter === 'structured'
  ? ['timeseries', 'table', 'graph', 'structured'].some(tag => tagList.includes(tag))
  : tagList.includes(filter);
```

- [x] Set both English and Chinese filter dictionaries to the design table. Keep all other dictionary content and engines unchanged.
- [x] Change only Publications' language asset URL to `files/assets/site-language.js?v=20261024-publication-filters`; update the three corresponding version assertions.
- [x] Preserve all paper records and prior default news count of 12.

### Task 3: Verify and hand off

- [x] Run `npm test` and `git diff --check`: 351 tests pass.
- [x] Exercise every filter on both pages at 1280, 946, 390, and 320 px in English/Chinese; exact matching, All restoration, active/ARIA state, wrapping, and language persistence pass.
- [x] Compare publication entries and data-tags against HEAD: all 72 on each page remain byte-for-byte unchanged.
- [x] Perform an independent read-only review: no findings; no commit/push performed.

Browser verification counts on both pages: All 72, LLM 39, Agent 19, Structured 33, Time Series 27, Table 7, AI for Science 6, Recommender 20. Screenshots were inspected in `/tmp/publication-filter-qa.T3cR3i`.
