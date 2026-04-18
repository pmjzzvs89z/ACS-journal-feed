// Tracks articles the user has explicitly unsaved so auto-save rules
// never re-add them. Persisted in localStorage per user.
//
// Storage key: cjf_dismissed_articles:<userId>
// Storage value: JSON array of article link strings, oldest-first.
//
// A Set isn't preserved through JSON; storing an array preserves insertion
// order so we can do FIFO eviction when we hit the cap.

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
      // Still failing — nothing we can do; auto-save may re-add articles.
      if (import.meta.env.DEV) console.error('[dismissedArticles] localStorage quota exceeded:', e);
    }
  }
}

function notifyChanged() {
  try {
    window.dispatchEvent(new CustomEvent('dismissed-articles-changed'));
  } catch { /* non-browser environment */ }
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
}

/** Mark multiple article links as dismissed. */
export function dismissArticles(userId, articleLinks) {
  if (!userId || !articleLinks?.length) return;
  const arr = getArray(userId);
  const existing = new Set(arr);
  for (const link of articleLinks) {
    if (!link) continue;
    if (existing.has(link)) {
      // Move to end for LRU freshness
      const idx = arr.indexOf(link);
      if (idx !== -1) arr.splice(idx, 1);
    } else {
      existing.add(link);
    }
    arr.push(link);
  }
  persist(userId, arr);
  notifyChanged();
}

/** Check whether an article link was previously dismissed. */
export function isDismissed(userId, articleLink) {
  return getArray(userId).includes(articleLink);
}

/** Get the full set of dismissed article links (for batch filtering). */
export function getDismissedSet(userId) {
  return new Set(getArray(userId));
}
