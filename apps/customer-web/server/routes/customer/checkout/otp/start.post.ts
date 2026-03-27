import { createError, defineEventHandler, readBody } from "h3";
import { createOtpSession } from "../../../../data/customer-store";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ fullName?: string; phone?: string }>(event);

  if (!body.fullName || !body.phone) {
    throw createError({ statusCode: 400, statusMessage: "Full name and phone are required" });
  }

  return createOtpSession(body.fullName, body.phone);
});
