import type { DayType, PlaceCategory, TransportMode } from "../types";

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  arrival: "Arrival", sightseeing: "Sightseeing", road_trip: "Road trip",
  transit: "Transit", free: "Free", departure: "Departure",
};
export const MODE_ICON: Record<TransportMode, string> = {
  train: "🚆", shinkansen: "🚄", drive: "🚗", car_return: "🔑", other: "➡️",
};
export const CATEGORY_ICON: Record<PlaceCategory, string> = {
  museum: "🏛️", shopping: "🛍️", nature: "🌲", scenic_route: "🛣️", shrine_temple: "⛩️", onsen: "♨️",
  town: "🏘️", park: "🌳", attraction: "⭐", theme_park: "🎡", transit_hub: "🚉", farm: "🐄",
  cafe: "☕", rest_stop: "🅿️", other: "📍",
};
export const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack", "takeaway", "unspecified"] as const;
/** Press feedback for tappable cards/buttons (motion-safe only). */
export const TAP = "motion-safe:transition-transform motion-safe:duration-150 motion-safe:active:scale-[0.98]";
