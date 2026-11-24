import { describe, expect, it } from "vitest";
import { recommend, type RecommendInput } from "../recommend";
import type { ListItem, Offer, Product, RecommendSettings, Retailer, Store } from "../types";

const retailers: Retailer[] = [
  { id: "a", slug: "a", name: "Alpha", shortName: "A", loyaltyProgram: "A Card", color: "#000" },
  { id: "b", slug: "b", name: "Beta", shortName: "B", loyaltyProgram: null, color: "#000" },
  { id: "c", slug: "c", name: "Gamma", shortName: "C", loyaltyProgram: null, color: "#000" },
];

// All stores ~1 km apart around a reference point so travel cost is small and predictable.
const stores: Store[] = [
  { id: "sa", retailerId: "a", name: "Alpha Mall", suburb: "X", city: "Y", lat: -26.1, lng: 28.0 },
  { id: "sb", retailerId: "b", name: "Beta Mall", suburb: "X", city: "Y", lat: -26.1, lng: 28.01 },
  { id: "sc", retailerId: "c", name: "Gamma Far", suburb: "X", city: "Y", lat: -26.6, lng: 28.5 }, // ~70 km away
];

const products: Product[] = [
  { id: "milk-x", slug: "milk-x", name: "Milk X 2L", brand: "X", category: "dairy", sizeValue: 2, sizeUnit: "L" },
  { id: "milk-y", slug: "milk-y", name: "Milk Y 2L", brand: "Y", category: "dairy", sizeValue: 2, sizeUnit: "L" },
  { id: "bread", slug: "bread", name: "Bread 700g", brand: "Z", category: "bakery", sizeValue: 700, sizeUnit: "g" },
  { id: "rice", slug: "rice", name: "Rice 2kg", brand: "Z", category: "pantry", sizeValue: 2, sizeUnit: "kg" },
];

const offer = (productId: string, retailerId: string, price: number, extra?: Partial<Offer>): Offer => ({
  productId,
  retailerId,
  price,
  observedAt: "2026-01-01",
  sourceKind: "leaflet",
  ...extra,
});

const settings: RecommendSettings = {
  lat: -26.1,
  lng: 28.0,
  radiusKm: 10,
  maxStops: 2,
  loyaltyCards: [],
  travelMode: "car",
  travelCostPerKm: 0, // isolate basket maths in most tests
  stopPenaltyRand: 0,
  minSplitSavingRand: 0,
};

const items: ListItem[] = [
  { id: "i1", rawText: "milk", productId: "milk-x", qty: 2, flexible: false },
  { id: "i2", rawText: "bread", productId: "bread", qty: 1, flexible: false },
];

function run(overrides: Partial<RecommendInput>) {
  return recommend({
    items,
    settings,
    products,
    offers: [],
    stores,
    retailers,
    fairPrices: {},
    ...overrides,
  });
}

describe("recommend", () => {
  it("excludes retailers with no store inside the radius", () => {
    const r = run({ offers: [offer("milk-x", "c", 1)] });
    expect(r.consideredRetailerIds).toEqual(["a", "b"]);
  });

  it("picks the cheapest single store when a split saves nothing", () => {
    const r = run({
      offers: [
        offer("milk-x", "a", 30),
        offer("bread", "a", 15),
        offer("milk-x", "b", 32),
        offer("bread", "b", 16),
      ],
    });
    expect(r.options[0].id).toBe("a");
    expect(r.options[0].basketTotal).toBe(75);
    // A split where B contributes nothing is not a real 2-stop option.
    expect(r.options.every((o) => o.stops.length === 1)).toBe(true);
  });

  it("recommends a split when it beats the best single store by the threshold", () => {
    const r = run({
      settings: { ...settings, minSplitSavingRand: 5 },
      offers: [
        offer("milk-x", "a", 20), // A cheap milk
        offer("bread", "a", 20),
        offer("milk-x", "b", 30),
        offer("bread", "b", 10), // B cheap bread
      ],
    });
    // Singles: A = 40+20 = 60, B = 60+10 = 70. Split = 40 + 10 = 50, saving 10 >= 5.
    expect(r.options[0].id).toBe("a+b");
    expect(r.options[0].total).toBe(50);
    expect(r.options[0].savingVsBestSingle).toBe(10);
  });

  it("drops a split that does not meet the minimum saving", () => {
    const r = run({
      settings: { ...settings, minSplitSavingRand: 20 },
      offers: [offer("milk-x", "a", 20), offer("bread", "a", 20), offer("milk-x", "b", 30), offer("bread", "b", 10)],
    });
    expect(r.options.map((o) => o.id)).toEqual(["a", "b"]);
  });

  it("adds travel cost and stop penalty to the total", () => {
    const r = run({
      settings: { ...settings, travelCostPerKm: 10, stopPenaltyRand: 15 },
      // A alone = 40 + 60 = 100 with no travel (store at the user's location).
      // Split = 40 + 1 + ~R26 travel to B + R15 stop penalty ≈ 82, so it wins.
      offers: [offer("milk-x", "a", 20), offer("bread", "a", 60), offer("milk-x", "b", 30), offer("bread", "b", 1)],
    });
    const split = r.options.find((o) => o.id === "a+b")!;
    expect(r.options[0].id).toBe("a+b");
    expect(split.stopPenalty).toBe(15);
    expect(split.travelCost).toBeGreaterThan(0);
    expect(split.total).toBe(split.basketTotal + split.travelCost + split.stopPenalty);
  });

  it("prefers coverage over price", () => {
    const r = run({
      settings: { ...settings, maxStops: 1 },
      offers: [offer("milk-x", "a", 1), offer("milk-x", "b", 50), offer("bread", "b", 50)],
    });
    expect(r.options[0].id).toBe("b");
    expect(r.options[0].missingItemIds).toEqual([]);
    const a = r.options.find((o) => o.id === "a")!;
    expect(a.missingItemIds).toEqual(["i2"]);
  });

  it("substitutes within category and size when the item is flexible", () => {
    const r = run({
      items: [{ id: "i1", rawText: "any milk", productId: "milk-x", qty: 1, flexible: true }],
      offers: [offer("milk-x", "a", 30), offer("milk-y", "a", 25), offer("rice", "a", 1)],
    });
    const line = r.options[0].items[0];
    expect(line.productId).toBe("milk-y");
    expect(line.substituted).toBe(true);
  });

  it("uses card prices only for held cards", () => {
    const offers = [
      offer("milk-x", "a", 30, {
        promo: { rule: { type: "card_price", price: 20 }, label: "A Card price", validTo: "2026-01-07" },
      }),
      offer("bread", "a", 10),
      offer("milk-x", "b", 25),
      offer("bread", "b", 10),
    ];
    const without = run({ offers });
    expect(without.options[0].id).toBe("b"); // 50+10 vs 60+10
    const withCard = run({ offers, settings: { ...settings, loyaltyCards: ["a"] } });
    expect(withCard.options[0].id).toBe("a"); // 40+10
    expect(withCard.options[0].items[0].promoLabel).toBe("A Card price");
  });

  it("returns a per-item comparison sorted by cost", () => {
    const r = run({ offers: [offer("milk-x", "a", 30), offer("milk-x", "b", 25), offer("bread", "a", 10)] });
    const milk = r.comparison.find((c) => c.itemId === "i1")!;
    expect(milk.cheapestRetailerId).toBe("b");
    expect(milk.perRetailer.map((p) => p.retailerId)).toEqual(["b", "a"]);
  });
});
