import { supabase } from '@/api/supabaseClient';

const REDIRECT_SCHEME = 'com.appsbeautybook.app';
const REDIRECT_PATH = 'auth/callback';

export function getRedirectUrl() {
  return `${REDIRECT_SCHEME}://${REDIRECT_PATH}`;
}

export function isNativeApp() {
  return !!(window.Capacitor);
}

export async function signInWithOAuthMobile(provider) {
  const redirectUrl = getRedirectUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;

  if (data?.url) {
    const { Browser } = await import('@capacitor/browser');
    await Browser.open({ url: data.url, presentationStyle: 'popover' });
  }
}

export async function handleOAuthCallback(url) {
  const hash = url.split('#')[1] || url.split('?')[1];
  if (!hash) return false;

  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');

  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return !error;
  }
  return false;
}
