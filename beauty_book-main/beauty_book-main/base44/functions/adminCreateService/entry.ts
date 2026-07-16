import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Accès réservé aux admins' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, id, data } = body;

    if (action === 'create') {
      const service = await base44.asServiceRole.entities.Service.create({
        ...data,
        pro_email: data.pro_email || user.email,
        status: 'actif',
      });
      return Response.json({ service });
    }

    if (action === 'delete') {
      if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
      await base44.asServiceRole.entities.Service.delete(id);
      return Response.json({ success: true });
    }

    if (action === 'toggle') {
      if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
      const existing = await base44.asServiceRole.entities.Service.get(id);
      const newStatus = existing.status === 'actif' ? 'inactif' : 'actif';
      const updated = await base44.asServiceRole.entities.Service.update(id, { status: newStatus });
      return Response.json({ service: updated });
    }

    return Response.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('adminCreateService error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});