# Academic Navigation A1 Design

## Goal

Refine the shared academic-site header so the brand, primary navigation, and language control form a balanced three-part composition. The change should improve the visual hierarchy shown in the homepage screenshot without changing navigation labels, destinations, language behavior, or the existing 900px responsive breakpoint.

## Approved Direction

The user selected **A1: balanced three-part academic navigation**.

- Keep the existing Prussian-blue palette (`#003153`) and restrained academic character.
- Place the Homepage brand at the left, center the primary navigation independently of the side controls, and keep the language switch at the right.
- Use a persistent short underline for the current page and the same centered underline language for hover and keyboard focus.
- Replace the fully pill-shaped language switch with a compact 8px-radius rectangular control.
- Strengthen the lower border and shadow just enough to separate the sticky header from the pale homepage hero.
- Use a 68px desktop navigation row and reduce the homepage hero top padding from 52px to 38px.

## Desktop Behavior

The final shared layer in `files/assets/site-theme.css` owns the visual result. The `.nav-inner` layout uses three grid columns with equal flexible side tracks and an intrinsic center track. This keeps the menu geometrically centered while allowing the brand and language control to align to the outer container edges.

The Homepage brand retains its existing square mark and text. When it is the current page, it receives the same short underline used by active primary links. Primary links retain their labels and destinations; no navigation item is added, removed, or renamed.

## Mobile Behavior

At and below 900px, the top row remains Homepage, language switch, and menu button. All three interactive targets are at least 44px high. The opened menu appears as a pale inset panel, gives the current item a Prussian-blue left marker and light background, and preserves the existing keyboard behavior.

The opened menu receives a viewport-relative maximum height and internal vertical scrolling so the final navigation item remains reachable in low-height landscape viewports. The no-JavaScript fallback continues to expose all links.

## Accessibility and Motion

- Preserve one current-page marker and the existing navigation semantics.
- Keep Escape-to-close, focus transfer, focus return, language switching, and desktop resize cleanup unchanged.
- Increase visible keyboard focus contrast by using the solid accent color.
- Preserve reduced-motion behavior.
- Do not alter page content, publication ordering, or bilingual copy.

## Implementation Scope

- Update `files/assets/site-theme.css` for the shared desktop and mobile navigation presentation.
- Update the homepage `.profile-section` top padding in `index.html`.
- Update the cache key for `site-theme.css` on all nine public HTML pages.
- Update focused verifier contracts before production changes.

No navigation JavaScript or translation dictionaries are changed unless a failing regression demonstrates that the approved visual behavior cannot be implemented without them.

## Verification

- Test-first contracts cover the three-column desktop layout, current-page underline, rectangular language control, 44px mobile targets, inset current state, landscape scrolling, and reduced homepage hero padding.
- Run the complete `npm test` suite and syntax/diff checks.
- Inspect all nine public pages at representative desktop and mobile widths.
- Explicitly inspect 901px, 900px, 390px, and 667x320 viewports; check both languages, mobile menu open/close, overflow, focus, console errors, and broken resources.
- Preserve unrelated uncommitted files and stage only intended paths if a commit is created.

## Out of Scope

- Renaming Homepage to the researcher's name.
- Changing navigation destinations, section names, or language strings.
- Reworking the profile content or the rest of the page design.
- Migrating the static site to another framework.
