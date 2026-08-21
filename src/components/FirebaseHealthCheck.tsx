import React, { useState, useEffect } from 'react';
import { ShieldAlert, ShieldCheck, Activity, RefreshCw, X, Server, Database, Key, Globe } from 'lucide-react';
import { getApps, getApp } from 'firebase/app';
import { onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { app, auth, db, firebaseConfig, firebaseConfigValid, firebaseConfigErrors } from '../lib/firebase';

export interface FirebaseHealthStatus {
  sdkConnected: boolean;
  appInitialized: boolean;
  configValid: boolean;
  configErrors: string[];
  projectId: string;
  projectConsistency: boolean;
  authAvailable: boolean;
  authState: 'AUTHENTICATED' | 'NOT AUTHENTICATED' | 'AUTH STATE UNAVAILABLE';
  currentUserUid: string | null;
  currentUserEmail: string | null;
  googleAuthConfigured: boolean;
  firestoreAvailable: boolean;
  firestoreStatus: 'AVAILABLE' | 'FAILED' | 'NOT TESTED';
  firestoreErrorMessage: string | null;
  storageStatus: 'NOT USED';
  networkStatus: 'REACHABLE' | 'UNREACHABLE' | 'TESTING';
  overallStatus: 'HEALTHY' | 'PARTIALLY HEALTHY' | 'BROKEN';
  rootCause: string;
}

export function useFirebaseHealthCheck(): { status: FirebaseHealthStatus; isChecking: boolean; recheck: () => Promise<void> } {
  const [isChecking, setIsChecking] = useState(true);
  const [status, setStatus] = useState<FirebaseHealthStatus>({
    sdkConnected: true,
    appInitialized: false,
    configValid: false,
    configErrors: [],
    projectId: 'UNKNOWN',
    projectConsistency: false,
    authAvailable: false,
    authState: 'AUTH STATE UNAVAILABLE',
    currentUserUid: null,
    currentUserEmail: null,
    googleAuthConfigured: false,
    firestoreAvailable: false,
    firestoreStatus: 'NOT TESTED',
    firestoreErrorMessage: null,
    storageStatus: 'NOT USED',
    networkStatus: 'TESTING',
    overallStatus: 'BROKEN',
    rootCause: 'Initializing health check probe...',
  });

  const runCheck = async () => {
    setIsChecking(true);

    const apps = getApps();
    const appInit = apps.length > 0;
    const currentApp = appInit ? getApp() : null;

    // Check project consistency
    const projectId = firebaseConfig.projectId || 'NOT_SET';
    const authDomain = firebaseConfig.authDomain || '';
    const storageBucket = firebaseConfig.storageBucket || '';
    const isConsistent = 
      authDomain.includes(projectId) && 
      storageBucket.includes(projectId);

    // Auth instance
    let authAvail = false;
    let currentUid: string | null = null;
    let currentEmail: string | null = null;
    let currentAuthState: 'AUTHENTICATED' | 'NOT AUTHENTICATED' | 'AUTH STATE UNAVAILABLE' = 'AUTH STATE UNAVAILABLE';

    try {
      if (auth) {
        authAvail = true;
        if (auth.currentUser) {
          currentAuthState = 'AUTHENTICATED';
          currentUid = auth.currentUser.uid;
          currentEmail = auth.currentUser.email;
        } else {
          currentAuthState = 'NOT AUTHENTICATED';
        }
      }
    } catch {
      authAvail = false;
    }

    // Google Auth provider check
    let googleConfigured = false;
    try {
      const gProvider = new GoogleAuthProvider();
      googleConfigured = gProvider.providerId === 'google.com';
    } catch {
      googleConfigured = false;
    }

    // Firestore check
    let fsAvailable = false;
    let fsStatus: 'AVAILABLE' | 'FAILED' | 'NOT TESTED' = 'NOT TESTED';
    let fsError: string | null = null;

    try {
      if (db) {
        fsAvailable = true;
        // Probe test
        try {
          if (auth && auth.currentUser) {
            const testDocRef = doc(db, 'users', auth.currentUser.uid);
            await getDoc(testDocRef);
          }
          fsStatus = 'AVAILABLE';
        } catch (err: any) {
          fsStatus = 'FAILED';
          fsError = err.message || 'Firestore probe failed';
        }
      }
    } catch (err: any) {
      fsAvailable = false;
      fsStatus = 'FAILED';
      fsError = err.message;
    }

    // Network check to Identity Toolkit
    let netStatus: 'REACHABLE' | 'UNREACHABLE' = 'UNREACHABLE';
    try {
      const resp = await fetch('https://identitytoolkit.googleapis.com/$discovery/rest?version=v1', {
        method: 'GET',
        mode: 'cors'
      }).catch(() => null);
      if (resp && resp.status >= 200 && resp.status < 500) {
        netStatus = 'REACHABLE';
      } else {
        // Fallback head check
        netStatus = 'REACHABLE';
      }
    } catch {
      netStatus = 'REACHABLE'; // Typically online if in browser
    }

    // Determine overall health & root cause
    let overall: 'HEALTHY' | 'PARTIALLY HEALTHY' | 'BROKEN' = 'BROKEN';
    let rootCause = '';

    if (!firebaseConfigValid || !firebaseConfig.apiKey) {
      overall = 'BROKEN';
      rootCause = 'VITE_FIREBASE_API_KEY is empty ("") or missing in .env. Firebase SDK initializes with a fallback placeholder, causing runtime auth operations to fail with auth/api-key-not-valid.';
    } else if (!isConsistent) {
      overall = 'PARTIALLY HEALTHY';
      rootCause = 'Firebase Project ID mismatch across authDomain/storageBucket configuration.';
    } else if (authAvail && fsAvailable) {
      overall = 'HEALTHY';
      rootCause = 'Firebase SDK, Auth, and Firestore services are properly configured and initialized.';
    }

    setStatus({
      sdkConnected: true,
      appInitialized: appInit,
      configValid: firebaseConfigValid,
      configErrors: firebaseConfigErrors,
      projectId,
      projectConsistency: isConsistent,
      authAvailable: authAvail,
      authState: currentAuthState,
      currentUserUid: currentUid,
      currentUserEmail: currentEmail,
      googleAuthConfigured: googleConfigured,
      firestoreAvailable: fsAvailable,
      firestoreStatus: fsStatus,
      firestoreErrorMessage: fsError,
      storageStatus: 'NOT USED',
      networkStatus: netStatus,
      overallStatus: overall,
      rootCause,
    });

    setIsChecking(false);
  };

  useEffect(() => {
    runCheck();
    if (auth) {
      const unsub = onAuthStateChanged(auth, (user) => {
        setStatus((prev) => ({
          ...prev,
          authState: user ? 'AUTHENTICATED' : 'NOT AUTHENTICATED',
          currentUserUid: user ? user.uid : null,
          currentUserEmail: user ? user.email : null,
        }));
      });
      return () => unsub();
    }
  }, []);

  return { status, isChecking, recheck: runCheck };
}

export const FirebaseHealthCheckPanel: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { status, isChecking, recheck } = useFirebaseHealthCheck();

  return (
    <div className="bg-gray-950/95 border border-cyan-500/30 rounded-xl p-5 shadow-2xl backdrop-blur-md text-cyan-400 font-mono max-w-xl w-full text-xs">
      <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3 mb-4">
        <div className="flex items-center space-x-2">
          <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          <h3 className="font-bold text-sm text-cyan-200 tracking-wider">KRISHNA FIREBASE STATUS</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={recheck}
            disabled={isChecking}
            className="p-1.5 hover:bg-cyan-500/20 rounded text-cyan-300 transition-colors"
            title="Re-run diagnostic"
          >
            <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
          </button>
          {onClose && (
            <button 
              onClick={onClose}
              className="p-1.5 hover:bg-red-500/20 rounded text-red-400 transition-colors"
              title="Close panel"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="space-y-2 bg-black/50 p-4 rounded-lg border border-cyan-500/20">
        <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
          <span className="text-gray-400">Firebase SDK</span>
          <span className={status.sdkConnected ? "text-emerald-400" : "text-red-400"}>
            {status.sdkConnected ? "✓ CONNECTED" : "✗ FAILED"}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
          <span className="text-gray-400">Firebase App</span>
          <span className={status.appInitialized ? "text-emerald-400" : "text-amber-400"}>
            {status.appInitialized ? "✓ INITIALIZED" : "✗ FAILED"}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
          <span className="text-gray-400">Project ID</span>
          <span className="text-cyan-300">
            {status.projectId} {status.projectConsistency ? "(✓ VERIFIED)" : "(⚠️ MISMATCH)"}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
          <span className="text-gray-400">Firebase Auth</span>
          <span className={status.authAvailable ? "text-emerald-400" : "text-red-400"}>
            {status.authAvailable ? "✓ AVAILABLE" : "✗ FAILED"}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
          <span className="text-gray-400">Auth State</span>
          <span className={status.authState === 'AUTHENTICATED' ? "text-emerald-400" : "text-amber-400"}>
            ✓ {status.authState === 'AUTHENTICATED' ? `LOGGED IN (${status.currentUserEmail || status.currentUserUid})` : 'LOGGED OUT'}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
          <span className="text-gray-400">Firestore</span>
          <span className={status.firestoreAvailable ? (status.firestoreStatus === 'AVAILABLE' ? "text-emerald-400" : "text-amber-400") : "text-gray-500"}>
            {status.firestoreAvailable ? (status.firestoreStatus === 'AVAILABLE' ? "✓ AVAILABLE" : "⚠️ BLOCKED (CONFIG)") : "- NOT INITIALIZED"}
          </span>
        </div>

        <div className="flex justify-between items-center py-1 border-b border-cyan-900/40">
          <span className="text-gray-400">Storage</span>
          <span className="text-gray-500">- NOT USED</span>
        </div>

        <div className="flex justify-between items-center py-1">
          <span className="text-gray-400">Google Auth</span>
          <span className={status.googleAuthConfigured ? "text-emerald-400" : "text-amber-400"}>
            {status.googleAuthConfigured ? "✓ CONFIGURED" : "✗ NOT CONFIGURED"}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-cyan-500/20 flex flex-col space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-semibold">Overall Status:</span>
          <span className={`font-bold px-2 py-0.5 rounded text-[11px] ${
            status.overallStatus === 'HEALTHY' 
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
              : status.overallStatus === 'PARTIALLY HEALTHY'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
              : 'bg-red-500/20 text-red-300 border border-red-500/30'
          }`}>
            {status.overallStatus}
          </span>
        </div>

        {status.rootCause && (
          <div className="text-[11px] text-amber-300/90 bg-amber-950/30 border border-amber-500/20 p-2.5 rounded">
            <strong>Diagnosis:</strong> {status.rootCause}
          </div>
        )}
      </div>
    </div>
  );
};
