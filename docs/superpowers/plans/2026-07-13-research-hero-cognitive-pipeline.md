# Research Hero Cognitive Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the wide-screen empty area in the Research Interests hero with an accessible, responsive cognitive-pipeline diagram that communicates `Time-Series Data + Knowledge Understanding → Cognitive Reasoning → AI for Science / Energy Systems`.

**Architecture:** Keep the component self-contained in `research.html`: wrap the existing copy, add one inline SVG sibling, and style the hero as a two-column grid above `960px`. Extend the existing Node static verifier before implementation, then validate the rendered desktop and mobile layouts in the browser. Do not add JavaScript, external assets, animation, or homepage changes.

**Tech Stack:** Static HTML5, inline SVG, CSS Grid, Node.js built-in test runner, local HTTP browser verification.

---

## File map

- Modify `research.html`: hero grid, copy wrapper, cognitive-pipeline SVG, visual styles, and `<=960px` collapse rule.
- Modify `scripts/verify-scenario-cards.mjs`: one regression test for structure, accessibility, approved labels, desktop grid declarations, and responsive collapse.
- Create `docs/superpowers/plans/2026-07-13-research-hero-cognitive-pipeline.md`: this implementation and publication plan.

No other source or asset file belongs in scope.

### Task 1: Build the tested Research hero pipeline

**Files:**
- Modify: `scripts/verify-scenario-cards.mjs`
- Modify: `research.html:146-185`
- Modify: `research.html:476-500`
- Modify: `research.html:564-579`

- [ ] **Step 1: Append the failing regression test**

Append this test to `scripts/verify-scenario-cards.mjs`:

```js
test('research hero includes an accessible responsive cognitive pipeline', () => {
  const hero = sectionBetween(
    researchHtml,
    '<!-- ===== Hero ===== -->',
    '<!-- ===== Main ===== -->'
  );
  const heroText = visibleText(hero);

  assert.equal(matchCount(hero, /class="page-hero-copy"/g), 1);
  assert.equal(matchCount(hero, /class="page-hero-visual"/g), 1);
  assert.equal(matchCount(hero, /<svg class="cognitive-pipeline"/g), 1);
  assert.match(
    hero,
    /<svg class="cognitive-pipeline" viewBox="0 0 320 240" role="img" aria-labelledby="cognitive-pipeline-title cognitive-pipeline-desc" focusable="false">/
  );
  assert.match(hero, /<title id="cognitive-pipeline-title">Research cognition pipeline<\/title>/);
  assert.match(
    hero,
    /<desc id="cognitive-pipeline-desc">Time-series data and knowledge understanding converge into cognitive reasoning, supporting AI for Science and energy systems\.<\/desc>/
  );

  for (const label of [
    'Time-Series Data',
    'Knowledge Understanding',
    'Cognitive Reasoning',
    'AI for Science',
    'Energy Systems'
  ]) {
    assert.ok(heroText.includes(label), `Missing cognitive-pipeline label: ${label}`);
  }

  const layout = cssRule(researchHtml, '.page-hero-content');
  for (const declaration of [
    'display: grid;',
    'grid-template-columns: minmax(0, 1fr) minmax(290px, 320px);',
    'gap: clamp(32px, 4vw, 56px);',
    'align-items: center;'
  ]) {
    assert.ok(layout.includes(declaration), `Missing desktop hero layout: ${declaration}`);
  }

  assert.match(
    researchHtml,
    /@media \(max-width: 960px\)\s*\{[\s\S]*?\.page-hero-content\s*\{[\s\S]*?grid-template-columns:\s*1fr;[\s\S]*?\.page-hero-visual\s*\{[\s\S]*?display:\s*none;/
  );
});
```

- [ ] **Step 2: Run the targeted test and capture RED**

Run:

```bash
node --test --test-name-pattern="accessible responsive cognitive pipeline" scripts/verify-scenario-cards.mjs
```

Expected: exactly one selected test fails because `.page-hero-copy` and `.page-hero-visual` do not exist.

- [ ] **Step 3: Replace the hero CSS with the desktop grid and SVG component styles**

In `research.html`, replace the current `.page-hero-content` rule with the following and insert the remaining rules immediately after it:

```css
.page-hero-content {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(290px, 320px);
  gap: clamp(32px, 4vw, 56px);
  align-items: center;
}
.page-hero-copy {
  min-width: 0;
}
.page-hero-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
}
.cognitive-pipeline {
  display: block;
  width: 100%;
  height: auto;
}
.pipeline-panel {
  fill: #f8fbff;
  stroke: #dbe5f1;
  stroke-width: 1.5;
}
.pipeline-grid {
  fill: url(#pipeline-dots);
  opacity: 0.58;
}
.pipeline-path {
  fill: none;
  stroke: #b7c8dc;
  stroke-width: 1.8;
  stroke-linecap: round;
}
.pipeline-path--accent {
  stroke: #6eb6b2;
}
.pipeline-node {
  fill: #fff;
  stroke: #cbd8e8;
  stroke-width: 1.4;
}
.pipeline-node--core {
  fill: #e8edf7;
  stroke: var(--accent);
  stroke-width: 1.8;
}
.pipeline-node--application {
  fill: #f2faf8;
  stroke: #9ccfc5;
}
.pipeline-stage {
  fill: #6c7b90;
  font-family: var(--font);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-anchor: middle;
}
.pipeline-label {
  fill: var(--accent);
  font-family: var(--font);
  font-size: 10px;
  font-weight: 700;
  text-anchor: middle;
}
.pipeline-label--core {
  font-size: 10.5px;
  font-weight: 800;
}
.pipeline-signal {
  fill: var(--accent);
}
.pipeline-signal--teal {
  fill: var(--teal);
}
```

Do not modify `.page-hero-sub`; its existing desktop justification and disabled automatic hyphenation remain the text contract.

- [ ] **Step 4: Wrap the copy and add the exact inline SVG**

Replace the contents of the existing `.page-hero-content` with this markup. The paragraph wording must remain byte-for-byte identical to the existing copy:

```html
<div class="page-hero-content">
  <div class="page-hero-copy">
    <div class="research-eyebrow">Research Program</div>
    <h1 class="page-hero-title">Research Interests</h1>
    <p class="page-hero-sub">
      My research develops <strong>cognitive intelligence methods</strong> for complex data mining, centered on
      <strong>LLMs and Agentic AI</strong>, and driven by the dual foundations of <strong>time-series observations</strong>
      and <strong>scientific knowledge</strong>. My methodological focus lies in
      <strong>context representation and reasoning</strong>, aiming to build <strong>predictive intelligence for complex systems</strong>
      through <strong>multimodal semantic understanding</strong>, <strong>slow-thinking temporal reasoning</strong>, and
      <strong>autonomous agentic interaction</strong>.
    </p>
  </div>
  <div class="page-hero-visual">
    <svg class="cognitive-pipeline" viewBox="0 0 320 240" role="img" aria-labelledby="cognitive-pipeline-title cognitive-pipeline-desc" focusable="false">
      <title id="cognitive-pipeline-title">Research cognition pipeline</title>
      <desc id="cognitive-pipeline-desc">Time-series data and knowledge understanding converge into cognitive reasoning, supporting AI for Science and energy systems.</desc>
      <defs>
        <pattern id="pipeline-dots" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" fill="#d5e2f0"></circle>
        </pattern>
      </defs>
      <rect class="pipeline-panel" x="1" y="1" width="318" height="238" rx="18"></rect>
      <rect class="pipeline-grid" x="2" y="2" width="316" height="236" rx="17"></rect>

      <text class="pipeline-stage" x="64" y="25">INPUTS</text>
      <text class="pipeline-stage" x="165" y="25">REASONING</text>
      <text class="pipeline-stage" x="262" y="25">APPLICATIONS</text>

      <path class="pipeline-path" d="M112 75 C120 75 118 104 126 108"></path>
      <path class="pipeline-path" d="M112 165 C120 165 118 136 126 132"></path>
      <path class="pipeline-path pipeline-path--accent" d="M204 108 C212 104 212 75 220 75"></path>
      <path class="pipeline-path pipeline-path--accent" d="M204 132 C212 136 212 165 220 165"></path>

      <rect class="pipeline-node" x="16" y="42" width="96" height="66" rx="12"></rect>
      <circle class="pipeline-signal" cx="64" cy="57" r="3"></circle>
      <text class="pipeline-label" x="64" y="79">
        <tspan x="64">Time-Series</tspan>
        <tspan x="64" dy="14">Data</tspan>
      </text>

      <rect class="pipeline-node" x="16" y="132" width="96" height="66" rx="12"></rect>
      <circle class="pipeline-signal pipeline-signal--teal" cx="64" cy="147" r="3"></circle>
      <text class="pipeline-label" x="64" y="169">
        <tspan x="64">Knowledge</tspan>
        <tspan x="64" dy="14">Understanding</tspan>
      </text>

      <rect class="pipeline-node pipeline-node--core" x="126" y="82" width="78" height="76" rx="16"></rect>
      <circle class="pipeline-signal" cx="165" cy="99" r="4"></circle>
      <text class="pipeline-label pipeline-label--core" x="165" y="123">
        <tspan x="165">Cognitive</tspan>
        <tspan x="165" dy="15">Reasoning</tspan>
      </text>

      <rect class="pipeline-node pipeline-node--application" x="220" y="42" width="84" height="66" rx="12"></rect>
      <circle class="pipeline-signal pipeline-signal--teal" cx="262" cy="57" r="3"></circle>
      <text class="pipeline-label" x="262" y="79">
        <tspan x="262">AI for</tspan>
        <tspan x="262" dy="14">Science</tspan>
      </text>

      <rect class="pipeline-node pipeline-node--application" x="220" y="132" width="84" height="66" rx="12"></rect>
      <circle class="pipeline-signal pipeline-signal--teal" cx="262" cy="147" r="3"></circle>
      <text class="pipeline-label" x="262" y="169">
        <tspan x="262">Energy</tspan>
        <tspan x="262" dy="14">Systems</tspan>
      </text>
    </svg>
  </div>
</div>
```

- [ ] **Step 5: Add the exact responsive collapse before the existing `680px` rule**

Insert this rule immediately above `@media (max-width: 680px)`:

```css
@media (max-width: 960px) {
  .page-hero-content {
    grid-template-columns: 1fr;
    gap: 0;
  }
  .page-hero-visual {
    display: none;
  }
}
```

Do not modify the existing `<=680px` `.page-hero-sub` rule.

- [ ] **Step 6: Run targeted and full GREEN verification**

Run:

```bash
node --test --test-name-pattern="accessible responsive cognitive pipeline" scripts/verify-scenario-cards.mjs
node --test scripts/verify-scenario-cards.mjs
```

Expected: targeted `1/1` selected test passes; full suite reports `8` tests passed and `0` failed.

- [ ] **Step 7: Inspect and commit only the two implementation files**

Run:

```bash
git diff --check -- research.html scripts/verify-scenario-cards.mjs
git status --short
git add research.html scripts/verify-scenario-cards.mjs
git diff --cached --name-only
git diff --cached --check
git commit -m "Add research hero cognitive pipeline"
```

Expected cached file set before commit:

```text
research.html
scripts/verify-scenario-cards.mjs
```

### Task 2: Verify the rendered desktop and mobile layouts

**Files:**
- Verify: `research.html`

- [ ] **Step 1: Start a local server**

Run from the isolated worktree:

```bash
python3 -m http.server 8017 --bind 127.0.0.1
```

Open `http://127.0.0.1:8017/research.html` in the in-app browser.

- [ ] **Step 2: Verify the `1187 × 700` desktop state**

Set the browser viewport to `1187 × 700`, reload, and evaluate:

```js
() => {
  const layout = document.querySelector('.page-hero-content');
  const visual = document.querySelector('.page-hero-visual');
  const svg = document.querySelector('.cognitive-pipeline');
  const copy = document.querySelector('.page-hero-sub');
  const layoutStyle = getComputedStyle(layout);
  const visualStyle = getComputedStyle(visual);
  const copyStyle = getComputedStyle(copy);
  return {
    columns: layoutStyle.gridTemplateColumns.split(' ').filter(Boolean).length,
    visualDisplay: visualStyle.display,
    visualWidth: Math.round(svg.getBoundingClientRect().width),
    textAlign: copyStyle.textAlign,
    textAlignLast: copyStyle.textAlignLast,
    textJustify: copyStyle.textJustify,
    hyphens: copyStyle.hyphens,
    overflowFree: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
    labels: [...svg.querySelectorAll('.pipeline-label')].map((node) => node.textContent.trim().replace(/\s+/g, ' '))
  };
}
```

Expected:

```js
{
  columns: 2,
  visualDisplay: 'flex',
  visualWidth: 320,
  textAlign: 'justify',
  textAlignLast: 'left',
  textJustify: 'inter-word',
  hyphens: 'none',
  overflowFree: true,
  labels: [
    'Time-Series Data',
    'Knowledge Understanding',
    'Cognitive Reasoning',
    'AI for Science',
    'Energy Systems'
  ]
}
```

Capture the hero viewport and visually confirm that the diagram is fully visible, vertically balanced, low contrast, and does not collide with the copy.

- [ ] **Step 3: Verify the `390 × 844` mobile state**

Set the browser viewport to `390 × 844`, reload, and evaluate:

```js
() => {
  const layoutStyle = getComputedStyle(document.querySelector('.page-hero-content'));
  const visualStyle = getComputedStyle(document.querySelector('.page-hero-visual'));
  const copyStyle = getComputedStyle(document.querySelector('.page-hero-sub'));
  return {
    columns: layoutStyle.gridTemplateColumns.split(' ').filter(Boolean).length,
    visualDisplay: visualStyle.display,
    textAlign: copyStyle.textAlign,
    textAlignLast: copyStyle.textAlignLast,
    hyphens: copyStyle.hyphens,
    overflowFree: document.documentElement.scrollWidth <= document.documentElement.clientWidth
  };
}
```

Expected:

```js
{
  columns: 1,
  visualDisplay: 'none',
  textAlign: 'left',
  textAlignLast: 'left',
  hyphens: 'manual',
  overflowFree: true
}
```

Capture the hero viewport and confirm that the page matches the existing mobile single-column appearance.

- [ ] **Step 4: Check logs and stop the server**

Expected browser console warnings/errors: none. Reset the temporary viewport, finalize the test tab, stop the server with `Ctrl-C`, and confirm port `8017` is released.

### Task 3: Run the final scope and integrity audit

**Files:**
- Verify: `docs/superpowers/plans/2026-07-13-research-hero-cognitive-pipeline.md`
- Verify: `research.html`
- Verify: `scripts/verify-scenario-cards.mjs`

- [ ] **Step 1: Run the complete verifier again**

```bash
node --test scripts/verify-scenario-cards.mjs
```

Expected: `8` tests pass and `0` fail.

- [ ] **Step 2: Verify whitespace and exact feature scope**

```bash
git diff --check 99ba601..HEAD
git diff --check
git diff --name-only 99ba601..HEAD | sort
```

Expected sorted file set:

```text
docs/superpowers/plans/2026-07-13-research-hero-cognitive-pipeline.md
research.html
scripts/verify-scenario-cards.mjs
```

- [ ] **Step 3: Verify the isolated worktree is clean and review commits**

```bash
git status --short --branch
git log --format='%s' 99ba601..HEAD
```

Expected: clean feature worktree and these two subjects, newest first:

```text
Add research hero cognitive pipeline
Document research hero cognitive pipeline implementation plan
```

### Task 4: Integrate and publish the verified update

**Files:**
- Verify: original `main` worktree
- Push: `origin/main`

- [ ] **Step 1: Confirm the original worktree still contains only pre-existing user noise**

From `/Users/chengmingyue/human_agent_collaboration/twig_management/my_homepage/Mingyue-Cheng.github.io`, run:

```bash
git status --short --branch
```

Expected unrelated unstaged entries remain untouched:

```text
 M HomePage_files/.DS_Store
?? .superpowers/
?? HomePage_files/Mycheng-7.jpg
```

- [ ] **Step 2: Update and fast-forward `main`**

```bash
git pull --ff-only
git merge --ff-only codex/research-hero-cognitive-pipeline
```

Expected: `main` fast-forwards to the feature branch without staging or modifying the unrelated files.

- [ ] **Step 3: Verify the merged result and push**

```bash
node --test scripts/verify-scenario-cards.mjs
git diff --check 99ba601..HEAD
git push origin main
```

Expected: `8/8` tests pass, integrity check is clean, and the push succeeds.

- [ ] **Step 4: Prove remote parity**

```bash
git fetch origin
git rev-list --left-right --count HEAD...origin/main
git rev-parse HEAD
git rev-parse origin/main
```

Expected: divergence is `0 0` and both SHA values are identical.

- [ ] **Step 5: Clean up the isolated worktree and merged feature branch**

```bash
git worktree remove /Users/chengmingyue/.config/superpowers/worktrees/Mingyue-Cheng.github.io/research-hero-cognitive-pipeline
git branch -d codex/research-hero-cognitive-pipeline
git status --short --branch
```

Expected: the feature worktree and branch are removed; the original three unrelated working-tree entries remain unchanged and unstaged.
