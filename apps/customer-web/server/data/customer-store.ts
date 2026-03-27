import { randomUUID } from "node:crypto";
import type {
  CartLine,
  CheckoutCustomer,
  CheckoutSession,
  DeliveryQuote,
  MarketplaceResponse,
  OrderSummary,
  OtpStartResponse,
  OtpVerifyResponse,
  PaymentProvider,
  Product,
  SupplierCard,
  SupplierStorefront
} from "../../shared/types";
import {
  createCheckoutSession as createLocalCheckoutSession,
  createOtpSession as createLocalOtpSession,
  getMarketplace as getLocalMarketplace,
  getOrder as getLocalOrder,
  getSupplierBySlug as getLocalSupplierBySlug,
  getVerifiedCustomer as getLocalVerifiedCustomer,
  verifyOtp as verifyLocalOtp
} from "../utils/mock-db";
import { getServerSupabaseClient, getSupabaseSettings } from "../utils/supabase";

interface ProductRow {
  id: string;
  supplier_id: string;
  category: string;
  name: string;
  description: string;
  unit_label: string;
  price_ugx: number;
  image: string;
  popular: boolean | null;
  sort_index: number | null;
}

interface SupplierRow {
  id: string;
  slug: string;
  name: string;
  area: SupplierStorefront["area"];
  tagline: string;
  eta_minutes: number;
  verified: boolean;
  rating: number;
  categories: string[] | null;
  hero: string;
  accent: string;
  min_basket_ugx: number;
  distance_km: number;
  open: boolean;
  pickup_partner: string;
  story: string;
  prep_window: string;
  badges: string[] | null;
  sort_index: number | null;
  products?: ProductRow[] | null;
}

interface OtpSessionRow {
  id: string;
  full_name: string;
  phone: string;
  code: string;
  expires_at: string;
}

interface VerifiedCustomerRow {
  token: string;
  full_name: string;
  phone: string;
}

interface OrderRow {
  id: string;
  supplier_name: string;
  items: CartLine[];
  status: OrderSummary["status"];
  payment_provider: PaymentProvider;
  payment_reference: string;
  payment_status: OrderSummary["paymentStatus"];
  timeline: OrderSummary["timeline"];
  quote: DeliveryQuote;
  customer: CheckoutCustomer;
  created_at: string;
  total_ugx: number;
}

const supplierSelect = `
  id,
  slug,
  name,
  area,
  tagline,
  eta_minutes,
  verified,
  rating,
  categories,
  hero,
  accent,
  min_basket_ugx,
  distance_km,
  open,
  pickup_partner,
  story,
  prep_window,
  badges,
  sort_index
`;

const supplierWithProductsSelect = `
  ${supplierSelect},
  products (
    id,
    supplier_id,
    category,
    name,
    description,
    unit_label,
    price_ugx,
    image,
    popular,
    sort_index
  )
`;

function logSupabaseFallback(scope: string, error: unknown) {
  console.warn(`[supabase] ${scope} failed, falling back to local data`, error);
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    supplierId: row.supplier_id,
    category: row.category,
    name: row.name,
    description: row.description,
    unitLabel: row.unit_label,
    priceUgx: row.price_ugx,
    image: row.image,
    ...(row.popular ? { popular: true } : {})
  };
}

function bySortIndex<T extends { sort_index: number | null }>(left: T, right: T) {
  return (left.sort_index ?? Number.MAX_SAFE_INTEGER) - (right.sort_index ?? Number.MAX_SAFE_INTEGER);
}

function mapSupplierCard(row: SupplierRow): SupplierCard {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    area: row.area,
    tagline: row.tagline,
    etaMinutes: row.eta_minutes,
    verified: row.verified,
    rating: row.rating,
    categories: row.categories ?? [],
    hero: row.hero,
    accent: row.accent,
    minBasketUgx: row.min_basket_ugx,
    distanceKm: row.distance_km,
    open: row.open,
    pickupPartner: row.pickup_partner
  };
}

function mapSupplierStorefront(row: SupplierRow): SupplierStorefront {
  return {
    ...mapSupplierCard(row),
    story: row.story,
    prepWindow: row.prep_window,
    badges: row.badges ?? [],
    products: (row.products ?? []).slice().sort(bySortIndex).map(mapProduct)
  };
}

function mapOrder(row: OrderRow): OrderSummary {
  return {
    orderId: row.id,
    supplierName: row.supplier_name,
    items: row.items,
    status: row.status,
    paymentProvider: row.payment_provider,
    paymentReference: row.payment_reference,
    paymentStatus: row.payment_status,
    timeline: row.timeline,
    quote: row.quote,
    customer: row.customer,
    createdAt: row.created_at,
    totalUgx: row.total_ugx
  };
}

function buildOrderTimeline(): OrderSummary["timeline"] {
  return [
    { label: "Received", complete: true },
    { label: "Preparing", complete: false },
    { label: "Out for Delivery", complete: false },
    { label: "Delivered", complete: false }
  ];
}

export async function getMarketplace(): Promise<MarketplaceResponse> {
  const localMarketplace = getLocalMarketplace();
  const client = getServerSupabaseClient();

  if (!client) {
    return localMarketplace;
  }

  try {
    const { data, error } = await client.from("suppliers").select(supplierSelect).order("sort_index", { ascending: true });

    if (error) {
      throw error;
    }

    if (!data?.length) {
      return localMarketplace;
    }

    return {
      ...localMarketplace,
      suppliers: (data as SupplierRow[]).map(mapSupplierCard)
    };
  } catch (error) {
    logSupabaseFallback("getMarketplace", error);
    return localMarketplace;
  }
}

export async function getSupplierBySlug(slug: string) {
  const client = getServerSupabaseClient();

  if (!client) {
    return getLocalSupplierBySlug(slug);
  }

  try {
    const { data, error } = await client
      .from("suppliers")
      .select(supplierWithProductsSelect)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return getLocalSupplierBySlug(slug);
    }

    return mapSupplierStorefront(data as SupplierRow);
  } catch (error) {
    logSupabaseFallback("getSupplierBySlug", error);
    return getLocalSupplierBySlug(slug);
  }
}

export async function createOtpSession(fullName: string, phone: string): Promise<OtpStartResponse> {
  const client = getServerSupabaseClient();
  const { otpDevCode } = getSupabaseSettings();

  if (!client) {
    return createLocalOtpSession(fullName, phone);
  }

  try {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    const { data, error } = await client
      .from("otp_sessions")
      .insert({
        full_name: fullName,
        phone,
        code: otpDevCode,
        expires_at: expiresAt
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return {
      phone,
      sessionId: data.id as string,
      expiresAt,
      devCode: otpDevCode
    };
  } catch (error) {
    logSupabaseFallback("createOtpSession", error);
    return createLocalOtpSession(fullName, phone);
  }
}

export async function verifyOtp(sessionId: string, code: string): Promise<OtpVerifyResponse | null> {
  const client = getServerSupabaseClient();

  if (!client) {
    return verifyLocalOtp(sessionId, code);
  }

  try {
    const { data, error } = await client
      .from("otp_sessions")
      .select("id, full_name, phone, code, expires_at")
      .eq("id", sessionId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return verifyLocalOtp(sessionId, code);
    }

    const session = data as OtpSessionRow;

    if (session.code !== code || new Date(session.expires_at).getTime() < Date.now()) {
      return null;
    }

    const token = randomUUID();
    const verifiedAt = new Date().toISOString();
    const { error: updateError } = await client.from("otp_sessions").update({ verified_at: verifiedAt }).eq("id", sessionId);

    if (updateError) {
      throw updateError;
    }

    const { error: insertError } = await client.from("verified_customers").upsert({
      token,
      full_name: session.full_name,
      phone: session.phone,
      session_id: sessionId
    });

    if (insertError) {
      throw insertError;
    }

    return {
      verified: true,
      token,
      customer: {
        fullName: session.full_name,
        phone: session.phone
      }
    };
  } catch (error) {
    logSupabaseFallback("verifyOtp", error);
    return verifyLocalOtp(sessionId, code);
  }
}

export async function getVerifiedCustomer(token: string) {
  const client = getServerSupabaseClient();

  if (!client) {
    return getLocalVerifiedCustomer(token);
  }

  try {
    const { data, error } = await client
      .from("verified_customers")
      .select("token, full_name, phone")
      .eq("token", token)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return getLocalVerifiedCustomer(token);
    }

    const customer = data as VerifiedCustomerRow;

    return {
      phone: customer.phone,
      fullName: customer.full_name
    };
  } catch (error) {
    logSupabaseFallback("getVerifiedCustomer", error);
    return getLocalVerifiedCustomer(token);
  }
}

export async function createCheckoutSession({
  supplierId,
  supplierName,
  items,
  customer,
  quote,
  paymentProvider
}: {
  supplierId: string;
  supplierName: string;
  items: CartLine[];
  customer: CheckoutCustomer;
  quote: OrderSummary["quote"];
  paymentProvider: PaymentProvider;
}): Promise<CheckoutSession> {
  const client = getServerSupabaseClient();

  if (!client) {
    return createLocalCheckoutSession({
      supplierName,
      items,
      customer,
      quote,
      paymentProvider
    });
  }

  try {
    const orderId = `order-${Date.now().toString(36)}`;
    const paymentReference = `${paymentProvider === "mtn" ? "MTN" : "AIR"}-${Math.floor(
      100000 + Math.random() * 900000
    )}`;
    const nextSteps =
      customer.locale === "lg"
        ? paymentProvider === "mtn"
          ? {
              title: "Kakasa okusaba kwa MTN ku ssimu yo",
              body: "Kakasa oba diala okusaba kwa MTN MoMo, olwo osigale ku lupapula luno nga omusuubuzi afuna oda."
            }
          : {
              title: "Kakasa okusaba kwa Airtel ku ssimu yo",
              body: "Kakasa okusaba kwa Airtel Money ku ssimu yo, olwo osigale ku lupapula luno nga omusuubuzi afuna oda."
            }
        : paymentProvider === "mtn"
          ? {
              title: "Approve the MTN prompt on your phone",
              body: "Dial or confirm the MTN MoMo payment request, then keep this page open while your supplier receives the order."
            }
          : {
              title: "Approve the Airtel prompt on your phone",
              body: "Confirm the Airtel Money request on your phone, then keep this page open while your supplier receives the order."
            };

    const session: CheckoutSession = {
      orderId,
      paymentProvider,
      paymentReference,
      paymentStatus: "pending",
      nextStepTitle: nextSteps.title,
      nextStepBody: nextSteps.body,
      amountUgx: quote.totalUgx
    };

    const { error } = await client.from("orders").insert({
      id: orderId,
      supplier_id: supplierId,
      supplier_name: supplierName,
      items,
      status: "Received",
      payment_provider: paymentProvider,
      payment_reference: paymentReference,
      payment_status: "pending",
      timeline: buildOrderTimeline(),
      quote,
      customer,
      created_at: new Date().toISOString(),
      total_ugx: quote.totalUgx
    });

    if (error) {
      throw error;
    }

    return session;
  } catch (error) {
    logSupabaseFallback("createCheckoutSession", error);
    return createLocalCheckoutSession({
      supplierName,
      items,
      customer,
      quote,
      paymentProvider
    });
  }
}

export async function getOrder(orderId: string) {
  const client = getServerSupabaseClient();

  if (!client) {
    return getLocalOrder(orderId);
  }

  try {
    const { data, error } = await client
      .from("orders")
      .select(
        "id, supplier_name, items, status, payment_provider, payment_reference, payment_status, timeline, quote, customer, created_at, total_ugx"
      )
      .eq("id", orderId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      return getLocalOrder(orderId);
    }

    return mapOrder(data as OrderRow);
  } catch (error) {
    logSupabaseFallback("getOrder", error);
    return getLocalOrder(orderId);
  }
}
