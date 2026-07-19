import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const geocodeCache = {};

async function geocodeAddress(address) {
  if (!address) return null;
  const key = address.trim().toLowerCase();
  if (geocodeCache[key]) return geocodeCache[key];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&addressdetails=1&countrycodes=fr,be,ch`;
    const res = await fetch(url, { headers: { "Accept-Language": "fr" } });
    const data = await res.json();
    if (data.length > 0) {
      const pos = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[key] = pos;
      return pos;
    }
  } catch {}
  return null;
}

function createPriceIcon(price, isSelected) {
  return L.divIcon({
    className: '',
    html: `<div style="
      background: ${isSelected ? '#1a1a1a' : '#E8732A'};
      color: #fff;
      border-radius: 24px;
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 700;
      font-family: system-ui, -apple-system, sans-serif;
      white-space: nowrap;
      box-shadow: ${isSelected ? '0 4px 20px rgba(0,0,0,0.5)' : '0 2px 10px rgba(232,115,42,0.35)'};
      transform: ${isSelected ? 'scale(1.15) translateY(-4px)' : 'scale(1)'};
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    ">${price > 0 ? price + '€' : '📍'}</div>`,
    iconSize: [0, 0],
    iconAnchor: [30, 20],
  });
}

function FitBounds({ items }) {
  const map = useMap();
  useEffect(() => {
    if (items.length > 1) {
      const bounds = L.latLngBounds(items.map(i => [i._lat, i._lng]));
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    } else if (items.length === 1) {
      map.setView([items[0]._lat, items[0]._lng], 14);
    }
  }, [items, map]);
  return null;
}

export default function MapWithPricePins({ items = [], onSelectItem, height = "h-52" }) {
  const [selected, setSelected] = useState(null);
  const [resolvedItems, setResolvedItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!items.length) { setLoading(false); return; }
    let cancelled = false;
    async function resolve() {
      const resolved = await Promise.all(
        items.map(async (item) => {
          if (item.lat && item.lng) return { ...item, _lat: parseFloat(item.lat), _lng: parseFloat(item.lng) };
          const addr = [item.address, item.city].filter(Boolean).join(", ");
          if (addr) {
            const pos = await geocodeAddress(addr);
            if (pos) return { ...item, _lat: pos.lat, _lng: pos.lng };
          }
          return null;
        })
      );
      if (!cancelled) { setResolvedItems(resolved.filter(Boolean)); setLoading(false); }
    }
    resolve();
    return () => { cancelled = true; };
  }, [items]);

  const center = useMemo(() => {
    if (resolvedItems.length > 0) {
      return {
        lat: resolvedItems.reduce((s, it) => s + it._lat, 0) / resolvedItems.length,
        lng: resolvedItems.reduce((s, it) => s + it._lng, 0) / resolvedItems.length,
      };
    }
    return { lat: 48.8566, lng: 2.3522 };
  }, [resolvedItems]);

  return (
    <div className={`relative ${height} rounded-3xl overflow-hidden border border-gray-200 shadow-md bg-gray-100`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]">
          <div className="w-6 h-6 border-2 border-[#E8732A] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <MapContainer
        center={[center.lat, center.lng]}
        zoom={12}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {resolvedItems.length > 1 && <FitBounds items={resolvedItems} />}

        {resolvedItems.map((item) => {
          if (!item._lat || !item._lng) return null;
          const isSelected = selected === item.id;
          return (
            <Marker
              key={item.id}
              position={[item._lat, item._lng]}
              icon={createPriceIcon(item.price, isSelected)}
              eventHandlers={{
                click: () => {
                  setSelected(prev => prev === item.id ? null : item.id);
                  onSelectItem?.(item);
                },
              }}
            />
          );
        })}
      </MapContainer>

      {selected && (() => {
        const item = resolvedItems.find(it => it.id === selected);
        if (!item) return null;
        return (
          <div className="absolute bottom-3 left-3 right-3 bg-white rounded-2xl shadow-lg px-4 py-3 z-[1000] flex items-center gap-3">
            <div className="w-8 h-8 bg-[#E8732A]/10 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-[#E8732A] text-[16px]">📍</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-gray-900 truncate">{item.title || item.name}</p>
              <p className="text-[11px] text-gray-400 font-medium truncate">{item.address || item.city || item.location}</p>
            </div>
            {item.price > 0 && <span className="text-[15px] font-black text-[#E8732A] shrink-0">{item.price}€</span>}
          </div>
        );
      })()}
    </div>
  );
}
