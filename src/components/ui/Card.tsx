import React from 'react';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  pad?: number | string;
  style?: React.CSSProperties;
  onClick?: () => void;
  accent?: string;
}

export const Card: React.FC<CardProps> = ({ children, pad = 16, style, onClick, accent }) => {
  return (
    <div onClick={onClick} style={{
      background: 'var(--surface)',
      borderRadius: 18,
      padding: pad,
      border: '1px solid var(--border)',
      position: 'relative',
      overflow: 'hidden',
      cursor: onClick ? 'pointer' : 'default',
      ...style,
    }}>
      {accent && (
        <div style={{
          position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent,
        }}/>
      )}
      {children}
    </div>
  );
};
