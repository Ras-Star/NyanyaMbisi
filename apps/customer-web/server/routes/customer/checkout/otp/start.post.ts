import { createError, defineEventHandler, readBody } from "h3";
import { normalizePhoneNumber } from "../../../../../shared/phone";
import { createOtpSession } from "../../../../data/customer-store";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ fullName?: string; phone?: string }>(event);

  if (!body.phone) {
    throw createError({ statusCode: 400, statusMessage: "Phone number is required" });
  }

  const normalizedPhone = normalizePhoneNumber(body.phone);

  if (!normalizedPhone) {
    throw createError({ statusCode: 400, statusMessage: "Use an MTN Uganda or Airtel Uganda mobile number." });
  }

  return createOtpSession(body.fullName?.trim() ?? "", normalizedPhone);
});
