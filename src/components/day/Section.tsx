import type { ReactNode } from "react";
import { mapsUrl } from "../../data";
import type { Location } from "../../types";

export const card = "rounded-lg border border-slate-200 bg-white p-3 text-sm break-words";

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="space-y-2">
    <h2 className="text-lg font-semibold">{title}</h2>
    {children}
  </section>
);

export function MapsLink({ loc }: { loc: Location | null | undefined }) {
  const url = mapsUrl(loc);
  if (!url) return null;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex min-h-[44px] items-center text-sm font-medium text-blue-600 underline">
      Open in Google Maps
    </a>
  );
}

export const Original = ({ text }: { text?: string }) =>
  text ? <div lang="th" className="mt-0.5 text-xs text-slate-500">{text}</div> : null;
