import type { NextRequest } from "next/server";
import { getDataSource } from "@/lib/data";

/** GET /api/products/:slug — product with current offers and price history. */
export async function GET(_request: NextRequest, ctx: RouteContext<"/api/products/[slug]">) {
  const { slug } = await ctx.params;
  const ds = getDataSource();
  const product = await ds.productBySlug(slug);
  if (!product) return Response.json({ error: "Not found" }, { status: 404 });
  const prices = await ds.productPrices(product.id);
  return Response.json(prices);
}
