import { createError, defineEventHandler, readBody } from "h3";
import { requireAuthenticatedCustomer } from "../../../utils/auth";
import { createCheckoutSession, getSupplierBySlug, updateCustomerProfile } from "../../../data/customer-store";
import type { CartLine, CheckoutCustomer, DeliveryQuote, PaymentProvider } from "../../../../shared/types";

export default defineEventHandler(async (event) => {
  const customerAccount = await requireAuthenticatedCustomer(event);
  const body = await readBody<{
    supplierSlug?: string;
    items?: CartLine[];
    customer?: CheckoutCustomer;
    quote?: DeliveryQuote;
    paymentProvider?: PaymentProvider;
  }>(event);

  const supplier = body.supplierSlug ? await getSupplierBySlug(body.supplierSlug) : null;

  if (!supplier || !body.items?.length || !body.customer || !body.quote || !body.paymentProvider) {
    throw createError({ statusCode: 400, statusMessage: "Checkout session payload is incomplete" });
  }

  if (!body.quote.serviceable) {
    throw createError({ statusCode: 400, statusMessage: "Delivery quote is not serviceable" });
  }

  if (!body.customer.fullName.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Full name is required before creating an order" });
  }

  const phone = customerAccount.phone || body.customer.phone;

  if (!phone) {
    throw createError({ statusCode: 400, statusMessage: "Signed-in customer phone number is unavailable" });
  }

  await updateCustomerProfile(customerAccount.userId ?? "", phone, {
    fullName: body.customer.fullName.trim(),
    defaultPin: body.customer.pin
  });

  return createCheckoutSession({
    customerAuthId: customerAccount.userId,
    supplierId: supplier.id,
    supplierName: supplier.name,
    items: body.items,
    customer: {
      ...body.customer,
      phone
    },
    quote: body.quote,
    paymentProvider: body.paymentProvider
  });
});
