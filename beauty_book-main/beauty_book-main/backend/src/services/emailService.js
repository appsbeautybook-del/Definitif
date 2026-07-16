import sgMail from '@sendgrid/mail';
import { supabaseAdmin } from '../config/supabase.js';

let sgConfigured = false;

function configureSendGrid() {
  if (sgConfigured) return true;
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    console.warn('[Email] SENDGRID_API_KEY not set');
    return false;
  }
  sgMail.setApiKey(apiKey);
  sgConfigured = true;
  console.log('[Email] SendGrid configured');
  return true;
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
  if (configureSendGrid()) {
    const fromEmail = process.env.SENDGRID_FROM || 'appsbeautybook@gmail.com';
    await sgMail.send({
      to: email,
      from: fromEmail,
      subject: 'Votre code de vérification BeautyBook',
      text: `Votre code de vérification est : ${code}. Ce code expire dans 10 minutes.`,
      html: buildEmailHtml(code),
    });
    console.log('[Email] Sent via SendGrid to:', email);
    return { success: true };
  }

  console.warn('[Email] SendGrid not configured, code logged to console for:', email);
  return { success: true, note: 'code_only' };
}

export async function sendOTPEmailViaSupabase(email, code) {
  const { error } = await supabaseAdmin.auth.signInWithOtp({
    email,
    options: { shouldCreateUser: true },
  });
  if (error) throw error;
  console.log('[Email] Sent via Supabase OTP to:', email);
  return { success: true };
}
