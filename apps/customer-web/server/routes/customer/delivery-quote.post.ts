import { createError, defineEventHandler, readBody } from "h3";
import { getSupplierBySlug } from "../../data/customer-store";
import { buildDeliveryQuote } from "../../utils/delivery";
import type { MapPin } from "../../../shared/types";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ supplierSlug?: string; pin?: MapPin | null; subtotalUgx?: number }>(event);
  const supplier = body.supplierSlug ? await getSupplierBySlug(body.supplierSlug) : null;

  if (!supplier || typeof body.subtotalUgx !== "number") {
    throw createError({ statusCode: 400, statusMessage: "Invalid quote request" });
  }

  return buildDeliveryQuote({
    supplier,
    pin: body.pin ?? null,
    subtotalUgx: body.subtotalUgx
  });
});
