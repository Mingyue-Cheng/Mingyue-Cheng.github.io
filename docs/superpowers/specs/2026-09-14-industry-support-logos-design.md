# Homepage Industry Research Support Logos

## Approved visual direction

Replace the final industrial-grant text bullet in the homepage Research Grants section with a short explanatory sentence and four original-color company logos, ordered iFLYTEK, Huawei, Tencent, Kuaishou. The user selected the sentence-plus-logos option.

## Scope and content

- Keep the five existing research-grant entries and all other homepage content unchanged.
- Place the industry support block immediately after the grant list, without a timeline bullet.
- English sentence: "My research is also partially supported by industry grants from:"
- Chinese sentence: "部分研究亦获得以下企业科研项目支持："
- Update the existing `grants.industry` translation values; keep image markup outside the translated sentence so language switching cannot remove it.
- Use authentic official logo assets, downloaded locally for reliable rendering. Preserve their original colors and proportions; provide descriptive bilingual alternative text.
- Do not alter the Awards subpage, add outbound links, add a carousel, or introduce animation.

## Layout

- White background with restrained spacing matching the existing Prussian-blue academic theme.
- Four balanced logo slots in one row on larger screens; two columns on small screens.
- Constrain image height and width without stretching, clipping, recoloring, or decorating the trademarks.
- No new JavaScript or dependencies. Reuse the existing language switch.

## Verification and delivery

- Test the exact company order, local asset existence, alternative text, translation-safe structure, and responsive styles.
- Run the full repository tests and check the diff for unrelated changes.
- Inspect the actual local preview at desktop and narrow mobile widths, including Chinese mode and image loading.
- Preserve existing unrelated worktree files. Deliver a local preview; do not push unless requested.

## Self-review

The design is limited to one homepage block. The logo order, copy, language behavior, responsive layout, asset source requirement, exclusions, and acceptance checks are explicit, with no placeholders or unresolved implementation choices.
