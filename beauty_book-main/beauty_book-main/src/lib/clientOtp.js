import { supabase } from '../api/supabaseClient';

const OTP_PREFIX = 'bb_otp_';

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function clientSendVerificationCode(email) {
  // Essayer Supabase OTP en premier (si configuré en mode OTP dans le dashboard)
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    if (!error) {
      console.log('[OTP Client] Supabase OTP sent to:', email);
      return { success: true, method: 'supabase' };
    }

    console.warn('[OTP Client] Supabase OTP failed:', error.message);
  } catch (e) {
    console.warn('[OTP Client] Supabase OTP error:', e.message);
  }

  // Fallback: générer le code côté client et le stocker en localStorage
  const code = generateCode();
  const expiry = Date.now() + 10 * 60 * 1000;
  localStorage.setItem(`${OTP_PREFIX}${email}`, JSON.stringify({ code, expiry }));
  console.log('[OTP Client] Code generated for', email, ':', code);
  return { success: true, method: 'client' };
}

export function clientVerifyCode(email, code) {
  // Vérifier d'abord en localStorage (fallback client)
  const stored = localStorage.getItem(`${OTP_PREFIX}${email}`);
  if (stored) {
    const { code: storedCode, expiry } = JSON.parse(stored);
    localStorage.removeItem(`${OTP_PREFIX}${email}`);

    if (Date.now() > expiry) {
      return { valid: false, error: 'Le code a expiré.' };
    }
    if (storedCode !== code) {
      return { valid: false, error: 'Code incorrect.' };
    }
    return { valid: true };
  }

  return { valid: false, error: 'Aucun code trouvé.' };
}
