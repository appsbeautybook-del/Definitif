import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.appsbeautybook.app',
  appName: 'BeautyBook',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*.supabase.co'],
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: true,
      launchShowDuration: 2000,
      backgroundColor: '#ffffff',
      showSpinner: true,
      spinnerColor: '#f97316',
    },
    Keyboard: {
      resize: 'body',
      style: 'dark',
    },
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined,
    },
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#ffffff',
  },
};

export default config;
