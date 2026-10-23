import type { CSSProperties } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ArrowLeft, Bed, ChevronLeft, ChevronRight, MapPin, Star, Utensils } from "lucide-react";
import { accById, coord, dayByNumber, flightById, trip } from "../data";
import { Weather } from "../components/Weather";
import { FlightCard } from "../components/FlightCard";
import { DayMap, PIN_BG, type DayPoint } from "../components/DayMap";
import { TopBar } from "../components/TopBar";
import { Hero, Sheet } from "../components/Hero";
import { placeIds } from "../components/Thumb";
import { Pill } from "../components/ui";
import { card, Section } from "../components/day/Section";
import { TransportList } from "../components/day/TransportList";
import { PlaceList } from "../components/day/PlaceList";
import { FoodList } from "../components/day/FoodList";
import { StayCard } from "../components/day/StayCard";
import { NotesList } from "../components/day/NotesList";
import { FreeDay } from "../components/day/FreeDay";
import { DAY_TYPE_ICON, DAY_TYPE_LABEL, TAP } from "../lib/style";
import { fmtDate } from "../lib/format";
import { isFreeDay, tripState } from "../lib/tripState";
import { setNavDir } from "../lib/motion";

const navBtn = `flex size-11 items-center justify-center rounded-full bg-surface text-ink shadow-float ${TAP}`;
const Legend = ({ k, icon: I, label }: { k: keyof typeof PIN_BG; icon: typeof MapPin; label: string }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className="flex size-5 items-center justify-center rounded-full" style={{ background: PIN_BG[k], color: k === "food" ? "var(--color-ink)" : "#fff" }}><I aria-hidden className="size-3" strokeWidth={2.5} /></span>{label}
  </span>
);

export function DayPage() {
  const n = Number(useParams().n);
  const day = dayByNumber(n);
  if (!day) return <Navigate to="/trip" replace />;
  const acc = accById(day.accommodation_id);
  const flights = day.flight_ids.map(flightById).filter((f) => !!f);
  const prev = dayByNumber(n - 1), next = dayByNumber(n + 1);
  const isToday = tripState().current?.day_number === n;
  const TypeIcon = DAY_TYPE_ICON[day.day_type];

  const pts: DayPoint[] = [];
  for (const p of day.sightseeing) { const c = coord(p.location); if (c) pts.push({ id: p.id, name: p.name, at: c, kind: "place" }); }
  for (const f of day.food) { const c = coord(f.location); if (c) pts.push({ id: f.id, name: f.name, at: c, kind: "food" }); }
  const hc = coord(acc?.location);
  if (acc && hc) pts.push({ id: acc.id, name: acc.name, at: hc, kind: "hotel" });

  return (
    <>
      <TopBar>
        <Link to="/trip" viewTransition className={navBtn} aria-label="Back to Trip"><ArrowLeft aria-hidden className="size-5" /></Link>
        <span className="text-sm font-semibold text-muted">Day {day.day_number} of {trip.trip.day_count}</span>
        <div className="flex gap-2">
          {prev ? <Link to={`/trip/day/${prev.day_number}`} viewTransition onClick={() => setNavDir("prev")} className={navBtn} aria-label={`Previous day, Day ${prev.day_number}`}><ChevronLeft aria-hidden className="size-5" /></Link>
            : <span className="size-11" />}
          {next ? <Link to={`/trip/day/${next.day_number}`} viewTransition onClick={() => setNavDir("next")} className={navBtn} aria-label={`Next day, Day ${next.day_number}`}><ChevronRight aria-hidden className="size-5" /></Link>
            : <span className="size-11" />}
        </div>
      </TopBar>

      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-1 pb-8">
        <div>
          <Hero ids={placeIds(day)} alt={`${day.travel_city} → ${day.sleep_city}`} />
          <Sheet>
            <div className="flex flex-wrap gap-1.5">
              {isToday && <Pill icon={Star} tone="solid-accent">Today</Pill>}
              <Pill icon={TypeIcon} tone="primary">{DAY_TYPE_LABEL[day.day_type]}</Pill>
            </div>
            <h1 className="text-[26px] leading-tight font-extrabold tracking-tight">
              <span className="vt-title inline-block" style={{ "--vt": `day-title-${day.day_number}` } as CSSProperties}>Day {day.day_number}</span>
              <span className="font-semibold text-muted"> · {day.weekday.slice(0, 3)} {fmtDate(day.date)}</span>
            </h1>
            <p className="flex items-center gap-2 font-semibold"><MapPin aria-hidden className="size-4 shrink-0 text-primary" />{day.travel_city} → {day.sleep_city}</p>
            <div className="rounded-2xl bg-paper p-3"><Weather day={day} full /></div>
          </Sheet>
        </div>

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
          <Section title="Map">
            <div className={`${card} space-y-3 p-2`}>
              <DayMap pts={pts} />
              <p className="flex flex-wrap gap-x-4 gap-y-1 px-2 pb-1 text-xs font-medium text-muted">
                <Legend k="place" icon={MapPin} label="Places" /><Legend k="food" icon={Utensils} label="Food" /><Legend k="hotel" icon={Bed} label="Hotel" />
              </p>
            </div>
          </Section>
        )}

        <NotesList day={day} />
      </main>
    </>
  );
}
