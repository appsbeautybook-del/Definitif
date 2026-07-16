import { supabaseAdmin } from '../config/supabase.js';

// getNotifications
export const getNotifications = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: notifications, error } = await supabaseAdmin.from('Notification')
      .select('*')
      .eq('user_email', user.email)
      .order('created_date', { ascending: false })
      .limit(50);

    if (error) throw error;

    const unread = (notifications || []).filter(n => !n.read).length;
    return res.json({ notifications: notifications || [], unread });
  } catch (error) {
    console.error('getNotifications error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// markNotificationsRead
export const markNotificationsRead = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { notificationId } = req.body;

    if (notificationId) {
      const { error } = await supabaseAdmin.from('Notification').update({ read: true }).eq('id', notificationId);
      if (error) throw error;
    } else {
      const { data: unread, error: fetchError } = await supabaseAdmin.from('Notification')
        .select('id')
        .eq('user_email', user.email)
        .eq('read', false);
        
      if (fetchError) throw fetchError;

      if (unread && unread.length > 0) {
        const ids = unread.map(n => n.id);
        const { error: updateError } = await supabaseAdmin.from('Notification').update({ read: true }).in('id', ids);
        if (updateError) throw updateError;
      }
    }

    return res.json({ success: true });
  } catch (error) {
    console.error('markNotificationsRead error:', error);
    return res.status(500).json({ error: error.message });
  }
};
