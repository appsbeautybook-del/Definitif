import { App } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Keyboard } from '@capacitor/keyboard';
import { SplashScreen } from '@capacitor/splash-screen';
import { Browser } from '@capacitor/browser';

export function initCapacitor() {
  const isNative = !!window.Capacitor;

  if (!isNative) return;

  // Status bar
  StatusBar.setStyle({ style: Style.Light }).catch(() => {});
  StatusBar.setBackgroundColor({ color: '#ffffff' }).catch(() => {});

  // Keyboard adjustments
  Keyboard.addListener('keyboardWillShow', (info) => {
    document.body.style.paddingBottom = `${info.keyboardHeight}px`;
  }).catch(() => {});

  Keyboard.addListener('keyboardWillHide', () => {
    document.body.style.paddingBottom = '0px';
  }).catch(() => {});

  // Hide splash screen
  SplashScreen.hide().catch(() => {});

  // Handle back button (Android)
  App.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    } else {
      App.minimizeApp();
    }
  }).catch(() => {});

  // Handle OAuth deep link callback
  App.addListener('appUrlOpen', (event) => {
    const url = event.url;
    if (url && url.includes('auth/callback')) {
      Browser.close().catch(() => {});

      import('@/lib/oauth-mobile').then(({ handleOAuthCallback }) => {
        handleOAuthCallback(url).then((success) => {
          if (success) {
            window.location.href = '/#/';
            setTimeout(() => window.location.reload(), 100);
          }
        });
      });
    }
  }).catch(() => {});
}
