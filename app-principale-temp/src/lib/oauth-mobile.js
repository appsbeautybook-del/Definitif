import { supabase } from '@/api/supabaseClient';

export function isNativeApp() {
  return false;
}

export function getRedirectUrl() {
  return `${window.location.origin}/auth/callback`;
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
