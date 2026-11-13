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
        footer: '© 2026 Mingyue Cheng. Last updated on November 7, 2026.',
        skip: 'Skip to main content',
        primaryNav: 'Primary navigation',
        toggleNav: 'Toggle navigation',
        backToTop: 'Back to top',
        publicationFilters: 'Filter publications by research area'
      },
      pages: {
        'research.html': {
          "title": "Research",
          "subtitle": "My research centers on large language models and agents, time-series data mining, and scientific literature mining. I pursue three connected directions: Forecasting Intelligence, AI for AI, and AI for Science, with a focus on predictive reasoning, autonomous learning, and scientific discovery.",
          "labels": [
            "Research Foundations",
            "Research Directions"
          ],
          "footer": "© 2026 Mingyue Cheng. Last updated on November 14, 2026.",
          "scenarios": {
            "heroEyebrow": "Foundations &amp; Directions",
            "selectedWorksLabel": "Selected work",
            "foundationLlmTitle": "LLMs and Agentic AI",
            "foundationLlmBody": "I study LLM reasoning and decision-making, agent planning and tool use, and agent harnesses for memory, context management, and reliable interaction.",
            "foundationTimeseriesTitle": "Time Series Mining",
            "foundationTimeseriesBody": "I study time-series representation learning, forecasting, and cross-domain generalization, with a focus on transferable models for understanding temporal patterns and dependencies.",
            "foundationLiteratureTitle": "Scientific Literature Mining",
            "foundationLiteratureBody": "I study scientific literature retrieval, multimodal understanding of text, figures, and tables, and the extraction and integration of knowledge and evidence across papers.",
            "aiRole": "02 · Autonomous Learning &amp; Continual Evolution",
            "aiTitle": "AI for AI",
            "aiBody": "I study <strong>autonomous learning in large language models</strong> and <strong>continual evolution in agents</strong> through interaction, feedback, and accumulated experience. My research connects learning in model parameters with adaptation through memory and interaction, so models and agents can learn from experience and improve over time.",
            "scienceRole": "03 · AI-Ready Infrastructure &amp; Autonomous Research",
            "scienceTitle": "AI for Science",
            "scienceBody": "I study <strong>AI-ready scientific infrastructure</strong> and <strong>autonomous research agents</strong>, with a focus on making scientific data, literature, and tools usable by agents. My goal is to support iterative research through hypothesis generation, experiment planning and execution, and evidence-based validation, with human oversight.",
            "forecastingRole": "01 · Predictive Reasoning &amp; Temporal Dynamics",
            "forecastingTitle": "Forecasting Intelligence",
            "forecastingBody": "I study how models and agents use <strong>contextual evidence</strong> to understand and forecast dynamic systems. My research focuses on context-aware forecasting, evidence-driven predictive reasoning, and <strong>active context acquisition</strong>, with the long-term goal of understanding and discovering the mechanisms underlying temporal dynamics."
          },
          "join": "For research opportunities and collaboration, visit the <a href=\"https://ustcagi.github.io/\" target=\"_blank\" rel=\"noopener\">USTC-AGI Group</a> or <a href=\"mailto:mycheng@ustc.edu.cn\">contact me by email</a>."
        },
        'news.html': {
          title: 'News & Updates',
          subtitle: 'Latest news from USTC AGI Research Group.',
          content: {
            "news.geomindKdd2027": "<strong>[Nov. 2026]</strong> 🎉 Congratulations on our paper <strong>GeoMind</strong> being accepted to the <strong>ACM SIGKDD 2027 Research Track (August Cycle)</strong>!",
            "news.wsdm2027Papers": "<strong>[Nov. 2026]</strong> 🎉 Congratulations on our papers <strong>AdaCast</strong>, <strong>PaperArena</strong>, and <strong>SheetCompass</strong> being accepted to <strong>ACM WSDM 2027</strong>!",
            "news.icml2027AC": "<strong>[Oct. 2026]</strong> 🎉 I will serve as an <strong>Area Chair (AC)</strong> for <strong>ICML 2027</strong>.",
            "news.www2027AC": "<strong>[Oct. 2026]</strong> 🎉 I will serve as an <strong>Area Chair (AC)</strong> for <strong>The Web Conference 2027 (WWW 2027)</strong>.",
            "news.icdm2026Demos": "<strong>[Sep. 2026]</strong> 🎉 Congratulations on our demo papers <strong>CastClaw</strong> and <strong>AgentWorld</strong> being accepted to the <strong>IEEE ICDM 2026 Demo Track</strong>!",
            "news.tkde2026Survey": "<strong>[Sep. 2026]</strong> 🎉 Congratulations on our survey <strong>A Comprehensive Survey of Time Series Forecasting: Concepts, Challenges, and Future Directions</strong> being accepted by <strong>IEEE Transactions on Knowledge and Data Engineering (IEEE TKDE)</strong>!",
            "news.paperscout2026Emnlp": "<strong>[Aug. 2026]</strong> 🎉 Congratulations on our paper <strong>PaperScout</strong> being accepted to <strong>Findings of EMNLP 2026</strong>!",
            "news.icdm2026TutorialAnnouncement": "<strong>[Aug. 2026]</strong> 🎉 We are excited to present our tutorial, “<strong>Context-Aware Time Series Forecasting: From Pattern Extrapolation to Cognitive Reasoning</strong>,” at <strong>IEEE ICDM 2026</strong>. See you in <strong>Shenyang</strong>!",
            "news.icebe2026Chair": "<strong>[Aug. 2026]</strong> 🎉 I will serve as the <strong>Publication Chair</strong> for <strong>ICEBE 2026</strong>.",
            "news.cikm2026Papers": "<strong>[Aug. 2026]</strong> 🎉 Congratulations on our papers <strong>Mind2Report</strong>, <strong>Time-R1</strong>, and <strong>AlphaCast</strong> being accepted to <strong>ACM CIKM 2026</strong>!",
            "news.csur2026Survey": "<strong>[Aug. 2026]</strong> 🎉 Congratulations on our survey <strong>A Survey on Table Mining with Large Language Models: Challenges, Advancements and Prospects</strong> being accepted by <strong>ACM Computing Surveys (ACM CSUR)</strong>!",
            "news.cikm2026Demos": "<strong>[Aug. 2026]</strong> 🎉 Congratulations on our demo papers <strong>Agent-R1</strong> and <strong>TabClaw</strong> being accepted to the <strong>ACM CIKM 2026 Demo Track</strong>!",
            "news.icdm2026TutorialOrganizer": "<strong>[Jul. 2026]</strong> Our tutorial on <strong>Context-Aware Time Series Forecasting</strong> has been accepted by the <strong>IEEE ICDM 2026 Industry Tutorial Session</strong>. I will serve as a <strong>tutorial organizer and speaker</strong>.",
            "news.fedkdd2026Chair": "<strong>[Jul. 2026]</strong> Our workshop, <strong>FedKDD/FedMAS 2026</strong>, will be held in conjunction with <strong>KDD 2026</strong>. I am honored to serve as the <strong>Program Chair</strong>.",
            "news.caststarGiftEval": "<strong>[Jul. 2026]</strong> 🏆 Our <strong>Agentic Time Series Forecasting</strong> solution <strong>CastStar</strong> ranked <strong>#1</strong> on the <a href=\"https://huggingface.co/spaces/Salesforce/GIFT-Eval\" target=\"_blank\" rel=\"noopener\"><strong>GIFT-Eval</strong></a> Overall leaderboard.",
            "news.castclawBaai": "<strong>[Jun. 2026]</strong> 🎉 Our project <strong>CastClaw（星辰）</strong> received a <strong>Poster Presentation Certificate</strong> at the <strong>2026 BAAI Conference Agent for Science Competition</strong>.",
            "news.tois2026Survey": "<strong>[Jun. 2026]</strong> 🎉 Congratulations on our <strong>Knowledge-Oriented RAG Survey</strong> being accepted to <strong>ACM Transactions on Information Systems (ACM TOIS)</strong>!",
            "news.disentsTpami": "<strong>[May. 2026]</strong> 🎉 Congratulations to <strong>Zhiding Liu</strong> on his work <strong>DisenTS</strong> being accepted to <strong>IEEE Transactions on Pattern Analysis and Machine Intelligence (IEEE TPAMI)</strong>!",
            "news.tist2026Paper": "<strong>[May. 2026]</strong> 🎉 Congratulations to <strong>Xiaoyu Tao</strong> on her paper being accepted to <strong>ACM Transactions on Intelligent Systems and Technology (ACM TIST)</strong>!",
            "news.jindouyunOffers": "<strong>[May. 2026]</strong> 🎉 Congratulations to two of my <strong>co-supervised students</strong> (<strong>Yucong Luo</strong> and <strong>Jie Ouyang</strong>) on receiving <strong>ByteDance Jindouyun</strong> offers!",
            "news.chemtableKdd2026": "<strong>[May. 2026]</strong> 🎉 Congratulations to <strong>Yitong Zhou</strong> on our paper <strong>ChemTable</strong> being accepted to <strong>KDD 2026</strong>!",
            "news.castfactoryRelease": "<strong>[May. 2026]</strong> 🚀 We released <strong>CastFactory（炼星坊）</strong>, a framework for <strong>LLM-driven time series forecasting model training</strong>. <a href=\"https://github.com/ustc-time-series/CastFactory\" target=\"_blank\" rel=\"noopener\"><strong>GitHub</strong></a>",
            "news.ijcai2026Papers": "<strong>[May. 2026]</strong> 🎉 Congratulations to <strong>Xiaoyu Tao</strong> and <strong>Bohou Zhang</strong> on our papers (<strong>TokenCast</strong> and <strong>ScholarSum</strong>) being accepted to <strong>IJCAI 2026</strong>!",
            "news.icml2026Papers": "<strong>[May. 2026]</strong> 🎉 Congratulations to <strong>Yaguo Liu</strong> and <strong>Xiaoyu Tao</strong> on our papers (<strong>CoGenCast</strong> and <strong>MemCast</strong>) being accepted to <strong>ICML 2026</strong>!",
            "news.contextualCognitionSurvey": "<strong>[Apr. 2026]</strong> 📄 We released the preprint version of our survey on <strong>LLM-based agents</strong> from the <strong>contextual cognition perspective</strong> on <a href=\"https://www.preprints.org/manuscript/202604.0935\" target=\"_blank\" rel=\"noopener\"><strong>Preprints.org</strong></a>: <strong>\"A Comprehensive Survey of the LLM-Based Agent: The Contextual Cognition Perspective\"</strong>.",
            "news.geomindPreprint": "<strong>[Apr. 2026]</strong> 📄 We released the preprint version of <strong>GeoMind</strong> on <a href=\"https://arxiv.org/abs/2604.21501\" target=\"_blank\" rel=\"noopener\"><strong>arXiv</strong></a>: <strong>\"GeoMind: An Agentic Workflow for Lithology Classification with Reasoned Tool Invocation\"</strong>.",
            "news.steppoPreprint": "<strong>[Apr. 2026]</strong> 📄 We released the preprint version of <strong>StepPO</strong>, our Agentic RL algorithm, on <a href=\"https://arxiv.org/abs/2604.18401v1\" target=\"_blank\" rel=\"noopener\"><strong>arXiv</strong></a>: <strong>\"StepPO: Step-Aligned Policy Optimization for Agentic Reinforcement Learning\"</strong>.",
            "news.castclawDocs": "<strong>[Apr. 2026]</strong> 📘 We released the <strong>CastClaw（星辰）</strong> <a href=\"https://ustc-time-series.github.io/cast-claw/docs/\" target=\"_blank\" rel=\"noopener\"><strong>user documentation</strong></a>, covering installation, configuration, and usage for <strong>agentic time series forecasting</strong>.",
            "news.acl2026Paper": "<strong>[Apr. 2026]</strong> 🎉 Congratulations to <strong>Jiawei Cao</strong> on his paper being accepted to <strong>ACL 2026 Main Conference</strong>!",
            "news.tkde2026Paper": "<strong>[Apr. 2026]</strong> 🎉 Congratulations to <strong>Qingyang Mao</strong> on his paper being accepted to <strong>IEEE Transactions on Knowledge and Data Engineering (IEEE TKDE)</strong>!",
            "news.castclawRelease": "<strong>[Apr. 2026]</strong> 🚀 We released <strong>CastClaw（星辰）</strong>, an open-source <a href=\"https://github.com/ustc-time-series/CastClaw\" target=\"_blank\" rel=\"noopener\"><strong>GitHub</strong></a> framework for <strong>agentic time series forecasting</strong>. Check out the <a href=\"https://ustc-time-series.github.io/cast-claw/\" target=\"_blank\" rel=\"noopener\"><strong>project page</strong></a>!",
            "news.academicSearchRelease": "<strong>[Apr. 2026]</strong> 🚀 We released <strong>Academic Search</strong>, an open-source <a href=\"https://github.com/ustc-ai4science/academic-search\" target=\"_blank\" rel=\"noopener\"><strong>GitHub</strong></a> skill for <strong>AI4Science literature search</strong>.",
            "news.tabclawRelease": "<strong>[Mar. 2026]</strong> 🚀 We open-sourced <strong>TabClaw</strong>, an <a href=\"https://github.com/ustc-table-mining/TabClaw\" target=\"_blank\" rel=\"noopener\"><strong>GitHub</strong></a> framework for <strong>agentic table reasoning</strong>, designed to enable <strong>LLM agents</strong> to understand, analyze, and interact with <strong>large-scale tabular data</strong> through structured reasoning and tool-augmented workflows.",
            "news.clawR1Release": "<strong>[Mar. 2026]</strong> 🚀 We open-sourced <strong>Claw-R1</strong>, an <a href=\"https://github.com/AgentR1/Claw-R1\" target=\"_blank\" rel=\"noopener\"><strong>GitHub</strong></a> framework for <strong>agentic reinforcement learning</strong>, extending RL training environments for <strong>reasoning and tool-using LLM agents</strong>.",
            "news.agenticTsfPosition": "<strong>[Feb. 2026]</strong> 🎉 We released a <strong>Position Paper</strong> on <a href=\"https://arxiv.org/abs/2602.01776\" target=\"_blank\" rel=\"noopener\"><strong>arXiv</strong></a>: <strong>\"Beyond Model-Centric Prediction — Agentic Time Series Forecasting\"</strong>.",
            "news.pspoPreprint": "<strong>[Jan. 2026]</strong> 📄 We released <strong>PSPO</strong>, our Agentic RL algorithm, and validated it on the <strong>PaperScout</strong> paper search agent on <a href=\"https://arxiv.org/abs/2601.10029\" target=\"_blank\" rel=\"noopener\"><strong>arXiv</strong></a>: <strong>\"PaperScout: An Autonomous Agent for Academic Paper Search with Process-Aware Sequence-Level Policy Optimization\"</strong>.",
            "news.dasfaa2026Paper": "<strong>[Jan. 2026]</strong> 🎉 Congratulations to <strong>Li Li</strong> on her paper being accepted to <strong>DASFAA 2026</strong>!",
            "news.iclr2026Paper": "<strong>[Jan. 2026]</strong> 🎉 Congratulations to <strong>Qingyang Mao</strong> and <strong>Zirui Liu</strong> on our paper being accepted to <strong>ICLR 2026</strong>!",
            "news.ijcai2026SPC": "<strong>[Jan. 2026]</strong> 🎉 I will serve as a <strong>Senior Program Committee (SPC)</strong> member for <strong>IJCAI2026</strong>.",
            "news.www2026Paper": "<strong>[Jan. 2026]</strong> 🎉 Congratulations to <strong>Huajian Zhang</strong>, <strong>Shuo Yu</strong>, <strong>Qingchuan Li</strong> and <strong>Zhiding Liu</strong> on our paper being accepted to <strong>WWW 2026</strong>!",
            "news.smc2026AE": "<strong>[Dec. 2025]</strong> 🎉 I will serve as a <strong>AE</strong> for <strong>IEEE SMC2026</strong>.",
            "news.tist2025Paper": "<strong>[Nov. 2025]</strong> 🎉 Congratulations to <strong>Xiaoyu Tao</strong> on her paper being accepted to <strong>ACM Transactions on Intelligent Systems and Technology (ACM TIST)</strong>!",
            "news.aaai2026Paper": "<strong>[Nov. 2025]</strong> 🎉 Congratulations to <strong>Qingchuan Li</strong> and <strong>Yupeng Li</strong> on our paper being accepted to <strong>AAAI 2026</strong>!",
            "news.wsdm2026Paper": "<strong>[Oct. 2025]</strong> 🎉 Congratulations to <strong>Chuang Jiang</strong>, <strong>Jiahao Wang</strong>, and collaborators on our paper being accepted to <strong>ACM WSDM2026</strong>!",
            "news.neurips2025Paper": "<strong>[Sep. 2025]</strong> 🎉 Congratulations to <strong>Zhiding Liu</strong> on his paper being accepted to <strong>NeurIPS 2025</strong>!",
            "news.cikm2025Paper": "<strong>[Aug. 2025]</strong> 🎉 Congratulations to <strong>Shuo Yu</strong> and <strong>Jiahao Wang</strong> on our paper being accepted to <strong>CIKM 2025</strong>!",
            "news.recsys2025Paper": "<strong>[Jul. 2025]</strong> 🎉 Congratulations to <strong>Mingfan Pan</strong> and <strong>Yue Chen</strong> for our paper acceptance at <strong>RecSys 2025</strong>!",
            "news.chemtableRelease": "<strong>[Jun. 2025]</strong> 📊 We released <strong>ChemTable</strong>, a large-scale dataset and benchmark for evaluating MLLMs on real-world chemical tables. <a href=\"https://github.com/ustc-ai4science/ChemTable\" target=\"_blank\" rel=\"noopener\">[GitHub]</a> <a href=\"https://arxiv.org/abs/2506.11375\" target=\"_blank\" rel=\"noopener\">[arXiv]</a>",
            "news.timeR1Release": "<strong>[Jun. 2025]</strong> 🚀 We released <strong>Time-R1</strong>, the first time series reasoning model with reinforcement fine-tuning, See the <a href=\"https://github.com/lqzxt/Time-R1\" target=\"_blank\" rel=\"noopener\">GitHub project</a>.",
            "news.acl2025Paper": "<strong>[May. 2025]</strong> 🎉 Congratulations to <strong>Jie Ouyang</strong> and <strong>Junhao Yu</strong> on our paper being accepted to <strong>ACL 2025</strong>!",
            "news.icml2025Paper": "<strong>[May. 2025]</strong> 🎉 Congratulations to <strong>Daoyu Wang</strong> and <strong>Zirui Liu</strong> on our paper being accepted to <strong>ICML 2025</strong>!",
            "news.ijcai2025Paper": "<strong>[Apr. 2025]</strong> 🎉 Congratulations to <strong>Jintao Zhang</strong>, <strong>Yitong Zhou</strong>, and <strong>Hao Zhang</strong> for having our paper accepted by <strong>IJCAI 2025</strong>!",
            "news.tsfSurveyPreprint": "<strong>[Apr. 2025]</strong> 📄 We preprinted a new survey: <strong>A Comprehensive Survey of Time Series Forecasting</strong> on <a href=\"https://www.techrxiv.org/doi/full/10.36227/techrxiv.174430535.53879341\" target=\"_blank\" rel=\"noopener\">TechRxiv</a>.",
            "news.tableSurveyPreprint": "<strong>[Apr. 2025]</strong> 📄 Our survey <strong>A Survey on Table Mining with Large Language Models</strong> released on <a href=\"https://www.techrxiv.org/doi/full/10.36227/techrxiv.174352282.22844759\" target=\"_blank\" rel=\"noopener\">TechRxiv</a>.",
            "news.agentR1Release": "<strong>[Mar. 2025]</strong> 🚀 Our <strong>Agent R1</strong> project officially released on <a href=\"https://github.com/AgentR1/Agent-R1\" target=\"_blank\" rel=\"noopener\">GitHub</a>.",
            "news.ragSurveyPreprint": "<strong>[Mar. 2025]</strong> 📄 Our survey <strong>A Survey on Knowledge-Oriented Retrieval-Augmented Generation</strong> released on <a href=\"https://arxiv.org/pdf/2503.10677\" target=\"_blank\" rel=\"noopener\">arXiv</a>.",
            "news.ascend2024Award": "<strong>[Dec. 2024]</strong> 🏆 Congrats to our students on winning the <strong>Gold Award</strong> in the 2024 <strong>Ascend AI Innovation Competition</strong> finals!"
          }
        },
        'publications.html': {
          title: 'Publications',
          subtitle: 'Full publication list of Mingyue Cheng. (* Corresponding Author, + Equal Contribution)',
          subtitleHtml: 'Full publication list of <a href="index.html">Mingyue Cheng</a>. (* Corresponding Author, <sup>+</sup> Equal Contribution)',
          content: {
            "pub.jumpLegacy": "2023 and earlier",
            "pub.jumpPreprint": "Preprints",
            "pub.jumpLabel": "Jump to:",
            'pub.filterAll': 'All',
            'pub.filterReasoning': 'LLM-based Reasoning',
            'pub.filterAgent': 'LLM-based Agentic AI',
            'pub.filterStructured': 'Structured Data Mining',
            'pub.filterTime': 'Time Series Analysis',
            'pub.filterTable': 'Table Mining',
            'pub.filterKnowledge': 'AI for Science',
            'pub.filterRec': 'Recommender Systems',
            'pub.note': '(* Corresponding Author, <sup>+</sup> Equal Contribution)',
            "pub.preprint": "Preprints",
            "pub.year2027": "2027",
            "pub.year2026": "2026",
            "pub.year2025": "2025",
            "pub.year2024": "2024",
            "pub.legacy": "2023 and earlier",
            'pub.filterLabel': 'Filter by topic:'
          }
        },
        'projects.html': {
          title: 'Open Project & Benchmarks',
          subtitle: 'Open-source frameworks, tools, benchmarks, and datasets for LLM reasoning and AI agents, time-series intelligence, and science intelligence.',
          content: {
            "datasets.topicRag": "Retrieval-Augmented Generation",
            "datasets.topicSearch": "Search-based Recommendation",
            "datasets.topicLiterature": "Scientific Literature Mining",
            "datasets.hohKicker": "RAG Evaluation · Dynamic Benchmark",
            "datasets.kuaiSearchKicker": "E-Commerce Search · Recall to Relevance",
            "datasets.chemTableKicker": "AI for Science · Chemical Tables",
            "datasets.paperArenaKicker": "Scientific Literature · Agentic Evaluation",
            "datasets.hoh": "<strong>HoH: A Dynamic Benchmark for Evaluating the Impact of Outdated Information on RAG</strong> studies how retrieval-augmented generation systems fail when knowledge becomes stale. It provides a dynamic evaluation setting for measuring <strong>temporal robustness</strong>, <strong>outdated-information sensitivity</strong>, and the impact of knowledge freshness in modern <strong>RAG</strong> pipelines.",
            "datasets.kuaiSearch": "<strong>KuaiSearch: A Large-Scale E-Commerce Search Dataset for Recall, Ranking, and Relevance</strong> is built from real user search interactions on Kuaishou. It preserves authentic user queries and natural-language product texts, covers <strong>cold-start users</strong> and <strong>long-tail products</strong>, and spans the three key stages of modern search systems: <strong>recall</strong>, <strong>ranking</strong>, and <strong>relevance judgment</strong>.",
            "datasets.chemTable": "<strong>Benchmarking Multimodal LLMs on Recognition and Understanding over Chemical Tables</strong> introduces <strong>ChemTable</strong>, a real-world benchmark curated from chemical literature. It supports two core tasks: <strong>table recognition</strong> and <strong>table understanding</strong>, with expert annotations over cell polygons, logical layouts, and chemistry-specific semantic labels such as reagents, catalysts, yields, and graphical components.",
            "datasets.paperArena": "<strong>PaperArena: An Evaluation Benchmark for Tool-Augmented Agentic Reasoning on Scientific Literature</strong> benchmarks agentic systems on scientific reading and reasoning with tool use. It targets <strong>literature understanding</strong>, <strong>tool-augmented reasoning</strong>, and <strong>evidence-grounded evaluation</strong> over scientific papers and related scholarly workflows.",
            "opensource.codeForthcoming": "Code forthcoming",
            'systems.heading': 'Systems Product',
            'systems.brand': '科言 · Science Intelligence',
            'systems.lewen': 'Discover scientific literature through quick search and in-depth retrieval.',
            'systems.wenxiu': 'Support academic writing with polishing, proofreading, and translation tools.',
            'systems.visit': 'Visit website',
            'opensource.heading': 'Open Project',
            'opensource.agentR1': '<span class="os-inline-highlight">Agent-R1</span> is a <strong>unified, modular training framework for Agentic RL</strong>. It models each round of agent interaction as a <strong>step-level RL transition</strong> and decouples <strong>trajectory representation, context construction, environment interfaces, and optimization algorithms</strong>. This allows <strong>GRPO, PPO, and other algorithms</strong> to be compared and extended on a <strong>shared foundation for multi-turn agent training</strong>.',
            'opensource.clawR1': '<span class="os-inline-highlight">Claw-R1</span> provides the <strong>Data Foundation for Agentic RL</strong>, enabling the systematic <strong>collection, evaluation, and curation of high-quality training data</strong> from <strong>diverse agent interactions</strong>. It introduces a <strong>middleware layer (Gateway + DataPool)</strong> between the <strong>Agent Side</strong> and the <strong>Training Side</strong>, focusing on <strong>data infrastructure</strong> rather than training algorithms themselves.',
            'opensource.castClaw': '<span class="os-inline-highlight">CastClaw（星辰）</span> is an <strong>agent framework for human–AI collaboration</strong> in <strong>time series forecasting research</strong>. It uses three specialized agents, <strong>Planner, Forecaster, and Critic</strong>, to orchestrate the complete forecasting workflow and incorporates <strong>human confirmation at key stages</strong>. It packages <strong>data analysis, feature engineering, and classical time series model capabilities</strong> into an <strong>extensible runtime toolbox</strong>.',
            "opensource.castMind": "<span class=\"os-inline-highlight\">CastMind（星思）</span> is a <strong>research initiative on context-driven reasoning for time series projection in complex systems</strong>. It explores how <strong>historical time series, external context, and domain knowledge</strong> can support an <strong>extrapolate → understand → project → revise</strong> workflow for forecast revision and mechanism explanation. <strong>Public code is forthcoming.</strong>",
            'opensource.paperScout': '<span class="os-inline-highlight">PaperScout</span> is an <strong>autonomous scientific literature retrieval agent</strong> for <strong>complex research queries</strong>. It treats paper discovery as <strong>multi-turn decision-making</strong>, using accumulated retrieval context to choose between <strong>Search</strong> for new candidates and <strong>Expand</strong> for following paper references. With <strong>process-aware, sequence-level reinforcement learning (PSPO)</strong>, it learns to refine its retrieval strategy from intermediate feedback and identify papers that match the <strong>research topic and query constraints</strong>.',
            'opensource.academicSearch': '<span class="os-inline-highlight">Academic Search</span> is a <strong>scientific literature retrieval and metadata skill</strong> for <strong>Codex, Claude Code, and other AI agents</strong>. It brings together sources including <strong>arXiv, Semantic Scholar, OpenAlex, Google Scholar, and CNKI</strong>, supporting <strong>query expansion, citation tracing, record validation, cross-source deduplication, and BibTeX export</strong>, as well as <strong>open-access full-text retrieval</strong>. It adapts search strategies to the discipline and records source provenance and access status to support <strong>literature reviews and research surveys</strong>.',
            'opensource.category.agents': 'LLMs and Agentic AI',
            'opensource.category.timeseries': 'Time Series Intelligence（科语）',
            'opensource.category.science': 'Science Intelligence（Scientific Tool and Knowledge）',
            'datasets.heading': 'Benchmarks &amp; Datasets',
            'datasets.category.science': 'Science Intelligence（Scientific Tool and Knowledge）',
            'datasets.category.timeseries': 'Time Series Intelligence（Context-aware Time Series Forecasting）',
            'datasets.category.retrieval': 'Retrieval &amp; Recommendation',
            'datasets.world2ts': '<span class="os-inline-highlight">World2TS</span> is a <strong>human-reviewed dataset for event-aware time series forecasting</strong>. It links <strong>time series across six domains</strong> to relevant <strong>real-world events</strong>, preserving <strong>event descriptions, temporal metadata, and source evidence</strong>. It supports research on <strong>context-aware forecasting</strong> and <strong>evidence-grounded reasoning</strong> about external events.',
            'datasets.world2tsKicker': 'Time Series Intelligence · Real-world Event Context',
            'opensource.webMind': '<span class="os-inline-highlight">WebMind</span> is a <strong>web-task skill</strong> for <strong>AI agents</strong>. It completes web search, reading, navigation, and interaction in an <strong>isolated, persistent browser environment</strong>, with built-in support for <strong>screenshots</strong>, <strong>mouse and keyboard control</strong>, and <strong>reusable local experience</strong>. It requires <strong>no Google sign-in</strong> and does not use personal data from the user\'s everyday Chrome profile by default, making it especially suitable for <strong>topic research</strong>, <strong>information collection</strong>, and <strong>repeatable web workflows</strong>.',
            'opensource.tabClaw': '<span class="os-inline-highlight">TabClaw</span> is an open-source agentic framework that empowers LLMs to reason over <strong>complex, real-world tabular data</strong>. It decomposes table-centric tasks into <strong>structured sub-goals</strong>, equips agents with <strong>code execution</strong>, <strong>schema-aware lookup</strong>, and <strong>formula tools</strong>, and coordinates them through <strong>multi-step decision workflows</strong>. TabClaw is designed to tackle challenges beyond flat QA — including <strong>multi-hop joins</strong>, <strong>conditional aggregation</strong>, and <strong>cross-table inference</strong> — making it suitable for enterprise data analysis and scientific table understanding.',
            'opensource.castFactory': '<span class="os-inline-highlight">CastFactory（炼星坊）</span> is an open-source framework for <strong>LLM-driven time series forecasting model training</strong>, designed to make it <strong>extremely easy</strong> for users to build and adapt TSF models with modern large-model pipelines. It provides a unified and practical workflow for <strong>continued pre-training (CPT)</strong>, <strong>supervised fine-tuning (SFT)</strong>, and <strong>reinforcement learning (RL)</strong>, helping researchers and practitioners develop, optimize, and evaluate LLM-based forecasting systems with much lower engineering overhead.',
            'opensource.neoResearch': '<span class="os-inline-highlight">NeoResearch（智多星）</span> is an autonomous research agent system for <strong>time series forecasting model development</strong>. It connects research hypothesis generation, candidate recipe search, controlled experiments, evaluation diagnosis, and research memory into a reproducible loop, supporting systematic iteration from problem definition to validated forecasting model candidates.'
          }
        },
        'awards.html': {
          content: {
            "award.hongzhuan": "USTC Hongzhuan Young Talent",
            "award.wsdm2025": "Best of WSDM 2025 (Outstanding Paper Award)",
            "award.ascend2024": "Gold Award, Ascend AI Innovation Competition National Finals (Advisor)",
            "award.kddcup2024": "Second Place in Task 2 &amp; Task 3, KDD Cup 2024",
            "award.eagle2024": "USTC Eagle Innovation and Entrepreneurship Fund (Advisor)",
            "award.innovation2023": "National Silver Award, China International College Students’ Innovation Competition 2023 (Ministry of Education)",
            "award.internetPlus2023": "Anhui Provincial Gold Award, China “Internet+” College Students’ Innovation and Entrepreneurship Competition (Anhui Provincial Department of Education)",
            "award.graduate2023": "Outstanding Graduate, University of Science and Technology of China",
            "award.innovation2022": "USTC Innovation and Entrepreneurship Fund 2022",
            "award.goldenSeed2021": "“Chuang Qingchun” Youth Innovation and Entrepreneurship Project Support — College Student Entrepreneurship “Golden Seed” Program (Central Committee of the Communist Youth League of China)",
            "award.scholarship2021": "National Scholarship for Doctoral Students (Ministry of Education)",
            "grant.ongoing": "Ongoing",
            "grant.upcoming": "Upcoming",
            "grant.completed": "Period ended",
            "grant.industrial": "Industry Support",
            "grant.industrySupport": "Research partially supported by industrial grants from iFLYTEK, Huawei, Tencent, and Kuaishou."
          },
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
          subtitle: "Selected program committee service, conference organization, journal reviewing, and academic community contributions.",
          content: {
            "service.icdmTutorialRole": "Tutorial Organizer and Speaker",
            "service.icdmTutorialName": "IEEE ICDM 2026 Industry Tutorial: Context-Aware Time Series Forecasting",
            "service.fedkddChair": "Program Chair",
            "service.fedkddName": "FedKDD/FedMAS Workshop, held in conjunction with KDD 2026",
            "service.journal.computers": "Chinese Journal of Computers",
            "service.journal.software": "Journal of Software",
            "service.ijcaiSPC": "Senior Program Committee Member 2026",
            "service.icmlAreaChair": "Area Chair 2027",
            'service.conferenceOrganization': 'Conference Organization',
            'service.icebePublicationChair': 'Publication Chair',
            'service.iclrAreaChair': 'Area Chair 2027',
            'service.wwwAreaChair': 'Area Chair 2027',
            "service.pc": "Program Committee Service",
            'service.journal': 'Journal Reviewer',
            'service.organizations': 'Academic Organization Service',
            'service.ieeeDeal': 'IEEE Task Force on Data-Efficient Agentic Learning (DEAL)',
            'service.ieeeAi4tst': 'IEEE Task Force on AI for Time Series and Spatio-Temporal Data',
            'service.ccfAipr': 'Technical Committee on Artificial Intelligence and Pattern Recognition, China Computer Federation (CCF) — Executive Committee Member',
            'service.cipsIr': 'Information Retrieval Technical Committee, Chinese Information Processing Society of China (CIPS) — Corresponding Member'
          }
        },
        'resources.html': {
          content: {
            "resource.ccfTitle": "CCF Recommended International Academic Conferences and Journals — Seventh Edition (Official Version)",
            "resource.degreeTitle": "USTC Division of Information and Intelligence: Graduate Degree Award Standards (2020 Edition)"
          },
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
        footer: '© 2026 程明月。最后更新于 2026 年 11 月 7 日。',
        skip: '跳至主要内容',
        primaryNav: '主导航',
        toggleNav: '展开或收起导航',
        backToTop: '返回顶部',
        publicationFilters: '按研究方向筛选论文'
      },
      pages: {
        'research.html': {
          "title": "研究方向",
          "subtitle": "我的研究以大模型与智能体、时序数据挖掘和科技文献挖掘为基础，围绕 Forecasting Intelligence、AI for AI 和 AI for Science 三条相互关联的方向，探索预测推理、自主学习和科学发现。",
          "labels": [
            "研究基础",
            "重点研究方向"
          ],
          "footer": "© 2026 程明月。最后更新于 2026 年 11 月 14 日。",
          "scenarios": {
            "heroEyebrow": "技术基础与研究布局",
            "selectedWorksLabel": "代表成果",
            "foundationLlmTitle": "大模型与智能体",
            "foundationLlmBody": "研究大模型推理与决策、智能体规划与工具使用，以及支撑记忆、上下文管理与可靠交互的智能体运行框架（Agent Harness）。",
            "foundationTimeseriesTitle": "时序数据挖掘",
            "foundationTimeseriesBody": "研究时序表示学习、预测建模与跨域泛化，重点构建可迁移的模型来理解时序模式与依赖关系。",
            "foundationLiteratureTitle": "科技文献挖掘",
            "foundationLiteratureBody": "研究科技文献检索、文本与图表的多模态理解，以及跨文献的知识与证据抽取和整合。",
            "aiRole": "02 · 自主学习与持续进化",
            "aiTitle": "AI for AI",
            "aiBody": "研究<strong>大模型自主学习</strong>与<strong>智能体持续进化</strong>，探索如何从交互、反馈和积累的经验中学习。将模型参数学习与基于记忆和交互的适应机制结合，使模型和智能体能够从经验中学习并持续提升能力。",
            "scienceRole": "03 · 科研基础设施与自主科研",
            "scienceTitle": "AI for Science",
            "scienceBody": "研究<strong>面向 AI 的科研基础设施</strong>与<strong>自主科研智能体</strong>，让智能体能够使用科学数据、文献和工具。目标是在研究人员监督下，支持提出假设、规划与执行实验、依据证据验证结果并迭代的科研过程。",
            "forecastingRole": "01 · 预测推理与时序动态",
            "forecastingTitle": "Forecasting Intelligence",
            "forecastingBody": "研究模型与智能体如何利用<strong>情境证据</strong>理解和预测动态系统，重点关注情境感知预测、证据驱动的预测推理与<strong>主动情境获取</strong>，长期目标是理解和发现时序变化背后的机制。"
          },
          "join": "如有意了解研究机会或开展合作，欢迎访问 <a href=\"https://ustcagi.github.io/\" target=\"_blank\" rel=\"noopener\">USTC-AGI Group</a>，或<a href=\"mailto:mycheng@ustc.edu.cn\">通过邮箱联系我</a>。"
        },
        'news.html': {
          title: '最新动态',
          subtitle: 'USTC AGI Research Group 的最新动态。',
          content: {
            "news.geomindKdd2027": "<strong>[2026 年 11 月]</strong> 🎉 祝贺我们的论文 <strong>GeoMind</strong> 被 <strong>ACM SIGKDD 2027 研究轨（8 月轮次）</strong> 录用！",
            "news.wsdm2027Papers": "<strong>[2026 年 11 月]</strong> 🎉 祝贺我们的论文 <strong>AdaCast</strong>、<strong>PaperArena</strong> 和 <strong>SheetCompass</strong> 被 <strong>ACM WSDM 2027</strong> 录用！",
            "news.icml2027AC": "<strong>[2026 年 10 月]</strong> 🎉 我即将担任 <strong>ICML 2027</strong> 的<strong>领域主席（Area Chair，AC）</strong>。",
            "news.www2027AC": "<strong>[2026 年 10 月]</strong> 🎉 我即将担任 <strong>The Web Conference 2027（WWW 2027）</strong> 的<strong>领域主席（Area Chair，AC）</strong>。",
            "news.icdm2026Demos": "<strong>[2026 年 9 月]</strong> 🎉 祝贺我们的演示论文 <strong>CastClaw</strong> 和 <strong>AgentWorld</strong> 被 <strong>IEEE ICDM 2026 Demo Track</strong> 录用！",
            "news.tkde2026Survey": "<strong>[2026 年 9 月]</strong> 🎉 祝贺我们的综述 <strong>A Comprehensive Survey of Time Series Forecasting: Concepts, Challenges, and Future Directions</strong> 被 <strong>IEEE Transactions on Knowledge and Data Engineering（IEEE TKDE）</strong> 录用！",
            "news.paperscout2026Emnlp": "<strong>[2026 年 8 月]</strong> 🎉 祝贺我们的论文 <strong>PaperScout</strong> 被 <strong>Findings of EMNLP 2026</strong> 录用！",
            "news.icdm2026TutorialAnnouncement": "<strong>[2026 年 8 月]</strong> 🎉 我们将在 <strong>IEEE ICDM 2026</strong> 讲授教程“<strong>Context-Aware Time Series Forecasting: From Pattern Extrapolation to Cognitive Reasoning</strong>”。期待在<strong>沈阳</strong>与大家见面！",
            "news.icebe2026Chair": "<strong>[2026 年 8 月]</strong> 🎉 我即将担任 <strong>ICEBE 2026</strong> 的<strong>出版主席（Publication Chair）</strong>。",
            "news.cikm2026Papers": "<strong>[2026 年 8 月]</strong> 🎉 祝贺我们的论文 <strong>Mind2Report</strong>、<strong>Time-R1</strong> 和 <strong>AlphaCast</strong> 被 <strong>ACM CIKM 2026</strong> 录用！",
            "news.csur2026Survey": "<strong>[2026 年 8 月]</strong> 🎉 祝贺我们的综述 <strong>A Survey on Table Mining with Large Language Models: Challenges, Advancements and Prospects</strong> 被 <strong>ACM Computing Surveys（ACM CSUR）</strong> 录用！",
            "news.cikm2026Demos": "<strong>[2026 年 8 月]</strong> 🎉 祝贺我们的演示论文 <strong>Agent-R1</strong> 和 <strong>TabClaw</strong> 被 <strong>ACM CIKM 2026 Demo Track</strong> 录用！",
            "news.icdm2026TutorialOrganizer": "<strong>[2026 年 7 月]</strong> 我们关于<strong>情境感知时间序列预测（Context-Aware Time Series Forecasting）</strong>的教程已被 <strong>IEEE ICDM 2026 Industry Tutorial Session</strong> 接收。我将担任<strong>教程组织者与讲者</strong>。",
            "news.fedkdd2026Chair": "<strong>[2026 年 7 月]</strong> 我们的研讨会 <strong>FedKDD/FedMAS 2026</strong> 将与 <strong>KDD 2026</strong> 同期举办。我很荣幸担任<strong>程序委员会主席（Program Chair）</strong>。",
            "news.caststarGiftEval": "<strong>[2026 年 7 月]</strong> 🏆 我们的<strong>智能体时间序列预测</strong>方案 <strong>CastStar</strong> 在 <a href=\"https://huggingface.co/spaces/Salesforce/GIFT-Eval\" target=\"_blank\" rel=\"noopener\"><strong>GIFT-Eval</strong></a> 综合榜单上排名<strong>第一</strong>。",
            "news.castclawBaai": "<strong>[2026 年 6 月]</strong> 🎉 我们的项目 <strong>CastClaw（星辰）</strong> 在<strong>2026 北京智源大会 Agent for Science 竞赛</strong>中获得<strong>海报展示证书（Poster Presentation Certificate）</strong>。",
            "news.tois2026Survey": "<strong>[2026 年 6 月]</strong> 🎉 祝贺我们的 <strong>Knowledge-Oriented RAG Survey</strong> 被 <strong>ACM Transactions on Information Systems（ACM TOIS）</strong> 录用！",
            "news.disentsTpami": "<strong>[2026 年 5 月]</strong> 🎉 祝贺 <strong>Zhiding Liu</strong> 的工作 <strong>DisenTS</strong> 被 <strong>IEEE Transactions on Pattern Analysis and Machine Intelligence（IEEE TPAMI）</strong> 录用！",
            "news.tist2026Paper": "<strong>[2026 年 5 月]</strong> 🎉 祝贺 <strong>Xiaoyu Tao</strong> 的论文被 <strong>ACM Transactions on Intelligent Systems and Technology（ACM TIST）</strong> 录用！",
            "news.jindouyunOffers": "<strong>[2026 年 5 月]</strong> 🎉 祝贺我<strong>联合指导的两位学生</strong>（<strong>Yucong Luo</strong> 和 <strong>Jie Ouyang</strong>）获得<strong>字节跳动筋斗云计划</strong>的录用通知！",
            "news.chemtableKdd2026": "<strong>[2026 年 5 月]</strong> 🎉 祝贺 <strong>Yitong Zhou</strong>，我们的论文 <strong>ChemTable</strong> 被 <strong>KDD 2026</strong> 录用！",
            "news.castfactoryRelease": "<strong>[2026 年 5 月]</strong> 🚀 我们发布了 <strong>CastFactory（炼星坊）</strong>，一个面向<strong>大模型驱动的时间序列预测模型训练</strong>的框架。<a href=\"https://github.com/ustc-time-series/CastFactory\" target=\"_blank\" rel=\"noopener\"><strong>GitHub</strong></a>",
            "news.ijcai2026Papers": "<strong>[2026 年 5 月]</strong> 🎉 祝贺 <strong>Xiaoyu Tao</strong> 和 <strong>Bohou Zhang</strong>，我们的论文 <strong>TokenCast</strong> 和 <strong>ScholarSum</strong> 被 <strong>IJCAI 2026</strong> 录用！",
            "news.icml2026Papers": "<strong>[2026 年 5 月]</strong> 🎉 祝贺 <strong>Yaguo Liu</strong> 和 <strong>Xiaoyu Tao</strong>，我们的论文 <strong>CoGenCast</strong> 和 <strong>MemCast</strong> 被 <strong>ICML 2026</strong> 录用！",
            "news.contextualCognitionSurvey": "<strong>[2026 年 4 月]</strong> 📄 我们在 <a href=\"https://www.preprints.org/manuscript/202604.0935\" target=\"_blank\" rel=\"noopener\"><strong>Preprints.org</strong></a> 发布了从<strong>情境认知视角</strong>研究<strong>大模型智能体</strong>的综述预印本：<strong>“A Comprehensive Survey of the LLM-Based Agent: The Contextual Cognition Perspective”</strong>。",
            "news.geomindPreprint": "<strong>[2026 年 4 月]</strong> 📄 我们在 <a href=\"https://arxiv.org/abs/2604.21501\" target=\"_blank\" rel=\"noopener\"><strong>arXiv</strong></a> 发布了 <strong>GeoMind</strong> 的预印本：<strong>“GeoMind: An Agentic Workflow for Lithology Classification with Reasoned Tool Invocation”</strong>。",
            "news.steppoPreprint": "<strong>[2026 年 4 月]</strong> 📄 我们在 <a href=\"https://arxiv.org/abs/2604.18401v1\" target=\"_blank\" rel=\"noopener\"><strong>arXiv</strong></a> 发布了智能体强化学习算法 <strong>StepPO</strong> 的预印本：<strong>“StepPO: Step-Aligned Policy Optimization for Agentic Reinforcement Learning”</strong>。",
            "news.castclawDocs": "<strong>[2026 年 4 月]</strong> 📘 我们发布了 <strong>CastClaw（星辰）</strong> 的<a href=\"https://ustc-time-series.github.io/cast-claw/docs/\" target=\"_blank\" rel=\"noopener\"><strong>用户文档</strong></a>，介绍<strong>智能体时间序列预测</strong>的安装、配置与使用方法。",
            "news.acl2026Paper": "<strong>[2026 年 4 月]</strong> 🎉 祝贺 <strong>Jiawei Cao</strong> 的论文被 <strong>ACL 2026 主会</strong>录用！",
            "news.tkde2026Paper": "<strong>[2026 年 4 月]</strong> 🎉 祝贺 <strong>Qingyang Mao</strong> 的论文被 <strong>IEEE Transactions on Knowledge and Data Engineering（IEEE TKDE）</strong> 录用！",
            "news.castclawRelease": "<strong>[2026 年 4 月]</strong> 🚀 我们发布了 <strong>CastClaw（星辰）</strong>，一个面向<strong>智能体时间序列预测</strong>的开源框架。欢迎访问 <a href=\"https://github.com/ustc-time-series/CastClaw\" target=\"_blank\" rel=\"noopener\"><strong>GitHub</strong></a> 和<a href=\"https://ustc-time-series.github.io/cast-claw/\" target=\"_blank\" rel=\"noopener\"><strong>项目主页</strong></a>！",
            "news.academicSearchRelease": "<strong>[2026 年 4 月]</strong> 🚀 我们发布了 <strong>Academic Search</strong>，一个面向 <strong>AI4Science 文献检索</strong>的开源技能。<a href=\"https://github.com/ustc-ai4science/academic-search\" target=\"_blank\" rel=\"noopener\"><strong>GitHub</strong></a>",
            "news.tabclawRelease": "<strong>[2026 年 3 月]</strong> 🚀 我们开源了 <strong>TabClaw</strong>，一个面向<strong>智能体表格推理</strong>的框架，通过结构化推理和工具增强工作流，让<strong>大模型智能体</strong>理解、分析<strong>大规模表格数据</strong>并与之交互。<a href=\"https://github.com/ustc-table-mining/TabClaw\" target=\"_blank\" rel=\"noopener\"><strong>GitHub</strong></a>",
            "news.clawR1Release": "<strong>[2026 年 3 月]</strong> 🚀 我们开源了 <strong>Claw-R1</strong>，一个面向<strong>智能体强化学习</strong>的框架，为<strong>具备推理与工具使用能力的大模型智能体</strong>扩展强化学习训练环境。<a href=\"https://github.com/AgentR1/Claw-R1\" target=\"_blank\" rel=\"noopener\"><strong>GitHub</strong></a>",
            "news.agenticTsfPosition": "<strong>[2026 年 2 月]</strong> 🎉 我们在 <a href=\"https://arxiv.org/abs/2602.01776\" target=\"_blank\" rel=\"noopener\"><strong>arXiv</strong></a> 发布了<strong>观点论文</strong>：<strong>“Beyond Model-Centric Prediction — Agentic Time Series Forecasting”</strong>。",
            "news.pspoPreprint": "<strong>[2026 年 1 月]</strong> 📄 我们在 <a href=\"https://arxiv.org/abs/2601.10029\" target=\"_blank\" rel=\"noopener\"><strong>arXiv</strong></a> 发布了智能体强化学习算法 <strong>PSPO</strong>，并在 <strong>PaperScout</strong> 论文检索智能体上进行验证：<strong>“PaperScout: An Autonomous Agent for Academic Paper Search with Process-Aware Sequence-Level Policy Optimization”</strong>。",
            "news.dasfaa2026Paper": "<strong>[2026 年 1 月]</strong> 🎉 祝贺 <strong>Li Li</strong> 的论文被 <strong>DASFAA 2026</strong> 录用！",
            "news.iclr2026Paper": "<strong>[2026 年 1 月]</strong> 🎉 祝贺 <strong>Qingyang Mao</strong> 和 <strong>Zirui Liu</strong>，我们的论文被 <strong>ICLR 2026</strong> 录用！",
            "news.ijcai2026SPC": "<strong>[2026 年 1 月]</strong> 🎉 我即将担任 <strong>IJCAI 2026</strong> 的<strong>高级程序委员会委员（SPC）</strong>。",
            "news.www2026Paper": "<strong>[2026 年 1 月]</strong> 🎉 祝贺 <strong>Huajian Zhang</strong>、<strong>Shuo Yu</strong>、<strong>Qingchuan Li</strong> 和 <strong>Zhiding Liu</strong>，我们的论文被 <strong>WWW 2026</strong> 录用！",
            "news.smc2026AE": "<strong>[2025 年 12 月]</strong> 🎉 我即将担任 <strong>IEEE SMC 2026</strong> 的<strong>副编辑（AE）</strong>。",
            "news.tist2025Paper": "<strong>[2025 年 11 月]</strong> 🎉 祝贺 <strong>Xiaoyu Tao</strong> 的论文被 <strong>ACM Transactions on Intelligent Systems and Technology（ACM TIST）</strong> 录用！",
            "news.aaai2026Paper": "<strong>[2025 年 11 月]</strong> 🎉 祝贺 <strong>Qingchuan Li</strong> 和 <strong>Yupeng Li</strong>，我们的论文被 <strong>AAAI 2026</strong> 录用！",
            "news.wsdm2026Paper": "<strong>[2025 年 10 月]</strong> 🎉 祝贺 <strong>Chuang Jiang</strong>、<strong>Jiahao Wang</strong> 及合作者，我们的论文被 <strong>ACM WSDM 2026</strong> 录用！",
            "news.neurips2025Paper": "<strong>[2025 年 9 月]</strong> 🎉 祝贺 <strong>Zhiding Liu</strong> 的论文被 <strong>NeurIPS 2025</strong> 录用！",
            "news.cikm2025Paper": "<strong>[2025 年 8 月]</strong> 🎉 祝贺 <strong>Shuo Yu</strong> 和 <strong>Jiahao Wang</strong>，我们的论文被 <strong>CIKM 2025</strong> 录用！",
            "news.recsys2025Paper": "<strong>[2025 年 7 月]</strong> 🎉 祝贺 <strong>Mingfan Pan</strong> 和 <strong>Yue Chen</strong>，我们的论文被 <strong>RecSys 2025</strong> 录用！",
            "news.chemtableRelease": "<strong>[2025 年 6 月]</strong> 📊 我们发布了 <strong>ChemTable</strong>，一个用于评测多模态大模型在真实化学表格上表现的大规模数据集与基准。<a href=\"https://github.com/ustc-ai4science/ChemTable\" target=\"_blank\" rel=\"noopener\">[GitHub]</a> <a href=\"https://arxiv.org/abs/2506.11375\" target=\"_blank\" rel=\"noopener\">[arXiv]</a>",
            "news.timeR1Release": "<strong>[2025 年 6 月]</strong> 🚀 我们发布了 <strong>Time-R1</strong>，首个采用强化微调的时间序列推理模型。详见 <a href=\"https://github.com/lqzxt/Time-R1\" target=\"_blank\" rel=\"noopener\">GitHub 项目</a>。",
            "news.acl2025Paper": "<strong>[2025 年 5 月]</strong> 🎉 祝贺 <strong>Jie Ouyang</strong> 和 <strong>Junhao Yu</strong>，我们的论文被 <strong>ACL 2025</strong> 录用！",
            "news.icml2025Paper": "<strong>[2025 年 5 月]</strong> 🎉 祝贺 <strong>Daoyu Wang</strong> 和 <strong>Zirui Liu</strong>，我们的论文被 <strong>ICML 2025</strong> 录用！",
            "news.ijcai2025Paper": "<strong>[2025 年 4 月]</strong> 🎉 祝贺 <strong>Jintao Zhang</strong>、<strong>Yitong Zhou</strong> 和 <strong>Hao Zhang</strong>，我们的论文被 <strong>IJCAI 2025</strong> 录用！",
            "news.tsfSurveyPreprint": "<strong>[2025 年 4 月]</strong> 📄 我们在 <a href=\"https://www.techrxiv.org/doi/full/10.36227/techrxiv.174430535.53879341\" target=\"_blank\" rel=\"noopener\">TechRxiv</a> 发布了综述预印本：<strong>A Comprehensive Survey of Time Series Forecasting</strong>。",
            "news.tableSurveyPreprint": "<strong>[2025 年 4 月]</strong> 📄 我们的综述 <strong>A Survey on Table Mining with Large Language Models</strong> 已在 <a href=\"https://www.techrxiv.org/doi/full/10.36227/techrxiv.174352282.22844759\" target=\"_blank\" rel=\"noopener\">TechRxiv</a> 发布。",
            "news.agentR1Release": "<strong>[2025 年 3 月]</strong> 🚀 我们的 <strong>Agent R1</strong> 项目已在 <a href=\"https://github.com/AgentR1/Agent-R1\" target=\"_blank\" rel=\"noopener\">GitHub</a> 正式发布。",
            "news.ragSurveyPreprint": "<strong>[2025 年 3 月]</strong> 📄 我们的综述 <strong>A Survey on Knowledge-Oriented Retrieval-Augmented Generation</strong> 已在 <a href=\"https://arxiv.org/pdf/2503.10677\" target=\"_blank\" rel=\"noopener\">arXiv</a> 发布。",
            "news.ascend2024Award": "<strong>[2024 年 12 月]</strong> 🏆 祝贺我们的学生在 2024 年<strong>昇腾人工智能创新大赛</strong>全国总决赛中获得<strong>金奖</strong>！"
          }
        },
        'publications.html': {
          title: '论文发表',
          subtitle: '程明月的完整论文列表。（* 通讯作者，+ 共同一作）',
          subtitleHtml: '<a href="index.html">程明月</a>的完整论文列表。（* 通讯作者，<sup>+</sup> 共同一作）',
          content: {
            "pub.jumpLegacy": "2023 年及以前",
            "pub.jumpPreprint": "预印本",
            "pub.jumpLabel": "按年份浏览：",
            'pub.filterAll': '全部',
            'pub.filterReasoning': '大模型推理',
            'pub.filterAgent': '大模型智能体',
            'pub.filterStructured': '结构化数据挖掘',
            'pub.filterTime': '时间序列分析',
            'pub.filterTable': '表格挖掘',
            'pub.filterKnowledge': '科学智能',
            'pub.filterRec': '推荐系统',
            'pub.note': '（* 通讯作者，<sup>+</sup> 共同一作）',
            "pub.preprint": "预印本",
            "pub.year2027": "2027",
            "pub.year2026": "2026",
            "pub.year2025": "2025",
            "pub.year2024": "2024",
            "pub.legacy": "2023 年及以前",
            'pub.filterLabel': '按研究方向筛选：'
          }
        },
        'projects.html': {
          title: '开源项目与评测基准',
          subtitle: '面向大模型推理与智能体、时序智能和科学智能的开源框架、工具、评测基准与数据集。',
          content: {
            "datasets.topicRag": "检索增强生成",
            "datasets.topicSearch": "搜索推荐",
            "datasets.topicLiterature": "科技文献挖掘",
            "datasets.hohKicker": "RAG 评测 · 动态基准",
            "datasets.kuaiSearchKicker": "电商搜索 · 从召回到相关性",
            "datasets.chemTableKicker": "科学智能 · 化学表格",
            "datasets.paperArenaKicker": "科学文献 · 智能体评测",
            "datasets.hoh": "<strong>HoH：评估过时信息对 RAG 影响的动态基准</strong>，研究知识过时如何影响检索增强生成系统。它提供动态评测环境，用于衡量<strong>时间鲁棒性</strong>、<strong>对过时信息的敏感性</strong>，以及知识时效性对现代 <strong>RAG</strong> 流程的影响。",
            "datasets.kuaiSearch": "<strong>KuaiSearch</strong> 是面向<strong>召回、排序与相关性</strong>的大规模电商搜索数据集，基于快手真实用户搜索交互构建。数据集保留真实用户查询与自然语言商品文本，覆盖<strong>冷启动用户</strong>和<strong>长尾商品</strong>，并贯穿现代搜索系统的<strong>召回</strong>、<strong>排序</strong>和<strong>相关性判断</strong>三个阶段。",
            "datasets.chemTable": "<strong>ChemTable</strong> 是从真实化学文献整理的评测基准，用于评估多模态大模型的<strong>化学表格识别与理解</strong>能力。它支持<strong>表格识别</strong>与<strong>表格理解</strong>两项核心任务，并提供单元格多边形、逻辑布局以及试剂、催化剂、产率和图形元素等化学语义标签的专家标注。",
            "datasets.paperArena": "<strong>PaperArena：面向科学文献的工具增强智能体推理评测基准</strong>，评估智能体借助工具开展科学阅读与推理的能力，覆盖科学论文及相关学术工作流中的<strong>文献理解</strong>、<strong>工具增强推理</strong>与<strong>基于证据的评测</strong>。",
            "opensource.codeForthcoming": "代码待发布",
            'systems.heading': '系统产品',
            'systems.brand': '科言 · 科学智能',
            'systems.lewen': '面向科学文献智能获取，支持快速搜索与深度检索。',
            'systems.wenxiu': '面向学术写作，提供智能润色、批阅纠错与语言翻译工具。',
            'systems.visit': '访问系统',
            'opensource.heading': '开源项目',
            'opensource.agentR1': '<span class="os-inline-highlight">Agent-R1</span> 是面向 <strong>Agentic RL 的统一模块化训练框架</strong>。它将每一轮 Agent 交互建模为<strong>步级强化学习转移（step-level RL transition）</strong>，并解耦<strong>轨迹表示、上下文构造、环境接口与优化算法</strong>，使 <strong>GRPO、PPO</strong> 等算法能够在<strong>同一多轮 Agent 训练底座</strong>上进行比较与扩展。',
            'opensource.clawR1': '<span class="os-inline-highlight">Claw-R1</span> 为 <strong>Agentic RL</strong> 提供<strong>数据基础设施（Data Foundation）</strong>，用于系统化地从<strong>多样 Agent 交互</strong>中<strong>收集、评估与策划高质量训练数据</strong>。它在 <strong>Agent Side</strong> 与 <strong>Training Side</strong> 之间引入由 <strong>Gateway + DataPool</strong> 构成的<strong>中间件层（Middleware Layer）</strong>，专注于<strong>数据基础设施</strong>，而非训练算法本身。',
            'opensource.castClaw': '<span class="os-inline-highlight">CastClaw（星辰）</span> 是面向<strong>时间序列预测研究</strong>的<strong>人机协同智能体框架</strong>。CastClaw 通过 <strong>Planner、Forecaster、Critic</strong> 三个专属智能体编排完整预测流程，并在<strong>关键节点引入人类确认</strong>，将<strong>数据分析、特征工程与经典时序模型能力</strong>封装为<strong>可扩展的运行时工具箱</strong>。',
            "opensource.castMind": "<span class=\"os-inline-highlight\">CastMind（星思）</span> 是探索<strong>情境推理驱动的复杂系统时序推演</strong>的<strong>研究项目</strong>。项目研究如何结合<strong>历史序列、外部情境与领域知识</strong>，通过<strong>“外推—理解—推演—修正”</strong>流程支持预测修正与机制解释。<strong>公开代码待发布。</strong>",
            'opensource.paperScout': '<span class="os-inline-highlight">PaperScout</span> 是面向<strong>复杂科研问题</strong>的<strong>自主科学文献检索智能体</strong>。它将论文检索建模为<strong>多轮序贯决策过程</strong>，依据已获取的文献与检索历史，自主选择 <strong>Search</strong> 发现候选论文，或通过 <strong>Expand</strong> 沿参考文献扩展搜索。结合<strong>过程感知的序列级强化学习优化（PSPO）</strong>，PaperScout 利用中间检索反馈持续调整策略，筛选满足<strong>研究主题与条件约束</strong>的相关文献。',
            'opensource.academicSearch': '<span class="os-inline-highlight">Academic Search</span> 是面向 <strong>Codex、Claude Code 等智能体</strong>的<strong>科学文献检索与元数据整理 Skill</strong>。它整合 <strong>arXiv、Semantic Scholar、OpenAlex、Google Scholar、CNKI</strong> 等学术来源，支持<strong>查询扩展、引用追踪、记录校验、跨源去重与 BibTeX 导出</strong>，并按需获取<strong>开放获取全文</strong>。通过<strong>学科感知的检索策略</strong>与<strong>来源和访问状态记录</strong>，为文献综述和科研调研提供可追溯的文献资料。',
            'opensource.category.agents': '大模型与智能体',
            'opensource.category.timeseries': '时序智能（科语）',
            'opensource.category.science': 'Science Intelligence（Scientific Tool and Knowledge）',
            'datasets.heading': '基准与数据集',
            'datasets.category.science': '科学智能（科学工具与知识）',
            'datasets.category.timeseries': '时序智能（Context-aware Time Series Forecasting）',
            'datasets.category.retrieval': '检索推荐',
            'datasets.world2ts': '<span class="os-inline-highlight">World2TS</span> 是面向<strong>事件情境感知时序预测</strong>的<strong>人工审核数据集</strong>。它将<strong>六类领域的时间序列</strong>与相关<strong>真实世界事件</strong>关联，保留<strong>事件描述、时间元数据与来源证据</strong>，支持<strong>情境感知预测</strong>与<strong>外部事件的证据驱动推理</strong>研究。',
            'datasets.world2tsKicker': '时序智能 · 真实世界事件情境',
            'opensource.webMind': '<span class="os-inline-highlight">WebMind</span> 是面向<strong>智能体</strong>的<strong>网页任务 Skill</strong>，在<strong>独立、持久化的浏览器环境</strong>中完成检索、阅读、导航与交互，支持<strong>截图、鼠标键盘操作和可复用的本地经验</strong>。它<strong>无需登录 Google</strong>，默认不使用日常 Chrome 配置中的个人数据，适用于<strong>主题调研、信息采集与可重复的网页工作流</strong>。',
            'opensource.tabClaw': '<span class="os-inline-highlight">TabClaw</span> 是面向<strong>复杂真实表格数据</strong>的开源智能体框架。它将任务分解为<strong>结构化子目标</strong>，结合<strong>代码执行、模式感知检索与公式工具</strong>，通过<strong>多步决策流程</strong>完成推理，支持<strong>多跳连接、条件聚合与跨表推断</strong>，服务于企业数据分析与科学表格理解。',
            'opensource.castFactory': '<span class="os-inline-highlight">CastFactory（炼星坊）</span> 是面向<strong>大模型驱动的时间序列预测模型训练</strong>的开源框架。它提供覆盖<strong>持续预训练（CPT）、监督微调（SFT）与强化学习（RL）</strong>的统一工作流，降低构建、适配、优化与评测时序预测模型的工程成本。',
            'opensource.neoResearch': '<span class="os-inline-highlight">NeoResearch（智多星）</span> 是面向<strong>时间序列预测模型研发</strong>的自主科研智能体系统。它将研究假设生成、候选方案搜索、受控实验、评测诊断与科研记忆连接为<strong>可复现的闭环</strong>，支持从问题定义到候选预测模型验证的系统化迭代。'
          }
        },
        'awards.html': {
          content: {
            "award.hongzhuan": "中国科学技术大学红专青年人才",
            "award.wsdm2025": "Best of WSDM 2025（优秀论文奖）",
            "award.ascend2024": "昇腾人工智能创新大赛全国总决赛金奖（指导教师）",
            "award.kddcup2024": "KDD Cup 2024 Task 2 与 Task 3 亚军",
            "award.eagle2024": "中国科学技术大学雄鹰创新创业基金（指导教师）",
            "award.innovation2023": "2023年中国国际大学生创新大赛国家级银奖（教育部）",
            "award.internetPlus2023": "全国“互联网+”大学生创新创业大赛安徽省金奖（安徽省教育厅）",
            "award.graduate2023": "中国科学技术大学优秀毕业生",
            "award.innovation2022": "2022年中国科学技术大学“创新创业”基金",
            "award.goldenSeed2021": "“创青春”中国青年创新创业项目支持——大学生创业“金种子”计划（团中央）",
            "award.scholarship2021": "博士研究生国家奖学金（教育部）",
            "grant.ongoing": "在研",
            "grant.upcoming": "即将开始",
            "grant.completed": "执行期已结束",
            "grant.industrial": "产业支持",
            "grant.industrySupport": "研究工作得到科大讯飞、华为、腾讯与快手的部分产业项目资助。"
          },
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
          subtitle: "代表性程序委员会、会议组织、期刊审稿与学术共同体服务。",
          content: {
            "service.icdmTutorialRole": "教程组织者与讲者",
            "service.icdmTutorialName": "IEEE ICDM 2026 产业教程：情境感知时间序列预测",
            "service.fedkddChair": "程序委员会主席",
            "service.fedkddName": "FedKDD/FedMAS 研讨会，与 KDD 2026 同期举办",
            "service.journal.computers": "计算机学报",
            "service.journal.software": "软件学报",
            "service.ijcaiSPC": "高级程序委员会委员 2026",
            "service.icmlAreaChair": "领域主席 2027",
            'service.conferenceOrganization': '会议组织任职',
            'service.icebePublicationChair': '出版主席',
            'service.iclrAreaChair': '领域主席 2027',
            'service.wwwAreaChair': '领域主席 2027',
            "service.pc": "程序委员会服务",
            'service.journal': '期刊审稿人',
            'service.organizations': '学术组织任职',
            'service.ieeeDeal': 'IEEE 数据高效智能体学习工作组（DEAL）',
            'service.ieeeAi4tst': 'IEEE 时间序列与时空数据人工智能工作组（AI4TST）',
            'service.ccfAipr': '中国计算机学会人工智能与模式识别专业委员会 — 执行委员',
            'service.cipsIr': '中国中文信息学会信息检索专业委员会 — 通讯委员'
          }
        },
        'resources.html': {
          content: {
            "resource.ccfTitle": "第七版中国计算机学会推荐国际学术会议和期刊目录（正式版）",
            "resource.degreeTitle": "中国科学技术大学信息与智能学部研究生学位授予标准（2020版）"
          },
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
    setText('.footer-bottom', (pack.pages[pageName()] || {}).footer || pack.common.footer);
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

      if (page.join) {
        setHtml('#research-contact-note', page.join);
      }
    }

    navTargets.forEach(([href, key]) => {
      document.querySelectorAll(`.footer-link[href="${href}"]`).forEach((link) => {
        link.textContent = pack.nav[key];
      });
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
