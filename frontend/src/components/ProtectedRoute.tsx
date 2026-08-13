import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldAlert, LogIn, UserPlus, Lock } from 'lucide-react';
import { motion } from 'motion/react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin" />
          <Loader2 className="absolute inset-0 m-auto text-[#00E5FF] animate-pulse" size={24} />
        </div>
        <p className="text-xs font-mono text-[#00E5FF] tracking-widest uppercase">
          VERIFYING OPERATOR CREDENTIALS...
        </p>
      </div>
    );
  }

  if (!user) {
    return (
      <Navigate to="/login" state={{ from: location.pathname, message: 'Authentication required. Please sign in to access Krishna Web OS core.' }} replace />
    );
  }

  return <>{children}</>;
};
