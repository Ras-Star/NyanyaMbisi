import { defineEventHandler } from "h3";
import { requireAuthenticatedCustomer } from "../../utils/auth";
import { getCustomerProfile } from "../../data/customer-store";

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthenticatedCustomer(event);
  return getCustomerProfile(user.id, user.phone ?? "");
});
