# Scenario Grid Edge Alignment — Design

## Goal

Align the outer edges of the scenario cards with the scenario heading and divider on both the homepage and Research page.

## Layout

- Keep two equal columns above the existing `900px` breakpoint.
- Let the shared scenario grid use the full available container width; remove the `900px` desktop cap and auto-centering.
- Keep one column at `900px` and below, also using the full available width; remove the `720px` responsive cap.
- Preserve card spacing, internal padding, text justification, accents, hover behavior, and mobile styling.

## Scope and verification

- Change only the shared scenario-card stylesheet and its structural verifier.
- Require full-width grid behavior in automated checks and reject reintroduced centering caps.
- Verify both pages at desktop, breakpoint, and mobile widths with no horizontal overflow.
- Publish only the scoped files and refresh the existing Codex preview after GitHub Pages succeeds.
