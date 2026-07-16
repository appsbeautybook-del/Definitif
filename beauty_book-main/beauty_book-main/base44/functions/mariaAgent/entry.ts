import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// ══════════════════════════════════════════════════════════════════════════════
// MARIA ORCHESTRATOR AGENT
// Architecture: ReAct loop (Reason → Act → Observe → Reason → ...)
// Inspiré d'Odysseus: boucle agentique autonome avec outils structurés
// L'agent peut chaîner plusieurs actions sans attendre l'utilisateur
// ══════════════════════════════════════════════════════════════════════════════

const MAX_AGENT_STEPS = 5; // max d'itérations autonomes par message

// ── DÉFINITION DES OUTILS ────────────────────────────────────────────────────
// Chaque outil peut être appelé par l'agent de façon autonome
const TOOL_REGISTRY = {

  // ── Outils de LECTURE (l'agent peut requêter des données) ─────────────────
  search_pros: {
    desc: "Rechercher des professionnels par spécialité, ville, service",
    schema: '{"query":"string", "city":"string?", "category":"string?"}',
    side_effect: false,
  },
  search_services: {
    desc: "Rechercher des services disponibles par catégorie ou mots-clés",
    schema: '{"query":"string", "category":"string?", "max_price":"number?"}',
    side_effect: false,
  },
  get_user_reservations: {
    desc: "Récupérer les réservations de l'utilisateur",
    schema: '{"status":"string?", "limit":"number?"}',
    side_effect: false,
  },

  // ── Outils d'ACTION (modifient des données) ───────────────────────────────
  create_reservation: {
    desc: "Créer une réservation (après confirmation explicite de l'utilisateur)",
    schema: '{"service_name":"string","pro_email":"string","pro_name":"string","salon_name":"string","salon_address":"string","date":"YYYY-MM-DD","time_slot":"HH:MM","duration_min":"number","persons":"number","total_price":"number","service_price":"number","service_id":"string?"}',
    side_effect: true,
    requires_confirm: true,
  },
  create_routine: {
    desc: "Créer une routine beauté directement en base de données",
    schema: '{"name":"string","emoji":"string","color":"string","description":"string","time":"HH:MM","duration_min":"number","frequency":"quotidien|hebdomadaire|personnalise","days_of_week":"array","tasks":"array","objectif":"string?"}',
    side_effect: true,
    requires_confirm: true,
  },
  send_message: {
    desc: "Envoyer un message à un contact ou professionnel",
    schema: '{"receiver_email":"string","receiver_name":"string","content":"string","conversation_id":"string?"}',
    side_effect: true,
    requires_confirm: true,
  },
  save_memory: {
    desc: "Mémoriser une info sur l'utilisateur (prénom, préfs, brouillons)",
    schema: '{"field":"name|profession|city|salon_name|services|preferences|summary|service_draft|pro_draft","value":"any"}',
    side_effect: false,
  },
  learn_habit: {
    desc: "Apprendre une habitude comportementale de l'utilisateur",
    schema: '{"type":"favorite_category|time_slot|rdv_pattern|favorite_pro|profile_summary","value":"string"}',
    side_effect: false,
  },

  // ── Outils d'INTERFACE (déclenchent une action dans l'UI) ─────────────────
  navigate: {
    desc: "Naviguer vers une page de l'app",
    schema: '{"path":"string","label":"string"}',
    side_effect: false,
  },
  show_booking_summary: {
    desc: "Afficher un récapitulatif de réservation pour confirmation par l'utilisateur",
    schema: '{"service":"string","pro_name":"string","pro_email":"string","salon_name":"string","salon_address":"string","date":"YYYY-MM-DD","time_slot":"HH:MM","persons":"number","total_price":"number","duration_min":"number"}',
    side_effect: false,
  },
  show_service_form: {
    desc: "Ouvrir le formulaire de création de service (pros uniquement)",
    schema: '{"title":"string","category":"string","price":"number","duration_min":"number","description":"string","audience":"string?","addons":"array?"}',
    side_effect: false,
  },
  show_routine_summary: {
    desc: "Afficher une routine générée pour validation par l'utilisateur avant création",
    schema: '{"name":"string","emoji":"string","color":"string","description":"string","time":"HH:MM","duration_min":"number","frequency":"string","days_of_week":"array","tasks":"array","objectif":"string?"}',
    side_effect: false,
  },
  show_pro_form: {
    desc: "Ouvrir le formulaire devenir professionnel pré-rempli",
    schema: '{"salon_name":"string?","type":"string?","services":"array?","city":"string?","bio":"string?","years":"number?","phone":"string?","siret":"string?"}',
    side_effect: false,
  },
  search_products: {
    desc: "Afficher des produits dans la boutique",
    schema: '{"query":"string"}',
    side_effect: false,
  },
};

const TOOL_DESCRIPTIONS = Object.entries(TOOL_REGISTRY).map(([name, t]) =>
  `  • ${name}(${t.schema}) → ${t.desc}${t.requires_confirm ? " ⚠️ REQUIERT confirmation préalable de l'utilisateur" : ""}`
).join("\n");

// ── PROMPT SYSTÈME ORCHESTRATEUR ─────────────────────────────────────────────
const getOrchestratorPrompt = (ctx) => {
  const { memory, userMemory, userEmail, userName, isPro, userData, availablePros, availableServices, recentMessages, voiceMode } = ctx;
  const name = memory?.name || userMemory?.preferences?.preferred_name || userName || null;

  const voiceInstruction = voiceMode
    ? "\n⚡ MODE VOCAL: Réponds en 1-2 phrases parlées, sans markdown. Inclus les TOOL_CALL si nécessaire.\n"
    : "";

  const accountType = isPro ? "PROFESSIONNEL ✅" : "CLIENT";

  const reservationsStr = userData.reservations?.length > 0
    ? userData.reservations.slice(0, 15).map(r =>
        `• ${r.service_name} chez ${r.pro_name || r.salon_name} | ${r.date} ${r.time_slot} | ${r.status} | ${r.total_price || r.service_price}€`
      ).join("\n")
    : "Aucune réservation.";

  const commandesStr = userData.commandes?.length > 0
    ? userData.commandes.slice(0, 8).map(c =>
        `• #${c.id?.slice(-6)} | ${(c.items || []).map(i => i.name).join(", ")} | ${c.total}€ | ${c.status}`
      ).join("\n")
    : "Aucune commande.";

  const routinesStr = userData.routines?.length > 0
    ? userData.routines.map(r => `• ${r.emoji} ${r.name} | ${r.frequency} ${r.time} | streak:${r.streak}j`).join("\n")
    : "Aucune routine.";

  const prosStr = availablePros?.length > 0
    ? availablePros.slice(0, 15).map(p =>
        `• ${p.salon_name} | email:${p.user_email} | ville:${p.city || "?"} | ★${p.rating || "?"} | ${(p.specialites || []).slice(0, 3).join(",")}`
      ).join("\n")
    : "Aucun pro disponible.";

  const servicesStr = availableServices?.length > 0
    ? availableServices.slice(0, 30).map(s =>
        `• "${s.title}" | pro:${s.pro_email} | ${s.price}€ | ${s.duration_min}min | ${s.category}`
      ).join("\n")
    : "Aucun service.";

  const messagesStr = recentMessages?.length > 0
    ? recentMessages.map(m => `• ${m.sender_name || m.sender_email}: "${m.content.slice(0, 80)}"`).join("\n")
    : "Aucun.";

  const workflowStr = userMemory?.pending_workflows?.[0]
    ? JSON.stringify(userMemory.pending_workflows[0])
    : "Aucun";

  const memSummary = JSON.stringify({
    prénom: name, profession: memory?.profession, ville: memory?.city,
    salon: memory?.salon_name, services: memory?.services,
    résumé: memory?.summary, service_draft: memory?.service_draft,
  }, null, 2);

  const habitsStr = userMemory ? JSON.stringify({
    créneaux_préf: userMemory.preferred_time_slots,
    jours_préf: userMemory.preferred_days,
    catégories_fav: userMemory.favorite_categories,
    derniers_pros: userMemory.last_pros,
    derniers_services: userMemory.last_services,
    résumé_profil: userMemory.profile_summary,
  }, null, 2) : "{}";

  return `Tu es Maria, l'assistante IA orchestratrice de BeautyBook. Tu es un agent autonome capable d'enchaîner plusieurs actions pour accomplir des tâches complexes.${voiceInstruction}

━━━ IDENTITÉ UTILISATEUR ━━━
Email: ${userEmail} | Compte: ${accountType} | Prénom: ${name || "inconnu"}

━━━ MÉMOIRE LONGUE ━━━
${memSummary}

━━━ HABITUDES APPRISES ━━━
${habitsStr}

━━━ DONNÉES PERSONNELLES ━━━
📅 RÉSERVATIONS (${userData.reservations?.length || 0}):
${reservationsStr}

🛍️ COMMANDES (${userData.commandes?.length || 0}):
${commandesStr}

✨ ROUTINES (${userData.routines?.length || 0}):
${routinesStr}

💬 MESSAGES RÉCENTS:
${messagesStr}

🔧 WORKFLOW EN COURS: ${workflowStr}

━━━ ANNUAIRE EN DIRECT ━━━
PROS:
${prosStr}

SERVICES:
${servicesStr}

━━━ TES OUTILS (TOOL CALLING) ━━━
Utilise ce format EXACTEMENT pour appeler un outil:
[TOOL_CALL:nom_outil:{"key":"value"}]

${TOOL_DESCRIPTIONS}

━━━ COMPORTEMENT ORCHESTRATEUR ━━━
Tu es un AGENT AUTONOME. Pour des tâches complexes, TU AGIS sans attendre:

EXEMPLES D'ORCHESTRATION AUTONOME:
• "Réserve-moi une coiffure demain matin" 
  → search_services + search_pros → show_booking_summary (puis confirm) → create_reservation
  
• "Crée-moi une routine capillaire du soir"  
  → Génère la routine → show_routine_summary → (si confirmé) create_routine
  
• "Montre-moi mes stats beauté"
  → get_user_reservations → analyse → répond avec tableau markdown

• "Je veux contacter le salon NAHDABEE"
  → navigate vers /messages ou send_message directement

RÈGLES ORCHESTRATEUR:
1. Pour des actions à effet de bord (create_*, send_*): TOUJOURS afficher un récapitulatif d'abord (show_*) sauf si l'utilisateur a déjà confirmé explicitement dans ce message.
2. Tu peux appeler PLUSIEURS TOOL_CALL dans un seul message.
3. Tu peux chaîner: search → analyse dans ta réponse → show_summary → (prochain tour) create
4. En mode vocal: sois concis, annonce ce que tu fais ("Je recherche... je vérifie...").
5. Apprends des habitudes silencieusement avec learn_habit et save_memory.
6. Pour les rapports: utilise les VRAIES données ci-dessus, tableaux markdown, stats.
7. ${isPro ? "Compte PRO: toutes fonctionnalités disponibles." : "Compte CLIENT: pas de création services. Si demandé → show_pro_form."}
8. Une seule question à la fois si tu manques d'infos.
9. Réponds TOUJOURS en français, chaleureusement.
10. Prénom connu: ${name ? `"${name}" — NE PAS REDEMANDER.` : "Demande-le chaleureusement au premier message."}`;
};

// ── PARSEURS ─────────────────────────────────────────────────────────────────
function extractJsonBlock(text, startIndex) {
  let depth = 0, i = startIndex;
  while (i < text.length) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') { depth--; if (depth === 0) return text.slice(startIndex, i + 1); }
    i++;
  }
  return null;
}

function parseToolCalls(text) {
  const calls = [];
  const marker = '[TOOL_CALL:';
  let pos = 0;
  while ((pos = text.indexOf(marker, pos)) !== -1) {
    const afterMarker = pos + marker.length;
    // Chercher le séparateur entre nom d'outil et JSON: peut être ':' ou ','
    // Format normal:  [TOOL_CALL:navigate:{"path":...}]
    // Format dégradé: [TOOL_CALL:navigate,{"path":...}]
    const colonIdx = text.indexOf(':', afterMarker);
    const commaIdx = text.indexOf(',', afterMarker);
    const braceIdx = text.indexOf('{', afterMarker);
    // Prendre le premier séparateur qui précède '{'
    let sepIdx = -1;
    if (colonIdx !== -1 && (commaIdx === -1 || colonIdx <= commaIdx) && (braceIdx === -1 || colonIdx < braceIdx)) {
      sepIdx = colonIdx;
    } else if (commaIdx !== -1 && (braceIdx === -1 || commaIdx < braceIdx)) {
      sepIdx = commaIdx;
    }
    if (sepIdx === -1) { pos = afterMarker; continue; }
    const toolName = text.slice(afterMarker, sepIdx).trim();
    const jsonStr = extractJsonBlock(text, sepIdx + 1);
    if (jsonStr) {
      try { calls.push({ tool: toolName, args: JSON.parse(jsonStr) }); pos = sepIdx + 1 + jsonStr.length; }
      catch { pos = sepIdx + 1; }
    } else { pos = afterMarker; }
  }
  return calls;
}

// Capturer le format "toolname:{...}" sans crochet (LLM dégradé)
function parseBareTool(text, knownTools) {
  const calls = [];
  for (const toolName of knownTools) {
    const re = new RegExp(`(?<!\\[TOOL_CALL:)\\b${toolName}:\\s*(\\{)`, 'g');
    let m;
    while ((m = re.exec(text)) !== null) {
      const jsonStr = extractJsonBlock(text, m.index + m[0].length - 1);
      if (jsonStr) {
        try { calls.push({ tool: toolName, args: JSON.parse(jsonStr) }); } catch {}
      }
    }
  }
  return calls;
}

// Rétrocompatibilité ancienne syntaxe
function parseLegacyBlocks(text) {
  const calls = [];
  const toolMap = {
    'SERVICE_FORM': 'show_service_form', 'NAVIGATE': 'navigate',
    'BOOKING_SUMMARY': 'show_booking_summary', 'BOOK_SERVICE': 'show_booking_summary',
    'ACTION_BOOK_SERVICE': 'show_booking_summary',
    'CREATE_RESERVATION': 'create_reservation', 'ROUTINE_SUMMARY': 'show_routine_summary',
    'OPEN_PRO_FORM': 'show_pro_form', 'SEARCH_PRODUCTS': 'search_products', 'SEND_MESSAGE': 'send_message',
  };
  const actionRegex = /\[ACTION:([A-Z_]+):(\{[\s\S]*?\})\]/g;
  let m;
  while ((m = actionRegex.exec(text)) !== null) {
    try { const tool = toolMap[m[1]]; if (tool) calls.push({ tool, args: JSON.parse(m[2]) }); } catch {}
  }
  const saveRegex = /\[SAVE_MEMORY:(\{[\s\S]*?\})\]/g;
  while ((m = saveRegex.exec(text)) !== null) {
    try { calls.push({ tool: 'save_memory', args: JSON.parse(m[1]) }); } catch {}
  }
  const habitRegex = /\[LEARN_HABIT:(\{[\s\S]*?\})\]/g;
  while ((m = habitRegex.exec(text)) !== null) {
    try { calls.push({ tool: 'learn_habit', args: JSON.parse(m[1]) }); } catch {}
  }
  return calls;
}

function cleanReplyText(text) {
  return text
    // Tool calls complets avec JSON bien fermé
    .replace(/\[TOOL_CALL:[a-z_]+:[\s\S]*?\]\s*/g, '')
    // Tool calls partiels/mal fermés (sans crochet fermant)
    .replace(/\[TOOL_CALL:[a-z_]+[:(,][^]*/g, '')
    // Anciens formats ACTION
    .replace(/\[ACTION:[A-Z_]+:\{[\s\S]*?\}\]/g, '')
    .replace(/\[ACTION:[A-Z_]+:\{[^}]*\}/g, '')
    // Mémoire et habitudes
    .replace(/\[SAVE_MEMORY:\{[\s\S]*?\}\]/g, '')
    .replace(/\[LEARN_HABIT:\{[\s\S]*?\}\]/g, '')
    // Crochets ouvrants orphelins restants
    .replace(/\[[^\]]*$/g, '')
    .trim();
}

function condenseHistory(messages) {
  if (messages.length <= 30) return messages;
  const recent = messages.slice(-30);
  const summary = messages.slice(0, -30)
    .filter(m => m.role && m.content)
    .map(m => `${m.role === 'user' ? 'U' : 'M'}: ${m.content.slice(0, 60)}`).join(' | ');
  return [
    { role: 'assistant', content: `[Historique résumé: ${summary.slice(0, 400)}]`, timestamp: recent[0]?.timestamp },
    ...recent,
  ];
}

// ── BOUCLE AGENTIQUE (ReAct: Reason → Act → Observe) ─────────────────────────
async function runAgentLoop(ctx, initialPrompt, callLLM) {
  const { base44, user, userName, userMemoryRecord, userMemoryId, isPro, voiceMode } = ctx;

  let stepCount = 0;
  let agentScratchpad = ""; // trace des étapes pour le LLM
  let finalReply = "";
  let finalAction = null;
  const memoryUpdates = {};
  const habitUpdates = [];

  // ── Exécution d'un tool call côté serveur ──────────────────────────────────
  const executeTool = async (tool, args) => {
    console.log(`[Agent step ${stepCount}] Executing tool: ${tool}`);

    switch (tool) {

      // ── Outils de lecture (pas d'effet de bord, retournent des données) ────
      case 'search_pros': {
        const q = (args.query || "").toLowerCase();
        const filtered = (ctx.availablePros || []).filter(p =>
          p.salon_name?.toLowerCase().includes(q) ||
          p.city?.toLowerCase().includes(q) ||
          (p.specialites || []).some(s => s.toLowerCase().includes(q))
        ).slice(0, 8);
        return { ok: true, data: filtered, summary: filtered.length > 0
          ? filtered.map(p => `${p.salon_name} (${p.city}, ★${p.rating || "N/A"})`).join(", ")
          : "Aucun pro trouvé pour cette recherche." };
      }

      case 'search_services': {
        const q = (args.query || "").toLowerCase();
        const filtered = (ctx.availableServices || []).filter(s =>
          s.title?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          (args.category && s.category?.toLowerCase().includes(args.category.toLowerCase()))
        ).filter(s => !args.max_price || s.price <= args.max_price).slice(0, 10);
        return { ok: true, data: filtered, summary: filtered.length > 0
          ? filtered.map(s => `"${s.title}" chez ${s.pro_email} — ${s.price}€ / ${s.duration_min}min`).join(", ")
          : "Aucun service trouvé." };
      }

      case 'get_user_reservations': {
        let r = ctx.userData.reservations || [];
        if (args.status) r = r.filter(res => res.status === args.status);
        r = r.slice(0, args.limit || 10);
        return { ok: true, data: r, summary: `${r.length} réservation(s) trouvée(s).` };
      }

      // ── Mémoire (pas d'effet externe) ──────────────────────────────────────
      case 'save_memory': {
        if (args.field && args.value !== undefined) memoryUpdates[args.field] = args.value;
        return { ok: true, summary: `Mémoire mise à jour: ${args.field}` };
      }

      case 'learn_habit': {
        if (args.type && args.value) habitUpdates.push(args);
        return { ok: true, summary: `Habitude apprise: ${args.type} = ${args.value}` };
      }

      // ── Actions UI (déclenchent une carte dans le frontend) ───────────────
      case 'navigate': {
        if (!finalAction) finalAction = { type: "NAVIGATE", path: args.path, label: args.label };
        return { ok: true, summary: `Navigation vers ${args.path}` };
      }

      case 'search_products': {
        if (!finalAction) finalAction = { type: "SEARCH_PRODUCTS", query: args.query };
        return { ok: true, summary: `Recherche produits: ${args.query}` };
      }

      case 'show_booking_summary': {
        if (!finalAction) {
          finalAction = { type: "BOOKING_SUMMARY", data: {
            service: args.service || args.service_name || "",
            service_name: args.service_name || args.service || "",
            pro_name: args.pro_name || args.salon_name || "",
            pro_email: args.pro_email || "",
            salon_name: args.salon_name || args.pro_name || "",
            salon_address: args.salon_address || args.address || "",
            date: args.date || "",
            time: args.time || args.time_slot || "",
            time_slot: args.time_slot || args.time || "",
            persons: args.persons || 1,
            price: args.price || args.total_price || "",
            total_price: args.total_price || args.price || 0,
            duration_min: args.duration_min || 60,
          }};
        }
        return { ok: true, summary: `Récapitulatif réservation affiché pour ${args.service || args.service_name} le ${args.date}` };
      }

      case 'show_service_form': {
        if (!finalAction) {
          if (!isPro) {
            finalAction = { type: "REDIRECT_TO_PRO" };
            return { ok: false, summary: "Accès refusé: fonctionnalité pro uniquement." };
          }
          finalAction = { type: "SERVICE_FORM", prefill: args };
        }
        return { ok: true, summary: "Formulaire service ouvert." };
      }

      case 'show_routine_summary': {
        if (!finalAction) finalAction = { type: "ROUTINE_SUMMARY", data: args };
        return { ok: true, summary: `Routine "${args.name}" prête pour validation.` };
      }

      case 'show_pro_form': {
        if (!finalAction) {
          finalAction = { type: "OPEN_PRO_FORM", proData: { ...(ctx.memory?.pro_draft || {}), ...args } };
        }
        return { ok: true, summary: "Formulaire pro ouvert." };
      }

      // ── Actions à effet de bord ────────────────────────────────────────────
      case 'create_reservation': {
        if (finalAction) return { ok: false, summary: "Une action UI est déjà en attente." };
        try {
          const reservation = await base44.asServiceRole.entities.Reservation.create({
            client_email: user.email,
            client_name: userName || user.full_name || user.email,
            pro_email: args.pro_email,
            pro_name: args.pro_name,
            service_name: args.service_name,
            service_id: args.service_id || "",
            service_price: args.service_price || args.total_price || 0,
            date: args.date,
            time_slot: args.time_slot,
            duration_min: args.duration_min || 60,
            persons: args.persons || 1,
            total_price: args.total_price || args.service_price || 0,
            salon_name: args.salon_name,
            salon_address: args.salon_address,
            status: "en_attente",
            payment_status: "non_paye",
            payment_type: "surplace",
            notes: "Réservé via Maria IA",
          });
          await base44.asServiceRole.entities.Notification.create({
            user_email: args.pro_email,
            type: "reservation",
            title: "Nouvelle réservation via Maria IA",
            body: `${userName} a réservé "${args.service_name}" le ${args.date} à ${args.time_slot}`,
            icon: "📅", read: false,
          }).catch(() => {});
          // Auto-apprentissage
          const um = { ...(userMemoryRecord || {}), user_email: user.email };
          um.last_services = [...new Set([...(um.last_services || []), args.service_name])].slice(-5);
          um.last_pros = [...new Set([...(um.last_pros || []), args.pro_email])].slice(-5);
          const hour = args.time_slot?.split(":")?.[0];
          if (hour) um.preferred_time_slots = [...new Set([...(um.preferred_time_slots || []), `${hour}:00`])].slice(-5);
          um.last_updated = new Date().toISOString();
          if (userMemoryId) await base44.asServiceRole.entities.UserMemory.update(userMemoryId, um).catch(() => {});
          finalAction = { type: "RESERVATION_CREATED", reservation };
          return { ok: true, summary: `Réservation créée: ${args.service_name} le ${args.date} à ${args.time_slot}` };
        } catch (e) {
          console.error("create_reservation error:", e);
          return { ok: false, summary: `Erreur: ${e.message}` };
        }
      }

      case 'create_routine': {
        if (finalAction) return { ok: false, summary: "Une action UI est déjà en attente." };
        try {
          const tasks = (args.tasks || []).map((t, i) => ({
            id: `task_${i}`, label: typeof t === 'string' ? t : t.label, done: false
          }));
          const sessionsTotal = args.frequency === 'quotidien' ? (args.objectif_duree_semaines || 8) * 7
            : args.frequency === 'hebdomadaire' ? (args.objectif_duree_semaines || 8) * (args.days_of_week?.length || 1)
            : (args.objectif_duree_semaines || 8) * 3;
          const routine = await base44.asServiceRole.entities.RoutineBeaute.create({
            user_email: user.email, ...args, tasks,
            sessions_total: sessionsTotal, sessions_faites: 0, streak: 0,
            objectif_duree_semaines: args.objectif_duree_semaines || 8,
            objectif_debut: new Date().toISOString().split('T')[0],
            reminder_active: true, status: "active",
          });
          finalAction = { type: "ROUTINE_CREATED", routine };
          return { ok: true, summary: `Routine "${args.name}" créée avec ${tasks.length} étapes.` };
        } catch (e) {
          console.error("create_routine error:", e);
          return { ok: false, summary: `Erreur création routine: ${e.message}` };
        }
      }

      case 'send_message': {
        if (finalAction) return { ok: false, summary: "Une action UI est déjà en attente." };
        try {
          const convId = args.conversation_id || [user.email, args.receiver_email].sort().join("_");
          await base44.entities.MessageChat.create({
            conversation_id: convId,
            sender_email: user.email,
            sender_name: userName || user.full_name || user.email,
            receiver_email: args.receiver_email,
            receiver_name: args.receiver_name || args.receiver_email,
            content: args.content, type: "text", read: false,
          });
          await base44.asServiceRole.entities.Notification.create({
            user_email: args.receiver_email,
            type: "message",
            title: `Message de ${userName || user.full_name || user.email}`,
            body: args.content.slice(0, 80),
            icon: "💬", link: `/messages?to=${user.email}`, read: false,
          }).catch(() => {});
          finalAction = { type: "SEND_MESSAGE", ...args, conversation_id: convId };
          return { ok: true, summary: `Message envoyé à ${args.receiver_name || args.receiver_email}.` };
        } catch (e) {
          console.error("send_message error:", e);
          return { ok: false, summary: `Erreur envoi message: ${e.message}` };
        }
      }

      default:
        return { ok: false, summary: `Outil inconnu: ${tool}` };
    }
  };

  // ── Boucle ReAct principale ────────────────────────────────────────────────
  while (stepCount < MAX_AGENT_STEPS) {
    stepCount++;

    // Construire le prompt pour cette étape
    const stepPrompt = agentScratchpad
      ? `${initialPrompt}\n\n━━━ RÉSULTATS DES ÉTAPES PRÉCÉDENTES ━━━\n${agentScratchpad}\n\nContinue à agir ou fournis la réponse finale à l'utilisateur.`
      : initialPrompt;

    // Appel LLM
    let llmOutput = "";
    try { llmOutput = await callLLM(stepPrompt, voiceMode); }
    catch (e) { console.error("LLM error at step", stepCount, e); break; }

    // Parser les tool calls dans cette réponse (tous les formats)
    const knownToolNames = Object.keys(TOOL_REGISTRY);
    const toolCalls = [
      ...parseToolCalls(llmOutput),
      ...parseLegacyBlocks(llmOutput),
      ...parseBareTool(llmOutput, knownToolNames),
    ];
    // Dédupliquer par outil (garder premier)
    const seen = new Set();
    const uniqueToolCalls = toolCalls.filter(tc => { const k = tc.tool; if (seen.has(k)) return false; seen.add(k); return true; });
    const textPart = cleanReplyText(llmOutput);

    // S'il n'y a pas de tool calls → c'est la réponse finale
    if (toolCalls.length === 0) {
      finalReply = textPart;
      break;
    }

    // Séparer les tools "silencieux" (mémoire/habitudes) des tools "actifs"
    const activeTools = uniqueToolCalls.filter(tc => tc.tool !== 'save_memory' && tc.tool !== 'learn_habit');
    const silentTools = uniqueToolCalls.filter(tc => tc.tool === 'save_memory' || tc.tool === 'learn_habit');

    // Exécuter les tools silencieux immédiatement
    for (const { tool, args } of silentTools) {
      await executeTool(tool, args);
    }

    // Si pas de tools actifs → réponse finale avec ce textPart
    if (activeTools.length === 0) {
      finalReply = textPart || finalReply;
      break;
    }

    // Exécuter les tools actifs et collecter les observations
    const observations = [];
    for (const { tool, args } of activeTools) {
      const obs = await executeTool(tool, args);
      observations.push(`[${tool}] → ${obs.summary}`);
    }

    // Si on a une réponse textuelle et que les tools ont produit un résultat UI → arrêter
    if (finalAction && textPart) {
      finalReply = textPart;
      break;
    }

    // Sinon: ajouter les observations au scratchpad et continuer la boucle
    agentScratchpad += `\nÉtape ${stepCount}:\n${observations.join("\n")}\n`;

    // Si un tool UI a été déclenché, on a besoin d'une réponse finale pour l'accompagner
    if (finalAction) {
      // Demander au LLM de formuler la réponse finale
      const finalPrompt = `${initialPrompt}\n\n━━━ RÉSULTATS ━━━\n${agentScratchpad}\n\nFormule une réponse courte et naturelle pour accompagner l'action effectuée. Pas de TOOL_CALL.`;
      try {
        const finalOutput = await callLLM(finalPrompt, voiceMode);
        finalReply = cleanReplyText(finalOutput);
      } catch { finalReply = textPart || "C'est fait !"; }
      break;
    }

    // Si l'étape a produit des données mais pas d'action UI → continuer avec les observations
    if (stepCount >= MAX_AGENT_STEPS) {
      finalReply = textPart || "J'ai effectué les recherches. Voici ce que j'ai trouvé.";
      break;
    }
  }

  return { reply: finalReply || "Désolée, je n'ai pas pu traiter ta demande.", action: finalAction, memoryUpdates, habitUpdates };
}

// ── MAIN HANDLER ─────────────────────────────────────────────────────────────
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { message, fileUrls = [], voiceMode = false } = await req.json();

    // ── Chargement parallèle ──────────────────────────────────────────────────
    let conversationHistory = [], conversationId = null;
    let memory = null, userId = null;
    let userMemoryRecord = null, userMemoryId = null;
    let reservations = [], commandes = [], routines = [];
    let recentMessages = [], availablePros = [], availableServices = [];
    let isPro = user.role === "pro" || user.role === "admin";

    const [
      convResult, userResult, memResult, reservResult, commandeResult,
      routineResult, msgResult, prosResult, servicesResult, proProfileResult,
    ] = await Promise.allSettled([
      base44.asServiceRole.entities.MariaConversation.filter({ user_email: user.email }, "-updated_date", 1),
      base44.asServiceRole.entities.User.filter({ email: user.email }, null, 1),
      base44.asServiceRole.entities.UserMemory.filter({ user_email: user.email }, "-updated_date", 1),
      base44.asServiceRole.entities.Reservation.filter({ client_email: user.email }, "-created_date", 20),
      base44.asServiceRole.entities.Commande.filter({ client_email: user.email }, "-created_date", 10),
      base44.asServiceRole.entities.RoutineBeaute.filter({ user_email: user.email }, "-created_date", 10),
      base44.asServiceRole.entities.MessageChat.filter({ receiver_email: user.email }, "-created_date", 5),
      base44.asServiceRole.entities.ProfilPro.list("-created_date", 20),
      base44.asServiceRole.entities.Service.filter({ status: "actif" }, "-created_date", 50),
      base44.asServiceRole.entities.ProfilPro.filter({ user_email: user.email }, "-created_date", 1),
    ]);

    if (convResult.status === "fulfilled" && convResult.value.length > 0) {
      conversationId = convResult.value[0].id;
      conversationHistory = (convResult.value[0].messages || []).filter(m => m.role && m.content);
    }
    if (userResult.status === "fulfilled" && userResult.value[0]) {
      userId = userResult.value[0].id;
      memory = userResult.value[0].maria_memory || null;
    }
    if (memResult.status === "fulfilled" && memResult.value.length > 0) {
      userMemoryRecord = memResult.value[0];
      userMemoryId = memResult.value[0].id;
    }
    if (reservResult.status === "fulfilled") reservations = reservResult.value;
    if (commandeResult.status === "fulfilled") commandes = commandeResult.value;
    if (routineResult.status === "fulfilled") routines = routineResult.value;
    if (msgResult.status === "fulfilled") recentMessages = msgResult.value.filter(m => m.content).slice(0, 5);
    if (prosResult.status === "fulfilled") availablePros = prosResult.value.slice(0, 15);
    if (servicesResult.status === "fulfilled") availableServices = servicesResult.value.slice(0, 30);
    if (proProfileResult.status === "fulfilled" && proProfileResult.value.length > 0) isPro = true;

    const userName = user.full_name || memory?.name || userMemoryRecord?.preferences?.preferred_name || null;

    // ── Construire le prompt initial ──────────────────────────────────────────
    const condensedHistory = condenseHistory(conversationHistory);
    const historyStr = condensedHistory.map(m =>
      `${m.role === "user" ? "Utilisateur" : "Maria"}: ${m.content}`
    ).join("\n");

    const ctx = {
      base44, user, userName, memory, userMemoryRecord, userMemoryId,
      isPro, voiceMode, availablePros, availableServices, recentMessages,
      userData: { reservations, commandes, routines },
    };

    const systemPrompt = getOrchestratorPrompt(ctx);
    const fileContext = fileUrls.length > 0 ? `\n[Fichiers: ${fileUrls.join(", ")}]` : "";

    const initialPrompt = [
      systemPrompt,
      historyStr ? `\n━━━ HISTORIQUE ━━━\n${historyStr}` : "",
      `\nUtilisateur: ${message}${fileContext}`,
    ].filter(Boolean).join("\n");

    // ── Fonction LLM avec fallback ────────────────────────────────────────────
    const callLLM = async (prompt, isVoice = false) => {
      const tryGroq = async () => {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: { "Authorization": `Bearer ${Deno.env.get("GROQ_API_KEY")}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: isVoice ? 500 : 2000,
          }),
        });
        if (!res.ok) throw new Error(`Groq ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
      };

      const tryOpenRouter = async () => {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${Deno.env.get("OPENROUTER_API_KEY")}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://beautybook.app",
            "X-Title": "BeautyBook Maria",
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct:free",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.7,
            max_tokens: isVoice ? 500 : 2000,
          }),
        });
        if (!res.ok) throw new Error(`OpenRouter ${res.status}`);
        const data = await res.json();
        return data.choices?.[0]?.message?.content || "";
      };

      try { const r = await tryGroq(); console.log("✅ Groq OK"); return r; }
      catch (e) { console.warn("⚠️ Groq fallback:", e.message); return await tryOpenRouter(); }
    };

    // ── Lancer la boucle agentique ────────────────────────────────────────────
    const { reply, action, memoryUpdates, habitUpdates } = await runAgentLoop(ctx, initialPrompt, callLLM);

    // ── Persister la mémoire ──────────────────────────────────────────────────
    if (Object.keys(memoryUpdates).length > 0 && userId) {
      try {
        if (memoryUpdates.name) {
          const salonKw = /salon|studio|beauty|atelier|institut|spa|coiffure|nails|hair|shop|\d/i;
          if (memoryUpdates.name.split(" ").length > 2 || salonKw.test(memoryUpdates.name)) delete memoryUpdates.name;
        }
        let newMemory = { ...(memory || {}) };
        for (const [field, value] of Object.entries(memoryUpdates)) {
          if (field === "pro_draft" || field === "service_draft") {
            newMemory[field] = value === null ? null : { ...(newMemory[field] || {}), ...(value || {}) };
          } else if (field === "services" || field === "preferences") {
            const existing = newMemory[field] || [];
            newMemory[field] = [...new Set([...existing, ...(Array.isArray(value) ? value : [value])])];
          } else { newMemory[field] = value; }
        }
        await base44.asServiceRole.entities.User.update(userId, {
          maria_memory: newMemory,
          ...(memoryUpdates.name ? { maria_name: memoryUpdates.name } : {}),
        });
      } catch (e) { console.error("Memory save error:", e); }
    }

    // ── Persister les habitudes ───────────────────────────────────────────────
    if (habitUpdates.length > 0) {
      try {
        let um = userMemoryRecord ? { ...userMemoryRecord } : { user_email: user.email };
        for (const h of habitUpdates) {
          if (h.type === "favorite_category") um.favorite_categories = [...new Set([...(um.favorite_categories || []), h.value])].slice(-10);
          else if (h.type === "time_slot") um.preferred_time_slots = [...new Set([...(um.preferred_time_slots || []), h.value])].slice(-5);
          else if (h.type === "rdv_pattern") um.habits = [...(um.habits || []), { label: h.value, detected_at: new Date().toISOString() }].slice(-20);
          else if (h.type === "favorite_pro") um.last_pros = [...new Set([...(um.last_pros || []), h.value])].slice(-5);
          else if (h.type === "profile_summary") um.profile_summary = h.value;
        }
        um.last_updated = new Date().toISOString();
        if (userMemoryId) await base44.asServiceRole.entities.UserMemory.update(userMemoryId, um);
        else await base44.asServiceRole.entities.UserMemory.create(um);
      } catch (e) { console.error("Habit save error:", e); }
    }

    // ── Auto-apprentissage silencieux ─────────────────────────────────────────
    if (!voiceMode && reservations.length > 0 && !userMemoryRecord?.profile_summary) {
      try {
        const freq = {};
        reservations.forEach(r => { const c = r.service_name?.split(" ")[0]; if (c) freq[c] = (freq[c] || 0) + 1; });
        const topCat = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];
        if (topCat) {
          const um = { ...(userMemoryRecord || {}), user_email: user.email };
          um.favorite_categories = [...new Set([...(um.favorite_categories || []), topCat[0]])];
          um.last_updated = new Date().toISOString();
          if (userMemoryId) await base44.asServiceRole.entities.UserMemory.update(userMemoryId, um).catch(() => {});
          else await base44.asServiceRole.entities.UserMemory.create(um).catch(() => {});
        }
      } catch {}
    }

    // ── Sauvegarder la conversation ───────────────────────────────────────────
    try {
      const userMsg = { role: "user", content: message, timestamp: new Date().toISOString() };
      const assistantMsg = { role: "assistant", content: reply, timestamp: new Date().toISOString() };
      const updatedMessages = [...conversationHistory, userMsg, assistantMsg].slice(-80);
      if (conversationId) {
        await base44.asServiceRole.entities.MariaConversation.update(conversationId, { messages: updatedMessages }).catch(() => {});
      } else {
        // Créer uniquement si on a un vrai utilisateur authentifié (pas en test)
        await base44.asServiceRole.entities.MariaConversation.create({ user_email: user.email, messages: updatedMessages }).catch(() => {});
      }
    } catch (e) { /* silencieux */ }

    return Response.json({ reply, action });

  } catch (error) {
    console.error("mariaAgent fatal error:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});