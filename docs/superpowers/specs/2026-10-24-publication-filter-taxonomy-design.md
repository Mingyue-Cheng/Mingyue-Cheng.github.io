# Publication filter taxonomy

## Scope

Synchronize the publication filter controls on `index.html` and `publications.html`. Keep All first, followed by the seven labels in the user's exact order. Preserve all 72 publication records, their order, links, existing tags, and hidden source records. Preserve the pending homepage change that displays 12 news items by default. Do not publish until requested.

| Filter | English | Chinese | Match |
| --- | --- | --- | --- |
| all | All | 全部 | All records |
| llm | LLM-based Reasoning | 大模型推理 | Existing llm tag |
| agent | Agentic AI | 智能体 AI | Existing agent tag |
| structured | Structured Data Mining | 结构化数据挖掘 | timeseries, table, graph, or structured tag |
| timeseries | Time Series Analysis | 时间序列分析 | Existing timeseries tag |
| table | Table Mining | 表格挖掘 | Existing table tag |
| ai4science | AI for Science | 科学智能 | Existing ai4science tag |
| recsys | Recommender Systems | 推荐系统 | Existing recsys tag |

## Behavior and boundaries

Use the existing single-select controls and active/aria-pressed state. Replace the combined llm-agent selection with separate llm and agent filters. Structured Data Mining is a derived union, not an additional publication list; overlapping papers appear once. Include graph and structured tokens for future-compatible exact matching, without adding those tags to any paper now. Existing llm tags are broader than a paper-level reasoning classification; this UI change does not perform a semantic reclassification.

Keep homepage year-collapse restoration, fragment navigation, and filtered-year accessibility intact. Keep Publications empty-year/divider handling intact. Retain wrapping controls and both language toggles. Only Publications needs a refreshed shared-language asset URL; other page dictionaries and versions remain unchanged.

## Verification

Test exact English/Chinese labels, order, translation parity, and eight controls on each page. Exercise both actual inline filter scripts with llm-only, agent-only, overlapping, structured-data, graph, near-miss, and unrelated-tag fixtures. Check All restoration, empty years, accessibility state, and stored/manual collapse. Run the complete Node suite and desktop/mobile English/Chinese browser checks. Compare full publication records and tags against the pre-change revision.
