import React from 'react';
import { KrishnaFluteHero } from './KrishnaFluteHero';

interface AuthLayoutProps {
  children: React.ReactNode;
}

/**
 * Layout for authentication pages.
 * Provides background layers, responsive two‑column layout on desktop,
 * and single column on mobile. The flute hero is displayed on the left side
 * (or top on mobile) with reduced animation on small screens.
 */
export default function AuthLayout({ children }: AuthLayoutProps) {
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  return (
    <div className="auth-bg flex flex-col md:flex-row items-center justify-center min-h-screen p-4">
      {/* Flute visual */}
      <div className={`w-full ${isMobile ? 'h-48 mb-6' : 'w-1/2 h-full'}`}>
        <KrishnaFluteHero compact={isMobile} />
      </div>
      {/* Auth card */}
      <div className="flex-1 flex items-center justify-center">
        {children}
      </div>
    </div>
  );
}
