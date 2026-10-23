export const TZ = "Asia/Tokyo";

/** YYYY-MM-DD of "now" in Asia/Tokyo. */
export const todayTokyo = (): string =>
  new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());

/** Whole days from a to b (YYYY-MM-DD), calendar-based. */
export const diffDays = (a: string, b: string): number =>
  Math.round((Date.parse(b + "T00:00:00Z") - Date.parse(a + "T00:00:00Z")) / 86400000);

export const addDays = (d: string, n: number): string =>
  new Date(Date.parse(d + "T00:00:00Z") + n * 86400000).toISOString().slice(0, 10);

export const fmtDate = (d: string, opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" }): string =>
  new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(new Date(d + "T00:00:00Z"));

export const fmtDuration = (min: number | null): string | null => {
  if (min == null) return null;
  const h = Math.floor(min / 60), m = min % 60;
  return h && m ? `${h}h ${m}m` : h ? `${h}h` : `${m}m`;
};

export const fmtLocalDT = (ldt: string, tz: string): string => {
  const [d, t] = ldt.split("T");
  const label = tz === "Asia/Tokyo" ? "JST" : tz === "Asia/Bangkok" ? "ICT" : tz;
  return `${fmtDate(d, { weekday: "short", day: "numeric", month: "short" })}, ${t} ${label}`;
};

export const titleCase = (s: string): string => s.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
