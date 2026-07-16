import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { salon_name, bio, avatar_url, cover_url, phone, address, city, postal_code, specialites, commodites, services_additionnels, menu_restaurant, ouverture, gallery } = body;

    const profils = await base44.entities.ProfilPro.filter({ user_email: user.email }, '-created_date', 1);
    let profil = profils[0];

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

    if (profil) {
      profil = await base44.entities.ProfilPro.update(profil.id, data);
    } else {
      profil = await base44.entities.ProfilPro.create({ user_email: user.email, ...data });
    }

    return Response.json({ profil, success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});