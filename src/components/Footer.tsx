import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          <span className="font-semibold text-slate-700">Bala</span> · Count on it. Prices shown are demo data for
          development and do not reflect real store prices.
        </p>
        <nav className="flex gap-4">
          <Link href="/how-it-works" className="hover:text-slate-900">
            How it works
          </Link>
          <Link href="/privacy" className="hover:text-slate-900">
            Privacy
          </Link>
          <a href="https://github.com/tshepo-me/bala" className="hover:text-slate-900" rel="noreferrer">
            GitHub
          </a>
        </nav>
      </div>
    </footer>
  );
}
