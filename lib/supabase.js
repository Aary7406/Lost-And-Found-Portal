import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('⚠️ Supabase credentials not found in environment variables');
}

let supabaseClient = null;

export function getSupabase() {
  if (!supabaseClient && supabaseUrl && supabaseServiceKey) {
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }
  
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Check environment variables.');
  }
  
  return supabaseClient;
}

export default getSupabase;
