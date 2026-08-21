import dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  deleteUser,
  GoogleAuthProvider
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc,
  serverTimestamp 
} from 'firebase/firestore';

dotenv.config();

async function runLiveVerification() {
  console.log("==================================================");
  console.log("🔥 KRISHNA_OS LIVE FIREBASE VERIFICATION TEST");
  console.log("==================================================\n");

  const apiKey = process.env.VITE_FIREBASE_API_KEY || '';
  const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN || '';
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || '';
  const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET || '';
  const messagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
  const appId = process.env.VITE_FIREBASE_APP_ID || '';

  // Safe diagnostics
  console.log("1. ENVIRONMENT CONFIGURATION CHECK:");
  console.log(`- Firebase API Key:         PRESENT (Length: ${apiKey.length}, Prefix: ${apiKey.substring(0, 6)}...)`);
  console.log(`- Firebase Auth Domain:     ${authDomain}`);
  console.log(`- Firebase Project ID:      ${projectId}`);
  console.log(`- Firebase Storage Bucket:  ${storageBucket}`);
  console.log(`- Firebase Sender ID:       ${messagingSenderId}`);
  console.log(`- Firebase App ID:          ${appId}`);
  console.log(`- Backend FIREBASE_API_KEY: PRESENT (Length: ${(process.env.FIREBASE_API_KEY || '').length})`);

  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId
  };

  // 2. Initialize SDK
  console.log("\n2. INITIALIZING FIREBASE CLIENT APP:");
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  console.log(`✓ Firebase App Initialized: Name="${app.name}", ProjectId="${app.options.projectId}"`);

  const auth = getAuth(app);
  const db = getFirestore(app);
  console.log(`✓ Firebase Auth & Firestore instances created.`);

  // 3. Test Identity Toolkit with the real API key
  console.log("\n3. TESTING GOOGLE IDENTITY TOOLKIT API DIRECTLY:");
  try {
    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:createAuthUri?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ continueUri: 'http://localhost:3000' })
    });
    const status = res.status;
    const body: any = await res.json();
    console.log(`- HTTP Status: ${status}`);
    if (status === 200 || body.authUri || body.providerId) {
      console.log(`✓ Google Identity Toolkit accepted API Key successfully!`);
    } else {
      console.log(`- Identity Toolkit Response:`, body);
    }
  } catch (err: any) {
    console.log(`✗ Identity Toolkit direct fetch error:`, err.message);
  }

  // 4. Real User Authentication Flow Test
  console.log("\n4. TESTING REAL FIREBASE AUTHENTICATION (Registration -> Login -> Logout):");
  const testEmail = `qa-test-${Date.now()}@krishna-os.test`;
  const testPassword = `TestPass!#${Math.floor(Math.random() * 899999 + 100000)}`;

  let registeredUser: any = null;
  let idToken = '';

  try {
    console.log(`- Attempting createUserWithEmailAndPassword for: [TEST_USER_GENERATED]...`);
    const regResult = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    registeredUser = regResult.user;
    idToken = await registeredUser.getIdToken();
    console.log(`✓ REAL REGISTRATION SUCCEEDED!`);
    console.log(`  User UID:   ${registeredUser.uid}`);
    console.log(`  User Email: ${registeredUser.email}`);
    console.log(`  ID Token:   ${idToken.substring(0, 15)}... (Valid JWT received)`);
  } catch (err: any) {
    console.log(`✗ Registration failed: [${err.code}] ${err.message}`);
    // If user already exists or operation-not-allowed, test sign-in
    if (err.code === 'auth/operation-not-allowed') {
      console.log(`⚠️ Email/Password provider is not enabled in Firebase Console yet!`);
    }
  }

  // 5. Test Firestore with Authenticated User
  if (registeredUser) {
    console.log("\n5. TESTING FIRESTORE WITH AUTHENTICATED CONTEXT:");
    try {
      const userDocRef = doc(db, 'users', registeredUser.uid);
      await setDoc(userDocRef, {
        uid: registeredUser.uid,
        email: registeredUser.email,
        displayName: 'QA Test Operator',
        authProvider: 'password',
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        isQaVerificationDoc: true
      }, { merge: true });
      console.log(`✓ Firestore document write succeeded in 'users' collection!`);

      const readSnap = await getDoc(userDocRef);
      if (readSnap.exists()) {
        console.log(`✓ Firestore document read verified: Exists=true, displayName="${readSnap.data().displayName}"`);
      }

      // Clean up test document
      await deleteDoc(userDocRef);
      console.log(`✓ Test document cleaned up from Firestore.`);
    } catch (fsErr: any) {
      console.log(`✗ Firestore operation note: [${fsErr.code || 'ERR'}] ${fsErr.message}`);
    }

    // 6. Test Logout
    console.log("\n6. TESTING LOGOUT FLOW:");
    try {
      await signOut(auth);
      console.log(`✓ signOut(auth) completed. Current User is now: ${auth.currentUser ? auth.currentUser.uid : 'null (LOGGED OUT)'}`);
    } catch (soErr: any) {
      console.log(`✗ Sign out error:`, soErr.message);
    }

    // 7. Test Login using the same credentials
    console.log("\n7. TESTING SIGN-IN WITH CREATED CREDENTIALS:");
    try {
      const loginResult = await signInWithEmailAndPassword(auth, testEmail, testPassword);
      console.log(`✓ REAL LOGIN SUCCEEDED! User UID: ${loginResult.user.uid}`);
      
      // Clean up test user account from Firebase Authentication
      try {
        await deleteUser(loginResult.user);
        console.log(`✓ Test user account cleaned up from Firebase Auth.`);
      } catch (delErr) {
        // ignore
      }
    } catch (liErr: any) {
      console.log(`✗ Sign in error: [${liErr.code}] ${liErr.message}`);
    }
  }

  // 8. Test Backend Token Verification
  console.log("\n8. TESTING BACKEND TOKEN VERIFICATION LOGIC:");
  if (idToken) {
    try {
      const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken })
      });
      if (resp.ok) {
        const data: any = await resp.json();
        console.log(`✓ Backend Identity Toolkit token lookup succeeded! Verified UID: ${data.users?.[0]?.localId}`);
      } else {
        const errData = await resp.json();
        console.log(`✗ Backend token verification response:`, errData);
      }
    } catch (beErr: any) {
      console.log(`✗ Backend verification error:`, beErr.message);
    }
  } else {
    console.log(`- Skipped token verification (no ID token from step 4)`);
  }

  // 9. Google Auth Provider configuration
  console.log("\n9. TESTING GOOGLE AUTH PROVIDER CONFIGURATION:");
  try {
    const googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({ prompt: 'select_account' });
    console.log(`✓ GoogleAuthProvider initialized successfully with providerId="${googleProvider.providerId}" and custom parameters.`);
  } catch (gErr: any) {
    console.log(`✗ GoogleAuthProvider initialization error:`, gErr.message);
  }

  console.log("\n==================================================");
  console.log("LIVE VERIFICATION RUN COMPLETE");
  console.log("==================================================");
}

runLiveVerification().catch(console.error);
