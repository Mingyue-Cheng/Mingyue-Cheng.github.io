# Academic Navigation A1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the approved A1 three-part academic navigation with balanced desktop geometry, restrained active feedback, tighter homepage hero spacing, and robust mobile interaction targets.

**Architecture:** Keep the existing static HTML and navigation runtimes. Put all shared header presentation in the final cascade layer `files/assets/site-theme.css`, retain the nine page shells and their current semantic markup, and make the one homepage-specific spacing change in `index.html`. Lock each approved behavior with dependency-free Node tests before changing production files.

**Tech Stack:** Static HTML, CSS Grid/Flexbox, vanilla JavaScript behavior preserved unchanged, Node `node:test`, local HTTP preview, browser viewport QA.

---

## File Map

- Modify `scripts/verify-site-theme.mjs`: shared header layout, interaction-state, cache-key, and mobile safety contracts.
- Modify `scripts/verify-homepage-positioning.mjs`: homepage-only hero spacing contract.
- Modify `files/assets/site-theme.css`: final shared desktop and mobile navigation presentation.
- Modify `index.html`: homepage hero top padding and shared-theme cache key.
- Modify `research.html`, `publications.html`, `projects.html`, `news.html`, `awards.html`, `service.html`, `resources.html`, `prediction-intelligence.html`: shared-theme cache key only.

### Task 1: Lock the A1 visual contract with failing tests

**Files:**
- Modify: `scripts/verify-site-theme.mjs:20-80`
- Modify: `scripts/verify-homepage-positioning.mjs:1-160`

- [ ] **Step 1: Change the expected shared-theme cache key**

In the existing stylesheet-order assertion, require the new theme key while leaving the content-layer key unchanged:

```js
assert.deepEqual(styles.slice(-2), [
  '<link rel="stylesheet" href="files/assets/site-theme.css?v=20260913">',
  '<link rel="stylesheet" href="files/assets/site-content.css?v=20260911">'
]);
```

- [ ] **Step 2: Replace the former desktop-geometry assertion with A1 contracts**

Use focused assertions that require the final CSS layer to own the grid, current-page marker, centered link geometry, rectangular language control, and 44px targets:

```js
test('navigation implements the approved A1 desktop geometry and current states', () => {
  assert.match(theme, /html \.site-header \.nav-inner\s*\{[^}]*display:\s*grid;[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) auto minmax\(0,\s*1fr\);[^}]*min-height:\s*68px;/s);
  assert.match(theme, /html \.site-header \.nav-logo\s*\{[^}]*position:\s*relative;[^}]*min-height:\s*44px;[^}]*justify-self:\s*start;/s);
  assert.match(theme, /html \.site-header \.nav-logo\[aria-current="page"\]::after\s*\{[^}]*width:\s*20px;[^}]*height:\s*2px;/s);
  assert.match(theme, /html \.site-header \.nav-links\s*\{[^}]*justify-content:\s*center;[^}]*justify-self:\s*center;/s);
  assert.match(theme, /html \.site-header \.nav-links a\s*\{[^}]*min-height:\s*44px;/s);
  assert.match(theme, /html \.site-header \.language-toggle\s*\{[^}]*min-width:\s*58px;[^}]*height:\s*36px;[^}]*border-radius:\s*8px;[^}]*justify-self:\s*end;/s);
});

test('navigation uses centered short underlines and a solid keyboard focus ring', () => {
  assert.match(theme, /html \.site-header \.nav-links a::after\s*\{[^}]*left:\s*50%;[^}]*width:\s*20px;[^}]*transform:\s*translateX\(-50%\) scaleX\(0\);[^}]*transform-origin:\s*center;/s);
  assert.match(theme, /html :focus-visible\s*\{[^}]*outline:\s*3px solid var\(--accent\);/s);
});
```

- [ ] **Step 3: Extend the mobile contract**

Replace the outdated `40px` toggle and bare list assumptions with these requirements:

```js
test('the A1 mobile menu keeps large targets, a current state, and landscape scrolling', () => {
  const mobile = theme.slice(theme.indexOf('@media (max-width: 900px)'));
  assert.match(mobile, /html \.site-header \.nav-inner\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\) auto auto;[^}]*min-height:\s*64px;/s);
  assert.match(mobile, /html \.site-header \.nav-logo\s*\{[^}]*min-height:\s*44px;/s);
  assert.match(mobile, /html \.site-header \.language-toggle\s*\{[^}]*height:\s*44px;/s);
  assert.match(mobile, /html \.site-header \.nav-toggle\s*\{[^}]*width:\s*44px;[^}]*height:\s*44px;/s);
  assert.match(mobile, /html \.site-header\.js-mobile-nav \.nav-links\s*\{[^}]*max-height:\s*calc\(100dvh - 76px\);[^}]*overflow-y:\s*auto;[^}]*background:\s*#f6f9fa;/s);
  assert.match(mobile, /html \.site-header\.js-mobile-nav \.nav-links a(?:\.active|\[aria-current="page"\])[^}]*background:\s*var\(--accent-light\)/s);
});
```

- [ ] **Step 4: Add the homepage spacing contract**

Append to `scripts/verify-homepage-positioning.mjs`:

```js
test('homepage hero starts closer to the refined shared navigation', () => {
  assert.match(indexHtml, /\.profile-section\s*\{[^}]*padding:\s*38px 0 42px;/s);
});
```

- [ ] **Step 5: Run the focused tests and verify RED**

Run:

```bash
node --test scripts/verify-site-theme.mjs scripts/verify-homepage-positioning.mjs
```

Expected: failures for the `20260913` cache key, grid geometry, active marker, rectangular language control, mobile panel/scrolling, solid focus ring, and `38px` hero padding. Existing unrelated tests should continue to pass.

### Task 2: Implement the shared desktop A1 navigation

**Files:**
- Modify: `files/assets/site-theme.css:12-206`

- [ ] **Step 1: Strengthen focus and the shared header surface**

Use a solid focus indicator and a slightly clearer edge:

```css
html :focus-visible {
  outline: 3px solid var(--accent);
  outline-offset: 3px;
}

html .site-header {
  position: sticky;
  top: 0;
  z-index: 100;
  padding: 0;
  border-bottom: 1px solid #dfe8ed;
  background: rgba(255, 255, 255, 0.96);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 7px 22px rgba(var(--accent-rgb), 0.05);
}
```

- [ ] **Step 2: Replace the flex row with the approved three-column grid**

```css
html .site-header .nav-inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  min-width: 0;
  min-height: 68px;
}
```

Add `position: relative`, `min-height: 44px`, and `justify-self: start` to `.nav-logo`. Add a 20-by-2px centered `.nav-logo[aria-current="page"]::after` at the lower edge. Keep the existing square `::before` mark.

- [ ] **Step 3: Center links and unify short underline feedback**

Keep the current labels and typography, but set `.nav-links` to `justify-content: center`, `justify-self: center`, `width: max-content`, and `gap: clamp(10px, 1.4vw, 20px)`. Give each link a 44px minimum height.

Replace the full-label underline with:

```css
html .site-header .nav-links a::after {
  content: "";
  position: absolute;
  left: 50%;
  bottom: 2px;
  width: 20px;
  height: 2px;
  border-radius: 999px;
  background: var(--accent);
  transform: translateX(-50%) scaleX(0);
  transform-origin: center;
  transition: transform 0.2s ease;
}
```

Use `translateX(-50%) scaleX(1)` for hover, focus, `.active`, and `[aria-current="page"]`.

- [ ] **Step 4: Refine the desktop controls**

Set `.language-toggle` to `min-width: 58px`, `height: 36px`, `border-radius: 8px`, and `justify-self: end`. Keep the pale hover state. Set the base `.nav-toggle` to `44px` square so the mobile rule never has to enlarge a smaller control.

- [ ] **Step 5: Run the shared-theme test**

Run:

```bash
node --test scripts/verify-site-theme.mjs
```

Expected: desktop A1 assertions pass; cache-key and mobile assertions remain RED until Task 3.

### Task 3: Implement mobile safety, homepage spacing, and cache keys

**Files:**
- Modify: `files/assets/site-theme.css:208-273`
- Modify: `index.html:222-230,1697`
- Modify: `research.html:611`
- Modify: `publications.html:476`
- Modify: `projects.html:382`
- Modify: `news.html:276`
- Modify: `awards.html:268`
- Modify: `service.html:277`
- Modify: `resources.html:242`
- Modify: `prediction-intelligence.html:22`

- [ ] **Step 1: Convert the 900px layout to a three-control grid**

Inside the existing 900px media query, use:

```css
html .site-header .nav-inner {
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 8px;
  min-height: 64px;
}

html .site-header .nav-logo { min-height: 44px; }
html .site-header .language-toggle { height: 44px; }
html .site-header .nav-toggle { width: 44px; height: 44px; }
html .site-header .nav-links { grid-column: 1 / -1; width: 100%; }
```

Preserve the progressive no-JavaScript visible-link fallback.

- [ ] **Step 2: Style the enhanced open menu and current state**

For `.site-header.js-mobile-nav .nav-links`, retain `display: none` and add `max-height: calc(100dvh - 76px)`, `overflow-y: auto`, `overscroll-behavior: contain`, `margin: 0 0 10px`, `padding: 6px 10px 10px`, `border: 1px solid var(--border)`, `border-radius: 10px`, and `background: #f6f9fa`.

Keep links 44px high with 10px 12px padding. For `.active` and `[aria-current="page"]`, use `border-radius: 7px`, `background: var(--accent-light)`, `color: var(--accent)`, and `box-shadow: inset 3px 0 0 var(--accent)`.

- [ ] **Step 3: Tighten the homepage hero**

Change only the desktop/default rule:

```css
.profile-section {
  padding: 38px 0 42px;
  /* existing border and backgrounds stay unchanged */
}
```

Keep the existing smaller mobile override unchanged.

- [ ] **Step 4: Bust only the changed shared-theme cache key**

In all nine public HTML pages, replace:

```html
<link rel="stylesheet" href="files/assets/site-theme.css?v=20260911">
```

with:

```html
<link rel="stylesheet" href="files/assets/site-theme.css?v=20260913">
```

Do not change the `site-content.css` key.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run:

```bash
node --test scripts/verify-site-theme.mjs scripts/verify-homepage-positioning.mjs
```

Expected: all focused tests pass with zero failures.

- [ ] **Step 6: Commit the tested implementation**

```bash
git add -- scripts/verify-site-theme.mjs scripts/verify-homepage-positioning.mjs files/assets/site-theme.css index.html research.html publications.html projects.html news.html awards.html service.html resources.html prediction-intelligence.html
git commit -m "feat: refine shared academic navigation"
```

### Task 4: Full regression and browser QA

**Files:**
- Verify only; fix the smallest relevant file if a regression is found.

- [ ] **Step 1: Run repository verification**

```bash
npm test
node --check scripts/verify-site-theme.mjs
node --check scripts/verify-homepage-positioning.mjs
git diff --check
```

Expected: all tests pass, syntax checks exit zero, and `git diff --check` prints nothing.

- [ ] **Step 2: Start a local preview**

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

Open `http://127.0.0.1:4173/index.html#home`.

- [ ] **Step 3: Verify responsive states**

Inspect at `1440x900`, `901x900`, `900x900`, `390x844`, and `667x320`:

- desktop brand/menu/language geometry is balanced and the menu remains centered;
- 901px stays in desktop mode and 900px uses the mobile menu;
- Homepage current marker and every subpage current marker are visible;
- language and menu controls are at least 44px on mobile;
- the 667x320 open menu scrolls internally to Resources;
- no horizontal overflow, broken resources, clipped focus state, or console errors occur.

- [ ] **Step 4: Verify behavior and bilingual preservation**

Switch English/Chinese on the homepage and one shared-runtime subpage. Open the mobile menu, confirm focus enters the first visible link, close with Escape, and confirm focus returns to the toggle. Resize from 900px to 901px and confirm the open state clears.

- [ ] **Step 5: Request independent review and resolve findings**

Have one reviewer check the implementation against `docs/superpowers/specs/2026-09-13-academic-navigation-a1-design.md`, and a second reviewer inspect CSS maintainability, regressions, and accessibility. Apply only findings within the approved navigation scope, then rerun Step 1 and affected browser checks.

- [ ] **Step 6: Preserve worktree boundaries**

Confirm the feature worktree contains only intended commits and that the main checkout still lists the pre-existing `.DS_Store`, `.superpowers/`, photo, and academic note without staging or modification.
