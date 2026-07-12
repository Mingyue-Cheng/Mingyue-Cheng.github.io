# Research Hero Cognitive Pipeline Design

**Date:** 2026-07-13

## Context

The `research.html` hero currently limits the introduction to a readable text width, leaving a large empty area on wide screens. Expanding the paragraph across the full container would reduce readability. The approved direction uses that space for a restrained research narrative graphic instead.

## Goal

Turn the Research Interests hero into a balanced desktop composition that communicates:

`Time-Series Data + Knowledge Understanding → Cognitive Reasoning → AI for Science / Energy Systems`

The graphic should reinforce the research story without competing with the heading or body copy.

## Non-goals

- Do not change the Research Interests wording.
- Do not change homepage content or the shared scenario-card module.
- Do not add JavaScript, animation, external image files, or third-party dependencies.
- Do not force the diagram into narrow layouts.

## Approved Layout

### Desktop

Above `960px`, `.page-hero-content` becomes a two-column grid using `minmax(0, 1fr)` for the copy, `minmax(290px, 320px)` for the visual, and `clamp(32px, 4vw, 56px)` for the gap:

- Left column: the existing eyebrow, title, and introduction.
- Right column: a compact inline SVG cognitive-pipeline diagram.
- The copy remains at a readable line length and keeps the existing clean two-edge alignment: `text-align: justify`, last line left-aligned, with automatic hyphenation disabled.
- The diagram uses roughly one third of the available content width and is vertically centered against the copy.

The implementation introduces a `.page-hero-copy` wrapper so the copy and visual remain independently controllable.

### Narrow screens

At `<=960px`, the visual is hidden and the hero returns to a single-column layout. The existing `<=680px` paragraph behavior remains unchanged: left alignment and manual-only hyphenation. The hidden graphic must not leave empty space or create horizontal overflow.

## Visual Narrative

The diagram reads from left to right in three stages:

1. **Inputs:** two compact source nodes for `Time-Series Data` and `Knowledge Understanding`.
2. **Core:** a visually stronger `Cognitive Reasoning` node where the two input paths converge.
3. **Applications:** two output nodes for `AI for Science` and `Energy Systems`.

Thin connector paths establish direction without using large arrows. The central reasoning node receives the strongest accent; input and application nodes remain quieter.

## Visual Style

- Reuse the page palette: deep USTC blue, teal, pale blue surfaces, and existing border gray.
- Use simple line icons and small rounded nodes rather than illustrative artwork.
- Keep fills translucent and shadows minimal so the diagram reads as an academic schematic, not a promotional banner.
- Use a subtle dot/grid field only inside the SVG to bind the composition; it must stay low contrast.
- Do not animate the diagram or add hover behavior.

## Accessibility

The inline SVG is a supporting explanation of concepts already present in the page copy. It should expose a concise accessible name and description through `<title>` and `<desc>` referenced by `aria-labelledby`. It must not receive keyboard focus, and it must not introduce interactive controls.

## Implementation Boundary

The change is limited to:

- `research.html` for the hero wrapper, inline SVG, component styles, and responsive rules.
- `scripts/verify-scenario-cards.mjs` for static regression coverage, extending the existing Research-page verifier rather than adding a new test framework.
- The implementation plan created after this design is approved.

No raster asset is required; the diagram should remain code-native and scale cleanly.

## Verification

Static checks must confirm:

- The hero contains one copy wrapper and one cognitive-pipeline SVG.
- The SVG exposes its title and description and contains the five approved concept labels.
- Wide layouts use a two-column hero and keep the existing paragraph alignment and no-hyphenation declarations.
- The `<=960px` responsive rule hides the visual and collapses the grid.
- The existing scenario-card and Research intro regression tests continue to pass.

Browser checks must cover at least:

- `1187px`: balanced two-column layout, complete diagram, readable copy, no automatic word splits, and no horizontal overflow.
- `390px`: diagram hidden, single-column copy, existing left alignment preserved, and no horizontal overflow.
- No console warnings or errors introduced by the change.

## Success Criteria

The wide-screen empty area becomes purposeful, the research progression is understandable at a glance, the paragraph remains readable, and the mobile page is visually unchanged apart from normal reflow.
