import { dayByNumber, flightById, trip } from "../data";
import type { Day } from "../types";
import { diffDays, fmtLocalDT, todayTokyo } from "./format";

export type Phase = "pre" | "during" | "post";

export function tripState(today = todayTokyo()) {
  const { start_date, end_date } = trip.trip;
  const phase: Phase = today < start_date ? "pre" : today > end_date ? "post" : "during";
  const current = phase === "during" ? trip.days.find((d) => d.date === today) : undefined;
  const next = phase === "pre" ? trip.days[0] : current ? dayByNumber(current.day_number + 1) : undefined;
  return { phase, today, current, next, daysUntil: Math.max(0, diffDays(today, start_date)) };
}

export const isFreeDay = (d: Day) => !d.sightseeing.length && !d.transport.length && !d.food.length;

export interface HeadsUpEvent { key: string; icon: string; text: string }

export function headsUpFor(day: Day): HeadsUpEvent[] {
  const ev: HeadsUpEvent[] = [];
  for (const f of day.flight_ids.map(flightById)) {
    if (!f) continue;
    ev.push({
      key: f.id, icon: "✈️",
      text: `${f.direction === "outbound" ? "Outbound" : "Return"} ${f.flight_number} · departs ${fmtLocalDT(f.departure.local_datetime, f.departure.timezone)} · arrives ${fmtLocalDT(f.arrival.local_datetime, f.arrival.timezone)}`,
    });
  }
  // check_out is the morning after the last night (equals day after the last entry in day_numbers)
  for (const a of trip.accommodations.filter((a) => a.check_out === day.date))
    ev.push({ key: `out-${a.id}`, icon: "🧳", text: `Check out · ${a.name}` });
  for (const r of trip.rentals.filter((r) => r.return.date === day.date))
    ev.push({ key: r.id, icon: "🔑", text: `Return ${r.type} in ${r.return.location} · ${r.return.time}${r.return.approximate ? " approx." : ""}` });
  for (const a of trip.accommodations.filter((a) => a.day_numbers[0] === day.day_number))
    ev.push({ key: `in-${a.id}`, icon: "🛏", text: `Check in · ${a.name}` });
  day.todos.forEach((t, i) => ev.push({ key: `todo-${i}`, icon: "☑️", text: t }));
  return ev;
}
