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
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '4px 10px', borderRadius: 999,
      background: bg || 'rgba(255,255,255,0.04)',
      color, fontSize: 11, fontWeight: 600, letterSpacing: 0.4,
      textTransform: 'uppercase', lineHeight: 1,
      ...style,
    }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: color }}/>}
      {children}
    </span>
  );
};
