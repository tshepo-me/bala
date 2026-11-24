import Link from "next/link";
import { Logo } from "./Logo";

const nav = [
  { href: "/list", label: "My list", short: "List" },
  { href: "/results", label: "Results", short: "Results" },
  { href: "/specials", label: "Specials", short: "Specials" },
  { href: "/how-it-works", label: "How it works", short: "Help" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Bala home">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight text-brand-700">Bala</span>
        </Link>
        <nav className="flex items-center gap-0.5 text-sm font-medium text-slate-600 sm:gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="whitespace-nowrap rounded-lg px-2 py-2 hover:bg-slate-100 hover:text-slate-900 sm:px-3"
            >
              <span className="sm:hidden">{n.short}</span>
              <span className="hidden sm:inline">{n.label}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
