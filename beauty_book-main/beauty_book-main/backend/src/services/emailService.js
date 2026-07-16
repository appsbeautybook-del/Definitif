import nodemailer from 'nodemailer';
import { supabaseAdmin } from '../config/supabase.js';

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  if (process.env.SMTP_HOST) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log('[Email] Using SMTP:', process.env.SMTP_HOST);
    return transporter;
  }

  const testAccount = await nodemailer.createTestAccount();
  transporter = nodemailer.createTransport({
    host: testAccount.smtp.host,
    port: testAccount.smtp.port,
    secure: testAccount.smtp.secure,
    auth: { user: testAccount.user, pass: testAccount.pass },
  });
  console.log('[Email] Using Ethereal:', testAccount.user);
  return transporter;
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
  const transport = await getTransporter();

  const info = await transport.sendMail({
    from: process.env.SMTP_FROM || '"BeautyBook" <noreply@beautybook.app>',
    to: email,
    subject: 'Votre code de vérification BeautyBook',
    text: `Votre code de vérification est : ${code}. Ce code expire dans 10 minutes.`,
    html: buildEmailHtml(code),
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) console.log('[Email] Preview:', previewUrl);
  console.log('[Email] Sent to:', email);

  return { success: true, previewUrl };
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
