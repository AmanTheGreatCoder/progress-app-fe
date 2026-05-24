import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../components/ui/Card';
import { DateStrip, STRIP_DAYS } from '../components/ui/DateStrip';
import { TODAY } from '../components/ui/GoalRow';
import { Icon } from '../components/ui/Icon';
import { ProgressBar } from '../components/ui/ProgressBar';
import { useAppContext } from '../context/AppContext';
import { DAY_NAMES, MONTH_NAMES, addDays, getLocalYMD, todayDate } from '../utils/dateUtils';

const T = {
  bg: 'var(--bg, #0F0F14)',
  surface: 'var(--surface, #1C1C27)',
  surface2: 'var(--surface2, #23232F)',
  primary: 'var(--primary, #7C6AF7)',
  secondary: 'var(--secondary, #4ECDC4)',
  success: 'var(--success, #44D9A2)',
  warning: '#FFB347',
  textPrimary: 'var(--text-primary, #F0F0F5)',
  textSecondary: 'var(--text-secondary, #8A8A9E)',
  textTertiary: 'var(--text-tertiary, #5A5A6E)',
  border: 'var(--border, #2A2A3C)',
  cat: {
    Health: '#44D9A2',
    Career: '#7C6AF7',
    Finance: '#FFB347',
    Learning: '#4ECDC4',
    Wellness: '#F472B6',
    Routine: '#a78bfa',
    Work: '#fb923c',
    Personal: '#fb7185',
    Other: '#9ca3af'
  } as Record<string, string>,
};

const POINTS_TARGET = 250;

const fmtKey = (d: Date) => getLocalYMD(d);

const dueToKey = (due: string) => {
  if (due === 'Today') { return STRIP_DAYS.find(d => d.offset === 0)?.key; }
  if (due === 'Tomorrow') { return STRIP_DAYS.find(d => d.offset === 1)?.key; }
  const idx = DAY_NAMES.findIndex(n => n === due);
  if (idx < 0) return due; // Might already be a date string like YYYY-MM-DD
  const t = todayDate();
  for (let i = 1; i <= 7; i++) {
    const d = addDays(t, i);
    if (d.getDay() === idx) return fmtKey(d);
  }
  return null;
};

// ──────────────────────────────────────────────────────────────
// Subcomponents
// ──────────────────────────────────────────────────────────────

// DateStrip is imported from components/ui/DateStrip

const PointsRing = ({ pct, size = 104, stroke = 9, color, bg, children }: any) => {
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
          stroke={bg || T.surface2} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color || T.primary} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 1100ms cubic-bezier(.2,.8,.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
        {children}
      </div>
    </div>
  );
};

const DayPointsCard = ({ dayInfo, dateMeta }: any) => {
  const target = POINTS_TARGET;
  const pct = Math.min(100, (dayInfo.total / target) * 100);
  const heading = dateMeta.offset === 0 ? 'Today'
    : dateMeta.offset === 1 ? 'Tomorrow'
      : dateMeta.offset === -1 ? 'Yesterday'
        : `${dateMeta.dayName} ${dateMeta.dayNum}`;
  const reached = dayInfo.total >= target;
  const accent = reached ? T.success : T.primary;
  return (
    <Card pad={20} style={{
      background: `linear-gradient(135deg, ${T.surface} 0%, #20203a 100%)`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ color: T.textSecondary, fontSize: 11, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
            {heading} · Points
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 8 }}>
            <span style={{ fontSize: 52, fontWeight: 800, color: T.textPrimary, letterSpacing: -2, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{dayInfo.total}</span>
            <span style={{ color: T.textSecondary, fontSize: 14 }}>/ {target}</span>
          </div>
          <div style={{ marginTop: 14, maxWidth: 180 }}>
            <ProgressBar value={pct} color={accent} bg={'var(--bg)'} height={5} />
          </div>
          <div style={{ color: T.textSecondary, fontSize: 12, marginTop: 8 }}>
            {dayInfo.isFuture ? "Hasn't happened yet"
              : reached ? 'Daily goal reached'
                : `${target - dayInfo.total} pts to daily goal`}
          </div>
        </div>
        <PointsRing pct={pct} color={accent}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: T.textPrimary, fontSize: 19, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>{Math.round(pct)}<span style={{ fontSize: 12, color: T.textSecondary }}>%</span></div>
            <div style={{ color: T.textTertiary, fontSize: 9.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase', marginTop: 3 }}>of goal</div>
          </div>
        </PointsRing>
      </div>
    </Card>
  );
};

const CategoryBreakdown = ({ dayInfo }: any) => {
  const byCat: Record<string, number> = {};
  dayInfo.items.forEach((it: any) => { byCat[it.category] = (byCat[it.category] || 0) + it.points; });
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1]);
  if (cats.length === 0) return null;
  const total = cats.reduce((s, [, p]) => s + p, 0);
  return (
    <Card pad={16}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ color: T.textPrimary, fontSize: 11.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase' }}>
          By category
        </span>
        <span style={{ color: T.textTertiary, fontSize: 11.5, fontWeight: 600 }}>{total} pts</span>
      </div>
      <div style={{ display: 'flex', height: 8, borderRadius: 4, overflow: 'hidden', background: T.bg }}>
        {cats.map(([cat, pts]) => (
          <div key={cat} style={{
            width: `${(pts / total) * 100}%`,
            background: T.cat[cat] || T.cat.Other,
            transition: 'width 800ms cubic-bezier(.2,.8,.2,1)',
          }} />
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 18px', marginTop: 14 }}>
        {cats.map(([cat, pts]) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: 4, background: T.cat[cat] || T.cat.Other, flexShrink: 0 }} />
            <span style={{ color: T.textPrimary, fontSize: 12.5, fontWeight: 600, flex: 1 }}>{cat}</span>
            <span style={{ color: T.textSecondary, fontSize: 12, fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{pts}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};

const WeekChart = ({ weekDays, selectedKey, onSelectDay }: any) => {
  const target = POINTS_TARGET;
  const maxPts = Math.max(target * 1.1, ...weekDays.map((d: any) => d.points));
  const targetPct = (target / maxPts) * 100;
  return (
    <div>
      <div style={{ position: 'relative', height: 132, marginBottom: 10, paddingTop: 10 }}>
        {/* dashed goal line */}
        <div style={{
          position: 'absolute', left: 0, right: 0,
          bottom: `calc(${targetPct}% - 1px)`,
          borderTop: `1px dashed ${T.textTertiary}`,
          opacity: 0.6,
        }} />
        <span style={{
          position: 'absolute', right: 0, top: 0,
          color: T.textTertiary, fontSize: 9.5, fontWeight: 700,
          letterSpacing: 0.5, textTransform: 'uppercase',
        }}>Goal {target}</span>
        {/* bars */}
        <div style={{
          position: 'absolute', left: 0, right: 0, top: 10, bottom: 0,
          display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8,
          alignItems: 'end',
        }}>
          {weekDays.map((d: any) => {
            const isSelected = d.key === selectedKey;
            const reached = d.points >= target;
            const h = d.isFuture ? 3 : Math.max(3, (d.points / maxPts) * 100);
            const color = d.isFuture ? T.surface2
              : reached ? T.success
                : T.primary;
            return (
              <button key={d.key} onClick={() => onSelectDay(d.key)} style={{
                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                position: 'relative',
              }}>
                {/* hover value */}
                {isSelected && !d.isFuture && (
                  <span style={{
                    position: 'absolute', bottom: `calc(${h}% + 6px)`,
                    left: '50%', transform: 'translateX(-50%)',
                    fontSize: 10.5, fontWeight: 700, color: T.textPrimary,
                    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
                  }}>{d.points}</span>
                )}
                <div style={{
                  height: `${h}%`,
                  background: color,
                  borderRadius: 6,
                  opacity: d.isFuture ? 0.5 : (isSelected ? 1 : 0.55),
                  outline: d.isToday && !isSelected ? `1.5px solid ${T.textSecondary}` : 'none',
                  outlineOffset: -1.5,
                  transition: 'opacity 200ms, height 800ms cubic-bezier(.2,.8,.2,1)',
                  width: '100%',
                }} />
              </button>
            );
          })}
        </div>
      </div>
      {/* day labels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8 }}>
        {weekDays.map((d: any) => {
          const isSelected = d.key === selectedKey;
          return (
            <div key={d.key} style={{ textAlign: 'center' }}>
              <div style={{
                color: isSelected ? T.textPrimary : (d.isToday ? T.textSecondary : T.textTertiary),
                fontSize: 10.5, fontWeight: 700, letterSpacing: 0.5, textTransform: 'uppercase',
              }}>{d.dayName[0]}</div>
              <div style={{
                color: isSelected ? T.textPrimary : T.textTertiary,
                fontSize: 10.5, fontWeight: 600, marginTop: 2, fontVariantNumeric: 'tabular-nums',
              }}>{d.dayNum}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const EarnedTasksList = ({ items, goals }: any) => {
  if (items.length === 0) return null;
  return (
    <Card pad={0} style={{ overflow: 'hidden' }}>
      {items.map((it: any, i: number) => {
        const g = goals.find((g: any) => g.id === it.goalId);
        const cat = T.cat[it.category] || T.textSecondary;
        return (
          <div key={i} style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '12px 16px',
            borderBottom: i === items.length - 1 ? 'none' : `1px solid ${T.border}`,
          }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `${cat}22`, color: cat,
              display: 'grid', placeItems: 'center',
              fontSize: 16, flexShrink: 0,
            }}>{g?.icon || '◆'}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                color: T.textPrimary, fontSize: 14, fontWeight: 600,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{it.title}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
                <span style={{ width: 5, height: 5, borderRadius: 3, background: cat }} />
                <span style={{ color: T.textSecondary, fontSize: 11.5 }}>{it.category}</span>
                <span style={{ color: T.textTertiary, fontSize: 11.5 }}>·</span>
                <span style={{ color: T.textSecondary, fontSize: 11.5 }}>{it.source}</span>
              </div>
            </div>
            <div style={{
              fontSize: 12.5, fontWeight: 700,
              color: T.textPrimary,
              padding: '5px 10px', borderRadius: 999,
              background: `${cat}1f`,
              border: `1px solid ${cat}33`,
              fontVariantNumeric: 'tabular-nums',
              flexShrink: 0,
            }}>+{it.points}</div>
          </div>
        );
      })}
    </Card>
  );
};

// ──────────────────────────────────────────────────────────────
// OVERVIEW SCREEN (Replaces Analytics)
// ──────────────────────────────────────────────────────────────
const Analytics: React.FC = () => {
  const { tasks, goals } = useAppContext();
  const todayKey = STRIP_DAYS.find(d => d.offset === 0)?.key || TODAY;
  const [selectedDate, setSelectedDate] = useState(todayKey);
  const [weekOffset, setWeekOffset] = useState(0);

  const dateMeta = STRIP_DAYS.find(d => d.key === selectedDate) || STRIP_DAYS[3];

  const getDayPoints = (dateKey: string) => {
    const d = new Date(dateKey + 'T00:00:00');
    if (d > todayDate()) return { total: 0, items: [], isFuture: true };

    const items = tasks.filter(t => {
      const k = dueToKey(t.due) || t.due;
      return k === dateKey && t.done;
    }).map(t => {
      // Determine category
      const g = goals.find(goal => goal.id === t.goalId);
      let cat = g ? g.category : 'Other';
      const cats = ['Health', 'Career', 'Learning', 'Wellness', 'Finance', 'Routine', 'Work', 'Personal'];
      for (const c of cats) {
        if (t.tags.map(tag => tag.toLowerCase()).includes(c.toLowerCase())) {
          cat = c;
          break;
        }
      }
      return {
        title: t.title,
        goalId: t.goalId,
        category: cat,
        source: t.source || 'TickTick',
        points: t.points || 0
      };
    });

    return { total: items.reduce((s, x) => s + x.points, 0), items, isFuture: false };
  };

  const dayInfo = getDayPoints(selectedDate);

  const tDate = todayDate();
  const dow = tDate.getDay();
  const daysToMonday = (dow + 6) % 7;
  const currentMonday = addDays(tDate, -daysToMonday);
  const startMonday = addDays(currentMonday, weekOffset * 7);

  const weekDays = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = addDays(startMonday, i);
      const k = fmtKey(d);
      const isFuture = d > tDate;
      const info = isFuture ? { total: 0, items: [], isFuture: true } : getDayPoints(k);
      arr.push({
        key: k,
        dayName: DAY_NAMES[d.getDay()],
        dayNum: d.getDate(),
        points: info.total,
        isFuture,
        isToday: k === TODAY,
      });
    }
    return arr;
  }, [weekOffset, tasks, goals]);

  const endDay = addDays(startMonday, 6);
  const sameMonth = startMonday.getMonth() === endDay.getMonth();
  const weekRange = sameMonth
    ? `${MONTH_NAMES[startMonday.getMonth()]} ${startMonday.getDate()} – ${endDay.getDate()}`
    : `${MONTH_NAMES[startMonday.getMonth()]} ${startMonday.getDate()} – ${MONTH_NAMES[endDay.getMonth()]} ${endDay.getDate()}`;

  const realDays = weekDays.filter(d => !d.isFuture);
  const weekTotal = realDays.reduce((s, d) => s + d.points, 0);
  const dailyAvg = realDays.length > 0 ? Math.round(weekTotal / realDays.length) : 0;
  const daysHitGoal = realDays.filter(d => d.points >= POINTS_TARGET).length;

  const prevWeekTotal = useMemo(() => {
    const prevStart = addDays(startMonday, -7);
    let s = 0;
    for (let i = 0; i < 7; i++) {
      const d = addDays(prevStart, i);
      if (d > tDate) continue;
      s += getDayPoints(fmtKey(d)).total;
    }
    return s;
  }, [weekOffset, tasks, goals]);

  const delta = weekTotal - prevWeekTotal;
  const canForward = weekOffset < 0;

  const handleSelectDay = (k: string) => {
    const inStrip = STRIP_DAYS.find(d => d.key === k);
    if (inStrip) setSelectedDate(k);
  };

  const heroLabel = dateMeta.offset === 0 ? 'today'
    : dateMeta.offset === 1 ? 'tomorrow'
      : dateMeta.offset === -1 ? 'yesterday'
        : `${dateMeta.dayName} ${dateMeta.dayNum}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ flexShrink: 0 }}>
        {/* Header */}
        <div style={{ padding: '8px 20px 0px' }}>
          <div style={{ color: T.textSecondary, fontSize: 11.5, letterSpacing: 0.6, textTransform: 'uppercase', fontWeight: 700 }}>
            Overview
          </div>
          <div style={{ color: T.textPrimary, fontSize: 28, fontWeight: 700, marginTop: 4, letterSpacing: -0.4 }}>
            Morning, Alex
          </div>
        </div>

        <DateStrip selected={selectedDate} onSelect={setSelectedDate} />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        <div style={{ padding: '0px 20px 0' }}>
          <DayPointsCard dayInfo={dayInfo} dateMeta={dateMeta} />
        </div>

        {dayInfo.items.length > 0 && (
          <div style={{ padding: '12px 20px 0' }}>
            <CategoryBreakdown dayInfo={dayInfo} />
          </div>
        )}

        {dayInfo.items.length === 0 && !dayInfo.isFuture && (
          <div style={{ padding: '12px 20px 0' }}>
            <Card pad={20} style={{ textAlign: 'center' }}>
              <Icon name="sparkle" size={22} color={T.textTertiary} style={{ display: 'inline-block' }} />
              <div style={{ color: T.textPrimary, fontSize: 13.5, fontWeight: 600, marginTop: 8 }}>
                No points earned {heroLabel}
              </div>
              <div style={{ color: T.textSecondary, fontSize: 12, marginTop: 3 }}>
                Complete tasks to earn points automatically.
              </div>
            </Card>
          </div>
        )}

        <div style={{ padding: '24px 20px 10px' }}>
          <h3 style={{ color: T.textPrimary, fontSize: 16, fontWeight: 700, margin: 0 }}>Weekly progress</h3>
        </div>
        <div style={{ padding: '0 20px' }}>
          <Card pad={18}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
              <button onClick={() => setWeekOffset(w => w - 1)} style={{
                width: 32, height: 32, borderRadius: 999,
                background: T.bg, border: `1px solid ${T.border}`,
                display: 'grid', placeItems: 'center', cursor: 'pointer', padding: 0,
              }}>
                <Icon name="chevron-right" size={16} color={T.textPrimary} style={{ transform: 'rotate(180deg)' }} />
              </button>
              <div style={{ textAlign: 'center', flex: 1, minWidth: 0 }}>
                <div style={{ color: T.textSecondary, fontSize: 10.5, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>
                  {weekOffset === 0 ? 'This week' : weekOffset === -1 ? 'Last week' : `${-weekOffset} weeks ago`}
                </div>
                <div style={{ color: T.textPrimary, fontSize: 15, fontWeight: 700, marginTop: 2 }}>
                  {weekRange}
                </div>
              </div>
              <button onClick={() => setWeekOffset(w => Math.min(0, w + 1))} disabled={!canForward} style={{
                width: 32, height: 32, borderRadius: 999,
                background: T.bg, border: `1px solid ${T.border}`,
                display: 'grid', placeItems: 'center', padding: 0,
                cursor: canForward ? 'pointer' : 'not-allowed',
                opacity: canForward ? 1 : 0.35,
              }}>
                <Icon name="chevron-right" size={16} color={T.textPrimary} />
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <WeekChart weekDays={weekDays} selectedKey={selectedDate} onSelectDay={handleSelectDay} />
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10,
              marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.border}`,
            }}>
              {[
                { l: 'Total', v: weekTotal, c: T.textPrimary },
                { l: 'Avg/day', v: dailyAvg, c: T.textPrimary },
                { l: 'Goals hit', v: `${daysHitGoal}/${realDays.length || 7}`, c: daysHitGoal > 0 ? T.success : T.textPrimary },
                { l: 'vs last', v: `${delta >= 0 ? '+' : ''}${delta}`, c: delta >= 0 ? T.success : '#FF6B7A' },
              ].map((s, i) => (
                <div key={i}>
                  <div style={{ color: T.textSecondary, fontSize: 9.5, letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 700 }}>{s.l}</div>
                  <div style={{ color: s.c, fontSize: 16, fontWeight: 700, marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{s.v}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {dayInfo.items.length > 0 && (
          <>
            <div style={{
              padding: '24px 20px 10px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <h3 style={{ color: T.textPrimary, fontSize: 16, fontWeight: 700, margin: 0 }}>
                Earned {heroLabel}
              </h3>
              <span style={{ color: T.textTertiary, fontSize: 12, fontWeight: 600 }}>
                {dayInfo.items.length} task{dayInfo.items.length === 1 ? '' : 's'}
              </span>
            </div>
            <div style={{ padding: '0 20px' }}>
              <EarnedTasksList items={dayInfo.items} goals={goals} />
            </div>
          </>
        )}
        <div style={{ height: 140, flexShrink: 0 }} />
      </div>
    </div>
  );
};

export default Analytics;
