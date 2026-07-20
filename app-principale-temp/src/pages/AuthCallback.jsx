import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Connexion en cours...');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error('[AuthCallback] getSession error:', error);
          setStatus('Erreur de connexion. Redirection...');
          setTimeout(() => navigate('/connexion', { replace: true }), 1500);
          return;
        }

        if (session?.user) {
          const socialSignup = sessionStorage.getItem('bb_social_signup');

          if (socialSignup) {
            navigate('/onboarding', { replace: true });
          } else {
            localStorage.setItem('bb_onboarded', '1');
            navigate('/', { replace: true });
          }
        } else {
          setStatus('Aucune session trouvée. Redirection...');
          setTimeout(() => navigate('/connexion', { replace: true }), 1500);
        }
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
