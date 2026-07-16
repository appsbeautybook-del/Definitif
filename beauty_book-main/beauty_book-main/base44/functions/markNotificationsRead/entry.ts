import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { notificationId } = body;

    if (notificationId) {
      await base44.entities.Notification.update(notificationId, { read: true });
    } else {
      const unread = await base44.entities.Notification.filter({ user_email: user.email, read: false });
      for (const n of unread) {
        await base44.entities.Notification.update(n.id, { read: true });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});