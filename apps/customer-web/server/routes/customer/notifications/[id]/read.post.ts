import { createError, defineEventHandler, getRouterParam } from "h3";
import { requireAuthenticatedCustomer } from "../../../../utils/auth";
import { markNotificationRead } from "../../../../data/customer-store";

export default defineEventHandler(async (event) => {
  const { user } = await requireAuthenticatedCustomer(event);
  const notificationId = getRouterParam(event, "id");

  if (!notificationId) {
    throw createError({ statusCode: 400, statusMessage: "Notification id is required" });
  }

  const notification = await markNotificationRead(user.id, notificationId);

  if (!notification) {
    throw createError({ statusCode: 404, statusMessage: "Notification not found" });
  }

  return notification;
});
