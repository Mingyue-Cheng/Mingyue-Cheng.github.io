(function () {
  const translations = {
    en: {
      nav: {
        logo: 'Homepage',
        research: 'Research',
        news: 'News',
        publications: 'Publications',
        projects: 'Open Project',
        awards: 'Awards',
        service: 'Service',
        resources: 'Resources'
      },
      common: {
        back: '← Back to Homepage',
        contact: 'Contact',
        scholar: 'Google Scholar',
        footer: '© 2026 Mingyue Cheng. Last updated in September 2026.',
        skip: 'Skip to main content',
        primaryNav: 'Primary navigation',
        toggleNav: 'Toggle navigation',
        backToTop: 'Back to top',
        publicationFilters: 'Filter publications by research area'
      },
      pages: {
        'research.html': {
          title: 'Research Interests',
          subtitle: 'My research centers on LLM-driven reasoning and AI agents, with a focus on context-aware reasoning, autonomous interactive, and continual learning and adaptation. This work is motivated by complex tasks in time-series intelligence and science intelligence (scientific knowledge and tool mining). These application-driven directions are framed by 科言 SciToken — understanding the scientific world, and 科语 SciTime — modeling the dynamic world.',
          labels: ['Research Vision', 'Core Technical Pillars', 'Application Domains'],
          scenarios: {
            researchQuestion: 'How can agents <strong>reliably solve problems through reasoning and interaction</strong> when <strong>information is incomplete</strong>, <strong>environments change</strong>, and <strong>feedback is costly</strong>?',
            visionTitle: 'Prediction Intelligence',
            visionBody: 'Building <strong>context-aware</strong>, <strong>reasoning-driven</strong>, and <strong>uncertainty-aware predictive intelligence</strong> for <strong>complex and evolving systems</strong>, enabling <strong>explainable forecasting</strong> and <strong>trustworthy decision support</strong>.',
            agentTitle: 'LLMs and Agentic AI',
            agentBody: 'Developing <strong>autonomous interactive learning</strong> for large language models, including <strong>environment-interactive Agentic RL</strong>, <strong>tool-augmented reasoning</strong>, <strong>multi-agent orchestration</strong>, and continual capability evolution through context, knowledge, and memory.',
            timeseriesTitle: 'Time Series Intelligence',
            timeseriesBody: '<strong>科语 SciTime — Modeling the dynamic world.</strong> Developing <strong>context-aware predictive intelligence</strong>, with a focus on <strong>multimodal context representation</strong>, <strong>slow-thinking reasoning</strong>, <strong>uncertainty-aware forecasting</strong>, and <strong>autonomous agentic interaction</strong>.',
            scienceIntelligenceTitle: 'Science Intelligence',
            scienceIntelligenceBody: '<strong>科言 SciToken — Understanding the scientific world.</strong> Focusing on <strong>scientific data</strong>, <strong>scientific tools</strong>, <strong>scientific knowledge</strong>, and <strong>capability enhancement of scientific foundation models</strong>.',
            scienceTitle: 'Scientific Discovery',
            scienceBody: 'Connecting scientific data and knowledge to support reasoning and autonomous discovery.',
            industrialTitle: 'Industrial Intelligence',
            industrialBody: 'Forecasting and decision support for complex, evolving real-world systems.',
            userTitle: 'Recommender Systems',
            userBody: 'Understanding behaviors and preferences to deliver adaptive, personalized recommendations.',
            scenarioIntro: 'Real-world settings for developing and evaluating intelligent systems.',
            scienceTopics: '<span>Literature mining</span><span>Scientific modeling</span>',
            industrialTopics: '<span>Energy &amp; traffic</span><span>Cloud &amp; finance</span>',
            userTopics: '<span>Behavior modeling</span><span>Contextual reasoning</span>'
          },
          collections: 'Research collections: 🤖 <a href="https://agentr1.github.io/" target="_blank" rel="noopener">LLMs and Agentic AI（认知大模型）</a> · 📊 <a href="https://ustc-time-series.github.io/" target="_blank" rel="noopener">Time Series Intelligence（科语）</a> · 📚 <a href="https://ustcagi-sci.github.io/" target="_blank" rel="noopener">Science Intelligence（科言）</a>',
          join: 'Prospective students and research collaborators are welcome to explore the <a href="https://ustcagi.github.io/" target="_blank" rel="noopener">USTC-AGI Group</a> and <a href="mailto:mycheng@ustc.edu.cn">contact me by email</a>.'
        },
        'news.html': {
          title: 'News & Updates',
          subtitle: 'Latest news from USTC AGI Research Group.'
        },
        'publications.html': {
          title: 'Publications',
          subtitle: 'Full publication list of Mingyue Cheng. (* Corresponding Author, + Equal Contribution)',
          subtitleHtml: 'Full publication list of <a href="index.html">Mingyue Cheng</a>. (* Corresponding Author, <sup>+</sup> Equal Contribution)',
          content: {
            'pub.filterAll': 'All',
            'pub.filterAgent': 'LLMs and Agentic AI',
            'pub.filterTime': 'Time Series Intelligence',
            'pub.filterKnowledge': 'Science Intelligence',
            'pub.filterTable': 'Tabular Data Intelligence',
            'pub.filterRec': 'Recommender Systems',
            'pub.note': '(* Corresponding Author, <sup>+</sup> Equal Contribution)',
            'pub.preprint': '📘 Preprint',
            'pub.year2026': '🐎 Year of the Fire Horse (Bing Wu Year, 2026)',
            'pub.year2025': '🐍 Year of the Wood Snake (Yi Si Year, 2025)',
            'pub.year2024': '🐉 Year of the Wood Dragon (Jia Chen Year, 2024)',
            'pub.legacy': '📘 2023 and Before',
            'pub.filterLabel': 'Filter by topic:'
          }
        },
        'projects.html': {
          title: 'Open Project & Benchmarks',
          subtitle: 'Open-source frameworks, tools, benchmarks, and datasets for LLM reasoning and AI agents, time-series intelligence, and science intelligence.',
          content: {
            'systems.heading': 'Systems Product',
            'systems.brand': '科言 · Science Intelligence',
            'systems.lewen': 'Discover scientific literature through quick search and in-depth retrieval.',
            'systems.wenxiu': 'Support academic writing with polishing, proofreading, and translation tools.',
            'systems.visit': 'Visit website',
            'opensource.heading': 'Open Project',
            'opensource.agentR1': '<span class="os-inline-highlight">Agent-R1</span> is a <strong>unified, modular training framework for Agentic RL</strong>. It models each round of agent interaction as a <strong>step-level RL transition</strong> and decouples <strong>trajectory representation, context construction, environment interfaces, and optimization algorithms</strong>. This allows <strong>GRPO, PPO, and other algorithms</strong> to be compared and extended on a <strong>shared foundation for multi-turn agent training</strong>.',
            'opensource.clawR1': '<span class="os-inline-highlight">Claw-R1</span> provides the <strong>Data Foundation for Agentic RL</strong>, enabling the systematic <strong>collection, evaluation, and curation of high-quality training data</strong> from <strong>diverse agent interactions</strong>. It introduces a <strong>middleware layer (Gateway + DataPool)</strong> between the <strong>Agent Side</strong> and the <strong>Training Side</strong>, focusing on <strong>data infrastructure</strong> rather than training algorithms themselves.',
            'opensource.castClaw': '<span class="os-inline-highlight">CastClaw（观星阁）</span> is an <strong>agent framework for human–AI collaboration</strong> in <strong>time series forecasting research</strong>. It uses three specialized agents, <strong>Planner, Forecaster, and Critic</strong>, to orchestrate the complete forecasting workflow and incorporates <strong>human confirmation at key stages</strong>. It packages <strong>data analysis, feature engineering, and classical time series model capabilities</strong> into an <strong>extensible runtime toolbox</strong>.',
            'opensource.castMind': '<span class="os-inline-highlight">CastMind（星思）</span> is a <strong>large model for time series projection in complex systems</strong>, driven by <strong>contextual reasoning</strong>. It integrates <strong>historical time series, external context, and domain knowledge</strong> and follows an <strong>extrapolate → understand → project → revise</strong> process for extended cognitive reasoning. Under specific conditions, it assesses whether future trends will <strong>persist, strengthen, weaken, shift, or reverse</strong>, enabling <strong>forecast revision and explanations of the underlying mechanisms</strong>.',
            'datasets.futureCast': '<span class="os-inline-highlight">FutureCast（天星台）</span> is a <strong>multi-domain benchmark for context-aware time series forecasting</strong>. It pairs <strong>historical observations</strong> with <strong>numerical covariates, textual descriptions, and event context</strong>, and centers its evaluation design on <strong>context–sequence alignment, contextual reasoning, and adaptation to new evidence</strong>. Designed for <strong>time series foundation models and forecasting agents</strong>, it examines how external evidence informs trend judgments and <strong>forecast revision</strong>, with emphasis on <strong>forecast accuracy, reasoning quality, and evidence-based explanations</strong>.',
            'opensource.paperScout': '<span class="os-inline-highlight">PaperScout</span> is an <strong>autonomous scientific literature retrieval agent</strong> for <strong>complex research queries</strong>. It treats paper discovery as <strong>multi-turn decision-making</strong>, using accumulated retrieval context to choose between <strong>Search</strong> for new candidates and <strong>Expand</strong> for following paper references. With <strong>process-aware, sequence-level reinforcement learning (PSPO)</strong>, it learns to refine its retrieval strategy from intermediate feedback and identify papers that match the <strong>research topic and query constraints</strong>.',
            'opensource.academicSearch': '<span class="os-inline-highlight">Academic Search</span> is a <strong>scientific literature retrieval and metadata skill</strong> for <strong>Codex, Claude Code, and other AI agents</strong>. It brings together sources including <strong>arXiv, Semantic Scholar, OpenAlex, Google Scholar, and CNKI</strong>, supporting <strong>query expansion, citation tracing, record validation, cross-source deduplication, and BibTeX export</strong>, as well as <strong>open-access full-text retrieval</strong>. It adapts search strategies to the discipline and records source provenance and access status to support <strong>literature reviews and research surveys</strong>.',
            'opensource.category.agents': 'LLMs and Agentic AI',
            'opensource.category.timeseries': 'Time Series Intelligence（科语）',
            'opensource.category.science': 'Science Intelligence（Scientific Tool and Knowledge）',
            'datasets.heading': 'Benchmarks &amp; Datasets',
            'datasets.category.science': 'Science Intelligence（Scientific Tool and Knowledge）',
            'datasets.category.timeseries': 'Time Series Intelligence（科语）',
            'datasets.category.retrieval': 'Retrieval &amp; Recommendation',
            'datasets.futureCastKicker': 'Time Series Intelligence · Context-aware Forecasting',
            'opensource.webMind': '<span class="os-inline-highlight">WebMind</span> is a <strong>web-task skill</strong> for <strong>AI agents</strong>. It completes web search, reading, navigation, and interaction in an <strong>isolated, persistent browser environment</strong>, with built-in support for <strong>screenshots</strong>, <strong>mouse and keyboard control</strong>, and <strong>reusable local experience</strong>. It requires <strong>no Google sign-in</strong> and does not use personal data from the user\'s everyday Chrome profile by default, making it especially suitable for <strong>topic research</strong>, <strong>information collection</strong>, and <strong>repeatable web workflows</strong>.',
            'opensource.tabClaw': '<span class="os-inline-highlight">TabClaw</span> is an open-source agentic framework that empowers LLMs to reason over <strong>complex, real-world tabular data</strong>. It decomposes table-centric tasks into <strong>structured sub-goals</strong>, equips agents with <strong>code execution</strong>, <strong>schema-aware lookup</strong>, and <strong>formula tools</strong>, and coordinates them through <strong>multi-step decision workflows</strong>. TabClaw is designed to tackle challenges beyond flat QA — including <strong>multi-hop joins</strong>, <strong>conditional aggregation</strong>, and <strong>cross-table inference</strong> — making it suitable for enterprise data analysis and scientific table understanding.',
            'opensource.castFactory': '<span class="os-inline-highlight">CastFactory（炼星坊）</span> is an open-source framework for <strong>LLM-driven time series forecasting model training</strong>, designed to make it <strong>extremely easy</strong> for users to build and adapt TSF models with modern large-model pipelines. It provides a unified and practical workflow for <strong>continued pre-training (CPT)</strong>, <strong>supervised fine-tuning (SFT)</strong>, and <strong>reinforcement learning (RL)</strong>, helping researchers and practitioners develop, optimize, and evaluate LLM-based forecasting systems with much lower engineering overhead.',
            'opensource.neoResearch': '<span class="os-inline-highlight">NeoResearch（智多星）</span> is an autonomous research agent system for <strong>time series forecasting model development</strong>. It connects research hypothesis generation, candidate recipe search, controlled experiments, evaluation diagnosis, and research memory into a reproducible loop, supporting systematic iteration from problem definition to validated forecasting model candidates.'
          }
        },
        'awards.html': {
          title: 'Honors & Awards',
          subtitle: 'Selected honors, awards, and research grants received by Mingyue Cheng.',
          headings: ['Honors and Awards', 'Research Grants'],
          grants: {
            newGenerationAI: 'New-Generation Artificial Intelligence National Science and Technology Major Project; Scientific Data Governance Toolchain and Datasets — Chemistry; Core Project Member',
            casPriority: 'Chinese Academy of Sciences Strategic Priority Research Program for Basic and Interdisciplinary Frontier Research (Category B); Mechanisms and Methods for Autonomous Interactive Learning in Large Models; Project Lead',
            nsfc: 'National Natural Science Foundation of China — Young Scientists Fund (Category C); Cross-Domain Context-Aware Time Series Representation Learning and Forecasting; Project Lead',
            ustc: 'USTC New Medicine Joint Fund Cultivation Project (Double First-Class Discipline Development Special Program); Time Series Modeling Methods and Applications Using Perioperative Physiological Data; Project Lead',
            anhui: 'Anhui Provincial Natural Science Foundation; Table Semantic Understanding and Reasoning for Scientific Literature; Project Lead',
            ustcYouth: 'USTC Youth Innovation Fund Project; Multi-Turn Interactive Learning and Continual Evolution for Large-Model Agents: Methods and Applications; Project Lead'
          }
        },
        'service.html': {
          title: 'Professional Service',
          subtitle: 'Selected program committee service, journal reviewing, teaching, and academic community contributions.',
          content: {
            'service.iclrAreaChair': 'Area Chair 2027',
            'service.pc': 'Program Committee Member',
            'service.journal': 'Journal Reviewer',
            'service.organizations': 'Academic Organization Service',
            'service.ieeeDeal': 'IEEE Task Force on Data-Efficient Agentic Learning (DEAL)',
            'service.ieeeAi4tst': 'IEEE Task Force on AI for Time Series and Spatio-Temporal Data',
            'service.ccfAipr': 'Technical Committee on Artificial Intelligence and Pattern Recognition, China Computer Federation (CCF) — Executive Committee Member',
            'service.cipsIr': 'Information Retrieval Technical Committee, Chinese Information Processing Society of China (CIPS) — Corresponding Member'
          }
        },
        'resources.html': {
          title: 'Resources',
          subtitle: 'Selected documents and references for students and collaborators.',
          headings: ['Shared Resources']
        }
      }
    },
    zh: {
      nav: {
        logo: '主页',
        research: '研究方向',
        news: '新闻',
        publications: '论文',
        projects: '开源项目',
        awards: '奖励',
        service: '学术服务',
        resources: '资源'
      },
      common: {
        back: '← 返回主页',
        contact: '联系我',
        scholar: 'Google Scholar',
        footer: '© 2026 程明月。最后更新于 2026 年 9 月。',
        skip: '跳至主要内容',
        primaryNav: '主导航',
        toggleNav: '展开或收起导航',
        backToTop: '返回顶部',
        publicationFilters: '按研究方向筛选论文'
      },
      pages: {
        'research.html': {
          title: '研究兴趣',
          subtitle: '以大模型推理与智能体为核心研究方向，聚焦情境感知推理、自主交互学习、持续学习与适应，以时序智能和科学智能（科学知识与工具挖掘）中的复杂任务为应用牵引。其中，以“科言 SciToken：理解科学世界”和“科语 SciTime：建模动态世界”凝练科学智能与时序智能两条应用牵引方向。',
          labels: ['研究愿景', '核心技术支柱', '应用领域'],
          scenarios: {
            researchQuestion: '在<strong>信息不完整</strong>、<strong>环境会变化</strong>、<strong>反馈有成本</strong>的条件下，智能体如何通过<strong>推理与交互</strong>可靠地解决问题。',
            visionTitle: '预测智能',
            visionBody: '面向<strong>复杂演化系统</strong>，构建<strong>情境感知</strong>、<strong>推理驱动</strong>与<strong>不确定性感知的预测智能</strong>，实现<strong>可解释预测</strong>与<strong>可信决策辅助</strong>。',
            agentTitle: '大语言模型与智能体 AI',
            agentBody: '面向大语言模型研究<strong>自主交互学习</strong>，重点关注<strong>环境交互式 Agentic RL</strong>、<strong>工具增强推理</strong>、<strong>多智能体协同</strong>，以及基于情境、知识与记忆的持续能力演化。',
            timeseriesTitle: '时间序列智能',
            timeseriesBody: '<strong>科语 SciTime：建模动态世界。</strong>发展<strong>情境感知预测智能</strong>，重点研究<strong>多模态情境表征</strong>、<strong>慢思考推理</strong>、<strong>不确定性感知预测</strong>与<strong>自主智能体交互</strong>。',
            scienceIntelligenceTitle: '科学智能',
            scienceIntelligenceBody: '<strong>科言 SciToken：理解科学世界。</strong>重点研究<strong>科学数据</strong>、<strong>科学工具</strong>、<strong>科学知识</strong>与<strong>科学基础模型能力增强</strong>等。',
            scienceTitle: 'Scientific Discovery',
            scienceBody: '融合科学数据与知识，支持科学推理与自主发现。',
            industrialTitle: '工业智能',
            industrialBody: '面向持续演变的复杂系统，开展预测与决策支持。',
            userTitle: '推荐系统',
            userBody: '理解用户行为与偏好，实现自适应的个性化推荐。',
            scenarioIntro: '在真实任务中发展智能方法，并检验其有效性。',
            scienceTopics: '<span>科技文献挖掘</span><span>科学建模</span>',
            industrialTopics: '<span>能源与交通</span><span>云服务与金融</span>',
            userTopics: '<span>行为与偏好建模</span><span>情境推理</span>'
          },
          collections: '研究主页：🤖 <a href="https://agentr1.github.io/" target="_blank" rel="noopener">LLMs and Agentic AI（认知大模型）</a> · 📊 <a href="https://ustc-time-series.github.io/" target="_blank" rel="noopener">Time Series Intelligence（科语）</a> · 📚 <a href="https://ustcagi-sci.github.io/" target="_blank" rel="noopener">Science Intelligence（科言）</a>',
          join: '欢迎脚踏实地、积极主动的本科生和研究生加入认知智能全国重点实验室 <a href="https://ustcagi.github.io/" target="_blank" rel="noopener">USTC-AGI Group</a>；也欢迎围绕智能体、时间序列与 AI for Science 开展学术或产业合作，可<a href="mailto:mycheng@ustc.edu.cn">通过邮箱联系我</a>。'
        },
        'news.html': {
          title: '最新动态',
          subtitle: 'USTC AGI Research Group 的最新动态。'
        },
        'publications.html': {
          title: '论文发表',
          subtitle: '程明月的完整论文列表。（* 通讯作者，+ 共同一作）',
          subtitleHtml: '<a href="index.html">程明月</a>的完整论文列表。（* 通讯作者，<sup>+</sup> 共同一作）',
          content: {
            'pub.filterAll': '全部',
            'pub.filterAgent': '大模型与智能体',
            'pub.filterTime': '时序智能',
            'pub.filterKnowledge': '科学智能',
            'pub.filterTable': '表格数据智能',
            'pub.filterRec': '推荐系统',
            'pub.note': '（* 通讯作者，<sup>+</sup> 共同一作）',
            'pub.preprint': '📘 预印本',
            'pub.year2026': '🐎 丙午马年（2026）',
            'pub.year2025': '🐍 乙巳蛇年（2025）',
            'pub.year2024': '🐉 甲辰龙年（2024）',
            'pub.legacy': '📘 2023 年及以前',
            'pub.filterLabel': '按研究方向筛选：'
          }
        },
        'projects.html': {
          title: '开源项目与评测基准',
          subtitle: '面向大模型推理与智能体、时序智能和科学智能的开源框架、工具、评测基准与数据集。',
          content: {
            'systems.heading': '系统产品',
            'systems.brand': '科言 · 科学智能',
            'systems.lewen': '面向科学文献智能获取，支持快速搜索与深度检索。',
            'systems.wenxiu': '面向学术写作，提供智能润色、批阅纠错与语言翻译工具。',
            'systems.visit': '访问系统',
            'opensource.heading': '开源项目',
            'opensource.agentR1': '<span class="os-inline-highlight">Agent-R1</span> 是面向 <strong>Agentic RL 的统一模块化训练框架</strong>。它将每一轮 Agent 交互建模为<strong>步级强化学习转移（step-level RL transition）</strong>，并解耦<strong>轨迹表示、上下文构造、环境接口与优化算法</strong>，使 <strong>GRPO、PPO</strong> 等算法能够在<strong>同一多轮 Agent 训练底座</strong>上进行比较与扩展。',
            'opensource.clawR1': '<span class="os-inline-highlight">Claw-R1</span> 为 <strong>Agentic RL</strong> 提供<strong>数据基础设施（Data Foundation）</strong>，用于系统化地从<strong>多样 Agent 交互</strong>中<strong>收集、评估与策划高质量训练数据</strong>。它在 <strong>Agent Side</strong> 与 <strong>Training Side</strong> 之间引入由 <strong>Gateway + DataPool</strong> 构成的<strong>中间件层（Middleware Layer）</strong>，专注于<strong>数据基础设施</strong>，而非训练算法本身。',
            'opensource.castClaw': '<span class="os-inline-highlight">CastClaw（观星阁）</span> 是面向<strong>时间序列预测研究</strong>的<strong>人机协同智能体框架</strong>。CastClaw 通过 <strong>Planner、Forecaster、Critic</strong> 三个专属智能体编排完整预测流程，并在<strong>关键节点引入人类确认</strong>，将<strong>数据分析、特征工程与经典时序模型能力</strong>封装为<strong>可扩展的运行时工具箱</strong>。',
            'opensource.castMind': '<span class="os-inline-highlight">CastMind（星思）</span> 是面向<strong>复杂系统</strong>的<strong>情境推理驱动时间序列推演大模型</strong>。CastMind 融合<strong>历史序列、外部情境与领域知识</strong>，围绕<strong>“外推—理解—推演—修正”</strong>展开长链路认知推理，判断未来趋势在特定条件下的<strong>延续、增强、削弱、偏移或反转</strong>，并实现<strong>预测修正与机制解释</strong>。',
            'datasets.futureCast': '<span class="os-inline-highlight">FutureCast（天星台）</span> 是面向<strong>情境感知时间序列预测</strong>的<strong>多领域评测基准</strong>。它结合<strong>历史序列、数值外生变量、文本描述与事件情境</strong>，围绕<strong>情境—序列对齐、情境推理与动态适应</strong>设计评测任务，关注模型能否利用外部证据解释趋势变化，并在新信息到来时<strong>修正预测</strong>。评测设计兼顾<strong>预测准确性、趋势判断、推理解释质量与情境适应能力</strong>，服务于<strong>时序基础模型与预测智能体</strong>研究。',
            'opensource.paperScout': '<span class="os-inline-highlight">PaperScout</span> 是面向<strong>复杂科研问题</strong>的<strong>自主科学文献检索智能体</strong>。它将论文检索建模为<strong>多轮序贯决策过程</strong>，依据已获取的文献与检索历史，自主选择 <strong>Search</strong> 发现候选论文，或通过 <strong>Expand</strong> 沿参考文献扩展搜索。结合<strong>过程感知的序列级强化学习优化（PSPO）</strong>，PaperScout 利用中间检索反馈持续调整策略，筛选满足<strong>研究主题与条件约束</strong>的相关文献。',
            'opensource.academicSearch': '<span class="os-inline-highlight">Academic Search</span> 是面向 <strong>Codex、Claude Code 等智能体</strong>的<strong>科学文献检索与元数据整理 Skill</strong>。它整合 <strong>arXiv、Semantic Scholar、OpenAlex、Google Scholar、CNKI</strong> 等学术来源，支持<strong>查询扩展、引用追踪、记录校验、跨源去重与 BibTeX 导出</strong>，并按需获取<strong>开放获取全文</strong>。通过<strong>学科感知的检索策略</strong>与<strong>来源和访问状态记录</strong>，为文献综述和科研调研提供可追溯的文献资料。',
            'opensource.category.agents': '大模型与智能体',
            'opensource.category.timeseries': '时序智能（科语）',
            'opensource.category.science': 'Science Intelligence（Scientific Tool and Knowledge）',
            'datasets.heading': '基准与数据集',
            'datasets.category.science': '科学智能（科学工具与知识）',
            'datasets.category.timeseries': '时序智能（科语）',
            'datasets.category.retrieval': '检索推荐',
            'datasets.futureCastKicker': '时序智能 · 情境感知预测',
            'opensource.webMind': '<span class="os-inline-highlight">WebMind</span> 是面向<strong>智能体</strong>的<strong>网页任务 Skill</strong>，在<strong>独立、持久化的浏览器环境</strong>中完成检索、阅读、导航与交互，支持<strong>截图、鼠标键盘操作和可复用的本地经验</strong>。它<strong>无需登录 Google</strong>，默认不使用日常 Chrome 配置中的个人数据，适用于<strong>主题调研、信息采集与可重复的网页工作流</strong>。',
            'opensource.tabClaw': '<span class="os-inline-highlight">TabClaw</span> 是面向<strong>复杂真实表格数据</strong>的开源智能体框架。它将任务分解为<strong>结构化子目标</strong>，结合<strong>代码执行、模式感知检索与公式工具</strong>，通过<strong>多步决策流程</strong>完成推理，支持<strong>多跳连接、条件聚合与跨表推断</strong>，服务于企业数据分析与科学表格理解。',
            'opensource.castFactory': '<span class="os-inline-highlight">CastFactory（炼星坊）</span> 是面向<strong>大模型驱动的时间序列预测模型训练</strong>的开源框架。它提供覆盖<strong>持续预训练（CPT）、监督微调（SFT）与强化学习（RL）</strong>的统一工作流，降低构建、适配、优化与评测时序预测模型的工程成本。',
            'opensource.neoResearch': '<span class="os-inline-highlight">NeoResearch（智多星）</span> 是面向<strong>时间序列预测模型研发</strong>的自主科研智能体系统。它将研究假设生成、候选方案搜索、受控实验、评测诊断与科研记忆连接为<strong>可复现的闭环</strong>，支持从问题定义到候选预测模型验证的系统化迭代。'
          }
        },
        'awards.html': {
          title: '荣誉奖励',
          subtitle: '程明月获得的代表性荣誉、奖励与科研项目支持。',
          headings: ['荣誉奖励', '科研项目'],
          grants: {
            newGenerationAI: '新一代人工智能国家科技重大专项，科学数据治理工具链与数据集-化学领域，项目骨干',
            casPriority: '中国科学院基础与交叉前沿科研先导专项（B类），大模型自主交互学习机制及方法，项目负责人',
            nsfc: '国家自然科学基金青年科学基金C类，跨域情境感知的时间序列表征学习及预测方法，项目负责人',
            ustc: '中国科学技术大学新医学联合基金培育项目（双一流学科建设专项），基于围术期生理数据的时序建模方法及应用研究，项目负责人',
            anhui: '安徽省自然科学基金，面向科技文献的表格语义理解与推理研究，项目负责人',
            ustcYouth: '中国科学技术大学青年创新基金项目，大模型智能体多轮交互学习与持续进化方法研究及应用，项目负责人'
          }
        },
        'service.html': {
          title: '学术服务',
          subtitle: '代表性程序委员会、期刊审稿、教学与学术共同体服务。',
          content: {
            'service.iclrAreaChair': '领域主席 2027',
            'service.pc': '程序委员会委员',
            'service.journal': '期刊审稿人',
            'service.organizations': '学术组织任职',
            'service.ieeeDeal': 'IEEE 数据高效智能体学习工作组（DEAL）',
            'service.ieeeAi4tst': 'IEEE 时间序列与时空数据人工智能工作组（AI4TST）',
            'service.ccfAipr': '中国计算机学会人工智能与模式识别专业委员会 — 执行委员',
            'service.cipsIr': '中国中文信息学会信息检索专业委员会 — 通讯委员'
          }
        },
        'resources.html': {
          title: '资源',
          subtitle: '面向学生和合作者的常用文档与参考资料。',
          headings: ['共享资源']
        }
      }
    }
  };

  const navTargets = [
    ['research.html', 'research'],
    ['news.html', 'news'],
    ['publications.html', 'publications'],
    ['projects.html', 'projects'],
    ['awards.html', 'awards'],
    ['service.html', 'service'],
    ['resources.html', 'resources']
  ];

  function pageName() {
    const name = window.location.pathname.split('/').pop();
    return name || 'index.html';
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node && value) node.textContent = value;
  }

  function setHtml(selector, value) {
    const node = document.querySelector(selector);
    if (node && value) node.innerHTML = value;
  }

  function applyLanguage(lang) {
    const pack = translations[lang] || translations.en;
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

    setText('.nav-logo', pack.nav.logo);
    setText('.skip-link', pack.common.skip);
    setText('.footer-bottom', pack.common.footer);
    for (const [selector, label] of [
      ['.site-header .nav-links', pack.common.primaryNav],
      ['.site-header .nav-toggle', pack.common.toggleNav],
      ['#back-to-top', pack.common.backToTop],
      ['.pub-filters', pack.common.publicationFilters]
    ]) {
      const node = document.querySelector(selector);
      if (node) node.setAttribute('aria-label', label);
    }
    navTargets.forEach(([href, key]) => {
      const link = document.querySelector(`.nav-links a[href="${href}"]`);
      if (link) link.textContent = pack.nav[key];
    });

    const toggle = document.getElementById('languageToggle');
    if (toggle) {
      toggle.textContent = lang === 'zh' ? 'EN' : '中文';
      toggle.setAttribute('aria-label', lang === 'zh' ? 'Switch to English' : '切换到中文');
    }

    const page = pack.pages[pageName()];
    if (page) {
      setText('.page-hero-title', page.title);
      setText('.pub-hero-title', page.title);
      setText('.page-hero-sub', page.subtitle);
      if (pageName() === 'publications.html' && page.subtitleHtml) {
        setHtml('.pub-hero-sub', page.subtitleHtml);
      } else {
        setText('.pub-hero-sub', page.subtitle);
      }

      if (page.labels) {
        document.querySelectorAll('.rd-section-label, .scenario-section-label').forEach((node, index) => {
          if (page.labels[index]) node.textContent = page.labels[index];
        });
      }

      const content = page.scenarios || page.content;
      if (content) {
        document.querySelectorAll('[data-page-i18n]').forEach((node) => {
          const key = node.getAttribute('data-page-i18n');
          if (content[key]) node.innerHTML = content[key];
        });
      }

      if (page.grants) {
        document.querySelectorAll('[data-grant-i18n]').forEach((node) => {
          const key = node.getAttribute('data-grant-i18n');
          if (page.grants[key]) node.textContent = page.grants[key];
        });
      }

      if (page.headings) {
        document.querySelectorAll('.section-heading').forEach((node, index) => {
          if (page.headings[index]) node.textContent = page.headings[index];
        });
      }

      if (page.collections) {
        const note = document.querySelector('.research-note-box');
        if (note) {
          note.innerHTML = page.collections;
        }
      }

      if (page.join) {
        const notes = document.querySelectorAll('.research-note-box');
        if (notes[1]) notes[1].innerHTML = page.join;
      }
    }

    document.querySelectorAll('.footer-link[href="publications.html"]').forEach((link) => {
      link.textContent = pack.nav.publications;
    });
    document.querySelectorAll('.footer-link[href="index.html"]').forEach((link) => {
      link.textContent = pack.common.back;
    });
    document.querySelectorAll('.footer-link[href^="mailto:"]').forEach((link) => {
      link.textContent = pack.common.contact;
    });
    document.querySelectorAll('.footer-link[href*="scholar.google.com"]').forEach((link) => {
      link.textContent = pack.common.scholar;
    });
  }

  function initLanguageToggle() {
    let currentLang = localStorage.getItem('homepage-language') || 'en';
    applyLanguage(currentLang);

    const toggle = document.getElementById('languageToggle');
    if (!toggle) return;
    toggle.addEventListener('click', function () {
      currentLang = currentLang === 'zh' ? 'en' : 'zh';
      localStorage.setItem('homepage-language', currentLang);
      applyLanguage(currentLang);
    });
  }

  function initMobileNav() {
    const header = document.querySelector('.site-header');
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (!header || !toggle || !nav) return;

    function setNavOpen(isOpen, restoreFocus) {
      header.classList.toggle('nav-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
      if (!isOpen && restoreFocus) toggle.focus();
    }

    function firstVisibleNavLink() {
      return Array.from(nav.querySelectorAll('a[href]')).find((link) => {
        const style = window.getComputedStyle(link);
        return !link.hidden
          && link.getAttribute('aria-hidden') !== 'true'
          && style.display !== 'none'
          && style.visibility !== 'hidden'
          && link.getClientRects().length > 0;
      });
    }

    header.classList.add('js-mobile-nav');
    setNavOpen(false);
    toggle.setAttribute('aria-controls', 'primary-nav');
    toggle.addEventListener('click', function () {
      const isOpen = !header.classList.contains('nav-open');
      setNavOpen(isOpen);
      if (isOpen) firstVisibleNavLink()?.focus();
    });

    nav.addEventListener('click', function (event) {
      const target = event.target;
      if (target && typeof target.closest === 'function' && target.closest('a[href]')) {
        setNavOpen(false);
      }
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && header.classList.contains('nav-open')) {
        setNavOpen(false, true);
      }
    });

    window.addEventListener('resize', function () {
      if (toggle.getClientRects().length === 0) setNavOpen(false);
    }, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initLanguageToggle();
      initMobileNav();
    });
  } else {
    initLanguageToggle();
    initMobileNav();
  }
})();
