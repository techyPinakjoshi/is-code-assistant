
import { createClient } from '@supabase/supabase-js';

/**
 * For Vite applications, environment variables must be prefixed with VITE_
 * and accessed via import.meta.env.
 * 
 * To make this work on weautomates.com:
 * 1. Create a .env file in your project root for local development.
 * 2. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your hosting provider's 
 *    environment variables (e.g., Vercel, Netlify, or Github Actions).
 */

// Fix: Use process.env to access environment variables and avoid TypeScript 'ImportMeta' property 'env' error.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

if (supabaseUrl === 'https://your-project.supabase.co') {
  console.warn("Supabase URL is using a placeholder. Ensure VITE_SUPABASE_URL is set in your environment.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
