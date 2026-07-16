import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { role = "client", status } = body;

    const filter = role === "pro"
      ? { pro_email: user.email }
      : { client_email: user.email };

    if (status) filter.status = status;

    const reservations = await base44.entities.Reservation.filter(filter, '-date', 50);
    return Response.json({ reservations });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});