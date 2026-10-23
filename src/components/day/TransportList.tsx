import type { Day } from "../../types";
import { MODE_ICON } from "../../lib/style";
import { fmtDuration, titleCase } from "../../lib/format";
import { IconTile } from "../ui";
import { card, Row, Section } from "./Section";

export function TransportList({ day, title = "Getting around" }: { day: Day; title?: string }) {
  const legs = [...day.transport].sort((a, b) => a.order - b.order);
  if (!legs.length) return null;
  return (
    <Section title={title}>
      <ul className={`${card} divide-y divide-line py-1`}>
        {legs.map((l) => (
          <li key={l.id} className="py-3">
            <Row tile={<IconTile icon={MODE_ICON[l.mode]} tone="neutral" />}
              title={<>{l.from ?? "?"} <span className="text-muted">→</span> {l.to ?? "?"}</>}
              meta={[titleCase(l.mode), l.time, fmtDuration(l.duration_minutes)].filter(Boolean).join(" · ")}>
              {l.note && <div>{l.note}</div>}
            </Row>
          </li>
        ))}
      </ul>
    </Section>
  );
}
