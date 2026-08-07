import { getOpenRouterKey } from '../_lib/config.js';

const PEXELS_API_KEY = process.env.PEXELS_API_KEY || '';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { query, limit = 8 } = req.body;

  if (!query) return res.status(400).json({ error: 'Query is required' });

  try {
    let images = [];

    if (PEXELS_API_KEY) {
      const pexelsRes = await fetch(
        `https://api.pexels.com/v1/search?query=${encodeURIComponent(query + ' beauty hairstyle nail makeup')}&per_page=${limit}&orientation=square`,
        { headers: { Authorization: PEXELS_API_KEY } }
      );
      if (pexelsRes.ok) {
        const pexelsData = await pexelsRes.json();
        images = (pexelsData.photos || []).map(p => ({
          url: p.src.large2x || p.src.large || p.src.medium,
          thumb: p.src.medium,
          photographer: p.photographer,
          alt: p.alt || query,
          pexels_url: p.url,
        }));
      }
    }

    if (images.length === 0) {
      const unsplashRes = await fetch(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query + ' beauty')}&per_page=${limit}&orientation=squarish`,
        { headers: { Authorization: 'Client-ID SvKv5dHGBWlXJS2Jd6T74M34oQw7hLhVVv6rJwNHqo0' } }
      ).catch(() => null);
      if (unsplashRes?.ok) {
        const unsplashData = await unsplashRes.json();
        images = (unsplashData.results || []).map(p => ({
          url: p.urls.regular || p.urls.full,
          thumb: p.urls.small,
          photographer: p.user?.name || 'Unsplash',
          alt: p.alt_description || query,
          unsplash_url: p.links?.html,
        }));
      }
    }

    if (images.length === 0) {
      for (let i = 1; i <= Math.min(limit, 6); i++) {
        images.push({
          url: `https://picsum.photos/seed/${encodeURIComponent(query)}${i}/400/400`,
          thumb: `https://picsum.photos/seed/${encodeURIComponent(query)}${i}/200/200`,
          photographer: 'Picsum',
          alt: query,
        });
      }
    }

    const OPENROUTER_KEY = getOpenRouterKey();
    let styleInfo = null;

    if (OPENROUTER_KEY) {
      const aiRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENROUTER_KEY}`,
          'HTTP-Referer': 'https://definitif-beta.vercel.app',
          'X-Title': 'BeautyBook Style Search',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: `Tu es un expert beauté. Pour la recherche "${query}", génère un style beauté unique.
Retourne UNIQUEMENT ce JSON (sans markdown, sans texte avant/après) :
{
  "title": "Nom du style (ex: Box Braids Jumbo)",
  "category": "Catégorie parmi: Coiffure, Maquillage, Ongles, Soins, Barbe, Massage, Spa & Bien-être, Épilation",
  "subcategory": "Sous-catégorie pertinente",
  "description": "Description professionalle de 2-3 lignes sur ce style, ses avantages, et son technique",
  "temps_moyen": "Durée moyenne (ex: 2h30)",
  "niveau_difficulte": "Débutant ou Intermédiaire ou Avancé ou Expert",
  "type_cheveux": "Type de cheveux si applicable (Afro, Européenne, etc) ou vide",
  "type_peau": "Type de peau si applicable (Normale, Sèche, etc) ou vide",
  "outils_utilises": ["Outil 1", "Outil 2", "Outil 3"],
  "tags": ["tag1", "tag2", "tag3"]
}`
          }],
          temperature: 0.7,
          max_tokens: 512,
        }),
      });

      if (aiRes.ok) {
        const aiData = await aiRes.json();
        const content = aiData?.choices?.[0]?.message?.content || '';
        try {
          const cleaned = content.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
          styleInfo = JSON.parse(cleaned);
        } catch {}
      }
    }

    if (!styleInfo) {
      const q = query.toLowerCase();
      let category = 'Coiffure';
      let subcategory = 'Style';
      if (q.includes('ongl') || q.includes('nail') || q.includes('gel') || q.includes('manucure')) { category = 'Ongles'; subcategory = 'Manucure'; }
      else if (q.includes('maquill') || q.includes('makeup') || q.includes('eye') || q.includes('lip')) { category = 'Maquillage'; subcategory = 'Maquillage visage'; }
      else if (q.includes('soin') || q.includes('peel') || q.includes('hydrat')) { category = 'Soins'; subcategory = 'Soins visage'; }
      else if (q.includes('barbe') || q.includes('ras') || q.includes('beard')) { category = 'Barbe'; subcategory = 'Taille barbe'; }
      else if (q.includes('massag') || q.includes('spa') || q.includes('hammam')) { category = 'Massage'; subcategory = 'Massage relaxant'; }
      else if (q.includes('épil') || q.includes('wax') || q.includes('cire')) { category = 'Épilation'; subcategory = 'Cire chaude'; }

      styleInfo = {
        title: query.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        category,
        subcategory,
        description: `Style beauté professionnel : ${query}. Technique tendance et résultats garantis.`,
        temps_moyen: '1h - 2h',
        niveau_difficulte: 'Intermédiaire',
        type_cheveux: '',
        type_peau: '',
        outils_utilises: [],
        tags: query.split(' '),
      };
    }

    return res.status(200).json({
      style: styleInfo,
      images: images.slice(0, 8),
      source: images[0]?.pexels_url || images[0]?.unsplash_url || 'picsum',
    });

  } catch (err) {
    console.error('[api/ai/search-styles] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
}
