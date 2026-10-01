import { createClient } from '@supabase/supabase-js';

const rawUrl = import.meta.env.VITE_SUPABASE_URL;
const rawAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Pastikan kredensial dibaca dari environment variables tanpa hardcoding
export const supabaseUrl = typeof rawUrl === 'string' ? rawUrl.trim() : '';
export const supabaseAnonKey = typeof rawAnonKey === 'string' ? rawAnonKey.trim() : '';

// Flag untuk mendeteksi apakah kredensial Supabase sudah terkonfigurasi secara valid
export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseAnonKey.includes('placeholder')
);

// Inisialisasi Supabase Client dengan konfigurasi auth session browser
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
