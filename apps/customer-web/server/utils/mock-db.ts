import { randomUUID } from "node:crypto";
import { suppliers, suppliersBySlug } from "../../data/suppliers";
import { launchZones, platformFeeUgx } from "../../shared/service-areas";
import type {
  CartLine,
  CheckoutCustomer,
  CheckoutSession,
  MarketplaceResponse,
  OrderSummary,
  OtpStartResponse,
  OtpVerifyResponse,
  PaymentProvider
} from "../../shared/types";

const otpSessions = new Map<
  string,
  {
    phone: string;
    fullName: string;
    code: string;
    expiresAt: string;
  }
>();

const verifiedCustomers = new Map<string, { phone: string; fullName: string }>();
const orders = new Map<string, OrderSummary>();

function getPaymentNextSteps(paymentProvider: PaymentProvider, locale: CheckoutCustomer["locale"]) {
  if (locale === "lg") {
    return paymentProvider === "mtn"
      ? {
          title: "Kakasa okusaba kwa MTN ku ssimu yo",
          body: "Kakasa oba diala okusaba kwa MTN MoMo, olwo osigale ku lupapula luno nga omusuubuzi afuna oda."
        }
      : {
          title: "Kakasa okusaba kwa Airtel ku ssimu yo",
          body: "Kakasa okusaba kwa Airtel Money ku ssimu yo, olwo osigale ku lupapula luno nga omusuubuzi afuna oda."
        };
  }

  return paymentProvider === "mtn"
    ? {
        title: "Approve the MTN prompt on your phone",
        body: "Dial or confirm the MTN MoMo payment request, then keep this page open while your supplier receives the order."
      }
    : {
        title: "Approve the Airtel prompt on your phone",
        body: "Confirm the Airtel Money request on your phone, then keep this page open while your supplier receives the order."
      };
}

export function getMarketplace(): MarketplaceResponse {
  return {
    launchZones,
    suppliers: suppliers.map(({ products, story, prepWindow, badges, ...supplier }) => supplier),
    featuredMessage: "Quick neighborhood groceries with clear rider pricing.",
    platformFeeUgx
  };
}

export function getSupplierBySlug(slug: string) {
  return suppliersBySlug.get(slug) ?? null;
}

export function createOtpSession(fullName: string, phone: string): OtpStartResponse {
  const sessionId = randomUUID();
  const code = "2468";
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
  otpSessions.set(sessionId, { phone, fullName, code, expiresAt });

  return {
    phone,
    sessionId,
    expiresAt,
    devCode: code
  };
}

export function verifyOtp(sessionId: string, code: string): OtpVerifyResponse | null {
  const session = otpSessions.get(sessionId);

  if (!session || session.code !== code || new Date(session.expiresAt).getTime() < Date.now()) {
    return null;
  }

  const token = randomUUID();
  verifiedCustomers.set(token, { phone: session.phone, fullName: session.fullName });

  return {
    verified: true,
    token,
    customer: {
      fullName: session.fullName,
      phone: session.phone
    }
  };
}

export function getVerifiedCustomer(token: string) {
  return verifiedCustomers.get(token) ?? null;
}

export function createCheckoutSession({
  supplierName,
  items,
  customer,
  quote,
  paymentProvider
}: {
  supplierName: string;
  items: CartLine[];
  customer: CheckoutCustomer;
  quote: OrderSummary["quote"];
  paymentProvider: PaymentProvider;
}): CheckoutSession {
  const orderId = `order-${Date.now().toString(36)}`;
  const paymentReference = `${paymentProvider === "mtn" ? "MTN" : "AIR"}-${Math.floor(
    100000 + Math.random() * 900000
  )}`;
  const nextSteps = getPaymentNextSteps(paymentProvider, customer.locale);

  const session: CheckoutSession = {
    orderId,
    paymentProvider,
    paymentReference,
    paymentStatus: "pending",
    nextStepTitle: nextSteps.title,
    nextStepBody: nextSteps.body,
    amountUgx: quote.totalUgx
  };

  orders.set(orderId, {
    orderId,
    supplierName,
    items,
    status: "Received",
    paymentProvider,
    paymentReference,
    paymentStatus: "pending",
    timeline: [
      { label: "Received", complete: true },
      { label: "Preparing", complete: false },
      { label: "Out for Delivery", complete: false },
      { label: "Delivered", complete: false }
    ],
    quote,
    customer,
    createdAt: new Date().toISOString(),
    totalUgx: quote.totalUgx
  });

  return session;
}

export function getOrder(orderId: string) {
  return orders.get(orderId) ?? null;
}
