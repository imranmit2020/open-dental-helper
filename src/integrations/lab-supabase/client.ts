import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Lab Provider Supabase Configuration - Replace with your actual lab project values
const LAB_SUPABASE_URL = "https://your-lab-project-id.supabase.co";
const LAB_SUPABASE_ANON_KEY = "your-lab-project-anon-key";

export const labSupabase = createClient<Database>(LAB_SUPABASE_URL, LAB_SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});