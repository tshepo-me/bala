import type { MetadataRoute } from "next";
import { getDataSource } from "@/lib/data";

const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getDataSource().products();
  const statics = ["", "/list", "/specials", "/how-it-works", "/privacy"].map((p) => ({
    url: `${base}${p}`,
    changeFrequency: "weekly" as const,
  }));
  const productPages = products.map((p) => ({
    url: `${base}/p/${p.slug}`,
    changeFrequency: "weekly" as const,
  }));
  return [...statics, ...productPages];
}
