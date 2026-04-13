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
 * rules. Fetches rules from Supabase on mount (with localStorage as
 * instant fallback), then runs whenever articles change.
 */
export function useAutoSave(articles, userId) {
  const userIdRef = useRef(userId);
  userIdRef.current = userId;
  const queryClient = useQueryClient();
  const [serverRules, setServerRules] = useState(null);

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
      .catch(() => { /* use cached rules */ });
  }, [userId]);

  useEffect(() => {
    if (!articles.length) return;
    if (!userId) return;
    // Prefer server-fetched rules, fall back to localStorage cache
    const rules = serverRules || getCachedRules(userId);
    if (!rules.enabled) return;

    (async () => {
      try {
        const currentSaved = await entities.SavedArticle.list();
        // After the async gap, verify the authenticated user hasn't
        // changed mid-flight (e.g. logout + re-login during the fetch).
        // entities.SavedArticle.create() stamps the *current* auth user,
        // so without this guard a stale effect could attribute articles
        // that matched User A's rules to User B's account.
        if (userIdRef.current !== userId) return;
        const savedIds = new Set(currentSaved.map(s => s.article_id));
        const toSave = articles.filter(a => !savedIds.has(a.link) && articleMatchesRules(a, rules));
        if (toSave.length > 0) {
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
                // Decode HTML entities before searching (edge function returns HTML-encoded content)
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
}
