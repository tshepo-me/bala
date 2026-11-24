import type { Retailer, Store } from "@/lib/domain/types";

export const retailers: Retailer[] = [
  { id: "checkers", slug: "checkers", name: "Checkers", shortName: "Checkers", loyaltyProgram: "Xtra Savings", color: "#00A651" },
  { id: "shoprite", slug: "shoprite", name: "Shoprite", shortName: "Shoprite", loyaltyProgram: "Xtra Savings", color: "#E31837" },
  { id: "pnp", slug: "pick-n-pay", name: "Pick n Pay", shortName: "PnP", loyaltyProgram: "Smart Shopper", color: "#003DA5" },
  { id: "woolworths", slug: "woolworths", name: "Woolworths", shortName: "Woolies", loyaltyProgram: "WRewards", color: "#1A1A1A" },
  { id: "spar", slug: "spar", name: "SPAR", shortName: "SPAR", loyaltyProgram: "SPAR Rewards", color: "#008B47" },
  { id: "boxer", slug: "boxer", name: "Boxer", shortName: "Boxer", loyaltyProgram: null, color: "#F7941D" },
];

/**
 * Demo store set for Johannesburg. Coordinates are approximate and only serve
 * the distance model; the production store directory comes from the control plane.
 */
export const stores: Store[] = [
  { id: "chk-sandton", retailerId: "checkers", name: "Checkers Sandton City", suburb: "Sandton", city: "Johannesburg", lat: -26.1076, lng: 28.0567 },
  { id: "chk-rosebank", retailerId: "checkers", name: "Checkers Rosebank Mall", suburb: "Rosebank", city: "Johannesburg", lat: -26.1457, lng: 28.0416 },
  { id: "chk-fourways", retailerId: "checkers", name: "Checkers Hyper Fourways", suburb: "Fourways", city: "Johannesburg", lat: -26.0167, lng: 28.0097 },
  { id: "chk-maponya", retailerId: "checkers", name: "Checkers Maponya Mall", suburb: "Soweto", city: "Johannesburg", lat: -26.2641, lng: 27.8918 },

  { id: "shp-cbd", retailerId: "shoprite", name: "Shoprite Johannesburg CBD", suburb: "Marshalltown", city: "Johannesburg", lat: -26.2041, lng: 28.0401 },
  { id: "shp-randburg", retailerId: "shoprite", name: "Shoprite Randburg", suburb: "Randburg", city: "Johannesburg", lat: -26.0936, lng: 27.9952 },
  { id: "shp-jabulani", retailerId: "shoprite", name: "Shoprite Jabulani Mall", suburb: "Soweto", city: "Johannesburg", lat: -26.2448, lng: 27.8655 },
  { id: "shp-alex", retailerId: "shoprite", name: "Shoprite Pan Africa Alexandra", suburb: "Alexandra", city: "Johannesburg", lat: -26.1037, lng: 28.1016 },

  { id: "pnp-norwood", retailerId: "pnp", name: "Pick n Pay Hyper Norwood", suburb: "Norwood", city: "Johannesburg", lat: -26.1600, lng: 28.0750 },
  { id: "pnp-rosebank", retailerId: "pnp", name: "Pick n Pay The Zone Rosebank", suburb: "Rosebank", city: "Johannesburg", lat: -26.1463, lng: 28.0434 },
  { id: "pnp-randburg", retailerId: "pnp", name: "Pick n Pay Randburg Square", suburb: "Randburg", city: "Johannesburg", lat: -26.0945, lng: 27.9969 },
  { id: "pnp-southgate", retailerId: "pnp", name: "Pick n Pay Southgate", suburb: "Mondeor", city: "Johannesburg", lat: -26.2667, lng: 27.9861 },

  { id: "ww-sandton", retailerId: "woolworths", name: "Woolworths Sandton City", suburb: "Sandton", city: "Johannesburg", lat: -26.1081, lng: 28.0562 },
  { id: "ww-melrose", retailerId: "woolworths", name: "Woolworths Melrose Arch", suburb: "Melrose", city: "Johannesburg", lat: -26.1333, lng: 28.0680 },
  { id: "ww-cresta", retailerId: "woolworths", name: "Woolworths Cresta", suburb: "Cresta", city: "Johannesburg", lat: -26.1296, lng: 27.9733 },

  { id: "spar-parkhurst", retailerId: "spar", name: "KwikSPAR Parkhurst", suburb: "Parkhurst", city: "Johannesburg", lat: -26.1412, lng: 28.0199 },
  { id: "spar-linden", retailerId: "spar", name: "SUPERSPAR Linden", suburb: "Linden", city: "Johannesburg", lat: -26.1388, lng: 27.9912 },
  { id: "spar-greenside", retailerId: "spar", name: "SPAR Greenside", suburb: "Greenside", city: "Johannesburg", lat: -26.1486, lng: 28.0063 },

  { id: "box-diepkloof", retailerId: "boxer", name: "Boxer Diepkloof", suburb: "Soweto", city: "Johannesburg", lat: -26.2480, lng: 27.9530 },
  { id: "box-jabulani", retailerId: "boxer", name: "Boxer Jabulani", suburb: "Soweto", city: "Johannesburg", lat: -26.2435, lng: 27.8670 },
  { id: "box-cbd", retailerId: "boxer", name: "Boxer Johannesburg Park Station", suburb: "Braamfontein", city: "Johannesburg", lat: -26.1965, lng: 28.0427 },
];

/** Preset shopper locations for the demo settings panel. */
export const presetLocations = [
  { id: "rosebank", label: "Rosebank, Johannesburg", lat: -26.1460, lng: 28.0420 },
  { id: "sandton", label: "Sandton, Johannesburg", lat: -26.1070, lng: 28.0560 },
  { id: "randburg", label: "Randburg, Johannesburg", lat: -26.0940, lng: 27.9960 },
  { id: "soweto", label: "Soweto (Diepkloof), Johannesburg", lat: -26.2480, lng: 27.9500 },
  { id: "cbd", label: "Johannesburg CBD", lat: -26.2040, lng: 28.0400 },
] as const;
