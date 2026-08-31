# Homepage Quality Repair Design

## Goal

Improve the public homepage without changing its established visual identity. This repair wave prioritizes factual correctness, a clearer homepage hierarchy, accessible page structure, discoverability, and repeatable verification.

## Scope

1. Correct the Time-R1 record on both publication surfaces and prevent one arXiv identifier from silently representing different titles.
2. Make the homepage publication section genuinely selected rather than a duplicate of the complete publication page.
3. Give every public page a consistent semantic shell: skip link, one `main`, one `h1`, current-page navigation state, and accessible interactive controls.
4. Publish standard root-level SEO discovery files and consistent canonical/social metadata.
5. Improve the shared mobile navigation with focus management and Escape-to-close behavior.
6. Add a single local test command and a GitHub Actions verification gate.
7. Refine the homepage hero with a concise research thesis and explicit Research, Publications, and Join/Collaborate paths.

## Design Decisions

- The user-provided CIKM 2026 citation remains the authoritative public citation for author order and acceptance status; the PDF target must point to the actual Time-R1 paper rather than TokenCast.
- `publications.html` remains the complete bibliography. The homepage keeps a balanced representative subset covering the three CIKM 2026 papers, scientific-literature agents, time-series reasoning, and accepted journal/conference work.
- This wave keeps the static-HTML architecture. A later migration can introduce a JSON/YAML publication source after the public-facing records and tests are stable.
- Existing visual tokens and layouts are reused. New hero actions and accessibility states must look native to the current site.
- Tests are written before production changes and must demonstrate the intended failure before the implementation is applied.

## Ownership Boundaries

- Publication agent: `index.html`, `publications.html`, `scripts/verify-homepage-quality.mjs`, and a new publication-integrity verifier.
- Page-shell agent: `research.html`, `news.html`, `projects.html`, `awards.html`, `service.html`, `resources.html`, `prediction-intelligence.html`, root `sitemap.xml`, root `robots.txt`, and a new page-shell verifier.
- Infrastructure agent: `files/assets/site-language.js`, `package.json`, `.github/workflows/verify-site.yml`, and a new infrastructure verifier.
- Primary agent: hero/Join refinements after publication work lands, integration review, browser QA, and final Git operations.

## Acceptance Criteria

- Time-R1 and TokenCast use different, correct arXiv identifiers; a regression test rejects duplicate identifier/title mappings.
- Homepage selected publications contain 6–10 entries and link to the complete publication page.
- Every public page contains one `main`, one `h1`, a skip link, and `aria-current="page"` on its current navigation item.
- Mobile navigation supports keyboard opening, Escape closing, sensible focus transfer, and focus return.
- `/robots.txt` and `/sitemap.xml` exist at the repository root; the sitemap covers all public pages including Prediction Intelligence.
- Every public page has canonical, Open Graph, and Twitter metadata.
- `npm test` runs all repository verifiers, and GitHub Actions runs the same command.
- Desktop and 390px mobile browser checks show no broken layout, horizontal overflow, console errors, or broken internal resources.

## Out of Scope

- A framework migration or templating engine.
- Full Chinese translation of every publication and news record.
- Automated GitHub star fetching.
- Deleting legacy binary assets without a separate usage audit.
