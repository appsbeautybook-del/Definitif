import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

// ── Facebook / Instagram (Meta Graph API) ──────────────────────────────────
const META_APP_ID = process.env.META_APP_ID || '';
const META_APP_SECRET = process.env.META_APP_SECRET || '';
const META_REDIRECT_URI = process.env.META_REDIRECT_URI || 'https://continent-success-queries-ant.trycloudflare.com/auth/callback';

// Facebook OAuth
router.get('/facebook/auth', requireAuth, (req, res) => {
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}&scope=pages_manage_metadata,pages_messaging,instagram_basic,instagram_manage_messages&state=facebook_${req.user.email}`;
  res.json({ url });
});

// Facebook callback
router.get('/facebook/callback', async (req, res) => {
  const { code, state } = req.query;
  const userEmail = state?.replace('facebook_', '');
  if (!code || !userEmail) return res.status(400).json({ error: 'Missing code or state' });

  try {
    // Exchange code for access token
    const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}&code=${code}`);
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error.message);

    // Get user pages
    const pagesRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${tokenData.access_token}`);
    const pagesData = await pagesRes.json();

    // Save connection
    await supabaseAdmin.from('SocialConnections').upsert({
      user_email: userEmail,
      platform: 'facebook',
      access_token: tokenData.access_token,
      page_id: pagesData.data?.[0]?.id,
      page_name: pagesData.data?.[0]?.name,
      connected_at: new Date().toISOString(),
    });

    res.redirect('/social-media?connected=facebook');
  } catch (e) {
    console.error('[Facebook Auth]', e);
    res.redirect('/social-media?error=facebook');
  }
});

// Instagram OAuth (via Facebook)
router.get('/instagram/auth', requireAuth, (req, res) => {
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}&scope=instagram_basic,instagram_manage_messages,instagram_manage_comments&state=instagram_${req.user.email}`;
  res.json({ url });
});

// ── TikTok ─────────────────────────────────────────────────────────────────
const TIKTOK_CLIENT_KEY = process.env.TIKTOK_CLIENT_KEY || '';
const TIKTOK_CLIENT_SECRET = process.env.TIKTOK_CLIENT_SECRET || '';
const TIKTOK_REDIRECT_URI = process.env.TIKTOK_REDIRECT_URI || 'https://continent-success-queries-ant.trycloudflare.com/auth/callback';

router.get('/tiktok/auth', requireAuth, (req, res) => {
  const url = `https://www.tiktok.com/auth/authorize/?client_key=${TIKTOK_CLIENT_KEY}&response_type=code&scope=user.info.basic,video.list,video.publish&redirect_uri=${encodeURIComponent(TIKTOK_REDIRECT_URI)}&state=tiktok_${req.user.email}`;
  res.json({ url });
});

router.get('/tiktok/callback', async (req, res) => {
  const { code, state } = req.query;
  const userEmail = state?.replace('tiktok_', '');
  if (!code || !userEmail) return res.status(400).json({ error: 'Missing code' });

  try {
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: TIKTOK_CLIENT_KEY,
        client_secret: TIKTOK_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: TIKTOK_REDIRECT_URI,
      }),
    });
    const tokenData = await tokenRes.json();
    if (tokenData.error) throw new Error(tokenData.error_description);

    // Get user info
    const userRes = await fetch('https://open.tiktokapis.com/v2/user/info/?fields=display_name,avatar_url,username', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` },
    });
    const userData = await userRes.json();

    await supabaseAdmin.from('SocialConnections').upsert({
      user_email: userEmail,
      platform: 'tiktok',
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      handle: userData.data?.user?.username || '@tiktok',
      display_name: userData.data?.user?.display_name,
      avatar_url: userData.data?.user?.avatar_url,
      connected_at: new Date().toISOString(),
    });

    res.redirect('/social-media?connected=tiktok');
  } catch (e) {
    console.error('[TikTok Auth]', e);
    res.redirect('/social-media?error=tiktok');
  }
});

// ── WhatsApp Business ──────────────────────────────────────────────────────
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN || '';
const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID || '';
const WHATSAPP_VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'beautybook_whatsapp_verify';

router.get('/whatsapp/auth', requireAuth, (req, res) => {
  // WhatsApp Business utilise le flux Meta
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}&scope=whatsapp_business_management,whatsapp_business_messaging&state=whatsapp_${req.user.email}`;
  res.json({ url });
});

// WhatsApp Webhook (pour recevoir les messages)
router.get('/whatsapp/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post('/whatsapp/webhook', async (req, res) => {
  const body = req.body;
  if (body.object !== 'whatsapp_business_account') return res.sendStatus(404);

  try {
    for (const entry of body.entry || []) {
      for (const change of entry.changes || []) {
        if (change.field === 'messages') {
          const messages = change.value?.messages || [];
          for (const msg of messages) {
            // Traiter le message avec Maria AI
            const phone = msg.from;
            const text = msg.text?.body || '';

            if (text) {
              // Générer une réponse IA
              const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
                },
                body: JSON.stringify({
                  model: 'nvidia/nemotron-3-super-120b-a12b:free',
                  messages: [
                    { role: 'system', content: 'Tu es Maria, l\'assistante beauté de BeautyBook. Réponds de manière chaleureuse et professionnelle. Sois concise (2-3 phrases).' },
                    { role: 'user', content: text },
                  ],
                  max_tokens: 256,
                }),
              });
              const aiData = await aiRes.json();
              const reply = aiData.choices?.[0]?.message?.content || 'Merci pour votre message !';

              // Envoyer la réponse via WhatsApp API
              await fetch(`https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  messaging_product: 'whatsapp',
                  to: phone,
                  type: 'text',
                  text: { body: reply },
                }),
              });

              // Sauvegarder la conversation
              await supabaseAdmin.from('SocialMessages').insert({
                platform: 'whatsapp',
                from: phone,
                message: text,
                reply,
                timestamp: new Date().toISOString(),
              });
            }
          }
        }
      }
    }
  } catch (e) {
    console.error('[WhatsApp Webhook]', e);
  }

  res.sendStatus(200);
});

// ── Messenger (Facebook) ───────────────────────────────────────────────────
router.get('/messenger/auth', requireAuth, (req, res) => {
  const url = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(META_REDIRECT_URI)}&scope=pages_messaging,pages_manage_metadata&state=messenger_${req.user.email}`;
  res.json({ url });
});

// Messenger Webhook
router.get('/messenger/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === 'beautybook_messenger_verify') {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

router.post('/messenger/webhook', async (req, res) => {
  const body = req.body;
  if (body.object !== 'page') return res.sendStatus(404);

  try {
    for (const entry of body.entry || []) {
      for (const event of entry.messaging || []) {
        if (event.message?.text) {
          const senderId = event.sender.id;
          const text = event.message.text;

          // Générer une réponse IA
          const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
            },
            body: JSON.stringify({
              model: 'nvidia/nemotron-3-super-120b-a12b:free',
              messages: [
                { role: 'system', content: 'Tu es Maria, l\'assistante beauté de BeautyBook. Réponds de manière chaleureuse et professionnelle. Sois concise.' },
                { role: 'user', content: text },
              ],
              max_tokens: 256,
            }),
          });
          const aiData = await aiRes.json();
          const reply = aiData.choices?.[0]?.message?.content || 'Merci pour votre message !';

          // Envoyer la réponse via Messenger Send API
          const { data: conn } = await supabaseAdmin
            .from('SocialConnections')
            .select('access_token, page_id')
            .eq('platform', 'messenger')
            .single();

          if (conn?.access_token && conn?.page_id) {
            await fetch(`https://graph.facebook.com/v18.0/me/messages?access_token=${conn.access_token}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                recipient: { id: senderId },
                message: { text: reply },
              }),
            });
          }

          await supabaseAdmin.from('SocialMessages').insert({
            platform: 'messenger',
            from: senderId,
            message: text,
            reply,
            timestamp: new Date().toISOString(),
          });
        }
      }
    }
  } catch (e) {
    console.error('[Messenger Webhook]', e);
  }

  res.sendStatus(200);
});

// ── Statistiques ───────────────────────────────────────────────────────────
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const userEmail = req.user.email;

    // Récupérer les stats des 30 derniers jours
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: messages } = await supabaseAdmin
      .from('SocialMessages')
      .select('*')
      .eq('user_email', userEmail)
      .gte('timestamp', thirtyDaysAgo);

    const { data: connections } = await supabaseAdmin
      .from('SocialConnections')
      .select('*')
      .eq('user_email', userEmail);

    // Calculer les stats
    const totalMessages = messages?.length || 0;
    const totalReplies = messages?.filter(m => m.reply)?.length || 0;
    const platforms = connections?.map(c => c.platform) || [];

    // Messages par jour (derniers 7 jours)
    const messagesByDay = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().split('T')[0];
      const count = messages?.filter(m => m.timestamp?.startsWith(dateStr))?.length || 0;
      messagesByDay.push({ date: dateStr, count });
    }

    // Messages par plateforme
    const byPlatform = {};
    messages?.forEach(m => {
      byPlatform[m.platform] = (byPlatform[m.platform] || 0) + 1;
    });

    // Taux de réponse
    const responseRate = totalMessages > 0 ? Math.round((totalReplies / totalMessages) * 100) : 0;

    // Temps de réponse moyen (simulé)
    const avgResponseTime = totalReplies > 0 ? '< 2 min' : 'N/A';

    return res.json({
      totalMessages,
      totalReplies,
      responseRate,
      avgResponseTime,
      platforms,
      messagesByDay,
      byPlatform,
      period: '30 jours',
    });
  } catch (e) {
    console.error('[Stats]', e);
    return res.status(500).json({ error: e.message });
  }
});

// ── Déconnexion ────────────────────────────────────────────────────────────
router.delete('/disconnect/:platform', requireAuth, async (req, res) => {
  try {
    await supabaseAdmin
      .from('SocialConnections')
      .delete()
      .eq('user_email', req.user.email)
      .eq('platform', req.params.platform);

    return res.json({ success: true });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Liste des connexions ───────────────────────────────────────────────────
router.get('/connections', requireAuth, async (req, res) => {
  try {
    const { data } = await supabaseAdmin
      .from('SocialConnections')
      .select('platform, handle, display_name, connected_at')
      .eq('user_email', req.user.email);

    return res.json({ connections: data || [] });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

export default router;
