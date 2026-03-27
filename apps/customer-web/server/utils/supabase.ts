import { useRuntimeConfig } from "#imports";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let cachedClient: SupabaseClient | null = null;
let cachedKey = "";

export function getSupabaseSettings() {
  const config = useRuntimeConfig();
  const url = String(config.public.supabaseUrl ?? "").trim();
  const anonKey = String(config.public.supabaseAnonKey ?? "").trim();
  const serviceRoleKey = String(config.supabaseServiceRoleKey ?? "").trim();
  const otpDevCode = String(config.supabaseOtpDevCode ?? "2468").trim() || "2468";

  return {
    url,
    anonKey,
    serviceRoleKey,
    otpDevCode,
    hasPublicClientConfig: Boolean(url && anonKey),
    hasServerAdminConfig: Boolean(url && serviceRoleKey)
  };
}

export function getServerSupabaseClient() {
  const settings = getSupabaseSettings();

  if (!settings.hasServerAdminConfig) {
    return null;
  }

  const nextKey = `${settings.url}:${settings.serviceRoleKey}`;

  if (!cachedClient || cachedKey !== nextKey) {
    cachedClient = createClient(settings.url, settings.serviceRoleKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    cachedKey = nextKey;
  }

  return cachedClient;
}
