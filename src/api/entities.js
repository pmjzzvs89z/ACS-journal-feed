import { supabase } from './supabaseClient';

async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');
  return user.id;
}

export const entities = {
  FollowedJournal: {
    list: async () => {
      const { data, error } = await supabase
        .from('followed_journals')
        .select('*')
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
      const { data, error } = await supabase
        .from('followed_journals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id) => {
      const { error } = await supabase
        .from('followed_journals')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }
  },

  SavedArticle: {
    list: async () => {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('*')
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
      const { error } = await supabase
        .from('saved_articles')
        .delete()
        .eq('id', id);
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

  // Admin queries — return cross-user data if RLS permits; fall back to current user's data.
  Admin: {
    getAllFollowedJournals: async () => {
      const { data, error } = await supabase
        .from('followed_journals')
        .select('user_id, journal_id, journal_name, is_active, created_at');
      if (error) return [];
      return data || [];
    },
    getAllSavedArticles: async () => {
      const { data, error } = await supabase
        .from('saved_articles')
        .select('user_id, journal_name, journal_abbrev, journal_color, created_at, title, link');
      if (error) return [];
      return data || [];
    },
  }
};
