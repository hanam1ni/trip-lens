import { useState } from "react";
import images from "../data/images.json";
import type { Day } from "../types";
import { CATEGORY_ICON, CATEGORY_TONE, DAY_TYPE_ICON, DAY_TYPE_TONE, TONE } from "../lib/style";

const manifest = images as Record<string, string>;

export const photoFor = (id: string): string | undefined => manifest[id];
export const imgSrc = (file: string) => `${import.meta.env.BASE_URL}images/${file}`;
/** Day's places in visit order; first one with a manifest photo wins (picks up new photos automatically). */
export const placeIds = (d: Day) => [...d.sightseeing].sort((a, b) => a.order - b.order).map((p) => p.id);
export const firstPhotoId = (ids: string[]) => ids.find((id) => manifest[id]);

// Renders a local thumbnail for an item id, or nothing if there is none (or it fails to load).
export function Thumb({ id, alt }: { id: string; alt: string }) {
  const [bad, setBad] = useState(false);
  const m = manifest[id];
  if (!m || bad) return null;
  return (
    <figure className="mb-3">
      <img src={imgSrc(m)} alt={alt} loading="lazy" decoding="async" onError={() => setBad(true)}
        className="aspect-[16/9] w-full rounded-2xl bg-paper object-cover" />
    </figure>
  );
}

/** Square day thumbnail: first place photo, else a tinted tile with the first place's category (or day type) icon. */
export function DayThumb({ day, className = "" }: { day: Day; className?: string }) {
  const [bad, setBad] = useState(false);
  const id = firstPhotoId(placeIds(day));
  const m = id ? manifest[id] : undefined;
  if (m && !bad)
    return <img src={imgSrc(m)} alt="" loading="lazy" decoding="async" onError={() => setBad(true)} className={`bg-paper object-cover ${className}`} />;
  const first = [...day.sightseeing].sort((a, b) => a.order - b.order)[0];
  const I = first ? CATEGORY_ICON[first.category] : DAY_TYPE_ICON[day.day_type];
  const tone = first ? CATEGORY_TONE(first.category) : DAY_TYPE_TONE[day.day_type];
  return (
    <span aria-hidden className={`flex items-center justify-center ${TONE[tone]} ${className}`}>
      <I className="size-7" strokeWidth={1.75} />
    </span>
  );
}
