import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { pro_email } = body;

    const email = pro_email || user.email;
    const profils = await base44.asServiceRole.entities.ProfilPro.filter({ user_email: email }, '-created_date', 1);
    const profil = profils[0] || null;

    // Also get services
    const services = await base44.asServiceRole.entities.Service.filter({ pro_email: email, status: "actif" }, '-created_date', 20);
    const styles = await base44.asServiceRole.entities.Style.filter({ pro_email: email, status: "publie" }, '-likes', 20);

    return Response.json({ profil, services, styles });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});