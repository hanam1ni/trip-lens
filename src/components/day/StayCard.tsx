import { accById, flightById } from "../../data";
import type { Day } from "../../types";
import { fmtDate, titleCase } from "../../lib/format";
import { Thumb } from "../Thumb";
import { FlightCard } from "../FlightCard";
import { card, MapsLink, Section } from "./Section";

/** Accommodation for the night, or the return flight on a day without one. */
export function StayCard({ day, title = "Where we stay" }: { day: Day; title?: string }) {
  const acc = accById(day.accommodation_id);
  if (!acc) {
    const ret = day.flight_ids.map(flightById).filter((f) => f?.direction === "return");
    if (!ret.length) return null;
    return <Section title={title}>{ret.map((f) => <FlightCard key={f!.id} f={f!} />)}</Section>;
  }
  const nightX = acc.day_numbers.indexOf(day.day_number) + 1;
  return (
    <Section title={title}>
      <div className={card}>
        <Thumb id={acc.id} alt={acc.name} />
        <div className="font-medium">🛏 {acc.name}</div>
        <div className="text-slate-600">{acc.city} · {titleCase(acc.type)}{acc.meal_plan && ` · ${titleCase(acc.meal_plan)}`}</div>
        <div className="text-slate-600">
          Check-in {fmtDate(acc.check_in)} · Check-out {fmtDate(acc.check_out)} · Night {nightX} of {acc.nights}
        </div>
        {acc.notes && <div className="mt-1 text-xs text-slate-500">{acc.notes}</div>}
        <MapsLink loc={acc.location} />
      </div>
    </Section>
  );
}
