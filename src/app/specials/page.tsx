import type { Metadata } from "next";
import Link from "next/link";
import { RetailerBadge } from "@/components/RetailerBadge";
import { getDataSource } from "@/lib/data";
import { CURRENT_WEEK } from "@/lib/data/seed/offers";
import { effectiveUnitPrice } from "@/lib/domain/promo";
import { formatSize } from "@/lib/domain/units";
import { formatDate, formatRand } from "@/lib/format";

export const metadata: Metadata = {
  title: "This week's grocery specials",
  description: "All current specials across Checkers, Shoprite, Pick n Pay, Woolworths, SPAR and Boxer in one list.",
};

export default async function SpecialsPage() {
  const ds = getDataSource();
  const [offers, products, retailers] = await Promise.all([ds.currentOffers(), ds.products(), ds.retailers()]);
  const productById = new Map(products.map((p) => [p.id, p]));

  const byRetailer = retailers.map((r) => ({
    retailer: r,
    deals: offers
      .filter((o) => o.retailerId === r.id && (o.promo || o.wasPrice))
      .map((o) => ({ offer: o, product: productById.get(o.productId)!, eff: effectiveUnitPrice(o, true) }))
      .sort((a, b) => a.product.category.localeCompare(b.product.category) || a.product.name.localeCompare(b.product.name)),
  }));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">This week&rsquo;s specials</h1>
        <p className="mt-1 text-sm text-slate-500">
          Week of {formatDate(CURRENT_WEEK.from)} – {formatDate(CURRENT_WEEK.to)}. Card prices need the retailer&rsquo;s
          loyalty card.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {byRetailer.map(({ retailer, deals }) => (
          <section key={retailer.id} className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3">
              <RetailerBadge retailer={retailer} />
              <span className="text-xs text-slate-500">{deals.length} deals</span>
            </div>
            {deals.length === 0 ? (
              <p className="p-5 text-sm text-slate-400">No specials captured this week.</p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {deals.map(({ offer, product, eff }) => (
                  <li key={product.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                    <div className="min-w-0">
                      <Link href={`/p/${product.slug}`} className="font-medium hover:underline">
                        {product.name} <span className="text-slate-500">{formatSize(product)}</span>
                      </Link>
                      <div className="text-xs text-brand-700">{offer.promo?.label ?? "Price drop"}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatRand(eff)}</div>
                      <div className="text-xs text-slate-400 line-through">{formatRand(offer.wasPrice ?? offer.price)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
