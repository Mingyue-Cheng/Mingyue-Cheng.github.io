# Systems Product homepage section

## Scope

Add one Systems Product section to the personal homepage immediately before Open Source. Present exactly two cards, in the requested order:

1. 科言乐问 — https://lewen.bdaa.pro/
2. 科言文修 — https://writelearn.bdaa.pro/

Keep these product names in both languages. Translate the section heading to 系统产品 in Chinese. Preserve all existing research, publications, project cards, navigation, and pending edits. No product rename, backend work, sign-in, commit, push, or deployment is included.

## Design

An independent section makes the online systems visible without conflating them with code repositories. Inline links inside existing projects would be less discoverable; a new navigation item and subpage would exceed the requested two-card module.

Use two equally sized, whole-card links on desktop and a single column at 680px and below. Reuse the existing Prussian-blue palette, white surfaces, 14px rounded borders, understated shadows and section-heading style. Use the user-supplied product logos, concise descriptions, visible domains and a Visit website action. Preserve keyboard focus visibility and respect reduced-motion preferences. Use natural wrapping and justified description text.

### Supplied logos (2026-09-23 follow-up)

Replace the original placeholder icons with the supplied 1254 × 1254 PNG files. The first attachment, the grey/yellow cat, belongs to 科言文修; the second, the blue rocket/book/search emblem, belongs to 科言乐问. Copy the original bytes into `files/assets/system-products/wenxiu-logo.png` and `lewen-logo.png` respectively. Do not regenerate, recolor, crop or rename products.

Display each logo in the existing card header at 80 × 80 CSS pixels with `object-fit: contain`, a meaningful product-specific alt label, explicit dimensions and lazy loading. Keep the original white background and natural image ratio. This provides more readable detail than the former 42-pixel icon badges while avoiding the extra height of a full-width banner. Keep the existing card order, all text, destinations, layout breakpoint and motion/focus rules unchanged.

## Copy

| Key | English | Chinese |
| --- | --- | --- |
| systems.heading | Systems Product | 系统产品 |
| systems.brand | 科言 · Science Intelligence | 科言 · 科学智能 |
| systems.lewen | Discover scientific literature through quick search and in-depth retrieval. | 面向科学文献智能获取，支持快速搜索与深度检索。 |
| systems.wenxiu | Support academic writing with polishing, proofreading, and translation tools. | 面向学术写作，提供智能润色、批阅纠错与语言翻译工具。 |
| systems.visit | Visit website | 访问系统 |

Public landing-page text was inspected on 2026-09-23. Lewen exposes quick/deep retrieval. The writing site exposes polishing, proofreading and translation, and currently displays a maintenance notice. The cards describe the tools without claiming availability, performance, free access or validated outcomes. Display the user-supplied name 科言文修 even though its current browser title is 科言智能助写.

## Verification and boundaries

Add dependency-free Node tests for section placement, exactly two correct links, safe new-tab behavior, translated copy, stable Chinese names, responsive layout, keyboard focus and reduced motion. Execute the actual homepage translation function in tests. Verify desktop/mobile rendering and both language directions. Keep CSS isolated in files/assets/system-products.css and load it only on the homepage.

Proceed autonomously under the user's standing preference against routine confirmation questions. Keep the current preview checkout and its existing changes intact; all work remains local and uncommitted.

## Self-review

The card count, names, destinations, section placement, bilingual copy, accessibility, responsiveness and non-publication boundary are explicit. The module adds no tracking, external embeds or dependencies.
