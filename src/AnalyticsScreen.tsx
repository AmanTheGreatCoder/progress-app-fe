import React from 'react';
import {
  ChevronDown, ChevronUp,
  ChevronLeft, ChevronRight,
  Flame, Trophy, CheckCircle2, TrendingUp, Zap,
} from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { api } from '@/api';
import { BottomNav } from '@/shared/components/layout/BottomNav';

// ─── Constants ───────────────────────────────────────────
const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
const TARGET_POINTS = 120;

const TAG_COLORS: Record<string, { bg: string; text: string }> = {
  work:      { bg: 'bg-blue-500/10',   text: 'text-blue-600 dark:text-blue-400' },
  health:    { bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  personal:  { bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  challenge: { bg: 'bg-orange-500/10', text: 'text-orange-600 dark:text-orange-400' },
  hard:      { bg: 'bg-red-500/10',    text: 'text-red-600 dark:text-red-400' },
  medium:    { bg: 'bg-amber-500/10',  text: 'text-amber-600 dark:text-amber-400' },
  easy:      { bg: 'bg-secondary',     text: 'text-muted-foreground' },
};

// ─── Helpers ─────────────────────────────────────────────
function getWeekDates(offset: number): string[] {
  const today = new Date();
  const dow = (today.getDay() + 6) % 7; // Mon = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - dow + offset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split('T')[0];
  });
}

function formatWeekLabel(dates: string[]): string {
  const s = new Date(dates[0] + 'T00:00:00');
  const e = new Date(dates[6] + 'T00:00:00');
  const mo = (d: Date) => d.toLocaleDateString('en-US', { month: 'short' });
  if (s.getMonth() === e.getMonth()) {
    return `${mo(s)} ${s.getDate()} – ${e.getDate()}`;
  }
  return `${mo(s)} ${s.getDate()} – ${mo(e)} ${e.getDate()}`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function normTags(raw: unknown): string[] {
  return Array.isArray(raw) ? raw : (raw ? String(raw).split(',').filter(Boolean) : []);
}

// ─── Main Screen ─────────────────────────────────────────
export default function AnalyticsScreen() {
  const [weekOffset, setWeekOffset]   = useState(0);
  const [dailyScores, setDailyScores] = useState<Record<string, number>>({});
  const [streak, setStreak]           = useState(0);
  const [weekTasks, setWeekTasks]     = useState<any[]>([]);
  const [expandedDay, setExpandedDay] = useState<string | null>(null);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [activeBar, setActiveBar]     = useState<number | null>(null);

  const today      = useMemo(() => new Date().toISOString().split('T')[0], []);
  const weekDates  = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const weekStart  = weekDates[0];
  const weekEnd    = weekDates[6];
  const isThisWeek = weekOffset === 0;

  // Fetch dashboard once (for dailyScores + streak)
  useEffect(() => {
    api.get('/dashboard')
      .then(res => {
        setDailyScores(res.data.dailyScores ?? {});
        setStreak(res.data.streak ?? 0);
      })
      .catch(console.error);
  }, []);

  // Fetch tasks whenever the selected week changes
  const fetchWeekTasks = useCallback(() => {
    setLoadingTasks(true);
    api.get(`/tasks?from=${weekStart}&to=${weekEnd}`)
      .then(res => {
        setWeekTasks(res.data ?? []);
        // Auto-expand today if it's in the current week
        if (isThisWeek) setExpandedDay(today);
        else setExpandedDay(null);
      })
      .catch(console.error)
      .finally(() => setLoadingTasks(false));
  }, [weekStart, weekEnd, isThisWeek, today]);

  useEffect(() => { fetchWeekTasks(); }, [fetchWeekTasks]);

  // ── Derived data ─────────────────────────────────────

  const barData = weekDates.map((date, i) => ({
    date,
    label:    DAY_LABELS[i],
    pts:      dailyScores[date] ?? 0,
    isToday:  date === today,
    isFuture: date > today,
  }));

  const maxPts = Math.max(...barData.map(d => d.pts), 1);

  const completedTasks   = weekTasks.filter(t => t.completed || t.completedMin);
  const totalWeekPts     = weekDates.reduce((s, d) => s + (dailyScores[d] ?? 0), 0);
  const completionRate   = weekTasks.length > 0
    ? Math.round((completedTasks.length / weekTasks.length) * 100)
    : 0;
  const bestDayEntry     = barData.reduce((b, d) => d.pts > b.pts ? d : b, barData[0]);
  const bestDayStr       = bestDayEntry.pts > 0
    ? new Date(bestDayEntry.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })
    : '—';

  // Group completed tasks by date for the daily log
  const completedByDate: Record<string, any[]> = {};
  for (const t of completedTasks) {
    (completedByDate[t.date] ??= []).push(t);
  }
  const activeDays = weekDates
    .filter(d => (completedByDate[d]?.length ?? 0) > 0)
    .sort((a, b) => b.localeCompare(a));

  // ── Render ────────────────────────────────────────────

  return (
    <div className="app-container bg-background text-foreground h-[100dvh] w-full overflow-hidden flex flex-col">

      {/* ── Header ── */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-6 pb-3 px-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-[24px] font-[700] tracking-[-0.4px]">Analytics</h1>
          {streak > 0 && (
            <div className="flex items-center gap-1 text-orange-500 text-[13px] font-[600] bg-orange-500/10 px-2.5 py-1 rounded-full">
              <Flame size={13} /> {streak}d streak
            </div>
          )}
        </div>

        {/* Week navigator */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => { setWeekOffset(o => o - 1); setActiveBar(null); }}
            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-secondary transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-[14px] font-[600]">
            {isThisWeek ? 'This Week' : formatWeekLabel(weekDates)}
          </span>
          <button
            onClick={() => { setWeekOffset(o => Math.min(o + 1, 0)); setActiveBar(null); }}
            disabled={isThisWeek}
            className="w-8 h-8 flex items-center justify-center rounded-full active:bg-secondary transition-colors disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── Scrollable body ── */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden pb-28 pt-5">

        {/* Bar Chart */}
        <div className="px-4 mb-5">
          <div className="bg-card border border-border rounded-[16px] px-4 pt-4 pb-3 shadow-sm">
            <div className="flex items-end justify-between gap-1 mb-3" style={{ height: 96 }}>
              {barData.map((d, i) => {
                const heightPct  = (d.pts / maxPts) * 100;
                const hitTarget  = d.pts >= TARGET_POINTS;
                const isSelected = activeBar === i;

                let barColor = 'bg-primary/30 dark:bg-primary/20';
                if (d.isFuture)           barColor = 'bg-border';
                else if (hitTarget)       barColor = 'bg-emerald-500';
                else if (isSelected)      barColor = 'bg-primary/70';
                else if (d.isToday && isThisWeek) barColor = 'bg-primary';

                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center justify-end gap-1 cursor-pointer"
                    onClick={() => setActiveBar(isSelected ? null : i)}
                  >
                    {/* Tooltip above bar */}
                    <div className={`text-[10px] font-[700] text-foreground transition-opacity ${isSelected && d.pts > 0 ? 'opacity-100' : 'opacity-0'}`}>
                      {d.pts}
                    </div>
                    <div className="w-full flex items-end" style={{ height: 72 }}>
                      <div
                        className={`w-full rounded-t-[4px] transition-all duration-500 ${barColor}`}
                        style={{ height: d.pts > 0 ? `${Math.max(heightPct, 6)}%` : '2px' }}
                      />
                    </div>
                    <span className={`text-[11px] leading-none ${
                      d.isToday && isThisWeek
                        ? 'font-[700] text-foreground'
                        : 'font-[500] text-muted-foreground'
                    }`}>
                      {d.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-1.5 pt-1 border-t border-border/50">
              <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 flex-shrink-0" />
              <span className="text-[11px] text-muted-foreground">≥ {TARGET_POINTS} pts = daily target hit</span>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        <div className="px-4 mb-5">
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              icon={<Trophy size={13} />}
              label="Total Points"
              value={totalWeekPts.toString()}
              sub="this week"
            />
            <StatCard
              icon={<CheckCircle2 size={13} />}
              label="Tasks Done"
              value={completedTasks.length.toString()}
              sub={`of ${weekTasks.length} total`}
            />
            <StatCard
              icon={<Zap size={13} />}
              label="Best Day"
              value={bestDayStr}
              sub={bestDayEntry.pts > 0 ? `${bestDayEntry.pts} pts` : 'No activity yet'}
            />
            <StatCard
              icon={<TrendingUp size={13} />}
              label="Completion"
              value={`${completionRate}%`}
              sub="tasks completed"
              highlight={completionRate >= 80}
            />
          </div>
        </div>

        {/* Daily Log */}
        <div className="px-4 mb-4">
          <h2 className="text-[17px] font-[700] tracking-[-0.4px] mb-3">Daily Log</h2>

          {loadingTasks ? (
            <div className="bg-card border border-border rounded-[12px] p-5 text-center">
              <p className="text-[14px] text-muted-foreground">Loading…</p>
            </div>
          ) : activeDays.length === 0 ? (
            <div className="bg-card border border-border rounded-[12px] p-5 text-center">
              <p className="text-[14px] text-muted-foreground font-[500]">No completed tasks this week.</p>
              <p className="text-[12px] text-muted-foreground mt-1">Complete some tasks to see them here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {activeDays.map(date => {
                const tasks   = completedByDate[date] ?? [];
                const dayPts  = dailyScores[date] ?? 0;
                const isOpen  = expandedDay === date;

                return (
                  <div key={date} className="bg-card border border-border rounded-[12px] overflow-hidden shadow-sm">
                    <button
                      onClick={() => setExpandedDay(isOpen ? null : date)}
                      className="w-full flex items-center justify-between px-4 py-3 active:bg-secondary/50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-[14px] font-[600] text-foreground">{formatDate(date)}</span>
                        <span className="text-[11px] font-[600] px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                          {tasks.length} task{tasks.length !== 1 ? 's' : ''} · {dayPts} pts
                        </span>
                      </div>
                      {isOpen
                        ? <ChevronUp size={16} className="text-muted-foreground flex-shrink-0" />
                        : <ChevronDown size={16} className="text-muted-foreground flex-shrink-0" />}
                    </button>

                    {isOpen && (
                      <div className="border-t border-border">
                        {tasks.map((t: any, i: number) => {
                          const tags = normTags(t.tags);
                          return (
                            <div
                              key={t.id}
                              className={`px-4 py-3 flex items-start justify-between gap-3 ${i !== 0 ? 'border-t border-border/40' : ''}`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="text-[14px] font-[500] text-foreground leading-snug">{t.name}</p>
                                {tags.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-1.5">
                                    {tags.slice(0, 4).map(tag => {
                                      const c = TAG_COLORS[tag.toLowerCase()] ?? { bg: 'bg-secondary', text: 'text-muted-foreground' };
                                      return (
                                        <span key={tag} className={`text-[10px] font-[600] px-1.5 py-0.5 rounded-[4px] ${c.bg} ${c.text}`}>
                                          #{tag}
                                        </span>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                              <span className="text-[12px] font-[700] text-emerald-600 dark:text-emerald-400 flex-shrink-0">
                                +{t.points ?? 0}pts
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <BottomNav />
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────
function StatCard({
  icon, label, value, sub, highlight = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-card border border-border rounded-[12px] p-4 shadow-sm flex flex-col gap-1">
      <div className="flex items-center gap-1.5 text-muted-foreground text-[12px] font-[500]">
        {icon} {label}
      </div>
      <div className={`text-[26px] font-[700] tracking-[-0.5px] leading-none mt-1 ${highlight ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'}`}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
