import { defineEventHandler } from "h3";
import { getMarketplace } from "../../utils/mock-db";

export default defineEventHandler(() => getMarketplace());
