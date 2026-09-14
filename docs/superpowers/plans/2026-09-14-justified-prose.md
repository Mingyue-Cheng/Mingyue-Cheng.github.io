# Unified Justified Prose Implementation Plan

> User requested all personal-site prose to be justified and previously instructed autonomous execution without further questions. Continue in the existing preview workspace; no publishing is authorized.

**Goal:** Consistent justified reading text on all nine personal-site pages, in English and Chinese, at desktop and mobile widths.

**Architecture:** Centralize a language-aware, explicit prose selector group in the final shared stylesheet. Move mobile-only prose alignment into the unconditional shared rule; keep responsive card layout separate. Preserve navigation, headings, buttons, metadata controls, logo placement, paragraph last lines, and all content.

**Tech Stack:** Static HTML, CSS, dependency-free Node tests, browser preview.

## Design decision

Use explicit reading-content selectors rather than changing every element or forcing the last line to stretch. The shared rule uses an `html[lang]` prefix to match or exceed older Chinese and scenario-specific selector specificity. This replaces earlier mobile left-alignment decisions per the latest request. No typography dimensions, grid geometry, text, links, colors, publication ordering, or logo order change.

## Execution

- [x] Update `scripts/verify-site-content.mjs` to verify the exact selectors below receive the common declarations at every width and no mobile prose rule switches back to left.
- [x] Update cache-version assertions in `scripts/verify-site-theme.mjs` and `scripts/verify-industry-support.mjs` to `20260914-justify`.
- [x] Run the focused tests and verify they fail on current left-aligned rules/old stylesheet versions.
- [x] Replace the mobile prose reset in `files/assets/site-content.css` with this global rule; retain the mobile card layout rules and all unrelated logo styles:

```css
html[lang] .section p,
html[lang] .profile-thesis,
html[lang] .profile-affil,
html[lang] .research-section p,
html[lang] .research-section li,
html[lang] .research-section .research-note,
html[lang] .research-section .scenario-intro,
html[lang] .research-section .scenario-card-body,
html[lang] .research-main .scenario-card-body,
html[lang] .research-vision-desc,
html[lang] .pillar-card-desc,
html[lang] .research-note-box,
html[lang] .pub-list,
html[lang] .pub-list li,
html[lang] .pub-note,
html[lang] .os-card-desc,
html[lang] .dataset-card-desc,
html[lang] .page-hero-sub,
html[lang] .pub-hero-sub,
html[lang] .pi-hero-lead,
html[lang] .research-thesis p,
html[lang] .framework-stage > p,
html[lang] .timeline-list,
html[lang] .timeline-list li,
html[lang] .services-list,
html[lang] .services-list li,
html[lang] .news-list,
html[lang] .news-list li,
html[lang] .news-body,
html[lang] .plain-list li,
html[lang] .sys-list li,
html[lang] .venue-name,
html[lang] .journal-name,
html[lang] .grant-title,
html[lang] .award-title,
html[lang] .award-note,
html[lang] .resource-meta,
html[lang] .related-card-role,
html[lang] .footer-desc,
html[lang] .section .industry-support-copy,
html[lang] .section-summary,
html[lang] .pdec-copy span,
html[lang] .stage-signals li,
html[lang] .weakness-card p,
html[lang] .route-card p,
html[lang] .route-gate,
html[lang] .outcome-panel p {
  text-align: justify;
  text-align-last: left;
  text-justify: auto;
  hyphens: none;
  -webkit-hyphens: none;
  overflow-wrap: break-word;
  word-break: normal;
}
```

- [x] Remove the redundant left alignment from the industry explanatory sentence.
- [x] Update only the content CSS version in `index.html`, `research.html`, `publications.html`, `projects.html`, `news.html`, `awards.html`, `service.html`, `resources.html`, and `prediction-intelligence.html`.
- [x] Run `npm test` and `git diff --check`.
- [x] Independently review the final diff while checking browser-computed alignment and overflow across all nine pages at desktop/mobile widths and both languages.
- [x] Inspect representative rendered homepage/scenario/publication content, preserve the user's preview tab and settings, and report local-only delivery.

## Scope review

All previously inconsistent prose surfaces and responsive/Chinese overrides are covered without universal element rules or changes to UI controls. Existing unrelated worktree files and the iFLYTEK-first logo edit are preserved.

## Verification outcome

- Updated alignment/cache contracts failed against the previous implementation, then all 204 repository tests passed with the unified rules.
- Browser matrix: nine pages × English/Chinese × 1104 px desktop/390 px mobile, all 36 combinations had justified visible prose, natural last lines, and no horizontal page overflow.
- Visually inspected homepage desktop biography/research text, mobile English/Chinese scenario cards, and mobile publication entries. Independent code review approved the prose coverage and specificity.
- Restored the original English grants preview and normal viewport. Verified the iFLYTEK → Huawei → Tencent → Kuaishou order and existing four-column logo layout remained intact. No push was performed.
