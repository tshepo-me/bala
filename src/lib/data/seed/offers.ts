import type { Offer, PricePoint, Promo } from "@/lib/domain/types";
import { roundRand } from "@/lib/domain/promo";
import { retailers } from "./retailers";
import { seedProducts } from "./products";

/* ------------------------------------------------------------------ */
/* Deterministic pseudo-randomness so the demo is stable across builds */
/* ------------------------------------------------------------------ */

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Retail-style price endings: .99 or .49. */
function retailRound(value: number): number {
  const whole = Math.floor(value);
  const frac = value - whole;
  return roundRand(frac < 0.5 ? whole + 0.49 : whole + 0.99);
}

/* ------------------------------------------------------------------ */
/* Dates                                                               */
/* ------------------------------------------------------------------ */

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function startOfWeek(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const day = (x.getUTCDay() + 6) % 7; // Monday = 0
  x.setUTCDate(x.getUTCDate() - day);
  return x;
}

const today = new Date();
const weekStart = startOfWeek(today);
const weekEnd = new Date(weekStart);
weekEnd.setUTCDate(weekEnd.getUTCDate() + 6);
export const CURRENT_WEEK = { from: isoDate(weekStart), to: isoDate(weekEnd) };

/* ------------------------------------------------------------------ */
/* Retailer pricing profile                                            */
/* ------------------------------------------------------------------ */

const retailerFactor: Record<string, number> = {
  checkers: 1.0,
  shoprite: 0.95,
  pnp: 1.02,
  woolworths: 1.16,
  spar: 1.06,
  boxer: 0.93,
};

/* ------------------------------------------------------------------ */
/* Hand-picked specials for this week                                  */
/* ------------------------------------------------------------------ */

interface SeedPromo {
  productId: string;
  retailerId: string;
  promo: Omit<Promo, "validTo">;
}

const seedPromos: SeedPromo[] = [
  { productId: "clover-full-cream-milk-2l", retailerId: "checkers", promo: { rule: { type: "card_price", price: 29.99 }, label: "Xtra Savings price" } },
  { productId: "clover-full-cream-milk-2l", retailerId: "pnp", promo: { rule: { type: "multibuy", n: 2, price: 62 }, label: "2 for R62" } },
  { productId: "albany-white-bread-700g", retailerId: "shoprite", promo: { rule: { type: "card_price", price: 15.99 }, label: "Xtra Savings price", limit: 4 } },
  { productId: "sasko-brown-bread-700g", retailerId: "pnp", promo: { rule: { type: "multibuy", n: 2, price: 30 }, label: "2 for R30" } },
  { productId: "nulaid-large-eggs-18", retailerId: "woolworths", promo: { rule: { type: "percent_off", percent: 20 }, label: "20% off" } },
  { productId: "tastic-rice-2kg", retailerId: "checkers", promo: { rule: { type: "card_price", price: 49.99 }, label: "Xtra Savings price" } },
  { productId: "white-star-maize-meal-5kg", retailerId: "boxer", promo: { rule: { type: "multibuy", n: 2, price: 139 }, label: "2 for R139" } },
  { productId: "white-star-maize-meal-5kg", retailerId: "shoprite", promo: { rule: { type: "card_price", price: 69.99 }, label: "Xtra Savings price", limit: 2 } },
  { productId: "sunfoil-sunflower-oil-2l", retailerId: "pnp", promo: { rule: { type: "card_price", price: 64.99 }, label: "Smart Shopper price" } },
  { productId: "huletts-white-sugar-2-5kg", retailerId: "spar", promo: { rule: { type: "multibuy", n: 2, price: 120 }, label: "2 for R120" } },
  { productId: "koo-baked-beans-410g", retailerId: "checkers", promo: { rule: { type: "multibuy", n: 4, price: 60 }, label: "4 for R60" } },
  { productId: "koo-baked-beans-410g", retailerId: "shoprite", promo: { rule: { type: "buy_n_get_m_free", n: 2, m: 1 }, label: "Buy 2 get 1 free" } },
  { productId: "lucky-star-pilchards-400g", retailerId: "boxer", promo: { rule: { type: "multibuy", n: 3, price: 70 }, label: "3 for R70" } },
  { productId: "jacobs-kronung-coffee-200g", retailerId: "pnp", promo: { rule: { type: "card_price", price: 99.99 }, label: "Smart Shopper price" } },
  { productId: "ricoffy-750g", retailerId: "shoprite", promo: { rule: { type: "card_price", price: 114.99 }, label: "Xtra Savings price" } },
  { productId: "coca-cola-2l", retailerId: "spar", promo: { rule: { type: "multibuy", n: 2, price: 45 }, label: "2 for R45" } },
  { productId: "coca-cola-2l", retailerId: "checkers", promo: { rule: { type: "multibuy", n: 2, price: 46 }, label: "2 for R46" } },
  { productId: "chicken-braai-pack-2kg", retailerId: "shoprite", promo: { rule: { type: "card_price", price: 89.99 }, label: "Xtra Savings price" } },
  { productId: "chicken-breast-fillets-1kg", retailerId: "woolworths", promo: { rule: { type: "percent_off", percent: 25 }, label: "25% off" } },
  { productId: "beef-mince-1kg", retailerId: "pnp", promo: { rule: { type: "card_price", price: 119.99 }, label: "Smart Shopper price" } },
  { productId: "potatoes-7kg", retailerId: "boxer", promo: { rule: { type: "card_price", price: 69.99 }, label: "Boxer price drop" } },
  { productId: "potatoes-7kg", retailerId: "checkers", promo: { rule: { type: "card_price", price: 74.99 }, label: "Xtra Savings price" } },
  { productId: "bananas-1kg", retailerId: "spar", promo: { rule: { type: "percent_off", percent: 30 }, label: "30% off" } },
  { productId: "baby-soft-toilet-paper-18", retailerId: "pnp", promo: { rule: { type: "card_price", price: 124.99 }, label: "Smart Shopper price" } },
  { productId: "omo-auto-washing-powder-2kg", retailerId: "checkers", promo: { rule: { type: "card_price", price: 89.99 }, label: "Xtra Savings price" } },
  { productId: "sunlight-dishwashing-liquid-750ml", retailerId: "shoprite", promo: { rule: { type: "multibuy", n: 2, price: 65 }, label: "2 for R65" } },
  { productId: "colgate-toothpaste-100ml", retailerId: "pnp", promo: { rule: { type: "buy_n_get_m_free", n: 2, m: 1 }, label: "Buy 2 get 1 free" } },
  { productId: "pampers-size-4-58", retailerId: "checkers", promo: { rule: { type: "card_price", price: 229.99 }, label: "Xtra Savings price" } },
  { productId: "bobtail-dog-food-8kg", retailerId: "shoprite", promo: { rule: { type: "card_price", price: 159.99 }, label: "Xtra Savings price" } },
  { productId: "danone-nutriday-yoghurt-1kg", retailerId: "woolworths", promo: { rule: { type: "multibuy", n: 2, price: 80 }, label: "2 for R80" } },
];

/* ------------------------------------------------------------------ */
/* Generation                                                          */
/* ------------------------------------------------------------------ */

/** Shelf price of a product at a retailer, before this week's special. */
function shelfPrice(productId: string, basePrice: number, retailerId: string): number {
  const r = rng(hashString(`${productId}|${retailerId}`));
  const jitter = 0.96 + r() * 0.1; // 0.96 .. 1.06
  return retailRound(basePrice * (retailerFactor[retailerId] ?? 1) * jitter);
}

// Boxer's "price drop" is really a plain markdown: no card needed.
// Represent as card_price with the retailer having no loyalty programme would
// block it, so convert to a straight price cut instead.
function normalisePromo(retailerId: string, promo: Omit<Promo, "validTo">): Omit<Promo, "validTo"> | null {
  const retailer = retailers.find((r) => r.id === retailerId);
  if (promo.rule.type === "card_price" && !retailer?.loyaltyProgram) return null;
  return promo;
}

export function buildOffers(): Offer[] {
  const offers: Offer[] = [];
  const observedAt = CURRENT_WEEK.from;
  for (const sp of seedProducts) {
    for (const retailer of retailers) {
      if (sp.notAt?.includes(retailer.id)) continue;
      const price = shelfPrice(sp.id, sp.basePrice, retailer.id);
      const seed = seedPromos.find((x) => x.productId === sp.id && x.retailerId === retailer.id);
      let offer: Offer = { productId: sp.id, retailerId: retailer.id, price, observedAt, sourceKind: "leaflet" };
      if (seed) {
        const promo = normalisePromo(retailer.id, seed.promo);
        if (promo) {
          offer = { ...offer, promo: { ...promo, validTo: CURRENT_WEEK.to } };
        } else if (seed.promo.rule.type === "card_price") {
          // Straight markdown: new shelf price with a "was" price.
          offer = { ...offer, price: seed.promo.rule.price, wasPrice: price };
        }
      }
      offers.push(offer);
    }
  }
  return offers;
}

/**
 * 90 days of weekly price points per (product, retailer). Mostly flat with
 * occasional dips, ending at the current shelf price so the chart agrees with
 * the table.
 */
export function buildHistory(offers: Offer[], weeks = 13): Map<string, PricePoint[]> {
  const out = new Map<string, PricePoint[]>();
  for (const o of offers) {
    const r = rng(hashString(`hist|${o.productId}|${o.retailerId}`));
    const points: PricePoint[] = [];
    const base = o.wasPrice ?? o.price;
    for (let i = weeks - 1; i >= 0; i--) {
      const d = new Date(weekStart);
      d.setUTCDate(d.getUTCDate() - i * 7);
      let price = base;
      const roll = r();
      if (roll < 0.15) price = base * (0.85 + r() * 0.1); // special
      else if (roll < 0.25) price = base * (1.03 + r() * 0.05); // pre-special bump
      if (i === 0) price = o.price;
      points.push({ date: isoDate(d), price: i === 0 ? o.price : retailRound(price) });
    }
    out.set(`${o.productId}|${o.retailerId}`, points);
  }
  return out;
}

export function historyKey(productId: string, retailerId: string): string {
  return `${productId}|${retailerId}`;
}
