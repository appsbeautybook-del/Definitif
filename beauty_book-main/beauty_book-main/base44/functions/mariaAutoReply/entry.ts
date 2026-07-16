import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me().catch(() => null);
    if (!user) return Response.json({ error: "Unauthorized" }, { status: 401 });

    const { conversation_id, client_email, client_name, pro_email, client_message } = await req.json();

    if (!conversation_id || !client_email || !pro_email || !client_message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Charger contexte pro : profil + services + réservations existantes
    const [profilPros, services, existingReservations] = await Promise.all([
      base44.asServiceRole.entities.ProfilPro.filter({ user_email: pro_email }, '-created_date', 1).catch(() => []),
      base44.asServiceRole.entities.Service.filter({ pro_email, status: 'actif' }, '-created_date', 30).catch(() => []),
      base44.asServiceRole.entities.Reservation.filter({ pro_email, status: 'confirme' }, '-created_date', 50).catch(() => []),
    ]);

    const profil = profilPros[0] || {};
    const salonName = profil.salon_name || 'notre salon';
    const city = profil.city || '';

    // Services disponibles
    const servicesText = services.length > 0
      ? services.map(s => `- ID:${s.id} | ${s.title} | ${s.price}€ | ${s.duration_min}min | ${s.category}`).join('\n')
      : 'Aucun service configuré.';

    // Créneaux déjà pris (pour les 14 prochains jours)
    const today = new Date();
    const takenSlots = existingReservations
      .filter(r => new Date(r.date) >= today)
      .map(r => `${r.date} à ${r.time_slot} (${r.duration_min || 60}min)`)
      .join('\n') || 'Aucun créneau pris.';

    // Horaires d'ouverture
    const ouvertureText = profil.ouverture
      ? Object.entries(profil.ouverture)
          .map(([day, d]) => `${day}: ${d.open ? `${d.start || '09:00'} - ${d.end || '18:00'}` : 'Fermé'}`)
          .join('\n')
      : 'Lundi-Vendredi: 09:00-19:00, Samedi: 10:00-18:00';

    // Historique récent de la conversation
    const [sent, received] = await Promise.all([
      base44.asServiceRole.entities.MessageChat.filter({ conversation_id, sender_email: pro_email }, 'created_date', 15).catch(() => []),
      base44.asServiceRole.entities.MessageChat.filter({ conversation_id, receiver_email: pro_email }, 'created_date', 15).catch(() => []),
    ]);
    const allById = {};
    for (const m of [...sent, ...received]) allById[m.id] = m;
    const history = Object.values(allById)
      .filter(m => m.type !== 'typing')
      .sort((a, b) => new Date(a.created_date) - new Date(b.created_date))
      .slice(-12);

    const historyText = history.map(m => {
      const role = m.sender_email === pro_email ? 'Maria (toi)' : `Client`;
      return `${role}: ${m.content}`;
    }).join('\n');

    // Date actuelle pour contexte
    const nowDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    // Extraire juste le prénom du client
    const firstName = (client_name || client_email || '').split(' ')[0].split('@')[0];

    const systemPrompt = `Tu es ${salonName}${city ? ` à ${city}` : ''}. Tu discutes avec ${firstName} comme le ferait une vraie personne du salon — chaleureuse, naturelle, humaine.

Date du jour : ${nowDate}
Prénom du client : ${firstName}

## TA FAÇON DE PARLER
- Parle comme dans une discussion WhatsApp normale, phrases courtes, décontractées
- Utilise le prénom (${firstName}) de temps en temps mais PAS à chaque message — seulement quand c'est naturel (ex: au début, ou pour confirmer)
- Ne répète JAMAIS le prénom deux fois dans le même message
- Jamais de listes à puces, jamais de titres en gras, jamais de formules robotiques
- Adapte-toi : s'il tutoie, tutoie-le. S'il vouvoie, vouvoie-le.
- Des mots naturels : "Bien sûr !", "Avec plaisir !", "Pas de souci !", "Super !", "On peut arranger ça"
- Des emojis légers et occasionnels (pas partout)

## PROGRESSION NATURELLE DE LA CONVERSATION
Ne demande PAS tout en même temps. Avance étape par étape comme dans une vraie discussion :
1. Si quelqu'un dit bonjour → réponds chaleureusement, demande juste ce qu'il cherche
2. Si quelqu'un mentionne un service → montre de l'enthousiasme, donne une info courte (prix/durée), puis demande pour quand
3. Si quelqu'un donne une préférence de date → propose 2-3 créneaux précis disponibles
4. Si quelqu'un choisit un créneau → confirme chaleureusement et crée la réservation

JAMAIS : "Donne-moi votre nom, votre service, votre date et votre heure." — c'est robotique et froid.

## ANALYSE DU MESSAGE
Lis attentivement ce que dit ${firstName}. Il peut :
- Mentionner directement un service → identifie-le dans ta liste et propose des créneaux
- Poser une question sur un service → réponds naturellement
- Donner une date/heure → vérifie si c'est libre et confirme
- Juste dire bonjour → accueille-le simplement

## SERVICES DISPONIBLES
${servicesText}

## HORAIRES
${ouvertureText}

## CRÉNEAUX DÉJÀ PRIS
${takenSlots}

## HISTORIQUE
${historyText || '(Début de conversation)'}

## CRÉER UNE RÉSERVATION
Quand ${firstName} confirme un service ET un créneau précis, ajoute invisiblement à la fin :
[BOOK: service_id=ID_DU_SERVICE, date=YYYY-MM-DD, time=HH:MM, client_name=${firstName}]

## EXEMPLES DE BONS MESSAGES
- Simple bonjour reçu → "Bonjour ! 😊 Bienvenue chez ${salonName}, comment je peux vous aider ?"
- Client mentionne "coupe" → "Ah super, on fait ça très bien ici ! C'est pour quand à peu près, vous avez une idée ?"
- Client dit "jeudi si possible" → "Jeudi on a de la place à 10h ou à 14h30, l'un des deux vous arrange ?"
- Client confirme → "Parfait ! Je vous note pour jeudi à 14h30, c'est confirmé 😊 À bientôt ${firstName} !"`;

    const llmResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Message du client : "${client_message}"\n\nRéponds et si besoin crée la réservation.`,
      system_prompt: systemPrompt,
      model: 'gemini_3_flash',
    });

    let reply = llmResponse?.result || llmResponse?.text || llmResponse;
    if (!reply || typeof reply !== 'string') {
      return Response.json({ error: 'No reply generated' }, { status: 500 });
    }

    // Détecter si Maria veut créer une réservation
    const bookMatch = reply.match(/\[BOOK:\s*service_id=([^,\]]+),\s*date=([^,\]]+),\s*time=([^,\]]+),\s*client_name=([^\]]+)\]/);
    let reservationCreated = null;

    if (bookMatch) {
      const [, serviceId, date, time, clientNameRaw] = bookMatch;
      const serviceIdClean = serviceId.trim();
      const dateClean = date.trim();
      const timeClean = time.trim();
      const clientNameClean = clientNameRaw.trim();

      // Trouver le service correspondant
      const service = services.find(s => s.id === serviceIdClean) || services[0];

      if (service && dateClean && timeClean) {
        try {
          reservationCreated = await base44.asServiceRole.entities.Reservation.create({
            client_email: client_email,
            client_name: clientNameClean || client_name || client_email,
            pro_email,
            pro_name: salonName,
            service_id: service.id,
            service_name: service.title,
            service_price: service.price,
            date: dateClean,
            time_slot: timeClean,
            duration_min: service.duration_min || 60,
            total_price: service.price,
            salon_name: salonName,
            salon_address: [profil.address, profil.city].filter(Boolean).join(', '),
            status: 'confirme',
            payment_status: 'non_paye',
            notes: `Réservation créée automatiquement par Maria AI`,
          });

          // Notifier le pro
          await base44.asServiceRole.entities.Notification.create({
            user_email: pro_email,
            type: 'reservation',
            title: `📅 Nouvelle réservation via Maria AI`,
            body: `${clientNameClean} — ${service.title} le ${dateClean} à ${timeClean}`,
            link: '/pro/gestion-agenda',
            read: false,
            data: { via_maria: true },
          }).catch(() => {});

          // Notifier le client
          await base44.asServiceRole.entities.Notification.create({
            user_email: client_email,
            type: 'reservation',
            title: `✅ Réservation confirmée chez ${salonName}`,
            body: `${service.title} le ${dateClean} à ${timeClean}`,
            link: '/rendez-vous',
            read: false,
            data: {},
          }).catch(() => {});

          console.log(`[Maria] Réservation créée: ${service.title} le ${dateClean} à ${timeClean} pour ${clientNameClean}`);
        } catch (e) {
          console.error('[Maria] Erreur création réservation:', e);
        }
      }

      // Retirer le tag [BOOK:...] du message visible
      reply = reply.replace(/\[BOOK:[^\]]+\]/g, '').trim();
    }

    // Envoyer le message en tant que le pro
    await base44.asServiceRole.entities.MessageChat.create({
      conversation_id,
      sender_email: pro_email,
      sender_name: salonName,
      sender_avatar: profil.avatar_url || null,
      receiver_email: client_email,
      receiver_name: client_name || client_email,
      content: reply,
      type: 'text',
      read: false,
    });

    // Notification message au client
    await base44.asServiceRole.entities.Notification.create({
      user_email: client_email,
      type: 'message',
      title: `Nouveau message de ${salonName}`,
      body: reply.substring(0, 80) + (reply.length > 80 ? '...' : ''),
      icon: '✂️',
      link: `/messages?to=${pro_email}&name=${encodeURIComponent(salonName)}`,
      read: false,
      data: {},
    }).catch(() => {});

    return Response.json({ success: true, reply, reservation: reservationCreated });
  } catch (error) {
    console.error('mariaAutoReply error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});