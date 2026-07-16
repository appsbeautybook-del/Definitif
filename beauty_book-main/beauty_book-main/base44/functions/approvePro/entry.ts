import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Accès réservé aux admins' }, { status: 403 });
    }

    const { action, demande_id, note } = await req.json().catch(() => ({}));

    if (!demande_id) return Response.json({ error: 'demande_id requis' }, { status: 400 });

    const demandeList = await base44.asServiceRole.entities.DemandeProV2.filter({ id: demande_id }, null, 1);
    const demande = demandeList?.[0];
    if (!demande) return Response.json({ error: 'Demande introuvable' }, { status: 404 });

    if (action === 'approuver') {
      // Créer ou mettre à jour le ProfilPro
      const existing = await base44.asServiceRole.entities.ProfilPro.filter({ user_email: demande.user_email }, '-created_date', 1);

      // Mapper le type_activite de DemandeProV2 vers ProfilPro
      const typeActivite = demande.type_activite === 'Indépendant' || demande.type_activite === 'Mobile'
        ? 'Particulier'
        : demande.type_activite === 'Particulier' ? 'Particulier' : 'Salon';

      const profileData = {
        user_email: demande.user_email,
        salon_name: demande.salon_name,
        bio: demande.bio,
        avatar_url: demande.salon_photo || '',
        cover_url: demande.salon_photo || '',
        phone: demande.phone || '',
        address: '',
        city: '',
        specialites: [...(demande.services || []), ...(demande.categories || [])],
        verified: true,
        abonnement: 'free',
        status: 'actif',
        type_activite: typeActivite,
        gallery: demande.portfolio || [],
        ouverture: {
          days: demande.days || [],
          time_slots: demande.time_slots || [],
          commodites: demande.commodites || [],
        },
      };

      let profil;
      if (existing.length > 0) {
        profil = await base44.asServiceRole.entities.ProfilPro.update(existing[0].id, profileData);
      } else {
        profil = await base44.asServiceRole.entities.ProfilPro.create(profileData);
      }

      // Mettre à jour la demande
      await base44.asServiceRole.entities.DemandeProV2.update(demande_id, {
        statut: 'approuvee',
        profil_pro_id: profil.id,
        note_admin: note || '',
      });

      // Envoyer une notification à l'utilisateur
      await base44.asServiceRole.entities.Notification.create({
        user_email: demande.user_email,
        title: '🎉 Demande Pro approuvée !',
        body: `Félicitations ! Votre compte professionnel "${demande.salon_name}" est maintenant actif sur BeautyBook.`,
        type: 'system',
        link: '/profil-pro',
        read: false,
      });

      return Response.json({ success: true, profil_id: profil.id });
    }

    if (action === 'refuser') {
      await base44.asServiceRole.entities.DemandeProV2.update(demande_id, {
        statut: 'refusee',
        note_admin: note || '',
      });

      await base44.asServiceRole.entities.Notification.create({
        user_email: demande.user_email,
        title: 'Demande Pro refusée',
        body: note ? `Votre demande a été refusée. Motif : ${note}` : 'Votre demande pro a été refusée. Contactez le support pour plus d\'informations.',
        type: 'system',
        link: '/devenir-pro',
        read: false,
      });

      return Response.json({ success: true });
    }

    return Response.json({ error: 'Action non reconnue' }, { status: 400 });
  } catch (error) {
    console.error('approvePro error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});