import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { mode, email, phone } = await req.json();

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000;
    const key = mode === "email" ? email : phone;

    console.log("Code généré:", code, "pour:", key);

    // Supprimer les anciens codes pour cette clé
    try {
      const existing = await base44.asServiceRole.entities.VerificationCode.filter({ key });
      for (const old of existing) {
        await base44.asServiceRole.entities.VerificationCode.delete(old.id);
      }
    } catch (_) {}

    await base44.asServiceRole.entities.VerificationCode.create({
      key,
      code,
      expires_at: expiresAt,
      mode
    });

    let emailSent = false;

    if (mode === "email" && email) {
      const resendKey = Deno.env.get("RESEND_API_KEY");
      if (resendKey) {
        const emailRes = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            from: "BeautyBook <onboarding@resend.dev>",
            to: [email],
            subject: `${code} — Votre code de vérification BeautyBook`,
            html: `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;">
        <tr>
          <td style="background:#E8732A;padding:24px;text-align:center;">
            <p style="margin:0;color:#fff;font-size:20px;font-weight:900;letter-spacing:2px;">✨ BEAUTYBOOK</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:22px;font-weight:900;color:#111;">Code de vérification</p>
            <p style="margin:0 0 24px;font-size:14px;color:#6b7280;">Entrez ce code dans l'application. Il expire dans 10 minutes.</p>
            <div style="background:#fff7f0;border:2px solid #E8732A;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px;">
              <p style="margin:0;font-size:48px;font-weight:900;color:#E8732A;letter-spacing:16px;">${code}</p>
            </div>
            <p style="margin:0;font-size:12px;color:#9ca3af;">Ne partagez jamais ce code. Si vous n'avez pas fait cette demande, ignorez cet email.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;padding:16px;text-align:center;border-top:1px solid #f3f4f6;">
            <p style="margin:0;font-size:11px;color:#9ca3af;">© 2026 BeautyBook</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
          })
        });

        const emailData = await emailRes.json();
        if (emailRes.ok) {
          emailSent = true;
          console.log("Email envoyé avec succès via Resend à:", email);
        } else {
          console.log("Resend erreur:", emailData.message);
          // Retourner le code dans la réponse si Resend ne peut pas envoyer (domaine non vérifié)
          return Response.json({ success: true, email_sent: false, dev_code: code });
        }
      }
    }

    return Response.json({ success: true, email_sent: emailSent });

  } catch (error) {
    console.error("ERREUR sendVerificationCode:", error.message);
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
});