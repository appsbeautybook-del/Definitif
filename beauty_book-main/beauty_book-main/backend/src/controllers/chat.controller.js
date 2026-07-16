import { supabaseAdmin } from '../config/supabase.js';

// getMessages
export const getMessages = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { conversation_id } = req.body;

    if (conversation_id) {
      const { data: messages, error } = await supabaseAdmin.from('MessageChat')
        .select('*')
        .eq('conversation_id', conversation_id)
        .order('created_date', { ascending: true }) // changed to ascending for chronological order in UI
        .limit(100);

      if (error) throw error;

      // Mark as read
      if (messages && messages.length > 0) {
        const unreadIds = messages.filter(m => !m.read && m.receiver_email === user.email).map(m => m.id);
        if (unreadIds.length > 0) {
          await supabaseAdmin.from('MessageChat').update({ read: true }).in('id', unreadIds);
        }
      }
      return res.json({ messages: messages || [] });
    }

    // Get all conversations for user (last message per conversation)
    const { data: sent, error: sentError } = await supabaseAdmin.from('MessageChat')
      .select('*').eq('sender_email', user.email).order('created_date', { ascending: false }).limit(200);
      
    const { data: received, error: recvError } = await supabaseAdmin.from('MessageChat')
      .select('*').eq('receiver_email', user.email).order('created_date', { ascending: false }).limit(200);

    const allMessages = [...(sent || []), ...(received || [])];
    const convMap = {};
    for (const m of allMessages) {
      const cid = m.conversation_id;
      if (!convMap[cid] || new Date(m.created_date) > new Date(convMap[cid].created_date)) {
        convMap[cid] = m;
      }
    }

    const conversations = Object.values(convMap).map(m => {
      const otherEmail = m.sender_email === user.email ? m.receiver_email : m.sender_email;
      const otherName = m.sender_email === user.email ? m.receiver_name : m.sender_name;
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
    return res.json({ conversations });
  } catch (error) {
    console.error('getMessages error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// sendMessage
export const sendMessage = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { receiver_email, content, conversation_id, type = "text", media_url } = req.body;

    if (!receiver_email || !content) {
      return res.status(400).json({ error: 'receiver_email et content requis' });
    }

    const convId = conversation_id || [user.email, receiver_email].sort().join('_');
    const senderName = user.user_metadata?.nom ? `${user.user_metadata.prenom || ''} ${user.user_metadata.nom}` : user.email;
    const senderAvatar = user.user_metadata?.avatar_url || null;

    let receiverName = receiver_email;
    let receiverAvatar = null;
    
    // Check Profiles for receiver
    const { data: receiverProfile } = await supabaseAdmin.from('profiles').select('*').eq('email', receiver_email).single();
    if (receiverProfile) {
      receiverName = `${receiverProfile.prenom || ''} ${receiverProfile.nom || ''}`.trim() || receiverName;
      receiverAvatar = receiverProfile.avatar_url || receiverAvatar;
    }
    
    // Check ProfilPro for receiver
    const { data: profilPro } = await supabaseAdmin.from('ProfilPro').select('*').eq('user_email', receiver_email).single();
    if (profilPro) {
      receiverName = profilPro.salon_name || receiverName;
      receiverAvatar = profilPro.avatar_url || receiverAvatar;
    }

    const { data: message, error: insertError } = await supabaseAdmin.from('MessageChat').insert({
      conversation_id: convId,
      sender_email: user.email,
      sender_name: senderName,
      sender_avatar: senderAvatar,
      receiver_email,
      receiver_name: receiverName,
      receiver_avatar: receiverAvatar,
      content,
      type,
      media_url,
      read: false,
    }).select().single();

    if (insertError) throw insertError;

    // Sender role
    let senderRole = null;
    let senderIsPro = false;
    const { data: senderProf } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (senderProf) senderRole = senderProf.role;
    
    const { data: senderProCheck } = await supabaseAdmin.from('ProfilPro').select('id').eq('user_email', user.email).limit(1);
    senderIsPro = senderProCheck && senderProCheck.length > 0;

    // Push notification to receiver
    await supabaseAdmin.from('Notification').insert({
      user_email: receiver_email,
      type: "message",
      title: `Message de ${senderName}`,
      body: content.length > 60 ? content.slice(0, 60) + '...' : content,
      link: `/messages?to=${user.email}&name=${encodeURIComponent(senderName)}`,
      read: false,
      data: {
        conversation_id: convId,
        sender_email: user.email,
        sender_name: senderName,
        sender_role: senderRole || (senderIsPro ? "pro" : "client"),
        is_admin: senderRole === "admin",
        is_pro: senderIsPro,
      },
    });

    return res.json({ message, conversation_id: convId, success: true });
  } catch (error) {
    console.error("sendMessage error:", error);
    return res.status(500).json({ error: error.message });
  }
};
