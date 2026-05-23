import React from 'react';
import { Icon } from './Icon';

interface StreakChipProps {
  days: number;
  size?: 'sm' | 'lg';
}

export const StreakChip: React.FC<StreakChipProps> = ({ days, size = 'sm' }) => {
  const big = size === 'lg';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: big ? '6px 10px' : '3px 8px',
      borderRadius: 999,
      background: 'rgba(78,205,196,0.12)',
      color: 'var(--secondary)',
      fontSize: big ? 13 : 11,
      fontWeight: 700,
      lineHeight: 1,
    }}>
      <Icon name="flame" size={big ? 14 : 12} color="var(--secondary)" stroke={2}/>
      {days}
    </span>
  );
};
