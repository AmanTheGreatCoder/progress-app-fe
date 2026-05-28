import React from 'react';
import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  pad?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
  accent?: string;
}

export const Card: React.FC<CardProps> = ({ children, pad = 16, className, style, onClick, accent }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-c-surface rounded-[18px] border border-c-border relative overflow-hidden ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className ?? ''}`}
      style={{ padding: pad, ...style }}
    >
      {accent && (
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      )}
      {children}
    </div>
  );
};
