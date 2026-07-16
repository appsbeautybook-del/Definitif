import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const notifications = await base44.entities.Notification.filter(
      { user_email: user.email },
      '-created_date',
      50
    );

    const unread = notifications.filter(n => !n.read).length;
    return Response.json({ notifications, unread });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});