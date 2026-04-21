// Elsevier articles in RSS feeds carry a PII (Publisher Item Identifier,
// e.g. "S0021951726002216") but not a DOI. CrossRef maintains a
// PII → DOI mapping we can query to recover the DOI.
//
// Results are cached in localStorage indefinitely — a given PII always
// resolves to the same DOI, so a single resolution per article is enough.
// Misses ("not found") are also cached to avoid repeated failed lookups.

const CACHE_KEY = 'cjf_pii_doi_cache';
const NOT_FOUND = '__not_found__';          // sentinel for negative cache
const CROSSREF_API = 'https://api.crossref.org/works';
const TIMEOUT_MS = 8000;

// In-memory mirror so we don't hit localStorage on every lookup
let cache = null;

function loadCache() {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    cache = raw ? JSON.parse(raw) : {};
  } catch {
    cache = {};
  }
  return cache;
}

function persistCache() {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache || {}));
  } catch { /* quota — non-critical */ }
}

/** Extract an Elsevier PII from a ScienceDirect URL, or return null. */
export function extractPii(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/\/pii\/(S[0-9Xx]+)/i);
  return m ? m[1].toUpperCase() : null;
}

/** Synchronous cache read — returns DOI, null (unknown yet), or '' (confirmed not found). */
export function getCachedDoi(pii) {
  if (!pii) return null;
  const c = loadCache();
  const v = c[pii];
  if (v === undefined) return null;
  if (v === NOT_FOUND) return '';
  return v;
}

// In-flight promises so N cards for the same PII trigger only one fetch
const inFlight = new Map();

/**
 * Resolve a PII to a DOI via CrossRef. Returns the DOI string or null.
 * Subsequent calls for the same PII hit the cache.
 */
export async function resolveDoiFromPii(pii) {
  if (!pii) return null;
  const cached = getCachedDoi(pii);
  if (cached) return cached;
  if (cached === '') return null;           // negative cache hit
  if (inFlight.has(pii)) return inFlight.get(pii);

  const promise = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const url = `${CROSSREF_API}?filter=alternative-id:${encodeURIComponent(pii)}&rows=1&select=DOI`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) return null;
      const data = await res.json();
      const doi = data?.message?.items?.[0]?.DOI || null;

      const c = loadCache();
      c[pii] = doi || NOT_FOUND;
      persistCache();
      return doi;
    } catch {
      // Network error / timeout — don't cache, allow retry later
      return null;
    } finally {
      clearTimeout(timer);
      inFlight.delete(pii);
    }
  })();

  inFlight.set(pii, promise);
  return promise;
}
