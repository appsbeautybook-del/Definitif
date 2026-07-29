import { supabase } from '@/api/supabaseClient';

const REDIRECT_URL = 'https://vimusrczrjvefsbljtmf.supabase.co/auth/v1/callback';

export function isNativeApp() {
  return !!(window.Capacitor);
}

export async function signInWithOAuthMobile(provider) {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: REDIRECT_URL,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  if (data?.url) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url: data.url, presentationStyle: 'popover' });

    // Poll for session after browser opens
    const poll = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        clearInterval(poll);
        Browser.close().catch(() => {});
        window.location.href = '/#/';
        setTimeout(() => window.location.reload(), 200);
      }
    }, 1000);

    // Stop polling after 60s
    setTimeout(() => clearInterval(poll), 60000);
  }
}
