const SUPABASE_URL = 'https://vimusrczrjvefsbljtmf.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZpbXVzcmN6cmp2ZWZzYmxqdG1mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5ODg1MDksImV4cCI6MjA5NzU2NDUwOX0.2fSiqWfYKs3fadwRkS9Nvdq9b9JqnsmtMTHg-wN5m6k';

const OTP_PREFIX = 'bb_otp_';

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function clientSendVerificationCode(email) {
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, type: 'email', gotrue_meta_security: {} }),
    });

    const data = await response.json();

    if (response.ok || data?.error_code === 'over_email_send_rate_limit') {
      console.log('[OTP] Supabase OTP sent to:', email);
      return { success: true, method: 'supabase' };
    }

    console.warn('[OTP] Supabase error:', data);
  } catch (e) {
    console.warn('[OTP] Fetch error:', e.message);
  }

  const code = generateCode();
  const expiry = Date.now() + 10 * 60 * 1000;
  localStorage.setItem(`${OTP_PREFIX}${email}`, JSON.stringify({ code, expiry }));
  console.log('[OTP] Code pour', email, ':', code);
  return { success: true, method: 'client', code };
}

export async function clientVerifyCode(email, code) {
  // 1. Vérifier localStorage (code généré côté client)
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

  // 2. Vérifier via Supabase verifyOtp
  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, token: code, type: 'email' }),
    });

    const data = await response.json();

    if (response.ok && data?.session) {
      return { valid: true };
    }

    return { valid: false, error: data?.msg || 'Code incorrect ou expiré.' };
  } catch (e) {
    return { valid: false, error: 'Erreur de vérification.' };
  }
}
