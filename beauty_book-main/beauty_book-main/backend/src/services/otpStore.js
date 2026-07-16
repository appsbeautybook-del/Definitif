const codes = new Map();

function generateCode() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export function storeCode(email, purpose = 'signup') {
  const code = generateCode();
  const key = `${email}:${purpose}`;
  codes.set(key, {
    code,
    attempts: 0,
    created: Date.now(),
    expires: Date.now() + 10 * 60 * 1000,
  });
  console.log(`[OTP] Stored code for ${email} (${purpose}): ${code}`);
  return code;
}

export function verifyStoredCode(email, code, purpose = 'signup') {
  const key = `${email}:${purpose}`;
  const entry = codes.get(key);

  if (!entry) return { valid: false, error: 'Aucun code trouvé. Demandez un nouveau code.' };
  if (Date.now() > entry.expires) {
    codes.delete(key);
    return { valid: false, error: 'Le code a expiré. Demandez un nouveau code.' };
  }
  if (entry.attempts >= 5) {
    codes.delete(key);
    return { valid: false, error: 'Trop de tentatives. Demandez un nouveau code.' };
  }

  entry.attempts++;

  if (entry.code !== code) {
    return { valid: false, error: 'Code incorrect.' };
  }

  codes.delete(key);
  return { valid: true };
}

export function cleanupExpired() {
  const now = Date.now();
  for (const [key, entry] of codes.entries()) {
    if (now > entry.expires) codes.delete(key);
  }
}

setInterval(cleanupExpired, 60 * 1000);
