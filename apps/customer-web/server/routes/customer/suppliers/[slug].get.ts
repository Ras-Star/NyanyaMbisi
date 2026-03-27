import { createError, defineEventHandler, getRouterParam } from "h3";
import { getSupplierBySlug } from "../../../data/customer-store";

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, "slug");
  const supplier = slug ? await getSupplierBySlug(slug) : null;

  if (!supplier) {
    throw createError({ statusCode: 404, statusMessage: "Supplier not found" });
  }

  return supplier;
});
