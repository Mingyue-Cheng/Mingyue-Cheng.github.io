# Remove Tabular Data Mining Collection Link

## Goal

Remove the `Tabular Data Mining` research-collection link from the personal homepage surfaces without changing the site's publication taxonomy or research metadata.

## Scope

- Remove the link and its adjacent separator from the visible research-collections line in `index.html`.
- Remove the same link from the English and Chinese `research.collections` translations in `index.html`.
- Remove the matching collection link from `research.html` so the two research surfaces remain synchronized.
- Preserve the `Tabular Data Mining` publication filter and the Open Graph/Twitter research descriptions.

## Verification

- Add a focused regression assertion that the collection blocks and translations no longer contain `ustc-table-mining.github.io` or the `🧮` collection marker.
- Keep assertions that the publication filter and metadata still contain `Tabular Data Mining`.
- Run the full homepage scenario verifier and `git diff --check`.
- Preview the affected collection line in English and Chinese before publishing.

## Publishing

Stage only the design/plan, focused verifier, `index.html`, and `research.html`. Preserve unrelated worktree files, push `main`, and verify GitHub Pages plus the live pages.
