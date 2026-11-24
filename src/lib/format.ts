/**
 * Formatting helpers. Implemented by hand rather than with Intl so the server
 * and the browser produce identical strings (avoids hydration mismatches when
 * locale data differs between Node and the client).
 */

/** "R1 234.56" */
export function formatRand(value: number): string {
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  const [whole, frac] = abs.toFixed(2).split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${sign}R${grouped}.${frac}`;
}

export function formatKm(km: number): string {
  return `${km.toFixed(1)} km`;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "24 Nov" from "2026-11-24". */
export function formatDate(iso: string): string {
  const [, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[(m ?? 1) - 1]}`;
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
