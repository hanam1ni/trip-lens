import type { Day } from "../../types";
import { MEAL_ORDER } from "../../lib/style";
import { titleCase } from "../../lib/format";
import { Thumb } from "../Thumb";
import { card, MapsLink, Original, Section } from "./Section";

export function FoodList({ day, title = "Where we eat" }: { day: Day; title?: string }) {
  const groups = MEAL_ORDER.map((m) => ({ meal: m, items: day.food.filter((f) => f.meal === m).sort((a, b) => a.order - b.order) })).filter((g) => g.items.length);
  if (!groups.length) return null;
  return (
    <Section title={title}>
      <div className="space-y-3">
        {groups.map((g) => (
          <div key={g.meal}>
            <h3 className="mb-1 text-sm font-semibold uppercase tracking-wide text-slate-500">{g.meal === "unspecified" ? "Ideas" : titleCase(g.meal)}</h3>
            <ul className="space-y-2">
              {g.items.map((f) => (
                <li key={f.id} className={card}>
                  <Thumb id={f.id} alt={f.name} />
                  <div className="font-medium">🍴 {f.name}{f.cuisine && <span className="ml-2 text-xs font-normal text-slate-500">{f.cuisine}</span>}</div>
                  {f.note && <div className="text-slate-600">{f.note}</div>}
                  <Original text={f.note_original} />
                  <MapsLink loc={f.location} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
