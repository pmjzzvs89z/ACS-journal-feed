import { supabase } from './supabaseClient';

async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

export const entities = {
  FollowedJournal: {
    list: async () => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from('followed_journals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    create: async (journal) => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from('followed_journals')
        .insert({ ...journal, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id, updates) => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from('followed_journals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const userId = await getUserId();
      const { error } = await supabase
        .from('followed_journals')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    // Bulk-update many rows in a single request. Used by "Unselect All" to
    // avoid firing N separate optimistic mutations.
    bulkUpdate: async (ids, updates) => {
      if (!ids || ids.length === 0) return;
      const userId = await getUserId();
      const { error } = await supabase
        .from('followed_journals')
        .update(updates)
        .in('id', ids)
        .eq('user_id', userId);
      if (error) throw error;
    }
  },

  SavedArticle: {
    list: async () => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from('saved_articles')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    create: async (article) => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from('saved_articles')
        .insert({ ...article, user_id: userId })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const userId = await getUserId();
      const { error } = await supabase
        .from('saved_articles')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);
      if (error) throw error;
    },
    deleteMany: async (ids) => {
      const userId = await getUserId();
      const { error } = await supabase
        .from('saved_articles')
        .delete()
        .in('id', ids)
        .eq('user_id', userId);
      if (error) throw error;
    },
    deleteAll: async () => {
      const userId = await getUserId();
      const { error } = await supabase
        .from('saved_articles')
        .delete()
        .eq('user_id', userId);
      if (error) throw error;
    }
  },

  JournalScope: {
    list: async () => {
      const { data, error } = await supabase
        .from('journal_scopes')
        .select('*');
      if (error) return [];
      return data || [];
    }
  },

  DismissedArticle: {
    // Fetch all dismissed article_ids for the current user.
    // Returns an array of article_id strings (the article link URLs).
    list: async () => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from('dismissed_articles')
        .select('article_id')
        .eq('user_id', userId);
      if (error) throw error;
      return (data || []).map(r => r.article_id);
    },
    // Add a single dismissal. Idempotent — primary key (user_id, article_id)
    // means re-dismissing an already-dismissed article is a no-op.
    add: async (articleId) => {
      const userId = await getUserId();
      const { error } = await supabase
        .from('dismissed_articles')
        .upsert({ user_id: userId, article_id: articleId }, { onConflict: 'user_id,article_id' });
      if (error) throw error;
    },
    // Bulk add — used by "delete all" / bulk-unsave paths.
    addMany: async (articleIds) => {
      if (!articleIds?.length) return;
      const userId = await getUserId();
      const rows = articleIds.map(article_id => ({ user_id: userId, article_id }));
      const { error } = await supabase
        .from('dismissed_articles')
        .upsert(rows, { onConflict: 'user_id,article_id' });
      if (error) throw error;
    },
  },

  AutoSaveRules: {
    get: async () => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from('auto_save_rules')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    upsert: async (rules) => {
      const userId = await getUserId();
      const { data, error } = await supabase
        .from('auto_save_rules')
        .upsert({
          user_id: userId,
          enabled: rules.enabled,
          keywords: rules.keywords,
          authors: rules.authors,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
  },

  // Admin queries — return cross-user data if RLS permits.
  // Throw on error so React Query surfaces it instead of silently
  // returning an empty dashboard.
  Admin: {
    getAllFollowedJournals: async () => {
      const { data, error } = await supabase
        .from('followed_journals')
        .select('user_id, journal_id, journal_name, is_active, created_at');
      if (error) throw error;
      return data || [];
    },
    getAllSavedArticles: async () => {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('user_id, journal_name, journal_abbrev, journal_color, created_at, title, link');
      if (error) throw error;
      return data || [];
    },
  }
};
