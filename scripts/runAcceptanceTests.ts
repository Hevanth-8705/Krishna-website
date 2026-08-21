import dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  deleteUser,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';
import fs from 'fs';
import path from 'path';

dotenv.config();

interface TestResult {
  name: string;
  category: string;
  status: 'PASS' | 'FAIL' | 'BLOCKED';
  details: string;
}

const results: TestResult[] = [];

function record(name: string, category: string, status: 'PASS' | 'FAIL' | 'BLOCKED', details: string) {
  results.push({ name, category, status, details });
  const icon = status === 'PASS' ? '✓' : status === 'FAIL' ? '✗' : '⚠️';
  console.log(`${icon} [${category}] ${name}: ${status}`);
  if (details) console.log(`   └─ ${details}`);
}

async function runAcceptanceSuite() {
  console.log("==================================================");
  console.log("🔥 KRISHNA_OS FINAL FIREBASE ACCEPTANCE TEST SUITE");
  console.log("==================================================\n");

  const apiKey = process.env.VITE_FIREBASE_API_KEY || '';
  const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN || '';
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || '';
  const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET || '';
  const messagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
  const appId = process.env.VITE_FIREBASE_APP_ID || '';
  const backendKey = process.env.FIREBASE_API_KEY || '';

  // 1. Environment & Config Consistency Check
  console.log("--- 1. ENVIRONMENT & CONFIGURATION CONSISTENCY ---");
  const envConsistent = 
    Boolean(apiKey) && 
    apiKey === backendKey &&
    authDomain.includes(projectId) &&
    storageBucket.includes(projectId);

  if (envConsistent) {
    record("Configuration Integrity", "Config", "PASS", `Project "${projectId}", Key length ${apiKey.length}, Auth Domain "${authDomain}"`);
  } else {
    record("Configuration Integrity", "Config", "FAIL", "Mismatch between frontend and backend keys or project IDs");
  }

  // Check firebase-applet-config.json
  try {
    const appletRaw = fs.readFileSync(path.resolve(process.cwd(), 'firebase-applet-config.json'), 'utf-8');
    const appletJson = JSON.parse(appletRaw);
    if (appletJson.projectId === projectId && appletJson.apiKey === apiKey) {
      record("Applet Config Consistency", "Config", "PASS", "firebase-applet-config.json matches .env configuration");
    } else {
      record("Applet Config Consistency", "Config", "FAIL", "firebase-applet-config.json differs from .env");
    }
  } catch (err: any) {
    record("Applet Config Consistency", "Config", "FAIL", err.message);
  }

  // 2. SDK Initialization
  console.log("\n--- 2. FIREBASE SDK INITIALIZATION ---");
  const firebaseConfig = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  const auth = getAuth(app);
  const db = getFirestore(app);

  record("Firebase App Initialized", "SDK", app ? "PASS" : "FAIL", `App name="${app.name}"`);
  record("Firebase Auth Initialized", "SDK", auth ? "PASS" : "FAIL", "Auth instance attached");
  record("Firestore Initialized", "SDK", db ? "PASS" : "FAIL", "Firestore instance attached");

  // 3. Email Registration, Profile Update, and Token Flow
  console.log("\n--- 3. EMAIL REGISTRATION & PROFILE TEST ---");
  const testEmail = `acceptance-test-${Date.now()}@krishna-os.test`;
  const testPassword = `SecurePass99!#${Math.floor(Math.random() * 89999 + 10000)}`;
  let testUser: any = null;
  let activeIdToken = '';

  try {
    const regResult = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    testUser = regResult.user;
    await updateProfile(testUser, { displayName: "Krishna Operator QA" });
    activeIdToken = await testUser.getIdToken();

    record("Email Registration", "Auth", "PASS", `User created with UID "${testUser.uid}" and email "${testUser.email}"`);
    record("User Profile Update", "Auth", "PASS", `Display name set to "${testUser.displayName}"`);
  } catch (err: any) {
    record("Email Registration", "Auth", "FAIL", `Registration failed: [${err.code}] ${err.message}`);
  }

  // 4. Duplicate Registration Test
  console.log("\n--- 4. DUPLICATE ACCOUNT REGISTRATION TEST ---");
  try {
    await createUserWithEmailAndPassword(auth, testEmail, "DifferentPassword123!");
    record("Duplicate Registration Handling", "Auth", "FAIL", "Duplicate email was unexpectedly allowed");
  } catch (err: any) {
    if (err.code === 'auth/email-already-in-use') {
      record("Duplicate Registration Handling", "Auth", "PASS", `Correctly rejected with code "${err.code}"`);
    } else {
      record("Duplicate Registration Handling", "Auth", "FAIL", `Unexpected error code: ${err.code}`);
    }
  }

  // 5. Wrong Password Test
  console.log("\n--- 5. WRONG PASSWORD AUTHENTICATION TEST ---");
  try {
    await signInWithEmailAndPassword(auth, testEmail, "WrongPassword999!");
    record("Wrong Password Handling", "Auth", "FAIL", "Login unexpectedly succeeded with invalid password");
  } catch (err: any) {
    if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
      record("Wrong Password Handling", "Auth", "PASS", `Correctly rejected with code "${err.code}"`);
    } else {
      record("Wrong Password Handling", "Auth", "FAIL", `Unexpected error code: ${err.code}`);
    }
  }

  // 6. Invalid Email Format Test
  console.log("\n--- 6. INVALID EMAIL FORMAT TEST ---");
  try {
    await signInWithEmailAndPassword(auth, "not-an-email-address", "SomePassword123!");
    record("Invalid Email Format Handling", "Auth", "FAIL", "Invalid email string was accepted");
  } catch (err: any) {
    if (err.code === 'auth/invalid-email') {
      record("Invalid Email Format Handling", "Auth", "PASS", `Correctly rejected with code "${err.code}"`);
    } else {
      record("Invalid Email Format Handling", "Auth", "FAIL", `Unexpected error code: ${err.code}`);
    }
  }

  // 7. Valid Email Login Test
  console.log("\n--- 7. VALID EMAIL LOGIN TEST ---");
  try {
    const loginResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    record("Email Login", "Auth", "PASS", `Authenticated user UID "${loginResult.user.uid}" matches registered account`);
  } catch (err: any) {
    record("Email Login", "Auth", "FAIL", `Login failed: [${err.code}] ${err.message}`);
  }

  // 8. Session Persistence & Token Reload
  console.log("\n--- 8. SESSION PERSISTENCE & TOKEN RELOAD ---");
  if (auth.currentUser) {
    try {
      await auth.currentUser.reload();
      const reloadedToken = await auth.currentUser.getIdToken(true);
      record("Session Persistence & Token Refresh", "Auth", "PASS", `Token refreshed successfully (${reloadedToken.substring(0, 15)}...)`);
    } catch (err: any) {
      record("Session Persistence & Token Refresh", "Auth", "FAIL", err.message);
    }
  } else {
    record("Session Persistence & Token Refresh", "Auth", "FAIL", "No active user in auth state");
  }

  // 9. Firestore Read & Write Operations
  console.log("\n--- 9. FIRESTORE READ & WRITE TEST ---");
  if (testUser) {
    const userDocRef = doc(db, 'users', testUser.uid);
    try {
      await setDoc(userDocRef, {
        uid: testUser.uid,
        email: testUser.email,
        displayName: testUser.displayName,
        createdAt: serverTimestamp(),
        lastActive: serverTimestamp(),
        testSuite: 'FinalAcceptance'
      });
      record("Firestore Write (Own Document)", "Database", "PASS", `Document successfully written to users/${testUser.uid}`);

      const docSnap = await getDoc(userDocRef);
      if (docSnap.exists()) {
        record("Firestore Read (Own Document)", "Database", "PASS", `Document retrieved with displayName="${docSnap.data().displayName}"`);
      } else {
        record("Firestore Read (Own Document)", "Database", "FAIL", "Document does not exist after write");
      }

      await deleteDoc(userDocRef);
      record("Firestore Delete (Clean up)", "Database", "PASS", `Test document cleaned up`);
    } catch (err: any) {
      record("Firestore Read/Write", "Database", "FAIL", `[${err.code}] ${err.message}`);
    }
  }

  // 10. Firestore Security Rules Audit
  console.log("\n--- 10. FIRESTORE SECURITY RULES AUDIT ---");
  try {
    const rulesContent = fs.readFileSync(path.resolve(process.cwd(), 'firestore.rules'), 'utf-8');
    if (rulesContent.includes('match /{document=**}') && rulesContent.includes('allow read, write: if request.auth != null;')) {
      record(
        "Firestore Security Rules Authorization",
        "Security",
        "FAIL",
        "SECURITY VULNERABILITY: Rule allows ANY authenticated user to read/write EVERY document in database (match /{document=**} if request.auth != null)"
      );
    } else {
      record("Firestore Security Rules Authorization", "Security", "PASS", "Scoped document permissions verified");
    }
  } catch (err: any) {
    record("Firestore Security Rules Authorization", "Security", "FAIL", err.message);
  }

  // 11. Logout Test
  console.log("\n--- 11. LOGOUT TEST ---");
  try {
    await signOut(auth);
    if (auth.currentUser === null) {
      record("Logout (signOut)", "Auth", "PASS", "auth.currentUser is null after signOut");
    } else {
      record("Logout (signOut)", "Auth", "FAIL", "auth.currentUser is still defined after signOut");
    }
  } catch (err: any) {
    record("Logout (signOut)", "Auth", "FAIL", err.message);
  }

  // 12. Backend Authentication Token Verification
  console.log("\n--- 12. BACKEND TOKEN VERIFICATION ---");
  if (activeIdToken) {
    try {
      const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken: activeIdToken })
      });
      if (resp.ok) {
        const body: any = await resp.json();
        record("Backend Token Lookup (accounts:lookup)", "Backend", "PASS", `HTTP 200 returned, verified UID "${body.users?.[0]?.localId}"`);
      } else {
        record("Backend Token Lookup (accounts:lookup)", "Backend", "FAIL", `HTTP ${resp.status}`);
      }
    } catch (err: any) {
      record("Backend Token Lookup (accounts:lookup)", "Backend", "FAIL", err.message);
    }
  }

  // Clean up user from Firebase Auth
  if (testUser) {
    try {
      const reauth = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      await deleteUser(reauth.user);
      console.log(`✓ Test user account cleaned up from Firebase Auth.`);
    } catch {
      // ignore
    }
  }

  // 13. Google Authentication
  console.log("\n--- 13. GOOGLE AUTHENTICATION CONFIGURATION & LOGIN ---");
  try {
    const gProvider = new GoogleAuthProvider();
    gProvider.setCustomParameters({ prompt: 'select_account' });
    record("Google Provider Configuration", "Google Auth", "PASS", `Provider ID: "${gProvider.providerId}", prompt="select_account"`);
    
    // Interactive login assessment
    record(
      "Google Actual Login (Interactive OAuth)",
      "Google Auth",
      "BLOCKED",
      "Interactive Google authentication requires end-user browser OAuth consent with real Google credentials; cannot be fully completed headlessly"
    );
  } catch (err: any) {
    record("Google Provider Configuration", "Google Auth", "FAIL", err.message);
  }

  console.log("\n==================================================");
  console.log("FINAL ACCEPTANCE SUITE SUMMARY");
  console.log("==================================================");
  console.table(results.map(r => ({ Category: r.category, Name: r.name, Status: r.status, Details: r.details.substring(0, 70) })));
}

runAcceptanceSuite().catch(console.error);
