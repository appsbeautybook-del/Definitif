import { Resend } from 'resend';

let resend = null;

function getResend() {
  if (resend) return resend;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('[Email] RESEND_API_KEY not set!');
    return null;
  }
  resend = new Resend(apiKey);
  console.log('[Email] Resend configured');
  return resend;
}

function buildEmailHtml(code) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #E8732A; font-size: 28px; margin: 0;">BeautyBook</h1>
      </div>
      <div style="background: #f9fafb; border-radius: 16px; padding: 32px; text-align: center;">
        <h2 style="color: #111827; font-size: 22px; margin: 0 0 12px;">Vérifiez votre email</h2>
        <p style="color: #6b7280; font-size: 14px; margin: 0 0 24px;">Voici votre code de vérification :</p>
        <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #E8732A; margin: 16px 0;">
          ${code}
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin: 16px 0 0;">Ce code expire dans 10 minutes.</p>
      </div>
      <p style="color: #9ca3af; font-size: 11px; text-align: center; margin-top: 24px;">
        Si vous n'avez pas demandé ce code, ignorez cet email.
      </p>
    </div>
  `;
}

export async function sendOTPEmail(email, code) {
  const client = getResend();

  if (!client) {
    console.log('[Email] ==========================================');
    console.log('[Email] RESEND NON CONFIGURÉ — Code pour', email, ':', code);
    console.log('[Email] ==========================================');
    return { success: true, note: 'console_only' };
  }

  try {
    await client.emails.send({
      from: 'BeautyBook <onboarding@resend.dev>',
      to: email,
      subject: 'Votre code de vérification BeautyBook',
      text: `Votre code de vérification est : ${code}. Ce code expire dans 10 minutes.`,
      html: buildEmailHtml(code),
    });
    console.log('[Email] Sent via Resend to:', email);
    return { success: true };
  } catch (error) {
    console.error('[Email] Resend error:', error.message);
    console.log('[Email] Fallback — code pour', email, ':', code);
    return { success: true, note: 'resend_failed_console' };
  }
}
