import type { NextRequest } from "next/server";
import { getDataSource } from "@/lib/data";

/** GET /api/products?q=milk — typeahead search. Without q, returns the catalogue. */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  const ds = getDataSource();
  const products = q ? await ds.searchProducts(q, 8) : await ds.products();
  return Response.json({ products });
}
