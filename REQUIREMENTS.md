# Trip Lens — Requirements

Static React web app that visualizes the **Aomori to Tokyo Road Trip** (28 Oct – 9 Nov 2026, 13 days / 12 nights) so everyone in the group can see, for each day: **what we do, where we stay, where we eat, and the weather**.

- **Data source:** `trip.json` (schema `trip_schema.json`, v1.0.0 → bumped to v1.1.0, see §6)
- **Deadline:** live by **27 Oct 2026** (the day before Day 1)
- **Audience:** trip group, read-only, mostly on phones

---

## 1. Goals

| # | Goal | Answered by |
|---|---|---|
| G1 | See the whole route on a map of Japan | Map tab (§3.1 FR-3) |
| G2 | Know what we do each day | Day page – sightseeing + transport (§3.2) |
| G3 | Know where we stay each night | Day page + Trip day cards (§3.1, §3.2) |
| G4 | Know where we eat | Day page – food by meal (§3.2) |
| G5 | Know the weather each day | Weather on Today, Trip day cards + day page (§4) |

## 2. Non-goals (v1)

- Editing in the UI (data is edited in `trip.json` and redeployed)
- Login / user accounts
- Budget / prices (all prices are `null` in the data)
- Thai/English language toggle
- Showing `needs_review` / `review_note` flags — ignored by the UI

---

## 3. Pages

### 3.0 App shell

- Fixed bottom tab bar: **Today**, **Trip**, **Map** (icon + label, ≥ 56 px tall, padded by `env(safe-area-inset-bottom)`); content sits above it. Each tab has a compact sticky title instead of a global header.
- Routes (hash): `/` → `/today`; `/today`; `/trip`; `/trip/day/:n` (Trip tab active); `/map?focus=<day>`; legacy `/day/:n` → `/trip/day/:n`; anything else → `/today`.
- Returning from a day page to `/trip` restores the list's scroll position.
- Motion: CSS + View Transitions API only, 150–250 ms, `transform`/`opacity` only, disabled under `prefers-reduced-motion: reduce`; unsupported browsers fall back to instant navigation. Nothing animates on scroll.

### 3.1 Tabs

**FR-1 Today — `/#/today`** (phase from today in `Asia/Tokyo` vs trip start/end)
- *Before the trip:* countdown ("Starts in N days"), outbound flight, Day 1 preview (same sections as the day page) + link to Day 1.
- *During the trip:* "Day N of 13", date, `travel_city → sleep_city`, full weather; **Heads-up** (flights, car return incl. "approx.", check-in on the first night, check-out on the accommodation's `check_out` date, the day's todos); Getting around, Go, Eat, Stay, Notes; "View today on map" (`/map?focus=N`); a "Tomorrow" card (route + weather) linking to its day page. A day with no activities shows "Free day".
- *After the trip:* "Trip complete" + link to the Trip tab.

**FR-2 Trip — `/#/trip`**
- Header: title, date range, `day_count` days / `night_count` nights.
- Flights: outbound and return — flight number, route (IATA + city), departure and arrival in each airport's own local time with timezone label.
- Day list: one card per day — `Day N · Weekday · date`, `travel_city → sleep_city`, hotel name (or "✈️ Flight home"), weather icon + high/low, counts (e.g. "5 places · 1 food"). Tap card → `/trip/day/:n`.
- Today's day (in `Asia/Tokyo`) is highlighted and scrolled into view on the first visit during the trip.

**FR-3 Map — `/#/map`**
- Full-height map of Japan (viewport minus the tab bar), touch drag/pinch.
- One **numbered pin per day** at `day.location`; consecutive days at the same location merge into one pin labelled by range (e.g. "1–2", "11–12"). A **route line** connects pins in day order.
- Tapping a pin opens a popup: day number(s), date, `travel_city`, hotel name, weather icon + high/low, and a **"View day"** link to `/trip/day/:n`.
- `?focus=<day>` highlights and pans to that day's pin; otherwise today's pin during the trip, else fit the whole route.

### 3.2 Day page — `/#/trip/day/:n`

**FR-5 Header**
- `Day N`, weekday, date, `travel_city → sleep_city`, `day_type` badge.
- Prev / next day navigation; back to the Trip tab.

**FR-6 Weather** — see §4.

**FR-7 What we do**
- `sightseeing[]` sorted by `order`: name, category icon/label, `note`; Thai `note_original` (when present) as a smaller, muted second line (always shown — not a toggle).
- `transport[]` sorted by `order`: mode icon, `from → to`, `time` if present, `duration_minutes` formatted (e.g. "1h 20m"), `note`.
- Shown as separate sections ("Getting around", "Places") — the data has no ordering across the two lists, so they are not merged into one timeline.
- Each place with a location gets an "Open in Google Maps" link.

**FR-8 Where we eat**
- `food[]` grouped by `meal` in order breakfast → lunch → dinner → snack → takeaway → unspecified; within a group sorted by `order`.
- Name, `cuisine`, `note`, Thai `note_original` as a secondary line, Google Maps link. The `unspecified` group is labelled "Ideas".

**FR-9 Where we stay**
- Accommodation from `accommodation_id`: name, city, type, meal plan, check-in / check-out dates, "Night X of Y", accommodation `notes`.
- Google Maps link.
- Day 13 (`accommodation_id: null`) shows the return flight instead.

**FR-10 Day map**
- Small map with the day's places and food items that have coordinates, plus the hotel.
- Hidden if the day has nothing with coordinates.

**FR-11 Notes & todos**
- `notes[]` and `todos[]` as lists; hidden when empty.

**FR-12 Empty days**
- Days with no activities (Day 12) show "Free day" instead of empty sections.

---

## 4. Weather

**FR-13 Source:** [Open-Meteo](https://open-meteo.com) Forecast API, called from the browser (no API key, no backend), using `day.location` lat/lng and `timezone=Asia/Tokyo`.

**FR-14 Fields shown:** weather icon + label (from WMO weather code), max/min temperature (°C), precipitation probability (%).

**FR-15 States by date:**
| Day's date | Shown |
|---|---|
| Within 7 days of today | Forecast |
| 8–16 days out | Forecast, labelled "Early forecast" |
| Beyond 16 days | "Forecast available from <date>" |
| In the past | Recorded weather (Open-Meteo archive) or nothing |

**FR-16 Caching:** responses cached in `localStorage` for 3 hours; on network failure show last cached value with "updated <time>", otherwise "Weather unavailable". Weather failure must never break the page.

**FR-17 Requests:** one request per unique location (batched/merged across days sharing a location), not one per day per page view.

---

## 5. Non-functional requirements

| ID | Requirement |
|---|---|
| NFR-1 | Mobile-first; works from 360 px width; tap targets ≥ 44 px |
| NFR-2 | Fully static build, deployable to any static host; hash routing (no server rewrites) |
| NFR-3 | Initial JS ≤ 300 KB gzipped (excluding map tiles) |
| NFR-4 | All trip times in `Asia/Tokyo`; flight times in each airport's own timezone |
| NFR-5 | Unlisted public URL with `<meta name="robots" content="noindex">` and `robots.txt` disallow-all |
| NFR-6 | `trip.json` validated against the schema at build time (Ajv); build fails on invalid data |
| NFR-7 | Works in latest iOS Safari and Android Chrome |
| NFR-8 *(stretch)* | Offline support (PWA) — last-loaded trip + weather available without signal |

---

## 6. Data changes

**DC-1 Schema bump to v1.1.0:** add `location` (existing `$defs/location`) to `day` and to its `required` list.

**DC-2 Fill coordinates**
- **`day.location`** (13 entries) — set manually; drives the Map tab and weather:

| Day | Area pin |
|---|---|
| 1–2 | Aomori city |
| 3 | Lake Towada / Oirase |
| 4 | Lake Tazawa / Hachimantai |
| 5–6 | Morioka |
| 7 | Hiraizumi (Chusonji) |
| 8 | Sendai |
| 9 | Bandai Azuma Skyline |
| 10 | Koriyama → Tokyo (pin: Tokyo) |
| 11–13 | Tokyo |

- **`accommodations[].location`** (7) — set manually. `acc-01` (private home) uses Aomori city centre, not the house address.
- **`sightseeing[]` / `food[]` locations** — filled by a one-off build-time geocoding script from `maps_query` / name, results written back to `trip.json` and spot-checked. No geocoding in the browser.

---

## 7. Tech stack

| Concern | Choice |
|---|---|
| Build | Vite + React + TypeScript |
| Routing | React Router (`HashRouter`) |
| Map | react-leaflet + OpenStreetMap tiles |
| Weather | Open-Meteo (fetch, no SDK) |
| Validation | Ajv (build step) + TS types generated from schema |
| Styling | Tailwind CSS |
| Hosting | GitHub Pages / Netlify / Cloudflare Pages |

---

## 8. Milestones

| # | Deliverable | Target |
|---|---|---|
| M1 | Scaffold, `trip.json` + schema v1.1.0, Ajv validation, typed data loader | 24 Oct |
| M2 | Coordinates filled (DC-2) | 24 Oct |
| M3 | Day page (FR-5 → FR-12) | 25 Oct |
| M4 | Tabs (Today / Trip / Map) + Japan map (FR-1 → FR-3) | 26 Oct |
| M5 | Weather (FR-13 → FR-17) | 26 Oct |
| M6 | Deploy + NFR-5, share link with group | 27 Oct |
| M7 *(stretch)* | PWA offline (NFR-8) | if time allows |

## 9. Acceptance criteria

- The Map tab shows a Japan map with pins for all 13 days (merged where same area) connected in order.
- Every day page shows activities, food, stay (or return flight), and weather or a clear weather state.
- Opening the link on a phone with no prior visit loads in < 3 s on 4G.
- Editing `trip.json` with an invalid value fails the build.
