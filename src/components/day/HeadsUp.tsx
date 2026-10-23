import { Bed, BellRing, DoorOpen, Info, KeyRound, Plane, Square, type LucideIcon } from "lucide-react";
import type { Day } from "../../types";
import { headsUpFor } from "../../lib/tripState";

// tripState emits emoji keys; map them to line icons here so the logic module stays untouched.
const ICON: Record<string, LucideIcon> = { "✈️": Plane, "🧳": DoorOpen, "🔑": KeyRound, "🛏": Bed, "☑️": Square };

export function HeadsUp({ day }: { day: Day }) {
  const ev = headsUpFor(day);
  if (!ev.length) return null;
  return (
    <section aria-label="Heads-up" className="rounded-3xl bg-accent-soft p-4 text-sm">
      <h2 className="mb-2 flex items-center gap-2 font-bold text-accent-ink"><BellRing aria-hidden className="size-4" />Heads-up</h2>
      <ul className="space-y-2">
        {ev.map((e) => {
          const I = ICON[e.icon] ?? Info;
          return (
            <li key={e.key} className="flex items-start gap-2.5 break-words">
              <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-surface text-accent-ink"><I className="size-4" /></span>
              <span className="min-w-0 pt-1.5 text-ink">{e.text}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
