import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  MoreVertical,
  Flame,
  Trophy,
  Clock,
  Play,
  Check,
  CheckSquare,
  Square,
  Plus,
  Edit2,
  Archive,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  X,
  Search,
  Footprints,
  Book,
  Briefcase,
  Heart,
  Globe,
  PiggyBank,
  Target,
} from 'lucide-react';
import { api } from '@/api';
import { useAppStore } from '@/shared/store/useAppStore';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { FilterChip } from '@/shared/components/ui/FilterChip';

/* ─── Goal-form constants (shared by Edit sheet) ─────────── */
const CATEGORIES = ['Health', 'Career', 'Finance', 'Learning', 'Wellness'];
const GOAL_ICONS: Record<string, React.ElementType> = {
  footprints: Footprints, book: Book, briefcase: Briefcase,
  heart: Heart, globe: Globe, 'piggy-bank': PiggyBank, target: Target,
};

/* ─── Types ─────────────────────────────────────────────── */

// GoalLog from backend
type GoalLog = { id: string; date: string; effortMinutes: number; notes: string };

// Displayed session (mapped from GoalLog)
type Session = { id: string; date: string; duration: number; note: string };

// TaskSeries from /api/tasks/series
type SeriesSummary = {
  id: string;
  name: string;
  tags: string[];
  firstSeen: string;
  lastSeen: string;
  taskCount: number;
};

// Individual task instance from /api/tasks?name=...&from=...&to=...
type TaskInstance = {
  id: string;
  name: string;
  date: string;
  completed: boolean;
  completedMin: boolean;
  tags: string[];
};

/* ─── Helpers ───────────────────────────────────────────── */

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.getTime() === today.getTime()) return 'Today';
  if (d.getTime() === yesterday.getTime()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function computeProgress(startDate: string, deadline: string) {
  const start = new Date(startDate).getTime();
  const end = new Date(deadline).getTime();
  const now = Date.now();
  const pct = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));
  const daysLeft = Math.max(0, Math.ceil((end - now) / 86400000));
  return { pct: Math.round(pct), daysLeft };
}

function getHeatmapDays(count = 90) {
  const days: string[] = [];
  const today = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
}

function getWeekDays() {
  // Returns Mon–Sun of the current week
  const today = new Date();
  const dow = today.getDay(); // 0=Sun … 6=Sat
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dow + 6) % 7));
  return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((label, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { label, dateStr: d.toISOString().split('T')[0] };
  });
}

/* ─── GoalDropdownMenu ──────────────────────────────────── */

function GoalDropdownMenu({
  onEdit, onArchive, onClose,
}: { onEdit: () => void; onArchive: () => void; onClose: () => void }) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute right-0 top-full mt-2 w-44 bg-card border border-border rounded-[14px] shadow-2xl z-50 overflow-hidden"
        style={{ animation: 'slide-up 0.15s cubic-bezier(0.16,1,0.3,1)' }}
      >
        <button
          onClick={() => { onEdit(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-secondary transition-colors"
        >
          <Edit2 size={16} className="text-foreground flex-shrink-0" />
          <span className="text-[15px] font-[500] text-foreground">Edit Goal</span>
        </button>
        <div className="h-px bg-border mx-3" />
        <button
          onClick={() => { onArchive(); onClose(); }}
          className="w-full flex items-center gap-3 px-4 py-3 text-left active:bg-destructive/10 transition-colors"
        >
          <Archive size={16} className="text-destructive flex-shrink-0" />
          <span className="text-[15px] font-[500] text-destructive">Archive Goal</span>
        </button>
      </div>
    </>
  );
}

/* ─── RecurringSeriesRow ────────────────────────────────── */

function RecurringSeriesRow({
  series, onUnlink, goalStartDate, goalEndDate,
}: {
  series: SeriesSummary;
  onUnlink: (id: string) => void;
  goalStartDate: string;
  goalEndDate: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const [instances, setInstances] = useState<TaskInstance[]>([]);
  const [loading, setLoading] = useState(false);

  const handleExpand = async () => {
    if (!expanded && instances.length === 0) {
      setLoading(true);
      try {
        // Only fetch task instances within the goal's date range
        const from = goalStartDate || series.firstSeen;
        const to = goalEndDate || series.lastSeen;
        const res = await api.get(
          `/tasks?name=${encodeURIComponent(series.name)}&from=${from}&to=${to}`
        );
        setInstances(res.data ?? []);
      } catch { /* ignore */ } finally {
        setLoading(false);
      }
    }
    setExpanded(e => !e);
  };

  const doneCount = instances.filter(t => t.completed).length;

  return (
    <div>
      <div className="flex items-center gap-3 px-4 py-3.5">
        <RefreshCw size={16} className="text-indigo-500 flex-shrink-0" />
        <button
          className="flex-1 min-w-0 text-left"
          onClick={handleExpand}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-[500] text-foreground">{series.name}</span>
            <span className="text-[11px] font-[600] px-1.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex-shrink-0">
              {instances.length > 0 ? `${doneCount}/${instances.length}` : `${series.taskCount}×`}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {series.tags.slice(0, 3).map(tag => (
              <span key={tag} className="text-[11px] text-muted-foreground">#{tag}</span>
            ))}
            {/* Show goal date range, not all-time history */}
            {goalStartDate && (
              <span className="text-[11px] text-muted-foreground">
                {formatDate(goalStartDate)} – {formatDate(goalEndDate)}
              </span>
            )}
          </div>
        </button>
        <div className="flex items-center gap-1">
          <button
            onClick={handleExpand}
            className="w-7 h-7 flex items-center justify-center rounded-full active:bg-secondary transition-colors text-muted-foreground"
          >
            {expanded
              ? <ChevronDown size={16} />
              : <ChevronRight size={16} />}
          </button>
          <button
            onClick={() => onUnlink(series.id)}
            className="w-7 h-7 flex items-center justify-center rounded-full active:bg-destructive/10 transition-colors text-muted-foreground active:text-destructive"
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Expanded instances */}
      {expanded && (
        <div className="border-t border-border bg-secondary/20">
          {loading && (
            <div className="px-4 py-3 text-[13px] text-muted-foreground">Loading…</div>
          )}
          {!loading && instances.length === 0 && (
            <div className="px-4 py-3 text-[13px] text-muted-foreground">No instances found.</div>
          )}
          {instances.map((task, i) => (
            <div
              key={task.id}
              className={`flex items-center gap-3 px-4 py-2.5 select-none ${i !== 0 ? 'border-t border-border/40' : ''}`}
            >
              <div className={`flex-shrink-0 pointer-events-none ${task.completed ? 'text-emerald-500' : 'text-muted-foreground/40'}`}>
                {task.completed ? <CheckSquare size={16} /> : <Square size={16} />}
              </div>
              <span className={`flex-1 text-[13px] font-[500] text-foreground ${task.completed ? 'line-through opacity-40' : ''}`}>
                {formatDate(task.date)}
              </span>
              {task.completed && <Check size={12} className="text-emerald-500 flex-shrink-0" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── AddTaskSheet ──────────────────────────────────────── */

function AddTaskSheet({
  isOpen, onClose, linkedSeriesIds, onLink,
}: {
  isOpen: boolean;
  onClose: () => void;
  linkedSeriesIds: string[];
  onLink: (series: SeriesSummary) => void;
}) {
  const [allSeries, setAllSeries] = useState<SeriesSummary[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    api.get('/tasks/series')
      .then(res => setAllSeries(res.data ?? []))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, [isOpen]);

  const available = allSeries.filter(s =>
    !linkedSeriesIds.includes(s.id) &&
    s.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Link Recurring Task">
      <div className="space-y-4">
        {/* Search */}
        <div className="flex items-center gap-2 bg-secondary rounded-[12px] px-3">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search tasks…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="flex-1 bg-transparent py-2.5 text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button onClick={() => setQuery('')}>
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>

        {loading && (
          <p className="text-center text-[14px] text-muted-foreground py-4">Loading…</p>
        )}

        {!loading && available.length === 0 && (
          <p className="text-center text-[14px] text-muted-foreground py-4">
            {query ? 'No matching tasks found.' : 'All recurring tasks are already linked.'}
          </p>
        )}

        <div className="space-y-2">
          {available.map(series => (
            <button
              key={series.id}
              onClick={() => { onLink(series); onClose(); }}
              className="w-full flex items-center gap-3 p-3.5 rounded-[12px] bg-card border border-border active:bg-secondary transition-colors text-left"
            >
              <RefreshCw size={16} className="text-indigo-500 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-[500] text-foreground leading-snug">{series.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-[12px] text-muted-foreground">{series.taskCount} occurrences</span>
                  {series.tags.slice(0, 2).map(tag => (
                    <span key={tag} className="text-[11px] text-muted-foreground">#{tag}</span>
                  ))}
                </div>
              </div>
              <Plus size={16} className="text-muted-foreground flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}

/* ─── Main Screen ───────────────────────────────────────── */

export default function GoalDetailScreen() {
  const { goalId } = useParams<{ goalId: string }>();
  const navigate = useNavigate();
  const { goals, updateGoal } = useAppStore();

  const [goal, setGoal] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [linkedSeries, setLinkedSeries] = useState<SeriesSummary[]>([]);

  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [tooltipData, setTooltipData] = useState<{ date: string; x: number; y: number; info: string } | null>(null);

  useEffect(() => {
    if (!goalId) return;

    const found = goals.find((g: any) => g.id === goalId);
    const rawGoal = found ?? null;

    if (!rawGoal) {
      api.get('/goals').then(res => {
        const g = res.data.find((g: any) => g.id === goalId);
        if (g) applyGoal(g);
      }).catch(console.error);
    } else {
      applyGoal(rawGoal);
    }
  }, [goalId, goals]);

  function applyGoal(g: any) {
    setGoal(g);
    // Map GoalLogs → Sessions
    const logs: GoalLog[] = g.logs ?? [];
    setSessions(
      logs
        .map(l => ({ id: l.id, date: l.date, duration: l.effortMinutes, note: l.notes }))
        .sort((a, b) => b.date.localeCompare(a.date))
    );
    // Linked series already embedded in goal
    setLinkedSeries(g.linkedSeries ?? []);
  }

  if (!goal) {
    return (
      <div className="app-container bg-background text-foreground h-[100dvh] flex items-center justify-center">
        <p className="text-muted-foreground text-[15px]">Loading…</p>
      </div>
    );
  }

  /* ── Derived data ── */
  const sessionMap = sessions.reduce((acc, s) => {
    acc[s.date] = (acc[s.date] || 0) + s.duration;
    return acc;
  }, {} as Record<string, number>);

  const today = todayStr();
  const hasLoggedToday = !!sessionMap[today];
  const streak = goal.streak ?? goal.done ?? 0;
  const longestStreak = goal.longestStreak ?? 0;
  const totalMin = sessions.reduce((a, s) => a + s.duration, 0);
  const totalTimeStr = totalMin >= 60
    ? `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`
    : `${totalMin}m`;

  const { pct: timeframePct, daysLeft } = computeProgress(
    goal.startDate ?? goal.start ?? today,
    goal.deadline ?? goal.end ?? today
  );

  const heatmapDays = getHeatmapDays(90);
  const goalStartDate = goal.startDate ?? goal.start ?? today;

  const weekDays = getWeekDays();
  const weekMaxMins = Math.max(...weekDays.map(d => sessionMap[d.dateStr] || 0), 1);
  const weekTotalMin = weekDays.reduce((a, d) => a + (sessionMap[d.dateStr] || 0), 0);
  const weekTotalStr = weekTotalMin >= 60
    ? `${Math.floor(weekTotalMin / 60)}h ${weekTotalMin % 60}m`
    : weekTotalMin > 0 ? `${weekTotalMin}m` : 'Nothing yet';

  /* ── Handlers ── */

  const handleAddSession = async (duration: number, notes: string) => {
    try {
      const res = await api.post(`/goals/${goalId}/log`, { effortMinutes: duration, notes });
      // res.data is the updated goal — re-apply to get fresh logs
      if (res.data?.logs) {
        applyGoal(res.data);
      } else {
        // Optimistic fallback
        setSessions(prev => [{
          id: Date.now().toString(), date: today, duration, note: notes,
        }, ...prev]);
      }
    } catch {
      // Optimistic even on error so UI doesn't freeze
      setSessions(prev => [{
        id: Date.now().toString(), date: today, duration, note: notes,
      }, ...prev]);
    }
    setIsLogSheetOpen(false);
  };

  const handleArchive = () => {
    if (goalId) updateGoal(goalId, { archived: true });
    navigate('/goals');
  };

  const handleLinkSeries = async (series: SeriesSummary) => {
    const newIds = [...linkedSeries.map(s => s.id), series.id];
    setLinkedSeries(prev => [...prev, series]);
    try {
      await updateGoal(goalId!, { linkedSeriesIds: newIds });
    } catch {
      setLinkedSeries(prev => prev.filter(s => s.id !== series.id));
    }
  };

  const handleUnlinkSeries = async (seriesId: string) => {
    const prev = [...linkedSeries];
    const newIds = linkedSeries.filter(s => s.id !== seriesId).map(s => s.id);
    setLinkedSeries(p => p.filter(s => s.id !== seriesId));
    try {
      await updateGoal(goalId!, { linkedSeriesIds: newIds });
    } catch {
      setLinkedSeries(prev);
    }
  };

  const handleEditSave = async (updates: {
    title: string; category: string; priority: string;
    startDate: string; deadline: string; iconName: string;
  }) => {
    try {
      await updateGoal(goalId!, updates);
      // Update local goal state so UI reflects immediately
      setGoal((g: any) => ({ ...g, ...updates, start: updates.startDate, end: updates.deadline }));
    } catch (e) {
      console.error('Failed to update goal', e);
    }
    setIsEditOpen(false);
  };

  /* ── Render ── */

  return (
    <div className="app-container bg-background text-foreground h-[100dvh] w-full overflow-hidden flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-12 pb-4 px-4 flex items-center justify-between border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-secondary transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2 font-[600] text-[16px] truncate max-w-[180px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
          <span className="truncate">{goal.title}</span>
        </div>
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(o => !o)}
            className="w-10 h-10 flex items-center justify-center rounded-full active:bg-secondary transition-colors"
          >
            <MoreVertical size={24} />
          </button>
          {isMenuOpen && (
            <GoalDropdownMenu
              onEdit={() => setIsEditOpen(true)}
              onArchive={handleArchive}
              onClose={() => setIsMenuOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Scrollable body */}
      <div
        className="scroll-area flex-1 overflow-y-auto overflow-x-hidden px-4 pt-6 pb-10"
        onClick={() => setTooltipData(null)}
      >

        {/* Hero */}
        <div className="flex flex-col items-center mb-8 text-center">
          <h1 className="text-[24px] font-[700] tracking-[-0.4px] leading-tight mb-2">{goal.title}</h1>
          <div className="flex items-center gap-2 text-[13px] font-[600] mb-6">
            <span className="px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground">{goal.category}</span>
            <span className="px-2.5 py-0.5 rounded-full text-destructive bg-destructive/10">{goal.priority || 'Medium'}</span>
          </div>

          <div className="flex justify-between w-full bg-card border border-border shadow-sm rounded-[16px] p-5">
            <div className="flex flex-col items-center flex-1">
              <Flame size={22} className="text-orange-500 mb-1" />
              <span className="text-[20px] font-[700] leading-none mb-1">{streak}</span>
              <span className="text-[12px] font-[500] text-muted-foreground">Current</span>
            </div>
            <div className="w-px bg-border my-2" />
            <div className="flex flex-col items-center flex-1">
              <Trophy size={22} className="text-amber-500 mb-1" />
              <span className="text-[20px] font-[700] leading-none mb-1">{longestStreak}</span>
              <span className="text-[12px] font-[500] text-muted-foreground">Longest</span>
            </div>
            <div className="w-px bg-border my-2" />
            <div className="flex flex-col items-center flex-1">
              <Clock size={22} className="text-blue-500 mb-1" />
              <span className="text-[20px] font-[700] leading-none mb-1">{totalTimeStr}</span>
              <span className="text-[12px] font-[500] text-muted-foreground">Total</span>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-10">
          {linkedSeries.length > 0 ? (
            /* Task-completion progress when linked series are set */
            <>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[14px] font-[600]">Task Progress</span>
                <span className="text-[12px] font-[600] text-muted-foreground">
                  {goal.done ?? 0} / {goal.total ?? 0} days
                </span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-700"
                  style={{ width: `${goal.pct ?? 0}%` }}
                />
              </div>
              <div className="flex justify-between text-[11px] font-[500] text-muted-foreground">
                <span>
                  {new Date(goal.startDate ?? goal.start ?? today).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span>
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'} ·{' '}
                  {new Date(goal.deadline ?? goal.end ?? today).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </>
          ) : (
            /* Timeframe-based progress when no linked tasks */
            <>
              <div className="flex justify-between items-end mb-2">
                <span className="text-[14px] font-[600]">Timeframe Progress</span>
                <span className="text-[12px] font-[600] text-muted-foreground">{timeframePct}% complete</span>
              </div>
              <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mb-2">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-700" style={{ width: `${timeframePct}%` }} />
              </div>
              <div className="flex justify-between text-[11px] font-[500] text-muted-foreground">
                <span>
                  {new Date(goal.startDate ?? goal.start ?? today).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span>
                  {daysLeft > 0 ? `${daysLeft} days left` : 'Ended'} ·{' '}
                  {new Date(goal.deadline ?? goal.end ?? today).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Heatmap */}
        <div className="mb-8">
          <h2 className="text-[18px] font-[700] tracking-[-0.4px] mb-4">Activity Heatmap</h2>
          <div className="bg-card border border-border rounded-[16px] p-4 shadow-sm overflow-x-auto hide-scrollbar relative">
            <div className="flex gap-1.5" style={{ width: 'max-content' }}>
              {Array.from({ length: Math.ceil(90 / 7) }).map((_, col) => (
                <div key={col} className="flex flex-col gap-1.5">
                  {Array.from({ length: 7 }).map((_, row) => {
                    const idx = col * 7 + row;
                    if (idx >= 90) return null;
                    const d = heatmapDays[idx];
                    const mins = sessionMap[d] || 0;
                    const beforeStart = d < goalStartDate;
                    const isToday = d === today;

                    let bg = 'bg-secondary/50';
                    if (beforeStart) bg = 'bg-transparent';
                    else if (mins > 40) bg = 'bg-emerald-600';
                    else if (mins > 20) bg = 'bg-emerald-500';
                    else if (mins > 0) bg = 'bg-emerald-300 dark:bg-emerald-700';

                    return (
                      <div
                        key={d}
                        onClick={e => {
                          e.stopPropagation();
                          if (beforeStart) return;
                          const r = e.currentTarget.getBoundingClientRect();
                          setTooltipData({
                            date: d, x: r.left + r.width / 2, y: r.top,
                            info: mins > 0 ? `${mins} min logged` : 'No activity',
                          });
                        }}
                        className={`w-3.5 h-3.5 rounded-[3px] transition-transform active:scale-125 ${bg} ${isToday ? 'ring-1 ring-foreground ring-offset-0' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            {tooltipData && (
              <div
                className="fixed z-50 bg-foreground text-background px-3 py-1.5 rounded-[8px] text-[12px] font-[500] whitespace-nowrap shadow-lg pointer-events-none -translate-x-1/2 -translate-y-full -mt-2"
                style={{ left: tooltipData.x, top: tooltipData.y }}
              >
                <div className="font-[700] mb-0.5">{formatDate(tooltipData.date)}</div>
                <div className="opacity-80">{tooltipData.info}</div>
                <div className="absolute w-2 h-2 bg-foreground rotate-45 left-1/2 -ml-1 -bottom-1" />
              </div>
            )}
          </div>
        </div>

        {/* Log button */}
        <button
          onClick={() => setIsLogSheetOpen(true)}
          className={`w-full py-4 rounded-[12px] flex items-center justify-center gap-2 text-[16px] font-[600] shadow-sm transition-all active:scale-[0.98] mb-10 ${hasLoggedToday
              ? 'bg-secondary text-foreground border border-border'
              : 'bg-primary text-primary-foreground'
            }`}
        >
          {hasLoggedToday
            ? <><Check size={20} /> Add Another Session</>
            : <><Play size={20} className="fill-current" /> Log Today's Session</>
          }
        </button>

        {/* This Week */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-[18px] font-[700] tracking-[-0.4px]">This Week</h2>
            <span className={`text-[14px] font-[600] ${weekTotalMin > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
              {weekTotalStr}
            </span>
          </div>
          <div className="h-28 flex items-end justify-between gap-2 px-1">
            {weekDays.map(({ label, dateStr }) => {
              const mins = sessionMap[dateStr] || 0;
              const heightPct = (mins / weekMaxMins) * 100;
              const isToday = dateStr === today;
              return (
                <div key={dateStr} className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full bg-secondary rounded-t-[4px] flex items-end" style={{ height: 80 }}>
                    <div
                      className={`w-full rounded-t-[4px] transition-all duration-700 ${isToday ? 'bg-emerald-500' : 'bg-emerald-400/60 dark:bg-emerald-500/40'
                        }`}
                      style={{ height: mins > 0 ? `${Math.max(heightPct, 6)}%` : '0%' }}
                    />
                  </div>
                  <span className={`text-[11px] font-[${isToday ? '700' : '500'}] ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session History */}
        <div className="mb-10">
          <h2 className="text-[18px] font-[700] tracking-[-0.4px] mb-4">Session History</h2>
          {sessions.length === 0 ? (
            <div className="bg-card border border-border rounded-[16px] p-6 text-center shadow-sm">
              <p className="text-[14px] text-muted-foreground">No sessions logged yet.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-[16px] overflow-hidden shadow-sm">
              {(showAllSessions ? sessions : sessions.slice(0, 5)).map((s, i) => (
                <div key={s.id} className={`p-4 flex items-center justify-between ${i !== 0 ? 'border-t border-border' : ''}`}>
                  <div>
                    <div className="text-[14px] font-[600] mb-0.5">{formatDate(s.date)}</div>
                    {s.note && <div className="text-[13px] text-muted-foreground">{s.note}</div>}
                  </div>
                  <span className="text-[14px] font-[700] text-emerald-600 dark:text-emerald-400">
                    {s.duration} min
                  </span>
                </div>
              ))}
              {sessions.length > 5 && (
                <button
                  onClick={() => setShowAllSessions(v => !v)}
                  className="w-full p-3 text-center text-[13px] font-[600] text-muted-foreground bg-secondary/50 active:bg-secondary transition-colors border-t border-border"
                >
                  {showAllSessions ? 'Show less' : `Show all ${sessions.length} sessions`}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Linked Tasks */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[18px] font-[700] tracking-[-0.4px]">Linked Tasks</h2>
            <button
              onClick={() => setIsAddTaskOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-[13px] font-[600] active:scale-95 transition-transform"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {linkedSeries.length === 0 ? (
            <div className="bg-card border border-border rounded-[16px] p-6 text-center shadow-sm">
              <p className="text-[14px] text-muted-foreground mb-1">No tasks linked yet.</p>
              <p className="text-[12px] text-muted-foreground">Tap + Add to link a recurring task series.</p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-[16px] overflow-hidden shadow-sm divide-y divide-border">
              {linkedSeries.map(series => (
                <RecurringSeriesRow
                  key={series.id}
                  series={series}
                  onUnlink={handleUnlinkSeries}
                  goalStartDate={goal.startDate ?? goal.start ?? today}
                  goalEndDate={goal.deadline ?? goal.end ?? today}
                />
              ))}
            </div>
          )}
        </div>

      </div>{/* end scroll area */}

      {/* Log Session Sheet */}
      <LogSessionSheet
        isOpen={isLogSheetOpen}
        goalName={goal.title}
        onClose={() => setIsLogSheetOpen(false)}
        onSubmit={handleAddSession}
      />

      {/* Add Task Sheet */}
      <AddTaskSheet
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        linkedSeriesIds={linkedSeries.map(s => s.id)}
        onLink={handleLinkSeries}
      />

      {/* Edit Goal Sheet */}
      {goal && (
        <EditGoalSheet
          isOpen={isEditOpen}
          goal={goal}
          onClose={() => setIsEditOpen(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  );
}

/* ─── LogSessionSheet ───────────────────────────────────── */

function LogSessionSheet({ isOpen, goalName, onClose, onSubmit }: any) {
  const [duration, setDuration] = useState(30);
  const [note, setNote] = useState('');
  const QUICK = [15, 20, 30, 45, 60];

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Log Session" footer={
      <button
        onClick={() => onSubmit(duration, note)}
        className="w-full h-[48px] rounded-[12px] bg-primary text-primary-foreground text-[16px] font-[600] active:scale-[0.98] transition-transform"
      >
        Save Session
      </button>
    }>
      <div className="space-y-6">
        <p className="text-[14px] text-muted-foreground -mt-4">{goalName}</p>

        <div>
          <label className="block text-[14px] font-[500] mb-3">Duration (minutes)</label>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setDuration(m => Math.max(5, m - 5))}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-[700] text-[20px]"
            >−</button>
            <div className="flex-1 text-center text-[36px] font-[700] tracking-[-1px]">{duration}</div>
            <button
              onClick={() => setDuration(m => m + 5)}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-[700] text-[20px]"
            >+</button>
          </div>
          <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-2 px-2">
            {QUICK.map(m => (
              <button
                key={m}
                onClick={() => setDuration(m)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[14px] font-[600] border transition-colors ${duration === m
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-card text-muted-foreground border-border'
                  }`}
              >
                {m}m
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-[14px] font-[500] mb-2">Note (optional)</label>
          <textarea
            value={note}
            onChange={e => setNote(e.target.value)}
            placeholder="How did it go?"
            className="w-full h-[80px] p-3 border border-input rounded-[12px] bg-background text-[15px] outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground"
          />
        </div>
      </div>
    </BottomSheet>
  );
}

/* ─── EditGoalSheet ─────────────────────────────────────── */

function EditGoalSheet({
  isOpen, goal, onClose, onSave,
}: {
  isOpen: boolean;
  goal: any;
  onClose: () => void;
  onSave: (updates: {
    title: string; category: string; priority: string;
    startDate: string; deadline: string; iconName: string;
  }) => void;
}) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [priority, setPriority] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');
  const [iconName, setIconName] = useState('target');

  // Seed form from goal whenever the sheet opens
  useEffect(() => {
    if (isOpen && goal) {
      setTitle(goal.title ?? '');
      setCategory(goal.category ?? 'Health');
      setPriority(goal.priority ?? 'Medium');
      setStartDate(goal.startDate ?? goal.start ?? '');
      setDeadline(goal.deadline ?? goal.end ?? '');
      setIconName(goal.iconName ?? goal.icon ?? 'target');
    }
  }, [isOpen, goal]);

  const durationDays = startDate && deadline
    ? Math.max(0, Math.ceil(
      (new Date(deadline).getTime() - new Date(startDate).getTime()) / 86400000
    ))
    : 0;

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ title: title.trim(), category, priority, startDate, deadline, iconName });
  };

  return (
    <BottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Goal"
      footer={
        <button
          onClick={handleSave}
          disabled={!title.trim()}
          className="w-full h-[48px] rounded-[12px] bg-primary text-primary-foreground text-[16px] font-[600] active:scale-[0.98] transition-all disabled:opacity-40"
        >
          Save Changes
        </button>
      }
    >
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-[14px] font-[600] mb-2 text-foreground">Goal Name</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. Run 5k"
            className="w-full h-[48px] border border-input rounded-[12px] px-4 bg-background text-[16px] text-foreground outline-none focus:border-primary transition-all"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[14px] font-[600] mb-2 text-foreground">Category</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <FilterChip
                key={cat}
                label={cat}
                active={category === cat}
                onClick={() => setCategory(cat)}
              />
            ))}
          </div>
        </div>

        {/* Priority */}
        <div>
          <label className="block text-[14px] font-[600] mb-2 text-foreground">Priority</label>
          <div className="flex p-1 bg-secondary rounded-[12px]">
            {['High', 'Medium', 'Low'].map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-[10px] text-[14px] font-[600] transition-all ${priority === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                  }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Date range */}
        <div>
          <label className="block text-[14px] font-[600] mb-2 text-foreground">Timeframe</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-[12px] font-[500] text-muted-foreground mb-1.5">Start date</p>
              <input
                type="date"
                value={startDate}
                onChange={e => {
                  setStartDate(e.target.value);
                  if (deadline && e.target.value > deadline) setDeadline(e.target.value);
                }}
                className="w-full h-[44px] border border-input rounded-[12px] px-3 bg-background text-[14px] font-[500] text-foreground outline-none focus:border-primary transition-all appearance-none"
              />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-[500] text-muted-foreground mb-1.5">End date</p>
              <input
                type="date"
                value={deadline}
                min={startDate}
                onChange={e => setDeadline(e.target.value)}
                className="w-full h-[44px] border border-input rounded-[12px] px-3 bg-background text-[14px] font-[500] text-foreground outline-none focus:border-primary transition-all appearance-none"
              />
            </div>
          </div>
          {durationDays > 0 && (
            <p className="text-[12px] text-muted-foreground mt-2 text-center">
              {durationDays} day{durationDays !== 1 ? 's' : ''} total
            </p>
          )}
        </div>

        {/* Icon */}
        <div>
          <label className="block text-[14px] font-[600] mb-2 text-foreground">Icon</label>
          <div className="grid grid-cols-7 gap-2">
            {Object.entries(GOAL_ICONS).map(([key, Icon]) => (
              <button
                key={key}
                onClick={() => setIconName(key)}
                className={`aspect-square rounded-[12px] flex items-center justify-center border transition-all ${iconName === key
                    ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-sm'
                    : 'bg-card text-muted-foreground border-border active:bg-secondary'
                  }`}
              >
                <Icon size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
