import type { NextRequest } from "next/server";
import { recommendRequestSchema } from "@/lib/api/schemas";
import { getDataSource } from "@/lib/data";
import { recommend } from "@/lib/domain/recommend";

/** POST /api/recommend — run the basket optimiser for a list and shopper settings. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body must be JSON" }, { status: 400 });
  }

  const parsed = recommendRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid request", issues: parsed.error.issues }, { status: 400 });
  }

  const ds = getDataSource();
  const [products, offers, stores, retailers, fairPrices] = await Promise.all([
    ds.products(),
    ds.currentOffers(),
    ds.stores(),
    ds.retailers(),
    ds.fairPrices(),
  ]);

  const result = recommend({
    items: parsed.data.items,
    settings: parsed.data.settings,
    products,
    offers,
    stores,
    retailers,
    fairPrices,
  });

  return Response.json(result);
}
