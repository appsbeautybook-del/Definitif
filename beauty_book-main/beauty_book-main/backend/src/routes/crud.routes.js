import express from 'express';
import { crudCreate, crudUpdate, crudDelete, crudFilter, runMigrations, runMigration, columnCache } from '../controllers/crud.controller.js';
import { supabaseAdmin } from '../config/supabase.js';

const router = express.Router();

router.post('/create', crudCreate);
router.post('/update', crudUpdate);
router.post('/delete', crudDelete);
router.post('/filter', crudFilter);
router.post('/list', async (req, res) => {
  try {
    const { table, orderBy, limit = 500 } = req.body;
    if (!table) return res.status(400).json({ error: 'table required' });
    let query = supabaseAdmin.from(table).select('*').limit(limit);
    if (orderBy) {
      const desc = orderBy.startsWith('-');
      const column = desc ? orderBy.slice(1) : orderBy;
      query = query.order(column, { ascending: !desc });
    }
    let { data, error } = await query;
    if (error && orderBy) {
      query = supabaseAdmin.from(table).select('*').limit(limit);
      ({ data, error } = await query);
    }
    if (error) throw error;
    return res.json({ result: data || [] });
  } catch (error) {
    console.error('[crudList] Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
});
router.post('/migrate', runMigrations);
router.post('/exec-sql', runMigration);

// Force PostgREST schema reload
router.post('/reload-schema', async (req, res) => {
  try {
    columnCache.clear();
    // Try to trigger schema reload by doing a lightweight query
    const { error } = await supabaseAdmin.from('Style').select('id').limit(1);
    if (error) console.warn('[reload-schema] probe error:', error.message);
    return res.json({ success: true, message: 'Cache cleared. If still broken, go to Supabase Dashboard > SQL Editor and run: SELECT pg_notify(\'pgrst\', \'reload schema\');' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// Get actual DB columns for a table (bypass cache)
router.post('/schema', async (req, res) => {
  try {
    const { table } = req.body;
    if (!table) return res.status(400).json({ error: 'table required' });
    columnCache.delete(table);
    const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
    const cols = data && data.length > 0 ? Object.keys(data[0]) : [];
    return res.json({ columns: cols, hasData: cols.length > 0 });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ── Like endpoints (bypass RLS via supabaseAdmin) ──

// Add a like
router.post('/like', async (req, res) => {
  try {
    const { user_email, target_id, target_type = 'reel', user_name = '', user_avatar = '' } = req.body;
    if (!user_email || !target_id) return res.status(400).json({ error: 'user_email and target_id required' });

    // Check if already liked
    const { data: existing } = await supabaseAdmin.from('user_like')
      .select('id').eq('user_email', user_email).eq('target_id', target_id).eq('target_type', target_type).maybeSingle();

    if (existing) return res.json({ success: true, message: 'Already liked', id: existing.id });

    const { data, error } = await supabaseAdmin.from('user_like').insert({
      user_email, user_name, user_avatar, target_id, target_type,
    }).select().single();
    if (error) throw error;
    return res.json({ success: true, id: data.id });
  } catch (err) {
    console.error('[like] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Remove a like
router.post('/unlike', async (req, res) => {
  try {
    const { user_email, target_id, target_type = 'reel' } = req.body;
    if (!user_email || !target_id) return res.status(400).json({ error: 'user_email and target_id required' });

    const { error } = await supabaseAdmin.from('user_like')
      .delete().eq('user_email', user_email).eq('target_id', target_id).eq('target_type', target_type);
    if (error) throw error;
    return res.json({ success: true });
  } catch (err) {
    console.error('[unlike] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Count likes for a list of target_ids
router.post('/like-count', async (req, res) => {
  try {
    const { target_ids, target_type = 'reel' } = req.body;
    if (!target_ids || !Array.isArray(target_ids)) return res.status(400).json({ error: 'target_ids array required' });

    const { data, error } = await supabaseAdmin.from('user_like')
      .select('target_id').eq('target_type', target_type).in('target_id', target_ids);
    if (error) throw error;

    const counts = {};
    (data || []).forEach(l => { counts[l.target_id] = (counts[l.target_id] || 0) + 1; });
    target_ids.forEach(id => { if (!counts[id]) counts[id] = 0; });
    return res.json({ result: counts });
  } catch (err) {
    console.error('[like-count] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Check which target_ids the current user has liked
router.post('/user-likes', async (req, res) => {
  try {
    const { user_email, target_ids, target_type = 'reel' } = req.body;
    if (!user_email || !target_ids || !Array.isArray(target_ids)) return res.status(400).json({ error: 'user_email and target_ids array required' });

    const { data, error } = await supabaseAdmin.from('user_like')
      .select('target_id').eq('user_email', user_email).eq('target_type', target_type).in('target_id', target_ids);
    if (error) throw error;
    return res.json({ result: (data || []).map(l => l.target_id) });
  } catch (err) {
    console.error('[user-likes] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Get all likes for a user (optionally filtered by target_type)
router.post('/user-likes-all', async (req, res) => {
  try {
    const { user_email, target_type } = req.body;
    if (!user_email) return res.status(400).json({ error: 'user_email required' });

    let query = supabaseAdmin.from('user_like')
      .select('target_id, target_type').eq('user_email', user_email);
    if (target_type) query = query.eq('target_type', target_type);

    const { data, error } = await query;
    if (error) throw error;
    return res.json({ result: data || [] });
  } catch (err) {
    console.error('[user-likes-all] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// Produits publics — via supabaseAdmin
router.get('/products/public', async (req, res) => {
  try {
    const { status, tag, limit = 200 } = req.query;
    let query = supabaseAdmin.from('Produit').select('*').order('created_at', { ascending: false }).limit(parseInt(limit));
    if (status) query = query.eq('status', status);
    if (tag) query = query.contains('tags', [tag]);
    const { data, error } = await query;
    if (error) throw error;
    return res.json({ result: data || [] });
  } catch (err) {
    console.error('[products/public] Error:', err.message);
    return res.status(500).json({ error: err.message });
  }
});

export default router;
