
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (supabaseUrl === 'https://your-project.supabase.co') {
  console.warn("Supabase URL is using a placeholder. Ensure VITE_SUPABASE_URL is set in your environment.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
