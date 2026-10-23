import { useEffect, useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { Bed, CalendarDays, ChevronRight, Moon, Plane, Star } from "lucide-react";
import { accById, trip } from "../data";
import type { Day } from "../types";
import { Weather } from "../components/Weather";
import { FlightCard } from "../components/FlightCard";
import { TopBar, TopTitle } from "../components/TopBar";
import { DayThumb } from "../components/Thumb";
import { Pill } from "../components/ui";
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
      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-1 pb-8">
        <header className="space-y-2 px-1">
          <h2 className="text-xl leading-tight font-extrabold tracking-tight">{t.title}</h2>
          <div className="flex flex-wrap gap-1.5">
            <Pill icon={CalendarDays} tone="primary">
              {fmtDate(t.start_date, { day: "numeric", month: "short" })} – {fmtDate(t.end_date, { day: "numeric", month: "short", year: "numeric" })}
            </Pill>
            <Pill icon={Moon} tone="secondary">{t.day_count} days / {t.night_count} nights</Pill>
          </div>
        </header>

        <section aria-label="Flights" className="space-y-3">
          <h2 className="px-1 text-lg font-bold tracking-tight">Flights</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {trip.flights.map((f) => <FlightCard key={f.id} f={f} />)}
          </div>
        </section>

        <section aria-label="Days" className="space-y-3">
          <h2 className="px-1 text-lg font-bold tracking-tight">Days</h2>
          <ul className="space-y-3">
            {trip.days.map((d) => {
              const acc = accById(d.accommodation_id);
              const isToday = d.day_number === today;
              return (
                <li key={d.id}>
                  <Link
                    to={`/trip/day/${d.day_number}`}
                    viewTransition
                    ref={isToday ? todayRef : undefined}
                    className={`flex min-h-[44px] items-center gap-3 rounded-3xl bg-surface p-3 shadow-card ${TAP} ${isToday ? "ring-2 ring-accent" : ""}`}
                  >
                    <DayThumb day={d} className="size-[76px] shrink-0 self-start rounded-2xl" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <span className="vt-title inline-block text-base font-extrabold" style={{ "--vt": `day-title-${d.day_number}` } as CSSProperties}>Day {d.day_number}</span>
                            {isToday && <Pill icon={Star} tone="solid-accent">Today</Pill>}
                          </div>
                          <div className="text-xs font-medium text-muted">{d.weekday.slice(0, 3)} · {fmtDate(d.date)}</div>
                        </div>
                        <Weather day={d} />
                      </div>
                      <div className="mt-1 truncate text-sm font-semibold">{d.travel_city} → {d.sleep_city}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted">
                        {acc ? <Bed aria-hidden className="size-3.5 shrink-0 text-secondary" /> : <Plane aria-hidden className="size-3.5 shrink-0 text-primary" />}
                        <span className="truncate">{acc ? acc.name : "Flight home"}</span>
                      </div>
                      {counts(d) && <div className="mt-0.5 text-xs text-muted">{counts(d)}</div>}
                    </div>
                    <ChevronRight aria-hidden className="size-5 shrink-0 text-muted/60" />
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
