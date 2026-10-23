import { Utensils } from "lucide-react";
import type { Day } from "../../types";
import { MEAL_ICON, MEAL_ORDER } from "../../lib/style";
import { titleCase } from "../../lib/format";
import { Thumb } from "../Thumb";
import { IconTile } from "../ui";
import { card, MapsLink, Original, Row, Section } from "./Section";

export function FoodList({ day, title = "Where we eat" }: { day: Day; title?: string }) {
  const groups = MEAL_ORDER.map((m) => ({ meal: m, items: day.food.filter((f) => f.meal === m).sort((a, b) => a.order - b.order) })).filter((g) => g.items.length);
  if (!groups.length) return null;
  return (
    <Section title={title}>
      <div className="space-y-4">
        {groups.map((g) => {
          const I = MEAL_ICON[g.meal];
          return (
            <div key={g.meal}>
              <h3 className="mb-2 flex items-center gap-1.5 px-1 text-xs font-bold tracking-wider text-muted uppercase">
                <I aria-hidden className="size-4 text-accent-ink" />{g.meal === "unspecified" ? "Ideas" : titleCase(g.meal)}
              </h3>
              <ul className="space-y-3">
                {g.items.map((f) => (
                  <li key={f.id} className={card}>
                    <Thumb id={f.id} alt={f.name} />
                    <Row tile={<IconTile icon={Utensils} tone="accent" />} title={f.name} meta={f.cuisine}>
                      {f.note && <div>{f.note}</div>}
                      <Original text={f.note_original} />
                      <MapsLink loc={f.location} />
                    </Row>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
