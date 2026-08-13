import { useState, useEffect, useCallback } from 'react';
import { 
  UserSessionData, 
  createSession, 
  getUserSessions, 
  subscribeUserSessions, 
  updateSession, 
  deleteSession 
} from '../services/sessionService';

export function useUserSessions(userId?: string) {
  const [sessions, setSessions] = useState<UserSessionData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to real-time session updates if userId is provided
  useEffect(() => {
    if (!userId) {
      setSessions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeUserSessions(
      userId,
      (data) => {
        setSessions(data);
        setLoading(false);
      },
      (err) => {
        setError(err.message || 'Failed to fetch user sessions');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // Create/Add a session
  const addSession = useCallback(async (sessionData: Omit<UserSessionData, 'id' | 'createdAt' | 'lastActive'>) => {
    try {
      setError(null);
      const newId = await createSession(sessionData);
      return newId;
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to create session';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, []);

  // Update a session
  const editSession = useCallback(async (sessionId: string, updates: Partial<Omit<UserSessionData, 'id'>>) => {
    try {
      setError(null);
      await updateSession(sessionId, updates);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to update session';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, []);

  // Delete/Remove a session
  const removeSession = useCallback(async (sessionId: string) => {
    try {
      setError(null);
      await deleteSession(sessionId);
    } catch (err: any) {
      const errMsg = err?.message || 'Failed to delete session';
      setError(errMsg);
      throw new Error(errMsg);
    }
  }, []);

  // Manual fetch refresh function
  const refetch = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const fetched = await getUserSessions(userId);
      setSessions(fetched);
    } catch (err: any) {
      setError(err?.message || 'Failed to refresh sessions');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  return {
    sessions,
    loading,
    error,
    addSession,
    editSession,
    removeSession,
    refetch
  };
}
