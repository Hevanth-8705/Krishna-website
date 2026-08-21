import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  serverTimestamp,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from "firebase/firestore";
import { db } from "../lib/firebase";

export interface UserSessionData {
  id?: string;
  userId: string;
  userEmail?: string;
  device?: string;
  ipAddress?: string;
  status: 'active' | 'idle' | 'terminated';
  lastActive?: any;
  createdAt?: any;
  location?: string;
  metadata?: Record<string, any>;
}

const SESSIONS_COLLECTION = "user_sessions";

// CRUD Operations for User Session Data

/**
 * Create a new user session document in Firestore
 */
export const createSession = async (sessionData: Omit<UserSessionData, 'id' | 'createdAt' | 'lastActive'>): Promise<string> => {
  const collectionRef = collection(db, SESSIONS_COLLECTION);
  const docRef = await addDoc(collectionRef, {
    ...sessionData,
    createdAt: serverTimestamp(),
    lastActive: serverTimestamp(),
  });
  return docRef.id;
};

/**
 * Get a single user session by Document ID
 */
export const getSessionById = async (sessionId: string): Promise<UserSessionData | null> => {
  const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      id: docSnap.id,
      ...docSnap.data()
    } as UserSessionData;
  }
  return null;
};

/**
 * Get all sessions for a specific user ID
 */
export const getUserSessions = async (userId: string): Promise<UserSessionData[]> => {
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where("userId", "==", userId)
  );
  const querySnapshot = await getDocs(q);
  const sessions: UserSessionData[] = [];
  querySnapshot.forEach((docSnap) => {
    sessions.push({
      id: docSnap.id,
      ...docSnap.data()
    } as UserSessionData);
  });
  return sessions;
};

/**
 * Realtime listener for user sessions
 */
export const subscribeUserSessions = (
  userId: string,
  onUpdate: (sessions: UserSessionData[]) => void,
  onError?: (error: Error) => void
) => {
  const q = query(
    collection(db, SESSIONS_COLLECTION),
    where("userId", "==", userId)
  );

  return onSnapshot(
    q,
    (querySnapshot: QuerySnapshot<DocumentData>) => {
      const sessions: UserSessionData[] = [];
      querySnapshot.forEach((docSnap) => {
        sessions.push({
          id: docSnap.id,
          ...docSnap.data()
        } as UserSessionData);
      });
      onUpdate(sessions);
    },
    (error) => {
      console.error("Error listening to user sessions:", error);
      if (onError) onError(error);
    }
  );
};

/**
 * Update an existing user session document
 */
export const updateSession = async (
  sessionId: string, 
  updates: Partial<Omit<UserSessionData, 'id'>>
): Promise<void> => {
  const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
  await updateDoc(docRef, {
    ...updates,
    lastActive: serverTimestamp()
  });
};

/**
 * Delete a user session document from Firestore
 */
export const deleteSession = async (sessionId: string): Promise<void> => {
  const docRef = doc(db, SESSIONS_COLLECTION, sessionId);
  await deleteDoc(docRef);
};
