import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How Bala works",
  description: "How Bala compares grocery specials and decides where your basket costs least.",
};

const sections = [
  {
    h: "1. Your list, your rules",
    p: "Add items with quantities. Mark an item “any brand” when a comparable product of the same size is fine, for example any 2L full cream milk. Tell us where you shop from, how far you will travel, and which loyalty cards you hold.",
  },
  {
    h: "2. One price per item per retailer",
    p: "For every item we take each retailer’s current shelf price and apply this week’s promotion at your quantity: multibuys such as “2 for R55”, percentage discounts, buy-two-get-one-free, and card-only prices (counted only if you hold that card). Per-customer limits are respected.",
  },
  {
    h: "3. Single store or split trip",
    p: "We total your basket at each retailer with a store in range, then add a round-trip travel cost based on distance. We also test every pair (and optionally trio) of retailers, assigning each item to the cheaper one and adding a small time penalty per extra stop. A split is only recommended if it beats the best single store by a minimum saving, so you are not sent across town to save R12.",
  },
  {
    h: "4. Is the special real?",
    p: "Each price is shown against the typical price for that product over the past 90 days. A “special” that is still above the typical price is flagged, and genuine drops are highlighted.",
  },
  {
    h: "Where the prices come from",
    p: "This development build uses demo data modelled on typical South African shelf prices. The production system ingests weekly retailer leaflets and online storefront prices, matches them to one canonical catalogue, and quarantines anything that looks wrong before it reaches you. Crowdsourced receipts will add real paid prices per store.",
  },
];

export default function HowItWorksPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">How Bala works</h1>
        <p className="mt-2 text-slate-600">
          Bala means “count” in isiZulu, isiXhosa, Sesotho and Setswana. The app does the counting so you do not
          have to.
        </p>
      </header>
      {sections.map((s) => (
        <section key={s.h} className="card p-6">
          <h2 className="text-lg font-semibold">{s.h}</h2>
          <p className="mt-2 text-slate-600">{s.p}</p>
        </section>
      ))}
      <div className="flex gap-3">
        <Link href="/list" className="btn-primary">
          Build my list
        </Link>
        <Link href="/specials" className="btn-secondary">
          See this week&rsquo;s specials
        </Link>
      </div>
    </article>
  );
}
