import type { Metadata } from "next";
import { Results } from "@/components/Results";
import { getDataSource } from "@/lib/data";

export const metadata: Metadata = {
  title: "Best value for your list",
  description: "Where your shopping list costs least this week.",
};

export default async function ResultsPage() {
  const ds = getDataSource();
  const [retailers, products] = await Promise.all([ds.retailers(), ds.products()]);
  return <Results retailers={retailers} products={products} />;
}
