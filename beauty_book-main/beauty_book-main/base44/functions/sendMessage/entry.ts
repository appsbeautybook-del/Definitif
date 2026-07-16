import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { receiver_email, content, conversation_id, type = "text", media_url } = body;

    if (!receiver_email || !content) {
      return Response.json({ error: 'receiver_email et content requis' }, { status: 400 });
    }

    const convId = conversation_id || [user.email, receiver_email].sort().join('_');

    // Chercher le profil du receiver pour avoir son nom
    let receiverName = receiver_email;
    let receiverAvatar = null;
    try {
      const receiverUsers = await base44.asServiceRole.entities.User.filter({ email: receiver_email }, null, 1);
      if (receiverUsers?.[0]) {
        receiverName = receiverUsers[0].full_name || receiver_email;
        receiverAvatar = receiverUsers[0].avatar_url || null;
      }
      // Essayer aussi ProfilPro pour l'avatar
      const profilPros = await base44.asServiceRole.entities.ProfilPro.filter({ user_email: receiver_email }, null, 1);
      if (profilPros?.[0]) {
        receiverName = profilPros[0].salon_name || receiverName;
        receiverAvatar = profilPros[0].avatar_url || receiverAvatar;
      }
    } catch (e) {
      console.error("Could not fetch receiver info:", e);
    }

    const message = await base44.asServiceRole.entities.MessageChat.create({
      conversation_id: convId,
      sender_email: user.email,
      sender_name: user.full_name || user.email,
      sender_avatar: user.avatar_url || null,
      receiver_email,
      receiver_name: receiverName,
      receiver_avatar: receiverAvatar,
      content,
      type,
      media_url,
      read: false,
    });

    // Déterminer le rôle de l'expéditeur pour l'affichage dans les notifs
    const senderRole = user.role === "admin" ? "admin" : null;
    let senderIsPro = false;
    try {
      const proCheck = await base44.asServiceRole.entities.ProfilPro.filter({ user_email: user.email }, null, 1);
      senderIsPro = proCheck?.length > 0;
    } catch {}

    // Notification push pour le receiver
    await base44.asServiceRole.entities.Notification.create({
      user_email: receiver_email,
      type: "message",
      title: `Message de ${user.full_name || user.email}`,
      body: content.length > 60 ? content.slice(0, 60) + '...' : content,
      link: `/messages?to=${user.email}&name=${encodeURIComponent(user.full_name || user.email)}`,
      read: false,
      data: {
        conversation_id: convId,
        sender_email: user.email,
        sender_name: user.full_name || user.email,
        sender_role: senderRole || (senderIsPro ? "pro" : "client"),
        is_admin: senderRole === "admin",
        is_pro: senderIsPro,
      },
    });

    return Response.json({ message, conversation_id: convId, success: true });
  } catch (error) {
    console.error("sendMessage error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});