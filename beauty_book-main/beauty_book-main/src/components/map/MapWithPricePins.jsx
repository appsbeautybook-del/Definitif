import { useState, useEffect, useRef, useMemo } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_API_KEY = "AIzaSyCYUS4e9iOQzEEzCpGYYv9zM42PaCSz2uU";

function PriceMarker({ item, isSelected, onClick }) {
  return (
    <AdvancedMarker position={{ lat: item._lat, lng: item._lng }} onClick={onClick}>
      <div style={{
        background: isSelected ? "#1a1a1a" : "#E8732A",
        color: "#ffffff",
        borderRadius: "24px",
        padding: "6px 14px",
        fontSize: "13px",
        fontWeight: 700,
        fontFamily: "system-ui, -apple-system, sans-serif",
        whiteSpace: "nowrap",
        boxShadow: isSelected ? "0 4px 20px rgba(0,0,0,0.5)" : "0 2px 10px rgba(232,115,42,0.35), 0 1px 4px rgba(0,0,0,0.15)",
        transform: isSelected ? "scale(1.15) translateY(-4px)" : "scale(1)",
        transition: "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}>
        {item.price > 0 ? `${item.price}€` : "📍"}
      </div>
    </AdvancedMarker>
  );
}

export default function MapWithPricePins({ items = [], onSelectItem, height = "h-52" }) {
  const [selected, setSelected] = useState(null);

  const resolvedItems = useMemo(() => {
    return items
      .filter(item => item.lat && item.lng && !isNaN(item.lat) && !isNaN(item.lng))
      .map(item => ({ ...item, _lat: parseFloat(item.lat), _lng: parseFloat(item.lng) }));
  }, [items]);

  const center = useMemo(() => {
    if (resolvedItems.length === 1) {
      return { lat: resolvedItems[0]._lat, lng: resolvedItems[0]._lng };
    }
    if (resolvedItems.length > 1) {
      return {
        lat: resolvedItems.reduce((s, it) => s + it._lat, 0) / resolvedItems.length,
        lng: resolvedItems.reduce((s, it) => s + it._lng, 0) / resolvedItems.length,
      };
    }
    return { lat: 48.8566, lng: 2.3522 };
  }, [resolvedItems]);

  const mapId = useMemo(() => "beautybook-map-static", []);

  return (
    <div className={`relative ${height} rounded-3xl overflow-hidden border border-gray-200 shadow-md bg-gray-100`}>
      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={12}
          mapId={mapId}
          gestureHandling="greedy"
          disableDefaultUI={true}
          style={{ width: "100%", height: "100%" }}
        >
          {resolvedItems.map((item) => (
            <PriceMarker
              key={item.id}
              item={item}
              isSelected={selected === item.id}
              onClick={() => {
                setSelected(prev => prev === item.id ? null : item.id);
                onSelectItem?.(item);
              }}
            />
          ))}
        </Map>
      </APIProvider>

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
