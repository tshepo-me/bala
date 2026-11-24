"use client";

import { useSettings } from "@/lib/client/store";
import type { Retailer, TravelMode } from "@/lib/domain/types";

interface Preset {
  id: string;
  label: string;
  lat: number;
  lng: number;
}

/** Rough Rand per km by travel mode; petrol ~R4.50/km for a small car. */
const travelCost: Record<TravelMode, number> = { car: 4.5, taxi: 3.0, walk: 0 };

export function SettingsPanel({ retailers, presets }: { retailers: Retailer[]; presets: Preset[] }) {
  const { settings, setSettings, ready } = useSettings();
  const currentPreset = presets.find((p) => p.lat === settings.lat && p.lng === settings.lng)?.id ?? "custom";

  if (!ready) return <div className="card h-64 animate-pulse" />;

  return (
    <div className="card space-y-5 p-5">
      <h2 className="text-lg font-semibold">Where you shop from</h2>

      <div>
        <label htmlFor="loc" className="label">
          Location
        </label>
        <select
          id="loc"
          className="input mt-1.5"
          value={currentPreset}
          onChange={(e) => {
            const p = presets.find((x) => x.id === e.target.value);
            if (p) setSettings((s) => ({ ...s, lat: p.lat, lng: p.lng }));
          }}
        >
          {currentPreset === "custom" && <option value="custom">Custom location</option>}
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="mt-1.5 text-xs font-semibold text-brand-600 hover:underline"
          onClick={() => {
            navigator.geolocation?.getCurrentPosition((pos) =>
              setSettings((s) => ({ ...s, lat: pos.coords.latitude, lng: pos.coords.longitude })),
            );
          }}
        >
          Use my current location
        </button>
      </div>

      <div>
        <label htmlFor="radius" className="label">
          Search radius: {settings.radiusKm} km
        </label>
        <input
          id="radius"
          type="range"
          min={2}
          max={30}
          step={1}
          className="mt-1.5 w-full accent-brand-600"
          value={settings.radiusKm}
          onChange={(e) => setSettings((s) => ({ ...s, radiusKm: Number(e.target.value) }))}
        />
      </div>

      <div>
        <span className="label">Travel</span>
        <div className="mt-1.5 grid grid-cols-3 gap-2">
          {(["car", "taxi", "walk"] as TravelMode[]).map((m) => (
            <button
              key={m}
              type="button"
              className={`rounded-xl border px-3 py-2 text-sm font-medium capitalize ${
                settings.travelMode === m
                  ? "border-brand-600 bg-brand-50 text-brand-700"
                  : "border-slate-300 text-slate-600 hover:bg-slate-50"
              }`}
              onClick={() => setSettings((s) => ({ ...s, travelMode: m, travelCostPerKm: travelCost[m] }))}
            >
              {m}
            </button>
          ))}
        </div>
        <p className="mt-1 text-xs text-slate-500">Petrol is costed at R{settings.travelCostPerKm.toFixed(2)}/km, round trip.</p>
      </div>

      <div>
        <label htmlFor="stops" className="label">
          Maximum stores per trip
        </label>
        <select
          id="stops"
          className="input mt-1.5"
          value={settings.maxStops}
          onChange={(e) => setSettings((s) => ({ ...s, maxStops: Number(e.target.value) as 1 | 2 | 3 }))}
        >
          <option value={1}>1 — one stop only</option>
          <option value={2}>2 — split if it saves R{settings.minSplitSavingRand}+</option>
          <option value={3}>3 — I will drive for a bargain</option>
        </select>
      </div>

      <div>
        <span className="label">Loyalty cards I hold</span>
        <div className="mt-1.5 space-y-1.5">
          {retailers
            .filter((r) => r.loyaltyProgram)
            .map((r) => {
              const checked = settings.loyaltyCards.includes(r.id);
              return (
                <label key={r.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brand-600"
                    checked={checked}
                    onChange={(e) =>
                      setSettings((s) => ({
                        ...s,
                        loyaltyCards: e.target.checked
                          ? [...s.loyaltyCards, r.id]
                          : s.loyaltyCards.filter((x) => x !== r.id),
                      }))
                    }
                  />
                  <span>
                    {r.loyaltyProgram} <span className="text-slate-400">({r.name})</span>
                  </span>
                </label>
              );
            })}
        </div>
      </div>
    </div>
  );
}
