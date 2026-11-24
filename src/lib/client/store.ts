"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { ListItem, RecommendSettings } from "@/lib/domain/types";

const LIST_KEY = "bala.list.v1";
const SETTINGS_KEY = "bala.settings.v1";

export const defaultSettings: RecommendSettings = {
  lat: -26.146,
  lng: 28.042,
  radiusKm: 10,
  maxStops: 2,
  loyaltyCards: [],
  travelMode: "car",
  travelCostPerKm: 4.5,
  stopPenaltyRand: 15,
  minSplitSavingRand: 30,
};

/* ------------------------------------------------------------------ */
/* A tiny external store over localStorage, so React can subscribe to  */
/* it with useSyncExternalStore (no setState-in-effect, SSR safe).      */
/* ------------------------------------------------------------------ */

const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; value: unknown }>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
}

function emit() {
  for (const l of listeners) l();
}

function readSnapshot<T>(key: string, fallback: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(key);
  } catch {
    raw = null;
  }
  const hit = cache.get(key);
  if (hit && hit.raw === raw) return hit.value as T;
  let value: T = fallback;
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as unknown;
      value = Array.isArray(fallback) ? (parsed as T) : ({ ...fallback, ...(parsed as object) } as T);
    } catch {
      value = fallback;
    }
  }
  cache.set(key, { raw, value });
  return value;
}

function writeValue<T>(key: string, value: T) {
  const raw = JSON.stringify(value);
  try {
    window.localStorage.setItem(key, raw);
  } catch {
    // Storage full or blocked: keep the in-memory cache so the UI still works.
  }
  cache.set(key, { raw, value });
  emit();
}

/** True once the component has hydrated on the client. */
function useHydrated() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

export function usePersistentState<T>(key: string, fallback: T) {
  const value = useSyncExternalStore(
    subscribe,
    () => readSnapshot(key, fallback),
    () => fallback,
  );
  const ready = useHydrated();

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readSnapshot(key, fallback);
      const v = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
      writeValue(key, v);
    },
    [key, fallback],
  );

  return [value, update, ready] as const;
}

const EMPTY_LIST: ListItem[] = [];

export function useShoppingList() {
  const [items, setItems, ready] = usePersistentState<ListItem[]>(LIST_KEY, EMPTY_LIST);

  const addItem = useCallback(
    (item: Omit<ListItem, "id">) => {
      setItems((prev) => {
        const existing = prev.find((p) => p.productId === item.productId);
        if (existing) {
          return prev.map((p) => (p.id === existing.id ? { ...p, qty: p.qty + item.qty } : p));
        }
        const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
        return [...prev, { ...item, id }];
      });
    },
    [setItems],
  );

  const updateItem = useCallback(
    (id: string, patch: Partial<ListItem>) => {
      setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    },
    [setItems],
  );

  const removeItem = useCallback((id: string) => setItems((prev) => prev.filter((p) => p.id !== id)), [setItems]);
  const clear = useCallback(() => setItems([]), [setItems]);

  return { items, ready, addItem, updateItem, removeItem, clear, setItems };
}

export function useSettings() {
  const [settings, setSettings, ready] = usePersistentState<RecommendSettings>(SETTINGS_KEY, defaultSettings);
  return { settings, setSettings, ready };
}
