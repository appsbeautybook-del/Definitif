import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { commandeId } = body;

    if (commandeId) {
      const commande = await base44.entities.Commande.get(commandeId);
      return Response.json({ commande });
    }

    const commandes = await base44.entities.Commande.filter({ client_email: user.email }, '-created_date', 50);
    return Response.json({ commandes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});