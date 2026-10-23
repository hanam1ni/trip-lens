import type { Day } from "../../types";
import { Section } from "./Section";

const List = ({ items }: { items: string[] }) => (
  <ul className="list-disc space-y-1 pl-5 text-sm">{items.map((x, i) => <li key={i}>{x}</li>)}</ul>
);

/** todos=false when HeadsUp already lists them (Today tab). */
export function NotesList({ day, todos = true }: { day: Day; todos?: boolean }) {
  const showTodos = todos && day.todos.length > 0;
  if (!day.notes.length && !showTodos) return null;
  return (
    <>
      {day.notes.length > 0 && <Section title="Notes"><List items={day.notes} /></Section>}
      {showTodos && <Section title="To do"><List items={day.todos} /></Section>}
    </>
  );
}
