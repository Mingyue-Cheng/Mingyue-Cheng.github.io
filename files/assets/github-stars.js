(function () {
  'use strict';

  const CACHE_PREFIX = 'github-stars:';
  const CACHE_TTL_MS = 6 * 60 * 60 * 1000;
  const API_COOLDOWN_KEY = `${CACHE_PREFIX}api-cooldown-until`;
  const RATE_LIMIT_FALLBACK_MS = 15 * 60 * 1000;
  const MAX_CONCURRENT_REQUESTS = 4;
  const REQUEST_TIMEOUT_MS = 6000;
  let memoryCooldownUntil = 0;

  function cacheKey(repo) {
    return `${CACHE_PREFIX}${repo}`;
  }

  function normalizeCount(value) {
    const count = Number(value);
    return Number.isFinite(count) && count >= 0 ? Math.floor(count) : null;
  }

  function renderCount(elements, count) {
    const normalized = normalizeCount(count);
    if (normalized === null) return;

    elements.forEach((element) => {
      element.textContent = String(normalized);
      const repo = element.dataset.repo?.trim();
      const link = element.closest('a');
      if (repo && link) {
        link.setAttribute('aria-label', `${repo}: ${normalized} GitHub stars`);
      }
    });
  }

  function readCooldownUntil() {
    try {
      const storedCooldownUntil = Number(localStorage.getItem(API_COOLDOWN_KEY));
      if (Number.isFinite(storedCooldownUntil)) {
        memoryCooldownUntil = Math.max(memoryCooldownUntil, storedCooldownUntil);
      }
    } catch {
      // The in-memory deadline still protects the current page load.
    }
    return memoryCooldownUntil;
  }

  function writeCooldownUntil(candidateCooldownUntil) {
    const cooldownUntil = Number(candidateCooldownUntil);
    if (!Number.isFinite(cooldownUntil)) return;

    memoryCooldownUntil = Math.max(
      memoryCooldownUntil,
      readCooldownUntil(),
      cooldownUntil
    );
    try {
      localStorage.setItem(API_COOLDOWN_KEY, String(memoryCooldownUntil));
    } catch {
      // In-memory cooldown still stops the remaining queue on this page.
    }
  }

  function readCache(repo) {
    try {
      const cached = JSON.parse(localStorage.getItem(cacheKey(repo)) || 'null');
      const count = normalizeCount(cached?.count);
      const updatedAt = Number(cached?.updatedAt);
      if (count === null || !Number.isFinite(updatedAt)) return null;
      return { count, updatedAt };
    } catch {
      return null;
    }
  }

  function writeCache(repo, count) {
    try {
      localStorage.setItem(cacheKey(repo), JSON.stringify({
        count,
        updatedAt: Date.now()
      }));
    } catch {
      // The static value remains visible when storage is unavailable.
    }
  }

  async function fetchCount(repo) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    const encodedRepo = repo.split('/').map(encodeURIComponent).join('/');

    try {
      const response = await fetch(`https://api.github.com/repos/${encodedRepo}`, {
        signal: controller.signal,
        headers: {
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28'
        }
      });
      if (!response.ok) {
        const error = new Error(`GitHub API ${response.status}`);
        if (response.status === 403 || response.status === 429) {
          const resetAtSeconds = Number(response.headers?.get?.('x-ratelimit-reset'));
          const retryAfterSeconds = Number(response.headers?.get?.('retry-after'));
          const resetAt = resetAtSeconds * 1000;
          if (Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0) {
            error.cooldownUntil = Date.now() + retryAfterSeconds * 1000;
          } else if (Number.isFinite(resetAt) && resetAt > Date.now()) {
            error.cooldownUntil = resetAt;
          } else {
            error.cooldownUntil = Date.now() + RATE_LIMIT_FALLBACK_MS;
          }
        }
        throw error;
      }

      const data = await response.json();
      const count = normalizeCount(data?.stargazers_count);
      if (count === null) throw new Error('Invalid GitHub star count');
      return count;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  async function refreshRepo(repo, elements) {
    const fallback = normalizeCount(elements[0]?.dataset.stars ?? elements[0]?.textContent);
    if (fallback !== null) renderCount(elements, fallback);

    const cached = readCache(repo);
    if (cached) {
      renderCount(elements, cached.count);
      if (Date.now() - cached.updatedAt < CACHE_TTL_MS) return;
    }

    if (readCooldownUntil() > Date.now()) return;

    try {
      const count = await fetchCount(repo);
      renderCount(elements, count);
      writeCache(repo, count);
    } catch (error) {
      if (Number.isFinite(error?.cooldownUntil)) {
        writeCooldownUntil(error.cooldownUntil);
      }
      // Keep the cached or static fallback count when GitHub is unavailable.
    }
  }

  async function refreshEntries(entries) {
    let nextIndex = 0;

    async function worker() {
      while (nextIndex < entries.length) {
        const currentIndex = nextIndex;
        nextIndex += 1;
        const [repo, elements] = entries[currentIndex];
        await refreshRepo(repo, elements);
      }
    }

    const workerCount = Math.min(MAX_CONCURRENT_REQUESTS, entries.length);
    await Promise.all(Array.from({ length: workerCount }, () => worker()));
  }

  async function loadGitHubStars() {
    const elementsByRepo = new Map();

    document.querySelectorAll('.github-stars').forEach((element) => {
      const repo = element.dataset.repo?.trim();
      if (!repo || !repo.includes('/')) return;
      const elements = elementsByRepo.get(repo) || [];
      elements.push(element);
      elementsByRepo.set(repo, elements);
    });

    await refreshEntries(Array.from(elementsByRepo));
  }

  const start = () => loadGitHubStars();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    void start();
  }
})();
