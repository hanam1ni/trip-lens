import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Coord } from "../data";

export interface DayPoint { id: string; name: string; at: Coord; kind: "place" | "food" | "hotel" }
export const PIN_BG = { place: "var(--color-primary)", food: "var(--color-accent)", hotel: "var(--color-secondary)" };
const PIN_FG = { place: "#fff", food: "var(--color-ink)", hotel: "#fff" };
// Lucide (ISC) map-pin / utensils / bed paths, inlined because divIcon takes an HTML string.
const PATHS = {
  place: '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
  food: '<path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>',
  hotel: '<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/>',
};
const svg = (k: DayPoint["kind"]) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">${PATHS[k]}</svg>`;

const icon = (k: DayPoint["kind"]) =>
  L.divIcon({
    className: "",
    html: `<div class="pin" style="background:${PIN_BG[k]};color:${PIN_FG[k]};width:30px;height:30px">${svg(k)}</div>`,
    iconSize: [30, 30], iconAnchor: [15, 15], popupAnchor: [0, -15],
  });

function Fit({ pts }: { pts: DayPoint[] }) {
  const map = useMap();
  useEffect(() => {
    const ll = pts.map((p) => [p.at.lat, p.at.lng] as [number, number]);
    if (ll.length === 1) map.setView(ll[0], 14);
    else map.fitBounds(L.latLngBounds(ll), { padding: [30, 30], maxZoom: 15 });
  }, [map, pts]);
  return null;
}

export function DayMap({ pts }: { pts: DayPoint[] }) {
  return (
    <MapContainer center={[pts[0].at.lat, pts[0].at.lng]} zoom={12} scrollWheelZoom={false} className="h-64 w-full rounded-2xl">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pts.map((p) => (
        <Marker key={p.id} position={[p.at.lat, p.at.lng]} icon={icon(p.kind)}>
          <Popup><span className="font-semibold">{p.name}</span></Popup>
        </Marker>
      ))}
      <Fit pts={pts} />
    </MapContainer>
  );
}
