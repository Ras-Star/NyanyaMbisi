import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let browserClient: SupabaseClient | null = null;
let browserClientKey = "";

export function useSupabaseBrowserClient() {
  if (!import.meta.client) {
    return null;
  }

  const config = useRuntimeConfig();
  const url = String(config.public.supabaseUrl ?? "").trim();
  const key = String(config.public.supabaseAnonKey ?? "").trim();

  if (!url || !key) {
    return null;
  }

  const nextClientKey = `${url}:${key}`;

  if (!browserClient || browserClientKey !== nextClientKey) {
    browserClient = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false
      }
    });
    browserClientKey = nextClientKey;
  }

  return browserClient;
}
