import dotenv from 'dotenv';
import dns from 'dns/promises';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';

dotenv.config();

async function runDiagnostic() {
  console.log("==================================================");
  console.log("🔥 KRISHNA_OS DEEP FIREBASE TECHNICAL DIAGNOSTIC");
  console.log("==================================================\n");

  // 1. Environment variables check
  const envApiKey = process.env.VITE_FIREBASE_API_KEY;
  const envAuthDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN;
  const envProjectId = process.env.VITE_FIREBASE_PROJECT_ID;
  const envStorageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET;
  const envMessagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
  const envAppId = process.env.VITE_FIREBASE_APP_ID;
  const envMeasurementId = process.env.VITE_FIREBASE_MEASUREMENT_ID;

  console.log("--- 1. CONFIGURATION SOURCE AUDIT ---");
  console.log(`VITE_FIREBASE_API_KEY:              ${envApiKey === undefined ? 'UNDEFINED' : envApiKey === '' ? 'EMPTY STRING ("")' : 'PRESENT (' + envApiKey.length + ' chars, starts with ' + envApiKey.substring(0, 4) + '...)'}`);
  console.log(`VITE_FIREBASE_AUTH_DOMAIN:          ${envAuthDomain || 'NOT SET'}`);
  console.log(`VITE_FIREBASE_PROJECT_ID:           ${envProjectId || 'NOT SET'}`);
  console.log(`VITE_FIREBASE_STORAGE_BUCKET:       ${envStorageBucket || 'NOT SET'}`);
  console.log(`VITE_FIREBASE_MESSAGING_SENDER_ID:  ${envMessagingSenderId || 'NOT SET'}`);
  console.log(`VITE_FIREBASE_APP_ID:               ${envAppId || 'NOT SET'}`);
  console.log(`VITE_FIREBASE_MEASUREMENT_ID:       ${envMeasurementId || 'NOT SET'}`);
  console.log(`Backend FIREBASE_API_KEY:           ${process.env.FIREBASE_API_KEY === undefined ? 'UNDEFINED' : process.env.FIREBASE_API_KEY === '' ? 'EMPTY STRING ("")' : 'PRESENT'}\n`);

  // 2. Network Reachability test to Google / Firebase APIs
  console.log("--- 2. NETWORK & DNS CONNECTIVITY TEST ---");
  const endpoints = [
    { host: 'identitytoolkit.googleapis.com', name: 'Firebase Identity Toolkit (Auth API)' },
    { host: 'firestore.googleapis.com', name: 'Cloud Firestore API' },
    { host: 'firebasestorage.googleapis.com', name: 'Firebase Storage API' },
    { host: 'firebase.googleapis.com', name: 'Firebase Management API' },
    { host: 'accounts.google.com', name: 'Google OAuth 2.0 Accounts' }
  ];

  for (const ep of endpoints) {
    try {
      const lookup = await dns.lookup(ep.host);
      console.log(`✓ DNS Lookup [${ep.name} -> ${ep.host}]: Resolved (${lookup.address})`);
    } catch (err: any) {
      console.log(`✗ DNS Lookup [${ep.name} -> ${ep.host}]: FAILED (${err.message})`);
    }
  }

  // Test HTTP reachability to Identity Toolkit
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${envApiKey || 'test'}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ continueUri: 'http://localhost' })
    });
    const status = res.status;
    const body: any = await res.json().catch(() => ({}));
    console.log(`\nHTTP Request to Identity Toolkit (auth endpoint): HTTP ${status}`);
    console.log(`Response error code/message:`, body?.error?.message || body);
  } catch (netErr: any) {
    console.log(`HTTP request failed:`, netErr.message);
  }

  // 3. Firebase SDK App & Services Initialization Test
  console.log("\n--- 3. FIREBASE CLIENT SDK INITIALIZATION ---");
  const testConfig = {
    apiKey: envApiKey || "invalid-placeholder",
    authDomain: envAuthDomain || "krishna-web-os.firebaseapp.com",
    projectId: envProjectId || "krishna-web-os",
    storageBucket: envStorageBucket || "krishna-web-os.firebasestorage.app",
    messagingSenderId: envMessagingSenderId || "448489243298",
    appId: envAppId || "1:448489243298:web:84811c480b688a58f58dfb",
  };

  let app: any;
  try {
    app = initializeApp(testConfig, "DIAGNOSTIC_APP");
    console.log(`✓ Firebase App Initialized: Name="${app.name}", ProjectId="${app.options.projectId}"`);
  } catch (err: any) {
    console.log(`✗ Firebase App Initialization Failed:`, err.message);
  }

  if (app) {
    // 4. Auth Service Test
    console.log("\n--- 4. FIREBASE AUTHENTICATION TEST ---");
    try {
      const auth = getAuth(app);
      console.log(`✓ getAuth(app) succeeded. Auth instance created.`);
      console.log(`  Current User: ${auth.currentUser ? auth.currentUser.uid : 'null (NOT AUTHENTICATED - expected on fresh init)'}`);
      
      const provider = new GoogleAuthProvider();
      console.log(`✓ GoogleAuthProvider instance created. ProviderId="${provider.providerId}"`);

      // Test real auth attempt with dummy/probe credentials to observe the exact Firebase server error
      console.log(`  Probing Auth API with credential request...`);
      try {
        await signInWithEmailAndPassword(auth, "probe-test-nonexistent@krishna-os.local", "dummyPassword123!");
      } catch (authErr: any) {
        console.log(`  Firebase Auth Response Code: "${authErr.code}"`);
        console.log(`  Firebase Auth Response Message: "${authErr.message}"`);
      }
    } catch (err: any) {
      console.log(`✗ Auth test failed:`, err.message);
    }

    // 5. Firestore Service Test
    console.log("\n--- 5. FIRESTORE CONNECTIVITY TEST ---");
    try {
      const db = getFirestore(app);
      console.log(`✓ getFirestore(app) succeeded. Firestore instance created.`);
      
      console.log(`  Probing Firestore document read from '__health_check__' collection...`);
      try {
        const testDocRef = doc(db, "__health_check__", "ping");
        const docSnap = await getDoc(testDocRef);
        console.log(`✓ Firestore read succeeded! Exists=${docSnap.exists()}`);
      } catch (fsErr: any) {
        console.log(`  Firestore Probe Result: Code="${fsErr.code || 'UNKNOWN'}", Message="${fsErr.message}"`);
      }
    } catch (err: any) {
      console.log(`✗ Firestore test failed:`, err.message);
    }
  }

  console.log("\n==================================================");
  console.log("DIAGNOSTIC PROBE FINISHED");
  console.log("==================================================");
}

runDiagnostic().catch(console.error);
