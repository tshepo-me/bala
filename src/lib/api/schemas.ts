import { z } from "zod";

export const listItemSchema = z.object({
  id: z.string().min(1).max(64),
  rawText: z.string().max(200).default(""),
  productId: z.string().min(1).max(128),
  qty: z.number().int().min(1).max(99),
  flexible: z.boolean().default(false),
});

export const settingsSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  radiusKm: z.number().min(0.5).max(100).default(10),
  maxStops: z.union([z.literal(1), z.literal(2), z.literal(3)]).default(2),
  loyaltyCards: z.array(z.string().max(64)).max(20).default([]),
  travelMode: z.enum(["car", "taxi", "walk"]).default("car"),
  travelCostPerKm: z.number().min(0).max(100).default(4.5),
  stopPenaltyRand: z.number().min(0).max(500).default(15),
  minSplitSavingRand: z.number().min(0).max(1000).default(30),
});

export const recommendRequestSchema = z.object({
  items: z.array(listItemSchema).min(1).max(60),
  settings: settingsSchema,
});

export type RecommendRequest = z.infer<typeof recommendRequestSchema>;
export type SettingsInput = z.input<typeof settingsSchema>;
