import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => ({}));
    const { conversation_id } = body;

    if (conversation_id) {
      const messages = await base44.entities.MessageChat.filter({ conversation_id }, 'created_date', 100);
      // Mark as read
      for (const m of messages) {
        if (!m.read && m.receiver_email === user.email) {
          await base44.entities.MessageChat.update(m.id, { read: true });
        }
      }
      return Response.json({ messages });
    }

    // Get all conversations for user (last message per conversation)
    const sent = await base44.entities.MessageChat.filter({ sender_email: user.email }, '-created_date', 200);
    const received = await base44.entities.MessageChat.filter({ receiver_email: user.email }, '-created_date', 200);

    const allMessages = [...sent, ...received];
    const convMap = {};
    for (const m of allMessages) {
      const cid = m.conversation_id;
      if (!convMap[cid] || new Date(m.created_date) > new Date(convMap[cid].created_date)) {
        convMap[cid] = m;
      }
    }

    const conversations = Object.values(convMap).map(m => {
      const otherEmail = m.sender_email === user.email ? m.receiver_email : m.sender_email;
      const otherName = m.sender_email === user.email ? m.receiver_email : m.sender_name;
      const unreadCount = allMessages.filter(msg =>
        msg.conversation_id === m.conversation_id &&
        !msg.read &&
        msg.receiver_email === user.email
      ).length;
      return {
        conversation_id: m.conversation_id,
        other_email: otherEmail,
        other_name: otherName,
        other_avatar: m.sender_email === user.email ? null : m.sender_avatar,
        last_message: m.content,
        last_date: m.created_date,
        unread: unreadCount,
      };
    });

    conversations.sort((a, b) => new Date(b.last_date) - new Date(a.last_date));
    return Response.json({ conversations });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});