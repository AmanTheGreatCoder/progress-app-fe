import React, { useRef, useEffect } from 'react';
import { getLocalYMD, DAY_NAMES, addDays, todayDate } from '../../utils/dateUtils';

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
    <div ref={scrollRef} style={{
      display: 'flex',
      gap: 8,
      padding: '16px 0px 24px 0px',
      overflowX: 'auto',
      WebkitOverflowScrolling: 'touch' as any,
      scrollbarWidth: 'none' as any,
      msOverflowStyle: 'none' as any,
    }}>
      {STRIP_DAYS.map(d => {
        const active = d.key === selected;
        return (
          <button key={d.key} ref={d.isToday ? todayRef : undefined} onClick={() => onSelect(d.key)} style={{
            padding: '10px 0 12px',
            borderRadius: 14,
            minWidth: 50,
            background: active ? 'var(--primary)' : 'var(--surface)',
            border: `1px solid ${active ? 'var(--primary)' : 'var(--border)'}`,
            color: active ? '#fff' : 'var(--text-primary)',
            cursor: 'pointer',
            justifyContent: 'center',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            boxShadow: active ? '0 10px 24px rgba(124,106,247,0.45)' : 'none',
            transform: active ? 'translateY(-2px)' : 'none',
            transition: 'transform 240ms cubic-bezier(.2,.8,.2,1), background 200ms, box-shadow 240ms',
            position: 'relative',
          }}>
            <span style={{
              fontSize: 10.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase',
              color: active ? 'rgba(255,255,255,0.85)' : d.isToday ? 'var(--primary)' : 'var(--text-secondary)',
            }}>{d.dayName}</span>
            <span style={{
              fontSize: 18, fontWeight: 700, letterSpacing: -0.3,
              color: active ? '#fff' : 'var(--text-primary)',
              lineHeight: 1,
            }}>{d.dayNum}</span>
          </button>
        );
      })}
    </div>
  );
};
