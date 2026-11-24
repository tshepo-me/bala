"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useShoppingList } from "@/lib/client/store";
import type { Product } from "@/lib/domain/types";
import { formatSize } from "@/lib/domain/units";

export function ListBuilder({ products }: { products: Product[] }) {
  const { items, ready, addItem, updateItem, removeItem, clear } = useShoppingList();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products]);

  useEffect(() => {
    const q = query.trim();
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      if (q.length < 2) {
        setResults([]);
        return;
      }
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q)}`, { signal: ctrl.signal });
        const data = (await res.json()) as { products: Product[] };
        setResults(data.products);
        setActive(0);
      } catch {
        /* aborted */
      }
    }, 150);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  function choose(p: Product) {
    addItem({ rawText: query, productId: p.id, qty: 1, flexible: false });
    setQuery("");
    setResults([]);
    inputRef.current?.focus();
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      choose(results[active]);
    } else if (e.key === "Escape") {
      setResults([]);
    }
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <label htmlFor="search" className="label">
          Add an item
        </label>
        <input
          id="search"
          ref={inputRef}
          className="input mt-2"
          placeholder="Search e.g. milk, maize meal, nappies…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKey}
          autoComplete="off"
          role="combobox"
          aria-expanded={results.length > 0}
          aria-controls="search-results"
        />
        {results.length > 0 && (
          <ul
            id="search-results"
            role="listbox"
            className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg"
          >
            {results.map((p, i) => (
              <li
                key={p.id}
                role="option"
                aria-selected={i === active}
                className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm ${
                  i === active ? "bg-brand-50" : "hover:bg-slate-50"
                }`}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(p);
                }}
              >
                <span>
                  <span className="font-medium">{p.name}</span>{" "}
                  <span className="text-slate-500">
                    {p.brand} · {formatSize(p)}
                  </span>
                </span>
                <span className="text-xs text-slate-400">{p.category}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card divide-y divide-slate-100">
        {!ready && <p className="p-6 text-sm text-slate-400">Loading your list…</p>}
        {ready && items.length === 0 && (
          <p className="p-6 text-sm text-slate-500">
            Your list is empty. Search above, or{" "}
            <Link href="/" className="font-semibold text-brand-600 hover:underline">
              paste a list
            </Link>{" "}
            on the home page.
          </p>
        )}
        {items.map((item) => {
          const p = productById.get(item.productId);
          return (
            <div key={item.id} className="flex flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap">
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{p?.name ?? item.rawText}</div>
                <div className="text-xs text-slate-500">
                  {p ? `${p.brand} · ${formatSize(p)} · ${p.category}` : "Unknown product"}
                </div>
              </div>
              <label className="flex items-center gap-1.5 text-xs text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-brand-600"
                  checked={item.flexible}
                  onChange={(e) => updateItem(item.id, { flexible: e.target.checked })}
                />
                any brand
              </label>
              <div className="flex items-center rounded-lg border border-slate-300">
                <button
                  type="button"
                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-100"
                  aria-label="Decrease quantity"
                  onClick={() => updateItem(item.id, { qty: Math.max(1, item.qty - 1) })}
                >
                  −
                </button>
                <span className="w-8 text-center text-sm font-semibold">{item.qty}</span>
                <button
                  type="button"
                  className="px-2.5 py-1 text-slate-600 hover:bg-slate-100"
                  aria-label="Increase quantity"
                  onClick={() => updateItem(item.id, { qty: Math.min(99, item.qty + 1) })}
                >
                  +
                </button>
              </div>
              <button
                type="button"
                className="btn-ghost px-2 py-1 text-xs"
                onClick={() => removeItem(item.id)}
                aria-label={`Remove ${p?.name ?? item.rawText}`}
              >
                Remove
              </button>
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" className="btn-ghost" onClick={clear} disabled={items.length === 0}>
          Clear list
        </button>
        <Link
          href="/results"
          className={`btn-primary ${items.length === 0 ? "pointer-events-none opacity-50" : ""}`}
          aria-disabled={items.length === 0}
        >
          Find best value ({items.length} {items.length === 1 ? "item" : "items"})
        </Link>
      </div>
    </div>
  );
}
