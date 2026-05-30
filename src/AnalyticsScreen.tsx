import {
  ChevronDown, ChevronUp,
  Clock,
  Flame,
  Trophy
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { api } from '@/api';
import { BottomNav } from '@/shared/components/layout/BottomNav';

// --- Types ---
type TimeRange = 'This Week' | 'Last Week' | 'This Month';
type Category = 'Health' | 'Career' | 'Learning' | 'Wellness' | 'Finance';
type DayData = { day: string; points: number; tasks: number; isToday?: boolean; isFuture?: boolean };

// --- Mock Data ---
const CATEGORY_COLORS: Record<Category, string> = {
  Health: 'bg-emerald-500',
  Career: 'bg-blue-500',
  Learning: 'bg-purple-500',
  Wellness: 'bg-pink-500',
  Finance: 'bg-amber-500'
};

const CATEGORY_TEXT: Record<Category, string> = {
  Health: 'text-emerald-600 dark:text-emerald-400',
  Career: 'text-blue-600 dark:text-blue-400',
  Learning: 'text-purple-600 dark:text-purple-400',
  Wellness: 'text-pink-600 dark:text-pink-400',
  Finance: 'text-amber-600 dark:text-amber-400'
};

const CATEGORY_BG: Record<Category, string> = {
  Health: 'bg-emerald-500/10',
  Career: 'bg-blue-500/10',
  Learning: 'bg-purple-500/10',
  Wellness: 'bg-pink-500/10',
  Finance: 'bg-amber-500/10'
};

// "Last Week" mock
const LAST_WEEK_DATA: DayData[] = [
  { day: 'M', points: 70, tasks: 10 },
  { day: 'T', points: 95, tasks: 12 },
  { day: 'W', points: 88, tasks: 11 },
  { day: 'T', points: 105, tasks: 15 },
  { day: 'F', points: 115, tasks: 16 },
  { day: 'S', points: 60, tasks: 8 },
  { day: 'S', points: 50, tasks: 6 }
];

const ACCOMPLISHMENTS = [
  {
    dateStr: 'Today',
    totalPoints: 95,
    isExpanded: true,
    tasks: [
      { id: '1', name: 'Deep work: feature spec', goal: 'Career', time: '14:30', pts: 40 },
      { id: '2', name: '30 min run', goal: 'Health', time: '07:00', pts: 30 },
      { id: '3', name: 'Read chapter 5', goal: 'Learning', time: '06:15', pts: 25 }
    ]
  },
  {
    dateStr: 'Yesterday',
    totalPoints: 80,
    isExpanded: false,
    tasks: [
      { id: '4', name: 'Log expenses', goal: 'Finance', time: '19:00', pts: 20 },
      { id: '5', name: 'Morning Run', goal: 'Health', time: '07:30', pts: 30 },
      { id: '6', name: 'Weekly review', goal: 'Career', time: '10:00', pts: 30 }
    ]
  }
];

export default function AnalyticsScreen() {
  const [timeRange, setTimeRange] = useState<TimeRange>('This Week');
  const [activeTooltip, setActiveTooltip] = useState<{ x: number; y: number; points: number; tasks: number } | null>(null);
  const [expandedLogs, setExpandedLogs] = useState<Record<string, boolean>>({ Today: true });
  const [filteredCategory, setFilteredCategory] = useState<Category | null>(null);
  const [animateBars, setAnimateBars] = useState(false);
  const [dashboard, setDashboard] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard').then(res => setDashboard(res.data)).catch(console.error);
    const t = setTimeout(() => setAnimateBars(true), 100);
    return () => clearTimeout(t);
  }, [timeRange]);

  const chartData = timeRange === 'This Week' ? (dashboard?.sortedDays?.map((d: any) => ({ day: d[0].slice(-5), points: d[1], tasks: d[2] })) || []) : LAST_WEEK_DATA;
  const CATEGORY_BREAKDOWN = Object.entries(dashboard?.tagBreakdown || {}).map(([name, value]) => ({ name: name as Category, mins: value as number, label: `${Math.floor((value as number) / 60)}h ${(value as number) % 60}m` }));
  const SUMMARY_STATS = {
    completionRate: dashboard?.completionPct || 0,
    activeStreaks: dashboard?.streak || 0,
    totalLogged: dashboard?.totalView || 0,
    perfectDays: dashboard?.highDone || 0
  };

  const toggleLog = (dateStr: string) => {
    setExpandedLogs(prev => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  const targetPoints = 120;

  return (
    <div className="app-container bg-secondary/30 text-foreground h-[100dvh] w-full overflow-hidden flex flex-col" onClick={() => setActiveTooltip(null)}>

      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-6 pb-4 px-4 border-b border-border shadow-sm flex flex-col gap-4">
        <h1 className="text-[24px] font-[700] tracking-[-0.4px]">Analytics</h1>

        <div className="flex p-1 bg-secondary rounded-[8px]">
          {(['This Week', 'Last Week', 'This Month'] as TimeRange[]).map(r => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`flex-1 py-1.5 rounded-[6px] text-[13px] font-[600] transition-colors ${timeRange === r ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="scroll-area flex-1 overflow-y-auto overflow-x-hidden pt-6 pb-32">

        <div className="px-4 mb-8 relative">
          <div className="flex justify-between items-center bg-card border border-border shadow-sm rounded-[16px] p-5">
            {chartData.map((d: any, i: number) => {
              const radius = 15;
              const strokeWidth = 3;
              const circumference = 2 * Math.PI * radius;
              const percent = Math.min(100, Math.max(0, (d.points / targetPoints) * 100));
              const offset = circumference - (percent / 100) * circumference;

              return (
                <div key={i} className="flex flex-col items-center gap-2 relative">
                  <div
                    className="relative flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      const rect = e.currentTarget.getBoundingClientRect();
                      setActiveTooltip({ x: rect.left + rect.width / 2, y: rect.top - 8, points: d.points, tasks: d.tasks });
                    }}
                  >
                    <svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2} className="transform -rotate-90">
                      <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius} fill="transparent" stroke="var(--secondary)" strokeWidth={strokeWidth} />
                      <circle cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius} fill="transparent" stroke="var(--primary)" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    </svg>
                  </div>
                  <span className="text-[12px] font-[600] text-muted-foreground">{d.day}</span>
                </div>
              );
            })}
          </div>

          {activeTooltip && (
            <div
              className="fixed z-50 bg-foreground text-background px-3 py-2 rounded-[8px] text-[12px] font-[500] whitespace-nowrap shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
              style={{ left: activeTooltip.x, top: activeTooltip.y }}
            >
              <div className="font-[700] mb-0.5">{activeTooltip.points} pts</div>
              <div className="opacity-80">{activeTooltip.tasks} tasks completed</div>
              <div className="absolute w-2 h-2 bg-foreground transform rotate-45 left-1/2 -ml-1 -bottom-1" />
            </div>
          )}
        </div>

        <div className="px-4 mb-8">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-card border border-border rounded-[12px] p-4 flex flex-col justify-between shadow-sm">
              <div className="text-muted-foreground text-[13px] font-[500] mb-2 flex items-center gap-1.5">
                <Trophy size={14} /> Active Streaks
              </div>
              <div className="text-[28px] font-[600] text-foreground tracking-[-0.5px]">{SUMMARY_STATS.activeStreaks}</div>
              <div className="flex items-center gap-1.5 text-orange-500 text-[13px] font-[600] mt-1 bg-orange-500/10 px-2 py-0.5 rounded-full w-fit">
                <Flame size={12} /> +2 this week
              </div>
            </div>
            <div className="bg-card border border-border rounded-[12px] p-4 flex flex-col justify-between shadow-sm">
              <div className="text-muted-foreground text-[13px] font-[500] mb-2 flex items-center gap-1.5">
                <Clock size={14} /> Tasks Done
              </div>
              <div className="text-[28px] font-[600] text-foreground tracking-[-0.5px]">{SUMMARY_STATS.totalLogged}</div>
            </div>
          </div>
        </div>

        <div className="px-4 mb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[18px] font-[700] tracking-[-0.4px]">Category Time</h2>
            {filteredCategory && (
              <button
                onClick={() => setFilteredCategory(null)}
                className="text-[12px] font-[600] text-primary bg-primary/10 px-2 py-0.5 rounded-full"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="bg-card border border-border rounded-[16px] p-5 shadow-sm">
            <div className="w-full h-3 rounded-full overflow-hidden flex mb-6 bg-secondary">
              {CATEGORY_BREAKDOWN.map((c) => {
                const totalMins = CATEGORY_BREAKDOWN.reduce((sum, item) => sum + item.mins, 0);
                const pct = (c.mins / totalMins) * 100;
                return (
                  <div
                    key={c.name}
                    className={`h-full ${CATEGORY_COLORS[c.name]} transition-all duration-1000 ease-out`}
                    style={{ width: animateBars ? `${pct}%` : '0%' }}
                  />
                );
              })}
            </div>

            <div className="space-y-4">
              {CATEGORY_BREAKDOWN.map((c, i) => {
                const totalMins = CATEGORY_BREAKDOWN.reduce((sum, item) => sum + item.mins, 0);
                const pct = (c.mins / totalMins) * 100;
                const isFiltered = filteredCategory === c.name;
                const isNeglected = c.name === 'Finance'; // Mock logic

                return (
                  <div
                    key={c.name}
                    onClick={() => setFilteredCategory(isFiltered ? null : c.name)}
                    className={`flex items-center justify-between cursor-pointer transition-opacity ${filteredCategory && !isFiltered ? 'opacity-30' : 'opacity-100'}`}
                  >
                    <div className="flex items-center gap-2 w-[100px]">
                      <div className={`w-2.5 h-2.5 rounded-full ${CATEGORY_COLORS[c.name]}`} />
                      <span className="text-[14px] font-[500] text-foreground">{c.name}</span>
                    </div>

                    <div className="flex-1 px-4 flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-secondary flex-1 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${CATEGORY_COLORS[c.name]} transition-all duration-1000 ease-out delay-${i * 100}`}
                          style={{ width: animateBars ? `${pct}%` : '0%' }}
                        />
                      </div>
                    </div>

                    <div className="w-[60px] text-right">
                      <span className={`text-[13px] font-[600] ${isNeglected ? 'text-destructive' : 'text-foreground'}`}>{c.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="px-4 mb-10">
          <h2 className="text-[18px] font-[700] tracking-[-0.4px] mb-4">Accomplishments</h2>
          <div className="space-y-3">
            {ACCOMPLISHMENTS.map((day) => {
              const isExpanded = expandedLogs[day.dateStr];
              const visibleTasks = day.tasks.filter(t => !filteredCategory || t.goal === filteredCategory);

              if (visibleTasks.length === 0) return null;

              return (
                <div key={day.dateStr} className="bg-card border border-border rounded-[12px] overflow-hidden shadow-sm">
                  <button
                    onClick={() => toggleLog(day.dateStr)}
                    className="w-full flex items-center justify-between p-4 bg-secondary/30 active:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[15px] font-[600] text-foreground">{day.dateStr}</span>
                      <span className="text-[12px] font-[600] px-2 py-0.5 rounded-full bg-primary/10 text-primary">+{day.totalPoints} pts</span>
                    </div>
                    {isExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
                  </button>

                  {isExpanded && (
                    <div className="border-t border-border">
                      {visibleTasks.map((t, i) => (
                        <div key={t.id} className={`p-4 flex flex-col gap-2 ${i !== 0 ? 'border-t border-border' : ''}`}>
                          <div className="flex items-start justify-between">
                            <span className="text-[14px] font-[500] text-foreground leading-snug">{t.name}</span>
                            <span className="text-[12px] font-[700] text-emerald-600 dark:text-emerald-400 shrink-0 ml-4">+{t.pts}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-[600] px-1.5 py-0.5 rounded-[4px] ${CATEGORY_BG[t.goal as Category]} ${CATEGORY_TEXT[t.goal as Category]}`}>
                              {t.goal}
                            </span>
                            <span className="text-[11px] font-[500] text-muted-foreground">{t.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {(!filteredCategory || filteredCategory) && ACCOMPLISHMENTS.every(d => d.tasks.filter(t => !filteredCategory || t.goal === filteredCategory).length === 0) && (
              <div className="text-center py-10 text-muted-foreground text-[14px] font-[500]">
                No completed tasks found for this filter.
              </div>
            )}
          </div>
        </div>

      </div>

      <BottomNav />
    </div>
  );
}
