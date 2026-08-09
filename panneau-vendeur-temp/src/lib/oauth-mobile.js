import { supabase } from '@/api/supabaseClient';

export function isNativeApp() {
  return !!(window.Capacitor);
}

export function getRedirectUrl() {
  if (isNativeApp()) {
    return 'com.appsbeautybook.app://auth/callback';
  }
  return window.location.origin + '/auth/callback';
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
