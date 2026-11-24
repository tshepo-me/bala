import type { Product } from "@/lib/domain/types";

/**
 * Demo catalogue: common South African basket items with a typical shelf
 * price (Rand) used to generate per-retailer offers. Prices are illustrative.
 */
export interface SeedProduct extends Product {
  basePrice: number;
  /** Retailers that do not stock this item in the demo. */
  notAt?: string[];
}

const p = (
  id: string,
  name: string,
  brand: string,
  category: string,
  sizeValue: number,
  sizeUnit: Product["sizeUnit"],
  basePrice: number,
  notAt?: string[],
): SeedProduct => ({ id, slug: id, name, brand, category, sizeValue, sizeUnit, basePrice, notAt });

export const seedProducts: SeedProduct[] = [
  // Dairy and eggs
  p("clover-full-cream-milk-2l", "Clover Fresh Full Cream Milk", "Clover", "Dairy & Eggs", 2, "L", 36.99),
  p("parmalat-full-cream-milk-2l", "Parmalat Full Cream Milk", "Parmalat", "Dairy & Eggs", 2, "L", 35.49),
  p("house-full-cream-milk-2l", "House Brand Full Cream Milk", "House brand", "Dairy & Eggs", 2, "L", 31.99, ["spar"]),
  p("clover-butter-500g", "Clover Mooi River Butter", "Clover", "Dairy & Eggs", 500, "g", 89.99),
  p("clover-cheddar-900g", "Clover Cheddar Cheese", "Clover", "Dairy & Eggs", 900, "g", 169.99, ["boxer"]),
  p("nulaid-large-eggs-18", "Nulaid Large Eggs", "Nulaid", "Dairy & Eggs", 18, "each", 72.99),
  p("danone-nutriday-yoghurt-1kg", "Danone NutriDay Smooth Yoghurt", "Danone", "Dairy & Eggs", 1, "kg", 44.99),

  // Bakery
  p("albany-white-bread-700g", "Albany Superior White Bread", "Albany", "Bakery", 700, "g", 19.99),
  p("sasko-brown-bread-700g", "Sasko Brown Bread", "Sasko", "Bakery", 700, "g", 18.49),
  p("blue-ribbon-white-bread-700g", "Blue Ribbon White Bread", "Blue Ribbon", "Bakery", 700, "g", 18.99, ["woolworths"]),

  // Pantry staples
  p("tastic-rice-2kg", "Tastic Parboiled Rice", "Tastic", "Pantry", 2, "kg", 59.99),
  p("spekko-rice-2kg", "Spekko Long Grain Parboiled Rice", "Spekko", "Pantry", 2, "kg", 52.99, ["woolworths"]),
  p("white-star-maize-meal-5kg", "White Star Super Maize Meal", "White Star", "Pantry", 5, "kg", 84.99, ["woolworths"]),
  p("ace-maize-meal-5kg", "Ace Super Maize Meal", "Ace", "Pantry", 5, "kg", 76.99, ["woolworths"]),
  p("huletts-white-sugar-2-5kg", "Huletts White Sugar", "Huletts", "Pantry", 2.5, "kg", 69.99),
  p("selati-white-sugar-2-5kg", "Selati White Sugar", "Selati", "Pantry", 2.5, "kg", 64.99, ["woolworths"]),
  p("sunfoil-sunflower-oil-2l", "Sunfoil Sunflower Oil", "Sunfoil", "Pantry", 2, "L", 74.99),
  p("snowflake-cake-flour-2-5kg", "Snowflake Cake Wheat Flour", "Snowflake", "Pantry", 2.5, "kg", 54.99),
  p("fattis-monis-macaroni-500g", "Fatti's & Moni's Macaroni", "Fatti's & Moni's", "Pantry", 500, "g", 24.99),
  p("koo-baked-beans-410g", "KOO Baked Beans in Tomato Sauce", "KOO", "Pantry", 410, "g", 19.99),
  p("lucky-star-pilchards-400g", "Lucky Star Pilchards in Tomato Sauce", "Lucky Star", "Pantry", 400, "g", 27.99),
  p("black-cat-peanut-butter-400g", "Black Cat Smooth Peanut Butter", "Black Cat", "Pantry", 400, "g", 49.99),
  p("all-gold-tomato-sauce-700ml", "All Gold Tomato Sauce", "All Gold", "Pantry", 700, "ml", 42.99),

  // Hot beverages
  p("jacobs-kronung-coffee-200g", "Jacobs Krönung Instant Coffee", "Jacobs", "Beverages", 200, "g", 119.99, ["boxer"]),
  p("ricoffy-750g", "Nescafé Ricoffy", "Nescafé", "Beverages", 750, "g", 134.99),
  p("joko-tagless-teabags-100", "Joko Tagless Teabags", "Joko", "Beverages", 100, "each", 54.99),
  p("freshpak-rooibos-80", "Freshpak Rooibos Tagless Teabags", "Freshpak", "Beverages", 80, "each", 59.99),

  // Cold beverages
  p("coca-cola-2l", "Coca-Cola Original", "Coca-Cola", "Beverages", 2, "L", 26.99),
  p("oros-orange-2l", "Oros Orange Squash", "Oros", "Beverages", 2, "L", 54.99),

  // Meat and poultry
  p("chicken-braai-pack-2kg", "Fresh Chicken Braai Pack", "Fresh", "Meat & Poultry", 2, "kg", 109.99),
  p("chicken-breast-fillets-1kg", "Fresh Chicken Breast Fillets", "Fresh", "Meat & Poultry", 1, "kg", 99.99),
  p("beef-mince-1kg", "Lean Beef Mince", "Fresh", "Meat & Poultry", 1, "kg", 139.99),
  p("boerewors-1kg", "Traditional Boerewors", "Fresh", "Meat & Poultry", 1, "kg", 129.99),
  p("frozen-mixed-chicken-portions-2kg", "Frozen Mixed Chicken Portions", "Frozen", "Meat & Poultry", 2, "kg", 89.99, ["woolworths"]),

  // Fruit and veg
  p("potatoes-7kg", "Potatoes Pocket", "Fresh", "Fruit & Veg", 7, "kg", 89.99),
  p("onions-2kg", "Onions", "Fresh", "Fruit & Veg", 2, "kg", 32.99),
  p("tomatoes-1kg", "Tomatoes", "Fresh", "Fruit & Veg", 1, "kg", 29.99),
  p("bananas-1kg", "Bananas", "Fresh", "Fruit & Veg", 1, "kg", 24.99),
  p("apples-1-5kg", "Golden Delicious Apples", "Fresh", "Fruit & Veg", 1.5, "kg", 39.99),
  p("butternut-1kg", "Butternut", "Fresh", "Fruit & Veg", 1, "kg", 22.99),

  // Household
  p("baby-soft-toilet-paper-18", "Baby Soft 2-Ply Toilet Paper", "Baby Soft", "Household", 18, "each", 149.99),
  p("omo-auto-washing-powder-2kg", "OMO Auto Washing Powder", "OMO", "Household", 2, "kg", 109.99),
  p("sunlight-dishwashing-liquid-750ml", "Sunlight Dishwashing Liquid", "Sunlight", "Household", 750, "ml", 39.99),
  p("handy-andy-750ml", "Handy Andy Cream Cleaner", "Handy Andy", "Household", 750, "ml", 36.99),

  // Personal care
  p("colgate-toothpaste-100ml", "Colgate Triple Action Toothpaste", "Colgate", "Personal Care", 100, "ml", 29.99),
  p("lux-soap-4x175g", "Lux Soft Touch Soap 4 pack", "Lux", "Personal Care", 4, "each", 49.99),
  p("shield-roll-on-50ml", "Shield Roll-On Deodorant", "Shield", "Personal Care", 50, "ml", 32.99),

  // Baby and pets
  p("pampers-size-4-58", "Pampers Baby-Dry Size 4", "Pampers", "Baby", 58, "each", 269.99, ["boxer"]),
  p("bobtail-dog-food-8kg", "Bobtail Adult Dog Food", "Bobtail", "Pets", 8, "kg", 189.99, ["woolworths"]),
];

export const products: Product[] = seedProducts.map((sp) => ({
  id: sp.id,
  slug: sp.slug,
  name: sp.name,
  brand: sp.brand,
  category: sp.category,
  sizeValue: sp.sizeValue,
  sizeUnit: sp.sizeUnit,
}));
