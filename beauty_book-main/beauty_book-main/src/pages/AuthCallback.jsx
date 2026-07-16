import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';
import { handleGoogleCallback } from '@/lib/googleOAuth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Connexion en cours...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const hash = window.location.hash || '';
        const search = window.location.search || '';

        if (hash.includes('id_token=')) {
          setStatus('Connexion Google en cours...');
          const result = await handleGoogleCallback();
          if (result.error) {
            console.error('[AuthCallback] Google callback error:', result.error);
            setStatus('Erreur de connexion Google. Redirection...');
            setTimeout(() => navigate('/connexion', { replace: true }), 1500);
            return;
          }
          localStorage.setItem('bb_onboarded', '1');
          navigate(result.redirectTo || '/', { replace: true });
          return;
        }

        if (search.includes('code=') || hash.includes('access_token=')) {
          setStatus('Finalisation de la connexion...');
          const { data: { session }, error } = await supabase.auth.getSession();
          if (error) {
            console.error('[AuthCallback] Supabase callback error:', error);
            setStatus('Erreur de connexion. Redirection...');
            setTimeout(() => navigate('/connexion', { replace: true }), 1500);
            return;
          }
          if (session?.user) {
            const socialSignup = sessionStorage.getItem('bb_social_signup');
            sessionStorage.removeItem('bb_social_signup');
            if (socialSignup) {
              navigate('/onboarding', { replace: true });
            } else {
              localStorage.setItem('bb_onboarded', '1');
              navigate('/', { replace: true });
            }
            return;
          }
        }

        setStatus('Aucune session trouvée. Redirection...');
        setTimeout(() => navigate('/connexion', { replace: true }), 1500);
      } catch (e) {
        console.error('[AuthCallback] error:', e);
        navigate('/connexion', { replace: true });
      }
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">{status}</p>
      </div>
    </div>
  );
}
