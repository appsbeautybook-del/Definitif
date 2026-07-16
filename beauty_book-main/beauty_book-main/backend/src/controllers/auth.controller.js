import { supabaseAdmin } from '../config/supabase.js';
import pgClient from '../config/pg.js';

export const sendVerificationCode = async (req, res) => {
  try {
    const { mode, email, phone } = req.body;

    if (mode === 'email' && email) {
      const { error } = await supabaseAdmin.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });

      if (error) {
        console.error('[OTP] Supabase error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }

      console.log('[OTP] Email OTP sent to:', email);
      return res.json({ success: true, email_sent: true });
    }

    if (mode === 'phone' && phone) {
      const { error } = await supabaseAdmin.auth.signInWithOtp({
        phone,
        options: { shouldCreateUser: true },
      });
      if (error) {
        console.error('[OTP] Phone error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }
      console.log('[OTP] Phone SMS sent to:', phone);
      return res.json({ success: true, email_sent: false });
    }

    return res.status(400).json({ success: false, error: 'Email or phone required' });
  } catch (error) {
    console.error('[OTP] ERREUR:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { key, code } = req.body;

    if (!key || !code) {
      return res.status(400).json({ success: false, error: 'Clé et code requis' });
    }

    const isEmail = key.includes('@');

    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email: isEmail ? key : undefined,
      phone: !isEmail ? key : undefined,
      token: code,
      type: isEmail ? 'email' : 'sms',
    });

    if (error) {
      console.error('[OTP] Verify error:', error.message);
      return res.status(400).json({ success: false, error: 'Code incorrect ou expiré' });
    }

    await supabaseAdmin.auth.admin.signOut(data.session?.access_token).catch(() => {});

    return res.json({ success: true });
  } catch (error) {
    console.error('[OTP] Verify error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Admin Auth
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ success: false, error: "Identifiants invalides" });

    let role = data.user?.user_metadata?.role;
    try {
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role && profile.role !== 'user') role = profile.role;
    } catch (_) {}

    if (!role && data.user?.id) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
          user_metadata: { ...(data.user.user_metadata || {}), role: 'admin' }
        });
        role = 'admin';
      } catch (_) {}
    }

    if (role !== 'admin') return res.status(403).json({ success: false, error: "Accès refusé." });
    return res.json({ success: true, session: data.session, user: data.user });
  } catch (error) {
    console.error('adminLogin error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const adminRegister = async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body;
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { nom, prenom, role: 'admin' }
    });
    if (error) return res.status(400).json({ success: false, error: error.message });
    try {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id, email: data.user.email, role: 'admin',
        full_name: `${prenom} ${nom}`.trim()
      }, { onConflict: 'id' });
    } catch (_) {}
    return res.json({ success: true, user: data.user });
  } catch (error) {
    console.error('adminRegister error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const vendeurLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error) return res.status(401).json({ success: false, error: "Identifiants invalides" });

    let role = data.user?.user_metadata?.role;
    try {
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role && profile.role !== 'user') role = profile.role;
    } catch (_) {}

    if (!role && data.user?.id) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(data.user.id, {
          user_metadata: { ...(data.user.user_metadata || {}), role: 'vendeur' }
        });
        role = 'vendeur';
      } catch (_) {}
    }

    if (role !== 'vendeur' && role !== 'admin') return res.status(403).json({ success: false, error: "Accès refusé." });
    return res.json({ success: true, session: data.session, user: data.user });
  } catch (error) {
    console.error('vendeurLogin error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const vendeurRegister = async (req, res) => {
  try {
    const { email, password, prenom, nom, phone } = req.body;
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { prenom, nom, phone, role: 'vendeur' }
    });
    if (error) return res.status(400).json({ success: false, error: error.message });
    try {
      await supabaseAdmin.from('profiles').upsert({
        id: data.user.id, email: data.user.email, role: 'vendeur',
        full_name: `${prenom} ${nom}`.trim()
      }, { onConflict: 'id' });
    } catch (_) {}
    return res.json({ success: true, user: data.user });
  } catch (error) {
    console.error('vendeurRegister error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
