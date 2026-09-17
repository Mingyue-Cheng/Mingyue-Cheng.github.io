# Industry Logo Hover Implementation Plan

**Goal:** Give the homepage industry-support cards a restrained hover lift without changing content, logo artwork, order, or layout.

**Design:** Use a 4 px upward translation, a soft Prussian-blue shadow and a slightly stronger border. Only hover-capable fine pointers receive the effect. Reduced-motion users get static border/shadow feedback without movement or transitions. No idle animation, image scaling, links, pointer cursor, tab stops, or JavaScript are added.

**Architecture:** Scope rules to `.industry-support-logo` in the final shared content stylesheet. Refresh the homepage stylesheet URL to `20260916-industry-hover`; other pages do not render this component and keep their existing version. Preserve the four-column desktop / two-column mobile grid.

**Tech Stack:** CSS media queries and transitions, static HTML, Node built-in test runner.

The user has requested autonomous execution without further questions. Keep the existing preview workspace and leave publication for a separate push request.

## Implementation and verification

- [x] Add failing contracts in `scripts/verify-industry-support.mjs` for the new homepage cache version, hover-only 4 px lift/shadow/border, explicit transitions and reduced-motion override. Preserve the image no-transform contract.
- [x] Update `scripts/verify-site-theme.mjs` to expect the new content CSS version on `index.html` only.
- [x] Run `node --test scripts/verify-industry-support.mjs scripts/verify-site-theme.mjs` and confirm expected failures before CSS/HTML changes.
- [x] Add `transition: transform 220ms ease, box-shadow 220ms ease, border-color 220ms ease` to `.industry-support-logo`.
- [x] Within `@media (hover: hover) and (pointer: fine)`, set `.industry-support-logo:hover` to `transform: translateY(-4px)`, `border-color: rgba(var(--accent-rgb), 0.28)`, and `box-shadow: 0 12px 28px rgba(var(--accent-rgb), 0.12)`.
- [x] In the final reduced-motion media query, disable card transitions and set `.industry-support-logo:hover { transform: none; }`.
- [x] Refresh the homepage stylesheet query, run the focused tests, full `npm test` and `git diff --check`.
- [x] Inspect desktop hover and pointer-out states, unchanged image dimensions/order, and mobile layout; independently review scope and reduced-motion CSS. Leave the local preview available; do not push.

## Verified result

The focused suite passed 66 tests; the full suite passed 211 tests. In the browser, desktop hover produced a transform matrix with Y = -4 px, the intended shadow and border; moving the pointer away restored `transform: none` and `box-shadow: none`. At 390 px, the grid retained two columns and all four loaded logos with no horizontal overflow. Reduced-motion behavior was verified by CSS contract and independent cascade review (the operating-system setting was not changed). The file-URL preview cannot be controlled by the browser tool, so visual checks used the same files served locally on port 4173. No publishing was performed.
