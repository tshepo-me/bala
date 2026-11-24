import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToListButton } from "@/components/AddToListButton";
import { RetailerBadge } from "@/components/RetailerBadge";
import { Sparkline } from "@/components/Sparkline";
import { getDataSource } from "@/lib/data";
import { effectiveUnitPrice } from "@/lib/domain/promo";
import { formatSize, unitPrice } from "@/lib/domain/units";
import { formatDate, formatRand } from "@/lib/format";

export async function generateStaticParams() {
  const products = await getDataSource().products();
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/p/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getDataSource().productBySlug(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: `${product.name} ${formatSize(product)} price this week`,
    description: `Compare the price of ${product.name} at Checkers, Shoprite, Pick n Pay, Woolworths, SPAR and Boxer, with 90-day price history.`,
  };
}

export default async function ProductPage({ params }: PageProps<"/p/[slug]">) {
  const { slug } = await params;
  const ds = getDataSource();
  const product = await ds.productBySlug(slug);
  if (!product) notFound();
  const [prices, retailers, products] = await Promise.all([ds.productPrices(product.id), ds.retailers(), ds.products()]);
  if (!prices) notFound();

  const retailerById = new Map(retailers.map((r) => [r.id, r]));
  const rows = prices.offers
    .map((o) => ({ offer: o, retailer: retailerById.get(o.retailerId)!, eff: effectiveUnitPrice(o, true) }))
    .sort((a, b) => a.eff - b.eff);
  const cheapest = rows[0];
  const dearest = rows[rows.length - 1];
  const alternatives = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 6);

  return (
    <div className="space-y-8">
      <nav className="text-sm text-slate-500">
        <Link href="/" className="hover:underline">
          Home
        </Link>{" "}
        / <span>{product.category}</span> / <span className="text-slate-800">{product.name}</span>
      </nav>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {product.name} <span className="text-slate-500">{formatSize(product)}</span>
          </h1>
          <p className="mt-1 text-slate-500">
            {product.brand} · {product.category}
          </p>
        </div>
        <AddToListButton productId={product.id} />
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Cheapest this week" value={formatRand(cheapest.eff)} sub={cheapest.retailer.name} accent />
        <Stat
          label="Typical price (90 days)"
          value={prices.fairPrice != null ? formatRand(prices.fairPrice) : "–"}
          sub="median across retailers"
        />
        <Stat
          label="Spread"
          value={formatRand(dearest.eff - cheapest.eff)}
          sub={`${cheapest.retailer.shortName} vs ${dearest.retailer.shortName}`}
        />
      </section>

      <section className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-2">Retailer</th>
              <th className="px-3 py-2 text-right">Price</th>
              <th className="px-3 py-2">Deal</th>
              <th className="px-3 py-2 text-right">Per unit</th>
              <th className="px-3 py-2">90-day trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map(({ offer, retailer, eff }, i) => {
              const up = unitPrice(product, eff);
              const history = prices.history[retailer.id] ?? [];
              return (
                <tr key={retailer.id} className={i === 0 ? "bg-brand-50/60" : ""}>
                  <td className="px-5 py-3">
                    <RetailerBadge retailer={retailer} size="sm" />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <div className="font-semibold">{formatRand(eff)}</div>
                    {eff < offer.price && <div className="text-xs text-slate-400 line-through">{formatRand(offer.price)}</div>}
                    {!offer.promo && offer.wasPrice && (
                      <div className="text-xs text-slate-400 line-through">{formatRand(offer.wasPrice)}</div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs">
                    {offer.promo ? (
                      <>
                        <div className="font-medium text-brand-700">{offer.promo.label}</div>
                        <div className="text-slate-500">
                          until {formatDate(offer.promo.validTo)}
                          {offer.promo.rule.type === "card_price" && retailer.loyaltyProgram
                            ? ` · needs ${retailer.loyaltyProgram} card`
                            : ""}
                          {offer.promo.limit ? ` · limit ${offer.promo.limit}` : ""}
                        </div>
                      </>
                    ) : offer.wasPrice ? (
                      <span className="font-medium text-brand-700">Price drop</span>
                    ) : (
                      <span className="text-slate-400">shelf price</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right text-slate-600">
                    {formatRand(up.value)}/{up.unit}
                  </td>
                  <td className="px-3 py-3">
                    <Sparkline points={history} reference={prices.fairPrice} color={retailer.color} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {alternatives.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold">Also in {product.category}</h2>
          <div className="flex flex-wrap gap-2">
            {alternatives.map((p) => (
              <Link key={p.id} href={`/p/${p.slug}`} className="chip border border-slate-300 bg-white hover:bg-slate-50">
                {p.name} {formatSize(p)}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub: string; accent?: boolean }) {
  return (
    <div className={`card p-5 ${accent ? "border-brand-200 bg-brand-50" : ""}`}>
      <div className="label">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent ? "text-brand-700" : ""}`}>{value}</div>
      <div className="text-xs text-slate-500">{sub}</div>
    </div>
  );
}
