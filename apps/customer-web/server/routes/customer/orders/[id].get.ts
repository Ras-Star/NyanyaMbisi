import { createError, defineEventHandler, getRouterParam } from "h3";
import { getOrder } from "../../../utils/mock-db";

export default defineEventHandler((event) => {
  const orderId = getRouterParam(event, "id");
  const order = orderId ? getOrder(orderId) : null;

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: "Order not found" });
  }

  return order;
});

