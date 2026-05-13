import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fwjqsfpehouycbscnrbl.supabase.co';
const supabaseAnonKey = 'sb_publishable_WN5bA_37o8niPouPlptc4g_CuHfrOX-'; // User provided this key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
