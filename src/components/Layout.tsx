import { NavLink, Outlet, ScrollRestoration, useLocation } from "react-router-dom";
import { setNavDir } from "../lib/motion";

const TABS = [
  { to: "/today", icon: "📅", label: "Today" },
  { to: "/trip", icon: "🧳", label: "Trip" },
  { to: "/map", icon: "🗺️", label: "Map" },
];

// Only the Trip list restores by path (so the back link to /trip lands where you left); others by history entry.
const scrollKey = (l: { pathname: string; key: string }) => (l.pathname === "/trip" ? l.pathname : l.key);

export function Layout() {
  const { pathname } = useLocation();
  const idx = pathname.startsWith("/trip") ? 1 : pathname.startsWith("/map") ? 2 : 0;
  return (
    <div onClickCapture={() => setNavDir()} className="pb-[var(--tabbar-h)]">
      <Outlet />
      <nav aria-label="Tabs" className="tabbar fixed inset-x-0 bottom-0 z-[1100] border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="relative mx-auto grid max-w-3xl grid-cols-3">
          <span aria-hidden className="tab-pill pointer-events-none absolute inset-y-1.5 left-0 w-1/3 px-4" style={{ transform: `translateX(${idx * 100}%)` }}>
            <span className="block h-full rounded-full bg-slate-100" />
          </span>
          {TABS.map((t, i) => (
            <NavLink key={t.to} to={t.to} viewTransition
              className={`relative flex min-h-14 flex-col items-center justify-center gap-0.5 text-xs font-medium ${i === idx ? "text-slate-900" : "text-slate-500"}`}>
              <span aria-hidden className={`tab-icon text-xl leading-none ${i === idx ? "tab-icon-active" : ""}`}>{t.icon}</span>
              {t.label}
            </NavLink>
          ))}
        </div>
      </nav>
      <ScrollRestoration getKey={scrollKey} />
    </div>
  );
}
