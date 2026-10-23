import type { CSSProperties, ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, CalendarDays, ChevronRight, Map as MapIcon, PartyPopper, Route, Sparkles } from "lucide-react";
import { trip } from "../data";
import type { Day } from "../types";
import { Weather } from "../components/Weather";
import { FlightCard } from "../components/FlightCard";
import { TopBar, TopTitle } from "../components/TopBar";
import { Hero, Sheet } from "../components/Hero";
import { DayThumb, placeIds } from "../components/Thumb";
import { InfoTile, Pill } from "../components/ui";
import { TransportList } from "../components/day/TransportList";
import { PlaceList } from "../components/day/PlaceList";
import { FoodList } from "../components/day/FoodList";
import { StayCard } from "../components/day/StayCard";
import { NotesList } from "../components/day/NotesList";
import { FreeDay } from "../components/day/FreeDay";
import { HeadsUp } from "../components/day/HeadsUp";
import { fmtDate } from "../lib/format";
import { isFreeDay, tripState } from "../lib/tripState";
import { BTN_PRIMARY, BTN_SOFT, CARD, TAP } from "../lib/style";

/** Fade-up on mount with a per-index stagger; collapses when its child renders nothing. */
const Up = ({ i, children }: { i: number; children: ReactNode }) => (
  <div className="fade-up space-y-6 empty:hidden" style={{ "--i": i } as CSSProperties}>{children}</div>
);

const longDate = (d: string) => fmtDate(d, { weekday: "long", day: "numeric", month: "long" });
const shortDate = (d: string) => fmtDate(d, { weekday: "short", day: "numeric", month: "short" });
const RouteLine = ({ d }: { d: Day }) => (
  <p className="flex items-center gap-2 font-semibold"><Route aria-hidden className="size-4 shrink-0 text-primary" />{d.travel_city} → {d.sleep_city}</p>
);

function DaySections({ day, from, stay = true }: { day: Day; from: number; stay?: boolean }) {
  let i = from;
  return (
    <>
      {stay && <Up i={i++}><StayCard day={day} title="Stay" /></Up>}
      {isFreeDay(day) ? <Up i={i++}><FreeDay /></Up> : (
        <>
          <Up i={i++}><TransportList day={day} /></Up>
          <Up i={i++}><PlaceList day={day} title="Go" /></Up>
          <Up i={i++}><FoodList day={day} title="Eat" /></Up>
        </>
      )}
      <Up i={i++}><NotesList day={day} /></Up>
    </>
  );
}

export function Today() {
  const st = tripState();
  const outbound = trip.flights.find((f) => f.direction === "outbound");
  const day = st.phase === "during" ? st.current : st.next;
  const t = trip.trip;

  return (
    <>
      <TopBar><TopTitle>Today</TopTitle><span className="text-sm font-medium text-muted">{longDate(st.today)}</span></TopBar>
      <main className="mx-auto max-w-3xl space-y-6 px-4 pt-1 pb-8">
        {st.phase === "pre" && day && (
          <>
            <Up i={0}>
              <div>
                <Hero tall>
                  <div className="relative p-5 text-white">
                    <Pill icon={Sparkles} tone="solid-accent">Countdown</Pill>
                    <p className="mt-3 max-w-[16rem] text-sm font-semibold text-white/90">{t.title}</p>
                    {st.daysUntil === 0 ? <p className="mt-1 text-4xl font-extrabold">Starts today</p> : (
                      <p className="mt-1 flex items-baseline gap-2">
                        <span className="tick-in inline-block text-6xl leading-none font-extrabold tabular-nums">{st.daysUntil}</span>
                        <span className="text-lg font-bold">{st.daysUntil === 1 ? "day to go" : "days to go"}</span>
                      </p>
                    )}
                  </div>
                </Hero>
                <Sheet>
                  <div className="grid grid-cols-3 gap-2">
                    <InfoTile label="Start">{fmtDate(t.start_date)}</InfoTile>
                    <InfoTile label="End">{fmtDate(t.end_date)}</InfoTile>
                    <InfoTile label="Length">{t.day_count} days</InfoTile>
                  </div>
                  <p className="flex items-center gap-2 text-sm text-muted"><CalendarDays aria-hidden className="size-4 shrink-0" />{t.region} · {t.night_count} nights</p>
                </Sheet>
              </div>
            </Up>
            {outbound && <Up i={1}><FlightCard f={outbound} /></Up>}
            <Up i={2}>
              <div className="flex items-baseline justify-between gap-2 px-1">
                <h2 className="text-lg font-bold tracking-tight">Day 1 preview</h2>
                <span className="truncate text-sm text-muted">{day.travel_city} → {day.sleep_city}</span>
              </div>
            </Up>
            <DaySections day={day} from={3} />
            <Up i={9}><Link to={`/trip/day/${day.day_number}`} viewTransition className={BTN_PRIMARY}>Open Day {day.day_number} details<ArrowRight aria-hidden className="size-4" /></Link></Up>
          </>
        )}

        {st.phase === "during" && day && (
          <>
            <Up i={0}>
              <div>
                <Hero ids={placeIds(day)} alt={`${day.travel_city} → ${day.sleep_city}`} />
                <Sheet>
                  <Pill icon={CalendarDays} tone="accent">Today · Day {day.day_number} of {t.day_count}</Pill>
                  <p className="text-2xl leading-tight font-extrabold tracking-tight">{longDate(day.date)}</p>
                  <RouteLine d={day} />
                  <div className="rounded-2xl bg-paper p-3"><Weather day={day} full /></div>
                </Sheet>
              </div>
            </Up>
            <Up i={1}><StayCard day={day} title="Stay" /></Up>
            <Up i={2}><HeadsUp day={day} /></Up>
            <DaySections day={day} from={3} stay={false} />
            <Up i={8}><Link to={`/map?focus=${day.day_number}`} viewTransition className={BTN_SOFT}><MapIcon aria-hidden className="size-4" />View today on map</Link></Up>
            {st.next && (
              <Up i={9}>
                <Link to={`/trip/day/${st.next.day_number}`} viewTransition className={`${CARD} flex min-h-[44px] items-center gap-3 p-3 ${TAP}`}>
                  <DayThumb day={st.next} className="size-16 shrink-0 rounded-2xl" />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-muted uppercase">Tomorrow · {shortDate(st.next.date)}</div>
                    <div className="font-bold">Day {st.next.day_number}</div>
                    <div className="truncate text-sm">{st.next.travel_city} → {st.next.sleep_city}</div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <Weather day={st.next} />
                    <ChevronRight aria-hidden className="size-5 text-muted" />
                  </div>
                </Link>
              </Up>
            )}
          </>
        )}

        {st.phase === "post" && (
          <Up i={0}>
            <div>
              <Hero>
                <div className="relative flex items-center gap-2 p-5 text-white"><PartyPopper aria-hidden className="size-6" /><span className="text-lg font-bold">Welcome home</span></div>
              </Hero>
              <Sheet>
                <p className="text-2xl font-extrabold">Trip complete</p>
                <p className="text-muted">{t.title}</p>
                <Link to="/trip" viewTransition className={BTN_PRIMARY}>Look back at the trip<ArrowRight aria-hidden className="size-4" /></Link>
              </Sheet>
            </div>
          </Up>
        )}
      </main>
    </>
  );
}
