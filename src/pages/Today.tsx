import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { trip } from "../data";
import type { Day } from "../types";
import { Weather } from "../components/Weather";
import { FlightCard } from "../components/FlightCard";
import { TopBar, TopTitle } from "../components/TopBar";
import { TransportList } from "../components/day/TransportList";
import { PlaceList } from "../components/day/PlaceList";
import { FoodList } from "../components/day/FoodList";
import { StayCard } from "../components/day/StayCard";
import { NotesList } from "../components/day/NotesList";
import { FreeDay } from "../components/day/FreeDay";
import { HeadsUp } from "../components/day/HeadsUp";
import { fmtDate } from "../lib/format";
import { isFreeDay, tripState } from "../lib/tripState";
import { TAP } from "../lib/style";

/** Fade-up on mount with a per-index stagger; collapses when its child renders nothing. */
const Up = ({ i, children }: { i: number; children: ReactNode }) => (
  <div className="fade-up space-y-5 empty:hidden" style={{ "--i": i } as CSSProperties}>{children}</div>
);

const linkBtn = `flex min-h-[44px] items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-blue-700 ${TAP}`;
const longDate = (d: string) => fmtDate(d, { weekday: "long", day: "numeric", month: "long" });

function DaySections({ day, from, todos = true }: { day: Day; from: number; todos?: boolean }) {
  let i = from;
  return (
    <>
      {isFreeDay(day) ? <Up i={i++}><FreeDay /></Up> : (
        <>
          <Up i={i++}><TransportList day={day} /></Up>
          <Up i={i++}><PlaceList day={day} title="Go" /></Up>
          <Up i={i++}><FoodList day={day} title="Eat" /></Up>
        </>
      )}
      <Up i={i++}><StayCard day={day} title="Stay" /></Up>
      <Up i={i++}><NotesList day={day} todos={todos} /></Up>
    </>
  );
}

export function Today() {
  const st = tripState();
  const outbound = trip.flights.find((f) => f.direction === "outbound");
  const day = st.phase === "during" ? st.current : st.next;

  return (
    <>
      <TopBar><TopTitle>Today</TopTitle><span className="text-sm text-slate-500">{longDate(st.today)}</span></TopBar>
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-4">
        {st.phase === "pre" && day && (
          <>
            <Up i={0}>
              <section className="rounded-xl bg-slate-900 p-5 text-white">
                <p className="text-sm text-slate-300">{trip.trip.title}</p>
                <p className="mt-1 text-2xl font-bold">
                  {st.daysUntil === 0 ? "Starts today" : <>Starts in <span className="tick-in inline-block tabular-nums">{st.daysUntil}</span> {st.daysUntil === 1 ? "day" : "days"}</>}
                </p>
                <p className="text-sm text-slate-300">{fmtDate(trip.trip.start_date, { weekday: "short", day: "numeric", month: "short" })} – {fmtDate(trip.trip.end_date, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</p>
              </section>
            </Up>
            {outbound && <Up i={1}><FlightCard f={outbound} /></Up>}
            <Up i={2}>
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-semibold">Day 1 preview</h2>
                <span className="text-sm text-slate-500">{day.travel_city} → {day.sleep_city}</span>
              </div>
            </Up>
            <DaySections day={day} from={3} />
            <Up i={9}><Link to={`/trip/day/${day.day_number}`} viewTransition className={linkBtn}>Open Day {day.day_number} details →</Link></Up>
          </>
        )}

        {st.phase === "during" && day && (
          <>
            <Up i={0}>
              <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-500">Day {day.day_number} of {trip.trip.day_count}</p>
                <p className="text-xl font-bold">{longDate(day.date)}</p>
                <p className="font-medium">{day.travel_city} → {day.sleep_city}</p>
                <Weather day={day} full />
              </section>
            </Up>
            <Up i={1}><HeadsUp day={day} /></Up>
            <DaySections day={day} from={2} todos={false} />
            <Up i={8}><Link to={`/map?focus=${day.day_number}`} viewTransition className={linkBtn}>🗺️ View today on map</Link></Up>
            {st.next && (
              <Up i={9}>
                <Link to={`/trip/day/${st.next.day_number}`} viewTransition className={`block min-h-[44px] rounded-lg border border-slate-200 bg-white p-3 ${TAP}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-semibold">Tomorrow · Day {st.next.day_number}</div>
                    <Weather day={st.next} />
                  </div>
                  <div className="text-sm">{st.next.travel_city} → {st.next.sleep_city}</div>
                </Link>
              </Up>
            )}
          </>
        )}

        {st.phase === "post" && (
          <Up i={0}>
            <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-5 text-center">
              <p className="text-2xl font-bold">Trip complete 🎉</p>
              <p className="text-slate-600">{trip.trip.title}</p>
              <Link to="/trip" viewTransition className={linkBtn}>Look back at the trip →</Link>
            </section>
          </Up>
        )}
      </main>
    </>
  );
}
