import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import { Link } from "react-router-dom";
import { accById, coord, trip, type Coord } from "../data";
import type { Day } from "../types";
import { fmtDate } from "../lib/format";
import { Weather } from "./Weather";

export interface PinGroup { key: string; days: Day[]; at: Coord; label: string }

/** Consecutive days sharing the same coordinates merge into one pin. */
export function buildGroups(): PinGroup[] {
  const groups: PinGroup[] = [];
  for (const d of trip.days) {
    const c = coord(d.location);
    if (!c) continue;
    const last = groups[groups.length - 1];
    if (last && last.at.lat === c.lat && last.at.lng === c.lng) last.days.push(d);
    else groups.push({ key: String(d.day_number), days: [d], at: c, label: "" });
  }
  for (const g of groups) {
    const a = g.days[0].day_number, b = g.days[g.days.length - 1].day_number;
    g.label = a === b ? String(a) : `${a}–${b}`;
  }
  return groups;
}

export const groupKeyForDay = (groups: PinGroup[], n: number): string | null =>
  groups.find((g) => g.days.some((d) => d.day_number === n))?.key ?? null;

function icon(g: PinGroup, active: boolean, pulse: boolean) {
  const color = "#e11d48";
  const w = g.label.length > 2 ? 46 : 30;
  return L.divIcon({
    className: "",
    html: `<div class="pin${active ? " pin-active" : ""}${pulse ? " pin-pulse" : ""}" style="background:${color};width:${w}px;height:30px">${g.label}</div>`,
    iconSize: [w, 30], iconAnchor: [w / 2, 15], popupAnchor: [0, -15],
  });
}

function Fit({ groups, focus }: { groups: PinGroup[]; focus: string | null }) {
  const map = useMap();
  useEffect(() => {
    // Size is measured after layout so a freshly mounted full-height container doesn't render grey tiles.
    const id = requestAnimationFrame(() => {
      map.invalidateSize();
      if (!groups.length) return;
      map.fitBounds(L.latLngBounds(groups.map((g) => [g.at.lat, g.at.lng] as [number, number])), { padding: [30, 30] });
      const g = groups.find((x) => x.key === focus);
      if (g) map.panTo([g.at.lat, g.at.lng], { animate: false });
    });
    return () => cancelAnimationFrame(id);
  }, [map, groups, focus]);
  return null;
}

export function OverviewMap({ groups, activeKey, today, className }: { groups: PinGroup[]; activeKey: string | null; today: number | null; className?: string }) {
  const line = useMemo(() => groups.map((g) => [g.at.lat, g.at.lng] as [number, number]), [groups]);
  const icons = useMemo(
    () => groups.map((g) => icon(g, g.key === activeKey || g.days.some((d) => d.day_number === today), g.key === activeKey)),
    [groups, activeKey, today],
  );
  return (
    <MapContainer center={[38, 140.5]} zoom={6} scrollWheelZoom dragging touchZoom className={className}>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Polyline positions={line} pathOptions={{ color: "#475569", weight: 3, dashArray: "6 6" }} />
      {groups.map((g, i) => (
        <Marker key={g.key} position={[g.at.lat, g.at.lng]} icon={icons[i]}>
          <Popup>
            <div className="space-y-3">
              {g.days.map((d) => (
                <div key={d.id} className="text-sm leading-snug">
                  <div className="font-semibold">Day {d.day_number} · {fmtDate(d.date)}</div>
                  <div>{d.travel_city} → {d.sleep_city}</div>
                  {accById(d.accommodation_id) && <div className="text-slate-600">🛏 {accById(d.accommodation_id)!.name}</div>}
                  <div><Weather day={d} /></div>
                  <Link to={`/trip/day/${d.day_number}`} viewTransition className="inline-flex min-h-[44px] items-center font-medium text-blue-600 underline">View day</Link>
                </div>
              ))}
            </div>
          </Popup>
        </Marker>
      ))}
      <Fit groups={groups} focus={activeKey} />
    </MapContainer>
  );
}
