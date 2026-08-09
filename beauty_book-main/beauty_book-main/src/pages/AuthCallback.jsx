import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/api/supabaseClient';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('Connexion en cours...');

  useEffect(() => {
    let done = false;

    const handleCallback = async () => {
      if (done) return;

      try {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          await new Promise(r => setTimeout(r, 1500));
        }

        const { data: { session }, error } = await supabase.auth.getSession();

        if (done) return;

        if (error) {
          console.error('[AuthCallback] getSession error:', error);
          setStatus('Erreur de connexion. Redirection...');
          setTimeout(() => { if (!done) navigate('/connexion', { replace: true }); }, 1500);
          return;
        }

        if (session?.user) {
          done = true;
          const socialSignup = sessionStorage.getItem('bb_social_signup');

          if (socialSignup) {
            sessionStorage.removeItem('bb_social_signup');
            sessionStorage.setItem('bb_social_signup_processed', '1');
            navigate('/onboarding', { replace: true });
          } else {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id')
              .eq('id', session.user.id)
              .maybeSingle();

            if (done) return;

            if (profile) {
              localStorage.setItem('bb_onboarded', '1');
              navigate('/', { replace: true });
            } else {
              sessionStorage.setItem('bb_social_signup', '1');
              navigate('/onboarding', { replace: true });
            }
          }
        } else {
          setStatus('Aucune session trouvée. Redirection...');
          setTimeout(() => { if (!done) navigate('/connexion', { replace: true }); }, 1500);
        }
      } catch (e) {
        console.error('[AuthCallback] error:', e);
        if (!done) navigate('/connexion', { replace: true });
      }
    };

    handleCallback();

    const timeout = setTimeout(() => {
      if (!done) {
        done = true;
        navigate('/connexion', { replace: true });
      }
    }, 8000);

    return () => {
      done = true;
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
