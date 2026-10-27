import { useState, type ReactNode } from "react";
import { firstPhotoId, imgSrc, photoFor } from "./Thumb";
import { MapleArt } from "./ui";

/** Rounded hero: first available photo among ids, else the maple gradient. Children overlay the art. */
export function Hero({ ids = [], alt = "", tall = false, children }: { ids?: string[]; alt?: string; tall?: boolean; children?: ReactNode }) {
  const [bad, setBad] = useState(false);
  const id = firstPhotoId(ids);
  const m = id && !bad ? photoFor(id) : undefined;
  return (
    <div className={`relative overflow-hidden rounded-[28px] shadow-card ${tall ? "h-64" : "h-52"} ${m ? "bg-paper" : "hero-art"}`}>
      {m ? (
        <img src={imgSrc(m)} alt={alt} decoding="async" onError={() => setBad(true)} className="absolute inset-0 h-full w-full object-cover" />
      ) : <MapleArt />}
      {children}
    </div>
  );
}

/** White rounded sheet that overlaps the bottom of a Hero. */
export const Sheet = ({ children }: { children: ReactNode }) => (
  <div className="relative mx-3 -mt-14 space-y-3 rounded-3xl bg-surface p-5 shadow-float">{children}</div>
);
