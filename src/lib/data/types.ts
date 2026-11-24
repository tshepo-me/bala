import type { Offer, PricePoint, Product, Retailer, Store } from "@/lib/domain/types";

export interface ProductPrices {
  product: Product;
  offers: Offer[];
  /** retailerId -> weekly price points, oldest first. */
  history: Record<string, PricePoint[]>;
  /** Median across all retailers' history, used as the "fair price" line. */
  fairPrice: number | null;
}

/**
 * Read model used by the web app. The in-memory implementation is backed by
 * seed data; a PostgreSQL implementation will replace it without touching
 * pages or API routes (docs/DESIGN.md §7).
 */
export interface DataSource {
  retailers(): Promise<Retailer[]>;
  stores(): Promise<Store[]>;
  products(): Promise<Product[]>;
  searchProducts(query: string, limit?: number): Promise<Product[]>;
  productBySlug(slug: string): Promise<Product | null>;
  productPrices(productId: string): Promise<ProductPrices | null>;
  currentOffers(): Promise<Offer[]>;
  fairPrices(): Promise<Record<string, number>>;
}
