import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { input, placeId } = await req.json();

    // Récupérer les détails d'un lieu (place_id → adresse structurée)
    if (placeId) {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/lookup?osm_id=${encodeURIComponent(placeId)}&format=json&addressdetails=1&accept-language=fr`
      );
      const data = await res.json();
      if (!data.length) {
        return Response.json({ address: "", city: "", postalCode: "", formatted: "", lat: null, lng: null });
      }

      const result = data[0];
      const addr = result.address || {};

      const streetNumber = addr.house_number || "";
      const route = addr.road || "";
      const city = addr.city || addr.town || addr.village || "";
      const postalCode = addr.postcode || "";

      const address = [streetNumber, route].filter(Boolean).join(" ");
      return Response.json({
        address,
        city,
        postalCode,
        formatted: result.display_name || address,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
      });
    }

    // Autocomplete
    if (!input || input.length < 2) return Response.json({ predictions: [] });

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(input)}&format=json&limit=5&addressdetails=1&countrycodes=fr,be,ch&accept-language=fr`
    );
    const data = await res.json();

    const predictions = data.map((item) => ({
      description: item.display_name,
      place_id: item.osm_id?.toString() || "",
      structured: item.address || {},
    }));

    return Response.json({ predictions });
  } catch (error) {
    console.error("placesAutocomplete error:", error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});
