import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const priceIcon = (price, isSelected) => L.divIcon({
  className: "",
  iconSize: [0, 0],
  iconAnchor: [0, 0],
  html: `<div style="
    background: ${isSelected ? "#222222" : "white"};
    color: ${isSelected ? "white" : "#222222"};
    border-radius: 24px;
    padding: 6px 12px;
    font-size: 13px;
    font-weight: 600;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    white-space: nowrap;
    box-shadow: 0 2px 8px rgba(0,0,0,0.15), 0 1px 2px rgba(0,0,0,0.1);
    transform: ${isSelected ? "scale(1.1) translateY(-2px)" : "scale(1)"};
    transition: all 0.2s ease;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${isSelected ? "#222222" : "#e0e0e0"};
    letter-spacing: -0.2px;
  ">${price > 0 ? price + "€" : "Pro"}</div>`,
});

const userIcon = L.divIcon({
  className: "",
  iconSize: [28, 36],
  iconAnchor: [14, 32],
  html: `<div style="position: relative; width: 28px; height: 36px;">
    <div style="
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: #4285F4;
      border: 3px solid white;
      box-shadow: 0 0 0 3px rgba(66,133,244,0.3), 0 2px 8px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L4 20L12 16L20 20L12 2Z" fill="white" stroke="white" stroke-width="1" stroke-linejoin="round"/>
      </svg>
    </div>
    <div style="
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 0;
      height: 0;
      border-left: 6px solid transparent;
      border-right: 6px solid transparent;
      border-top: 8px solid #4285F4;
    "></div>
  </div>`,
});

function FlyToLocation({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), { duration: 0.5 });
    }
  }, [center, map]);
  return null;
}

export default function MapWithPricePins({ items = [], onSelectItem, height = "h-52" }) {
  const [selected, setSelected] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);

  const resolvedItems = useMemo(() => {
    return items
      .filter(item => item.lat && item.lng && !isNaN(item.lat) && !isNaN(item.lng))
      .map(item => ({ ...item, _lat: parseFloat(item.lat), _lng: parseFloat(item.lng) }));
  }, [items]);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation(null),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const center = useMemo(() => {
    if (userLocation) return userLocation;
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
  }, [userLocation, resolvedItems]);

  return (
    <div className={`relative ${height} rounded-3xl overflow-hidden border border-gray-200 shadow-md bg-gray-100`}>
      <MapContainer
        center={center}
        zoom={userLocation ? 14 : 12}
        style={{ width: "100%", height: "100%" }}
        zoomControl={false}
        attributionControl={false}
        whenReady={() => setMapReady(true)}
      >
        <TileLayer url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>' maxZoom={19} />
        {mapReady && <FlyToLocation center={center} />}
        {userLocation && (
          <Marker position={userLocation} icon={userIcon} />
        )}
        {resolvedItems.map((item) => (
          <Marker
            key={item.id}
            position={[item._lat, item._lng]}
            icon={priceIcon(item.price, selected === item.id)}
            eventHandlers={{
              click: () => {
                setSelected(prev => prev === item.id ? null : item.id);
                onSelectItem?.(item);
              },
            }}
          />
        ))}
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
