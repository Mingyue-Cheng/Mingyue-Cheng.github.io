# Remove Homepage Action Buttons Design

## Goal

Remove the three hero action buttons shown below the homepage research thesis: “Research Vision,” “Selected Publications,” and “Join & Collaborate.”

## Scope

- Delete the complete `.profile-actions` markup group from `index.html`.
- Delete the CSS used only by `.profile-actions`, `.profile-action`, and `.profile-action--primary`, including the mobile height rule.
- Delete the four English and Chinese translation keys used only by that group.
- Replace the positive button assertions with a regression assertion that the group, styles, and translation keys are absent.

## Preserved Behavior

The research thesis, profile badges, publication section, collaboration note, section anchors, language switching, and mobile navigation remain unchanged.

## Verification

Use a red-green regression test, run the complete Node test suite and JavaScript/diff checks, then render the homepage at desktop and mobile widths to confirm the hero spacing remains clean.
