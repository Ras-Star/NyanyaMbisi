import { createError, getHeader, type H3Event } from "h3";
import type { User } from "@supabase/supabase-js";
import { getServerSupabaseClient } from "./supabase";

function readBearerToken(event: H3Event) {
  const header = getHeader(event, "authorization");

  if (!header?.startsWith("Bearer ")) {
    return "";
  }

  return header.slice("Bearer ".length).trim();
}

export async function requireAuthenticatedCustomer(event: H3Event) {
  const accessToken = readBearerToken(event);

  if (!accessToken) {
    throw createError({ statusCode: 401, statusMessage: "Sign in is required" });
  }

  const client = getServerSupabaseClient();

  if (!client) {
    throw createError({ statusCode: 500, statusMessage: "Supabase server configuration is missing" });
  }

  const {
    data: { user },
    error
  } = await client.auth.getUser(accessToken);

  if (error || !user) {
    throw createError({ statusCode: 401, statusMessage: "Session is invalid or expired" });
  }

  return {
    accessToken,
    user
  } satisfies { accessToken: string; user: User };
}
