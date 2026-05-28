import React from 'react';
import type { ReactNode } from 'react';

interface PillProps {
  children: ReactNode;
  color?: string;
  bg?: string;
  dot?: boolean;
  style?: React.CSSProperties;
}

export const Pill: React.FC<PillProps> = ({ children, color = 'var(--text-secondary)', bg, dot, style }) => {
  return (
    <span
      className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-pill text-2xs font-semibold uppercase leading-none"
      style={{ background: bg || 'rgba(255,255,255,0.04)', color, letterSpacing: '0.4px', ...style }}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />}
      {children}
    </span>
  );
};
