import { describe, expect, it } from "vitest";
import { costForQuantity } from "../promo";
import type { Offer } from "../types";

const base: Offer = {
  productId: "p1",
  retailerId: "r1",
  price: 30,
  observedAt: "2026-01-01",
  sourceKind: "leaflet",
};

describe("costForQuantity", () => {
  it("charges shelf price without a promo", () => {
    const c = costForQuantity(base, 3, false);
    expect(c.total).toBe(90);
    expect(c.unitEffective).toBe(30);
    expect(c.promoApplied).toBe(false);
  });

  it("applies a card price only when the shopper holds the card", () => {
    const offer: Offer = {
      ...base,
      promo: { rule: { type: "card_price", price: 25 }, label: "Xtra Savings price", validTo: "2026-01-07" },
    };
    expect(costForQuantity(offer, 2, true).total).toBe(50);
    const noCard = costForQuantity(offer, 2, false);
    expect(noCard.total).toBe(60);
    expect(noCard.note).toContain("loyalty card");
  });

  it("caps card price at the per-customer limit", () => {
    const offer: Offer = {
      ...base,
      promo: { rule: { type: "card_price", price: 25 }, label: "", validTo: "2026-01-07", limit: 2 },
    };
    expect(costForQuantity(offer, 4, true).total).toBe(2 * 25 + 2 * 30);
  });

  it("handles multibuy with a remainder at shelf price", () => {
    const offer: Offer = {
      ...base,
      promo: { rule: { type: "multibuy", n: 2, price: 50 }, label: "2 for R50", validTo: "2026-01-07" },
    };
    expect(costForQuantity(offer, 2, false).total).toBe(50);
    expect(costForQuantity(offer, 3, false).total).toBe(80);
    expect(costForQuantity(offer, 1, false).total).toBe(30);
  });

  it("suggests adding a unit when the full multibuy costs less than the remainder", () => {
    // 3 for R40 vs 2 at R30 each = R60: buying 3 is cheaper than buying 2.
    const offer: Offer = {
      ...base,
      promo: { rule: { type: "multibuy", n: 3, price: 40 }, label: "3 for R40", validTo: "2026-01-07" },
    };
    const c = costForQuantity(offer, 2, false);
    expect(c.total).toBe(60);
    expect(c.note).toMatch(/Add 1 more/);
    expect(c.note).toMatch(/costs less/);
  });

  it("respects multibuy limits", () => {
    const offer: Offer = {
      ...base,
      promo: { rule: { type: "multibuy", n: 2, price: 50 }, label: "2 for R50", validTo: "2026-01-07", limit: 2 },
    };
    // Only one group of 2 allowed; the other 2 at shelf price.
    expect(costForQuantity(offer, 4, false).total).toBe(50 + 60);
  });

  it("applies percent off", () => {
    const offer: Offer = {
      ...base,
      promo: { rule: { type: "percent_off", percent: 20 }, label: "20% off", validTo: "2026-01-07" },
    };
    expect(costForQuantity(offer, 2, false).total).toBe(48);
  });

  it("applies buy n get m free", () => {
    const offer: Offer = {
      ...base,
      promo: { rule: { type: "buy_n_get_m_free", n: 2, m: 1 }, label: "Buy 2 get 1 free", validTo: "2026-01-07" },
    };
    expect(costForQuantity(offer, 3, false).total).toBe(60);
    expect(costForQuantity(offer, 6, false).total).toBe(120);
    expect(costForQuantity(offer, 4, false).total).toBe(90);
    expect(costForQuantity(offer, 2, false).note).toMatch(/Add 1 more/);
  });

  it("rounds to cents", () => {
    const offer: Offer = {
      ...base,
      price: 10.99,
      promo: { rule: { type: "percent_off", percent: 33 }, label: "", validTo: "2026-01-07" },
    };
    const c = costForQuantity(offer, 3, false);
    expect(Number.isInteger(c.total * 100)).toBe(true);
  });
});
