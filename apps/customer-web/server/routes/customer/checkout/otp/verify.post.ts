import { createError, defineEventHandler, readBody } from "h3";
import { verifyOtp } from "../../../../data/customer-store";

export default defineEventHandler(async (event) => {
  const body = await readBody<{ sessionId?: string; code?: string }>(event);

  if (!body.sessionId || !body.code) {
    throw createError({ statusCode: 400, statusMessage: "Session and code are required" });
  }

  const result = verifyOtp(body.sessionId, body.code);

  if (!result) {
    throw createError({ statusCode: 401, statusMessage: "OTP code is invalid or expired" });
  }

  return result;
});
