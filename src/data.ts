import raw from "./data/trip.json";
import type { Accommodation, Day, Flight, Trip, Location } from "./types";

// Shape is enforced at build time by scripts/validate.mjs (Ajv) against schema/trip.schema.json.
export const trip = raw as unknown as Trip;

export const accById = (id: string | null): Accommodation | undefined =>
  id ? trip.accommodations.find((a) => a.id === id) : undefined;
export const flightById = (id: string): Flight | undefined => trip.flights.find((f) => f.id === id);
export const dayByNumber = (n: number): Day | undefined => trip.days.find((d) => d.day_number === n);

export interface Coord { lat: number; lng: number }
export const coord = (l: Location | null | undefined): Coord | null =>
  l && typeof l.lat === "number" && typeof l.lng === "number" ? { lat: l.lat, lng: l.lng } : null;

export const mapsUrl = (l: Location | null | undefined): string | null => {
  if (!l) return null;
  const c = coord(l);
  const q = l.maps_query ?? (c ? `${c.lat},${c.lng}` : null);
  if (!q) return null;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;
};
