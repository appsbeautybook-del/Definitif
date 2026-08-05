import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Loader2, X } from "lucide-react";

const DEBOUNCE_MS = 350;
const MIN_CHARS = 3;
const API_KEY = "AIzaSyCYUS4e9iOQzEEzCpGYYv9zM42PaCSz2uU";

export default function AddressInput({ value, onChange, onCityChange, onCoordinatesChange, placeholder, className }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => { setQuery(value || ""); }, [value]);

  const fetchSuggestions = useCallback(async (q) => {
    if (!q || q.length < MIN_CHARS) { setSuggestions([]); setOpen(false); return; }
    setLoading(true);
    try {
      const res = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": API_KEY,
        },
        body: JSON.stringify({
          input: q,
          languageCode: "fr",
          includedRegionCodes: ["fr", "be", "ch"],
        }),
      });
      const data = await res.json();
      const preds = data.suggestions || [];
      setSuggestions(preds);
      setOpen(preds.length > 0);
      setHighlightedIdx(-1);
    } catch (err) {
      console.error("[AddressInput] autocomplete error:", err);
      setSuggestions([]);
      setOpen(false);
    }
    setLoading(false);
  }, []);

  const fetchDetails = useCallback(async (prediction) => {
    const placeId = prediction.placePrediction?.placeId;
    if (!placeId) return;
    try {
      const res = await fetch(`https://places.googleapis.com/v1/places/${placeId}?languageCode=fr`, {
        method: "GET",
        headers: { "X-Goog-Api-Key": API_KEY, "X-Goog-FieldMask": "formattedAddress,addressComponents,location" },
      });
      const place = await res.json();
      if (place.error) {
        console.error("[AddressInput] details error:", place.error);
        const text = prediction.placePrediction?.text?.text || "";
        setQuery(text);
        setOpen(false);
        onChange?.(text);
        return;
      }
      let street = "", city = "", postalCode = "";
      for (const c of place.addressComponents || []) {
        const t = c.types || [];
        if (t.includes("street_number")) street = (street ? street + " " : "") + c.longName;
        if (t.includes("route")) street = (street ? street + " " : "") + c.longName;
        if (t.includes("locality")) city = c.longName;
        if (t.includes("postal_code")) postalCode = c.longName;
      }
      const display = street || place.formattedAddress?.split(",")[0] || prediction.placePrediction?.text?.text || "";
      setQuery(display);
      setOpen(false);
      setSuggestions([]);
      onChange?.(display);
      if (city && onCityChange) onCityChange(city);
      if (place.location && onCoordinatesChange) {
        onCoordinatesChange({ latitude: place.location.latitude, longitude: place.location.longitude });
      }
    } catch (err) {
      console.error("[AddressInput] fetchDetails error:", err);
      const text = prediction.placePrediction?.text?.text || "";
      setQuery(text);
      setOpen(false);
      onChange?.(text);
    }
  }, [onChange, onCityChange, onCoordinatesChange]);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    onChange?.(val);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => fetchSuggestions(val), DEBOUNCE_MS);
  };

  const handleKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIdx(i => (i + 1) % suggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIdx(i => (i - 1 + suggestions.length) % suggestions.length); }
    else if (e.key === "Enter" && highlightedIdx >= 0) { e.preventDefault(); fetchDetails(suggestions[highlightedIdx]); }
    else if (e.key === "Escape") { setOpen(false); }
  };

  useEffect(() => {
    const handleClickOutside = (e) => { if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false); };
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
          {suggestions.map((s, i) => {
            const main = s.placePrediction?.text?.text || "";
            const secondary = s.placePrediction?.structuredFormat?.secondaryText?.text || "";
            return (
              <button
                key={i}
                onMouseDown={(e) => { e.preventDefault(); fetchDetails(s); }}
                onMouseEnter={() => setHighlightedIdx(i)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors border-b border-gray-50 last:border-0 ${
                  i === highlightedIdx ? "bg-orange-50" : "hover:bg-gray-50"
                }`}
              >
                <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${i === highlightedIdx ? "text-[#E8732A]" : "text-gray-400"}`} />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gray-800 truncate">{main}</p>
                  {secondary && <p className="text-[11px] text-gray-400 truncate">{secondary}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
