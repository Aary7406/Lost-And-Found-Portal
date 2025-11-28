/**
 * Optimized Supabase Client Configuration
 * - Singleton pattern for connection reuse
 * - Configured for server-side API routes only
 * - Service role key for full database access
 * - Performance optimized settings
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validate environment variables at module load
if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
}

// Singleton client instance (reused across all API calls)
let supabaseClient = null;

/**
 * Get Supabase client (singleton pattern)
 * @returns {import('@supabase/supabase-js').SupabaseClient}
 * @throws {Error} If environment variables are missing
 */
export function getSupabase() {
  if (!supabaseClient && supabaseUrl && supabaseServiceKey) {
    supabaseClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,    // Not needed for service role
        persistSession: false,       // Don't persist sessions
        detectSessionInUrl: false    // Server-side only
      },
      db: {
        schema: 'public'             // Default schema
      },
      global: {
        headers: {
          'x-client-info': 'lost-and-found-api',
          'apikey': supabaseServiceKey
        }
      },
      // Performance optimizations
      realtime: {
        params: {
          eventsPerSecond: 10        // Rate limit realtime events
        }
      }
    });
    
    console.log('✅ Supabase client initialized');
  }
  
  if (!supabaseClient) {
    throw new Error('Supabase client not initialized. Check environment variables.');
  }
  
  return supabaseClient;
}

/**
 * Health check for Supabase connection
 * @returns {Promise<boolean>}
 */
export async function testConnection() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)
      .single();
    
    return !error;
  } catch (error) {
    console.error('❌ Supabase connection test failed:', error);
    return false;
  }
}

export default getSupabase;
