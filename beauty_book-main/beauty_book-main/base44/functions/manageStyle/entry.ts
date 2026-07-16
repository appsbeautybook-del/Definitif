import { createClientFromRequest } from 'npm:@base44/sdk@0.8.30';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Non authentifié' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { action, id, data } = body;
    const isAdmin = user.role === 'admin';

    if (action === 'create') {
      // Les admins peuvent spécifier n'importe quel pro_email
      const styleData = {
        ...data,
        pro_email: isAdmin && data.pro_email ? data.pro_email : user.email,
        status: data.status || 'publie',
        likes: data.likes ?? 0,
        views: data.views ?? 0,
        featured: data.featured ?? false,
      };
      // Utiliser asServiceRole pour bypasser la RLS (qui bloque si pro_email != user.email)
      const style = await base44.asServiceRole.entities.Style.create(styleData);
      return Response.json({ style });
    }

    if (action === 'update') {
      if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
      const style = isAdmin
        ? await base44.asServiceRole.entities.Style.update(id, data)
        : await base44.entities.Style.update(id, data);
      return Response.json({ style });
    }

    if (action === 'delete') {
      if (!id) return Response.json({ error: 'ID requis' }, { status: 400 });
      if (isAdmin) {
        await base44.asServiceRole.entities.Style.delete(id);
      } else {
        await base44.entities.Style.delete(id);
      }
      return Response.json({ success: true });
    }

    if (action === 'list') {
      const filter = isAdmin ? {} : { pro_email: user.email };
      const styles = await base44.asServiceRole.entities.Style.filter(filter, '-created_date', 200);
      return Response.json({ styles });
    }

    return Response.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('manageStyle error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});