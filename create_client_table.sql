CREATE TABLE IF NOT EXISTS "Client" (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pro_email TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  tags TEXT[] DEFAULT '{}',
  source TEXT DEFAULT 'manuel',
  total_spent NUMERIC DEFAULT 0,
  total_rdv INTEGER DEFAULT 0,
  last_rdv_date TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  created_by_id UUID
);

-- Index pour rechercher les clients par pro
CREATE INDEX IF NOT EXISTS idx_client_pro_email ON "Client"(pro_email);
CREATE INDEX IF NOT EXISTS idx_client_email ON "Client"(email);

-- RLS (Row Level Security)
ALTER TABLE "Client" ENABLE ROW LEVEL SECURITY;

-- Policy: les pros peuvent voir/modifier leurs propres clients
CREATE POLICY "Pros can view their own clients" ON "Client"
  FOR SELECT USING (pro_email = auth.email());

CREATE POLICY "Pros can insert their own clients" ON "Client"
  FOR INSERT WITH CHECK (pro_email = auth.email());

CREATE POLICY "Pros can update their own clients" ON "Client"
  FOR UPDATE USING (pro_email = auth.email());

CREATE POLICY "Pros can delete their own clients" ON "Client"
  FOR DELETE USING (pro_email = auth.email());
