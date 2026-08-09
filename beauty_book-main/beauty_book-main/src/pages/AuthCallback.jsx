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
        const hash = window.location.hash;
        const hasTokens = hash && hash.includes('access_token');

        if (!hasTokens) {
          const { data: { session }, error } = await supabase.auth.getSession();
          
          if (!mounted) return;

          if (session?.user) {
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
                .single();

              if (profile) {
                localStorage.setItem('bb_onboarded', '1');
                navigate('/', { replace: true });
              } else {
                sessionStorage.setItem('bb_social_signup', '1');
                navigate('/onboarding', { replace: true });
              }
            }
          } else {
            setStatus('Redirection vers l\'accueil...');
            localStorage.setItem('bb_onboarded', '1');
            navigate('/', { replace: true });
          }
          return;
        }

        await new Promise(r => setTimeout(r, 500));

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!mounted) return;

        if (session?.user) {
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
              .single();

            if (profile) {
              localStorage.setItem('bb_onboarded', '1');
              navigate('/', { replace: true });
            } else {
              sessionStorage.setItem('bb_social_signup', '1');
              navigate('/onboarding', { replace: true });
            }
          }
        } else {
          await new Promise(r => setTimeout(r, 1000));
          const { data: { session: retrySession } } = await supabase.auth.getSession();
          
          if (!mounted) return;

          if (retrySession?.user) {
            const socialSignup = sessionStorage.getItem('bb_social_signup');
            
            if (socialSignup) {
              sessionStorage.removeItem('bb_social_signup');
              sessionStorage.setItem('bb_social_signup_processed', '1');
              navigate('/onboarding', { replace: true });
            } else {
              const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', retrySession.user.id)
                .single();

              if (profile) {
                localStorage.setItem('bb_onboarded', '1');
                navigate('/', { replace: true });
              } else {
                sessionStorage.setItem('bb_social_signup', '1');
                navigate('/onboarding', { replace: true });
              }
            }
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
