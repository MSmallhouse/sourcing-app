import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const serviceRoleSecret = process.env.SUPABASE_SERVICE_ROLE_KEY as string;

// allow admin access for server-side code (DO NOT EXPOSE TO CLIENT)
export const supabaseAdmin = createClient(supabaseUrl, serviceRoleSecret, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
    detectSessionInUrl: false,
  }
});