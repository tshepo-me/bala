import type { LineCost, Offer, Promo, PromoRule } from "./types";

/** Round to cents, avoiding floating point drift like 54.989999. */
export function roundRand(value: number): number {
  return Math.round(value * 100) / 100;
}

function finish(total: number, qty: number, promoApplied: boolean, note?: string): LineCost {
  const t = roundRand(total);
  return {
    total: t,
    unitEffective: qty > 0 ? roundRand(t / qty) : 0,
    promoApplied,
    note,
  };
}

/**
 * Cost of buying `qty` units of an offer, applying its promotion rule at that
 * quantity. Card-only prices apply only when the shopper holds the card.
 * Per-customer limits cap the number of discounted units; the remainder is
 * charged at shelf price.
 */
export function costForQuantity(offer: Offer, qty: number, hasCard: boolean): LineCost {
  if (qty <= 0) return finish(0, 0, false);
  const shelf = offer.price;
  const promo = offer.promo;
  if (!promo) return finish(shelf * qty, qty, false);

  const limit = promo.limit ?? Number.POSITIVE_INFINITY;
  const rule: PromoRule = promo.rule;

  switch (rule.type) {
    case "card_price": {
      if (!hasCard) {
        return finish(shelf * qty, qty, false, `R${rule.price.toFixed(2)} each with loyalty card`);
      }
      const discounted = Math.min(qty, limit);
      const rest = qty - discounted;
      const note = rest > 0 ? `Card price limited to ${limit} per customer` : undefined;
      return finish(discounted * rule.price + rest * shelf, qty, true, note);
    }

    case "multibuy": {
      const maxGroups = Number.isFinite(limit) ? Math.floor(limit / rule.n) : Number.POSITIVE_INFINITY;
      const groups = Math.min(Math.floor(qty / rule.n), maxGroups);
      const discountedUnits = groups * rule.n;
      const rest = qty - discountedUnits;
      let note: string | undefined;
      if (rest > 0 && groups < maxGroups) {
        const need = rule.n - rest;
        const withExtra = (groups + 1) * rule.price;
        const without = groups * rule.price + rest * shelf;
        if (withExtra < without) {
          note = `Add ${need} more: ${rule.n} for R${rule.price.toFixed(2)} costs less than ${rest} at shelf price`;
        } else {
          note = `Add ${need} more to use the ${promo.label} deal`;
        }
      }
      return finish(groups * rule.price + rest * shelf, qty, groups > 0, note);
    }

    case "percent_off": {
      const discounted = Math.min(qty, limit);
      const rest = qty - discounted;
      const unit = shelf * (1 - rule.percent / 100);
      return finish(discounted * unit + rest * shelf, qty, true);
    }

    case "buy_n_get_m_free": {
      const block = rule.n + rule.m;
      const maxBlocks = Number.isFinite(limit) ? Math.floor(limit / block) : Number.POSITIVE_INFINITY;
      const blocks = Math.min(Math.floor(qty / block), maxBlocks);
      const rest = qty - blocks * block;
      // In a partial block you pay for up to n units; anything beyond n is free
      // only once the block completes, so partial units beyond n still cost.
      const paidInRest = rest;
      const payUnits = blocks * rule.n + paidInRest;
      let note: string | undefined;
      if (blocks < maxBlocks && rest > 0 && rest >= rule.n) {
        note = `Add ${block - rest} more to get ${rule.m} free`;
      }
      return finish(payUnits * shelf, qty, blocks > 0, note);
    }
  }
}

/** Effective price for a single unit, used for sorting and display. */
export function effectiveUnitPrice(offer: Offer, hasCard: boolean): number {
  return costForQuantity(offer, 1, hasCard).unitEffective;
}

export function describePromo(promo: Promo): string {
  return promo.label;
}
