import { Resend } from 'resend';
import nodemailer from 'nodemailer';

let resendClient = null;
let gmailTransporter = null;

function getResend() {
  if (resendClient) return resendClient;
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  resendClient = new Resend(apiKey);
  return resendClient;
}

async function getGmailTransporter() {
  if (gmailTransporter) return gmailTransporter;
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;
  if (!user || !pass) return null;
  gmailTransporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
    pool: true,
    maxConnections: 1,
    rateDelta: 1000,
    rateLimit: 5,
  });
  console.log('[Email] Gmail SMTP ready');
  return gmailTransporter;
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
  const html = buildEmailHtml(code);
  const text = `Votre code de vérification est : ${code}. Ce code expire dans 10 minutes.`;
  const subject = 'Votre code de vérification BeautyBook';

  // Essayer Resend d'abord
  const resend = getResend();
  if (resend) {
    try {
      await resend.emails.send({
        from: 'BeautyBook <onboarding@resend.dev>',
        to: email,
        subject,
        text,
        html,
      });
      console.log('[Email] Sent via Resend to:', email);
      return { success: true };
    } catch (err) {
      console.warn('[Email] Resend failed:', err.message);
    }
  }

  // Fallback Gmail SMTP
  const gmail = await getGmailTransporter();
  if (gmail) {
    try {
      await gmail.sendMail({
        from: `"BeautyBook" <${process.env.GMAIL_USER}>`,
        to: email,
        subject,
        text,
        html,
      });
      console.log('[Email] Sent via Gmail SMTP to:', email);
      return { success: true };
    } catch (err) {
      console.error('[Email] Gmail SMTP error:', err.message);
    }
  }

  console.log('[Email] ==========================================');
  console.log('[Email] AUCUN SMTP — Code pour', email, ':', code);
  console.log('[Email] ==========================================');
  return { success: true, note: 'console_only' };
}
