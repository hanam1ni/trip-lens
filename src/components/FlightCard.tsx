import type { Flight } from "../types";
import { fmtLocalDT } from "../lib/format";

export function FlightCard({ f }: { f: Flight }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3 text-sm">
      <div className="mb-1 flex items-center justify-between">
        <span className="font-semibold">✈️ {f.direction === "outbound" ? "Outbound" : "Return"} · {f.flight_number}</span>
        <span className="text-xs text-slate-500">{f.routing}</span>
      </div>
      <div className="font-medium">
        {f.origin.iata} {f.origin.city} → {f.destination.iata} {f.destination.city}
      </div>
      <div className="text-slate-600">Departs {fmtLocalDT(f.departure.local_datetime, f.departure.timezone)}</div>
      <div className="text-slate-600">Arrives {fmtLocalDT(f.arrival.local_datetime, f.arrival.timezone)}</div>
    </div>
  );
}
