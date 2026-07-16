import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl.includes('placeholder') || supabaseUrl === 'https://vimusrczrjvefsbljtmf.supabase.co' && !supabaseKey) {
  console.error('❌ [Supabase] SUPABASE_URL est manquante ou invalide.');
}

if (!supabaseKey || supabaseKey === 'your_service_role_key_here') {
  console.warn('⚠️ [Supabase] SUPABASE_SERVICE_ROLE_KEY contient une valeur par défaut/placeholder. Certaines requêtes admin échoueront.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey);

