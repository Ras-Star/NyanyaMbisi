import { defineEventHandler } from "h3";
import { requireAuthenticatedCustomer } from "../../utils/auth";
import { listOrders } from "../../data/customer-store";

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthenticatedCustomer(event);
  return listOrders(user.id);
});
