import dotenv from 'dotenv';
import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  deleteUser 
} from 'firebase/auth';

dotenv.config();

async function testBackendTokenVerification() {
  const apiKey = process.env.VITE_FIREBASE_API_KEY || '';
  const firebaseConfig = {
    apiKey,
    authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.VITE_FIREBASE_PROJECT_ID,
    appId: process.env.VITE_FIREBASE_APP_ID,
  };

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  const auth = getAuth(app);

  const testEmail = `token-verify-${Date.now()}@krishna-os.test`;
  const testPassword = `TokenPass!#${Math.floor(Math.random() * 899999 + 100000)}`;

  const cred = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
  const idToken = await cred.user.getIdToken();

  const resp = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken })
  });

  const data: any = await resp.json();
  console.log(`Backend Token Lookup HTTP Status: ${resp.status}`);
  console.log(`Verified User ID in Identity Toolkit: ${data.users?.[0]?.localId}`);
  console.log(`Match Created UID: ${data.users?.[0]?.localId === cred.user.uid}`);

  await deleteUser(cred.user);
  console.log(`Cleaned up token test user.`);
}

testBackendTokenVerification().catch(console.error);
