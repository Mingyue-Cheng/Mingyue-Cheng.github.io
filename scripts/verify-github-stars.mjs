import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import test from 'node:test';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const indexHtml = readFileSync(join(root, 'index.html'), 'utf8');
const projectsHtml = readFileSync(join(root, 'projects.html'), 'utf8');
const starScriptPath = join(root, 'files', 'assets', 'github-stars.js');
const publicHtmlSource = readdirSync(root)
  .filter((fileName) => fileName.endsWith('.html'))
  .map((fileName) => readFileSync(join(root, fileName), 'utf8'))
  .join('\n');

const expectedRepos = [
  'AgentR1/WebMind',
  'ustc-time-series/CastClaw',
  'ustc-time-series/CastMind',
  'ustc-time-series/CastFactory',
  'ustc-ai4science/academic-search',
  'AgentR1/PaperScout',
  'ustc-table-mining/TabClaw',
  'AgentR1/Claw-R1',
  'AgentR1/Agent-R1',
  'ustc-time-series/Future-Cast',
  'benchen4395/KuaiSearch',
  'ustc-ai4science/PaperArena',
  'ustc-ai4science/ChemTable',
  '0russwest0/HoH'
];

function visibleMarkup(source) {
  return source.replace(/<!--[\s\S]*?-->/g, '');
}

function extractMappings(source) {
  const mappings = [];
  const metaPattern = /<div class="(?:os-card-meta|dataset-card-meta)">([\s\S]*?)<\/div>/g;

  for (const match of visibleMarkup(source).matchAll(metaPattern)) {
    const meta = match[1];
    if (!meta.includes('github-stars')) continue;

    const githubLink = meta.match(
      /<a class="(?:os-github|dataset-repo-link)" href="(https:\/\/github\.com\/[^"/]+\/[^"/]+)"[^>]*>GitHub<\/a>/
    );
    const starLink = meta.match(
      /<a class="(os-stars|dataset-stars)" href="(https:\/\/github\.com\/[^"/]+\/[^"/]+\/stargazers)"([^>]*)>([\s\S]*?)<\/a>/
    );

    assert.ok(githubLink, `missing GitHub repository link in ${meta.trim()}`);
    assert.ok(starLink, `missing linked GitHub star count in ${meta.trim()}`);

    const starCount = starLink[4].match(
      /<span class="github-stars" data-repo="([^"]+)" data-stars="(\d+)">(\d+)<\/span>/
    );
    assert.ok(starCount, `missing star fallback data in ${meta.trim()}`);

    const repo = starCount[1];
    const githubRepo = new URL(githubLink[1]).pathname.slice(1);
    const stargazerRepo = new URL(starLink[2]).pathname.replace(/^\//, '').replace(/\/stargazers$/, '');

    assert.equal(githubRepo, repo, `GitHub link does not match data-repo for ${repo}`);
    assert.equal(stargazerRepo, repo, `stargazer link does not match data-repo for ${repo}`);
    assert.equal(starCount[2], starCount[3], `fallback count does not match visible text for ${repo}`);
    assert.match(
      starLink[3],
      new RegExp(`aria-label="${repo.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: ${starCount[2]} GitHub stars"`),
      `star link needs a static accessible name for ${repo}`
    );
    assert.match(starLink[4], /<span aria-hidden="true">⭐<\/span>/);

    mappings.push({
      repo,
      githubHref: githubLink[1],
      stargazersHref: starLink[2],
      fallback: Number(starCount[2])
    });
  }

  return mappings;
}

function loadStarScript() {
  assert.ok(existsSync(starScriptPath), 'missing shared GitHub star loader');
  return readFileSync(starScriptPath, 'utf8');
}

function createStarElement(repo, fallback) {
  const attributes = new Map();
  const linkAttributes = new Map();
  const link = {
    setAttribute(name, value) {
      linkAttributes.set(name, String(value));
    },
    getAttribute(name) {
      return linkAttributes.get(name) ?? null;
    }
  };

  return {
    dataset: { repo, stars: String(fallback) },
    textContent: String(fallback),
    link,
    setAttribute(name, value) {
      attributes.set(name, String(value));
    },
    getAttribute(name) {
      return attributes.get(name) ?? null;
    },
    closest(selector) {
      assert.equal(selector, 'a');
      return link;
    }
  };
}

function createRuntimeHarness({
  elements,
  fetchImpl,
  cachedValues = new Map(),
  now = 1_800_000_000_000,
  storageThrows = false
}) {
  let domReadyHandler = null;
  const storage = new Map(cachedValues);
  const localStorage = {
    getItem(key) {
      if (storageThrows) throw new Error('storage disabled');
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      if (storageThrows) throw new Error('storage disabled');
      storage.set(key, String(value));
    }
  };
  const document = {
    readyState: 'loading',
    querySelectorAll(selector) {
      assert.equal(selector, '.github-stars');
      return elements;
    },
    addEventListener(type, handler) {
      if (type === 'DOMContentLoaded') domReadyHandler = handler;
    }
  };
  const window = {
    setTimeout,
    clearTimeout
  };
  class FixedDate extends Date {
    static now() {
      return now;
    }
  }

  vm.runInNewContext(loadStarScript(), {
    AbortController,
    Date: FixedDate,
    document,
    fetch: fetchImpl,
    localStorage,
    window
  }, { filename: 'github-stars.js' });

  assert.equal(typeof domReadyHandler, 'function', 'loader must wait for DOM readiness');
  return { domReadyHandler, storage };
}

test('visible GitHub star counts map to canonical repository and stargazer links', () => {
  const homepageMappings = extractMappings(indexHtml);
  const subpageMappings = extractMappings(projectsHtml);

  const homepageRepos = [
    'AgentR1/Agent-R1',
    'AgentR1/Claw-R1',
    'ustc-time-series/CastClaw',
    'ustc-time-series/CastMind',
    'AgentR1/PaperScout',
    'ustc-ai4science/academic-search',
    'ustc-ai4science/PaperArena',
    'ustc-ai4science/ChemTable',
    'ustc-time-series/Future-Cast',
    'benchen4395/KuaiSearch',
    '0russwest0/HoH'
  ];
  assert.deepEqual(homepageMappings.map(({ repo }) => repo), homepageRepos);
  assert.deepEqual(subpageMappings.map(({ repo }) => repo), expectedRepos);
  assert.deepEqual(
    homepageRepos.map((repo) => subpageMappings.find((mapping) => mapping.repo === repo)),
    homepageMappings
  );

  for (const source of [indexHtml, projectsHtml]) {
    assert.equal(
      (source.match(/<script src="files\/assets\/github-stars\.js\?v=20260913-stars"><\/script>/g) || []).length,
      1
    );
    assert.doesNotMatch(source, /function renderGitHubStarCounts\(/);
  }
});

test('public pages do not retain moved GitHub repository URLs', () => {
  for (const legacyRepo of [
    'pty12345/PaperScout',
    'fishsure/TabClaw',
    'Melmaphother/PaperArena',
    'lqzxt/ChemTable'
  ]) {
    assert.doesNotMatch(publicHtmlSource, new RegExp(`github\\.com/${legacyRepo}`));
  }

  for (const canonicalRepo of [
    'AgentR1/PaperScout',
    'ustc-table-mining/TabClaw',
    'ustc-ai4science/PaperArena',
    'ustc-ai4science/ChemTable'
  ]) {
    assert.match(publicHtmlSource, new RegExp(`github\\.com/${canonicalRepo}`));
  }
});

test('shared loader fetches each mapped repository and replaces its fallback count', async () => {
  const elements = [
    createStarElement('AgentR1/WebMind', 2),
    createStarElement('ustc-ai4science/academic-search', 616)
  ];
  const requests = [];
  const harness = createRuntimeHarness({
    elements,
    fetchImpl: async (url, options) => {
      requests.push({ url, options });
      const repo = url.replace('https://api.github.com/repos/', '');
      return {
        ok: true,
        json: async () => ({ stargazers_count: repo === 'AgentR1/WebMind' ? 12 : 700 })
      };
    }
  });

  await harness.domReadyHandler();

  assert.deepEqual(requests.map(({ url }) => url), [
    'https://api.github.com/repos/AgentR1/WebMind',
    'https://api.github.com/repos/ustc-ai4science/academic-search'
  ]);
  for (const { options } of requests) {
    assert.equal(options.headers.Accept, 'application/vnd.github+json');
    assert.ok(options.signal);
  }
  assert.deepEqual(elements.map(({ textContent }) => textContent), ['12', '700']);
  assert.deepEqual(elements.map((element) => element.getAttribute('aria-label')), [null, null]);
  assert.deepEqual(elements.map((element) => element.link.getAttribute('aria-label')), [
    'AgentR1/WebMind: 12 GitHub stars',
    'ustc-ai4science/academic-search: 700 GitHub stars'
  ]);
  assert.match(harness.storage.get('github-stars:AgentR1/WebMind'), /"count":12/);
});

test('shared loader preserves the static fallback when GitHub is unavailable', async () => {
  const element = createStarElement('AgentR1/WebMind', 2);
  const harness = createRuntimeHarness({
    elements: [element],
    fetchImpl: async () => {
      throw new Error('offline');
    }
  });

  await harness.domReadyHandler();

  assert.equal(element.textContent, '2');
  assert.equal(element.getAttribute('aria-label'), null);
  assert.equal(element.link.getAttribute('aria-label'), 'AgentR1/WebMind: 2 GitHub stars');
});

test('shared loader uses a fresh cache without spending another API request', async () => {
  const now = 1_800_000_000_000;
  const element = createStarElement('AgentR1/WebMind', 2);
  const harness = createRuntimeHarness({
    elements: [element],
    now,
    cachedValues: new Map([
      ['github-stars:AgentR1/WebMind', JSON.stringify({ count: 11, updatedAt: now - 60_000 })]
    ]),
    fetchImpl: async () => {
      assert.fail('fresh cached counts must not call GitHub');
    }
  });

  await harness.domReadyHandler();

  assert.equal(element.textContent, '11');
  assert.equal(element.getAttribute('aria-label'), null);
  assert.equal(element.link.getAttribute('aria-label'), 'AgentR1/WebMind: 11 GitHub stars');
});

test('shared loader requests a repeated repository once and updates every matching element', async () => {
  const elements = [
    createStarElement('AgentR1/WebMind', 2),
    createStarElement('AgentR1/WebMind', 2)
  ];
  let requestCount = 0;
  const harness = createRuntimeHarness({
    elements,
    fetchImpl: async () => {
      requestCount += 1;
      return {
        ok: true,
        json: async () => ({ stargazers_count: 15 })
      };
    }
  });

  await harness.domReadyHandler();

  assert.equal(requestCount, 1);
  assert.deepEqual(elements.map(({ textContent }) => textContent), ['15', '15']);
});

test('shared loader retains a stale cached value when its refresh fails', async () => {
  const now = 1_800_000_000_000;
  const element = createStarElement('AgentR1/WebMind', 2);
  let requestCount = 0;
  const harness = createRuntimeHarness({
    elements: [element],
    now,
    cachedValues: new Map([
      ['github-stars:AgentR1/WebMind', JSON.stringify({
        count: 11,
        updatedAt: now - 7 * 60 * 60 * 1000
      })]
    ]),
    fetchImpl: async () => {
      requestCount += 1;
      throw new Error('offline');
    }
  });

  await harness.domReadyHandler();

  assert.equal(requestCount, 1);
  assert.equal(element.textContent, '11');
  assert.equal(element.link.getAttribute('aria-label'), 'AgentR1/WebMind: 11 GitHub stars');
});

test('shared loader bounds cold-cache GitHub request concurrency', async () => {
  const elements = Array.from(
    { length: 9 },
    (_, index) => createStarElement(`example/repo-${index}`, index)
  );
  let activeRequests = 0;
  let maxActiveRequests = 0;
  let requestCount = 0;
  const harness = createRuntimeHarness({
    elements,
    fetchImpl: async () => {
      requestCount += 1;
      activeRequests += 1;
      maxActiveRequests = Math.max(maxActiveRequests, activeRequests);
      await new Promise((resolve) => setTimeout(resolve, 5));
      activeRequests -= 1;
      return {
        ok: true,
        json: async () => ({ stargazers_count: 42 })
      };
    }
  });

  await harness.domReadyHandler();

  assert.equal(requestCount, elements.length);
  assert.ok(maxActiveRequests > 1, 'requests should still make bounded parallel progress');
  assert.ok(maxActiveRequests <= 4, `expected at most 4 concurrent requests, saw ${maxActiveRequests}`);
});

test('shared loader records GitHub rate-limit cooldown and avoids reload retries', async () => {
  const now = 1_800_000_000_000;
  const resetAt = now + 10 * 60 * 1000;
  const elements = Array.from(
    { length: 8 },
    (_, index) => createStarElement(`example/limited-${index}`, index)
  );
  let firstLoadRequests = 0;
  const firstLoad = createRuntimeHarness({
    elements,
    now,
    fetchImpl: async () => {
      firstLoadRequests += 1;
      return {
        ok: false,
        status: 403,
        headers: {
          get(name) {
            return name.toLowerCase() === 'x-ratelimit-reset'
              ? String(Math.floor(resetAt / 1000))
              : null;
          }
        }
      };
    }
  });

  await firstLoad.domReadyHandler();

  assert.equal(firstLoadRequests, 4, 'only the first bounded batch should reach a limited API');
  assert.equal(
    firstLoad.storage.get('github-stars:api-cooldown-until'),
    String(resetAt)
  );

  const secondLoad = createRuntimeHarness({
    elements: [createStarElement('example/limited-reload', 7)],
    now,
    cachedValues: firstLoad.storage,
    fetchImpl: async () => {
      assert.fail('active rate-limit cooldown must suppress reload requests');
    }
  });

  await secondLoad.domReadyHandler();
  assert.equal(secondLoad.storage.get('github-stars:api-cooldown-until'), String(resetAt));
});

test('shared loader stops its current queue after rate limiting when storage is unavailable', async () => {
  const now = 1_800_000_000_000;
  const elements = Array.from(
    { length: 8 },
    (_, index) => createStarElement(`example/no-storage-${index}`, index)
  );
  let requestCount = 0;
  const harness = createRuntimeHarness({
    elements,
    now,
    storageThrows: true,
    fetchImpl: async () => {
      requestCount += 1;
      return {
        ok: false,
        status: 429,
        headers: {
          get(name) {
            return name.toLowerCase() === 'retry-after' ? '600' : null;
          }
        }
      };
    }
  });

  await harness.domReadyHandler();

  assert.equal(requestCount, 4, 'the in-memory cooldown should stop the remaining queue');
});

test('shared loader never shortens an existing rate-limit deadline', async () => {
  const now = 1_800_000_000_000;
  const shortResetAt = now + 5 * 60 * 1000;
  const longResetAt = now + 20 * 60 * 1000;
  const elements = Array.from(
    { length: 4 },
    (_, index) => createStarElement(`example/cooldown-${index}`, index)
  );
  const harness = createRuntimeHarness({
    elements,
    now,
    fetchImpl: async (url) => {
      const isLateShortResponse = url.endsWith('cooldown-1');
      await new Promise((resolve) => setTimeout(resolve, isLateShortResponse ? 15 : 1));
      return {
        ok: false,
        status: 403,
        headers: {
          get(name) {
            if (name.toLowerCase() !== 'x-ratelimit-reset') return null;
            return String(Math.floor(
              (isLateShortResponse ? shortResetAt : longResetAt) / 1000
            ));
          }
        }
      };
    }
  });

  await harness.domReadyHandler();

  assert.equal(
    harness.storage.get('github-stars:api-cooldown-until'),
    String(longResetAt)
  );
});
