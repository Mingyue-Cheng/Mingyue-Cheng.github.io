(function () {
  const translations = {
    en: {
      nav: {
        logo: 'Homepage',
        research: 'Research',
        news: 'News',
        publications: 'Publications',
        projects: 'Open Source',
        awards: 'Award',
        service: 'Service'
      },
      common: {
        back: '← Back to Homepage',
        contact: 'Contact',
        scholar: 'Google Scholar'
      },
      pages: {
        'research.html': {
          title: 'Research Interests',
          subtitle: 'My research develops cognitive intelligence methods for complex data mining, centered on LLMs and Agentic AI, with a methodological focus on context representation and reasoning, and driven by Time Series Cognition and Scientific Knowledge Cognition.',
          labels: ['Primary Research Directions', 'Broader Application and Evaluation Scenarios'],
          collections: 'Research collections:',
          join: 'Welcome motivated undergraduate and graduate students to join the State Key Laboratory of Cognitive Intelligence <a href="https://ustcagi.github.io/" target="_blank" rel="noopener">USTC-AGentic Intelligence（AGI） Group</a>.'
        },
        'news.html': {
          title: 'News & Updates',
          subtitle: "Latest news from Mingyue Cheng's research group at USTC."
        },
        'publications.html': {
          title: 'Publications',
          subtitle: 'Selected preprints, conference papers, journal articles, and research outputs.'
        },
        'projects.html': {
          title: 'Open Source',
          subtitle: 'Selected systems, datasets, benchmarks, and open-source projects.'
        },
        'awards.html': {
          title: 'Honors & Awards',
          subtitle: 'Selected honors, awards, and research grants received by Mingyue Cheng.',
          headings: ['Honors and Awards', 'Research Grants']
        },
        'service.html': {
          title: 'Professional Service',
          subtitle: 'Selected program committee service, journal reviewing, teaching, and academic community contributions.'
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
        service: '服务'
      },
      common: {
        back: '← 返回主页',
        contact: '联系我',
        scholar: 'Google Scholar'
      },
      pages: {
        'research.html': {
          title: '研究兴趣',
          subtitle: '我的研究主要面向复杂数据挖掘中的认知智能方法，以 LLMs and Agentic AI 为核心，并围绕 Time Series Cognition 与 Scientific Knowledge Cognition 展开。',
          labels: ['主要研究方向', '应用与评测场景'],
          collections: '研究主页：',
          join: '欢迎脚踏实地而又积极主动的本科生、研究生同学加入认知智能全国重点实验室 <a href="https://ustcagi.github.io/" target="_blank" rel="noopener">USTC-AGentic Intelligence（AGI）Group</a>。'
        },
        'news.html': {
          title: '最新动态',
          subtitle: '程明月在中国科学技术大学研究团队的最新动态。'
        },
        'publications.html': {
          title: '论文发表',
          subtitle: '代表性预印本、会议论文、期刊论文与研究成果。'
        },
        'projects.html': {
          title: '开源项目',
          subtitle: '代表性系统、数据集、基准与开源项目。'
        },
        'awards.html': {
          title: '荣誉奖励',
          subtitle: '程明月获得的代表性荣誉、奖励与科研项目支持。',
          headings: ['荣誉奖励', '科研项目']
        },
        'service.html': {
          title: '学术服务',
          subtitle: '代表性程序委员会、期刊审稿、教学与学术共同体服务。'
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
    ['service.html', 'service']
  ];

  function pageName() {
    const name = window.location.pathname.split('/').pop();
    return name || 'index.html';
  }

  function setText(selector, value) {
    const node = document.querySelector(selector);
    if (node && value) node.textContent = value;
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
      setText('.pub-hero-sub', page.subtitle);

      if (page.labels) {
        document.querySelectorAll('.rd-section-label, .scenario-section-label').forEach((node, index) => {
          if (page.labels[index]) node.textContent = page.labels[index];
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
          const links = Array.from(note.querySelectorAll('a')).map((link) => link.outerHTML);
          note.innerHTML = `${page.collections} ${links.join(' · ')}`;
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

    header.classList.add('js-mobile-nav');
    toggle.setAttribute('aria-controls', 'primary-nav');
    toggle.addEventListener('click', function () {
      const isOpen = header.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', String(isOpen));
    });
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
