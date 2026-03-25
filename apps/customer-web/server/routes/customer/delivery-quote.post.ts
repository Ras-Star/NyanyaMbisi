import { createError, defineEventHandler, readBody } from "h3";
import { buildDeliveryQuote } from "../../utils/delivery";
import { getSupplierBySlug } from "../../utils/mock-db";
import type { MapPin } from "../../../shared/types";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ supplierSlug?: string; pin?: MapPin | null; subtotalUgx?: number }>(event);
  const supplier = body.supplierSlug ? getSupplierBySlug(body.supplierSlug) : null;

  if (!supplier || typeof body.subtotalUgx !== "number") {
    throw createError({ statusCode: 400, statusMessage: "Invalid quote request" });
  }

  return buildDeliveryQuote({
    supplier,
    pin: body.pin ?? null,
    subtotalUgx: body.subtotalUgx
  });
});

