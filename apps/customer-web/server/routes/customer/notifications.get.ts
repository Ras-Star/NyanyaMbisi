import { defineEventHandler } from "h3";
import { requireAuthenticatedCustomer } from "../../utils/auth";
import { listNotifications } from "../../data/customer-store";

export default defineEventHandler(async (event) => {
  const customer = await requireAuthenticatedCustomer(event);
  return listNotifications({
    customerAuthId: customer.userId,
    phone: customer.phone
  });
});
