import { supabase } from '@/api/supabaseClient';

const GOOGLE_CLIENT_ID = '1023053474253-o1cpsf68dfk4f54sm9idj8oolsvt48q4.apps.googleusercontent.com';

function generateNonce() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('');
}

export function getGoogleOAuthUrl(redirectTo) {
  const nonce = generateNonce();
  sessionStorage.setItem('google_oauth_nonce', nonce);
  if (redirectTo) sessionStorage.setItem('google_oauth_redirect', redirectTo);

  const params = new URLSearchParams({
    response_type: 'id_token',
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: `${window.location.origin}/auth/callback`,
    scope: 'openid email profile',
    nonce,
    prompt: 'select_account',
    state: redirectTo || '/',
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function redirectToGoogle(redirectTo) {
  window.location.href = getGoogleOAuthUrl(redirectTo);
}

export async function handleGoogleCallback() {
  const hash = window.location.hash;
  if (!hash || hash.length < 2) return { error: 'No hash in URL' };

  const params = new URLSearchParams(hash.substring(1));
  const idToken = params.get('id_token');
  const error = params.get('error');

  if (error) return { error: params.get('error_description') || error };
  if (!idToken) return { error: 'No id_token in callback' };

  const { data, error: signInError } = await supabase.auth.signInWithIdToken({
    provider: 'google',
    token: idToken,
  });

  if (signInError) return { error: signInError.message };

  const redirectTo = sessionStorage.getItem('google_oauth_redirect') || '/';
  sessionStorage.removeItem('google_oauth_nonce');
  sessionStorage.removeItem('google_oauth_redirect');

  return { data, redirectTo };
}
