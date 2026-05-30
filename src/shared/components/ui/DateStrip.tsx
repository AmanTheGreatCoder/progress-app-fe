import React, { useRef, useEffect } from 'react';
import { getLocalYMD, DAY_NAMES, addDays, todayDate } from '@shared/utils/dateUtils';

const STRIP_DAYS = (() => {
  const days = [];
  const t = todayDate();
  for (let i = -30; i <= 30; i++) {
    const d = addDays(t, i);
    days.push({
      key: getLocalYMD(d),
      dayName: DAY_NAMES[d.getDay()],
      dayNum: d.getDate(),
      isToday: i === 0,
      offset: i,
    });
  }
  return days;
})();

export const DateStrip: React.FC<{
  selected: string,
  onSelect: (k: string) => void
}> = ({ selected, onSelect }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const todayRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (todayRef.current && scrollRef.current) {
      const strip = scrollRef.current;
      const btn = todayRef.current;
      strip.scrollLeft = btn.offsetLeft - strip.clientWidth / 2 + btn.offsetWidth / 2;
    }
  }, []);

  return (
    <div
      ref={scrollRef}
      className="flex gap-2 pt-2 pb-4 overflow-x-auto px-4 -mx-4 hide-scrollbar"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      {STRIP_DAYS.map(d => {
        const active = d.key === selected;
        return (
          <button
            key={d.key}
            ref={d.isToday ? todayRef : undefined}
            onClick={() => onSelect(d.key)}
            className={`flex flex-col items-center justify-center gap-0.5 py-2.5 rounded-[12px] min-w-[56px] cursor-pointer relative border transition-all duration-200 shrink-0
              ${active
                ? 'bg-primary border-primary text-primary-foreground shadow-sm scale-105'
                : 'bg-card border-border text-foreground hover:bg-secondary'
              }
            `}
          >
            <span
              className={`text-[11px] font-[600] uppercase tracking-wide ${
                active ? 'text-primary-foreground/90' : d.isToday ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              {d.dayName}
            </span>
            <span className={`text-[18px] font-[700] leading-none tracking-tight ${active ? 'text-primary-foreground' : 'text-foreground'}`}>
              {d.dayNum}
            </span>
          </button>
        );
      })}
    </div>
  );
};
