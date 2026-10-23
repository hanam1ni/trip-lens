import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { TONE, type Tone } from "../lib/style";

/** Rounded tinted square holding a line icon (list items, headers). */
export const IconTile = ({ icon: I, tone = "primary", size = "md" }: { icon: LucideIcon; tone?: Tone; size?: "sm" | "md" | "lg" }) => (
  <span aria-hidden className={`flex shrink-0 items-center justify-center ${TONE[tone]} ${size === "sm" ? "size-8 rounded-xl" : size === "lg" ? "size-12 rounded-2xl" : "size-10 rounded-2xl"}`}>
    <I className={size === "sm" ? "size-4" : size === "lg" ? "size-6" : "size-5"} strokeWidth={2} />
  </span>
);

/** Soft tinted status pill with an optional icon. */
export const Pill = ({ icon: I, tone = "neutral", children, className = "" }: { icon?: LucideIcon; tone?: Tone | "solid-accent"; children: ReactNode; className?: string }) => (
  <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold whitespace-nowrap ${tone === "solid-accent" ? "bg-accent text-ink" : TONE[tone]} ${className}`}>
    {I && <I aria-hidden className="size-3.5" strokeWidth={2.25} />}{children}
  </span>
);

/** Small muted label over a value, on a soft paper tile. */
export const InfoTile = ({ label, children, sub }: { label: string; children: ReactNode; sub?: ReactNode }) => (
  <div className="min-w-0 rounded-2xl bg-paper px-3 py-2.5">
    <div className="text-[11px] font-medium tracking-wide text-muted uppercase">{label}</div>
    <div className="truncate text-sm font-bold text-ink">{children}</div>
    {sub && <div className="truncate text-xs text-muted">{sub}</div>}
  </div>
);

const LEAF = "M50 4 57 20 65 16 62 38 76 24 80 32 94 28 88 46 96 50 74 64 78 72 56 68 52 82 52 98 48 98 48 82 44 68 22 72 26 64 4 50 12 46 6 28 20 32 24 24 38 38 35 16 43 20Z";
const LEAVES: { x: number; y: number; s: number; r: number; o: string }[] = [
  { x: 70, y: 6, s: 34, r: 18, o: "fill-white/25" },
  { x: 86, y: 34, s: 20, r: -24, o: "fill-accent/70" },
  { x: 58, y: 40, s: 16, r: 40, o: "fill-white/15" },
  { x: 80, y: 62, s: 26, r: -8, o: "fill-accent/45" },
  { x: 44, y: 10, s: 12, r: -30, o: "fill-white/20" },
  { x: 6, y: 58, s: 14, r: 22, o: "fill-white/10" },
];

/** Decorative maple-leaf scatter for heroes without a photo (percent-based so it scales with the box). */
export const MapleArt = () => (
  <svg aria-hidden className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="xMaxYMid slice">
    {LEAVES.map((l, i) => (
      <g key={i} transform={`translate(${l.x} ${l.y}) rotate(${l.r} ${l.s / 2} ${l.s / 2}) scale(${l.s / 100})`}>
        <path d={LEAF} className={`${l.o} ${i % 2 ? "leaf-sway" : ""}`} style={{ animationDelay: `${i * -1.3}s` }} />
      </g>
    ))}
  </svg>
);
