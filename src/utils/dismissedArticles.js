// Tracks articles the user has explicitly unsaved so auto-save rules
// never re-add them. Persisted in localStorage per user.
//
// Key pattern: cjf_dismissed_articles:<userId>
// Value: JSON array of article link strings

const KEY_BASE = 'cjf_dismissed_articles';

function storageKey(userId) {
  return `${KEY_BASE}:${userId}`;
}

function getSet(userId) {
  if (!userId) return new Set();
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function persist(userId, set) {
  if (!userId) return;
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify([...set]));
  } catch { /* quota exceeded — non-critical */ }
}

/** Mark one article link as dismissed (user explicitly unsaved it). */
export function dismissArticle(userId, articleLink) {
  if (!userId || !articleLink) return;
  const set = getSet(userId);
  set.add(articleLink);
  persist(userId, set);
}

/** Mark multiple article links as dismissed. */
export function dismissArticles(userId, articleLinks) {
  if (!userId || !articleLinks?.length) return;
  const set = getSet(userId);
  articleLinks.forEach(link => set.add(link));
  persist(userId, set);
}

/** Check whether an article link was previously dismissed. */
export function isDismissed(userId, articleLink) {
  return getSet(userId).has(articleLink);
}

/** Get the full set of dismissed article links (for batch filtering). */
export function getDismissedSet(userId) {
  return getSet(userId);
}
