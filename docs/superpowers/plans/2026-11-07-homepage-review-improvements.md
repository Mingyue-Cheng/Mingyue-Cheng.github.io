# Homepage Review Improvements

**Goal:** Apply the user's approved end-to-end review while preserving the academic style, research direction names, all 77 publications, expanded years, and 12-item homepage news preview.

**Architecture:** Retain the static HTML site and its existing language dictionaries. Update duplicated content together, use explicit publication tags, and share small presentation rules in the existing CSS. Preserve unrelated worktree changes. No publishing is included in this request.

**Validation:** Run the existing Node checks, targeted new regression checks for actual failures, local link/HTML validation, browser checks at desktop and mobile widths in both languages, and compile/text/render checks for both CV PDFs.

- [x] Synchronize both CVs to 77 publications and November 7, 2026; preserve authorship, links, language and layout; compile and inspect PDFs.
- [x] Complete bilingual news/awards/service/resources and synchronize homepage text; include confirmed ICML AC and conference/tutorial service; repair inaccessible Time-R1 resource entry.
- [x] Correct reasoning-filter membership; normalize venue formatting, remove DOI placeholders, and add year links without hiding any year.
- [x] Add representative work links to the three Research directions; clarify CastMind code availability; translate dataset descriptions and add PaperArena's WSDM badge.
- [x] Improve homepage research/profile prose, compact repeated teaching entries, keep grants/status/support lists consistent, and add compact page section navigation.
- [x] Fix the unclosed publication section and accessible name; use left-aligned English body text on small screens and reduce excessive emphasis.
- [x] Optimize product logo delivery losslessly, update real modification dates and cache versions, and synchronize the CV download hash.
- [x] Run verification, adapt obsolete assertions to approved changes, inspect both language layouts, and deliver the refreshed local homepage.

Verified November 7, 2026: 360/360 Node checks; 9 HTML pages, 200 local references and 41 anchors valid; desktop and narrow-screen bilingual browser checks passed with no horizontal overflow. Homepage still shows 12 news items, 77 papers, and all six year groups expanded. Both CVs compile and contain 77 records (EN 8 pages; ZH 7 pages), with final pages visually reviewed. No commit or push performed.
