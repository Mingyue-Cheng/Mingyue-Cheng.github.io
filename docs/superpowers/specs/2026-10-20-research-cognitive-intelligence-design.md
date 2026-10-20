# Research subpage: cognitive intelligence

## Scope and design authority

Update only the Research subpage and its page-specific presentation/translation contracts. The user supplied the narrative, three independent scientific questions, and five reference layouts. Proceed directly under the user's standing no-routine-confirmation preference. Do not edit `index.html`, homepage translations, unrelated page copy, or publish/commit this local update.

### Follow-up release authorization

The user subsequently requested publication (`push更新下`) and explicitly added that every homepage publication year should be expanded by default. The release scope therefore includes this narrow homepage behavior change: remove the three older-year default-collapse flags, keep manual toggling/filtering and all publication content unchanged, and add regression coverage. All other homepage content remains outside scope. This follow-up supersedes only the initial no-homepage-edit/no-publication boundary above.

## Information architecture

1. Hero: cognitive intelligence; understanding, reasoning and interaction; autonomous learning, continual evolution and human–AI collaboration as long-term supporting mechanisms.
2. Three vertically stacked research directions, ordered agents/autonomous learning, scientific knowledge/tool mining, structured-data cognition. Each includes its role, scope, independent scientific question and concrete research topics.
3. Relationship panel: general intelligent mechanisms above two core research objects, with explicit bidirectional method support/domain feedback and knowledge/data synergy. This is a conceptual organization, not a claim of completed general intelligence.
4. Shared cognitive framework: three peer capabilities (understand, reason, interact). Present learning, evolution and collaboration in a separate supporting-mechanism strip, not a fourth peer capability.
5. Retain the existing application cards, research-community links and contact entry as secondary context.

## Content boundaries

- Agents: Agent Harness, agent memory, autonomous interaction and learning, reflection and self-evolution.
- Scientific knowledge/tools: scientific literature mining, scientific knowledge discovery/reasoning, tool discovery/capability understanding/composition and agentic research.
- Structured data: time series, tables and graphs; semantics/context, structural relationships, dynamic evolution, evidence-grounded reasoning and interactive analysis/decision support.
- Preserve the independence of the three scientific questions. Neither object-oriented direction is merely an application demo of the first.
- Use research aims, not unsupported claims of achieved autonomous scientific discovery or continual general intelligence.

## Implementation and isolation

Retain the existing static page shell, navy academic palette and shared language-toggle/mobile-navigation engine. Add a stylesheet loaded only by Research. Change only the English and Chinese `pages['research.html']` translation entries in the shared language asset; preserve all other entries and engine logic. Version that asset reference only in Research. Keep brand/community destinations intact.

## Verification

Write regression coverage before production edits, including the new order, questions, cognitive-capability/mechanism distinction, bilingual round trip, metadata and retained destinations. Update obsolete tests which require Research to mirror the homepage, retaining independent homepage assertions. Run all Node tests, syntax and diff checks, compare `index.html` SHA-256 against `205ef88e092d9bd037373f1dcb1c515c8b31333dd7152e45440a53d76b03f410`, and inspect EN/ZH desktop/mobile renders for overflow and missing translation.
