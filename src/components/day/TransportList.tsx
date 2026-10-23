import type { Day } from "../../types";
import { MODE_ICON } from "../../lib/style";
import { fmtDuration } from "../../lib/format";
import { card, Section } from "./Section";

export function TransportList({ day, title = "Getting around" }: { day: Day; title?: string }) {
  const legs = [...day.transport].sort((a, b) => a.order - b.order);
  if (!legs.length) return null;
  return (
    <Section title={title}>
      <ul className="space-y-2">
        {legs.map((l) => (
          <li key={l.id} className={card}>
            <div className="font-medium">
              <span aria-hidden>{MODE_ICON[l.mode]}</span> {l.from ?? "?"} → {l.to ?? "?"}
            </div>
            <div className="text-slate-600">
              {[l.time, fmtDuration(l.duration_minutes)].filter(Boolean).join(" · ")}
            </div>
            {l.note && <div className="text-slate-600">{l.note}</div>}
          </li>
        ))}
      </ul>
    </Section>
  );
}
