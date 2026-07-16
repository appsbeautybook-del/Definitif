import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }
    if (user.role !== 'admin') {
      return Response.json({ error: 'Accès réservé aux administrateurs' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, id, data } = body;

    if (action === 'create') {
      const annonce = await base44.asServiceRole.entities.Annonce.create({
        ...data,
        status: data.status || 'actif',
        clicks: 0,
        impressions: 0,
      });
      return Response.json({ annonce });
    }

    if (action === 'update') {
      if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
      const annonce = await base44.asServiceRole.entities.Annonce.update(id, data);
      return Response.json({ annonce });
    }

    if (action === 'delete') {
      if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
      await base44.asServiceRole.entities.Annonce.delete(id);
      return Response.json({ success: true });
    }

    if (action === 'list') {
      const annonces = await base44.asServiceRole.entities.Annonce.list('-created_date', 100);
      return Response.json({ annonces });
    }

    return Response.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('manageAnnonce error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});