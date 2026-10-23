import type { Day } from "../../types";
import { headsUpFor } from "../../lib/tripState";

export function HeadsUp({ day }: { day: Day }) {
  const ev = headsUpFor(day);
  if (!ev.length) return null;
  return (
    <section aria-label="Heads-up" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
      <h2 className="mb-1 font-semibold text-amber-900">Heads-up</h2>
      <ul className="space-y-1.5">
        {ev.map((e) => (
          <li key={e.key} className="flex gap-2 break-words"><span aria-hidden>{e.icon}</span><span className="min-w-0">{e.text}</span></li>
        ))}
      </ul>
    </section>
  );
}
