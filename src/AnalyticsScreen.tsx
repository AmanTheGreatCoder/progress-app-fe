import React, { useState, useEffect } from 'react';
import { 
  BarChart2, Check, Home, Target, User, TrendingUp, TrendingDown, 
  Award, Activity, ChevronDown, ChevronUp, Zap, Clock
} from 'lucide-react';

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

// "This Week" mock (Mon-Sun, today is Tue)
const THIS_WEEK_DATA: DayData[] = [
  { day: 'M', points: 80, tasks: 12 },
  { day: 'T', points: 95, tasks: 11, isToday: true },
  { day: 'W', points: 0, tasks: 0, isFuture: true },
  { day: 'T', points: 0, tasks: 0, isFuture: true },
  { day: 'F', points: 0, tasks: 0, isFuture: true },
  { day: 'S', points: 0, tasks: 0, isFuture: true },
  { day: 'S', points: 0, tasks: 0, isFuture: true }
];

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

const CATEGORY_BREAKDOWN = [
  { name: 'Career', mins: 250, label: '4h 10m' }, // 4h 10m
  { name: 'Health', mins: 200, label: '3h 20m' }, // 3h 20m
  { name: 'Learning', mins: 165, label: '2h 45m' }, // 2h 45m
  { name: 'Wellness', mins: 30, label: '0h 30m' },  // 30m
  { name: 'Finance', mins: 20, label: '0h 20m' }    // 20m
] as { name: Category; mins: number; label: string }[];

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

  useEffect(() => {
    // Trigger bar animations on mount
    const t = setTimeout(() => setAnimateBars(true), 100);
    return () => clearTimeout(t);
  }, [timeRange]);

  const toggleLog = (dateStr: string) => {
    setExpandedLogs(prev => ({ ...prev, [dateStr]: !prev[dateStr] }));
  };

  const chartData = timeRange === 'This Week' ? THIS_WEEK_DATA : LAST_WEEK_DATA;
  const targetPoints = 120; // Mock daily target

  // Mock Scorecard
  const scoreCard = timeRange === 'This Week' 
    ? { pts: 175, ptsChange: -70, tasks: 23, tasksChange: -60, time: '11h 5m', timeChange: -5 }
    : { pts: 583, ptsChange: +12, tasks: 78, tasksChange: +8, time: '28h 10m', timeChange: +15 };

  return (
    <div className="app-container bg-secondary/30 text-foreground h-full overflow-hidden flex flex-col" onClick={() => setActiveTooltip(null)}>
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-12 pb-4 px-6 border-b border-border shadow-sm flex flex-col gap-4">
        <h1 className="text-[24px] font-[700] tracking-[-0.4px]">Analytics</h1>
        
        {/* Time Range Selector */}
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

      <div className="scroll-area flex-1 overflow-y-auto pt-6 pb-32">
        
        {/* Daily Points Rings */}
        <div className="px-6 mb-8 relative">
          <div className="flex justify-between items-center bg-card border border-border shadow-[0_1px_2px_rgba(0,0,0,0.06)] rounded-[16px] p-5">
            {chartData.map((d, i) => {
              const radius = d.isToday ? 18 : 15;
              const strokeWidth = d.isToday ? 3.5 : 3;
              const circumference = 2 * Math.PI * radius;
              const percent = Math.min(100, Math.max(0, (d.points / targetPoints) * 100));
              const offset = circumference - (percent / 100) * circumference;
              
              return (
                <div key={i} className="flex flex-col items-center gap-2 relative">
                  <div 
                    className="relative flex items-center justify-center cursor-pointer transition-transform active:scale-95"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (d.isFuture) return;
                      const rect = e.currentTarget.getBoundingClientRect();
                      setActiveTooltip({ x: rect.left + rect.width / 2, y: rect.top - 8, points: d.points, tasks: d.tasks });
                    }}
                  >
                    <svg width={(radius + strokeWidth) * 2} height={(radius + strokeWidth) * 2} className="transform -rotate-90">
                      <circle 
                        cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius} 
                        fill="transparent" 
                        stroke={d.isFuture ? 'var(--border)' : 'var(--secondary)'} 
                        strokeWidth={strokeWidth} 
                        strokeDasharray={d.isFuture ? '4 2' : 'none'}
                      />
                      {!d.isFuture && (
                        <circle 
                          cx={radius + strokeWidth} cy={radius + strokeWidth} r={radius} 
                          fill="transparent" 
                          stroke="var(--primary)" 
                          strokeWidth={strokeWidth} 
                          strokeDasharray={circumference}
                          strokeDashoffset={offset}
                          strokeLinecap="round"
                          className="transition-all duration-1000 ease-out"
                        />
                      )}
                    </svg>
                  </div>
                  <span className={`text-[12px] font-[600] ${d.isToday ? 'text-foreground' : 'text-muted-foreground'}`}>{d.day}</span>
                  {d.isToday && <div className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-foreground" />}
                </div>
              );
            })}
          </div>

          {/* Rings Tooltip */}
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

        {/* Weekly Scorecard */}
        <div className="px-6 mb-8">
          <div className="grid grid-cols-3 gap-3">
            <ScoreCard title="Points" value={scoreCard.pts.toString()} change={scoreCard.ptsChange} icon={Zap} />
            <ScoreCard title="Tasks" value={scoreCard.tasks.toString()} change={scoreCard.tasksChange} icon={Check} />
            <ScoreCard title="Time Logged" value={scoreCard.time} change={scoreCard.timeChange} icon={Clock} />
          </div>
        </div>

        {/* Week in Review Card */}
        <div className="px-6 mb-8">
          <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/20 rounded-[16px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            <h2 className="text-[16px] font-[700] tracking-[-0.4px] mb-3 text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <Award size={18} />
              {timeRange === 'This Week' ? 'Week So Far' : 'Week in Review'}
            </h2>
            <div className="space-y-2 text-[14px] font-[500] leading-snug text-amber-800 dark:text-amber-300">
              <p>🎯 <strong className="font-[700]">Morning Run</strong> is your longest active streak at 14 days.</p>
              <p>📈 You've improved most in <strong className="font-[700]">Health</strong> (+40m vs last week).</p>
              <p>⚠️ <strong className="font-[700]">Finance</strong> needs attention (down 35m from last week).</p>
            </div>
          </div>
        </div>

        {/* Weekly Task Completion Chart */}
        <div className="px-6 mb-10">
          <h2 className="text-[18px] font-[700] tracking-[-0.4px] mb-4">Task Completion</h2>
          <div className="h-[140px] flex items-end justify-between gap-2 px-2 relative">
            {/* Average Line */}
            <div className="absolute left-0 right-0 bottom-[60px] border-t border-dashed border-primary/30 z-0" />
            <div className="absolute right-0 bottom-[62px] text-[10px] font-[600] text-primary/60 bg-secondary/80 px-1">Avg</div>
            
            {chartData.map((d, i) => {
              // Mock max tasks to 20 for scaling
              const heightPct = (d.tasks / 20) * 100;
              return (
                <div key={i} className="flex flex-col items-center flex-1 gap-2 z-10">
                  <div className="w-full bg-secondary rounded-t-[4px] relative flex items-end justify-center" style={{ height: '100px' }}>
                    <div 
                      className={`w-full rounded-t-[4px] transition-all duration-1000 ease-out ${d.isFuture ? 'bg-transparent' : 'bg-primary'}`}
                      style={{ height: animateBars ? `${heightPct}%` : '0%' }}
                    />
                  </div>
                  <span className={`text-[12px] font-[500] ${d.isToday ? 'text-foreground font-[700]' : 'text-muted-foreground'}`}>{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Time Breakdown */}
        <div className="px-6 mb-10">
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

          <div className="bg-card border border-border rounded-[16px] p-5 shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            {/* Stacked Bar */}
            <div className="w-full h-3 rounded-full overflow-hidden flex mb-6 bg-secondary">
              {CATEGORY_BREAKDOWN.map((c, i) => {
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

            {/* Category Rows */}
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

        {/* Accomplishment Log */}
        <div className="px-6 mb-10">
          <h2 className="text-[18px] font-[700] tracking-[-0.4px] mb-4">Accomplishments</h2>
          <div className="space-y-3">
            {ACCOMPLISHMENTS.map((day) => {
              const isExpanded = expandedLogs[day.dateStr];
              // Apply category filter if active
              const visibleTasks = day.tasks.filter(t => !filteredCategory || t.goal === filteredCategory);
              
              if (visibleTasks.length === 0) return null;

              return (
                <div key={day.dateStr} className="bg-card border border-border rounded-[12px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
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

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 w-full h-[80px] bg-card border-t border-border flex items-center justify-between px-6 pb-safe z-40">
        <NavItem icon={Home} label="Today" />
        <NavItem icon={Target} label="Goals" />
        <NavItem icon={Check} label="Tasks" />
        <NavItem icon={BarChart2} label="Analytics" active />
        <NavItem icon={User} label="Profile" />
      </nav>
    </div>
  );
}

// --- Subcomponents ---

function ScoreCard({ title, value, change, icon: Icon }: any) {
  const isPositive = change >= 0;
  return (
    <div className="bg-card border border-border rounded-[12px] p-3 shadow-[0_1px_2px_rgba(0,0,0,0.06)] flex flex-col">
      <div className="flex items-center gap-1.5 mb-2 text-muted-foreground">
        <Icon size={14} />
        <span className="text-[12px] font-[600]">{title}</span>
      </div>
      <div className="text-[20px] font-[700] text-foreground tracking-[-0.5px] leading-none mb-1.5">{value}</div>
      <div className={`flex items-center gap-0.5 text-[11px] font-[600] ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        {Math.abs(change)}%
      </div>
    </div>
  );
}

function NavItem({ icon: Icon, label, active }: any) {
  return (
    <button className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-full ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
      <Icon size={20} className={active ? 'text-foreground' : 'text-muted-foreground'} />
      <span className="text-[11px] font-[500] leading-none">{label}</span>
    </button>
  );
}
