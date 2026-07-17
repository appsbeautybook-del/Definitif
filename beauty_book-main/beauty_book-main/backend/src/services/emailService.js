import nodemailer from 'nodemailer';

let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_APP_PASSWORD;

  if (user && pass) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });
    console.log('[Email] Using Gmail SMTP:', user);
    return transporter;
  }

  console.warn('[Email] GMAIL_USER/GMAIL_APP_PASSWORD not set');
  return null;
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

  if (!transport) {
    console.log('[Email] ==========================================');
    console.log('[Email] GMAIL NON CONFIGURÉ — Code pour', email, ':', code);
    console.log('[Email] ==========================================');
    return { success: true, note: 'console_only' };
  }

  try {
    await transport.sendMail({
      from: `"BeautyBook" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Votre code de vérification BeautyBook',
      text: `Votre code de vérification est : ${code}. Ce code expire dans 10 minutes.`,
      html: buildEmailHtml(code),
    });
    console.log('[Email] Sent via Gmail SMTP to:', email);
    return { success: true };
  } catch (error) {
    console.error('[Email] Gmail SMTP error:', error.message);
    console.log('[Email] Fallback — code pour', email, ':', code);
    return { success: true, note: 'smtp_failed_console' };
  }
}
