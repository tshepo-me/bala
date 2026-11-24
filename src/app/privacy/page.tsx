import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description: "What Bala stores and what it does not.",
};

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
      <div className="card space-y-4 p-6 text-slate-700">
        <p>
          This development build has no accounts. Your shopping list and settings are stored only in your browser
          (localStorage) and are sent to the server solely to compute a recommendation. They are not stored
          server-side and no cookies are set.
        </p>
        <p>
          If you choose &ldquo;Use my current location&rdquo;, your coordinates are kept in your browser and used
          to compute distances to stores. You can replace them with a preset location at any time.
        </p>
        <p>
          When accounts, receipts and alerts are introduced, this page will describe the processing in full in line
          with the Protection of Personal Information Act (POPIA), including how to export or delete your data.
        </p>
      </div>
    </article>
  );
}
