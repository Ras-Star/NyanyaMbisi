import { createError, defineEventHandler, getRouterParam } from "h3";
import { getSupplierBySlug } from "../../../utils/mock-db";

export default defineEventHandler((event) => {
  const slug = getRouterParam(event, "slug");
  const supplier = slug ? getSupplierBySlug(slug) : null;

  if (!supplier) {
    throw createError({ statusCode: 404, statusMessage: "Supplier not found" });
  }

  return supplier;
});

