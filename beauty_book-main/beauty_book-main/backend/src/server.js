import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { supabaseAdmin } from './config/supabase.js';
import pgClient from './config/pg.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import paymentRoutes from './routes/payment.routes.js';
import reservationRoutes from './routes/reservation.routes.js';
import cartRoutes from './routes/cart.routes.js';
import commandeRoutes from './routes/commande.routes.js';
import adminRoutes from './routes/admin.routes.js';
import accountRoutes from './routes/account.routes.js';
import authRoutes from './routes/auth.routes.js';
import mapsRoutes from './routes/maps.routes.js';
import proRoutes from './routes/pro.routes.js';
import feedRoutes from './routes/feed.routes.js';
import contentRoutes from './routes/content.routes.js';
import communicationRoutes from './routes/communication.routes.js';
import aiRoutes from './routes/ai.routes.js';
import webhookRoutes from './routes/webhook.routes.js';
import phase8Routes from './routes/phase8.routes.js';
import crudRoutes from './routes/crud.routes.js';

dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
}));

// JSON body parser
app.use(express.json({ limit: '50mb' }));

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Upload endpoint
app.post('/api/upload', async (req, res) => {
  try {
    const { name, type, content } = req.body;
    if (!content) return res.status(400).json({ error: 'Missing content' });
    const ext = name?.split('.').pop() || 'jpg';
    const filename = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const buffer = Buffer.from(content, 'base64');
    const { data, error } = await supabaseAdmin.storage.from('uploads').upload(filename, buffer, {
      contentType: type || 'image/jpeg',
      cacheControl: '3600',
      upsert: false,
    });
    if (error) {
      console.error('[upload] Storage error:', JSON.stringify(error));
      return res.status(500).json({ error: error.message, details: error });
    }
    const { data: { publicUrl } } = supabaseAdmin.storage.from('uploads').getPublicUrl(data.path);
    res.json({ file_url: publicUrl });
  } catch (err) {
    console.error('[upload] Exception:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
});

// ─── DemandeProV2 endpoint (SQL brut, bypass PostgREST cache) ────────────────
app.get('/api/demande-pro/status', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'email requis' });
    const { rows } = await pgClient.query(
      `SELECT id, statut, salon_name, created_at FROM "DemandeProV2" WHERE user_email = $1 ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    res.json({ demande: rows[0] || null });
  } catch (err) {
    console.error('[demande-pro/status] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/demande-pro', async (req, res) => {
  try {
    const d = req.body;
    const cols = [
      'user_email','username','salon_name','bio','type_activite','years_experience',
      'services','categories','specialites_cheveux','salon_photo','portfolio',
      'phone','email_pro','siret',
      'doc_identite_recto','doc_identite_verso','doc_siret','doc_assurance',
      'days','time_slots','commodites','seats_count','se_deplace','travail_nuit',
      'visite_video_url','diplomes','has_diplome','address','city'
    ];
    const jsonbCols = new Set(['services','categories','specialites_cheveux','portfolio','days','time_slots','commodites','diplomes']);
    const vals = cols.map(c => {
      const v = d[c] !== undefined ? d[c] : null;
      if (jsonbCols.has(c) && v !== null) {
        return typeof v === 'string' ? v : JSON.stringify(v);
      }
      return v;
    });

    // Build SQL with explicit ::jsonb cast for JSONB columns
    const colList = cols.join(', ');
    const valPlaceholders = cols.map((c, i) => jsonbCols.has(c) ? `$${i + 1}::jsonb` : `$${i + 1}`);

    // Check existing
    const existing = await pgClient.query(
      'SELECT id FROM "DemandeProV2" WHERE user_email = $1 ORDER BY created_at DESC LIMIT 1',
      [d.user_email]
    );

    let result;
    if (existing.rows.length > 0) {
      const setClauses = cols.map((c, i) => jsonbCols.has(c) ? `${c} = $${i + 1}::jsonb` : `${c} = $${i + 1}`);
      const updateVals = [...vals, existing.rows[0].id];
      result = await pgClient.query(
        `UPDATE "DemandeProV2" SET ${setClauses.join(', ')}, statut = 'en_attente' WHERE id = $${cols.length + 1} RETURNING id`,
        updateVals
      );
    } else {
      result = await pgClient.query(
        `INSERT INTO "DemandeProV2" (${colList}) VALUES (${valPlaceholders.join(', ')}) RETURNING id`,
        vals
      );
    }

    res.json({ success: true, id: result.rows[0]?.id });
  } catch (err) {
    console.error('[demande-pro] Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Routes
app.use('/api/payments', paymentRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/commandes', commandeRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/account', accountRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/maps', mapsRoutes);
app.use('/api/pro', proRoutes);
app.use('/api/feed', feedRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/v8', phase8Routes);
app.use('/api/crud', crudRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route non trouvée: ${req.method} ${req.path}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('❌ Unhandled error:', err.message, err.stack);
  res.status(500).json({ error: err.message || 'Erreur serveur interne' });
});

app.listen(PORT, async () => {
  console.log(`✅ Backend BeautyBook démarré sur le port ${PORT}`);

  // Auto-create missing tables at startup
  try {
    const { default: pgClient } = await import('./config/pg.js');
    const tables = [
      `CREATE TABLE IF NOT EXISTS user_like (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email TEXT NOT NULL DEFAULT '',
        user_name TEXT NOT NULL DEFAULT '',
        user_avatar TEXT NOT NULL DEFAULT '',
        target_id TEXT NOT NULL DEFAULT '',
        target_type TEXT NOT NULL DEFAULT 'reel',
        created_at TIMESTAMPTZ DEFAULT now()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_ul_target ON user_like(target_id, target_type)`,
      `CREATE INDEX IF NOT EXISTS idx_ul_user ON user_like(user_email)`,
      `DO $$ BEGIN CREATE UNIQUE INDEX IF NOT EXISTS idx_ul_unique ON user_like(user_email, target_id, target_type); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `ALTER TABLE user_like ENABLE ROW LEVEL SECURITY`,
      `DROP POLICY IF EXISTS "ul_all" ON user_like`,
      `CREATE POLICY "ul_all" ON user_like FOR ALL USING (true) WITH CHECK (true)`,

      `CREATE TABLE IF NOT EXISTS reel_comment (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        reel_id TEXT NOT NULL DEFAULT '',
        user_email TEXT NOT NULL DEFAULT '',
        user_name TEXT NOT NULL DEFAULT '',
        user_avatar TEXT NOT NULL DEFAULT '',
        content TEXT NOT NULL DEFAULT '',
        likes INTEGER DEFAULT 0,
        reactions JSONB DEFAULT NULL,
        parent_id UUID DEFAULT NULL,
        created_at TIMESTAMPTZ DEFAULT now(),
        updated_at TIMESTAMPTZ DEFAULT now()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_rc_reel ON reel_comment(reel_id)`,
      `CREATE INDEX IF NOT EXISTS idx_rc_parent ON reel_comment(parent_id)`,
      `ALTER TABLE reel_comment ENABLE ROW LEVEL SECURITY`,
      `DROP POLICY IF EXISTS "rc_all" ON reel_comment`,
      `CREATE POLICY "rc_all" ON reel_comment FOR ALL USING (true) WITH CHECK (true)`,

      `CREATE TABLE IF NOT EXISTS reel_comment_report (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        comment_id UUID NOT NULL,
        reporter_email TEXT NOT NULL DEFAULT '',
        reel_id TEXT NOT NULL DEFAULT '',
        reason TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT now()
      )`,
      `ALTER TABLE reel_comment_report ENABLE ROW LEVEL SECURITY`,
      `DROP POLICY IF EXISTS "rcr_all" ON reel_comment_report`,
      `CREATE POLICY "rcr_all" ON reel_comment_report FOR ALL USING (true) WITH CHECK (true)`,

      `CREATE TABLE IF NOT EXISTS user_follow (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_email TEXT NOT NULL DEFAULT '',
        follower_name TEXT NOT NULL DEFAULT '',
        follower_avatar TEXT NOT NULL DEFAULT '',
        followed_email TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ DEFAULT now()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_uf_followed ON user_follow(followed_email)`,
      `DO $$ BEGIN CREATE UNIQUE INDEX IF NOT EXISTS idx_uf_unique ON user_follow(follower_email, followed_email); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
      `ALTER TABLE user_follow ENABLE ROW LEVEL SECURITY`,
      `DROP POLICY IF EXISTS "uf_all" ON user_follow`,
      `CREATE POLICY "uf_all" ON user_follow FOR ALL USING (true) WITH CHECK (true)`,

      `CREATE TABLE IF NOT EXISTS user_favorite (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_email TEXT NOT NULL DEFAULT '',
        target_id TEXT NOT NULL DEFAULT '',
        target_type TEXT NOT NULL DEFAULT 'reel',
        target_title TEXT NOT NULL DEFAULT '',
        target_image TEXT NOT NULL DEFAULT '',
        target_data JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT now()
      )`,
      `CREATE INDEX IF NOT EXISTS idx_ufav_user ON user_favorite(user_email)`,
      `ALTER TABLE user_favorite ENABLE ROW LEVEL SECURITY`,
      `DROP POLICY IF EXISTS "ufav_all" ON user_favorite`,
      `CREATE POLICY "ufav_all" ON user_favorite FOR ALL USING (true) WITH CHECK (true)`,

      `DO $$ BEGIN ALTER TABLE reel_comment ADD COLUMN reactions JSONB DEFAULT NULL; EXCEPTION WHEN duplicate_column THEN NULL; END $$`,
    ];
    let ok = 0;
    for (const sql of tables) {
      try { await pgClient.query(sql); ok++; } catch {}
    }
    // Refresh Supabase schema cache so new tables are visible via PostgREST
    try { await pgClient.query("NOTIFY pgrst, 'reload schema'"); } catch {}
    console.log(`✅ Tables auto-créées: ${ok}/${tables.length}`);
  } catch (e) {
    console.error('⚠️ Auto-migration failed:', e.message);
  }
});
