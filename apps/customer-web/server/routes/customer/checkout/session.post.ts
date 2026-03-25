import { createError, defineEventHandler, readBody } from "h3";
import { createCheckoutSession, getSupplierBySlug, getVerifiedCustomer } from "../../../utils/mock-db";
import type { CartLine, CheckoutCustomer, DeliveryQuote, PaymentProvider } from "../../../../shared/types";

export default defineEventHandler(async (event) => {
  const body = await readBody<{
    verifiedToken?: string;
    supplierSlug?: string;
    items?: CartLine[];
    customer?: CheckoutCustomer;
    quote?: DeliveryQuote;
    paymentProvider?: PaymentProvider;
  }>(event);

  const verifiedCustomer = body.verifiedToken ? getVerifiedCustomer(body.verifiedToken) : null;
  const supplier = body.supplierSlug ? getSupplierBySlug(body.supplierSlug) : null;

  if (!verifiedCustomer || !supplier || !body.items?.length || !body.customer || !body.quote || !body.paymentProvider) {
    throw createError({ statusCode: 400, statusMessage: "Checkout session payload is incomplete" });
  }

  if (!body.quote.serviceable) {
    throw createError({ statusCode: 400, statusMessage: "Delivery quote is not serviceable" });
  }

  return createCheckoutSession({
    supplierName: supplier.name,
    items: body.items,
    customer: body.customer,
    quote: body.quote,
    paymentProvider: body.paymentProvider
  });
});
