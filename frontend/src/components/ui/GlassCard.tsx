import React, { useRef } from 'react';

export const GlassCard = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden rounded-2xl bg-white/[0.04] backdrop-blur-2xl 
        border border-white/10 transition-all duration-300 ease-out
        hover:border-purple-500/50
        hover:shadow-[calc((var(--mouse-x,0px)-50%)*0.04px)_calc((var(--mouse-y,0px)-50%)*0.04px)_35px_-5px_rgba(168,85,247,0.25)]
        before:pointer-events-none before:absolute before:-inset-px before:rounded-2xl 
        before:bg-[radial-gradient(400px_circle_at_var(--mouse-x,0px)_var(--mouse-y,0px),rgba(168,85,247,0.2),transparent_70%)]
        before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 ${className}`}
    >
      <div className="relative z-10 w-full h-full flex flex-col">
        {children}
      </div>
    </div>
  );
};
