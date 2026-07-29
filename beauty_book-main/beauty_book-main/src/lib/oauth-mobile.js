import { supabase } from '@/api/supabaseClient';

const REDIRECT_URL = 'com.appsbeautybook.app://auth/callback';

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

    // Session will be handled by appUrlOpen listener in capacitor-init.js
    // Poll as fallback in case appUrlOpen doesn't fire
    const poll = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        clearInterval(poll);
        Browser.close().catch(() => {});
        window.location.href = '/#/';
        setTimeout(() => window.location.reload(), 200);
      }
    }, 1500);

    setTimeout(() => clearInterval(poll), 60000);
  }
}
