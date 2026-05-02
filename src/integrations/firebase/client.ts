// Firebase client — Analytics only.
// User authentication is handled by Lovable Cloud (Supabase), not Firebase.
import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics, logEvent as fbLogEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyC4FmjThQp7x-Gc2SpwVoD3uTUekCETHys",
  authDomain: "lalraja-2cb45.firebaseapp.com",
  projectId: "lalraja-2cb45",
  storageBucket: "lalraja-2cb45.firebasestorage.app",
  messagingSenderId: "941956187916",
  appId: "1:941956187916:web:e8d71f3fac079bc4532b29",
  measurementId: "G-2EQS2BJT8B",
};

export const firebaseApp: FirebaseApp = initializeApp(firebaseConfig);

let _analytics: Analytics | null = null;

if (typeof window !== "undefined") {
  isSupported()
    .then((ok) => {
      if (ok) _analytics = getAnalytics(firebaseApp);
    })
    .catch(() => {
      // Analytics not supported in this environment — silently ignore.
    });
}

/** Safe wrapper — only logs if Analytics initialized. */
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
  try {
    if (_analytics) fbLogEvent(_analytics, eventName, params as Record<string, any>);
  } catch {
    // ignore
  }
}
