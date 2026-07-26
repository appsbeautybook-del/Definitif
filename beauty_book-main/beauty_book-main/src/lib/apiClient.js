import { supabase } from '../api/supabaseClient';
import { clientSendVerificationCode, clientVerifyCode } from './clientOtp';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || '';

function isBackendAvailable() {
  return !window.location.hostname.includes('vercel.app');
}

export const apiClient = {
  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },
  
  async post(endpoint, body) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  async put(endpoint, body) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  async request(endpoint, options = {}) {
    const { data: { session } } = await supabase.auth.getSession();
    
    const headers = {
      'Content-Type': 'application/json',
      ...(session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { error: response.statusText };
      }
      throw new Error(errorData.error || 'API Request Failed');
    }

    return response.json();
  },

  async callFunction(functionName, payload = {}) {
    // ── AI functions: route ALL through /api/ai/maria (OpenRouter proxy) ──
    const aiFunctions = ['analyzePhoto', 'simulateHairstyle', 'shAiTryOn', 'shAiImageSearch', 'mariaAutoReply'];
    if (aiFunctions.includes(functionName)) {
      return this._callMariaAI(functionName, payload);
    }

    // Map old Base44 function names → new Express API routes
    const endpointMap = {
      // ----- Admin & Management (Phase 3) -----
      approvePro: { path: '/admin/approve-pro', method: 'POST' },
      adminCreateService: { path: '/admin/create-service', method: 'POST' },
      manageStyle: { path: '/admin/manage-style', method: 'POST' },
      manageReel: { path: '/v8/manage/reel', method: 'POST' },
      manageAnnonce: { path: '/admin/annonce', method: 'POST' },
      adminApi: { path: '/admin/api', method: 'POST' },
      deleteAccount: { path: '/account/delete', method: 'POST' },
      addFidelitePoints: { path: '/account/fidelite/add', method: 'POST' },
      creditFideliteAuto: { path: '/account/fidelite/auto', method: 'POST' },
      sendVerificationCode: { path: '/auth/send-verification-code', method: 'POST' },
      verifyCode: { path: '/auth/verify-code', method: 'POST' },
      adminLogin: { path: '/auth/admin/login', method: 'POST' },
      adminRegister: { path: '/auth/admin/register', method: 'POST' },
      vendeurLogin: { path: '/auth/vendeur/login', method: 'POST' },
      vendeurRegister: { path: '/auth/vendeur/register', method: 'POST' },
      placesAutocomplete: { path: '/maps/places-autocomplete', method: 'POST' },

      // --- Sellers / Pro (Phase 3) ---
      getProfilPro: { path: '/pro/profile/get', method: 'POST' },
      updateProfilPro: { path: '/pro/profile/update', method: 'POST' },

      // --- Reservations ---
      createReservation:           { path: '/reservations',          method: 'POST' },
      completeReservation:         { path: '/reservations/complete', method: 'POST' },
      getReservations:             { path: '/reservations/list',     method: 'POST' },
      updateReservation:           { path: `/reservations/${payload?.reservationId || ''}`, method: 'PUT' },
      sendReservationReminders:    { path: '/reservations/reminders',method: 'POST' },

      // --- Payments / Commerce ---
      createCheckoutSession:       { path: '/payments/checkout-session',      method: 'POST' },
      createSubscriptionCheckout:  { path: '/payments/subscription-checkout', method: 'POST' },
      createCommande:              { path: '/commandes',                       method: 'POST' },
      getCommandes:                { path: '/commandes/list',                  method: 'POST' },
      trackOrder:                  { path: '/commandes/track',                 method: 'POST' },

      // --- Cart ---
      getPanier:                   { path: '/cart', method: 'GET'  },
      updatePanier:                { path: '/cart', method: 'POST' },

      // --- Feed & Social (Phase 5) ---
      getHomeData: { path: '/feed/home', method: 'POST' },
      getReels: { path: '/feed/reels', method: 'POST' },
      likeReel: { path: '/feed/reels/like', method: 'POST' },
      searchMusic: { path: '/feed/music/search', method: 'POST' },
      
      // --- Content & Catalog (Phase 5) ---
      getStyles: { path: '/content/styles', method: 'POST' },
      getAnnonces: { path: '/content/annonces', method: 'POST' },
      getProduits: { path: '/content/produits', method: 'POST' },
      getImmobilier: { path: '/content/immobilier', method: 'POST' },

      // --- Communication (Phase 6) ---
      getMessages: { path: '/communication/messages/get', method: 'POST' },
      sendMessage: { path: '/communication/messages/send', method: 'POST' },
      getNotifications: { path: '/communication/notifications/get', method: 'POST' },
      markNotificationsRead: { path: '/communication/notifications/mark-read', method: 'POST' },

      // --- AI (routed via _callMariaAI above) ---
      mariaAgent: { path: '/api/ai/maria', method: 'POST' },

      stripeWebhook: { path: '/webhooks/stripe', method: 'POST' },
      shopifyProducts: { path: '/webhooks/shopify', method: 'POST' },
      muxLive: { path: '/webhooks/mux-live', method: 'POST' },

      // --- Phase 8 ---
      addFidelitePoints:          { path: '/v8/fidelite/add', method: 'POST' },
      creditFideliteAuto:         { path: '/v8/fidelite/auto-credit', method: 'POST' },
      createShopifyCheckout:      { path: '/v8/boutique/shopify-checkout', method: 'POST' },
      createSubscriptionCheckout: { path: '/v8/subscription/checkout', method: 'POST' },
      manageAnnonce:              { path: '/v8/manage/annonce', method: 'POST' },
      manageStyle:                { path: '/v8/manage/style', method: 'POST' },
      manageEntity:               { path: '/v8/manage/entity', method: 'POST' },
      deleteAccount:              { path: '/v8/account', method: 'DELETE' },
    };

    const route = endpointMap[functionName];
    if (!route) {
      console.warn(`[apiClient.callFunction] "${functionName}" not yet migrated — returning mock`);
      return { data: { success: true, message: `Mock for ${functionName}` } };
    }

    // Sur Vercel: OTP directement via Supabase côté client
    if (!isBackendAvailable()) {
      if (functionName === 'sendVerificationCode') {
        return this._sendOtpClient(payload);
      }
      if (functionName === 'verifyCode') {
        return this._verifyOtpClient(payload);
      }
    }

    const options = { method: route.method };

    let path = route.path;
    if (route.method === 'GET') {
      const params = new URLSearchParams(payload).toString();
      if (params) path += `?${params}`;
    } else {
      options.body = JSON.stringify(payload);
    }

    try {
      const result = await this.request(path, options);
      return { data: result };
    } catch (error) {
      console.error(`[apiClient.callFunction] Error calling "${functionName}":`, error);
      throw error;
    }
  },

  // ── Route all AI functions through /api/ai/maria ──
  async _callMariaAI(functionName, payload) {
    // Build task/payload mapping for backend routing
    const taskMap = {
      simulateHairstyle: (p) => ({
        task: 'simulate-hairstyle',
        payload: {
          userPhotoUrl: p.userPhotoUrl,
          styleTitle: p.styleTitle,
          referenceImages: p.referenceImages,
        },
        messages: [{
          role: 'user',
          content: [
            ...(p.userPhotoUrl && !p.userPhotoUrl.startsWith('data:') ? [{ type: 'image_url', image_url: { url: p.userPhotoUrl } }] : []),
            { type: 'text', text: `Analyse la coiffure "${p.styleTitle || ''}" pour cette photo.` }
          ]
        }],
        model: 'google/gemini-2.5-flash',
      }),
      analyzePhoto: (p) => ({
        task: 'analyze-photo',
        payload: {
          photoUrl: p.photoUrl,
          productName: p.productName,
        },
        messages: [{
          role: 'user',
          content: [
            ...(p.photoUrl && !p.photoUrl.startsWith('data:') ? [{ type: 'image_url', image_url: { url: p.photoUrl } }] : []),
            { type: 'text', text: `Analyse cette photo pour l'essayage virtuel. Vetement: ${p.productName || 'non precise'}` }
          ]
        }],
        model: 'google/gemini-2.5-flash',
      }),
      shAiTryOn: (p) => ({
        task: 'essayage-virtuel',
        payload: {
          userPhoto: p.user_photo,
          garmentPhoto: p.garment_photo,
          garmentName: p.garment_name,
          mode: p.mode,
        },
        messages: [{
          role: 'user',
          content: [
            ...(p.user_photo && !p.user_photo.startsWith('data:') ? [{ type: 'image_url', image_url: { url: p.user_photo } }] : []),
            ...(p.garment_photo && !p.garment_photo.startsWith('data:') ? [{ type: 'image_url', image_url: { url: p.garment_photo } }] : []),
            { type: 'text', text: `Analyse cet essayage virtuel. Vetement: ${p.garment_name || 'Non precise'}. Mode: ${p.mode || 'article'}` }
          ]
        }],
        model: 'google/gemini-2.5-flash',
      }),
      shAiImageSearch: (p) => ({
        messages: [{
          role: 'user',
          content: [
            ...(p.photoUrl && !p.photoUrl.startsWith('data:') ? [{ type: 'image_url', image_url: { url: p.photoUrl } }] : []),
            { type: 'text', text: `Recherche des vetements similaires a cette image.` }
          ]
        }],
        model: 'google/gemini-2.5-flash',
      }),
      mariaAutoReply: (p) => ({
        messages: p.messages || [{ role: 'user', content: p.text || 'Bonjour' }],
        model: p.model || 'google/gemini-2.5-flash',
      }),
    };

    const builder = taskMap[functionName];
    if (!builder) {
      return { data: { fallback: true, message: `Function ${functionName} not configured` } };
    }

    try {
      const body = builder(payload);
      const result = await this.request('/api/ai/maria', {
        method: 'POST',
        body: JSON.stringify({ ...body, temperature: 0.7, max_tokens: 2048 }),
      });

      const content = result?.choices?.[0]?.message?.content || '';
      if (result?.generatedImageUrl !== undefined || result?.result_url !== undefined || result?.has_person !== undefined) {
        return { data: result };
      }
      try {
        const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
        const parsed = JSON.parse(cleaned);
        return { data: parsed };
      } catch {
        return { data: { fallback: true, message: content || 'Analyse IA terminee.' } };
      }
    } catch (error) {
      console.error(`[apiClient._callMariaAI] Error for "${functionName}":`, error);
      return { data: { fallback: true, error: error.message } };
    }
  },

  async _sendOtpClient(payload) {
    const result = await clientSendVerificationCode(payload.email);
    return { data: result };
  },

  async _verifyOtpClient(payload) {
    const result = await clientVerifyCode(payload.key, payload.code);
    if (!result.valid) {
      return { data: { success: false, error: result.error } };
    }
    return { data: { success: true } };
  },
};

export { apiClient as default };
