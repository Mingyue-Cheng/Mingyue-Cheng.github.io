# Homepage Content Simplification Implementation Plan

> **For agentic workers:** Follow the assigned file ownership; preserve concurrent edits.

**Goal:** Apply the user-approved editorial reduction so the homepage is an academic overview, with full records on detail pages.

**Architecture:** Keep the static HTML and bilingual dictionaries. Shorten only homepage summaries; retain detailed projects, awards, service, publications and CV files. Research keeps three directions and nine representative works, with short relationship/application summaries.

**Tech Stack:** HTML, CSS, JavaScript, Node test suite; browser verification.

- [x] Root: remove duplicate page navigation and publication instructions, use plain year headings; preserve 12 news items and all 77 papers with expanded years.
- [x] Root: shorten homepage research, five project descriptions and five dataset descriptions; keep CastMind on the detail page only.
- [x] Root: select five honors; condense service and six grants; simplify related links preserving names, targets and order. Keep Teaching unchanged.
- [x] Research worker: retain three directions/questions and nine works; remove the repeated framework section and compress relationships/applications; synchronize bilingual labels and plain publication years.
- [x] CSS worker: use restrained direction rows, compact application copy and related links; preserve mobile readability.
- [x] Test worker: update affected assertions for summary/detail separation while retaining paper, author, link, CV, news and interaction checks.
- [x] Root: check all tests, local links, EN/ZH round trips and desktop/mobile screenshots; leave local preview ready. No commit or push requested.

## Verification

- `npm test`: 342 passed, 0 failed, 0 skipped.
- `git diff --check`: clean.
- Local href/src and anchor audit: no missing targets across nine HTML pages.
- All 77 publications and 24 stored news records preserved; homepage initially shows 12 news items and expands all six publication groups.
- English/Chinese round trips, compact service/grant facts, detail-page links, filters and year navigation verified.
- Desktop and 320/390 px mobile layouts checked; no horizontal overflow. Temporary viewport override reset.
- Final browser console: no errors.
- Preview screenshot: `/tmp/mingyue-homepage-concise-20261107.jpg`.
- Local preview retained; no commit or push performed.
