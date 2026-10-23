import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { accById, trip } from "../data";
import type { Day } from "../types";
import { Weather } from "../components/Weather";
import { FlightCard } from "../components/FlightCard";
import { TopBar, TopTitle } from "../components/TopBar";
import { fmtDate } from "../lib/format";
import { isFreeDay, tripState } from "../lib/tripState";
import { TAP } from "../lib/style";

const SCROLLED = "trip-lens:trip-scrolled";
const plural = (n: number, s: string, p = s) => `${n} ${n === 1 ? s : p}`;
const counts = (d: Day) =>
  [d.sightseeing.length && plural(d.sightseeing.length, "place", "places"), d.food.length && plural(d.food.length, "food")]
    .filter(Boolean).join(" · ") || (isFreeDay(d) ? "Free day" : "");

export function Trip() {
  const today = tripState().current?.day_number ?? null;
  const todayRef = useRef<HTMLAnchorElement>(null);
  // Scroll today into view once per session; later visits use the restored scroll position.
  useEffect(() => {
    if (!todayRef.current) return;
    try { if (sessionStorage.getItem(SCROLLED)) return; sessionStorage.setItem(SCROLLED, "1"); } catch { /* ignore */ }
    todayRef.current.scrollIntoView({ block: "center" });
  }, []);
  const t = trip.trip;

  return (
    <>
      <TopBar><TopTitle>Trip</TopTitle></TopBar>
      <main className="mx-auto max-w-3xl space-y-5 px-4 py-4">
        <header>
          <h2 className="text-2xl font-bold">{t.title}</h2>
          <p className="text-slate-600">
            {fmtDate(t.start_date, { day: "numeric", month: "short" })} – {fmtDate(t.end_date, { day: "numeric", month: "short", year: "numeric" })} · {t.day_count} days / {t.night_count} nights
          </p>
        </header>

        <section aria-label="Flights" className="space-y-2">
          <h2 className="text-lg font-semibold">Flights</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            {trip.flights.map((f) => <FlightCard key={f.id} f={f} />)}
          </div>
        </section>

        <section aria-label="Days" className="space-y-2">
          <h2 className="text-lg font-semibold">Days</h2>
          <ul className="space-y-2">
            {trip.days.map((d) => {
              const acc = accById(d.accommodation_id);
              const isToday = d.day_number === today;
              return (
                <li key={d.id}>
                  <Link
                    to={`/trip/day/${d.day_number}`}
                    viewTransition
                    ref={isToday ? todayRef : undefined}
                    className={`block min-h-[44px] rounded-lg border bg-white p-3 ${TAP} ${isToday ? "border-yellow-400 ring-2 ring-yellow-300" : "border-slate-200"}`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold">
                        <span className="vt-title inline-block" style={{ "--vt": `day-title-${d.day_number}` } as CSSProperties}>Day {d.day_number}</span>
                        {" "}· {d.weekday.slice(0, 3)} · {fmtDate(d.date)}
                        {isToday && <span className="ml-2 rounded bg-yellow-200 px-1.5 py-0.5 text-xs">Today</span>}
                      </div>
                      <Weather day={d} />
                    </div>
                    <div className="text-sm">{d.travel_city} → {d.sleep_city}</div>
                    <div className="text-sm text-slate-500">{acc ? `🛏 ${acc.name}` : "✈️ Flight home"}</div>
                    <div className="text-xs text-slate-500">{counts(d)}</div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>
    </>
  );
}
