import { createError, defineEventHandler, getRouterParam } from "h3";
import { getOrder } from "../../../data/customer-store";

export default defineEventHandler(async (event) => {
  const orderId = getRouterParam(event, "id");
  const order = orderId ? await getOrder(orderId) : null;

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  return order;
});
