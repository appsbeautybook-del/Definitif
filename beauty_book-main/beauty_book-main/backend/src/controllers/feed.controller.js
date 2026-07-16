import { supabaseAdmin } from '../config/supabase.js';

// getHomeData
export const getHomeData = async (req, res) => {
  try {
    // Fetch data in parallel
    const [stylesRes, servicesRes, annoncesRes, reelsRes, produitsRes, immobilierRes] = await Promise.all([
      supabaseAdmin.from('Style').select('*').eq('status', 'publie').order('likes', { ascending: false }).limit(6),
      supabaseAdmin.from('Service').select('*').eq('status', 'actif').eq('featured', true).order('created_date', { ascending: false }).limit(4),
      supabaseAdmin.from('Annonce').select('*').eq('status', 'actif').eq('type', 'banner').order('created_date', { ascending: false }).limit(3),
      supabaseAdmin.from('Reel').select('*').eq('status', 'publie').order('views', { ascending: false }).limit(4),
      supabaseAdmin.from('Produit').select('*').eq('status', 'actif').eq('featured', true).order('created_date', { ascending: false }).limit(4),
      supabaseAdmin.from('ImmobilierListing').select('*').eq('status', 'actif').eq('disponible', true).order('created_date', { ascending: false }).limit(2),
    ]);

    return res.json({
      styles: stylesRes.data || [],
      services: servicesRes.data || [],
      annonces: annoncesRes.data || [],
      reels: reelsRes.data || [],
      produits: produitsRes.data || [],
      immobilier: immobilierRes.data || []
    });
  } catch (error) {
    console.error('getHomeData error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// getReels
export const getReels = async (req, res) => {
  try {
    const { category, limit = 20 } = req.body;

    let query = supabaseAdmin.from('Reel').select('*').eq('status', 'publie');
    
    if (category && category !== "Réels") {
      query = query.eq('category', category);
    }
    
    const { data: reels, error } = await query.order('created_date', { ascending: false }).limit(limit);

    if (error) throw error;

    return res.json({ reels: reels || [] });
  } catch (error) {
    console.error('getReels error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// likeReel
export const likeReel = async (req, res) => {
  try {
    // We expect the user to be authenticated via requireAuth middleware, so req.user exists
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const { reelId, liked } = req.body;
    if (!reelId) return res.status(400).json({ error: 'reelId requis' });

    const { data: reel, error: fetchError } = await supabaseAdmin.from('Reel').select('*').eq('id', reelId).single();
    
    if (fetchError || !reel) return res.status(404).json({ error: 'Reel introuvable' });

    const newLikes = liked ? (reel.likes || 0) + 1 : Math.max(0, (reel.likes || 0) - 1);
    
    const { error: updateError } = await supabaseAdmin.from('Reel').update({ likes: newLikes }).eq('id', reelId);
    
    if (updateError) throw updateError;

    return res.json({ likes: newLikes, success: true });
  } catch (error) {
    console.error('likeReel error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// searchMusic
export const searchMusic = async (req, res) => {
  try {
    const { query = "beauty pop", limit = 25 } = req.body;

    const q = encodeURIComponent(query);
    const url = `https://itunes.apple.com/search?term=${q}&media=music&entity=song&limit=${limit}&explicit=No`;

    const itunesRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" }
    });

    if (!itunesRes.ok) {
      return res.json({ results: [] });
    }

    const data = await itunesRes.json();

    const mapped = (data.results || []).map(track => ({
      id: track.trackId,
      title: track.trackName,
      artist: track.artistName,
      album: track.collectionName,
      duration: track.trackTimeMillis
        ? `${Math.floor(track.trackTimeMillis / 60000)}:${String(Math.floor((track.trackTimeMillis % 60000) / 1000)).padStart(2, "0")}`
        : "--:--",
      genre: track.primaryGenreName || "Musique",
      artwork: track.artworkUrl60,
      previewUrl: track.previewUrl || null,
    }));

    return res.json({ results: mapped });
  } catch (error) {
    console.error("searchMusic error:", error.message);
    return res.json({ results: [] });
  }
};
