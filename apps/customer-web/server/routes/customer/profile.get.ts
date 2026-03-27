import { defineEventHandler } from "h3";
import { requireAuthenticatedCustomer } from "../../utils/auth";
import { getCustomerProfile } from "../../data/customer-store";

export default defineEventHandler(async (event) => {
  const customer = await requireAuthenticatedCustomer(event);
  return getCustomerProfile(customer.userId ?? "", customer.phone);
});
