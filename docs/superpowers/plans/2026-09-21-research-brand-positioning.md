# Research Brand Positioning Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate 科言 SciToken and 科语 SciTime into the bilingual research narrative without changing the research taxonomy or project names.

**Architecture:** Reuse the current introduction and direction descriptions. Keep static fallback HTML and both translation stores identical in meaning; add no runtime behavior or CSS.

**Tech Stack:** Static HTML, existing vanilla JavaScript translations, Node.js test runner.

## Task 1: Lock the bilingual content contract

**Files:** scripts/verify-cross-page-consistency.mjs and scripts/verify-scenario-cards.mjs.

- [x] Add assertions using existing `homeCopy`, `sharedCopy`, and `plain` helpers:

```js
for (const lang of ['en', 'zh']) {
  const scenarios = sharedCopy[lang].pages['research.html'].scenarios;
  const science = lang === 'en'
    ? '科言 SciToken — Understanding the scientific world.'
    : '科言 SciToken：理解科学世界。';
  const time = lang === 'en'
    ? '科语 SciTime — Modeling the dynamic world.'
    : '科语 SciTime：建模动态世界。';
  assert.ok(plain(homeCopy[lang]['research.science']).includes(science));
  assert.ok(plain(scenarios.scienceIntelligenceBody).startsWith(science));
  assert.ok(plain(homeCopy[lang]['research.timeseries']).includes(time));
  assert.ok(plain(scenarios.timeseriesBody).startsWith(time));
  assert.doesNotMatch(scenarios.agentBody, /SciToken|SciTime/);
}
```

- [x] Update exact introduction and direction fixtures using the design's appended sentence and prefixes; retain the existing technical text.
- [x] Run `node --test scripts/verify-cross-page-consistency.mjs scripts/verify-scenario-cards.mjs`; expect failures for missing brand copy, not syntax/runtime errors.

## Task 2: Update both research surfaces

**Files:** index.html, research.html, files/assets/site-language.js.

- [x] Append the design's introduction sentence to fallback HTML and both language dictionaries.
- [x] Prefix the corresponding direction bodies, using existing emphasis markup:

```html
<span class="research-keyword">科语 SciTime — Modeling the dynamic world.</span>
<span class="research-keyword">科言 SciToken — Understanding the scientific world.</span>
```

Use `<strong>` for the Research-page equivalents and the exact Chinese prefixes from the design. Preserve all text following each new prefix and keep direction titles unchanged.

- [x] Change the shared script version from `20260921-discovery` to `20260921-research-brands` on all eight subpages and the five existing cache-key test contracts.

## Task 3: Verify and hand off locally

- [x] Run `npm test`, `node --check files/assets/site-language.js`, and `git diff --check`; require zero failures.
- [x] Inspect the two research surfaces in English and Chinese at desktop and narrow mobile widths, verifying brand mapping, language round trips and no horizontal overflow.
- [x] Review the diff for unintended taxonomy, CSS, link or project-name changes.
- [x] Report the final wording and local verification. Leave all source changes uncommitted and unpushed, consistent with the scope of this request and the existing pending work.

## Verification results

- The new English and Chinese brand-mapping tests failed on the missing identities before implementation, then passed after the copy update.
- Full suite: 276 tests passed; JavaScript syntax and diff whitespace checks passed.
- WebMind checked both pages at 1200, 807 and 390 CSS pixels through English–Chinese–English language round trips (18 cases). The two brands remained attached to the correct directions, prose remained justified, and there was no document or affected-text horizontal overflow.
- Desktop and mobile screenshots were inspected. No additional style changes were needed. Existing pending PaperScout, Science Intelligence and Scientific Discovery updates remain intact.
- Two older exact Chinese-introduction fixtures in verify-homepage-positioning.mjs and verify-scenario-cards.mjs were also updated to include the new sentence; their original research text remains unchanged.
- No commit, push, deployment, persistent-memory write or product rename was performed.
