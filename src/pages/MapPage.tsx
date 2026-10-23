import { useMemo } from "react";
import { useLocation, useSearchParams } from "react-router-dom";
import { buildGroups, groupKeyForDay, OverviewMap } from "../components/OverviewMap";
import { TopBar, TopTitle } from "../components/TopBar";
import { tripState } from "../lib/tripState";

export function MapPage() {
  const [sp] = useSearchParams();
  const { key: navKey } = useLocation();
  const groups = useMemo(buildGroups, []);
  const today = tripState().current?.day_number ?? null;
  // ?focus=<day> wins; during the trip default to today; otherwise no focus (fit whole route).
  const focusDay = Number(sp.get("focus")) || today;
  const activeKey = focusDay ? groupKeyForDay(groups, focusDay) : null;

  return (
    <div className="map-screen flex flex-col">
      <TopBar><TopTitle>Map</TopTitle>{focusDay && activeKey && <span className="text-sm text-slate-500">Day {focusDay}</span>}</TopBar>
      <div className="relative min-h-0 flex-1">
        {/* key: remount on every navigation to the tab so Leaflet measures a fresh container */}
        <OverviewMap key={navKey} groups={groups} activeKey={activeKey} today={today} className="absolute inset-0" />
      </div>
    </div>
  );
}
