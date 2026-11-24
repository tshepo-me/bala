"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useShoppingList } from "@/lib/client/store";
import type { Product } from "@/lib/domain/types";
import { parseLine } from "@/lib/parseLine";

const placeholder = `2 x milk 2L
brown bread
white star 5kg
eggs
3 koo baked beans
toilet paper`;

export function QuickStart() {
  const router = useRouter();
  const { addItem } = useShoppingList();
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [unmatched, setUnmatched] = useState<string[]>([]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const lines = text.split("\n").map(parseLine).filter((x): x is { qty: number; text: string } => x !== null);
    if (lines.length === 0) return;
    setBusy(true);
    const misses: string[] = [];
    for (const line of lines) {
      const res = await fetch(`/api/products?q=${encodeURIComponent(line.text)}`);
      const data = (await res.json()) as { products: Product[] };
      const hit = data.products[0];
      if (hit) {
        addItem({ rawText: line.text, productId: hit.id, qty: line.qty, flexible: false });
      } else {
        misses.push(line.text);
      }
    }
    setBusy(false);
    setUnmatched(misses);
    if (misses.length === 0) router.push("/list");
  }

  return (
    <form onSubmit={submit} className="card space-y-4 p-6">
      <div>
        <label htmlFor="quick" className="label">
          Paste your list, one item per line
        </label>
        <textarea
          id="quick"
          className="input mt-2 min-h-44 font-mono text-sm"
          placeholder={placeholder}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      {unmatched.length > 0 && (
        <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
          Added what we recognised. Could not match: {unmatched.join(", ")}. Add those on the list page with search.
          <button type="button" className="ml-2 font-semibold underline" onClick={() => router.push("/list")}>
            Go to list
          </button>
        </p>
      )}
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-slate-500">Quantities like &ldquo;2 x milk&rdquo; are understood.</p>
        <button type="submit" className="btn-primary" disabled={busy || text.trim().length === 0}>
          {busy ? "Matching…" : "Start comparing"}
        </button>
      </div>
    </form>
  );
}
