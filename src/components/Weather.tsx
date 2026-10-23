import type { Day } from "../types";
import { useWeatherFor } from "../lib/weather";
import { fmtDate } from "../lib/format";
import { wmo } from "../lib/wmo";

const t = (n: number) => `${Math.round(n)}°`;

/** compact = icon + high/low (cards, popups); full = day page block */
export function Weather({ day, full = false }: { day: Day; full?: boolean }) {
  const v = useWeatherFor()(day);
  if (v.kind === "loading")
    return full ? (
      <div role="status" aria-label="Loading weather" className="flex items-center gap-3">
        <span className="skeleton h-10 w-10 rounded-full" />
        <span className="flex-1 space-y-1.5"><span className="skeleton block h-4 w-28 rounded" /><span className="skeleton block h-3 w-44 max-w-full rounded" /></span>
      </div>
    ) : <span role="status" aria-label="Loading weather" className="skeleton inline-block h-5 w-16 rounded" />;
  if (v.kind === "unavailable") return <span className="text-xs text-slate-400">Weather unavailable</span>;
  if (v.kind === "none") return full ? <span className="text-sm text-slate-400">No weather data for past days</span> : null;
  if (v.kind === "wait")
    return <span className="text-xs text-slate-500">Forecast available from {fmtDate(v.from)}</span>;
  const { icon, label } = wmo(v.w.code);
  const stale = v.staleAt ? `updated ${new Date(v.staleAt).toLocaleString("en-GB", { timeZone: "Asia/Tokyo", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} JST` : null;
  if (!full)
    return (
      <span className="inline-flex items-center gap-1 text-sm whitespace-nowrap" title={label}>
        <span aria-hidden>{icon}</span>
        <span>{t(v.w.max)}<span className="text-slate-400"> / {t(v.w.min)}</span></span>
      </span>
    );
  return (
    <div className="flex items-center gap-3">
      <span className="text-4xl" aria-hidden>{icon}</span>
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-slate-600">
          High {t(v.w.max)} · Low {t(v.w.min)}
          {v.w.pop != null && <> · Rain {v.w.pop}%</>}
        </div>
        <div className="text-xs text-slate-500">
          {v.early && <span className="mr-2 rounded bg-amber-100 px-1.5 py-0.5 text-amber-800">Early forecast</span>}
          {v.recorded && <span className="mr-2">Past day</span>}
          {stale}
        </div>
      </div>
    </div>
  );
}
