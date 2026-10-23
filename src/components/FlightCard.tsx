import { Plane } from "lucide-react";
import type { Airport, Flight, LocalDateTime } from "../types";
import { fmtDate, tzLabel } from "../lib/format";
import { CARD } from "../lib/style";
import { IconTile, Pill } from "./ui";

const End = ({ label, a, at }: { label: string; a: Airport; at: LocalDateTime }) => {
  const [d, t] = at.local_datetime.split("T");
  return (
    <div className="min-w-0 rounded-2xl bg-paper px-3 py-2.5">
      <div className="text-[11px] font-medium tracking-wide text-muted uppercase">{label}</div>
      <div className="text-xl leading-tight font-extrabold">{a.iata}</div>
      <div className="truncate text-xs text-muted">{a.city}</div>
      <div className="mt-1 text-sm font-semibold">{t} <span className="text-xs font-medium text-muted">{tzLabel(at.timezone)}</span></div>
      <div className="text-xs text-muted">{fmtDate(d, { weekday: "short", day: "numeric", month: "short" })}</div>
    </div>
  );
};

export function FlightCard({ f }: { f: Flight }) {
  return (
    <div className={`${CARD} text-sm`}>
      <div className="mb-3 flex items-center gap-3">
        <IconTile icon={Plane} tone="primary" />
        <div className="min-w-0 flex-1">
          <div className="font-bold">{f.direction === "outbound" ? "Outbound" : "Return"} · {f.flight_number}</div>
          <div className="truncate text-xs text-muted">{f.origin.city} → {f.destination.city}</div>
        </div>
        <Pill tone={f.routing === "direct" ? "secondary" : "accent"} className="capitalize">{f.routing}</Pill>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <End label="Depart" a={f.origin} at={f.departure} />
        <End label="Arrive" a={f.destination} at={f.arrival} />
      </div>
    </div>
  );
}
