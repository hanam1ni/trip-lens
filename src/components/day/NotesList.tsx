import type { Day } from "../../types";
import { card, Section } from "./Section";

const List = ({ items }: { items: string[] }) => (
  <ul className={`${card} space-y-2`}>
    {items.map((x, i) => (
      <li key={i} className="flex items-start gap-2.5">
        <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
        <span className="min-w-0">{x}</span>
      </li>
    ))}
  </ul>
);

export function NotesList({ day }: { day: Day }) {
  if (!day.notes.length) return null;
  return <Section title="Notes"><List items={day.notes} /></Section>;
}
