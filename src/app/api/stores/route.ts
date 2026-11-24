import type { NextRequest } from "next/server";
import { getDataSource } from "@/lib/data";
import { roadKm } from "@/lib/domain/geo";

/** GET /api/stores?lat=&lng=&radius_km= — stores near a point, nearest first. */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const ds = getDataSource();
  const all = await ds.stores();
  const lat = Number(sp.get("lat"));
  const lng = Number(sp.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return Response.json({ stores: all });
  }
  const radius = Number(sp.get("radius_km") ?? 10);
  const stores = all
    .map((s) => ({ ...s, distanceKm: Math.round(roadKm(lat, lng, s.lat, s.lng) * 10) / 10 }))
    .filter((s) => s.distanceKm <= radius)
    .sort((a, b) => a.distanceKm - b.distanceKm);
  return Response.json({ stores });
}
