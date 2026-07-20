import { supabase } from '@/api/supabaseClient';

export const likesApi = {
  async addLike(userEmail, targetId, targetType = 'reel', userName = '', userAvatar = '') {
    // Supprimer d'abord pour éviter le duplicate key, puis réinsérer
    await supabase.from('user_like')
      .delete()
      .eq('user_email', userEmail)
      .eq('target_id', String(targetId))
      .eq('target_type', targetType);

    const { error } = await supabase.from('user_like').insert({
      user_email: userEmail,
      target_id: String(targetId),
      target_type: targetType,
      user_name: userName || '',
      user_avatar: userAvatar || '',
    });
    if (error) console.error('[likesApi] addLike error:', error.message);
    return { success: true };
  },

  async removeLike(userEmail, targetId, targetType = 'reel') {
    const { error } = await supabase.from('user_like')
      .delete()
      .eq('user_email', userEmail)
      .eq('target_id', String(targetId))
      .eq('target_type', targetType);
    if (error) throw error;
    return { success: true };
  },

  async getLikeCounts(targetIds, targetType = 'reel') {
    if (!targetIds || targetIds.length === 0) return {};
    const counts = {};
    targetIds.forEach(id => { counts[String(id)] = 0; });
    try {
      const { data, error } = await supabase.from('user_like')
        .select('target_id')
        .in('target_id', targetIds.map(String))
        .eq('target_type', targetType);
      if (!error && data) {
        data.forEach(row => {
          counts[row.target_id] = (counts[row.target_id] || 0) + 1;
        });
      }
    } catch (e) {
      console.error('[likesApi] getLikeCounts error:', e);
    }
    return counts;
  },

  async getUserLikes(userEmail, targetIds, targetType = 'reel') {
    if (!userEmail || !targetIds || targetIds.length === 0) return [];
    try {
      const { data } = await supabase.from('user_like')
        .select('target_id')
        .eq('user_email', userEmail)
        .in('target_id', targetIds.map(String))
        .eq('target_type', targetType);
      return data || [];
    } catch { return []; }
  },

  async getUserLikesAll(userEmail, targetType) {
    if (!userEmail) return [];
    try {
      let query = supabase.from('user_like').select('target_id, target_type').eq('user_email', userEmail);
      if (targetType) query = query.eq('target_type', targetType);
      const { data } = await query;
      return data || [];
    } catch { return []; }
  },
};
