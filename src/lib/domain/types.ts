/**
 * Core domain types for Bala.
 * Pure data shapes, no framework dependencies. Shared by the web app today and
 * the mobile app later (see docs/DESIGN.md §9).
 */

export type SizeUnit = "g" | "kg" | "ml" | "L" | "each";

export interface Retailer {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  /** Name of the loyalty programme whose card unlocks card-only prices, if any. */
  loyaltyProgram: string | null;
  /** Brand colour used for badges (hex). */
  color: string;
}

export interface Store {
  id: string;
  retailerId: string;
  name: string;
  suburb: string;
  city: string;
  lat: number;
  lng: number;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  sizeValue: number;
  sizeUnit: SizeUnit;
}

/** Typed promotion rules. Free-text promos are parsed into one of these upstream. */
export type PromoRule =
  | { type: "card_price"; price: number }
  | { type: "multibuy"; n: number; price: number }
  | { type: "percent_off"; percent: number }
  | { type: "buy_n_get_m_free"; n: number; m: number };

export interface Promo {
  rule: PromoRule;
  /** Human readable label as the retailer prints it, e.g. "2 for R55". */
  label: string;
  /** ISO date (YYYY-MM-DD), inclusive. */
  validTo: string;
  /** Max discounted units per customer, if the retailer imposes one. */
  limit?: number;
}

export type SourceKind = "leaflet" | "storefront" | "receipt";

/** The current shelf price of one product at one retailer (price zone). */
export interface Offer {
  productId: string;
  retailerId: string;
  /** Shelf price per unit, before any promotion. */
  price: number;
  /** Previous price, when the retailer advertises a markdown. */
  wasPrice?: number;
  promo?: Promo;
  observedAt: string;
  sourceKind: SourceKind;
}

export interface PricePoint {
  date: string;
  price: number;
}

export interface ListItem {
  id: string;
  rawText: string;
  productId: string;
  qty: number;
  /**
   * When true the user accepts any product in the same category with a
   * comparable size (within 25%), e.g. "any 2L full cream milk".
   */
  flexible: boolean;
}

export type TravelMode = "car" | "taxi" | "walk";

export interface RecommendSettings {
  lat: number;
  lng: number;
  radiusKm: number;
  maxStops: 1 | 2 | 3;
  /** Retailer ids whose loyalty card the user holds. */
  loyaltyCards: string[];
  travelMode: TravelMode;
  /** Rand per km, round trip is computed as 2 × distance. */
  travelCostPerKm: number;
  /** Rand added for every stop beyond the first, representing time. */
  stopPenaltyRand: number;
  /** A split trip is only recommended if it beats the best single store by this much. */
  minSplitSavingRand: number;
}

export interface LineCost {
  total: number;
  /** Effective price per unit after promotions. */
  unitEffective: number;
  promoApplied: boolean;
  /** Advice such as "Add 1 more to get the 2-for-R55 deal". */
  note?: string;
}

export interface ItemAssignment {
  itemId: string;
  retailerId: string;
  productId: string;
  qty: number;
  lineTotal: number;
  unitEffective: number;
  shelfPrice: number;
  promoLabel?: string;
  note?: string;
  /** Median price for this product across retailers over the history window. */
  fairPrice: number | null;
  /** Whether this item was substituted because the list item is flexible. */
  substituted: boolean;
}

export interface StopInfo {
  retailerId: string;
  storeId: string;
  storeName: string;
  distanceKm: number;
}

export interface BasketOption {
  id: string;
  stops: StopInfo[];
  items: ItemAssignment[];
  missingItemIds: string[];
  basketTotal: number;
  travelCost: number;
  stopPenalty: number;
  total: number;
  /** Positive number = cheaper than the best single-store option. */
  savingVsBestSingle: number;
}

export interface ItemRetailerCost {
  retailerId: string;
  productId: string;
  lineTotal: number;
  unitEffective: number;
  promoLabel?: string;
}

export interface ItemComparison {
  itemId: string;
  perRetailer: ItemRetailerCost[];
  cheapestRetailerId: string | null;
}

export interface RecommendResult {
  options: BasketOption[];
  comparison: ItemComparison[];
  /** Retailers considered (had a store within radius). */
  consideredRetailerIds: string[];
  generatedAt: string;
}
