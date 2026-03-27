import { createError, defineEventHandler, readBody } from "h3";
import type { MapPin } from "../../../shared/types";
import { requireAuthenticatedCustomer } from "../../utils/auth";
import { updateCustomerProfile } from "../../data/customer-store";

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthenticatedCustomer(event);
  const body = await readBody<{ fullName?: string; defaultPin?: MapPin | null }>(event);

  if (body.fullName !== undefined && !body.fullName.trim()) {
    throw createError({ statusCode: 400, statusMessage: "Full name cannot be empty" });
  }

  return updateCustomerProfile(user.id, user.phone ?? "", {
    ...(body.fullName !== undefined ? { fullName: body.fullName.trim() } : {}),
    ...(Object.prototype.hasOwnProperty.call(body, "defaultPin") ? { defaultPin: body.defaultPin ?? null } : {})
  });
});
