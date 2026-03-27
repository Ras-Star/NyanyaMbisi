import { defineEventHandler } from "h3";
import { requireAuthenticatedCustomer } from "../../utils/auth";
import { listOrders } from "../../data/customer-store";

export default defineEventHandler(async (event) => {
  const customer = await requireAuthenticatedCustomer(event);
  return listOrders({
    customerAuthId: customer.userId,
    phone: customer.phone
  });
});
