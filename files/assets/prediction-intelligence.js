(function () {
  const translations = {
    en: {
      documentTitle: 'Prediction Intelligence — Mingyue Cheng',
      eyebrow: 'Research Framework',
      heroTitle: 'Prediction Intelligence',
      heroLead:
        'Forecasting systems should do more than generate predictions. They should understand whether a task is predictable, diagnose why forecasts fail, select how to strengthen weak links, and know when deeper machine reasoning or human participation is required.',
      frameworkLabel: 'PDEC Research Framework',
      frameworkPath: 'From task understanding to trustworthy action',
      pTitle: 'Predictability Analysis',
      pQuestion: 'Where and when is forecasting difficult?',
      dTitle: 'Failure Diagnosis',
      dQuestion: 'Why does the model fail?',
      eTitle: 'Adaptive Enhancement',
      eQuestion: 'How can the weakness be repaired?',
      cTitle: 'Risk Calibration',
      cQuestion: 'When should the system trust, reason, defer, or collaborate?',
      shiftKicker: 'Research Objective',
      shiftTitle: 'From Forecast Generation to Predictive Intelligence',
      shiftBody:
        'For complex systems, an effective forecasting system must reason about task predictability before modeling, diagnose the root cause of failure after evaluation, repair the specific capability gap, and calibrate both forecast risk and decision responsibility before acting.',
      stagesKicker: 'PDEC Framework',
      stagesTitle: 'Four Layers of Prediction Intelligence',
      stagesSummary:
        'Each layer answers a distinct research question and produces an explicit signal for the next decision.',
      pBody:
        'Characterize how forecastability varies across entities, horizons, regimes, and contexts before choosing a forecasting strategy.',
      pSignal1: 'Entity- and group-level heterogeneity',
      pSignal2: 'Horizon- and regime-dependent difficulty',
      pSignal3: 'Context-specific uncertainty and risk',
      outputLabel: 'Research output',
      pOutput: 'Predictability map',
      dBody:
        'Attribute forecast failure to insufficient historical support, missing context, model capability gaps, or irreducible uncertainty.',
      dSignal1: 'Data support and distribution shift',
      dSignal2: 'Missing events, knowledge, or environment signals',
      dSignal3: 'Representation, reasoning, or adaptation limits',
      dOutput: 'Root-cause attribution',
      eBody:
        'Repair the diagnosed weakness through retrieval, context and knowledge integration, tool-augmented reasoning, transfer, or task-specific adaptation.',
      eSignal1: 'Retrieve analogous history and external evidence',
      eSignal2: 'Integrate context, knowledge, and causal clues',
      eSignal3: 'Escalate model capacity only when necessary',
      eOutput: 'Targeted capability repair',
      cBody:
        'Calibrate forecast risk and result reliability, then route each task to the least complex decision process that remains sufficiently trustworthy.',
      cSignal1: 'Confidence, calibration, and selective prediction',
      cSignal2: 'Cost-aware machine reasoning and model collaboration',
      cSignal3: 'Human participation for consequential uncertainty',
      cOutput: 'Reliability-aware routing',
      weaknessKicker: 'Failure Taxonomy',
      weaknessTitle: 'Diagnose the Weak Link Before Adding Complexity',
      weakHistoryTitle: 'Historical Support Gap',
      weakHistoryBody: 'Sparse observations, short histories, rare regimes, or weak analogical support.',
      weakContextTitle: 'Context Gap',
      weakContextBody: 'Missing events, policies, environment changes, domain knowledge, or user intent.',
      weakModelTitle: 'Capability Gap',
      weakModelBody: 'Insufficient representation, reasoning, transfer, adaptation, or tool-use capability.',
      weakRandomTitle: 'Irreducible Uncertainty',
      weakRandomBody: 'Intrinsic randomness or unobserved drivers that cannot be repaired by a larger model.',
      routingKicker: 'Decision Policy',
      routingTitle: 'Risk-Aware Decision Routing',
      routingSummary:
        'Match reasoning cost and human involvement to forecast difficulty, risk, and calibrated reliability.',
      riskLow: 'Routine / lower risk',
      riskHigh: 'Consequential / higher risk',
      routeSmallTitle: 'Small-Model Forecasting',
      routeSmallBody: 'Use efficient specialized models when evidence is sufficient and reliability is high.',
      routeToolTitle: 'Tool-Augmented Reasoning',
      routeToolBody: 'Retrieve evidence, call domain tools, or run structured analyses for repairable gaps.',
      routeLlmTitle: 'LLM Collaboration',
      routeLlmBody: 'Invoke deeper semantic reasoning and model collaboration for complex contexts.',
      routeHumanTitle: 'Human-in-the-Loop Decision',
      routeHumanBody: 'Defer consequential, ambiguous, or poorly calibrated cases to human judgment.',
      routeGate: 'If reliability remains below the decision threshold, abstain, escalate, or request human review.',
      outcomeKicker: 'Research Destination',
      outcomeTitle: 'Interpretable Forecasting & Trustworthy Decision Support',
      outcomeBody:
        'Prediction Intelligence turns a forecast into an accountable process: the system explains what is predictable, why it may fail, how it was strengthened, and why a particular machine or human decision path was selected.'
    },
    zh: {
      documentTitle: '预测智能 — 程明月',
      eyebrow: '研究框架',
      heroTitle: '预测智能',
      heroLead:
        '未来预测系统不应仅学习如何生成预测，而应理解任务是否可预测、诊断预测为何失败、选择如何增强预测，并知道何时需要更复杂的机器推理或人类参与。',
      frameworkLabel: 'PDEC 研究框架',
      frameworkPath: '从认识任务到可信行动',
      pTitle: '可预测性分析',
      pQuestion: '哪些对象、时期和情境难以预测？',
      dTitle: '失败诊断',
      dQuestion: '模型为何预测失败？',
      eTitle: '自适应增强',
      eQuestion: '如何修复预测薄弱环节？',
      cTitle: '风险校准',
      cQuestion: '系统何时应信任、推理、转交或协作？',
      shiftKicker: '研究目标',
      shiftTitle: '从生成预测走向预测智能',
      shiftBody:
        '面向复杂系统，预测系统需要在建模前分析任务可预测性，在评测后诊断失败根因，针对具体能力缺口进行增强，并在采取行动前共同校准预测风险与决策责任。',
      stagesKicker: 'PDEC 框架',
      stagesTitle: '预测智能的四个层次',
      stagesSummary: '每一层回答一个独立的研究问题，并为下一步决策产生明确的依据。',
      pBody: '分析不同对象、预测时域、运行状态和情境下的可预测性差异，再选择合适的预测策略。',
      pSignal1: '对象与群体层面的异质性',
      pSignal2: '预测时域与运行状态相关的难度',
      pSignal3: '特定情境下的不确定性与风险',
      outputLabel: '研究输出',
      pOutput: '可预测性地图',
      dBody: '将预测失败归因于历史支持不足、情境缺失、模型能力不足或不可约的不确定性。',
      dSignal1: '数据支持不足与分布变化',
      dSignal2: '事件、知识或环境信号缺失',
      dSignal3: '表征、推理或适应能力受限',
      dOutput: '失败根因归因',
      eBody: '根据诊断结果，通过检索、情境与知识融合、工具增强推理、迁移或任务自适应修复薄弱环节。',
      eSignal1: '检索相似历史与外部证据',
      eSignal2: '融合情境、知识与因果线索',
      eSignal3: '仅在必要时提升模型能力',
      eOutput: '针对性能力增强',
      cBody: '校准预测风险与结果可靠性，将任务动态路由至能够满足可信要求的最低复杂度决策流程。',
      cSignal1: '置信度、校准与选择性预测',
      cSignal2: '成本感知的机器推理与模型协作',
      cSignal3: '面向高影响不确定性的人类参与',
      cOutput: '可靠性感知路由',
      weaknessKicker: '失败分类',
      weaknessTitle: '先诊断薄弱环节，再增加系统复杂度',
      weakHistoryTitle: '历史支持缺口',
      weakHistoryBody: '观测稀疏、历史过短、罕见状态或缺少可类比的历史支持。',
      weakContextTitle: '情境信息缺口',
      weakContextBody: '缺少事件、政策、环境变化、领域知识或用户意图。',
      weakModelTitle: '模型能力缺口',
      weakModelBody: '表征、推理、迁移、适应或工具使用能力不足。',
      weakRandomTitle: '不可约不确定性',
      weakRandomBody: '内在随机性或不可观测驱动因素，无法仅通过扩大模型解决。',
      routingKicker: '决策策略',
      routingTitle: '风险感知的决策路由',
      routingSummary: '根据预测难度、风险与校准后的可靠性，匹配推理成本和人类参与程度。',
      riskLow: '常规任务 / 较低风险',
      riskHigh: '高影响任务 / 较高风险',
      routeSmallTitle: '小模型直接预测',
      routeSmallBody: '当证据充分且可靠性较高时，使用高效的专业预测模型。',
      routeToolTitle: '工具增强推理',
      routeToolBody: '针对可修复缺口，检索证据、调用领域工具或执行结构化分析。',
      routeLlmTitle: '大模型协作',
      routeLlmBody: '面向复杂情境，触发更深入的语义推理与多模型协作。',
      routeHumanTitle: '人机联合决策',
      routeHumanBody: '将高影响、歧义或校准不足的情形转交人类判断。',
      routeGate: '若可靠性仍低于决策阈值，系统应拒绝预测、升级处理或请求人类复核。',
      outcomeKicker: '研究目标',
      outcomeTitle: '可解释预测与可信决策辅助',
      outcomeBody:
        '预测智能将单一预测结果转化为可问责的过程：系统能够解释什么可预测、为何可能失败、如何完成增强，以及为何选择特定的机器或人类决策路径。'
    }
  };

  function applyStoredLanguage() {
    const lang = localStorage.getItem('homepage-language') === 'zh' ? 'zh' : 'en';
    const pack = translations[lang];

    document.title = pack.documentTitle;
    document.querySelectorAll('[data-pi-i18n]').forEach(function (node) {
      const key = node.getAttribute('data-pi-i18n');
      if (pack[key]) node.textContent = pack[key];
    });
  }

  function initializePredictionPage() {
    applyStoredLanguage();
    const toggle = document.getElementById('languageToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        window.setTimeout(applyStoredLanguage, 0);
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePredictionPage);
  } else {
    initializePredictionPage();
  }
})();
