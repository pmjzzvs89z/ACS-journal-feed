// Tracks articles the user has explicitly unsaved so auto-save rules
// never re-add them.
//
// Storage strategy: Supabase is the source of truth (syncs across devices,
// survives browser data clears). localStorage is a fast read cache so
// auto-save can bail out without waiting for a network round-trip on
// every page load.
//
// LocalStorage key: cjf_dismissed_articles:<userId>
// LocalStorage value: JSON array of article link strings, oldest-first.
//
// If the Supabase table doesn't exist yet (missing migration), the code
// gracefully falls back to localStorage-only — the user still gets the
// per-browser guarantee and sees no errors.

import { entities } from '@/api/entities';

const KEY_BASE = 'cjf_dismissed_articles';
const MAX_ENTRIES = 10000;

function storageKey(userId) {
  return `${KEY_BASE}:${userId}`;
}

function getArray(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function persist(userId, arr) {
  if (!userId) return;
  // Cap size by dropping oldest entries (FIFO)
  let toWrite = arr;
  if (arr.length > MAX_ENTRIES) {
    toWrite = arr.slice(arr.length - MAX_ENTRIES);
  }
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(toWrite));
  } catch (e) {
    // Quota exceeded — try shrinking to half the cap and retry once.
    try {
      const shrunk = toWrite.slice(-Math.floor(MAX_ENTRIES / 2));
      localStorage.setItem(storageKey(userId), JSON.stringify(shrunk));
    } catch {
      if (import.meta.env.DEV) console.error('[dismissedArticles] localStorage quota exceeded:', e);
    }
  }
}

function notifyChanged() {
  try {
    window.dispatchEvent(new CustomEvent('dismissed-articles-changed'));
  } catch { /* non-browser environment */ }
}

// Sync helper — pull the full dismissed list from Supabase and merge into
// the local cache. Called once on mount via syncFromServer() below.
export async function syncFromServer(userId) {
  if (!userId) return;
  try {
    const serverIds = await entities.DismissedArticle.list();
    const localArr = getArray(userId);
    // Union of server + local; local ordering preserved for LRU.
    // Server entries we don't have locally are appended at the end.
    const localSet = new Set(localArr);
    const merged = [...localArr];
    for (const id of serverIds) {
      if (!localSet.has(id)) {
        merged.push(id);
        localSet.add(id);
      }
    }
    persist(userId, merged);
    notifyChanged();
  } catch (e) {
    // Table may not exist yet (migration not run), or network error.
    // Fall back silently to localStorage-only behavior.
    if (import.meta.env.DEV) console.warn('[dismissedArticles] sync from server failed:', e?.message || e);
  }
}

/** Mark one article link as dismissed (user explicitly unsaved it). */
export function dismissArticle(userId, articleLink) {
  if (!userId || !articleLink) return;
  const arr = getArray(userId);
  // Avoid duplicate entries, but if already present, move to end so it
  // stays fresh and isn't evicted first on future growth.
  const idx = arr.indexOf(articleLink);
  if (idx !== -1) arr.splice(idx, 1);
  arr.push(articleLink);
  persist(userId, arr);
  notifyChanged();
  // Fire-and-forget Supabase write — errors are non-critical.
  entities.DismissedArticle.add(articleLink).catch((e) => {
    if (import.meta.env.DEV) console.warn('[dismissedArticles] server add failed:', e?.message || e);
  });
}

/** Mark multiple article links as dismissed. */
export function dismissArticles(userId, articleLinks) {
  if (!userId || !articleLinks?.length) return;
  const arr = getArray(userId);
  const existing = new Set(arr);
  const toPersistOnServer = [];
  for (const link of articleLinks) {
    if (!link) continue;
    if (existing.has(link)) {
      // Move to end for LRU freshness
      const idx = arr.indexOf(link);
      if (idx !== -1) arr.splice(idx, 1);
    } else {
      existing.add(link);
      toPersistOnServer.push(link);
    }
    arr.push(link);
  }
  persist(userId, arr);
  notifyChanged();
  if (toPersistOnServer.length > 0) {
    entities.DismissedArticle.addMany(toPersistOnServer).catch((e) => {
      if (import.meta.env.DEV) console.warn('[dismissedArticles] server addMany failed:', e?.message || e);
    });
  }
}

/** Check whether an article link was previously dismissed. */
export function isDismissed(userId, articleLink) {
  return getArray(userId).includes(articleLink);
}

/** Get the full set of dismissed article links (for batch filtering). */
export function getDismissedSet(userId) {
  return new Set(getArray(userId));
}
