"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSettings, useShoppingList } from "@/lib/client/store";
import type { BasketOption, Product, RecommendResult, Retailer } from "@/lib/domain/types";
import { formatKm, formatRand } from "@/lib/format";
import { RetailerBadge } from "./RetailerBadge";

interface Props {
  retailers: Retailer[];
  products: Product[];
}

export function Results({ retailers, products }: Props) {
  const { items, ready: listReady } = useShoppingList();
  const { settings, ready: settingsReady } = useSettings();
  // The response is keyed by the request body so "loading" is derived, not stored.
  const [response, setResponse] = useState<{ key: string; result?: RecommendResult; error?: string } | null>(null);
  const [selected, setSelected] = useState(0);

  const retailerById = useMemo(() => new Map(retailers.map((r) => [r.id, r])), [retailers]);
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);
  const itemById = useMemo(() => new Map(items.map((i) => [i.id, i])), [items]);

  const requestBody = useMemo(() => JSON.stringify({ items, settings }), [items, settings]);

  useEffect(() => {
    if (!listReady || !settingsReady || items.length === 0) return;
    const ctrl = new AbortController();
    const key = requestBody;
    fetch("/api/recommend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: key,
      signal: ctrl.signal,
    })
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error ?? `HTTP ${r.status}`);
        return (await r.json()) as RecommendResult;
      })
      .then((result) => {
        setResponse({ key, result });
        setSelected(0);
      })
      .catch((e: unknown) => {
        if ((e as Error).name !== "AbortError") setResponse({ key, error: (e as Error).message });
      });
    return () => ctrl.abort();
  }, [requestBody, items.length, listReady, settingsReady]);

  const current = response?.key === requestBody ? response : null;
  const result = current?.result ?? null;
  const error = current?.error ?? null;
  const loading = current === null;

  if (!listReady || !settingsReady) return <p className="text-sm text-slate-400">Loading…</p>;

  if (items.length === 0) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold">Nothing to compare yet</h1>
        <p className="mt-2 text-slate-600">Add a few items to your list first.</p>
        <Link href="/list" className="btn-primary mt-4">
          Build my list
        </Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card border-red-200 bg-red-50 p-6 text-sm text-red-800">
        Could not compute a recommendation: {error}
      </div>
    );
  }

  if (loading || !result) return <SkeletonResults />;

  if (result.options.length === 0) {
    return (
      <div className="card p-8 text-center">
        <h1 className="text-2xl font-bold">No stores in range</h1>
        <p className="mt-2 text-slate-600">
          No retailer has a store within {settings.radiusKm} km of your location. Widen the radius or change your
          location on the list page.
        </p>
        <Link href="/list" className="btn-secondary mt-4">
          Change settings
        </Link>
      </div>
    );
  }

  const best = result.options[selected] ?? result.options[0];
  const bestSingle = result.options.find((o) => o.stops.length === 1);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Best value for your list</h1>
          <p className="mt-1 text-sm text-slate-500">
            {items.length} items · {result.consideredRetailerIds.length} retailers within {settings.radiusKm} km ·
            travel costed at R{settings.travelCostPerKm.toFixed(2)}/km
          </p>
        </div>
        <Link href="/list" className="btn-secondary">
          Edit list or settings
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {result.options.slice(0, 6).map((o, i) => (
          <OptionCard
            key={o.id}
            option={o}
            rank={i}
            selected={i === selected}
            onSelect={() => setSelected(i)}
            retailerById={retailerById}
            itemCount={items.length}
            bestSingle={bestSingle}
          />
        ))}
      </div>

      <section className="card overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold">
            Shopping plan:{" "}
            {best.stops.map((s, i) => (
              <span key={s.retailerId}>
                {i > 0 && " + "}
                {retailerById.get(s.retailerId)?.name}
              </span>
            ))}
          </h2>
          <div className="text-sm text-slate-500">
            Basket {formatRand(best.basketTotal)} · travel {formatRand(best.travelCost)}
            {best.stopPenalty > 0 && ` · extra stop ${formatRand(best.stopPenalty)}`}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-2">Item</th>
                <th className="px-3 py-2">Buy at</th>
                <th className="px-3 py-2 text-right">Qty</th>
                <th className="px-3 py-2 text-right">Each</th>
                <th className="px-3 py-2 text-right">Line</th>
                <th className="px-3 py-2 text-right">vs typical</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {best.items.map((a) => {
                const p = productById.get(a.productId);
                const r = retailerById.get(a.retailerId);
                const delta = a.fairPrice != null ? a.unitEffective - a.fairPrice : null;
                return (
                  <tr key={a.itemId}>
                    <td className="px-5 py-2.5">
                      <div className="font-medium">
                        {p ? (
                          <Link href={`/p/${p.slug}`} className="hover:underline">
                            {p.name}
                          </Link>
                        ) : (
                          a.productId
                        )}
                        {a.substituted && <span className="chip ml-2 bg-sky-100 text-sky-800">substitute</span>}
                      </div>
                      {a.promoLabel && <div className="text-xs font-medium text-brand-600">{a.promoLabel}</div>}
                      {a.note && <div className="text-xs text-amber-700">{a.note}</div>}
                    </td>
                    <td className="px-3 py-2.5">{r && <RetailerBadge retailer={r} size="sm" />}</td>
                    <td className="px-3 py-2.5 text-right">{a.qty}</td>
                    <td className="px-3 py-2.5 text-right">
                      {formatRand(a.unitEffective)}
                      {a.unitEffective < a.shelfPrice && (
                        <div className="text-xs text-slate-400 line-through">{formatRand(a.shelfPrice)}</div>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold">{formatRand(a.lineTotal)}</td>
                    <td className="px-3 py-2.5 text-right">
                      {delta == null ? (
                        <span className="text-slate-400">–</span>
                      ) : delta < -0.005 ? (
                        <span className="font-medium text-brand-600">{formatRand(delta)}</span>
                      ) : delta > 0.005 ? (
                        <span className="font-medium text-red-600">+{formatRand(delta)}</span>
                      ) : (
                        <span className="text-slate-400">typical</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {best.missingItemIds.map((id) => (
                <tr key={id} className="bg-amber-50/60">
                  <td className="px-5 py-2.5 text-amber-800" colSpan={6}>
                    Not available at these stores: {productById.get(itemById.get(id)?.productId ?? "")?.name ?? id}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200 bg-slate-50 font-semibold">
                <td className="px-5 py-3" colSpan={4}>
                  Total including travel
                </td>
                <td className="px-3 py-3 text-right text-lg" colSpan={2}>
                  {formatRand(best.total)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold">Every item at every store</h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-2">Item</th>
                {result.consideredRetailerIds.map((rid) => (
                  <th key={rid} className="px-3 py-2 text-right">
                    {retailerById.get(rid)?.shortName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {result.comparison.map((c) => {
                const item = itemById.get(c.itemId);
                const p = item ? productById.get(item.productId) : undefined;
                return (
                  <tr key={c.itemId}>
                    <td className="px-5 py-2 font-medium">
                      {p?.name ?? c.itemId}
                      {item && item.qty > 1 && <span className="text-slate-400"> × {item.qty}</span>}
                    </td>
                    {result.consideredRetailerIds.map((rid) => {
                      const cell = c.perRetailer.find((x) => x.retailerId === rid);
                      const cheapest = c.cheapestRetailerId === rid;
                      return (
                        <td
                          key={rid}
                          className={`px-3 py-2 text-right tabular-nums ${cheapest ? "font-bold text-brand-700" : ""}`}
                        >
                          {cell ? (
                            <>
                              {formatRand(cell.lineTotal)}
                              {cell.promoLabel && <div className="text-[11px] font-normal text-slate-500">{cell.promoLabel}</div>}
                            </>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function OptionCard({
  option,
  rank,
  selected,
  onSelect,
  retailerById,
  itemCount,
  bestSingle,
}: {
  option: BasketOption;
  rank: number;
  selected: boolean;
  onSelect: () => void;
  retailerById: Map<string, Retailer>;
  itemCount: number;
  bestSingle?: BasketOption;
}) {
  const covered = itemCount - option.missingItemIds.length;
  const isSplit = option.stops.length > 1;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`card flex flex-col gap-3 p-5 text-left transition ${
        selected ? "ring-2 ring-brand-600" : "hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1.5">
          {option.stops.map((s) => {
            const r = retailerById.get(s.retailerId);
            return r ? <RetailerBadge key={s.retailerId} retailer={r} size="sm" /> : null;
          })}
        </div>
        {rank === 0 && <span className="chip bg-brand-600 text-white">Best value</span>}
        {rank > 0 && isSplit && option.savingVsBestSingle > 0 && (
          <span className="chip bg-accent-400/20 text-accent-600">saves {formatRand(option.savingVsBestSingle)}</span>
        )}
      </div>
      <div className="text-3xl font-bold tracking-tight">{formatRand(option.total)}</div>
      <ul className="space-y-0.5 text-xs text-slate-500">
        <li>
          Basket {formatRand(option.basketTotal)} + travel {formatRand(option.travelCost)}
          {option.stopPenalty > 0 && ` + extra stop ${formatRand(option.stopPenalty)}`}
        </li>
        {option.stops.map((s) => (
          <li key={s.storeId}>
            {s.storeName} · {formatKm(s.distanceKm)}
          </li>
        ))}
        <li className={covered < itemCount ? "font-medium text-amber-700" : ""}>
          {covered}/{itemCount} items available
        </li>
        {isSplit && bestSingle && option.savingVsBestSingle > 0 && (
          <li>
            {formatRand(option.savingVsBestSingle)} cheaper than {retailerById.get(bestSingle.stops[0].retailerId)?.name}{" "}
            alone
          </li>
        )}
      </ul>
    </button>
  );
}

function SkeletonResults() {
  return (
    <div className="space-y-6">
      <div className="h-9 w-72 animate-pulse rounded-lg bg-slate-200" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="card h-40 animate-pulse" />
        ))}
      </div>
      <div className="card h-64 animate-pulse" />
    </div>
  );
}
