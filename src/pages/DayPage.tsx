import type { CSSProperties } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { accById, coord, dayByNumber, flightById } from "../data";
import { Weather } from "../components/Weather";
import { FlightCard } from "../components/FlightCard";
import { DayMap, type DayPoint } from "../components/DayMap";
import { TopBar } from "../components/TopBar";
import { Section } from "../components/day/Section";
import { TransportList } from "../components/day/TransportList";
import { PlaceList } from "../components/day/PlaceList";
import { FoodList } from "../components/day/FoodList";
import { StayCard } from "../components/day/StayCard";
import { NotesList } from "../components/day/NotesList";
import { FreeDay } from "../components/day/FreeDay";
import { DAY_TYPE_LABEL, TAP } from "../lib/style";
import { fmtDate } from "../lib/format";
import { isFreeDay } from "../lib/tripState";
import { setNavDir } from "../lib/motion";

const navBtn = `flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white px-3 text-sm ${TAP}`;

export function DayPage() {
  const n = Number(useParams().n);
  const day = dayByNumber(n);
  if (!day) return <Navigate to="/trip" replace />;
  const acc = accById(day.accommodation_id);
  const flights = day.flight_ids.map(flightById).filter((f) => !!f);
  const prev = dayByNumber(n - 1), next = dayByNumber(n + 1);

  const pts: DayPoint[] = [];
  for (const p of day.sightseeing) { const c = coord(p.location); if (c) pts.push({ id: p.id, name: p.name, at: c, kind: "place" }); }
  for (const f of day.food) { const c = coord(f.location); if (c) pts.push({ id: f.id, name: f.name, at: c, kind: "food" }); }
  const hc = coord(acc?.location);
  if (acc && hc) pts.push({ id: acc.id, name: acc.name, at: hc, kind: "hotel" });

  return (
    <>
      <TopBar>
        <Link to="/trip" viewTransition className={navBtn}>← Trip</Link>
        <div className="flex gap-2">
          {prev && <Link to={`/trip/day/${prev.day_number}`} viewTransition onClick={() => setNavDir("prev")} className={navBtn} aria-label={`Previous day, Day ${prev.day_number}`}>‹ Day {prev.day_number}</Link>}
          {next && <Link to={`/trip/day/${next.day_number}`} viewTransition onClick={() => setNavDir("next")} className={navBtn} aria-label={`Next day, Day ${next.day_number}`}>Day {next.day_number} ›</Link>}
        </div>
      </TopBar>

      <main className="mx-auto max-w-3xl space-y-5 px-4 py-4">
        <header className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="vt-title text-2xl font-bold" style={{ "--vt": `day-title-${day.day_number}` } as CSSProperties}>Day {day.day_number}</h1>
            <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-medium text-slate-700">
              {DAY_TYPE_LABEL[day.day_type]}
            </span>
          </div>
          <p className="text-slate-600">{day.weekday} · {fmtDate(day.date, { day: "numeric", month: "long", year: "numeric" })}</p>
          <p className="font-medium">{day.travel_city} → {day.sleep_city}</p>
        </header>

        <div className="rounded-lg border border-slate-200 bg-white p-3"><Weather day={day} full /></div>

        {isFreeDay(day) ? <FreeDay /> : (
          <>
            <TransportList day={day} />
            <PlaceList day={day} />
            <FoodList day={day} />
          </>
        )}

        <StayCard day={day} />

        {acc && flights.length > 0 && (
          <Section title="Flights">{flights.map((f) => <FlightCard key={f.id} f={f} />)}</Section>
        )}

        {pts.length > 0 && (
          <Section title="Map"><DayMap pts={pts} />
            <p className="text-xs text-slate-500">📍 places · 🍴 food · 🛏 hotel</p>
          </Section>
        )}

        <NotesList day={day} />
      </main>
    </>
  );
}
