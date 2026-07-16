import { supabase } from '@/api/supabaseClient';

const GOOGLE_CLIENT_ID = '1023053474253-o1cpsf68dfk4f54sm9idj8oolsvt48q4.apps.googleusercontent.com';

let scriptLoaded = false;

function loadGoogleScript() {
  return new Promise((resolve) => {
    if (scriptLoaded) { resolve(); return; }
    if (document.querySelector('script[src="https://accounts.google.com/gsi/client"]')) {
      scriptLoaded = true;
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => { scriptLoaded = true; resolve(); };
    document.head.appendChild(script);
  });
}

export async function signInWithGoogle() {
  await loadGoogleScript();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Google Sign-In timeout'));
    }, 60000);

    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: async (response) => {
        clearTimeout(timeout);
        try {
          if (!response.credential) {
            reject(new Error('No credential received from Google'));
            return;
          }
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: response.credential,
          });
          if (error) throw error;
          resolve(data);
        } catch (err) {
          reject(err);
        }
      },
      error_callback: (err) => {
        clearTimeout(timeout);
        reject(err);
      },
    });

    google.accounts.id.prompt((notification) => {
      if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        const container = document.createElement('div');
        container.id = 'gsi_signin_btn';
        container.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);z-index:99999;background:white;padding:24px;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,0.2);';
        document.body.appendChild(container);

        google.accounts.id.renderButton(container, {
          theme: 'outline',
          size: 'large',
          text: 'signin_with',
          shape: 'rectangular',
          width: 300,
        });

        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,0.5);z-index:99998;';
        overlay.onclick = () => {
          overlay.remove();
          container.remove();
          reject(new Error('Cancelled by user'));
        };
        document.body.appendChild(overlay);
      }
    });
  });
}
