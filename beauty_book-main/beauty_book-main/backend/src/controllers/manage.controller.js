import { supabaseAdmin } from '../config/supabase.js';

// Generic entity manager — allows admin CRUD on any allowed table via supabaseAdmin (bypasses RLS)
const ALLOWED_ENTITIES = [
  'Produit', 'Service', 'ProfilPro', 'Style', 'ImmobilierListing',
  'AppConfig', 'Annonce', 'Reel', 'Commande', 'Reservation',
  'LiveSession', 'Notification', 'MessageChat', 'CommentaireStyle',
  'PointsFidelite', 'PointsFidelitePro', 'DemandeProV2', 'User',
];

export const manageEntity = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Non authentifié' });

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { entity, action, id, data, filters = {}, orderBy, limit: lim } = req.body;

    if (!entity || !ALLOWED_ENTITIES.includes(entity)) {
      return res.status(400).json({ error: `Entité non autorisée: ${entity}` });
    }

    if (action === 'create') {
      const { data: result, error } = await supabaseAdmin.from(entity).insert(data).select().single();
      if (error) throw error;
      return res.json({ result });
    }

    if (action === 'update') {
      if (!id) return res.status(400).json({ error: 'ID requis' });
      const { data: result, error } = await supabaseAdmin.from(entity).update(data).eq('id', id).select().single();
      if (error) throw error;
      return res.json({ result });
    }

    if (action === 'delete') {
      if (!id) return res.status(400).json({ error: 'ID requis' });
      const { error } = await supabaseAdmin.from(entity).delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true });
    }

    if (action === 'get') {
      if (!id) return res.status(400).json({ error: 'ID requis' });
      const { data: result, error } = await supabaseAdmin.from(entity).select('*').eq('id', id).single();
      if (error) throw error;
      return res.json({ result });
    }

    if (action === 'list' || action === 'filter') {
      let query = supabaseAdmin.from(entity).select('*');
      // Apply filters
      for (const [key, value] of Object.entries(filters)) {
        if (value !== undefined && value !== null) {
          if (typeof value === 'object' && value.$in) {
            query = query.in(key, value.$in);
          } else if (typeof value === 'object' && value.$eq) {
            query = query.eq(key, value.$eq);
          } else if (typeof value === 'object' && value.$neq) {
            query = query.neq(key, value.$neq);
          } else if (typeof value === 'object' && value.$gt) {
            query = query.gt(key, value.$gt);
          } else if (typeof value === 'object' && value.$gte) {
            query = query.gte(key, value.$gte);
          } else if (typeof value === 'object' && value.$lt) {
            query = query.lt(key, value.$lt);
          } else if (typeof value === 'object' && value.$lte) {
            query = query.lte(key, value.$lte);
          } else {
            query = query.eq(key, value);
          }
        }
      }
      if (orderBy) {
        const [col, dir] = orderBy.startsWith('-') ? [orderBy.slice(1), false] : [orderBy, true];
        query = query.order(col, { ascending: dir });
      } else {
        query = query.order('created_at', { ascending: false });
      }
      query = query.limit(lim || 500);
      const { data: results, error } = await query;
      if (error) throw error;
      return res.json({ results: results || [] });
    }

    return res.status(400).json({ error: 'Action non reconnue' });
  } catch (error) {
    console.error('manageEntity error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Manage Annonces (admin only)
export const manageAnnonce = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Non authentifié' });

    // Check admin role from profiles
    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || profile.role !== 'admin') {
      return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
    }

    const { action, id, data } = req.body;

    if (action === 'create') {
      const { data: annonce, error } = await supabaseAdmin.from('Annonce').insert({
        ...data, status: data.status || 'actif', clicks: 0, impressions: 0,
      }).select().single();
      if (error) throw error;
      return res.json({ annonce });
    }

    if (action === 'update') {
      if (!id) return res.status(400).json({ error: 'ID requis' });
      const { data: annonce, error } = await supabaseAdmin.from('Annonce').update(data).eq('id', id).select().single();
      if (error) throw error;
      return res.json({ annonce });
    }

    if (action === 'delete') {
      if (!id) return res.status(400).json({ error: 'ID requis' });
      const { error } = await supabaseAdmin.from('Annonce').delete().eq('id', id);
      if (error) throw error;
      return res.json({ success: true });
    }

    if (action === 'list') {
      const { data: annonces, error } = await supabaseAdmin.from('Annonce').select('*').order('created_at', { ascending: false }).limit(100);
      if (error) throw error;
      return res.json({ annonces: annonces || [] });
    }

    return res.status(400).json({ error: 'Action non reconnue' });
  } catch (error) {
    console.error('manageAnnonce error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Manage Styles (admin or pro)
// Public endpoint — list published styles (no auth required)
export const listPublishedStyles = async (req, res) => {
  try {
    const { data: styles, error } = await supabaseAdmin
      .from('Style')
      .select('*')
      .eq('status', 'publie')
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) throw error;
    return res.json({ styles: styles || [] });
  } catch (error) {
    console.error('listPublishedStyles error:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Public endpoint — fix existing style statuses (admin-created but stuck as brouillon)
export const fixStyleStatuses = async (req, res) => {
  try {
    // Update all styles that have no images/title issues to publie
    const { data, error } = await supabaseAdmin
      .from('Style')
      .update({ status: 'publie' })
      .eq('status', 'brouillon')
      .select();
    if (error) throw error;
    return res.json({ updated: data?.length || 0 });
  } catch (error) {
    console.error('fixStyleStatuses error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const manageStyle = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Non authentifié' });

    const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', user.id).single();
    const isAdmin = profile?.role === 'admin';

    const { action, id, data } = req.body;

    if (action === 'create') {
      const styleData = {
        ...data,
        pro_email: isAdmin && data.pro_email ? data.pro_email : user.email,
        status: data.status || 'publie',
        likes: data.likes ?? 0,
        views: data.views ?? 0,
        featured: data.featured ?? false,
      };
      const { data: styles, error } = await supabaseAdmin.from('Style').insert(styleData).select();
      if (error) throw error;
      return res.json({ style: styles?.[0] || null });
    }

    if (action === 'update') {
      if (!id) return res.status(400).json({ error: 'ID requis' });
      const query = isAdmin
        ? supabaseAdmin.from('Style').update(data).eq('id', id)
        : supabaseAdmin.from('Style').update(data).eq('id', id).eq('pro_email', user.email);
      const { data: styles, error } = await query.select();
      if (error) throw error;
      return res.json({ style: styles?.[0] || null });
    }

    if (action === 'delete') {
      if (!id) return res.status(400).json({ error: 'ID requis' });
      const query = isAdmin
        ? supabaseAdmin.from('Style').delete().eq('id', id)
        : supabaseAdmin.from('Style').delete().eq('id', id).eq('pro_email', user.email);
      const { error } = await query;
      if (error) throw error;
      return res.json({ success: true });
    }

    if (action === 'list') {
      const filter = isAdmin ? {} : { pro_email: user.email };
      let query = supabaseAdmin.from('Style').select('*').order('created_at', { ascending: false }).limit(200);
      if (!isAdmin) query = query.eq('pro_email', user.email);
      const { data: styles, error } = await query;
      if (error) throw error;
      return res.json({ styles: styles || [] });
    }

    return res.status(400).json({ error: 'Action non reconnue' });
  } catch (error) {
    console.error('manageStyle error:', error);
    return res.status(500).json({ error: error.message });
  }
};

export const manageReel = async (req, res) => {
  try {
    const { action, id, data } = req.body;

    if (action === 'create') {
      // Strip unknown columns to avoid PostgREST schema cache errors
      let columns = null;
      try {
        const { data: sample } = await supabaseAdmin.from('Reel').select('*').limit(1);
        if (sample && sample.length > 0) columns = Object.keys(sample[0]);
      } catch {}
      let cleanData = data;
      if (columns) {
        cleanData = {};
        for (const k of Object.keys(data)) {
          if (columns.includes(k)) cleanData[k] = data[k];
        }
      }
      let { data: reels, error } = await supabaseAdmin.from('Reel').insert(cleanData).select();
      // Smart retry on schema cache errors
      let strippedCols = [];
      while (error && (error.message?.includes('schema cache') || error.code === 'PGRST204') && strippedCols.length < 10) {
        const match = error.message?.match(/(?:column ["'](\w+)["']|the ["'](\w+)["'] column)/);
        const badCol = match ? (match[1] || match[2]) : null;
        if (!badCol || strippedCols.includes(badCol)) break;
        strippedCols.push(badCol);
        columns = columns?.filter(c => !strippedCols.includes(c));
        if (!columns || columns.length === 0) break;
        cleanData = {};
        for (const k of Object.keys(data)) {
          if (columns.includes(k)) cleanData[k] = data[k];
        }
        ({ data: reels, error } = await supabaseAdmin.from('Reel').insert(cleanData).select());
      }
      if (error) throw error;
      return res.json({ reel: reels?.[0] || null });
    }

    if (action === 'update') {
      if (!id) return res.status(400).json({ error: 'ID requis' });
      // Strip unknown columns
      let columns = null;
      try {
        const { data: sample } = await supabaseAdmin.from('Reel').select('*').limit(1);
        if (sample && sample.length > 0) columns = Object.keys(sample[0]);
      } catch {}
      let cleanData = data;
      if (columns) {
        cleanData = {};
        for (const k of Object.keys(data)) {
          if (columns.includes(k)) cleanData[k] = data[k];
        }
      }
      let { data: reels, error } = await supabaseAdmin.from('Reel').update(cleanData).eq('id', id).select();
      let strippedCols = [];
      while (error && (error.message?.includes('schema cache') || error.code === 'PGRST204') && strippedCols.length < 10) {
        const match = error.message?.match(/(?:column ["'](\w+)["']|the ["'](\w+)["'] column)/);
        const badCol = match ? (match[1] || match[2]) : null;
        if (!badCol || strippedCols.includes(badCol)) break;
        strippedCols.push(badCol);
        columns = columns?.filter(c => !strippedCols.includes(c));
        if (!columns || columns.length === 0) break;
        cleanData = {};
        for (const k of Object.keys(data)) {
          if (columns.includes(k)) cleanData[k] = data[k];
        }
        ({ data: reels, error } = await supabaseAdmin.from('Reel').update(cleanData).eq('id', id).select());
      }
      if (error) throw error;
      return res.json({ reel: reels?.[0] || null });
    }

    if (action === 'delete') {
      if (!id) return res.status(400).json({ error: 'ID requis' });
      await supabaseAdmin.from('Reel').delete().eq('id', id);
      return res.json({ success: true });
    }

    return res.status(400).json({ error: 'Action non reconnue' });
  } catch (error) {
    console.error('manageReel error:', error);
    return res.status(500).json({ error: error.message });
  }
};
