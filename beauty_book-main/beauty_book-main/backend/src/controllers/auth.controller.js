import { supabaseAdmin } from '../config/supabase.js';
import pgClient from '../config/pg.js';

export const sendVerificationCode = async (req, res) => {
  try {
    const { mode, email, phone } = req.body;

    if (mode === 'email' && email) {
      // Use Supabase built-in OTP — sends email automatically, no external API needed
      const { error } = await supabaseAdmin.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: false,
        },
      });
      if (error) {
        console.error('Supabase OTP error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }
      console.log('Email OTP sent via Supabase to:', email);
      return res.json({ success: true, email_sent: true });
    }

    // Phone mode — use Supabase phone OTP
    if (mode === 'phone' && phone) {
      const { error } = await supabaseAdmin.auth.signInWithOtp({
        phone,
      });
      if (error) {
        console.error('Supabase phone OTP error:', error.message);
        return res.status(500).json({ success: false, error: error.message });
      }
      console.log('Phone OTP sent via Supabase to:', phone);
      return res.json({ success: true, email_sent: false });
    }

    return res.status(400).json({ success: false, error: 'Email or phone required' });
  } catch (error) {
    console.error('ERREUR sendVerificationCode:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyCode = async (req, res) => {
  try {
    const { key, code } = req.body;

    // Determine if key is email or phone
    const isEmail = key.includes('@');

    const { data, error } = await supabaseAdmin.auth.verifyOtp({
      email: isEmail ? key : undefined,
      phone: !isEmail ? key : undefined,
      token: code,
      type: isEmail ? 'email' : 'sms',
    });

    if (error) {
      console.error('Supabase verifyOtp error:', error.message);
      return res.status(400).json({ success: false, error: 'Code incorrect ou expiré' });
    }

    // Sign out immediately — we just wanted to verify, not create a session yet
    await supabaseAdmin.auth.admin.signOut(data.session?.access_token).catch(() => {});

    return res.json({ success: true });
  } catch (error) {
    console.error('verifyCode error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Admin Auth
export const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    
    if (error) {
      return res.status(401).json({ success: false, error: "Identifiants invalides" });
    }
    
    // Check role: user_metadata > profile (ignore default 'user' from trigger)
    let role = data.user?.user_metadata?.role;
    let profileRole = null;
    try {
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role) profileRole = profile.role;
      if (profile?.role && profile.role !== 'user') role = profile.role;
    } catch (_) { /* profiles table may not exist yet */ }
    
    // Auto-fix: if no role found, force-set it based on this being the admin login endpoint
    if (!role && data.user?.id) {
      try {
        await supabaseAdmin.auth.admin.updateUserById(data.user.id, { 
          user_metadata: { ...(data.user.user_metadata || {}), role: 'admin' } 
        });
        role = 'admin';
      } catch (_) {}
    }
    
    if (role !== 'admin') {
      return res.status(403).json({ success: false, error: "Accès refusé. Vous n'êtes pas administrateur." });
    }
    
    return res.json({ success: true, session: data.session, user: data.user });
  } catch (error) {
    console.error('adminLogin error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const adminRegister = async (req, res) => {
  try {
    const { email, password, nom, prenom } = req.body;
    
    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nom, prenom, role: 'admin' }
    });
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    // Set the admin role in profiles (best-effort, role is already in user_metadata)
    try {
      const { error: upsertErr } = await supabaseAdmin.from('profiles').upsert({ 
        id: data.user.id, 
        email: data.user.email,
        role: 'admin',
        full_name: `${prenom} ${nom}`.trim()
      }, { onConflict: 'id' });
      if (upsertErr) console.warn('profile upsert warning:', upsertErr.message);
    } catch (_) { /* profiles table may not exist yet */ }
    
    return res.json({ success: true, user: data.user });
  } catch (error) {
    console.error('adminRegister error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Vendeur Auth
export const vendeurLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    
    if (error) {
      return res.status(401).json({ success: false, error: "Identifiants invalides" });
    }
    
    // Check role: user_metadata > profile (ignore default 'user' from trigger)
    let role = data.user?.user_metadata?.role;
    let profileRole = null;
    try {
      const { data: profile } = await supabaseAdmin.from('profiles').select('role').eq('id', data.user.id).single();
      if (profile?.role) profileRole = profile.role;
      if (profile?.role && profile.role !== 'user') role = profile.role;
    } catch (_) { /* profiles table may not exist yet */ }
    
    // Auto-fix: if no role found, force-set it based on profile or default to vendeur
    if (!role && data.user?.id) {
      try {
        const targetRole = (profileRole && profileRole !== 'user') ? profileRole : 'vendeur';
        await supabaseAdmin.auth.admin.updateUserById(data.user.id, { 
          user_metadata: { ...(data.user.user_metadata || {}), role: targetRole } 
        });
        role = targetRole;
      } catch (_) {}
    }
    
    if (role !== 'vendeur' && role !== 'admin') {
      return res.status(403).json({ success: false, error: "Accès refusé. Vous n'êtes pas vendeur." });
    }
    
    return res.json({ success: true, session: data.session, user: data.user });
  } catch (error) {
    console.error('vendeurLogin error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const vendeurRegister = async (req, res) => {
  try {
    const { email, password, prenom, nom, phone } = req.body;
    
    // Create user in Supabase Auth
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { prenom, nom, phone, role: 'vendeur' }
    });
    
    if (error) {
      return res.status(400).json({ success: false, error: error.message });
    }
    
    // Set the vendeur role in profiles (best-effort, role is already in user_metadata)
    try {
      const { error: upsertErr } = await supabaseAdmin.from('profiles').upsert({ 
        id: data.user.id, 
        email: data.user.email,
        role: 'vendeur',
        full_name: `${prenom} ${nom}`.trim()
      }, { onConflict: 'id' });
      if (upsertErr) console.warn('profile upsert warning:', upsertErr.message);
    } catch (_) { /* profiles table may not exist yet */ }
    
    return res.json({ success: true, user: data.user });
  } catch (error) {
    console.error('vendeurRegister error:', error.message);
    return res.status(500).json({ success: false, error: error.message });
  }
};
