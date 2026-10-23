import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { trip, coord } from "../data";
import type { Day } from "../types";
import { addDays, diffDays, todayTokyo, TZ } from "./format";

export interface DayWeather { code: number; max: number; min: number; pop: number | null }
interface Entry { fetchedAt: number; daily: Record<string, DayWeather> }
type Status = "loading" | "ok" | "stale" | "failed";

export type WeatherView =
  | { kind: "loading" }
  | { kind: "ok"; w: DayWeather; early: boolean; recorded: boolean; staleAt?: number }
  | { kind: "wait"; from: string }
  | { kind: "none" }
  | { kind: "unavailable" };

const TTL = 3 * 3600 * 1000;
const CACHE_PREFIX = "trip-lens:weather:v1:";
const key = (lat: number, lng: number) => `${lat.toFixed(2)},${lng.toFixed(2)}`;

function readCache(k: string): Entry | null {
  try {
    const s = localStorage.getItem(CACHE_PREFIX + k);
    return s ? (JSON.parse(s) as Entry) : null;
  } catch { return null; }
}
function writeCache(k: string, e: Entry) {
  try { localStorage.setItem(CACHE_PREFIX + k, JSON.stringify(e)); } catch { /* ignore */ }
}

async function fetchLocation(lat: number, lng: number): Promise<Entry> {
  const p = new URLSearchParams({
    latitude: lat.toFixed(4), longitude: lng.toFixed(4), timezone: TZ,
    daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
    past_days: "14", forecast_days: "16",
  });
  const res = await fetch(`https://api.open-meteo.com/v1/forecast?${p}`);
  if (!res.ok) throw new Error(`Open-Meteo HTTP ${res.status}`);
  const j = await res.json();
  const d = j.daily;
  const daily: Record<string, DayWeather> = {};
  (d.time as string[]).forEach((t, i) => {
    if (d.weather_code[i] == null || d.temperature_2m_max[i] == null) return;
    daily[t] = {
      code: d.weather_code[i], max: d.temperature_2m_max[i], min: d.temperature_2m_min[i],
      pop: d.precipitation_probability_max?.[i] ?? null,
    };
  });
  return { fetchedAt: Date.now(), daily };
}

// Module-level: one in-flight/finished request per unique location, shared by all pages.
const inflight = new Map<string, Promise<{ entry: Entry | null; status: Status }>>();
function load(lat: number, lng: number) {
  const k = key(lat, lng);
  let p = inflight.get(k);
  if (!p) {
    p = (async () => {
      const cached = readCache(k);
      if (cached && Date.now() - cached.fetchedAt < TTL) return { entry: cached, status: "ok" as Status };
      try {
        const entry = await fetchLocation(lat, lng);
        writeCache(k, entry);
        return { entry, status: "ok" as Status };
      } catch {
        return cached ? { entry: cached, status: "stale" as Status } : { entry: null, status: "failed" as Status };
      }
    })();
    inflight.set(k, p);
  }
  return p;
}

type Store = Record<string, { entry: Entry | null; status: Status }>;
const Ctx = createContext<(d: Day) => WeatherView>(() => ({ kind: "loading" }));
export const useWeatherFor = () => useContext(Ctx);

export function WeatherProvider({ children }: { children: ReactNode }) {
  const [store, setStore] = useState<Store>({});
  useEffect(() => {
    const seen = new Set<string>();
    for (const d of trip.days) {
      const c = coord(d.location);
      if (!c || seen.has(key(c.lat, c.lng))) continue;
      seen.add(key(c.lat, c.lng));
      void load(c.lat, c.lng).then((r) => setStore((s) => ({ ...s, [key(c.lat, c.lng)]: r })));
    }
  }, []);

  const fn = useMemo(() => (d: Day): WeatherView => {
    const c = coord(d.location);
    if (!c) return { kind: "unavailable" };
    const today = todayTokyo();
    const delta = diffDays(today, d.date);
    if (delta > 15) return { kind: "wait", from: addDays(d.date, -15) };
    const r = store[key(c.lat, c.lng)];
    if (!r) return { kind: "loading" };
    const w = r.entry?.daily[d.date];
    if (!w) {
      if (!r.entry) return { kind: "unavailable" };
      return delta >= 0 ? { kind: "unavailable" } : { kind: "none" };
    }
    return { kind: "ok", w, early: delta >= 8, recorded: delta < 0, staleAt: r.status === "stale" ? r.entry!.fetchedAt : undefined };
  }, [store]);

  return <Ctx.Provider value={fn}>{children}</Ctx.Provider>;
}
