// Seen articles helpers (cached in memory, flushed to localStorage).
// Read/unread state is stored per-user at `seenArticles:<userId>` so each
// account has its own reading history and states cannot bleed between
// users on the same browser. The module-level `_seenCache` is invalidated
// whenever the authenticated user changes via setSeenArticlesUser(), which
// Home.jsx calls in response to auth state changes.

const SEEN_KEY_BASE = 'seenArticles';
const LEGACY_SEEN_KEY = 'seenArticles';
let _seenCache = null;
let _currentUserId = null;

const seenKeyForCurrent = () =>
  _currentUserId ? `${SEEN_KEY_BASE}:${_currentUserId}` : null;

export const setSeenArticlesUser = (userId) => {
  const next = userId || null;
  if (next === _currentUserId) return;
  _currentUserId = next;
  _seenCache = null; // force a re-read from the new user's namespaced key
};

const getSeenArticles = () => {
  if (_seenCache) return _seenCache;
  const key = seenKeyForCurrent();
  if (!key) { _seenCache = new Set(); return _seenCache; }
  try { _seenCache = new Set(JSON.parse(localStorage.getItem(key) || '[]')); }
  catch { _seenCache = new Set(); }
  return _seenCache;
};

export const markArticleSeen = (articleId) => {
  const key = seenKeyForCurrent();
  if (!key) return; // logged out — don't persist read state
  const seen = getSeenArticles();
  if (seen.has(articleId)) return; // skip redundant writes
  seen.add(articleId);
  localStorage.setItem(key, JSON.stringify([...seen]));
};

export const isArticleSeen = (articleId) => getSeenArticles().has(articleId);

export const getSeenArticleIds = () => new Set(getSeenArticles());

export const clearAllSeenArticles = () => {
  const key = seenKeyForCurrent();
  _seenCache = null;
  if (key) localStorage.removeItem(key);
};

// One-time legacy cleanup: purge the old un-namespaced `seenArticles`
// key on module load so it can never bleed into a different account
// again. Any per-user keys (`seenArticles:<uid>`) are untouched.
try { localStorage.removeItem(LEGACY_SEEN_KEY); } catch { /* ignore */ }
