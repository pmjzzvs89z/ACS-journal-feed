import { useEffect, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { entities } from '@/api/entities';
import { articleMatchesRules } from '@/utils/articleMatch';

// Read rules from localStorage as a fast cache. The canonical source is
// the Supabase auto_save_rules table — SavedFeed.jsx keeps the cache in
// sync. This lets the auto-save effect fire immediately on page load
// without waiting for a Supabase round-trip.
const RULES_KEY_BASE = 'cjf_autosave_rules';

function getCachedRules(userId) {
  if (!userId) return {};
  try { return JSON.parse(localStorage.getItem(`${RULES_KEY_BASE}:${userId}`) || '{}'); }
  catch { return {}; }
}

/**
 * Custom hook that auto-saves articles matching the user's keyword/author
 * rules. Each article is evaluated at most once per page session — removing
 * a saved article will never cause it to be re-added by auto-save.
 */
export function useAutoSave(articles, userId) {
  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const queryClient = useQueryClient();
  const [serverRules, setServerRules] = useState(null);

  // Track which article links have already been evaluated so we never
  // re-process the same article twice in one session.
  const processedRef = useRef(new Set());

  // Reset processed set when user changes
  useEffect(() => {
    processedRef.current = new Set();
  }, [userId]);

  // Fetch rules from Supabase once when userId is set
  useEffect(() => {
    if (!userId) { setServerRules(null); return; }
    entities.AutoSaveRules.get()
      .then(row => {
        if (row && userIdRef.current === userId) {
          const synced = { enabled: row.enabled, keywords: row.keywords || [], authors: row.authors || [] };
          setServerRules(synced);
          // Update cache so subsequent reads are fresh
          try { localStorage.setItem(`${RULES_KEY_BASE}:${userId}`, JSON.stringify(synced)); } catch {}
        }
      })
      .catch((err) => { console.error('[useAutoSave] rules fetch failed:', err); });
  }, [userId]);

  // Listen for real-time rule changes from SavedFeed so the enabled
  // indicator updates instantly without waiting for a Supabase round-trip.
  useEffect(() => {
    const handler = (e) => setServerRules(e.detail);
    window.addEventListener('autosave-rules-changed', handler);
    return () => window.removeEventListener('autosave-rules-changed', handler);
  }, []);

  useEffect(() => {
    if (!articles.length) return;
    if (!userId) return;
    // Prefer server-fetched rules, fall back to localStorage cache
    const rules = serverRules || getCachedRules(userId);
    if (!rules.enabled) return;

    // Only consider articles we haven't already processed
    const unprocessed = articles.filter(a => !processedRef.current.has(a.link));
    if (!unprocessed.length) return;

    // Mark as processed immediately so re-runs of this effect are no-ops
    unprocessed.forEach(a => processedRef.current.add(a.link));

    (async () => {
      try {
        const currentSaved = await entities.SavedArticle.list();
        if (userIdRef.current !== userId) return;
        const savedIds = new Set(currentSaved.map(s => s.article_id));
        const toSave = unprocessed.filter(a => !savedIds.has(a.link) && articleMatchesRules(a, rules));
        console.log('[useAutoSave] rules:', JSON.stringify(rules), 'unprocessed:', unprocessed.length, 'already saved:', savedIds.size, 'toSave:', toSave.length);
        if (toSave.length > 0) {
          console.log('[useAutoSave] saving:', toSave.slice(0, 5).map(a => ({ title: a.title?.slice(0, 60), author: a.author })));

          await Promise.all(toSave.map(a => {
            const abstract = (() => {
              const sources = [a.content, a.description];
              for (const src of sources) {
                if (!src) continue;
                const pMatches = src.match(/<p[^>]*>([\s\S]*?)<\/p>/gi);
                if (pMatches) { for (const p of pMatches) { const t = p.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim(); if (t.length > 60) return t; } }
                const plain = src.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
                if (plain.length > 60) return plain;
              }
              return '';
            })();
            const thumbnail = (() => {
              if (a.enclosure?.link) return a.enclosure.link;
              if (a.enclosure?.url) return a.enclosure.url;
              if (a.thumbnail) return a.thumbnail;
              const sources = [a.content, a.description];
              for (const src of sources) {
                if (!src) continue;
                const el = document.createElement('textarea');
                el.innerHTML = src;
                const decoded = el.value;
                const m = decoded.match(/\bsrc=["']([^"']+\.(?:png|jpg|jpeg|gif|webp))["']/i);
                if (m) return m[1];
              }
              return '';
            })();
            return entities.SavedArticle.create({
              article_id: a.link,
              title: a.title,
              link: a.link,
              authors: Array.isArray(a.author) ? a.author.join(', ') : (a.author || ''),
              pub_date: a.pubDate,
              journal_name: a.journalName,
              journal_abbrev: a.journalAbbrev,
              journal_color: a.journalColor,
              thumbnail,
              abstract,
            });
          }));
          queryClient.invalidateQueries({ queryKey: ['savedArticles'] });
        }
      } catch (e) {
        if (import.meta.env.DEV) console.error('Auto-save error:', e);
      }
    })();
  }, [articles, userId, serverRules]);

  // Expose whether auto-save is currently enabled so the UI can show an indicator
  const rules = serverRules || getCachedRules(userId);
  return { autoSaveEnabled: !!rules.enabled };
}
