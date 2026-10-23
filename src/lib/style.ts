import {
  ArrowRight, Bath, Bell, Car, Coffee, Cookie, Croissant, FerrisWheel, Houses, KeyRound, Landmark, MapPin,
  Mountain, PlaneLanding, PlaneTakeoff, Route, ShoppingBag, Soup, Sparkles, SquareParking, Star, Sun,
  Tractor, TrainFront, TrainFrontTunnel, Trees, Utensils, type LucideIcon,
} from "lucide-react";
import type { DayType, Meal, PlaceCategory, TransportMode } from "../types";

export const DAY_TYPE_LABEL: Record<DayType, string> = {
  arrival: "Arrival", sightseeing: "Sightseeing", road_trip: "Road trip",
  transit: "Transit", free: "Free", departure: "Departure",
};
export const DAY_TYPE_ICON: Record<DayType, LucideIcon> = {
  arrival: PlaneLanding, sightseeing: MapPin, road_trip: Car, transit: TrainFront, free: Sun, departure: PlaneTakeoff,
};
export const MODE_ICON: Record<TransportMode, LucideIcon> = {
  train: TrainFront, shinkansen: TrainFrontTunnel, drive: Car, car_return: KeyRound, other: ArrowRight,
};
export const CATEGORY_ICON: Record<PlaceCategory, LucideIcon> = {
  museum: Landmark, shopping: ShoppingBag, nature: Mountain, scenic_route: Route, shrine_temple: Bell, onsen: Bath,
  town: Houses, park: Trees, attraction: Star, theme_park: FerrisWheel, transit_hub: TrainFront, farm: Tractor,
  cafe: Coffee, rest_stop: SquareParking, other: MapPin,
};
export const MEAL_ICON: Record<Meal, LucideIcon> = {
  breakfast: Croissant, lunch: Utensils, dinner: Soup, snack: Cookie, takeaway: ShoppingBag, unspecified: Sparkles,
};

/** Tint family for icon tiles and pills. */
export type Tone = "primary" | "accent" | "secondary" | "neutral";
export const TONE: Record<Tone, string> = {
  primary: "bg-primary-soft text-primary",
  accent: "bg-accent-soft text-accent-ink",
  secondary: "bg-secondary-soft text-secondary",
  neutral: "bg-neutral-soft text-ink",
};
export const CATEGORY_TONE = (c: PlaceCategory): Tone =>
  ["nature", "park", "scenic_route", "farm", "onsen"].includes(c) ? "secondary"
    : ["cafe", "shopping", "rest_stop"].includes(c) ? "accent" : "primary";
export const DAY_TYPE_TONE: Record<DayType, Tone> = {
  arrival: "primary", sightseeing: "primary", road_trip: "secondary", transit: "neutral", free: "accent", departure: "primary",
};

export const MEAL_ORDER = ["breakfast", "lunch", "dinner", "snack", "takeaway", "unspecified"] as const;
/** Press feedback for tappable cards/buttons (motion-safe only). */
export const TAP = "motion-safe:transition-transform motion-safe:duration-150 motion-safe:active:scale-[0.98]";
/** White card: big radius, no border, soft warm shadow. */
export const CARD = "rounded-3xl bg-surface p-4 shadow-card";
/** Pill buttons. */
export const BTN_PRIMARY = `inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-white shadow-card ${TAP}`;
export const BTN_SOFT = `inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary-soft px-5 text-sm font-semibold text-primary ${TAP}`;
/** Map colours: Leaflet writes these into SVG attributes, so they can't be CSS variables. Keep in sync with index.css. */
export const MAP_ROUTE = "#8a6e5a";
