import { defineEventHandler } from "h3";
import { getMarketplace } from "../../data/customer-store";

export default defineEventHandler(() => getMarketplace());
