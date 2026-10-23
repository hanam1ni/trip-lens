import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import type { Coord } from "../data";

export interface DayPoint { id: string; name: string; at: Coord; kind: "place" | "food" | "hotel" }
const COLOR = { place: "#2563eb", food: "#ea580c", hotel: "#7c3aed" };
const GLYPH = { place: "📍", food: "🍴", hotel: "🛏" };

const icon = (k: DayPoint["kind"]) =>
  L.divIcon({
    className: "",
    html: `<div class="pin" style="background:${COLOR[k]};width:28px;height:28px;font-size:14px">${GLYPH[k]}</div>`,
    iconSize: [28, 28], iconAnchor: [14, 14], popupAnchor: [0, -14],
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
    <MapContainer center={[pts[0].at.lat, pts[0].at.lng]} zoom={12} scrollWheelZoom={false} className="h-64 w-full rounded-lg">
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>' url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {pts.map((p) => (
        <Marker key={p.id} position={[p.at.lat, p.at.lng]} icon={icon(p.kind)}>
          <Popup>{p.name}</Popup>
        </Marker>
      ))}
      <Fit pts={pts} />
    </MapContainer>
  );
}
