const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.SUPABASE_ANON_KEY || '';

const useSupabase = process.env.USE_SUPABASE === 'true';

let supabase = null;

if (useSupabase && supabaseUrl && supabaseKey) {
  try {
    supabase = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: false,
      },
    });
    console.log('[Supabase] Client initialized successfully for URL:', supabaseUrl);
  } catch (err) {
    console.error('[Supabase Error] Failed to initialize client:', err.message);
  }
} else if (supabaseUrl && supabaseKey && !useSupabase) {
  console.log('[Database] Supabase credentials present, but USE_SUPABASE is false. Using local MongoDB engine.');
} else {
  console.log('[Database] Using local MongoDB engine.');
}

module.exports = { supabase, isSupabaseConfigured: () => useSupabase && !!supabase };
