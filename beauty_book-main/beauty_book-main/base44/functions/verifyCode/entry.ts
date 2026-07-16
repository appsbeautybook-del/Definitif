import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  const { key, code } = await req.json();

  const records = await base44.asServiceRole.entities.VerificationCode.filter({ key, code });

  if (!records || records.length === 0) {
    return Response.json({ success: false, error: "Code incorrect" }, { status: 400 });
  }

  const record = records[0];
  if (Date.now() > record.expires_at) {
    return Response.json({ success: false, error: "Code expiré" }, { status: 400 });
  }

  // Supprime le code après vérification
  await base44.asServiceRole.entities.VerificationCode.delete(record.id);

  return Response.json({ success: true });
});