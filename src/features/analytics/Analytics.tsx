import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '@shared/components/ui/Card';
import { DateStrip, STRIP_DAYS } from '@shared/components/ui/DateStrip';
import { TODAY, DAY_NAMES, MONTH_NAMES, addDays, getLocalYMD, todayDate } from '@shared/utils/dateUtils';
import { Icon } from '@shared/components/ui/Icon';
import { ProgressBar } from '@shared/components/ui/ProgressBar';
import { useAppContext } from '@shared/context/AppContext';
import { CATEGORY_COLORS } from '@shared/constants';
import type { Goal } from '@shared/types';
import api from '@shared/api';

const fmtKey = (d: Date) => getLocalYMD(d);

const dueToKey = (due: string): string | undefined => {
  if (due === 'Today') return STRIP_DAYS.find(d => d.offset === 0)?.key;
  if (due === 'Tomorrow') return STRIP_DAYS.find(d => d.offset === 1)?.key;
  const idx = DAY_NAMES.findIndex(n => n === due);
  if (idx < 0) return due;
  const t = todayDate();
  for (let i = 1; i <= 7; i++) {
    const d = addDays(t, i);
    if (d.getDay() === idx) return fmtKey(d);
  }
  return undefined;
};

// ── Pure helper — no closure over component state ─────────────────────────────
interface DayItem {
  title: string;
  goalId: string;
  category: string;
  source: string;
  points: number;
  done: boolean;
  completedMin: boolean;
}

interface DayInfo {
  total: number;
  target: number;
  items: DayItem[];
  isFuture: boolean;
}

interface WeekTask {
  title: string;
  due: string;
  done: boolean;
  completedMin?: boolean;
  goalId: string;
  source: string;
  tags: string[];
  points?: number;
}

const TASK_CATEGORIES = ['Health', 'Career', 'Learning', 'Wellness', 'Finance', 'Routine', 'Work', 'Personal'];

function getDayPoints(dateKey: string, weekTasks: WeekTask[], goals: Goal[]): DayInfo {
  const d = new Date(dateKey + 'T00:00:00');

  const dayTasks = weekTasks.filter(t => {
    const k = dueToKey(t.due) || t.due;
    return k === dateKey;
  });

  const target = dayTasks.reduce((s, t) => s + (t.points || 0), 0);

  if (d > todayDate()) return { total: 0, target, items: [], isFuture: true };

  const items: DayItem[] = dayTasks.map(t => {
    const g = goals.find(goal => goal.id === t.goalId);
    let cat = g ? g.category : 'Other';
    for (const c of TASK_CATEGORIES) {
      if (t.tags.map((tag: string) => tag.toLowerCase()).includes(c.toLowerCase())) {
        cat = c;
        break;
      }
    }
    return {
      title: t.title,
      goalId: t.goalId,
      category: cat,
      source: t.source || 'TickTick',
      points: t.points || 0,
      done: t.done,
      completedMin: t.completedMin || false,
    };
  });

  const total = items.reduce((s, x) => s + (x.completedMin ? Math.round(x.points / 2) : x.done ? x.points : 0), 0);

  return { total, target, items, isFuture: false };
}

// ──────────────────────────────────────────────────────────────
// Subcomponents
// ──────────────────────────────────────────────────────────────

const PointsRing = ({ pct, size = 104, stroke = 9, color, bg, children }: {
  pct: number; size?: number; stroke?: number; color?: string; bg?: string; children?: React.ReactNode;
}) => {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const target = c * (1 - Math.min(1, Math.max(0, pct / 100)));
  const [offset, setOffset] = useState(c);
  useEffect(() => {
    const id = requestAnimationFrame(() => setOffset(target));
    return () => cancelAnimationFrame(id);
  }, [target]);
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={bg || 'var(--surface2)'} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color || 'var(--primary)'} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        {children}
      </div>
    </div>
  );
};

const DayPointsCard = ({ dayInfo, dateMeta }: { dayInfo: DayInfo; dateMeta: typeof STRIP_DAYS[0] }) => {
  const target = dayInfo.target > 0 ? dayInfo.target : 0;
  const pct = target > 0 ? Math.min(100, (dayInfo.total / target) * 100) : 0;
  const heading = dateMeta.offset === 0 ? 'Today'
    : dateMeta.offset === 1 ? 'Tomorrow'
      : dateMeta.offset === -1 ? 'Yesterday'
        : `${dateMeta.dayName} ${dateMeta.dayNum}`;
  const reached = target > 0 && dayInfo.total >= target;
  const accent = reached ? 'var(--success)' : 'var(--primary)';
  return (
    <Card pad={20} style={{ background: 'linear-gradient(135deg, var(--surface) 0%, #20203a 100%)' }}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-c-text2 text-2xs font-bold tracking-label uppercase">
            {heading} · Points
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-[52px] font-extrabold text-c-text1 leading-none tabular-nums" style={{ letterSpacing: '-2px' }}>
              {dayInfo.total}
            </span>
            <span className="text-c-text2 text-base">/ {target}</span>
          </div>
          <div className="mt-[14px] max-w-[180px]">
            <ProgressBar value={pct} color={accent} bg="var(--bg)" height={5} />
          </div>
          <div className="text-c-text2 text-xs mt-2">
            {dayInfo.isFuture ? "Hasn't happened yet"
              : target === 0 ? 'No tasks for today'
                : reached ? 'Daily goal reached'
                  : `${target - dayInfo.total} pts to daily goal`}
          </div>
        </div>
        <PointsRing pct={pct} color={accent}>
          <div className="text-center">
            <div className="text-c-text1 text-xl font-bold leading-none tabular-nums">
              {Math.round(pct)}<span className="text-xs text-c-text2">%</span>
            </div>
            <div className="text-c-text3 text-3xs font-bold tracking-label uppercase mt-[3px]">of goal</div>
          </div>
        </PointsRing>
      </div>
    </Card>
  );
};

const CategoryBreakdown = ({ dayInfo }: { dayInfo: DayInfo }) => {
  const byCat: Record<string, number> = {};
  dayInfo.items.forEach(it => {
    const pts = it.completedMin ? Math.round(it.points / 2) : it.done ? it.points : 0;
    if (pts > 0) byCat[it.category] = (byCat[it.category] || 0) + pts;
  });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  if (cats.length === 0) return null;
  const total = cats.reduce((s, [, p]) => s + p, 0);
  return (
    <Card pad={16}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-c-text1 text-2xs font-bold tracking-label uppercase">
          By category
        </span>
        <span className="text-c-text3 text-2xs font-semibold">{total} pts</span>
      </div>
      <div className="flex h-2 rounded overflow-hidden bg-c-bg">
        {cats.map(([cat, pts]) => (
          <div key={cat} style={{
            width: `${(pts / total) * 100}%`,
            background: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other,
            transition: 'width 800ms cubic-bezier(.2,.8,.2,1)',
          }} />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-x-[18px] gap-y-[10px] mt-[14px]">
        {cats.map(([cat, pts]) => (
          <div key={cat} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: CATEGORY_COLORS[cat] || CATEGORY_COLORS.Other }} />
            <span className="text-c-text1 text-xs font-semibold flex-1">{cat}</span>
            <span className="text-c-text2 text-xs font-semibold tabular-nums">{pts}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const WeekChart = ({ weekDays, selectedKey, onSelectDay }: {
  weekDays: { key: string; dayName: string; dayNum: number; points: number; target: number; isFuture: boolean; isToday: boolean }[];
  selectedKey: string;
  onSelectDay: (k: string) => void;
}) => {
  const maxPts = Math.max(10, ...weekDays.map(d => d.points));
  return (
    <div>
      <div className="relative h-[132px] mb-[10px] pt-[10px]">
        <div className="absolute left-0 right-0 top-[10px] bottom-0 grid grid-cols-7 gap-2 items-end">
          {weekDays.map(d => {
            const isSelected = d.key === selectedKey;
            const reached = d.target > 0 && d.points >= d.target;
            const h = d.isFuture ? 3 : Math.max(3, (d.points / maxPts) * 100);
            const color = d.isFuture ? 'var(--surface2)'
              : reached ? 'var(--success)'
                : 'var(--primary)';
            return (
              <button
                key={d.key}
                onClick={() => onSelectDay(d.key)}
                aria-label={`${d.dayName} ${d.dayNum}: ${d.points} points`}
                className="bg-transparent border-none p-0 cursor-pointer h-full flex flex-col justify-end relative"
              >
                {isSelected && !d.isFuture && (
                  <span style={{
                    position: 'absolute', bottom: `calc(${h}% + 6px)`,
                    left: '50%', transform: 'translateX(-50%)',
                    fontSize: 10.5, fontWeight: 700, color: 'var(--text-primary)',
                    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
                  }}>{d.points}</span>
                )}
                <div style={{
                  height: `${h}%`,
                  background: color,
                  borderRadius: 6,
                  opacity: d.isFuture ? 0.5 : (isSelected ? 1 : 0.55),
                  outline: d.isToday && !isSelected ? '1.5px solid var(--text-secondary)' : 'none',
                  outlineOffset: -1.5,
                  transition: 'opacity 200ms, height 800ms cubic-bezier(.2,.8,.2,1)',
                  width: '100%',
                }} />
              </button>
            );
          })}
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(d => {
          const isSelected = d.key === selectedKey;
          return (
            <div key={d.key} className="text-center">
              <div
                className="text-2xs font-bold tracking-label uppercase"
                style={{ color: isSelected ? 'var(--text-primary)' : (d.isToday ? 'var(--text-secondary)' : 'var(--text-tertiary)') }}
              >
                {d.dayName[0]}
              </div>
              <div
                className="text-2xs font-semibold mt-0.5 tabular-nums"
                style={{ color: isSelected ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
              >
                {d.dayNum}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EarnedTasksList = ({ items }: { items: DayItem[] }) => {
  if (items.length === 0) return null;
  return (
    <Card pad={0} className="overflow-hidden">
      {items.map((it, i) => {
        const cat = CATEGORY_COLORS[it.category] || 'var(--text-secondary)';
        const isDone = it.done || it.completedMin;
        const pts = it.completedMin ? Math.round(it.points / 2) : it.done ? it.points : 0;
        return (
          <div
            key={i}
            className="flex items-center gap-3.5 py-3 px-4"
            style={{
              borderBottom: i === items.length - 1 ? 'none' : '1px solid var(--border)',
              opacity: isDone ? 1 : 0.6,
            }}
          >
            <div style={{
              width: 22, height: 22, borderRadius: 7, flexShrink: 0,
              border: `2px solid ${!isDone ? 'var(--border)' : it.completedMin ? 'var(--warning)' : cat}`,
              background: !isDone ? 'transparent' : it.completedMin ? 'color-mix(in srgb, var(--warning) 13%, transparent)' : cat,
              display: 'grid', placeItems: 'center',
            }}>
              {isDone && !it.completedMin && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="var(--bg)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              {it.completedMin && (
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M2 5l2.5 2.5 3.5-4" stroke="var(--warning)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-base font-semibold truncate"
                style={{ color: isDone ? 'var(--text-primary)' : 'var(--text-secondary)' }}
              >
                {it.title}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-[5px] h-[5px] rounded-full" style={{ background: isDone ? cat : 'var(--text-tertiary)' }} />
                <span className="text-c-text2 text-2xs">{it.category}</span>
                <span className="text-c-text3 text-2xs">·</span>
                <span className="text-c-text2 text-2xs">{it.source}</span>
              </div>
            </div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 12.5, fontWeight: 700,
              color: isDone ? (it.completedMin ? 'var(--warning)' : 'var(--text-primary)') : 'var(--text-secondary)',
              padding: '5px 10px', borderRadius: 999,
              background: isDone
                ? (it.completedMin ? 'color-mix(in srgb, var(--warning) 12%, transparent)' : `color-mix(in srgb, ${cat} 12%, transparent)`)
                : 'var(--surface2)',
              border: `1px solid ${isDone ? (it.completedMin ? 'color-mix(in srgb, var(--warning) 25%, transparent)' : `color-mix(in srgb, ${cat} 25%, transparent)`) : 'var(--border)'}`,
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}>
              {it.completedMin && it.points > 0 && (
                <span className="line-through opacity-40 text-2xs">
                  {it.points}
                </span>
              )}
              {pts > 0 ? `+${pts}` : '0'}
            </div>
          </div>
        );
      })}
    </Card>
  );
};

// ──────────────────────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────────────────────
const Analytics: React.FC = () => {
  const { goals } = useAppContext();
  const todayKey = STRIP_DAYS.find(d => d.offset === 0)?.key || TODAY;
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [weekOffset, setWeekOffset] = useState(0);
  const [weekTasks, setWeekTasks] = useState<WeekTask[]>([]);

  const dateMeta = STRIP_DAYS.find(d => d.key === selectedDate) || STRIP_DAYS[3];

  const tDate = todayDate();
  const dow = tDate.getDay();
  const daysToMonday = (dow + 6) % 7;
  const currentMonday = addDays(tDate, -daysToMonday);
  const startMonday = addDays(currentMonday, weekOffset * 7);
  const endDay = addDays(startMonday, 6);

  useEffect(() => {
    const from = getLocalYMD(addDays(startMonday, -7));
    const to   = getLocalYMD(addDays(endDay, 4));
    api.get(`/tasks?from=${from}&to=${to}`).then(res => {
      const mapped: WeekTask[] = (res.data as Record<string, unknown>[]).map(t => ({
        title: (t.name as string) || '',
        due: (t.date as string) || '',
        done: (t.completed as boolean) || false,
        completedMin: (t.completedMin as boolean) || false,
        goalId: '',
        source: 'Notion',
        tags: (t.tags as string[]) || [],
        points: (t.points as number) || 0,
      }));
      setWeekTasks(mapped);
    }).catch(console.error);
  // weekOffset drives startMonday/endDay; listing it avoids stale closure
  }, [weekOffset]); // eslint-disable-line react-hooks/exhaustive-deps

  const dayInfo = getDayPoints(selectedDate, weekTasks, goals);

  const weekDays = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(startMonday, i);
      const k = fmtKey(d);
      const isFuture = d > tDate;
      const info = getDayPoints(k, weekTasks, goals);
      arr.push({
        key: k,
        dayName: DAY_NAMES[d.getDay()],
        dayNum: d.getDate(),
        points: info.total,
        target: info.target,
        isFuture,
        isToday: k === TODAY,
      });
    }
    return arr;
  }, [weekOffset, weekTasks, goals, startMonday, tDate]);

  const sameMonth = startMonday.getMonth() === endDay.getMonth();
  const weekRange = sameMonth
    ? `${MONTH_NAMES[startMonday.getMonth()]} ${startMonday.getDate()} – ${endDay.getDate()}`
    : `${MONTH_NAMES[startMonday.getMonth()]} ${startMonday.getDate()} – ${MONTH_NAMES[endDay.getMonth()]} ${endDay.getDate()}`;

  const realDays = weekDays.filter(d => !d.isFuture);
  const weekTotal = realDays.reduce((s, d) => s + d.points, 0);
  const dailyAvg = realDays.length > 0 ? Math.round(weekTotal / realDays.length) : 0;
  const daysHitGoal = realDays.filter(d => d.target > 0 && d.points >= d.target).length;

  const prevWeekTotal = useMemo(() => {
    const prevStart = addDays(startMonday, -7);
    let s = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(prevStart, i);
      if (d > tDate) continue;
      s += getDayPoints(fmtKey(d), weekTasks, goals).total;
    }
    return s;
  }, [weekOffset, weekTasks, goals, startMonday, tDate]);

  const delta = weekTotal - prevWeekTotal;
  const canForward = weekOffset < 0;

  const handleSelectDay = (k: string) => {
    if (STRIP_DAYS.find(d => d.key === k)) setSelectedDate(k);
  };

  const heroLabel = dateMeta.offset === 0 ? 'today'
    : dateMeta.offset === 1 ? 'tomorrow'
      : dateMeta.offset === -1 ? 'yesterday'
        : `${dateMeta.dayName} ${dateMeta.dayNum}`;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-shrink-0">
        <div className="pt-2 px-5">
          <div className="text-c-text2 text-2xs font-bold tracking-[0.6px] uppercase">
            Overview
          </div>
          <div className="text-c-text1 text-3xl font-bold mt-1 tracking-tight">
            Morning, Alex
          </div>
        </div>
        <DateStrip selected={selectedDate} onSelect={setSelectedDate} />
      </div>

      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
      >
        <div className="px-5">
          <DayPointsCard dayInfo={dayInfo} dateMeta={dateMeta} />
        </div>

        {dayInfo.items.length > 0 && (
          <div className="px-5 pt-3">
            <CategoryBreakdown dayInfo={dayInfo} />
          </div>
        )}

        {dayInfo.items.length === 0 && !dayInfo.isFuture && (
          <div className="px-5 pt-3">
            <Card pad={20} className="text-center">
              <Icon name="sparkle" size={22} color="var(--text-tertiary)" style={{ display: 'inline-block' }} />
              <div className="text-c-text1 text-sm font-semibold mt-2">
                No points earned {heroLabel}
              </div>
              <div className="text-c-text2 text-xs mt-[3px]">
                Complete tasks to earn points automatically.
              </div>
            </Card>
          </div>
        )}

        <div className="px-5 pt-6 pb-[10px]">
          <h3 className="text-c-text1 text-lg font-bold m-0">Weekly progress</h3>
        </div>
        <div className="px-5">
          <Card pad={18}>
            <div className="flex items-center justify-between gap-3">
              <button
                onClick={() => setWeekOffset(w => w - 1)}
                aria-label="Previous week"
                className="w-8 h-8 rounded-pill bg-c-bg border border-c-border grid place-items-center cursor-pointer p-0"
              >
                <Icon name="chevron-right" size={16} color="var(--text-primary)" style={{ transform: 'rotate(180deg)' }} />
              </button>
              <div className="text-center flex-1 min-w-0">
                <div className="text-c-text2 text-2xs font-bold tracking-label uppercase">
                  {weekOffset === 0 ? 'This week' : weekOffset === -1 ? 'Last week' : `${-weekOffset} weeks ago`}
                </div>
                <div className="text-c-text1 text-md font-bold mt-0.5">
                  {weekRange}
                </div>
              </div>
              <button
                onClick={() => setWeekOffset(w => Math.min(0, w + 1))}
                disabled={!canForward}
                aria-label="Next week"
                className="w-8 h-8 rounded-pill bg-c-bg border border-c-border grid place-items-center p-0"
                style={{ cursor: canForward ? 'pointer' : 'not-allowed', opacity: canForward ? 1 : 0.35 }}
              >
                <Icon name="chevron-right" size={16} color="var(--text-primary)" />
              </button>
            </div>

            <div className="mt-[18px]">
              <WeekChart weekDays={weekDays} selectedKey={selectedDate} onSelectDay={handleSelectDay} />
            </div>

            <div className="grid grid-cols-4 gap-[10px] mt-4 pt-4 border-t border-c-border">
              {[
                { l: 'Total',    v: weekTotal,                          c: 'var(--text-primary)' },
                { l: 'Avg/day',  v: dailyAvg,                           c: 'var(--text-primary)' },
                { l: 'Goals hit',v: `${daysHitGoal}/${realDays.length || 7}`, c: daysHitGoal > 0 ? 'var(--success)' : 'var(--text-primary)' },
                { l: 'vs last',  v: `${delta >= 0 ? '+' : ''}${delta}`, c: delta >= 0 ? 'var(--success)' : '#FF6B7A' },
              ].map((s, i) => (
                <div key={i}>
                  <div className="text-c-text2 text-3xs font-bold tracking-label uppercase">{s.l}</div>
                  <div
                    className="text-lg font-bold mt-1 tabular-nums"
                    style={{ color: s.c }}
                  >
                    {s.v}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {dayInfo.items.length > 0 && (
          <>
            <div className="flex justify-between items-center px-5 pt-6 pb-[10px]">
              <h3 className="text-c-text1 text-lg font-bold m-0">
                Tasks {heroLabel}
              </h3>
              <span className="text-c-text3 text-xs font-semibold">
                {dayInfo.items.length} task{dayInfo.items.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="px-5">
              <EarnedTasksList items={dayInfo.items} />
            </div>
          </>
        )}
        <div className="h-[140px] shrink-0" />
      </div>
    </div>
  );
};

export default Analytics;
