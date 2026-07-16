/**
 * AdminAPI — Point d'entrée unique et sécurisé pour toutes les opérations d'administration.
 * 
 * Authentification : Header "x-admin-token" requis.
 * Le token est défini dans la variable d'environnement ADMIN_SECRET_TOKEN.
 * 
 * Body JSON attendu :
 *   { action: string, params: object }
 * 
 * Actions disponibles :
 *   - getStats
 *   - listUsers / updateUserRole
 *   - listStyles / deleteStyle / toggleStyleStatus
 *   - listReels / deleteReel / toggleReelStatus
 *   - listLives / deleteLive / toggleLiveStatus
 *   - listServices / toggleServiceStatus
 *   - listCommandes / updateCommandeStatus
 *   - listReservations / updateReservationStatus
 *   - listAnnonces / createAnnonce / deleteAnnonce / toggleAnnonceStatus
 *   - listProfilsPro / verifyProfil / suspendProfil
 *   - listAvis / deleteAvis
 *   - sendNotification
 *   - listPublications / deletePublication / togglePublicationStatus
 */

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-admin-token",
};

Deno.serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400, headers: corsHeaders });
  }

  const { action, params = {} } = body;
  const expectedToken = Deno.env.get("ADMIN_SECRET_TOKEN");

  // ── Action "login" : vérification via ADMIN_SECRET_TOKEN uniquement ──
  if (action === "login") {
    const { token: loginToken } = params;
    if (loginToken && expectedToken && loginToken === expectedToken) {
      return Response.json({ success: true, data: { token: expectedToken } }, { headers: corsHeaders });
    } else {
      return Response.json({ success: false, error: "Token invalide" }, { status: 401, headers: corsHeaders });
    }
  }

  // ── Auth check — token accepté depuis le header OU le body ──
  const token = req.headers.get("x-admin-token") || body._adminToken || "";
  if (!token || !expectedToken || token !== expectedToken) {
    return Response.json({ error: "Unauthorized" }, { status: 401, headers: corsHeaders });
  }

  const base44 = createClientFromRequest(req);
  const db = base44.asServiceRole.entities;

  try {
    let result;

    switch (action) {

      // ── STATS ──
      case "getStats": {
        const [reels, services, commandes, reservations, users, lives, styles] = await Promise.all([
          db.Reel.list("-created_date", 1000),
          db.Service.list("-created_date", 1000),
          db.Commande.list("-created_date", 1000),
          db.Reservation.list("-created_date", 1000),
          db.User.list("-created_date", 1000),
          db.LiveSession.list("-created_date", 1000),
          db.Style.list("-created_date", 1000),
        ]);
        result = {
          reels: reels.length,
          reels_publie: reels.filter(r => r.status === "publie").length,
          services: services.length,
          commandes: commandes.length,
          commandes_pending: commandes.filter(c => c.status === "en_attente").length,
          reservations: reservations.length,
          reservations_pending: reservations.filter(r => r.status === "en_attente").length,
          users: users.length,
          lives_actifs: lives.filter(l => l.status === "live").length,
          styles: styles.length,
        };
        break;
      }

      // ── USERS ──
      case "listUsers": {
        result = await db.User.list("-created_date", 500);
        break;
      }
      case "updateUserRole": {
        result = await db.User.update(params.id, { role: params.role });
        break;
      }

      // ── STYLES ──
      case "listStyles": {
        result = await db.Style.list("-created_date", 500);
        break;
      }
      case "toggleStyleStatus": {
        const style = await db.Style.get(params.id);
        const newStatus = style.status === "publie" ? "brouillon" : "publie";
        result = await db.Style.update(params.id, { status: newStatus });
        break;
      }
      case "deleteStyle": {
        await db.Style.delete(params.id);
        result = { success: true };
        break;
      }
      case "createStyle": {
        result = await db.Style.create({ ...params.data, likes: 0, views: 0, featured: false });
        break;
      }

      // ── REELS ──
      case "listReels": {
        result = await db.Reel.list("-created_date", 500);
        break;
      }
      case "toggleReelStatus": {
        const reel = await db.Reel.get(params.id);
        const newStatus = reel.status === "publie" ? "brouillon" : "publie";
        result = await db.Reel.update(params.id, { status: newStatus });
        break;
      }
      case "deleteReel": {
        await db.Reel.delete(params.id);
        result = { success: true };
        break;
      }

      // ── LIVES ──
      case "listLives": {
        result = await db.LiveSession.list("-created_date", 200);
        break;
      }
      case "toggleLiveStatus": {
        const live = await db.LiveSession.get(params.id);
        const newStatus = live.status === "live" ? "ended" : "live";
        result = await db.LiveSession.update(params.id, { status: newStatus });
        break;
      }
      case "deleteLive": {
        await db.LiveSession.delete(params.id);
        result = { success: true };
        break;
      }

      // ── SERVICES ──
      case "listServices": {
        result = await db.Service.list("-created_date", 500);
        break;
      }
      case "toggleServiceStatus": {
        const svc = await db.Service.get(params.id);
        const newStatus = svc.status === "actif" ? "inactif" : "actif";
        result = await db.Service.update(params.id, { status: newStatus });
        break;
      }

      // ── COMMANDES ──
      case "listCommandes": {
        result = await db.Commande.list("-created_date", 500);
        break;
      }
      case "updateCommandeStatus": {
        result = await db.Commande.update(params.id, { status: params.status });
        break;
      }

      // ── RESERVATIONS ──
      case "listReservations": {
        result = await db.Reservation.list("-created_date", 500);
        break;
      }
      case "updateReservationStatus": {
        result = await db.Reservation.update(params.id, { status: params.status });
        break;
      }

      // ── ANNONCES ──
      case "listAnnonces": {
        result = await db.Annonce.list("-created_date", 200);
        break;
      }
      case "createAnnonce": {
        result = await db.Annonce.create({ ...params.data, clicks: 0, impressions: 0 });
        break;
      }
      case "toggleAnnonceStatus": {
        const annonce = await db.Annonce.get(params.id);
        const newStatus = annonce.status === "actif" ? "pause" : "actif";
        result = await db.Annonce.update(params.id, { status: newStatus });
        break;
      }
      case "deleteAnnonce": {
        await db.Annonce.delete(params.id);
        result = { success: true };
        break;
      }

      // ── PROFILS PRO ──
      case "listProfilsPro": {
        result = await db.ProfilPro.list("-created_date", 500);
        break;
      }
      case "verifyProfil": {
        result = await db.ProfilPro.update(params.id, { verified: true });
        break;
      }
      case "suspendProfil": {
        result = await db.ProfilPro.update(params.id, { verified: false, status: "pause" });
        break;
      }

      // ── AVIS ──
      case "listAvis": {
        result = await db.CommentaireStyle.list("-created_date", 500);
        break;
      }
      case "deleteAvis": {
        await db.CommentaireStyle.delete(params.id);
        result = { success: true };
        break;
      }

      // ── NOTIFICATIONS ──
      case "sendNotification": {
        const { target, title, body, type, link } = params;
        if (target === "all") {
          const users = await db.User.list("-created_date", 1000);
          await Promise.all(users.map(u =>
            db.Notification.create({ user_email: u.email, title, body, type: type || "system", link, read: false })
          ));
          result = { sent: users.length };
        } else {
          await db.Notification.create({ user_email: target, title, body, type: type || "system", link, read: false });
          result = { sent: 1 };
        }
        break;
      }

      // ── PUBLICATIONS ──
      case "listPublications": {
        result = await db.Reel.list("-created_date", 500);
        break;
      }
      case "deletePublication": {
        await db.Reel.delete(params.id);
        result = { success: true };
        break;
      }
      case "togglePublicationStatus": {
        const pub = await db.Reel.get(params.id);
        const newStatus = pub.status === "publie" ? "brouillon" : "publie";
        result = await db.Reel.update(params.id, { status: newStatus });
        break;
      }

      default:
        return Response.json({ error: `Unknown action: ${action}` }, { status: 400, headers: corsHeaders });
    }

    return Response.json({ success: true, data: result }, { headers: corsHeaders });

  } catch (error) {
    console.error(`[AdminAPI] Error on action "${action}":`, error.message);
    return Response.json({ error: error.message }, { status: 500, headers: corsHeaders });
  }
});