import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { Browser } from '@capacitor/browser';

export function initCapacitor() {
  const isNative = !!window.Capacitor;

  if (!isNative) return;

  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {});

  Keyboard.addListener('keyboardWillShow', (info) => {
    document.body.style.paddingBottom = `${info.keyboardHeight}px`;
  }).catch(() => {});

  Keyboard.addListener('keyboardWillHide', () => {
    document.body.style.paddingBottom = '0px';
  }).catch(() => {});

  SplashScreen.hide().catch(() => {});

  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.minimizeApp();
    }
  }).catch(() => {});

  // Handle OAuth callback via deep link
  App.addListener('appUrlOpen', async (event) => {
    const url = event.url;
    if (!url) return;

    // Close the browser
    Browser.close().catch(() => {});

    // Parse tokens from hash or query
    let hash = '';
    if (url.includes('#')) {
      hash = url.split('#')[1];
    } else if (url.includes('?')) {
      hash = url.split('?')[1];
    }

    if (!hash) return;

    const params = new URLSearchParams(hash);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (accessToken && refreshToken) {
      try {
        const { supabase } = await import('@/api/supabaseClient');
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        // Navigate to home and reload to pick up the new session
        window.location.href = '/#/';
        setTimeout(() => window.location.reload(), 300);
      } catch (e) {
        console.error('[OAuth] Failed to set session:', e);
      }
    }
  }).catch(() => {});
}
