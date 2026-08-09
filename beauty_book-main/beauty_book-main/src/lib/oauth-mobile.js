import { supabase } from '@/api/supabaseClient';

const APP_SCHEME = 'com.appsbeautybook.app';

export function isNativeApp() {
  return !!(window.Capacitor);
}

export function getRedirectUrl() {
  if (isNativeApp()) {
    return `${APP_SCHEME}://auth/callback`;
  }
  return `${window.location.origin}/auth/callback`;
}

export async function signInWithOAuthMobile(provider) {
  const redirectTo = getRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  if (data?.url) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url: data.url, presentationStyle: 'popover' });

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

export async function signInWithOAuthWeb(provider) {
  const redirectTo = getRedirectUrl();

  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: false,
    },
  });

  if (error) throw error;
}
