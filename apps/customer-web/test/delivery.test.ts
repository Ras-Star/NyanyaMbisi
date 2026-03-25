import { describe, expect, it } from "vitest";
import { suppliers } from "../data/suppliers";
import { buildDeliveryQuote } from "../server/utils/delivery";

describe("buildDeliveryQuote", () => {
  it("returns the 0-2 km delivery band for a nearby pin inside the launch zone", () => {
    const supplier = suppliers[0];
    const quote = buildDeliveryQuote({
      supplier,
      pin: { lat: 0.3774, lng: 32.7774 },
      subtotalUgx: 12000
    });

    expect(quote.serviceable).toBe(true);
    expect(quote.deliveryFeeUgx).toBe(2000);
    expect(quote.platformFeeUgx).toBe(1500);
    expect(quote.totalUgx).toBe(15500);
  });

  it("blocks pins outside the launch area", () => {
    const supplier = suppliers[0];
    const quote = buildDeliveryQuote({
      supplier,
      pin: { lat: 0.4201, lng: 32.8801 },
      subtotalUgx: 12000
    });

    expect(quote.serviceable).toBe(false);
    expect(quote.reasons?.join(" ")).toContain("outside the active launch zones");
  });
});

