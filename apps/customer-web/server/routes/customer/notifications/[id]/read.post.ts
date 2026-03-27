import { createError, defineEventHandler, getRouterParam } from "h3";
import { requireAuthenticatedCustomer } from "../../../../utils/auth";
import { markNotificationRead } from "../../../../data/customer-store";

export default defineEventHandler(async (event) => {
  const customer = await requireAuthenticatedCustomer(event);
  const notificationId = getRouterParam(event, "id");

  if (!notificationId) {
    throw createError({ statusCode: 400, statusMessage: "Notification id is required" });
  }

  if (!customer.userId) {
    throw createError({ statusCode: 400, statusMessage: "Read state is managed locally for temporary phone sessions" });
  }

  const notification = await markNotificationRead(customer.userId, notificationId);

  if (!notification) {
    throw createError({ statusCode: 404, statusMessage: "Notification not found" });
  }

  return notification;
});
