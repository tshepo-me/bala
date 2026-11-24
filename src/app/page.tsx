import Link from "next/link";
import { QuickStart } from "@/components/QuickStart";
import { RetailerBadge } from "@/components/RetailerBadge";
import { getDataSource } from "@/lib/data";
import { effectiveUnitPrice } from "@/lib/domain/promo";
import { formatRand } from "@/lib/format";

const steps = [
  {
    title: "Type your list once",
    body: "Milk, bread, mielie meal, nappies. Add quantities, and mark items where any brand will do.",
  },
  {
    title: "We check every retailer",
    body: "This week's leaflets and loyalty-card prices at Checkers, Shoprite, Pick n Pay, Woolworths, SPAR and Boxer.",
  },
  {
    title: "Shop where it counts",
    body: "See the cheapest single store, and whether splitting your trip saves enough to be worth the petrol.",
  },
];

export default async function HomePage() {
  const ds = getDataSource();
  const [offers, products, retailers, fair] = await Promise.all([
    ds.currentOffers(),
    ds.products(),
    ds.retailers(),
    ds.fairPrices(),
  ]);

  const productById = new Map(products.map((p) => [p.id, p]));
  const retailerById = new Map(retailers.map((r) => [r.id, r]));
  const topSpecials = offers
    .filter((o) => o.promo || o.wasPrice)
    .map((o) => {
      const eff = effectiveUnitPrice(o, true);
      const ref = fair[o.productId] ?? o.wasPrice ?? o.price;
      return { offer: o, eff, saving: ref - eff, pct: ref > 0 ? (ref - eff) / ref : 0 };
    })
    .filter((s) => s.saving > 0)
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 6);

  return (
    <div className="space-y-14">
      <section className="grid items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="chip bg-brand-100 text-brand-700">South Africa · grocery price comparison</span>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Your basket, <span className="text-brand-600">counted.</span>
          </h1>
          <p className="max-w-prose text-lg text-slate-600">
            Stop paging through six leaflets. Enter your shopping list and Bala tells you which store gives the best
            value this week, after petrol and loyalty-card prices are taken into account.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/list" className="btn-primary">
              Build my list
            </Link>
            <Link href="/how-it-works" className="btn-secondary">
              How it works
            </Link>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {retailers.map((r) => (
              <RetailerBadge key={r.id} retailer={r} size="sm" />
            ))}
          </div>
        </div>
        <QuickStart />
      </section>

      <section className="grid gap-6 sm:grid-cols-3">
        {steps.map((s, i) => (
          <div key={s.title} className="card p-6">
            <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
              {i + 1}
            </div>
            <h2 className="text-lg font-semibold">{s.title}</h2>
            <p className="mt-1 text-sm text-slate-600">{s.body}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Biggest savings this week</h2>
            <p className="text-sm text-slate-500">Against the 90-day typical price. Card prices assume you hold the card.</p>
          </div>
          <Link href="/specials" className="text-sm font-semibold text-brand-600 hover:underline">
            All specials →
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topSpecials.map(({ offer, eff, pct }) => {
            const p = productById.get(offer.productId)!;
            const r = retailerById.get(offer.retailerId)!;
            return (
              <Link key={`${offer.productId}-${offer.retailerId}`} href={`/p/${p.slug}`} className="card flex flex-col gap-2 p-5 transition hover:shadow-md">
                <div className="flex items-center justify-between">
                  <RetailerBadge retailer={r} size="sm" />
                  <span className="chip bg-accent-400/20 text-accent-600">save {Math.round(pct * 100)}%</span>
                </div>
                <div className="font-semibold leading-snug">{p.name}</div>
                <div className="text-xs text-slate-500">
                  {p.brand} · {p.sizeValue}
                  {p.sizeUnit === "each" ? " pack" : p.sizeUnit}
                </div>
                <div className="mt-auto flex items-baseline gap-2">
                  <span className="text-xl font-bold text-brand-700">{formatRand(eff)}</span>
                  {offer.promo && <span className="text-xs text-slate-500">{offer.promo.label}</span>}
                  {!offer.promo && offer.wasPrice && (
                    <span className="text-xs text-slate-400 line-through">{formatRand(offer.wasPrice)}</span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
