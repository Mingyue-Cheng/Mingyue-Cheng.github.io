(function () {
  const translations = {
    en: {
      nav: {
        logo: 'Homepage',
        research: 'Research',
        news: 'News',
        publications: 'Publications',
        projects: 'Open Source',
        awards: 'Awards',
        service: 'Service',
        resources: 'Resources'
      },
      common: {
        back: '← Back to Homepage',
        contact: 'Contact',
        scholar: 'Google Scholar'
      },
      pages: {
        'research.html': {
          title: 'Research Interests',
          subtitle: 'My research develops cognitive intelligence methods for complex data mining, centered on LLMs and Agentic AI, and driven by the dual foundations of time-series observations and scientific knowledge. My methodological focus lies in context representation and reasoning, aiming to build predictive intelligence for complex systems through multimodal semantic understanding, slow-thinking temporal reasoning, and autonomous agentic interaction.',
          labels: ['Research Vision', 'Core Technical Pillars', 'Application Domains and Evaluation Scenarios'],
          scenarios: {
            visionTitle: 'Prediction Intelligence',
            visionBody: 'Building <strong>context-aware</strong>, <strong>reasoning-driven</strong>, and <strong>uncertainty-aware predictive intelligence</strong> for <strong>complex and evolving systems</strong>, enabling <strong>explainable forecasting</strong> and <strong>trustworthy decision support</strong>.',
            agentTitle: 'LLMs and Agentic AI',
            agentBody: 'Developing <strong>autonomous interactive learning</strong> for large language models, including <strong>environment-interactive Agentic RL</strong>, <strong>tool-augmented reasoning</strong>, <strong>multi-agent orchestration</strong>, and continual capability evolution through context, knowledge, and memory.',
            timeseriesTitle: 'Time Series Intelligence',
            timeseriesBody: 'Developing <strong>context-aware predictive intelligence</strong>, with a focus on <strong>multimodal context representation</strong>, <strong>slow-thinking reasoning</strong>, <strong>uncertainty-aware forecasting</strong>, and <strong>autonomous agentic interaction</strong>.',
            scienceTitle: 'AI for Science',
            scienceBody: 'Scientific data and knowledge intelligence for literature mining, scientific modeling, reasoning, and autonomous discovery.',
            industrialTitle: 'Industrial Systems',
            industrialBody: 'Predictive intelligence for real-world complex systems, including energy, traffic, cloud services, finance, and industrial operations.',
            userTitle: 'Recommender Systems',
            userBody: 'Adaptive user intelligence and personalized recommendation through behavior understanding, preference modeling, and contextual reasoning.'
          },
          collections: 'Research collections: 🤖 <a href="https://agentr1.github.io/" target="_blank" rel="noopener">LLMs and Agentic AI</a> · 📊 <a href="https://ustc-time-series.github.io/" target="_blank" rel="noopener">Time Series Intelligence</a> · 📚 <a href="https://ustcagi-sci.github.io/" target="_blank" rel="noopener">Science Intelligence</a>',
          join: '欢迎脚踏实地而又积极主动的本科生、研究生同学加入认知智能全国重点实验室 <a href="https://ustcagi.github.io/" target="_blank" rel="noopener">USTC-AGI Group</a>。'
        },
        'news.html': {
          title: 'News & Updates',
          subtitle: 'Latest news from USTC AGI Research Group.'
        },
        'publications.html': {
          title: 'Publications',
          subtitle: 'Full publication list of Mingyue Cheng. (* Corresponding Author, + Equal Contribution)',
          subtitleHtml: 'Full publication list of <a href="index.html">Mingyue Cheng</a>. (* Corresponding Author, <sup>+</sup> Equal Contribution)'
        },
        'projects.html': {
          title: 'Open Source',
          subtitle: 'Selected systems, datasets, benchmarks, and open-source projects.'
        },
        'awards.html': {
          title: 'Honors & Awards',
          subtitle: 'Selected honors, awards, and research grants received by Mingyue Cheng.',
          headings: ['Honors and Awards', 'Research Grants'],
          grants: {
            newGenerationAI: 'New-Generation Artificial Intelligence National Science and Technology Major Project; Scientific Data Governance Toolchain and Datasets — Chemistry; Core Project Member',
            casPriority: 'Chinese Academy of Sciences Strategic Priority Research Program for Basic and Interdisciplinary Frontier Research (Category B); Mechanisms and Methods for Autonomous Interactive Learning in Large Models; Project Lead',
            nsfc: 'National Natural Science Foundation of China — Young Scientists Fund (Category C); Cross-Domain Context-Aware Time Series Representation Learning and Forecasting; Project Lead',
            ustc: 'USTC New Medicine Joint Fund Cultivation Project (Double First-Class Discipline Development Special Program); Time Series Modeling Methods and Applications Using Perioperative Physiological Data; Project Partner Lead',
            anhui: 'Anhui Provincial Natural Science Foundation; Table Semantic Understanding and Reasoning for Scientific Literature; Project Lead',
            ustcYouth: 'USTC Youth Innovation Fund Project; Multi-Turn Interactive Learning and Continual Evolution for Large-Model Agents: Methods and Applications; Project Lead'
          }
        },
        'service.html': {
          title: 'Professional Service',
          subtitle: 'Selected program committee service, journal reviewing, teaching, and academic community contributions.'
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
        research: '研究',
        news: '动态',
        publications: '论文',
        projects: '开源',
        awards: '奖励',
        service: '服务',
        resources: '资源'
      },
      common: {
        back: '← 返回主页',
        contact: '联系我',
        scholar: 'Google Scholar'
      },
      pages: {
        'research.html': {
          title: '研究兴趣',
          subtitle: '我的研究面向复杂数据挖掘中的认知智能方法，以大语言模型与智能体 AI 为核心，并由时序观测和科学知识双重基础驱动。方法上聚焦情境表征与推理，通过多模态语义理解、慢思考时序推理与自主智能体交互，构建面向复杂系统的预测智能。',
          labels: ['研究愿景', '核心技术支柱', '应用领域与评测场景'],
          scenarios: {
            visionTitle: '预测智能',
            visionBody: '面向<strong>复杂演化系统</strong>，构建<strong>情境感知</strong>、<strong>推理驱动</strong>与<strong>不确定性感知的预测智能</strong>，实现<strong>可解释预测</strong>与<strong>可信决策辅助</strong>。',
            agentTitle: '大语言模型与智能体 AI',
            agentBody: '面向大语言模型研究<strong>自主交互学习</strong>，重点关注<strong>环境交互式 Agentic RL</strong>、<strong>工具增强推理</strong>、<strong>多智能体协同</strong>，以及基于情境、知识与记忆的持续能力演化。',
            timeseriesTitle: '时间序列智能',
            timeseriesBody: '发展<strong>情境感知预测智能</strong>，重点研究<strong>多模态情境表征</strong>、<strong>慢思考推理</strong>、<strong>不确定性感知预测</strong>与<strong>自主智能体交互</strong>。',
            scienceTitle: 'AI for Science',
            scienceBody: '面向科技文献挖掘、科学建模、科学推理与自主发现，研究科学数据与知识智能。',
            industrialTitle: '工业系统',
            industrialBody: '面向能源、交通、云服务、金融与工业运行等真实复杂系统，研究预测智能。',
            userTitle: '推荐系统',
            userBody: '通过用户行为理解、偏好建模与情境推理，研究自适应用户智能与个性化推荐。'
          },
          collections: '研究主页：🤖 <a href="https://agentr1.github.io/" target="_blank" rel="noopener">LLMs and Agentic AI</a> · 📊 <a href="https://ustc-time-series.github.io/" target="_blank" rel="noopener">Time Series Intelligence</a> · 📚 <a href="https://ustcagi-sci.github.io/" target="_blank" rel="noopener">Science Intelligence</a>',
          join: '欢迎脚踏实地而又积极主动的本科生、研究生同学加入认知智能全国重点实验室 <a href="https://ustcagi.github.io/" target="_blank" rel="noopener">USTC-AGI Group</a>。'
        },
        'news.html': {
          title: '最新动态',
          subtitle: 'USTC AGI Research Group 的最新动态。'
        },
        'publications.html': {
          title: '论文发表',
          subtitle: '程明月的完整论文列表。（* 通讯作者，+ 共同一作）',
          subtitleHtml: '<a href="index.html">程明月</a>的完整论文列表。（* 通讯作者，<sup>+</sup> 共同一作）'
        },
        'projects.html': {
          title: '开源项目',
          subtitle: '代表性系统、数据集、基准与开源项目。'
        },
        'awards.html': {
          title: '荣誉奖励',
          subtitle: '程明月获得的代表性荣誉、奖励与科研项目支持。',
          headings: ['荣誉奖励', '科研项目'],
          grants: {
            newGenerationAI: '新一代人工智能国家科技重大专项，科学数据治理工具链与数据集-化学领域，项目骨干',
            casPriority: '中国科学院基础与交叉前沿科研先导专项（B类），大模型自主交互学习机制及方法，项目负责人',
            nsfc: '国家自然科学基金青年科学基金C类，跨域情境感知的时间序列表征学习及预测方法，项目负责人',
            ustc: '中国科学技术大学新医学联合基金培育项目（双一流学科建设专项），基于围术期生理数据的时序建模方法及应用研究，项目方负责人',
            anhui: '安徽省自然科学基金，面向科技文献的表格语义理解与推理研究，项目负责人',
            ustcYouth: '中国科学技术大学青年创新基金项目，大模型智能体多轮交互学习与持续进化方法研究及应用，项目负责人'
          }
        },
        'service.html': {
          title: '学术服务',
          subtitle: '代表性程序委员会、期刊审稿、教学与学术共同体服务。'
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

      if (page.scenarios) {
        document.querySelectorAll('[data-page-i18n]').forEach((node) => {
          const key = node.getAttribute('data-page-i18n');
          if (page.scenarios[key]) node.innerHTML = page.scenarios[key];
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
