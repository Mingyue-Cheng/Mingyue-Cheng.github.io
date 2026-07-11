# Unified Application Scenario Cards Design

**Date:** 2026-07-11
**Status:** Approved for implementation planning
**Selected direction:** B — Unified Domain Cards

## Context

The homepage and `research.html` both present the same three broader application and evaluation scenarios, but they currently use different markup, styling, ordering, icons, and English copy. The homepage version also applies justified text and automatic hyphenation, which creates large word gaps and visible breaks such as `prefer-ence`, `recom-mendation`, and `balanc-ing`.

The chosen design unifies both surfaces around the stronger domain-card language already present on the Research page, while refining it for readability, accessibility, bilingual rendering, and responsive behavior.

## Goals

- Give the homepage and Research page one consistent visual treatment for the three scenario cards.
- Remove automatic English hyphenation and uneven justified spacing.
- Make each domain easy to scan through a stable icon, domain accent, title, and one balanced emphasis phrase.
- Avoid the tablet-width `2 + 1` orphan-card layout.
- Keep the homepage's English and Chinese language switching reliable.
- Improve heading structure and decorative-icon accessibility without changing the cards into links or controls.
- Prevent future visual drift by sharing component styles across both pages.

## Non-goals

- Redesigning the surrounding Research Interests section, page navigation, or footer.
- Rewriting the underlying research claims or adding new application areas.
- Expanding the Research page's existing partial UI translation into translated card-body content.
- Moving all inline page CSS or all homepage i18n into shared assets.
- Cleaning unrelated worktree files such as `.DS_Store`, local photos, or visual-companion artifacts.

## Component architecture

### Shared stylesheet

Create `files/assets/scenario-cards.css` and load it immediately after each page's existing inline style block, from both `index.html` and `research.html`. The file will own only the unified scenario component:

- section heading row;
- three-column grid;
- card shell, domain accent bar, header, icon base, title, body, and emphasis;
- domain color modifiers for Science, Energy Systems, and User Modeling;
- desktop, tablet/mobile, hover, and reduced-motion behavior.

Existing component-specific rules in each page will be removed once the shared stylesheet is active. On `research.html`, removal is limited to `.scenario-section-label`, `.scenario-cards`, `.sc-card*`, `.icon-recommend`, and `.icon-energy` rules plus their scenario-only responsive declarations. The shared `.visual-icon`, `.icon-network`, `.icon-series`, and `.icon-literature` rules remain because primary-direction cards still use them. Unrelated research-card and page styles remain inline.

The shared stylesheet must explicitly override the homepage's more-specific `.research-section p` rule with `.research-section .scenario-card-body`. That reset sets `text-align: left`, `text-align-last: auto`, `text-justify: auto`, `hyphens: none`, and `-webkit-hyphens: none`; relying on stylesheet order alone is insufficient.

### Shared markup contract

Both pages will use the same class contract and semantic `section`/`article` structure. The homepage markup is:

```html
<section class="scenario-section" aria-labelledby="scenario-heading">
  <div class="scenario-heading-row">
    <h3 id="scenario-heading" class="scenario-heading">...</h3>
  </div>
  <div class="scenario-grid">
    <article class="scenario-card scenario-card--science">
      <div class="scenario-card-accent" aria-hidden="true"></div>
      <div class="scenario-card-header">
        <span class="scenario-card-icon" aria-hidden="true">...</span>
        <h4 class="scenario-card-title">...</h4>
      </div>
      <p class="scenario-card-body">
        ... <strong class="scenario-card-emphasis">...</strong> ...
      </p>
    </article>
  </div>
</section>
```

The Energy Systems and User Modeling cards follow the same structure with domain modifier classes. Inline SVG icons will use a fixed view box, `aria-hidden="true"`, and `focusable="false"`; they remain decorative rather than creating redundant accessible names.

Heading levels remain page-appropriate: the homepage uses `h3` for the scenario heading and `h4` for card titles under its existing Research Interests `h2`; `research.html` uses `h2` and `h3` under the page hero `h1`. The Research-page heading also retains the compatibility class `.scenario-section-label` so `files/assets/site-language.js` continues translating that label through its existing `page.labels` flow. No change to `site-language.js` is required.

## Visual design

- Remove the homepage's nested gray outer panel. Use a clean heading row followed by the three cards.
- Add a one-pixel divider after the section heading to establish hierarchy without another enclosing box.
- Use a four-pixel domain accent bar on each card:
  - Science: USTC blue to green;
  - Energy Systems: USTC blue to cyan;
  - User Modeling: USTC blue to amber.
- Place each line icon inside a fixed `36 × 36px` white icon base with a subtle border and `9px` corner radius.
- Use a `16px`, weight-800 card title and `13.5px` body copy with a unitless `1.67` line height, all left aligned.
- Use a restrained white-to-cool-white card gradient, subtle border, and low-elevation blue shadow.
- Keep cards informational: no pointer cursor and no click affordance.
- Apply the existing light lift and shadow increase only under `@media (hover: hover) and (pointer: fine)`.
- Disable transitions under `prefers-reduced-motion: reduce`.

## Content and ordering

Both English surfaces use the same canonical order:

1. AI for Science
2. AI for Energy Systems
3. AI for User Modeling

The homepage's current English descriptions are the canonical copy because they contain the latest research framing. `research.html` will use the same wording. No new scientific claim is introduced.

The exact English title/body values are:

- `research.scienceTitle`: `AI for Science`
- `research.scienceBody`: `Using <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> as the technical foundation for structured scientific data modeling and scientific literature mining.`
- `research.energyTitle`: `AI for Energy Systems`
- `research.energyBody`: `Building <strong class="scenario-card-emphasis">context-aware forecasting agents</strong> for load, solar, and wind systems, with renewable analytics for dispatch, storage, grid balancing, and risk-aware operation.`
- `research.userTitle`: `AI for User Modeling`
- `research.userBody`: `Modeling <strong class="scenario-card-emphasis">behavioral sequences and preference dynamics</strong> to support explainable recommendation, user simulation, and LLM-based interactive decision support.`

The exact Chinese title/body values preserve the homepage's current meaning:

- `research.scienceTitle`: `AI for Science`
- `research.scienceBody`: `以 <strong class="scenario-card-emphasis">LLMs and Agentic AI</strong> 为技术，面向结构化科学数据建模以及科技文献挖掘。`
- `research.energyTitle`: `电力能源智能`
- `research.energyBody`: `构建面向负荷、光伏与风电的<strong class="scenario-card-emphasis">上下文感知预测智能体</strong>，服务可再生能源分析、调度优化、储能控制、平衡与风险管理。`
- `research.userTitle`: `AI for User Modeling`
- `research.userBody`: `刻画<strong class="scenario-card-emphasis">用户行为序列与偏好演化</strong>，支撑可解释推荐、用户模拟，以及大模型驱动的人机交互式决策支持。`

Each body therefore contains exactly one `.scenario-card-emphasis` element.

## Homepage i18n behavior

The current homepage language function replaces every `[data-i18n]` element's `innerHTML`. Applying a single translation key to an entire card would therefore overwrite the new semantic structure.

To keep the structure stable, the three combined keys are replaced with title/body keys:

- `research.scienceTitle` and `research.scienceBody`
- `research.energyTitle` and `research.energyBody`
- `research.userTitle` and `research.userBody`

`research.scenarioTitle` remains the homepage heading key. Translation attributes are attached only to the homepage title and body text containers, so switching language updates copy and emphasis without replacing the card shell, SVG, or article structure.

Both English and Chinese dictionaries must contain every new key before the old combined keys are removed. A verifier will fail if either locale is incomplete.

## Responsive behavior

- Above `900px`: three equal columns using `repeat(3, minmax(0, 1fr))`.
- At `900px` and below: one column, avoiding a `2 + 1` layout.
- At narrow mobile widths: reduce section/card padding and preserve a minimum readable text width.
- All widths: use `min-width: 0`, the explicit high-specificity alignment/hyphenation reset described above, and `overflow-wrap: anywhere` only as a final safeguard for genuinely unbreakable content.

The target widths for visual verification are `1440px`, `834px`, `680px`, and `390px`.

## Interaction and failure handling

- The component has no network dependency and no user action that can fail.
- If JavaScript is disabled on the homepage, the initial English HTML remains complete and readable.
- The existing homepage translator skips a missing key and can therefore leave stale text from the previously selected language. Runtime fallback behavior is outside this component's scope; the focused verifier prevents incomplete English or Chinese scenario keys from shipping.
- Inline SVG avoids platform-dependent emoji rendering and does not require image loading or fallback assets.

## Verification strategy

Implementation will follow a red-green workflow with a focused Node verifier written before production changes. The verifier will assert:

- both pages load `files/assets/scenario-cards.css`;
- both pages contain exactly three semantic scenario articles in the canonical order;
- both pages use the same component class contract;
- the homepage has all English and Chinese title/body translation keys;
- obsolete combined scenario translation keys and obsolete component markup are absent;
- the shared stylesheet disables automatic hyphenation and uses the intended `900px` single-column breakpoint;
- every body contains exactly one `.scenario-card-emphasis` element;
- the component contains decorative, non-focusable SVG icons and page-appropriate semantic heading levels;
- `research.html` retains `.scenario-section-label` compatibility and shared primary-direction icon rules remain present.

Fresh browser verification will then check:

- desktop layout at `1440px`;
- single-column tablet/mobile layouts at `834px`, `680px`, and `390px`;
- no horizontal overflow;
- no automatic word splitting or enlarged justified gaps;
- English-to-Chinese-to-English homepage switching without DOM loss;
- Research-page language switching still translates the scenario heading through the existing partial UI translation;
- matching order, icons, spacing, and card treatment across `index.html` and `research.html`;
- hover and reduced-motion rules at the CSS level.

Final repository checks will include the focused verifier, `git diff --check`, and a diff review proving that unrelated worktree files remain untouched.

## Planned files

- `index.html` — replace homepage scenario markup, remove obsolete local component CSS, and split bilingual i18n keys.
- `research.html` — replace the existing scenario markup, remove obsolete local component CSS, and synchronize canonical English copy/order.
- `files/assets/scenario-cards.css` — shared component styling and responsive behavior.
- `scripts/verify-scenario-cards.mjs` — focused structural and i18n regression verifier.

## Acceptance criteria

- The two pages visibly present the same selected B design.
- No scenario body uses justified alignment or automatic hyphenation.
- No `2 + 1` card layout occurs at supported widths.
- The homepage remains complete in English and Chinese and survives repeated language toggles.
- The three cards keep the approved order and balanced emphasis.
- Semantic headings and decorative-icon treatment are present.
- The focused verifier passes, browser checks pass at all four widths, and unrelated local files are excluded from the implementation diff.
