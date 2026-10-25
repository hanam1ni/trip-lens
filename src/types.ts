// Hand-written to match schema/trip.schema.json (v1.2.0) exactly.
export interface Location { lat?: number | null; lng?: number | null; maps_query?: string | null; maps_link_disabled?: boolean }
export type LocationField = Location | null | undefined;
export interface Airport { iata: string; city: string }
export interface LocalDateTime { local_datetime: string; timezone: string }
export interface Flight {
  id: string; direction: "outbound" | "return"; flight_number: string;
  origin: Airport; destination: Airport; departure: LocalDateTime; arrival: LocalDateTime;
  routing: "direct" | "connecting"; price: number | null; currency: string | null;
  needs_review?: boolean; review_note?: string;
}
export type AccommodationType = "hotel" | "resort" | "onsen_inn" | "apartment" | "private_home" | "other";
export interface Accommodation {
  id: string; name: string; city: string; type: AccommodationType; check_in: string; check_out: string;
  nights: number; day_numbers: number[]; meal_plan: "half_board" | "room_only" | null;
  price: number | null; currency: string; notes?: string; location?: LocationField;
  needs_review?: boolean; review_note?: string;
}
export interface Rental {
  id: string; type: "car";
  pickup: { location: string | null; date: string | null };
  return: { location: string; date: string; time: string; approximate: boolean };
  notes?: string;
}
export type TransportMode = "train" | "shinkansen" | "drive" | "car_return" | "other";
export interface TransportLeg {
  id: string; order: number; mode: TransportMode; from: string | null; to: string | null;
  duration_minutes: number | null; time?: string | null; note: string | null;
  needs_review?: boolean; review_note?: string;
}
export type PlaceCategory =
  | "museum" | "shopping" | "nature" | "scenic_route" | "shrine_temple" | "onsen" | "town" | "park"
  | "attraction" | "theme_park" | "transit_hub" | "farm" | "cafe" | "rest_stop" | "other";
export interface Place {
  id: string; order: number; name: string; category: PlaceCategory; note: string | null;
  note_original?: string; location?: LocationField; needs_review?: boolean; review_note?: string;
}
export type Meal = "breakfast" | "lunch" | "dinner" | "snack" | "takeaway" | "unspecified";
export interface FoodItem {
  id: string; order: number; name: string; meal: Meal; cuisine: string | null; note: string | null;
  note_original?: string; location?: LocationField; needs_review?: boolean; review_note?: string;
  option_group?: string; is_option?: boolean;
}
export type DayType = "arrival" | "sightseeing" | "road_trip" | "transit" | "free" | "departure";
export interface Day {
  id: string; day_number: number; date: string;
  weekday: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  day_type: DayType; travel_city: string; sleep_city: string; accommodation_id: string | null;
  flight_ids: string[]; location: LocationField;
  transport: TransportLeg[]; sightseeing: Place[]; food: FoodItem[]; todos: string[]; notes: string[];
  source_text?: { travel?: string; sightseeing?: string; food?: string; travel_2?: string; hotel?: string };
}
export interface Trip {
  schema_version: string;
  meta: { source_file: string; generated_on: string; parse_notes: string[]; changelog?: string[] };
  trip: {
    id: string; title: string; region: string; start_date: string; end_date: string; day_count: number;
    night_count: number; default_currency: string; home_timezone: string; destination_timezone: string;
  };
  flights: Flight[]; accommodations: Accommodation[]; rentals: Rental[]; days: Day[];
}
