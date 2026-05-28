import React from 'react';
import { Icon } from './Icon';

interface StreakChipProps {
  days: number;
  size?: 'sm' | 'lg';
}

export const StreakChip: React.FC<StreakChipProps> = ({ days, size = 'sm' }) => {
  const big = size === 'lg';
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-pill bg-secondary-muted text-c-secondary font-bold leading-none
        ${big ? 'py-1.5 px-2.5 text-sm' : 'py-[3px] px-2 text-2xs'}`}
    >
      <Icon name="flame" size={big ? 14 : 12} color="var(--secondary)" stroke={2} />
      {days}
    </span>
  );
};
