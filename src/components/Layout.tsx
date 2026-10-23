import { NavLink, Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { CalendarDays, Luggage, Map as MapIcon } from "lucide-react";
import { setNavDir } from "../lib/motion";

const TABS = [
  { to: "/today", icon: CalendarDays, label: "Today" },
  { to: "/trip", icon: Luggage, label: "Trip" },
  { to: "/map", icon: MapIcon, label: "Map" },
];

// Only the Trip list restores by path (so the back link to /trip lands where you left); others by history entry.
const scrollKey = (l: { pathname: string; key: string }) => (l.pathname === "/trip" ? l.pathname : l.key);

export function Layout() {
  const { pathname } = useLocation();
  const idx = pathname.startsWith("/trip") ? 1 : pathname.startsWith("/map") ? 2 : 0;
  return (
    <div onClickCapture={() => setNavDir()} className="pb-[var(--tabbar-h)]">
      <Outlet />
      <nav aria-label="Tabs" className="tabbar fixed inset-x-0 bottom-0 z-[1100] rounded-t-3xl bg-surface pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_24px_-8px_rgb(74_52_34/0.18)]">
        <div className="relative mx-auto grid max-w-3xl grid-cols-3">
          <span aria-hidden className="tab-pill pointer-events-none absolute top-2 left-0 flex w-1/3 justify-center" style={{ transform: `translateX(${idx * 100}%)` }}>
            <span className="block h-8 w-16 rounded-full bg-primary-soft" />
          </span>
          {TABS.map((t, i) => (
            <NavLink key={t.to} to={t.to} viewTransition
              className={`relative flex min-h-16 flex-col items-center justify-start gap-1 pt-3 text-xs ${i === idx ? "font-bold text-primary" : "font-medium text-muted"}`}>
              <t.icon aria-hidden className={`tab-icon size-6 ${i === idx ? "tab-icon-active" : ""}`} strokeWidth={i === idx ? 2.25 : 1.75} />
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <ScrollRestoration getKey={scrollKey} />
    </div>
  );
}
