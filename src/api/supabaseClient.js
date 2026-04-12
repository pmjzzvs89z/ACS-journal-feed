import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fvjvcxvgxoloyfvchfof.supabase.co';
const SUPABASE_KEY = 'sb_publishable_T4zYMhZuoFpgFQyY09ghPw_SuFUjGXO';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
