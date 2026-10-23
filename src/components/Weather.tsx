import { Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudRain, CloudSnow, CloudSun, CloudSunRain, Sun, type LucideIcon } from "lucide-react";
import type { Day } from "../types";
import { useWeatherFor } from "../lib/weather";
import { fmtDate } from "../lib/format";
import { wmo } from "../lib/wmo";
import { Pill } from "./ui";

const t = (n: number) => `${Math.round(n)}°`;

/** WMO code -> line icon (same buckets as lib/wmo.ts, which still supplies the label). */
const wIcon = (c: number): LucideIcon =>
  c === 0 ? Sun : c <= 2 ? CloudSun : c === 3 ? Cloud : c === 45 || c === 48 ? CloudFog
    : c >= 51 && c <= 57 ? CloudDrizzle : (c >= 61 && c <= 67) ? CloudRain : (c >= 71 && c <= 77) || c === 85 || c === 86 ? CloudSnow
      : c >= 80 && c <= 82 ? CloudSunRain : c >= 95 ? CloudLightning : Cloud;

/** compact = chip with icon + high/low (cards, popups); full = day page block */
export function Weather({ day, full = false }: { day: Day; full?: boolean }) {
  const v = useWeatherFor()(day);
  if (v.kind === "loading")
    return full ? (
      <div role="status" aria-label="Loading weather" className="flex items-center gap-3">
        <span className="skeleton size-12 rounded-2xl" />
        <span className="flex-1 space-y-1.5"><span className="skeleton block h-4 w-28 rounded" /><span className="skeleton block h-3 w-44 max-w-full rounded" /></span>
      </div>
    ) : <span role="status" aria-label="Loading weather" className="skeleton inline-block h-6 w-16 rounded-full" />;
  if (v.kind === "unavailable") return <span className="text-xs text-muted">Weather unavailable</span>;
  if (v.kind === "none") return full ? <span className="text-sm text-muted">No weather data for past days</span> : null;
  if (v.kind === "wait")
    return <span className="text-xs text-muted">Forecast from {fmtDate(v.from)}</span>;
  const { label } = wmo(v.w.code);
  const I = wIcon(v.w.code);
  const sunny = v.w.code <= 2;
  const stale = v.staleAt ? `updated ${new Date(v.staleAt).toLocaleString("en-GB", { timeZone: "Asia/Tokyo", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} JST` : null;
  if (!full)
    return (
      <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-neutral-soft px-2 py-1 text-xs font-bold whitespace-nowrap text-ink" title={label}>
        <I aria-hidden className={`size-3.5 ${sunny ? "text-accent-ink" : ""}`} strokeWidth={2.25} />
        <span>{t(v.w.max)}<span className="font-medium"> / {t(v.w.min)}</span></span>
      </span>
    );
  return (
    <div className="flex items-center gap-3">
      <span aria-hidden className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${sunny ? "bg-accent-soft text-accent-ink" : "bg-neutral-soft text-ink"}`}>
        <I className="size-6" />
      </span>
      <div className="min-w-0">
        <div className="font-bold">{label}</div>
        <div className="text-sm text-muted">
          High {t(v.w.max)} · Low {t(v.w.min)}
          {v.w.pop != null && <> · Rain {v.w.pop}%</>}
        </div>
        {(v.early || v.recorded || stale) && (
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-muted">
            {v.early && <Pill tone="accent">Early forecast</Pill>}
            {v.recorded && <Pill>Past day</Pill>}
            {stale}
          </div>
        )}
      </div>
    </div>
  );
}
