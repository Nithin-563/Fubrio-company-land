import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { supabase as anonClient } from "@/lib/supabase";

const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const serviceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  "";

export const hasServiceRole = Boolean(url && serviceKey);

let _client: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient {
  if (_client) return _client;
  if (!url || !serviceKey) throw new Error("Supabase service role key is not configured");
  _client = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return _client;
}

/**
 * Server-only Supabase client. With SUPABASE_SERVICE_ROLE_KEY set it bypasses
 * RLS, so anon clients can be denied direct table access entirely. Without the
 * key it falls back to the anon client so the app keeps working.
 */
export const serverSupabase: SupabaseClient = hasServiceRole
  ? getServiceClient()
  : anonClient;
