import { supabaseAdmin } from '../config/supabase.js';

// GET /api/cart
export const getPanier = async (req, res) => {
  try {
    const user = req.user;
    const { data: userProfile } = await supabaseAdmin
      .from('profiles').select('email').eq('id', user.id).single();

    const { data: paniers } = await supabaseAdmin
      .from('Panier').select('*')
      .eq('user_email', userProfile?.email)
      .order('created_at', { ascending: false })
      .limit(1);

    const panier = paniers?.[0] || null;
    return res.json({ panier });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// POST /api/cart
export const updatePanier = async (req, res) => {
  try {
    const user = req.user;
    const { action, item } = req.body;
    // action: "add" | "remove" | "increment" | "decrement" | "clear"

    const { data: userProfile } = await supabaseAdmin
      .from('profiles').select('email').eq('id', user.id).single();
    const userEmail = userProfile?.email;

    const { data: paniers } = await supabaseAdmin
      .from('Panier').select('*').eq('user_email', userEmail).limit(1);

    let panier = paniers?.[0];

    if (!panier) {
      const { data: newPanier } = await supabaseAdmin
        .from('Panier').insert({ user_email: userEmail, items: [], total: 0 })
        .select().single();
      panier = newPanier;
    }

    let items = [...(panier.items || [])];

    if (action === 'add') {
      const existing = items.find(i => i.produit_id === item?.produit_id);
      if (existing) {
        existing.quantity = (existing.quantity || 1) + 1;
      } else {
        items.push({ ...item, quantity: 1 });
      }
    } else if (action === 'remove') {
      items = items.filter(i => i.produit_id !== item?.produit_id);
    } else if (action === 'increment') {
      const i = items.find(i => i.produit_id === item?.produit_id);
      if (i) i.quantity = (i.quantity || 1) + 1;
    } else if (action === 'decrement') {
      const i = items.find(i => i.produit_id === item?.produit_id);
      if (i) {
        i.quantity = Math.max(0, (i.quantity || 1) - 1);
        if (i.quantity === 0) items = items.filter(x => x.produit_id !== item?.produit_id);
      }
    } else if (action === 'clear') {
      items = [];
    }

    const total = items.reduce((sum, i) => sum + (i.price * (i.quantity || 1)), 0);

    const { data: updatedPanier, error } = await supabaseAdmin
      .from('Panier')
      .update({ items, total: Math.round(total * 100) / 100 })
      .eq('id', panier.id)
      .select().single();

    if (error) return res.status(500).json({ error: error.message });
    return res.json({ panier: updatedPanier, success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
