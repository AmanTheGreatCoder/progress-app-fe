import React, { useRef, useEffect } from 'react';
import { getLocalYMD, DAY_NAMES, addDays, todayDate } from '@shared/utils/dateUtils';

export const STRIP_DAYS = (() => {
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
      className="flex gap-2 pt-4 pb-6 overflow-x-auto"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' } as React.CSSProperties}
    >
      {STRIP_DAYS.map(d => {
        const active = d.key === selected;
        return (
          <button
            key={d.key}
            ref={d.isToday ? todayRef : undefined}
            onClick={() => onSelect(d.key)}
            className={`flex flex-col items-center gap-0.5 pt-[10px] pb-3 rounded-card min-w-[50px] cursor-pointer relative border
              ${active
                ? 'bg-c-primary border-c-primary text-white -translate-y-0.5'
                : 'bg-c-surface border-c-border text-c-text1 translate-y-0'
              }
            `}
            style={{
              boxShadow: active ? '0 10px 24px rgba(124,106,247,0.45)' : 'none',
              transition: 'transform 240ms cubic-bezier(.2,.8,.2,1), background 200ms, box-shadow 240ms',
            }}
          >
            <span
              className="text-2xs font-bold uppercase tracking-label"
              style={{
                color: active ? 'rgba(255,255,255,0.85)' : d.isToday ? 'var(--primary)' : 'var(--text-secondary)',
              }}
            >
              {d.dayName}
            </span>
            <span className={`text-xl font-bold leading-none tracking-tight ${active ? 'text-white' : 'text-c-text1'}`}>
              {d.dayNum}
            </span>
          </button>
        );
      })}
    </div>
  );
};
