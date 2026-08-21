import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported as isAnalyticsSupported } from "firebase/analytics";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// ---------------------------------------------------------------------------
// 1. RAW CONFIG — sourced from VITE_FIREBASE_* environment variables
// ---------------------------------------------------------------------------
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "krishna-web-os.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "krishna-web-os",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "krishna-web-os.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "448489243298",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:448489243298:web:84811c480b688a58f58dfb",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-METXLNCQGW",
};

// ---------------------------------------------------------------------------
// 2. CONFIGURATION VALIDATION
//    Catches placeholder strings, empty values, and common env-var mistakes
//    BEFORE Firebase is initialized so the error is actionable, not cryptic.
// ---------------------------------------------------------------------------

/** Common placeholder patterns that are NOT real API keys */
const PLACEHOLDER_PATTERNS = [
  /^your[_-]?firebase/i,
  /^replace[_-]?me/i,
  /^insert[_-]?here/i,
  /^todo/i,
  /^xxx/i,
  /^placeholder/i,
  /^<.*>$/,           // <YOUR_KEY>
  /^\[.*\]$/,         // [YOUR_KEY]
  /^\{.*\}$/,         // {YOUR_KEY}
];

interface ConfigField {
  key: string;
  envVar: string;
  value: unknown;
  required: boolean;
}

const CONFIG_FIELDS: ConfigField[] = [
  { key: "apiKey",            envVar: "VITE_FIREBASE_API_KEY",              value: firebaseConfig.apiKey,            required: true },
  { key: "authDomain",       envVar: "VITE_FIREBASE_AUTH_DOMAIN",          value: firebaseConfig.authDomain,       required: true },
  { key: "projectId",        envVar: "VITE_FIREBASE_PROJECT_ID",           value: firebaseConfig.projectId,        required: true },
  { key: "appId",            envVar: "VITE_FIREBASE_APP_ID",               value: firebaseConfig.appId,            required: true },
  { key: "messagingSenderId", envVar: "VITE_FIREBASE_MESSAGING_SENDER_ID", value: firebaseConfig.messagingSenderId, required: true },
  { key: "storageBucket",    envVar: "VITE_FIREBASE_STORAGE_BUCKET",       value: firebaseConfig.storageBucket,    required: false },
  { key: "measurementId",    envVar: "VITE_FIREBASE_MEASUREMENT_ID",       value: firebaseConfig.measurementId,    required: false },
];

function isPlaceholder(val: unknown): boolean {
  if (typeof val !== "string") return false;
  return PLACEHOLDER_PATTERNS.some((re) => re.test(val.trim()));
}

function validateFirebaseConfig(): string[] {
  const errors: string[] = [];

  for (const field of CONFIG_FIELDS) {
    const val = field.value;

    // Check undefined / null / empty
    if (val === undefined || val === null || (typeof val === "string" && val.trim() === "")) {
      if (field.required) {
        errors.push(`Missing ${field.envVar} — set it in your .env file.`);
      }
      continue;
    }

    // Check placeholder values
    if (isPlaceholder(val)) {
      errors.push(
        `${field.envVar} contains a placeholder value ("${String(val).substring(0, 20)}…"). ` +
        `Replace it with the real value from Firebase Console → Project Settings → Your Apps.`
      );
    }
  }

  return errors;
}

export const firebaseConfigErrors: string[] = validateFirebaseConfig();
export const firebaseConfigValid: boolean = firebaseConfigErrors.length === 0;

// ---------------------------------------------------------------------------
// 3. DEV-MODE DIAGNOSTIC (safe — never prints full API key)
// ---------------------------------------------------------------------------
if (import.meta.env.DEV) {
  if (!firebaseConfigValid) {
    console.error(
      `🔥 KRISHNA_OS Firebase Configuration Error:\n` +
      firebaseConfigErrors.map((e) => `   ❌ ${e}`).join("\n") +
      `\n\n   Fix: Open your .env file and set the correct Firebase values.\n` +
      `   Get them from: https://console.firebase.google.com/ → Project Settings → General → Your Apps`
    );
  } else {
    console.log(
      `🔥 Firebase Config Check:\n` +
      `   API Key: ${firebaseConfig.apiKey ? "PRESENT" : "⚠️ MISSING — set VITE_FIREBASE_API_KEY in .env"}\n` +
      `   Project ID: ${firebaseConfig.projectId}\n` +
      `   Auth Domain: ${firebaseConfig.authDomain}\n` +
      `   App ID: ${firebaseConfig.appId ? "PRESENT" : "⚠️ MISSING"}`
    );
  }
}

// ---------------------------------------------------------------------------
// 4. FIREBASE INITIALIZATION
// ---------------------------------------------------------------------------
let app: FirebaseApp;

if (firebaseConfigValid) {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
} else {
  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  } catch {
    app = !getApps().length
      ? initializeApp({ ...firebaseConfig, apiKey: "invalid-placeholder" })
      : getApp();
  }
}

export { app };

// Core Services — single instances shared across the entire app
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// ---------------------------------------------------------------------------
// 5. ANALYTICS — safely initialized in client environment only.
// ---------------------------------------------------------------------------
export const initAnalytics = async () => {
  if (!firebaseConfigValid) return null;
  try {
    if (typeof window !== "undefined" && (await isAnalyticsSupported())) {
      return getAnalytics(app);
    }
  } catch (err) {
    console.warn("Firebase Analytics initialization warning:", err);
  }
  return null;
};

initAnalytics();
