import { createError, defineEventHandler, getRouterParam } from "h3";
import { requireAuthenticatedCustomer } from "../../../utils/auth";
import { getOrder } from "../../../data/customer-store";

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthenticatedCustomer(event);
  const orderId = getRouterParam(event, "id");
  const order = orderId ? await getOrder(orderId, user.id) : null;

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  return order;
});
