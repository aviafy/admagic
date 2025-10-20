/**
 * Supabase client configuration
 * Includes real-time subscription settings for live updates
 */

import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './constants';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  realtime: {
    params: {
      eventsPerSecond: 10, // Allow up to 10 events per second
    },
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
