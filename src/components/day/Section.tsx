import type { ReactNode } from "react";
import { MapPin } from "lucide-react";
import { mapsUrl } from "../../data";
import type { Location } from "../../types";
import { CARD } from "../../lib/style";

export const card = `${CARD} text-sm break-words`;

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-3">
    <h2 className="px-1 text-lg font-bold tracking-tight">{title}</h2>
    {children}
  </section>
);

/** Small tinted pill; the outer link keeps a 44px tap target. */
export function MapsLink({ loc }: { loc: Location | null | undefined }) {
  const url = mapsUrl(loc);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="group -mb-2 inline-flex min-h-11 items-center">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-primary motion-safe:transition-transform group-active:scale-95">
        <MapPin aria-hidden className="size-3.5" strokeWidth={2.25} />Open in Google Maps
      </span>
    </a>
  );
}

export const Original = ({ text }: { text?: string }) =>
  text ? <div lang="th" className="mt-0.5 text-xs text-muted">{text}</div> : null;

/** Icon tile + title/meta row used by every list card. */
export const Row = ({ tile, title, meta, children }: { tile: ReactNode; title: ReactNode; meta?: ReactNode; children?: ReactNode }) => (
  <div className="flex gap-3">
    {tile}
    <div className="min-w-0 flex-1 pt-0.5">
      <div className="text-[15px] leading-snug font-semibold">{title}</div>
      {meta && <div className="mt-0.5 text-xs text-muted">{meta}</div>}
      {children && <div className="mt-1.5 space-y-1 text-ink/80">{children}</div>}
    </div>
  </div>
);
