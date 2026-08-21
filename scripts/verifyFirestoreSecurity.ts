import dotenv from 'dotenv';
import { initializeApp, getApps, deleteApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  deleteUser,
  User
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp 
} from 'firebase/firestore';

dotenv.config();

interface TestResult {
  category: string;
  name: string;
  expected: 'ALLOW' | 'DENY';
  actual: 'ALLOW' | 'DENY';
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

function recordResult(category: string, name: string, expected: 'ALLOW' | 'DENY', actual: 'ALLOW' | 'DENY', details?: string) {
  const passed = expected === actual;
  results.push({ category, name, expected, actual, passed, details });
  const icon = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`  ${icon} [${category}] ${name} (Expected: ${expected}, Got: ${actual})${details ? ` - ${details}` : ''}`);
}

async function runSecurityTestSuite() {
  console.log('================================================================');
  console.log('🛡️  KRISHNA OS - FIRESTORE SECURITY RULES VERIFICATION SUITE');
  console.log('================================================================\n');

  const apiKey = process.env.VITE_FIREBASE_API_KEY || '';
  const authDomain = process.env.VITE_FIREBASE_AUTH_DOMAIN || '';
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || '';
  const storageBucket = process.env.VITE_FIREBASE_STORAGE_BUCKET || '';
  const messagingSenderId = process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '';
  const appId = process.env.VITE_FIREBASE_APP_ID || '';

  const firebaseConfig = {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId
  };

  const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
  const auth = getAuth(app);
  const db = getFirestore(app);

  // -------------------------------------------------------------------------
  // 1. UNAUTHENTICATED TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 1. UNAUTHENTICATED ACCESS TESTS ---');
  await signOut(auth);

  // Unauth read users
  try {
    const unauthDoc = doc(db, 'users', 'random_target_user_123');
    await getDoc(unauthDoc);
    recordResult('Unauthenticated', 'Read users collection', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Unauthenticated', 'Read users collection', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Unauth write users
  try {
    const unauthDoc = doc(db, 'users', 'random_target_user_123');
    await setDoc(unauthDoc, { displayName: 'Hacker' });
    recordResult('Unauthenticated', 'Write users collection', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Unauthenticated', 'Write users collection', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Unauth read user_sessions
  try {
    const unauthDoc = doc(db, 'user_sessions', 'random_session_123');
    await getDoc(unauthDoc);
    recordResult('Unauthenticated', 'Read user_sessions collection', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Unauthenticated', 'Read user_sessions collection', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Unauth write user_sessions
  try {
    const unauthDoc = doc(db, 'user_sessions', 'random_session_123');
    await setDoc(unauthDoc, { userId: 'unauth_user', status: 'active' });
    recordResult('Unauthenticated', 'Write user_sessions collection', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Unauthenticated', 'Write user_sessions collection', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Unauth read arbitrary collection
  try {
    const unauthDoc = doc(db, 'system_secrets', 'config');
    await getDoc(unauthDoc);
    recordResult('Unauthenticated', 'Read arbitrary collection (system_secrets)', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Unauthenticated', 'Read arbitrary collection (system_secrets)', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // -------------------------------------------------------------------------
  // 2. CREATE TWO TEST USERS (USER_A and USER_B)
  // -------------------------------------------------------------------------
  console.log('\n--- 2. PROVISIONING TEST USERS (USER_A and USER_B) ---');
  const timestamp = Date.now();
  const emailA = `sec-test-a-${timestamp}@krishna-os.test`;
  const emailB = `sec-test-b-${timestamp}@krishna-os.test`;
  const password = `SecPass!#${Math.floor(Math.random() * 899999 + 100000)}`;

  let userA: User | null = null;
  let userB: User | null = null;

  try {
    const regA = await createUserWithEmailAndPassword(auth, emailA, password);
    userA = regA.user;
    console.log(`✓ USER_A registered: UID=${userA.uid}`);

    // Create User A profile and session
    const userADocRef = doc(db, 'users', userA.uid);
    await setDoc(userADocRef, {
      uid: userA.uid,
      displayName: 'User A Profile',
      email: emailA,
      authProvider: 'password',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const sessionADocRef = doc(db, 'user_sessions', `session_${userA.uid}`);
    await setDoc(sessionADocRef, {
      userId: userA.uid,
      status: 'active',
      device: 'Desktop Test Harness',
      createdAt: serverTimestamp()
    });
    console.log(`✓ USER_A initial profile & session created.`);

    // Sign out A, Create B
    await signOut(auth);

    const regB = await createUserWithEmailAndPassword(auth, emailB, password);
    userB = regB.user;
    console.log(`✓ USER_B registered: UID=${userB.uid}`);

    // Create User B profile and session
    const userBDocRef = doc(db, 'users', userB.uid);
    await setDoc(userBDocRef, {
      uid: userB.uid,
      displayName: 'User B Profile',
      email: emailB,
      authProvider: 'password',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    const sessionBDocRef = doc(db, 'user_sessions', `session_${userB.uid}`);
    await setDoc(sessionBDocRef, {
      userId: userB.uid,
      status: 'active',
      device: 'Mobile Test Harness',
      createdAt: serverTimestamp()
    });
    console.log(`✓ USER_B initial profile & session created.`);
  } catch (err: any) {
    console.error(`Provisioning error:`, err);
  }

  if (!userA || !userB) {
    console.error('❌ Could not provision test users. Check auth configuration.');
    return;
  }

  // -------------------------------------------------------------------------
  // 3. USER A AUTHENTICATED TESTS (OWN DATA vs USER B DATA)
  // -------------------------------------------------------------------------
  console.log('\n--- 3. USER_A AUTHORIZATION & ISOLATION TESTS ---');
  await signOut(auth);
  await signInWithEmailAndPassword(auth, emailA, password);

  // User A reads own profile
  try {
    const docSnap = await getDoc(doc(db, 'users', userA.uid));
    recordResult('User A Own Data', 'USER_A reads own profile', 'ALLOW', docSnap.exists() ? 'ALLOW' : 'DENY');
  } catch (err: any) {
    recordResult('User A Own Data', 'USER_A reads own profile', 'ALLOW', 'DENY', err.code);
  }

  // User A updates own profile
  try {
    await updateDoc(doc(db, 'users', userA.uid), {
      displayName: 'User A Updated Profile',
      updatedAt: serverTimestamp()
    });
    recordResult('User A Own Data', 'USER_A updates own profile', 'ALLOW', 'ALLOW');
  } catch (err: any) {
    recordResult('User A Own Data', 'USER_A updates own profile', 'ALLOW', 'DENY', err.code);
  }

  // User A reads own session
  try {
    const docSnap = await getDoc(doc(db, 'user_sessions', `session_${userA.uid}`));
    recordResult('User A Own Data', 'USER_A reads own session', 'ALLOW', docSnap.exists() ? 'ALLOW' : 'DENY');
  } catch (err: any) {
    recordResult('User A Own Data', 'USER_A reads own session', 'ALLOW', 'DENY', err.code);
  }

  // User A updates own session
  try {
    await updateDoc(doc(db, 'user_sessions', `session_${userA.uid}`), {
      status: 'idle'
    });
    recordResult('User A Own Data', 'USER_A updates own session', 'ALLOW', 'ALLOW');
  } catch (err: any) {
    recordResult('User A Own Data', 'USER_A updates own session', 'ALLOW', 'DENY', err.code);
  }

  // User A queries own sessions with where filter
  try {
    const q = query(collection(db, 'user_sessions'), where('userId', '==', userA.uid));
    const snap = await getDocs(q);
    recordResult('User A Queries', 'USER_A queries user_sessions scoped to own userId', 'ALLOW', snap.size >= 1 ? 'ALLOW' : 'DENY');
  } catch (err: any) {
    recordResult('User A Queries', 'USER_A queries user_sessions scoped to own userId', 'ALLOW', 'DENY', err.code);
  }

  // User A attempts unscoped global getDocs on user_sessions
  try {
    const snap = await getDocs(collection(db, 'user_sessions'));
    recordResult('User A Queries', 'USER_A attempts global unscoped query on user_sessions', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('User A Queries', 'USER_A attempts global unscoped query on user_sessions', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // -------------------------------------------------------------------------
  // 4. CROSS-USER ATTACK SIMULATIONS (USER_A attacking USER_B)
  // -------------------------------------------------------------------------
  console.log('\n--- 4. CROSS-USER ATTACK SIMULATION TESTS (USER_A -> USER_B) ---');

  // Attack 1: User A reads User B profile
  try {
    await getDoc(doc(db, 'users', userB.uid));
    recordResult('Cross-User Security', 'USER_A reads USER_B profile', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Cross-User Security', 'USER_A reads USER_B profile', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Attack 2: User A writes/overwrites User B profile
  try {
    await setDoc(doc(db, 'users', userB.uid), { displayName: 'Hijacked by A' }, { merge: true });
    recordResult('Cross-User Security', 'USER_A updates USER_B profile', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Cross-User Security', 'USER_A updates USER_B profile', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Attack 3: User A deletes User B profile
  try {
    await deleteDoc(doc(db, 'users', userB.uid));
    recordResult('Cross-User Security', 'USER_A deletes USER_B profile', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Cross-User Security', 'USER_A deletes USER_B profile', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Attack 4: User A reads User B session
  try {
    await getDoc(doc(db, 'user_sessions', `session_${userB.uid}`));
    recordResult('Cross-User Security', 'USER_A reads USER_B session', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Cross-User Security', 'USER_A reads USER_B session', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Attack 5: User A modifies User B session
  try {
    await updateDoc(doc(db, 'user_sessions', `session_${userB.uid}`), { status: 'terminated' });
    recordResult('Cross-User Security', 'USER_A modifies USER_B session', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Cross-User Security', 'USER_A modifies USER_B session', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Attack 6: User A deletes User B session
  try {
    await deleteDoc(doc(db, 'user_sessions', `session_${userB.uid}`));
    recordResult('Cross-User Security', 'USER_A deletes USER_B session', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Cross-User Security', 'USER_A deletes USER_B session', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Attack 7: User A creates a session spoofing User B's userId
  try {
    const spoofedSessionDoc = doc(db, 'user_sessions', `spoofed_session_${timestamp}`);
    await setDoc(spoofedSessionDoc, {
      userId: userB.uid,
      status: 'active'
    });
    recordResult('Cross-User Security', 'USER_A creates session with spoofed USER_B userId', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Cross-User Security', 'USER_A creates session with spoofed USER_B userId', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // -------------------------------------------------------------------------
  // 5. PRIVILEGE ESCALATION & IDENTITY TAKEOVER TESTS
  // -------------------------------------------------------------------------
  console.log('\n--- 5. PRIVILEGE ESCALATION & TAKEOVER TESTS ---');

  // Escalation 1: User A assigns themselves role: "admin"
  try {
    await updateDoc(doc(db, 'users', userA.uid), {
      role: 'admin'
    });
    recordResult('Privilege Escalation', 'USER_A writes role: "admin"', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Privilege Escalation', 'USER_A writes role: "admin"', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Escalation 2: User A assigns themselves isAdmin: true
  try {
    await updateDoc(doc(db, 'users', userA.uid), {
      isAdmin: true
    });
    recordResult('Privilege Escalation', 'USER_A writes isAdmin: true', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Privilege Escalation', 'USER_A writes isAdmin: true', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // Takeover: User A alters profile uid field to User B UID
  try {
    await updateDoc(doc(db, 'users', userA.uid), {
      uid: userB.uid
    });
    recordResult('Identity Takeover', 'USER_A transfers profile uid to USER_B UID', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Identity Takeover', 'USER_A transfers profile uid to USER_B UID', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // -------------------------------------------------------------------------
  // 6. SYMMETRIC VALIDATION (USER_B)
  // -------------------------------------------------------------------------
  console.log('\n--- 6. USER_B SYMMETRIC VALIDATION TESTS ---');
  await signOut(auth);
  await signInWithEmailAndPassword(auth, emailB, password);

  // User B reads own profile
  try {
    const docSnap = await getDoc(doc(db, 'users', userB.uid));
    recordResult('User B Own Data', 'USER_B reads own profile', 'ALLOW', docSnap.exists() ? 'ALLOW' : 'DENY');
  } catch (err: any) {
    recordResult('User B Own Data', 'USER_B reads own profile', 'ALLOW', 'DENY', err.code);
  }

  // User B reads own session
  try {
    const docSnap = await getDoc(doc(db, 'user_sessions', `session_${userB.uid}`));
    recordResult('User B Own Data', 'USER_B reads own session', 'ALLOW', docSnap.exists() ? 'ALLOW' : 'DENY');
  } catch (err: any) {
    recordResult('User B Own Data', 'USER_B reads own session', 'ALLOW', 'DENY', err.code);
  }

  // User B attempts to read User A's profile
  try {
    await getDoc(doc(db, 'users', userA.uid));
    recordResult('Cross-User Security', 'USER_B reads USER_A profile', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Cross-User Security', 'USER_B reads USER_A profile', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // User B attempts to modify User A's session
  try {
    await updateDoc(doc(db, 'user_sessions', `session_${userA.uid}`), { status: 'terminated' });
    recordResult('Cross-User Security', 'USER_B modifies USER_A session', 'DENY', 'ALLOW');
  } catch (err: any) {
    const isDenied = err.code === 'permission-denied' || err.message?.includes('Missing or insufficient permissions');
    recordResult('Cross-User Security', 'USER_B modifies USER_A session', 'DENY', isDenied ? 'DENY' : 'ALLOW', err.code);
  }

  // -------------------------------------------------------------------------
  // 7. CLEANUP
  // -------------------------------------------------------------------------
  console.log('\n--- 7. TEARDOWN & CLEANUP ---');
  try {
    // Delete User B session & user doc
    await deleteDoc(doc(db, 'user_sessions', `session_${userB.uid}`));
    await deleteDoc(doc(db, 'users', userB.uid));
    await deleteUser(userB);
    console.log('✓ USER_B data and auth account cleaned up.');

    // Delete User A session & user doc
    await signOut(auth);
    await signInWithEmailAndPassword(auth, emailA, password);
    await deleteDoc(doc(db, 'user_sessions', `session_${userA.uid}`));
    await deleteDoc(doc(db, 'users', userA.uid));
    if (auth.currentUser) {
      await deleteUser(auth.currentUser);
    }
    console.log('✓ USER_A data and auth account cleaned up.');
  } catch (cleanupErr: any) {
    console.warn('Cleanup warning:', cleanupErr.message);
  }

  // -------------------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------------------
  console.log('\n================================================================');
  console.log('📊 SECURITY TEST MATRIX RESULTS');
  console.log('================================================================');
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  console.log(`Total Assertions: ${totalCount}`);
  console.log(`Passed:           ${passedCount}`);
  console.log(`Failed:           ${totalCount - passedCount}`);
  console.log(`Success Rate:     ${Math.round((passedCount / totalCount) * 100)}%`);

  if (passedCount === totalCount) {
    console.log('\n🎉 ALL SECURITY RULES ASSERTIONS PASSED! FIRESTORE IS HARDENED.');
  } else {
    console.log('\n⚠️ SOME SECURITY RULES ASSERTIONS FAILED. REVIEW RESULTS ABOVE.');
  }
}

runSecurityTestSuite().catch(console.error);
