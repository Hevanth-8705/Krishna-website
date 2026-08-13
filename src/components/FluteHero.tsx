import React, { useRef, useEffect } from 'react';

interface FluteHeroProps {
  compact?: boolean;
  className?: string;
}

export function FluteHero({ compact = false, className = '' }: FluteHeroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let startTime = performance.now();

    // Check accessibility reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Handle high DPI scaling
    const updateCanvasSize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    updateCanvasSize();
    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(canvas);

    // Floating particles state
    const particles = Array.from({ length: 18 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.0008,
      speedY: (Math.random() - 0.5) * 0.0005,
      alpha: Math.random() * 0.7 + 0.3,
      color: Math.random() > 0.4 ? '#00D4FF' : '#F59E0B',
    }));

    const render = (time: number) => {
      const elapsed = (time - startTime) * 0.001;
      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      ctx.clearRect(0, 0, width, height);

      // Breathing animation factors
      const breathPulse = prefersReducedMotion ? 0.5 : (Math.sin(elapsed * 1.5) + 1) * 0.5; // 0 to 1
      const lightBeamPos = prefersReducedMotion ? 0.5 : (elapsed * 0.25) % 1.4 - 0.2; // -0.2 to 1.2

      const centerY = height / 2;
      const fluteWidth = Math.min(width * 0.85, 380);
      const fluteHeight = compact ? 16 : 20;
      const fluteLeft = (width - fluteWidth) / 2;
      const fluteRight = fluteLeft + fluteWidth;

      // 1. Draw Soft Cyan / Violet Ambient Background Breathing Aura
      const auraGrad = ctx.createRadialGradient(
        width / 2, centerY, 10,
        width / 2, centerY, fluteWidth * 0.6
      );
      const auraAlpha = 0.15 + breathPulse * 0.12;
      auraGrad.addColorStop(0, `rgba(0, 212, 255, ${auraAlpha})`);
      auraGrad.addColorStop(0.5, `rgba(124, 58, 237, ${auraAlpha * 0.6})`);
      auraGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.ellipse(width / 2, centerY, fluteWidth * 0.55, fluteHeight * 2.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Draw Floating Energy Particles
      particles.forEach((p) => {
        if (!prefersReducedMotion) {
          p.x += p.speedX;
          p.y += p.speedY;
          if (p.x < 0) p.x = 1;
          if (p.x > 1) p.x = 0;
          if (p.y < 0) p.y = 1;
          if (p.y > 1) p.y = 0;
        }

        const px = fluteLeft + p.x * fluteWidth;
        const py = centerY - fluteHeight * 2 + p.y * (fluteHeight * 4);
        const pAlpha = p.alpha * (0.6 + breathPulse * 0.4);

        ctx.fillStyle = p.color === '#00D4FF' ? `rgba(0, 212, 255, ${pAlpha})` : `rgba(245, 158, 11, ${pAlpha})`;
        ctx.beginPath();
        ctx.arc(px, py, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. Draw Flute Main Bamboo/Metallic Golden Cylinder Body
      const bodyGrad = ctx.createLinearGradient(fluteLeft, 0, fluteRight, 0);
      bodyGrad.addColorStop(0.0, '#78350F');
      bodyGrad.addColorStop(0.12, '#D97706');
      bodyGrad.addColorStop(0.35, '#F59E0B');
      bodyGrad.addColorStop(0.5, '#FEF08A');
      bodyGrad.addColorStop(0.65, '#F59E0B');
      bodyGrad.addColorStop(0.88, '#D97706');
      bodyGrad.addColorStop(1.0, '#78350F');

      // Draw Main Flute Body with rounded ends
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(fluteLeft, centerY - fluteHeight / 2, fluteWidth, fluteHeight, fluteHeight / 2);
      ctx.fillStyle = bodyGrad;
      ctx.fill();

      // Metallic 3D Cylindrical Shading Overlay
      const shadeGrad = ctx.createLinearGradient(0, centerY - fluteHeight / 2, 0, centerY + fluteHeight / 2);
      shadeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      shadeGrad.addColorStop(0.3, 'rgba(255, 255, 255, 0.05)');
      shadeGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.25)');
      shadeGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.6)');

      ctx.fillStyle = shadeGrad;
      ctx.fill();
      ctx.restore();

      // 4. Draw End Cap & Metallic Bamboo Nodes (Joint Rings)
      const ringGrad = ctx.createLinearGradient(0, centerY - fluteHeight / 2 - 2, 0, centerY + fluteHeight / 2 + 2);
      ringGrad.addColorStop(0, '#FEF08A');
      ringGrad.addColorStop(0.5, '#D97706');
      ringGrad.addColorStop(1, '#78350F');

      // Left Crown Cap
      ctx.fillStyle = ringGrad;
      ctx.beginPath();
      ctx.roundRect(fluteLeft - 8, centerY - (fluteHeight + 2) / 2, 10, fluteHeight + 2, 3);
      ctx.fill();

      // Joint Rings
      const ringPositions = [0.18, 0.42, 0.65, 0.85];
      ringPositions.forEach((pos) => {
        const rx = fluteLeft + fluteWidth * pos;
        ctx.fillStyle = ringGrad;
        ctx.beginPath();
        ctx.roundRect(rx, centerY - (fluteHeight + 3) / 2, 5, fluteHeight + 3, 2);
        ctx.fill();
      });

      // 5. Draw Blow Hole (Embouchure)
      const blowHoleX = fluteLeft + fluteWidth * 0.08;
      ctx.beginPath();
      ctx.ellipse(blowHoleX, centerY, 4.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#090D16';
      ctx.fill();
      ctx.strokeStyle = '#FEF08A';
      ctx.lineWidth = 0.8;
      ctx.stroke();

      // 6. Draw 6 Finger Holes with Breathing Light Pulse
      const holePositions = [0.28, 0.36, 0.44, 0.54, 0.62, 0.70];
      holePositions.forEach((pos, idx) => {
        const hx = fluteLeft + fluteWidth * pos;
        const holeRadius = compact ? 3.2 : 3.8;

        // Outer Cyan Glow Ring
        const holeGlowRadius = holeRadius + 3 + breathPulse * 1.5;
        const hGlow = ctx.createRadialGradient(hx, centerY, 0, hx, centerY, holeGlowRadius);
        hGlow.addColorStop(0, 'rgba(0, 212, 255, 0.8)');
        hGlow.addColorStop(0.5, 'rgba(124, 58, 237, 0.4)');
        hGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = hGlow;
        ctx.beginPath();
        ctx.arc(hx, centerY, holeGlowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Dark Hole Core
        ctx.fillStyle = '#090D16';
        ctx.beginPath();
        ctx.arc(hx, centerY, holeRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FBBF24';
        ctx.lineWidth = 0.8;
        ctx.stroke();

        // Inner Pulsing Node
        const innerPulse = (Math.sin(elapsed * 3 + idx * 0.8) + 1) * 0.5;
        ctx.fillStyle = `rgba(0, 212, 255, ${0.6 + innerPulse * 0.4})`;
        ctx.beginPath();
        ctx.arc(hx, centerY, holeRadius * 0.45, 0, Math.PI * 2);
        ctx.fill();
      });

      // 7. Light Traveling Pulse along the Flute
      if (lightBeamPos >= 0 && lightBeamPos <= 1) {
        const beamX = fluteLeft + fluteWidth * lightBeamPos;
        const beamGrad = ctx.createRadialGradient(beamX, centerY, 0, beamX, centerY, 25);
        beamGrad.addColorStop(0, 'rgba(0, 212, 255, 0.6)');
        beamGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = beamGrad;
        ctx.beginPath();
        ctx.ellipse(beamX, centerY, 20, fluteHeight * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [compact]);

  return (
    <div 
      aria-hidden="true"
      className={`relative w-full flex items-center justify-center select-none overflow-hidden my-1 ${compact ? 'h-28' : 'h-36'} ${className}`}
    >
      <canvas
        ref={canvasRef}
        className="w-full h-full block cursor-default"
      />
    </div>
  );
}

export default FluteHero;
