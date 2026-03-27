import { createError, getHeader, type H3Event } from "h3";
import { getVerifiedCustomer } from "../data/customer-store";
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

  if (client) {
    const {
      data: { user },
      error
    } = await client.auth.getUser(accessToken);

    if (!error && user) {
      return {
        accessToken,
        mode: "supabase" as const,
        user,
        userId: user.id,
        phone: user.phone ?? "",
        fullName: String(user.user_metadata?.full_name ?? "")
      };
    }
  }

  const verifiedCustomer = await getVerifiedCustomer(accessToken);

  if (verifiedCustomer) {
    return {
      accessToken,
      mode: "fallback" as const,
      user: null,
      userId: null,
      phone: verifiedCustomer.phone,
      fullName: verifiedCustomer.fullName
    };
  }

  throw createError({ statusCode: 401, statusMessage: "Session is invalid or expired" });
}
