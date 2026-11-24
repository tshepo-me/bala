import type { Retailer } from "@/lib/domain/types";

export function RetailerBadge({ retailer, size = "md" }: { retailer: Retailer; size?: "sm" | "md" }) {
  const cls = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold text-white ${cls}`}
      style={{ backgroundColor: retailer.color }}
    >
      {retailer.shortName}
    </span>
  );
}
