import { createContext, useContext, useState, useEffect, useRef } from "react";

const LOCATION_KEY = "bb_user_location";

function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function filterByRadius(items, userLat, userLng, radiusKm = 100) {
  return items
    .map((item) => {
      const lat = item.latitude || item.lat || item._lat;
      const lng = item.longitude || item.lng || item._lng;
      if (lat && lng) {
        return { ...item, _distance: haversineDistance(userLat, userLng, lat, lng) };
      }
      return { ...item, _distance: Infinity };
    })
    .filter((item) => item._distance <= radiusKm)
    .sort((a, b) => a._distance - b._distance);
}

function sortByDistance(items, userLat, userLng) {
  return items
    .map((item) => {
      const lat = item.latitude || item.lat || item._lat;
      const lng = item.longitude || item.lng || item._lng;
      if (lat && lng) {
        return { ...item, _distance: haversineDistance(userLat, userLng, lat, lng) };
      }
      return { ...item, _distance: Infinity };
    })
    .sort((a, b) => a._distance - b._distance);
}

const LocationContext = createContext(null);

export function LocationProvider({ children }) {
  const [location, setLocation] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LOCATION_KEY) || "null");
      return stored;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestedRef = useRef(false);

  const requestLocation = () => {
    if (requestedRef.current) return;
    requestedRef.current = true;
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
        setLocation(loc);
        localStorage.setItem(LOCATION_KEY, JSON.stringify(loc));
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.warn("[LocationProvider] Geolocation error:", err.message);
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return (
    <LocationContext.Provider
      value={{
        location,
        loading,
        error,
        hasLocation: !!location,
        latitude: location?.latitude,
        longitude: location?.longitude,
        requestLocation,
        filterByRadius: (items, radius = 100) => {
          if (!location) return items;
          return filterByRadius(items, location.latitude, location.longitude, radius);
        },
        sortByDistance: (items) => {
          if (!location) return items;
          return sortByDistance(items, location.latitude, location.longitude);
        },
        haversineDistance: (lat, lng) => {
          if (!location) return null;
          return haversineDistance(location.latitude, location.longitude, lat, lng);
        },
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) {
    return {
      location: null,
      loading: false,
      error: null,
      hasLocation: false,
      latitude: null,
      longitude: null,
      requestLocation: () => {},
      filterByRadius: (items) => items,
      sortByDistance: (items) => items,
      haversineDistance: () => null,
    };
  }
  return ctx;
}

export { haversineDistance, filterByRadius, sortByDistance };
