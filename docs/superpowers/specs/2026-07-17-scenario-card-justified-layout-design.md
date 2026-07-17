# Scenario Card Justified Layout Design

**Date:** 2026-07-17
**Status:** Approved for direct implementation

## Goal

Refine the shared “Broader Application and Evaluation Scenarios” module so the three cards read as one aligned row. Body copy should use controlled full justification, with consistent card geometry and without reintroducing automatic English hyphenation.

## Selected approach

Use the shared `files/assets/scenario-cards.css` as the only layout owner for both `index.html` and `research.html`:

- keep three equal desktop columns and equal-height cards;
- make each card a vertical flex container so its accent, header, and body form a stable internal stack;
- give desktop headers a shared minimum height so all body-copy blocks begin on the same horizontal line when a longer title wraps;
- use `text-align: justify` for body copy, `text-align-last: left` for the final line, and `text-justify: inter-word` for predictable English spacing;
- keep `hyphens: none`, `-webkit-hyphens: none`, and normal word breaking so words are not split to manufacture a straight edge;
- retain the existing one-column breakpoint, domain colors, icons, hover behavior, and content.

At the one-column breakpoint, the header minimum height returns to `auto` because cross-card horizontal alignment is no longer relevant.

## Alternatives considered

1. **Selected: shared CSS geometry plus controlled justification.** Meets the request without changing HTML or research wording and keeps both pages synchronized.
2. **Manual line breaks in each paragraph.** Can force a screenshot-specific edge but is brittle across languages, browser widths, and font rendering.
3. **Shorten or rewrite the three descriptions.** Could reduce ragged edges but changes research content and does not guarantee alignment at other widths.

## Verification

- Extend `scripts/verify-scenario-cards.mjs` before changing CSS so the new contract initially fails.
- Assert the vertical card layout, aligned desktop header height, full justification, left-aligned last line, and disabled hyphenation.
- Run the full focused verifier and `git diff --check`.
- Render both pages at desktop and mobile widths, checking aligned card boundaries, aligned body starts, readable word spacing, no split English words, and no horizontal overflow.
- Stage and publish only the design/plan, shared CSS, and focused verifier; preserve unrelated worktree files.

## Files

- `files/assets/scenario-cards.css` — shared geometry and text alignment.
- `scripts/verify-scenario-cards.mjs` — regression contract.
- `docs/superpowers/plans/2026-07-17-scenario-card-justified-layout.md` — implementation checklist.
