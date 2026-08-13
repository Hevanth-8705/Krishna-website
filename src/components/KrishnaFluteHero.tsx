import React from 'react';
import { FluteHero } from './FluteHero';

interface KrishnaFluteHeroProps {
  compact?: boolean;
  className?: string;
}

export function KrishnaFluteHero({ compact = false, className = '' }: KrishnaFluteHeroProps) {
  return (
    <div className={className}>
      <FluteHero compact={compact} />
    </div>
  );
}

