export const placesAutocomplete = async (req, res) => {
  try {
    const { input, placeId } = req.body;

    // Récupérer les détails d'un lieu (place_id → adresse structurée)
    if (placeId) {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/lookup?osm_id=${encodeURIComponent(placeId)}&format=json&addressdetails=1&accept-language=fr`
      );
      const data = await resp.json();
      if (!data.length) {
        return res.json({ address: "", city: "", postalCode: "", formatted: "", lat: null, lng: null });
      }

      const result = data[0];
      const addr = result.address || {};

      const streetNumber = addr.house_number || "";
      const route = addr.road || "";
      const city = addr.city || addr.town || addr.village || "";
      const postalCode = addr.postcode || "";

      const address = [streetNumber, route].filter(Boolean).join(" ");

      return res.json({
        address,
        city,
        postalCode,
        formatted: result.display_name || address,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      });
    }

    // Autocomplete
    if (!input || input.length < 2) return res.json({ predictions: [] });

    const resp = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=5&addressdetails=1&countrycodes=fr,be,ch&accept-language=fr`
    );
    const data = await resp.json();

    const predictions = data.map((item) => ({
      description: item.display_name,
      place_id: item.osm_id?.toString() || "",
      structured: item.address || {},
    }));

    return res.json({ predictions });
  } catch (error) {
    console.error("placesAutocomplete error:", error.message);
    return res.status(500).json({ error: error.message });
  }
};
