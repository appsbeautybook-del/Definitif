import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Connexion en cours...');

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      try {
        // Supabase met les tokens dans le hash: #access_token=...&expires_at=...
        // Si on est sur /auth/callback, on traite normalement
        // Sinon, on laisse le App.jsx principal gérer

        const hash = window.location.hash;
        const hasTokens = hash && hash.includes('access_token');

        if (!hasTokens) {
          // Pas de tokens dans le hash, vérifier la session existante
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (!mounted) return;

          if (session?.user) {
            setStatus('Connexion réussie ! Redirection...');
            localStorage.setItem('bb_onboarded', '1');
            navigate('/', { replace: true });
          } else {
            setStatus('Redirection vers l\'accueil...');
            localStorage.setItem('bb_onboarded', '1');
            navigate('/', { replace: true });
          }
          return;
        }

        // Tokens trouvés dans le hash - Supabase les a déjà traités
        // Attendre que le client Supabase les enregistre
        await new Promise(r => setTimeout(r, 500));

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
          setStatus('Connexion réussie ! Redirection...');
          localStorage.setItem('bb_onboarded', '1');
          sessionStorage.removeItem('bb_social_signup');
          navigate('/', { replace: true });
        } else {
          // Tokens présents mais session pas encore créée - réessayer
          await new Promise(r => setTimeout(r, 1000));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (!mounted) return;

          if (retrySession?.user) {
            localStorage.setItem('bb_onboarded', '1');
            navigate('/', { replace: true });
          } else {
            localStorage.setItem('bb_onboarded', '1');
            navigate('/', { replace: true });
          }
        }
      } catch (e) {
        console.error('[AuthCallback] error:', e);
        if (mounted) {
          localStorage.setItem('bb_onboarded', '1');
          navigate('/', { replace: true });
        }
      }
    };

    handleCallback();

    // Fallback de sécurité
    const timeout = setTimeout(() => {
      if (mounted) {
        localStorage.setItem('bb_onboarded', '1');
        navigate('/', { replace: true });
      }
    }, 4000);

    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center font-display">
      <div className="text-center">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-[#E8732A] rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-[14px] font-medium">{status}</p>
      </div>
    </div>
  );
}
