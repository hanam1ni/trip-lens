import { Square } from "lucide-react";
import type { Day } from "../../types";
import { card, Section } from "./Section";

const List = ({ items, todo }: { items: string[]; todo?: boolean }) => (
  <ul className={`${card} space-y-2`}>
    {items.map((x, i) => (
      <li key={i} className="flex items-start gap-2.5">
        {todo ? <Square aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" />
          : <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />}
        <span className="min-w-0">{x}</span>
      </li>
    ))}
  </ul>
);

/** todos=false when HeadsUp already lists them (Today tab). */
export function NotesList({ day, todos = true }: { day: Day; todos?: boolean }) {
  const showTodos = todos && day.todos.length > 0;
  if (!day.notes.length && !showTodos) return null;
  return (
    <>
      {day.notes.length > 0 && <Section title="Notes"><List items={day.notes} /></Section>}
      {showTodos && <Section title="To do"><List items={day.todos} todo /></Section>}
    </>
  );
}
