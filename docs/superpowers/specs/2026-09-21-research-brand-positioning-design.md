# Research brand positioning

## Goal and scope

Integrate the user-supplied identities into the existing bilingual research introduction:

- 科言 SciToken：理解科学世界 — scientific intelligence.
- 科语 SciTime：建模动态世界 — time-series intelligence.

Keep LLM-driven reasoning and AI agents as the methodological core. Retain all three research directions, their technical descriptions, their order, and the Scientific Discovery application card. These are research identities and aspirations, not claims of released platforms or validated capabilities.

## Chosen approach

An introduction-only addition would hide the domain mapping; card-only additions would omit it from the Research-page introduction. Use a short sentence in the existing introduction and a matching opening phrase in each relevant direction description. Reuse existing emphasis and justified prose; introduce no new component, stylesheet, link, or interaction.

Append this English sentence to the existing introduction:

> These application-driven directions are framed by 科言 SciToken — understanding the scientific world, and 科语 SciTime — modeling the dynamic world.

Append this Chinese sentence:

> 其中，以“科言 SciToken：理解科学世界”和“科语 SciTime：建模动态世界”凝练科学智能与时序智能两条应用牵引方向。

Prefix the science description with `科言 SciToken — Understanding the scientific world.` / `科言 SciToken：理解科学世界。` and the time-series description with `科语 SciTime — Modeling the dynamic world.` / `科语 SciTime：建模动态世界。`.

## Implementation and verification

Synchronize index.html fallback HTML and its inline dictionaries with research.html fallback HTML and files/assets/site-language.js. Refresh the shared-language cache key. Extend the existing dependency-free tests to guard the exact mapping and retained technical detail; check language round trips, both fallbacks, and desktop/mobile wrapping.

Preserve existing pending changes and unrelated files. No product rename, memory update, commit, push, or deployment is included. Proceed autonomously according to the user's standing instruction not to ask routine confirmation questions.

## Self-review

The mapping is explicit, both languages are specified, existing research content stays intact, and all changes are confined to the research introduction and its translation/test contracts.
