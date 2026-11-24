import Link from "next/link";
import { Logo } from "./Logo";

const nav = [
  { href: "/list", label: "My list" },
  { href: "/results", label: "Results" },
  { href: "/specials", label: "Specials" },
  { href: "/how-it-works", label: "How it works" },
] as const;

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="Bala home">
          <Logo className="h-8 w-8" />
          <span className="text-xl font-bold tracking-tight text-brand-700">Bala</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm font-medium text-slate-600">
          {nav.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-lg px-3 py-2 hover:bg-slate-100 hover:text-slate-900">
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
