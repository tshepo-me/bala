import type { Product, SizeUnit } from "./types";

/** Converts a product size to its base unit (kg, L, or each). */
export function toBaseSize(value: number, unit: SizeUnit): { value: number; unit: "kg" | "L" | "each" } {
  switch (unit) {
    case "g":
      return { value: value / 1000, unit: "kg" };
    case "kg":
      return { value, unit: "kg" };
    case "ml":
      return { value: value / 1000, unit: "L" };
    case "L":
      return { value, unit: "L" };
    case "each":
      return { value, unit: "each" };
  }
}

/** Rand per base unit (per kg, per L, or per item). */
export function unitPrice(product: Product, price: number): { value: number; unit: string } {
  const base = toBaseSize(product.sizeValue, product.sizeUnit);
  if (base.value <= 0) return { value: price, unit: "each" };
  return { value: price / base.value, unit: base.unit };
}

export function formatSize(product: Product): string {
  if (product.sizeUnit === "each") {
    return product.sizeValue === 1 ? "" : `${product.sizeValue} pack`;
  }
  return `${product.sizeValue}${product.sizeUnit}`;
}

/** Two products are size-comparable when they share a base unit and differ by at most `tolerance`. */
export function sizeComparable(a: Product, b: Product, tolerance = 0.25): boolean {
  const ba = toBaseSize(a.sizeValue, a.sizeUnit);
  const bb = toBaseSize(b.sizeValue, b.sizeUnit);
  if (ba.unit !== bb.unit) return false;
  if (ba.value === 0 || bb.value === 0) return ba.value === bb.value;
  const ratio = ba.value / bb.value;
  return ratio >= 1 - tolerance && ratio <= 1 + tolerance;
}
