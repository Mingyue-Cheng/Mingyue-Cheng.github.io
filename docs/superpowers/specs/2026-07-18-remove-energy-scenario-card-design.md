# Remove Energy Scenario Card — Design

## Goal

Remove the “AI for Energy Systems” card from the broader-application scenario module on both the homepage and the Research page, then rebalance the two remaining cards.

## Scope

- Remove the Energy scenario card from `index.html` and `research.html`.
- Remove the now-unused homepage i18n keys for the Energy card in both English and Chinese.
- Keep all other Energy Systems content elsewhere on the site unchanged.
- Keep the homepage and Research page implementations visually and structurally synchronized.

## Layout

- Desktop: display “AI for Science” and “AI for User Modeling” as two equal-width columns.
- Center the card grid and cap it at `900px` so the cards do not stretch across the full content width.
- At `900px` and below: switch to one centered column capped at `720px`.
- Preserve the existing card typography, internal alignment, accent colors, and responsive padding.

## Verification

- Automated checks must require exactly two cards in the order Science, User Modeling on both pages.
- Automated checks must reject the removed Energy card, its CSS modifier, and its homepage i18n keys.
- Automated checks must enforce the centered two-column and responsive single-column layout contract.
- Visually inspect both pages at desktop, tablet, and mobile widths, including both homepage languages.
- Publish only the scoped files and verify the deployed site after GitHub Pages completes.
