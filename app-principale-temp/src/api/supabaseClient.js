import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl === 'https://VOTRE-PROJET.supabase.co') {
  console.error(
    '[Supabase] Configuration manquante !\n' +
    '→ Créez le fichier .env.local à la racine du projet avec :\n' +
    '  VITE_SUPABASE_URL=https://votre-projet.supabase.co\n' +
    '  VITE_SUPABASE_ANON_KEY=votre_cle_anon\n' +
    '→ Sans ces variables, les uploads de médias et les opérations en base ne fonctionneront pas.'
  );
}

export const supabase = (supabaseUrl && supabaseAnonKey && supabaseUrl !== 'https://VOTRE-PROJET.supabase.co')
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    })
  : null;
