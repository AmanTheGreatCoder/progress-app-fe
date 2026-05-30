import React from 'react';

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  label: string;
  colorDot?: string;
}

export const FilterChip: React.FC<FilterChipProps> = ({ active, onClick, label, colorDot }) => {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-[500] border transition-colors ${
        active
          ? 'bg-primary text-primary-foreground border-primary'
          : 'bg-card text-muted-foreground border-border hover:bg-secondary active:bg-secondary'
      }`}
    >
      {colorDot && <div className={`w-2 h-2 rounded-full ${colorDot}`} />}
      {label}
    </button>
  );
};
