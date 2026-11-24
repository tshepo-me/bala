import type { Metadata } from "next";
import { ListBuilder } from "@/components/ListBuilder";
import { SettingsPanel } from "@/components/SettingsPanel";
import { getDataSource } from "@/lib/data";
import { presetLocations } from "@/lib/data/seed/retailers";

export const metadata: Metadata = {
  title: "My shopping list",
  description: "Build your shopping list and set where you shop from.",
};

export default async function ListPage() {
  const ds = getDataSource();
  const [retailers, products] = await Promise.all([ds.retailers(), ds.products()]);

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <section>
        <h1 className="text-3xl font-bold tracking-tight">My shopping list</h1>
        <p className="mt-1 text-sm text-slate-500">
          Search and add items. Toggle &ldquo;any brand&rdquo; where you are happy with a substitute of the same size.
        </p>
        <div className="mt-6">
          <ListBuilder products={products} />
        </div>
      </section>
      <aside className="lg:sticky lg:top-24 lg:self-start">
        <SettingsPanel retailers={retailers} presets={[...presetLocations]} />
      </aside>
    </div>
  );
}
