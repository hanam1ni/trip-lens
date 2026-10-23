import type { Day } from "../../types";
import { CATEGORY_ICON } from "../../lib/style";
import { titleCase } from "../../lib/format";
import { Thumb } from "../Thumb";
import { card, MapsLink, Original, Section } from "./Section";

export function PlaceList({ day, title = "Places" }: { day: Day; title?: string }) {
  const sight = [...day.sightseeing].sort((a, b) => a.order - b.order);
  if (!sight.length) return null;
  return (
    <Section title={title}>
      <ul className="space-y-2">
        {sight.map((p) => (
          <li key={p.id} className={card}>
            <Thumb id={p.id} alt={p.name} />
            <div className="font-medium"><span aria-hidden>{CATEGORY_ICON[p.category]}</span> {p.name}
              <span className="ml-2 text-xs font-normal text-slate-500">{titleCase(p.category)}</span></div>
            {p.note && <div className="text-slate-600">{p.note}</div>}
            <Original text={p.note_original} />
            <MapsLink loc={p.location} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
