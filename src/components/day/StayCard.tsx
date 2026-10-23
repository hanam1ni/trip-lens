import { Bed, Moon, UtensilsCrossed } from "lucide-react";
import { accById, flightById } from "../../data";
import type { Day } from "../../types";
import { fmtDate, titleCase } from "../../lib/format";
import { Thumb } from "../Thumb";
import { FlightCard } from "../FlightCard";
import { IconTile, InfoTile, Pill } from "../ui";
import { card, MapsLink, Row, Section } from "./Section";

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
        <Row tile={<IconTile icon={Bed} tone="secondary" />} title={acc.name} meta={`${acc.city} · ${titleCase(acc.type)}`} />
        <div className="mt-3 flex flex-wrap gap-1.5">
          <Pill icon={Moon} tone="secondary">Night {nightX} of {acc.nights}</Pill>
          {acc.meal_plan && <Pill icon={UtensilsCrossed} tone="accent">{titleCase(acc.meal_plan)}</Pill>}
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <InfoTile label="Check-in">{fmtDate(acc.check_in, { weekday: "short", day: "numeric", month: "short" })}</InfoTile>
          <InfoTile label="Check-out">{fmtDate(acc.check_out, { weekday: "short", day: "numeric", month: "short" })}</InfoTile>
        </div>
        {acc.notes && <div className="mt-3 text-xs text-muted">{acc.notes}</div>}
        <MapsLink loc={acc.location} />
      </div>
    </Section>
  );
}
