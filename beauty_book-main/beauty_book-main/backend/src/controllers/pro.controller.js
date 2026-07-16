import { supabaseAdmin } from '../config/supabase.js';

async function geocodeAddress(address) {
  if (!address) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1&countrycodes=fr,be,ch`;
    const res = await fetch(url, { headers: { "Accept-Language": "fr" } });
    const data = await res.json();
    if (data.length > 0) {
      return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon) };
    }
  } catch {}
  return null;
}

export const getProfilPro = async (req, res) => {
  try {
    const user = req.user;
    const { pro_email } = req.body;

    const email = pro_email || user.email;

    const { data: profils, error: profilErr } = await supabaseAdmin
      .from('ProfilPro')
      .select('*')
      .eq('user_email', email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (profilErr) throw profilErr;
    const profil = profils && profils.length > 0 ? profils[0] : null;

    // Also get services
    const { data: services, error: servErr } = await supabaseAdmin
      .from('Service')
      .select('*')
      .eq('pro_email', email)
      .eq('status', 'actif')
      .order('created_at', { ascending: false })
      .limit(20);

    // Also get styles
    const { data: styles, error: styleErr } = await supabaseAdmin
      .from('Style')
      .select('*')
      .eq('pro_email', email)
      .eq('status', 'publie')
      .order('likes', { ascending: false })
      .limit(20);

    return res.json({ profil, services: services || [], styles: styles || [] });
  } catch (error) {
    console.error('getProfilPro error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const updateProfilPro = async (req, res) => {
  try {
    const user = req.user;
    const body = req.body;
    
    const { salon_name, bio, avatar_url, cover_url, phone, address, city, postal_code, specialites, commodites, services_additionnels, menu_restaurant, ouverture, gallery } = body;

    const { data: profils, error: profilErr } = await supabaseAdmin
      .from('ProfilPro')
      .select('*')
      .eq('user_email', user.email)
      .order('created_at', { ascending: false })
      .limit(1);

    if (profilErr) throw profilErr;
    let profil = profils && profils.length > 0 ? profils[0] : null;

    const data = {};
    if (salon_name !== undefined) data.salon_name = salon_name;
    if (bio !== undefined) data.bio = bio;
    if (avatar_url !== undefined) data.avatar_url = avatar_url;
    if (cover_url !== undefined) data.cover_url = cover_url;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (city !== undefined) data.city = city;
    if (postal_code !== undefined) data.postal_code = postal_code;
    if (specialites !== undefined) data.specialites = specialites;
    if (commodites !== undefined) data.commodites = commodites;
    if (services_additionnels !== undefined) data.services_additionnels = services_additionnels;
    if (menu_restaurant !== undefined) data.menu_restaurant = menu_restaurant;
    if (ouverture !== undefined) data.ouverture = ouverture;
    if (gallery !== undefined) data.gallery = gallery;

    // Auto-geocode address to lat/lng when address or city changes
    if ((data.address !== undefined || data.city !== undefined) && !data.latitude) {
      const addr = [data.address || profil?.address, data.city || profil?.city].filter(Boolean).join(", ");
      if (addr) {
        const coords = await geocodeAddress(addr);
        if (coords) {
          data.latitude = coords.latitude;
          data.longitude = coords.longitude;
        }
      }
    }

    if (profil) {
      const { data: updated, error: updErr } = await supabaseAdmin
        .from('ProfilPro')
        .update(data)
        .eq('id', profil.id)
        .select()
        .single();
      if (updErr) throw updErr;
      profil = updated;
    } else {
      const { data: inserted, error: insErr } = await supabaseAdmin
        .from('ProfilPro')
        .insert({ user_email: user.email, ...data })
        .select()
        .single();
      if (insErr) throw insErr;
      profil = inserted;
    }

    return res.json({ profil, success: true });
  } catch (error) {
    console.error('updateProfilPro error:', error);
    return res.status(500).json({ error: error.message });
  }
};
