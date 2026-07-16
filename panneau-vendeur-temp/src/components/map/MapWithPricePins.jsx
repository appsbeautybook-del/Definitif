import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps";

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

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";

function PriceMarker({ item, isSelected, onClick }) {
  return (
    <AdvancedMarker
      position={{ lat: item._lat, lng: item._lng }}
      onClick={onClick}
    >
      <div
        style={{
          background: isSelected ? "#1a1a1a" : "#E8732A",
          color: "#ffffff",
          borderRadius: "24px",
          padding: "6px 12px",
          fontSize: "12px",
          fontWeight: 700,
          fontFamily: "system-ui, -apple-system, sans-serif",
          whiteSpace: "nowrap",
          boxShadow: isSelected
            ? "0 4px 20px rgba(0,0,0,0.5)"
            : "0 2px 10px rgba(232,115,42,0.35), 0 1px 4px rgba(0,0,0,0.15)",
          letterSpacing: "-0.3px",
          lineHeight: 1,
          transform: isSelected ? "scale(1.12) translateY(-2px)" : "scale(1)",
          transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {item.price > 0 ? `${item.price}€` : "📍"}
      </div>
    </AdvancedMarker>
  );
}

export default function MapWithPricePins({ items = [], onSelectItem, height = "h-52" }) {
  const [selected, setSelected] = useState(null);
  const [resolvedItems, setResolvedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef(null);

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

  const mapId = useMemo(() => "beautybook-map-" + Date.now(), []);

  if (!GOOGLE_MAPS_API_KEY) {
    return (
      <div className={`relative ${height} rounded-3xl overflow-hidden border border-gray-200 shadow-md bg-gray-50 flex items-center justify-center`}>
        <div className="text-center px-4">
          <p className="text-gray-400 text-[12px] font-medium">Google Maps non configuré</p>
          <p className="text-gray-300 text-[10px] mt-1">Ajoutez VITE_GOOGLE_MAPS_API_KEY</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${height} rounded-3xl overflow-hidden border border-gray-200 shadow-md bg-gray-100`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={12}
          mapId={mapId}
          gestureHandling="greedy"
          disableDefaultUI={true}
          style={{ width: "100%", height: "100%" }}
          onTilesLoaded={() => {
            if (loading) setLoading(false);
          }}
        >
          {resolvedItems.map((item) => {
            if (!item._lat || !item._lng) return null;
            const isSelected = selected === item.id;
            return (
              <PriceMarker
                key={item.id}
                item={item}
                isSelected={isSelected}
                onClick={() => {
                  setSelected(prev => prev === item.id ? null : item.id);
                  onSelectItem?.(item);
                }}
              />
            );
          })}
        </Map>
      </APIProvider>

      {selected && (() => {
        const item = resolvedItems.find(it => it.id === selected);
        if (!item) return null;
        return (
          <div className="absolute bottom-3 left-3 right-3 bg-white rounded-2xl shadow-lg px-4 py-3 z-[1000] flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
              <span className="text-primary text-[16px]">📍</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-black text-gray-900 truncate">{item.title}</p>
              <p className="text-[11px] text-gray-400 font-medium truncate">{item.address || item.city}</p>
            </div>
            {item.price > 0 && <span className="text-[15px] font-black text-primary shrink-0">{item.price}€</span>}
          </div>
        );
      })()}
    </div>
  );
}
