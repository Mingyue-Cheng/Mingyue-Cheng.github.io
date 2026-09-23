# System Product Logos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Embed the two exact user-supplied logos in the existing homepage product cards.

**Architecture:** Replace each placeholder SVG with a local PNG image and a shared 80-pixel contained-image rule. Preserve the current bilingual content, native links, card ordering and responsive grid.

**Tech Stack:** Static HTML/CSS, PNG assets, existing Node.js tests.

## Task 1: Regression tests first

**Modify:** `scripts/verify-system-products.mjs`.

- [x] Remove the obsolete placeholder-SVG assertion from the card contract. Add checks that each card contains exactly one `img.system-product-logo` with its correct local filename, product-specific alt label, width/height 80, lazy loading and asynchronous decoding; no placeholder SVG remains.
- [x] Verify the copied asset bytes using `createHash('sha256').update(readFileSync(asset)).digest('hex')`. Expected original hashes: lewen `79cdf24697827860f9a500e4a347d302b63f36a96b6ce4919814ce58bfc22f7c`; wenxiu `467863996ab00d28857e5b460d0f6273d85d160d8fe21bd4fe727eee185600c5`. Assert file existence before reading.
- [x] Assert a shared `.system-product-logo` rule containing `width: 80px`, `height: 80px` and `object-fit: contain`. Run `node --test scripts/verify-system-products.mjs`; expect missing-logo failures.

## Task 2: Embed the assets

**Create:** `files/assets/system-products/lewen-logo.png`, `files/assets/system-products/wenxiu-logo.png` (byte-for-byte copies of the second and first attachments).

**Modify:** `index.html`, `files/assets/system-products.css`.

- [x] Replace the corresponding icon spans with:

```html
<img class="system-product-logo" src="files/assets/system-products/lewen-logo.png" alt="科言乐问 Logo" width="80" height="80" loading="lazy" decoding="async">
<img class="system-product-logo" src="files/assets/system-products/wenxiu-logo.png" alt="科言文修 Logo" width="80" height="80" loading="lazy" decoding="async">
```

- [x] Replace unused icon/SVG styling with:

```css
.system-product-logo {
  display: block;
  flex: 0 0 80px;
  width: 80px;
  height: 80px;
  object-fit: contain;
}
```

## Task 3: Verify and hand off

- [x] Run `npm test` and `git diff --check`; require zero failures.
- [x] Render desktop and narrow-screen versions, check both logos load with the correct mapping, preserve their ratios, and introduce no horizontal overflow. Check both English and Chinese layouts.
- [x] Preserve the existing dirty worktree and leave changes uncommitted and unpushed. Update this plan with actual verification results.

## Verification results

- The three new tests failed before implementation for the expected missing image, asset and CSS rule; all 10 focused tests passed after implementation.
- Full suite: 293 passed, 0 failed. `git diff --check` passed.
- Six browser checks passed using iframe viewport widths of 1138, 390 and 320 pixels, each in English and Chinese. Both PNGs loaded at their original 1254 × 1254 resolution and rendered at 80 × 80 pixels with `object-fit: contain`; cards had no horizontal overflow.
- Desktop English and mobile Chinese screenshots were visually inspected. The independent read-only reviewer found no issues.
- Existing pending changes were preserved. No commit, push or deployment was performed.
