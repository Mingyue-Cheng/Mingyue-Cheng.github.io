# Industry Support Logos Implementation Plan

> **For agentic workers:** Use the approved design and execute the checklist autonomously. The user explicitly requested no further questions; preserve the existing preview workspace and leave publishing for a separate request.

**Goal:** Replace the homepage industrial-grant bullet with a short bilingual sentence and authentic, original-color iFLYTEK, Huawei, Tencent, and Kuaishou logos.

**Architecture:** Keep the five grants in their current list. Follow it with an isolated `.industry-support` block whose translated paragraph is a sibling of a four-item logo list. Add scoped rules to the existing final stylesheet; no JavaScript, dependencies, or other page changes.

**Tech Stack:** Static HTML, CSS Grid, existing i18n dictionary, Node's built-in test runner.

---

### Task 1: Regression contract

**Create:** `scripts/verify-industry-support.mjs`

- [x] Assert the five existing grant keys remain in the timeline and the industrial sentence is outside it.
- [x] Assert the ordered image sources are `iflytek.png`, `huawei.png`, `tencent.png`, `kuaishou.png` under `files/assets/industry/`, with bilingual alt text and intrinsic dimensions.
- [x] Assert each asset is a nonempty PNG and provenance is recorded.
- [x] Evaluate the real i18n dictionary and assert the exact approved English/Chinese sentences; ensure images are outside all translated elements.
- [x] Assert scoped desktop four-column and mobile two-column grid rules with proportional image sizing.
- [x] Run `node --test scripts/verify-industry-support.mjs`; expect failure because the block and assets do not yet exist.

### Task 2: Authentic local assets and homepage implementation

**Create:** `files/assets/industry/{iflytek,huawei,tencent,kuaishou}.png`, `files/assets/industry/README.md`
**Modify:** `index.html`, `files/assets/site-content.css`
**Update existing cache-version contract:** `scripts/verify-site-theme.mjs` (homepage version only; retain final stylesheet order checks).

- [x] Download verified official PNGs without recoloring, stretching, or clipping. Inspect the iFLYTEK Chinese original-color logo before use. Record exact source pages and asset URLs.
- [x] Remove only the final industry `<li>` and insert this structure after the timeline, with all four images in the approved order:

```html
<div class="industry-support">
  <p id="industry-support-label" class="industry-support-copy" data-i18n="grants.industry">My research is also partially supported by industry grants from:</p>
  <ul class="industry-support-logos" aria-labelledby="industry-support-label">
    <li class="industry-support-logo industry-support-logo--iflytek"><img src="files/assets/industry/iflytek.png" alt="科大讯飞 iFLYTEK" width="122" height="37" loading="lazy" decoding="async"></li>
    <li class="industry-support-logo industry-support-logo--huawei"><img src="files/assets/industry/huawei.png" alt="华为 Huawei" width="266" height="60" loading="lazy" decoding="async"></li>
    <li class="industry-support-logo industry-support-logo--tencent"><img src="files/assets/industry/tencent.png" alt="腾讯 Tencent" width="401" height="54" loading="lazy" decoding="async"></li>
    <li class="industry-support-logo industry-support-logo--kuaishou"><img src="files/assets/industry/kuaishou.png" alt="快手 Kuaishou" width="1571" height="590" loading="lazy" decoding="async"></li>
  </ul>
</div>
```

- [x] Set iFLYTEK intrinsic width/height from the downloaded original. Update `grants.industry` to the approved English sentence and `部分研究亦获得以下企业科研项目支持：`.
- [x] Add this scoped layout, with logo widths optically balanced after image inspection:

```css
.industry-support { margin-top: 24px; padding-top: 20px; border-top: 1px solid #e2eaee; }
.section .industry-support-copy { margin: 0 0 16px; color: #516773; line-height: 1.7; text-align: left; }
.industry-support-logos { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; list-style: none; margin: 0; padding: 0; }
.industry-support-logo { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 92px; padding: 18px; background: #fff; border: 1px solid #e2eaee; border-radius: 12px; }
.industry-support-logo img { display: block; width: var(--logo-width, 160px); max-width: 100%; height: auto; object-fit: contain; }
.industry-support-logo--tencent { --logo-width: 180px; }
.industry-support-logo--kuaishou { --logo-width: 138px; }
.industry-support-logo--iflytek { --logo-width: 122px; }
@media (max-width: 600px) { .industry-support-logos { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; } .industry-support-logo { min-height: 84px; padding: 16px; } }
```

- [x] Run the focused test and full `npm test`, expecting all tests to pass.

### Task 3: Review and visual verification

- [x] Independently review requirements then CSS/content quality; resolve any issues.
- [x] Preview `http://127.0.0.1:4173/index.html#grants` at desktop and 390px mobile, inspect real images, overflow, proportions, and Chinese/English switching.
- [x] Reset temporary browser viewport/language changes and leave the updated grants preview open.
- [x] Run `git diff --check`, review the exact changed paths, and report local completion without claiming a push/deployment.

## Scope self-review

This plan covers the selected sentence-plus-original-logo design, company order, five preserved grants, isolated translations, reliable local assets with attribution, desktop/mobile layout, automated checks, and rendered QA. No Awards changes, publication edits, external links, new dependencies, or automatic push are included.

## Verification notes

- The five initial regression tests failed against the old homepage, then passed after implementation.
- Actual browser inspection exposed an old cached `site-content.css?v=20260911`: its CSSOM contained no industry selectors although the server returned the new file. Added a sixth failing regression, then updated only the homepage stylesheet URL to `v=20260914-industry`. Reload showed the new grid and eliminated overflow.
- At 1280 px: four 249 px grid columns, all images loaded, original aspect ratios, no horizontal overflow. At 390 px: two 153.5 px columns; all four images remained loaded after switching to Chinese and back to English, with no overflow.
- Independent spec and code-quality review approved the scoped change. The normal browser viewport and English language were restored, and the local grants preview was retained. No push was performed.
