import type { Offer, PricePoint, Product } from "@/lib/domain/types";
import { buildHistory, buildOffers, historyKey } from "./seed/offers";
import { products } from "./seed/products";
import { retailers, stores } from "./seed/retailers";
import type { DataSource, ProductPrices } from "./types";

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const s = [...values].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : Math.round(((s[mid - 1] + s[mid]) / 2) * 100) / 100;
}

function normalise(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9 ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Simple token-overlap search. Postgres pg_trgm takes over in production. */
function score(product: Product, tokens: string[]): number {
  const hay = normalise(`${product.brand} ${product.name} ${product.category} ${product.sizeValue}${product.sizeUnit}`);
  const hayTokens = hay.split(" ");
  let s = 0;
  for (const t of tokens) {
    if (hayTokens.includes(t)) s += 3;
    else if (hayTokens.some((h) => h.startsWith(t))) s += 2;
    else if (hay.includes(t)) s += 1;
  }
  return s;
}

export class MemoryDataSource implements DataSource {
  private readonly offerList: Offer[];
  private readonly history: Map<string, PricePoint[]>;
  private readonly fair: Record<string, number>;

  constructor() {
    this.offerList = buildOffers();
    this.history = buildHistory(this.offerList);
    this.fair = {};
    for (const p of products) {
      const points = this.offerList
        .filter((o) => o.productId === p.id)
        .flatMap((o) => this.history.get(historyKey(o.productId, o.retailerId)) ?? [])
        .map((pt) => pt.price);
      const m = median(points);
      if (m !== null) this.fair[p.id] = m;
    }
  }

  async retailers() {
    return retailers;
  }

  async stores() {
    return stores;
  }

  async products() {
    return products;
  }

  async searchProducts(query: string, limit = 8) {
    const tokens = normalise(query).split(" ").filter(Boolean);
    if (tokens.length === 0) return [];
    return products
      .map((p) => ({ p, s: score(p, tokens) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name))
      .slice(0, limit)
      .map((x) => x.p);
  }

  async productBySlug(slug: string) {
    return products.find((p) => p.slug === slug) ?? null;
  }

  async productPrices(productId: string): Promise<ProductPrices | null> {
    const product = products.find((p) => p.id === productId);
    if (!product) return null;
    const offers = this.offerList.filter((o) => o.productId === productId);
    const history: Record<string, PricePoint[]> = {};
    for (const o of offers) {
      history[o.retailerId] = this.history.get(historyKey(o.productId, o.retailerId)) ?? [];
    }
    return { product, offers, history, fairPrice: this.fair[productId] ?? null };
  }

  async currentOffers() {
    return this.offerList;
  }

  async fairPrices() {
    return this.fair;
  }
}
