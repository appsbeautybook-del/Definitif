import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X } from "lucide-react";

const DEBOUNCE_MS = 350;
const MIN_CHARS = 3;
const GOOGLE_MAPS_API_KEY = "AIzaSyCYUS4e9iOQzEEzCpGYYv9zM42PaCSz2uU";

let gmapsLoaded = false;
let gmapsPromise = null;

function loadGoogleMaps() {
  if (gmapsLoaded && window.google?.maps?.places) return Promise.resolve();
  if (gmapsPromise) return gmapsPromise;
  gmapsPromise = new Promise((resolve) => {
    const existing = document.querySelector(`script[src*="maps.googleapis.com"]`);
    if (existing) {
      const check = () => {
        if (window.google?.maps?.places) { gmapsLoaded = true; resolve(); }
        else setTimeout(check, 100);
      };
      check();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places&language=fr`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      const check = () => {
        if (window.google?.maps?.places) { gmapsLoaded = true; resolve(); }
        else setTimeout(check, 100);
      };
      check();
    };
    document.head.appendChild(script);
  });
  return gmapsPromise;
}

function extractFromComponents(components) {
  if (!components) return { street: "", city: "", postalCode: "" };
  let street = "", number = "", city = "", postalCode = "", country = "";
  for (const c of components) {
    const types = c.types || [];
    if (types.includes("street_number")) number = c.long_name;
    if (types.includes("route")) street = c.long_name;
    if (types.includes("locality")) city = c.long_name;
    if (types.includes("postal_code")) postalCode = c.long_name;
    if (types.includes("country")) country = c.short_name;
  }
  return { street: number ? `${number} ${street}` : street, city, postalCode, country };
}

export default function AddressInput({ value, onChange, onCityChange, onCoordinatesChange, placeholder, className }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);
  const autocompleteService = useRef(null);
  const placesService = useRef(null);
  const sessionToken = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  useEffect(() => {
    loadGoogleMaps().then(() => {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      const div = document.createElement("div");
      placesService.current = new window.google.maps.places.PlacesService(div);
    });
  }, []);

  const fetchSuggestions = useCallback((q) => {
    if (!q || q.length < MIN_CHARS) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    if (!autocompleteService.current) {
      loadGoogleMaps().then(() => {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        doFetch(q);
      });
      return;
    }
    doFetch(q);
  }, []);

  const doFetch = (q) => {
    setLoading(true);
    const req = {
      input: q,
      componentRestrictions: { country: ["fr", "be", "ch"] },
      types: ["address"],
      sessionToken: sessionToken.current,
    };
    autocompleteService.current.getPlacePredictions(req, (preds, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && preds) {
        setSuggestions(preds);
        setOpen(true);
        setHighlightedIdx(-1);
        if (!sessionToken.current) {
          sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        }
      } else {
        setSuggestions([]);
        setOpen(false);
      }
      setLoading(false);
    });
  };

  const handleSelect = (prediction) => {
    if (!placesService.current) return;
    const req = { placeId: prediction.place_id, fields: ["formatted_address", "address_components", "geometry"] };
    placesService.current.getDetails(req, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && place) {
        const { street, city, postalCode } = extractFromComponents(place.address_components);
        const displayAddr = street || place.formatted_address?.split(",")[0] || prediction.description;
        setQuery(displayAddr);
        setOpen(false);
        setSuggestions([]);
        sessionToken.current = new window.google.maps.places.AutocompleteSessionToken();
        onChange?.(displayAddr);
        if (city && onCityChange) onCityChange(city);
        if (place.geometry?.location && onCoordinatesChange) {
          onCoordinatesChange({
            latitude: place.geometry.location.lat(),
            longitude: place.geometry.location.lng(),
          });
        }
      } else {
        setQuery(prediction.description);
        setOpen(false);
        onChange?.(prediction.description);
      }
    });
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange?.(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(val), DEBOUNCE_MS);
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx(i => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx(i => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightedIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={handleChange}
          onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ex: 12 rue de la Paix, Paris"}
          className={className || "w-full bg-gray-50 border border-gray-200 text-gray-800 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-[#E8732A] transition-colors"}
          autoComplete="off"
        />
        {loading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
          </div>
        )}
        {!loading && query && (
          <button
            onClick={() => { setQuery(""); onChange?.(""); setSuggestions([]); setOpen(false); inputRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center hover:bg-gray-400 transition-colors"
          >
            <X className="w-3 h-3 text-white" />
          </button>
        )}
      </div>

      {open && suggestions.length > 0 && (
        <div className="absolute z-[100] left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl max-h-[260px] overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={s.place_id}
              onMouseDown={(e) => { e.preventDefault(); handleSelect(s); }}
              onMouseEnter={() => setHighlightedIdx(i)}
              className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-0 ${
                i === highlightedIdx ? "bg-orange-50" : "hover:bg-gray-50"
              }`}
            >
              <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${i === highlightedIdx ? "text-[#E8732A]" : "text-gray-400"}`} />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-gray-800 truncate">{s.structured_formatting?.main_text || s.description}</p>
                <p className="text-[11px] text-gray-400 truncate">{s.structured_formatting?.secondary_text || ""}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
