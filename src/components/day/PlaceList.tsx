import type { Day } from "../../types";
import { CATEGORY_ICON, CATEGORY_TONE } from "../../lib/style";
import { titleCase } from "../../lib/format";
import { Thumb } from "../Thumb";
import { IconTile } from "../ui";
import { card, MapsLink, Original, Row, Section } from "./Section";

export function PlaceList({ day, title = "Places" }: { day: Day; title?: string }) {
  const sight = [...day.sightseeing].sort((a, b) => a.order - b.order);
  if (!sight.length) return null;
  return (
    <Section title={title}>
      <ul className="space-y-3">
        {sight.map((p) => (
          <li key={p.id} className={card}>
            <Thumb id={p.id} alt={p.name} />
            <Row tile={<IconTile icon={CATEGORY_ICON[p.category]} tone={CATEGORY_TONE(p.category)} />} title={p.name} meta={titleCase(p.category)}>
              {p.note && <div>{p.note}</div>}
              <Original text={p.note_original} />
              <MapsLink loc={p.location} />
            </Row>
          </li>
        ))}
      </ul>
    </Section>
  );
}
