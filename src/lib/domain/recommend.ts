import { roadKm } from "./geo";
import { costForQuantity, roundRand } from "./promo";
import type {
  BasketOption,
  ItemAssignment,
  ItemComparison,
  ListItem,
  Offer,
  Product,
  RecommendResult,
  RecommendSettings,
  Retailer,
  StopInfo,
  Store,
} from "./types";
import { sizeComparable } from "./units";

export interface RecommendInput {
  items: ListItem[];
  settings: RecommendSettings;
  products: Product[];
  offers: Offer[];
  stores: Store[];
  retailers: Retailer[];
  /** productId -> median price across retailers over the history window. */
  fairPrices: Record<string, number>;
}

interface Candidate {
  itemId: string;
  retailerId: string;
  productId: string;
  qty: number;
  lineTotal: number;
  unitEffective: number;
  shelfPrice: number;
  promoLabel?: string;
  note?: string;
  substituted: boolean;
}

/** Nearest store per retailer within the radius. */
function nearestStores(stores: Store[], settings: RecommendSettings): Map<string, StopInfo> {
  const best = new Map<string, StopInfo>();
  for (const s of stores) {
    const d = roadKm(settings.lat, settings.lng, s.lat, s.lng);
    if (d > settings.radiusKm) continue;
    const cur = best.get(s.retailerId);
    if (!cur || d < cur.distanceKm) {
      best.set(s.retailerId, {
        retailerId: s.retailerId,
        storeId: s.id,
        storeName: s.name,
        distanceKm: roundRand(d),
      });
    }
  }
  return best;
}

/** Products that may satisfy a list item. */
function candidateProducts(item: ListItem, products: Product[]): Product[] {
  const base = products.find((p) => p.id === item.productId);
  if (!base) return [];
  if (!item.flexible) return [base];
  return products.filter((p) => p.category === base.category && sizeComparable(p, base));
}

/** Cheapest way to buy an item at each retailer. */
function candidatesForItem(
  item: ListItem,
  products: Product[],
  offersByRetailer: Map<string, Offer[]>,
  retailerIds: string[],
  settings: RecommendSettings,
): Map<string, Candidate> {
  const result = new Map<string, Candidate>();
  const options = candidateProducts(item, products);
  if (options.length === 0) return result;
  const optionIds = new Set(options.map((p) => p.id));

  for (const retailerId of retailerIds) {
    const hasCard = settings.loyaltyCards.includes(retailerId);
    let best: Candidate | undefined;
    for (const offer of offersByRetailer.get(retailerId) ?? []) {
      if (!optionIds.has(offer.productId)) continue;
      const cost = costForQuantity(offer, item.qty, hasCard);
      if (!best || cost.total < best.lineTotal) {
        best = {
          itemId: item.id,
          retailerId,
          productId: offer.productId,
          qty: item.qty,
          lineTotal: cost.total,
          unitEffective: cost.unitEffective,
          shelfPrice: offer.price,
          promoLabel: cost.promoApplied ? offer.promo?.label : undefined,
          note: cost.note,
          substituted: offer.productId !== item.productId,
        };
      }
    }
    if (best) result.set(retailerId, best);
  }
  return result;
}

function* subsets(ids: string[], size: number, start = 0, acc: string[] = []): Generator<string[]> {
  if (acc.length === size) {
    yield acc;
    return;
  }
  for (let i = start; i < ids.length; i++) {
    yield* subsets(ids, size, i + 1, [...acc, ids[i]]);
  }
}

function buildOption(
  retailerIds: string[],
  items: ListItem[],
  candidates: Map<string, Map<string, Candidate>>,
  stops: Map<string, StopInfo>,
  settings: RecommendSettings,
  fairPrices: Record<string, number>,
): BasketOption {
  const assignments: ItemAssignment[] = [];
  const missing: string[] = [];
  for (const item of items) {
    const perRetailer = candidates.get(item.id);
    let best: Candidate | undefined;
    for (const rid of retailerIds) {
      const c = perRetailer?.get(rid);
      if (c && (!best || c.lineTotal < best.lineTotal)) best = c;
    }
    if (!best) {
      missing.push(item.id);
      continue;
    }
    assignments.push({
      itemId: best.itemId,
      retailerId: best.retailerId,
      productId: best.productId,
      qty: best.qty,
      lineTotal: best.lineTotal,
      unitEffective: best.unitEffective,
      shelfPrice: best.shelfPrice,
      promoLabel: best.promoLabel,
      note: best.note,
      fairPrice: fairPrices[best.productId] ?? null,
      substituted: best.substituted,
    });
  }

  // Only count stops that actually receive at least one item.
  const usedRetailerIds = Array.from(new Set(assignments.map((a) => a.retailerId)));
  const stopInfos = usedRetailerIds.map((rid) => stops.get(rid)!).filter(Boolean);
  const basketTotal = roundRand(assignments.reduce((s, a) => s + a.lineTotal, 0));
  const travelCost = roundRand(
    stopInfos.reduce((s, st) => s + st.distanceKm * 2 * settings.travelCostPerKm, 0),
  );
  const stopPenalty = roundRand(Math.max(0, stopInfos.length - 1) * settings.stopPenaltyRand);

  return {
    id: usedRetailerIds.slice().sort().join("+") || retailerIds.join("+"),
    stops: stopInfos,
    items: assignments,
    missingItemIds: missing,
    basketTotal,
    travelCost,
    stopPenalty,
    total: roundRand(basketTotal + travelCost + stopPenalty),
    savingVsBestSingle: 0,
  };
}

/**
 * Finds the cheapest way to buy a shopping list across nearby retailers.
 * See docs/DESIGN.md §6.2 for the algorithm description.
 */
export function recommend(input: RecommendInput): RecommendResult {
  const { items, settings, products, offers, stores, fairPrices } = input;
  const stops = nearestStores(stores, settings);
  const retailerIds = Array.from(stops.keys()).sort();

  const offersByRetailer = new Map<string, Offer[]>();
  for (const o of offers) {
    if (!stops.has(o.retailerId)) continue;
    const list = offersByRetailer.get(o.retailerId) ?? [];
    list.push(o);
    offersByRetailer.set(o.retailerId, list);
  }

  const candidates = new Map<string, Map<string, Candidate>>();
  for (const item of items) {
    candidates.set(item.id, candidatesForItem(item, products, offersByRetailer, retailerIds, settings));
  }

  const comparison: ItemComparison[] = items.map((item) => {
    const perRetailer = Array.from(candidates.get(item.id)?.values() ?? []).map((c) => ({
      retailerId: c.retailerId,
      productId: c.productId,
      lineTotal: c.lineTotal,
      unitEffective: c.unitEffective,
      promoLabel: c.promoLabel,
    }));
    perRetailer.sort((a, b) => a.lineTotal - b.lineTotal);
    return { itemId: item.id, perRetailer, cheapestRetailerId: perRetailer[0]?.retailerId ?? null };
  });

  if (items.length === 0 || retailerIds.length === 0) {
    return { options: [], comparison, consideredRetailerIds: retailerIds, generatedAt: new Date().toISOString() };
  }

  const byCoverageThenTotal = (a: BasketOption, b: BasketOption) =>
    a.missingItemIds.length - b.missingItemIds.length || a.total - b.total;

  const singles = retailerIds
    .map((rid) => buildOption([rid], items, candidates, stops, settings, fairPrices))
    .filter((o) => o.items.length > 0)
    .sort(byCoverageThenTotal);
  const bestSingle = singles[0];

  const splits: BasketOption[] = [];
  const maxStops = Math.min(settings.maxStops, retailerIds.length);
  for (let k = 2; k <= maxStops; k++) {
    for (const combo of subsets(retailerIds, k)) {
      const opt = buildOption(combo, items, candidates, stops, settings, fairPrices);
      if (opt.stops.length < k) continue; // degenerate: one store took everything
      if (!bestSingle) {
        splits.push(opt);
        continue;
      }
      const betterCoverage = opt.missingItemIds.length < bestSingle.missingItemIds.length;
      const bigEnoughSaving = opt.total <= bestSingle.total - settings.minSplitSavingRand;
      if (betterCoverage || bigEnoughSaving) splits.push(opt);
    }
  }

  const seen = new Set<string>();
  const options = [...singles, ...splits]
    .filter((o) => (seen.has(o.id) ? false : (seen.add(o.id), true)))
    .sort(byCoverageThenTotal)
    .map((o) => ({
      ...o,
      savingVsBestSingle: bestSingle ? roundRand(bestSingle.total - o.total) : 0,
    }));

  return {
    options,
    comparison,
    consideredRetailerIds: retailerIds,
    generatedAt: new Date().toISOString(),
  };
}
