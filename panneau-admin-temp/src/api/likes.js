import { apiClient } from '@/lib/apiClient';

async function post(path, body) {
  return await apiClient.post(path, body);
}

export const likesApi = {
  async addLike(userEmail, targetId, targetType = 'reel', userName = '', userAvatar = '') {
    return post('/crud/like', {
      user_email: userEmail,
      target_id: String(targetId),
      target_type: targetType,
      user_name: userName,
      user_avatar: userAvatar,
    });
  },

  async removeLike(userEmail, targetId, targetType = 'reel') {
    return post('/crud/unlike', {
      user_email: userEmail,
      target_id: String(targetId),
      target_type: targetType,
    });
  },

  async getLikeCounts(targetIds, targetType = 'reel') {
    if (!targetIds || targetIds.length === 0) return {};
    const { result } = await post('/crud/like-count', {
      target_ids: targetIds.map(String),
      target_type: targetType,
    });
    return result || {};
  },

  async getUserLikes(userEmail, targetIds, targetType = 'reel') {
    if (!userEmail || !targetIds || targetIds.length === 0) return [];
    const { result } = await post('/crud/user-likes', {
      user_email: userEmail,
      target_ids: targetIds.map(String),
      target_type: targetType,
    });
    return result || [];
  },

  async getUserLikesAll(userEmail, targetType) {
    if (!userEmail) return [];
    const { result } = await post('/crud/user-likes-all', {
      user_email: userEmail,
      target_type: targetType || undefined,
    });
    return result || [];
  },
};
