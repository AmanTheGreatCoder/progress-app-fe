import {
  Archive,
  ArchiveRestore,
  ArrowUpDown,
  Book,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Edit2,
  Flame,
  Footprints,
  Globe,
  Heart,
  PiggyBank,
  Play,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/shared/store/useAppStore';
import { BottomNav } from '@/shared/components/layout/BottomNav';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { FilterChip } from '@/shared/components/ui/FilterChip';
import { toLocalDateString } from '@/shared/dateUtils';
import { Skeleton } from '@/shared/components/ui/Skeleton';

const CATEGORIES = ['Health', 'Career', 'Finance', 'Learning', 'Wellness'];
const ICONS = { footprints: Footprints, book: Book, briefcase: Briefcase, heart: Heart, globe: Globe, 'piggy-bank': PiggyBank, target: Target, play: Play };
const CATEGORY_COLORS: Record<string, string> = { Health: 'bg-emerald-500', Career: 'bg-blue-500', Finance: 'bg-amber-500', Learning: 'bg-purple-500', Wellness: 'bg-pink-500' };
const CATEGORY_TEXT_COLORS: Record<string, string> = { Health: 'text-emerald-600 dark:text-emerald-400', Career: 'text-blue-600 dark:text-blue-400', Finance: 'text-amber-600 dark:text-amber-400', Learning: 'text-purple-600 dark:text-purple-400', Wellness: 'text-pink-600 dark:text-pink-400' };
const CATEGORY_BG_COLORS: Record<string, string> = { Health: 'bg-emerald-500/10', Career: 'bg-blue-500/10', Finance: 'bg-amber-500/10', Learning: 'bg-purple-500/10', Wellness: 'bg-pink-500/10' };
const PRIORITY_COLORS: Record<string, string> = { High: 'text-destructive bg-destructive/10', Medium: 'text-amber-600 bg-amber-500/10', Low: 'text-muted-foreground bg-muted' };
const PRIORITY_WEIGHT: Record<string, number> = { High: 3, Medium: 2, Low: 1 };

export default function GoalsScreen() {
  const navigate = useNavigate();
  const { goals, fetchGoals, addGoal, updateGoal, deleteGoal } = useAppStore();

  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [activeSort, setActiveSort] = useState<'Default' | 'Streak' | 'Recent'>('Default');

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchGoals().finally(() => setLoading(false));
  }, [fetchGoals]);

  // Derived State
  const normalizedGoals = goals.map(g => ({
    ...g,
    start: (g as any).startDate ?? (g as any).start ?? (g as any).createdAt ?? '',
    end: (g as any).deadline ?? (g as any).end ?? '',
    icon: (g as any).iconName ?? (g as any).icon ?? g.category?.toLowerCase() ?? 'target',
  }));

  const activeGoals = normalizedGoals.filter(g => !g.archived);
  const archivedGoals = normalizedGoals.filter(g => g.archived);

  let displayedGoals = activeGoals.filter(g => activeFilter === 'All' || g.category === activeFilter);
  displayedGoals = displayedGoals.sort((a, b) => {
    if (activeSort === 'Default') return (PRIORITY_WEIGHT[b.priority || 'Medium'] || 1) - (PRIORITY_WEIGHT[a.priority || 'Medium'] || 1);
    if (activeSort === 'Streak') return (b.streak || (b as any).done || 0) - (a.streak || (a as any).done || 0);
    if (activeSort === 'Recent') return new Date((b as any).createdAt || 0).getTime() - new Date((a as any).createdAt || 0).getTime();
    return 0;
  });

  const handleArchive = (id: string) => {
    updateGoal(id, { archived: true });
    setIsContextMenuOpen(false);
  };
  const handleRestore = (id: string) => {
    updateGoal(id, { archived: false });
  };
  const handleDelete = (id: string) => {
    deleteGoal(id);
  };

  const handleLongPress = (id: string) => {
    setSelectedGoalId(id);
    setIsContextMenuOpen(true);
  };

  return (
    <div className="app-container text-foreground bg-secondary/30 h-[100dvh] w-full overflow-hidden flex flex-col">
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border pt-4 pb-3 px-4 flex items-center justify-between">
        <h1 className="text-[24px] font-[700] tracking-[-0.4px]">Goals</h1>
        <div className="flex items-center gap-3">
          <button
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-secondary text-[13px] font-[500] active:opacity-70 transition-opacity"
            onClick={() => {
              const sorts: ('Default' | 'Streak' | 'Recent')[] = ['Default', 'Streak', 'Recent'];
              setActiveSort(sorts[(sorts.indexOf(activeSort) + 1) % 3]);
            }}
          >
            <ArrowUpDown size={14} className="text-muted-foreground" />
            {activeSort}
          </button>
          <button
            onClick={() => setIsAddSheetOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-primary text-primary-foreground active:scale-95 transition-transform"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      <div className="scroll-area flex-1 overflow-y-auto overflow-x-hidden pt-4 px-4 pb-24">
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 -mx-4 px-4 pb-2">
          {['All', ...CATEGORIES].map((cat) => (
            <FilterChip
              key={cat}
              label={cat}
              active={activeFilter === cat}
              onClick={() => setActiveFilter(cat)}
            />
          ))}
        </div>

        <div className="space-y-4 mb-8">
          {displayedGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onLongPress={() => handleLongPress(goal.id)}
              onClick={() => navigate(`/goals/${goal.id}`)}
            />
          ))}

          {loading ? (
            <>
              <Skeleton className="w-full h-[120px] rounded-[16px] mb-4" />
              <Skeleton className="w-full h-[120px] rounded-[16px] mb-4" />
              <Skeleton className="w-full h-[120px] rounded-[16px] mb-4" />
            </>
          ) : displayedGoals.length === 0 && (
            <div className="text-center py-6 text-muted-foreground text-[14px] font-[500]">
              No active goals found.
            </div>
          )}
        </div>

        {archivedGoals.length > 0 && (
          <div className="mb-8">
            <button
              className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-[16px] active:bg-secondary transition-colors"
              onClick={() => setIsArchivedExpanded(!isArchivedExpanded)}
            >
              <div className="flex items-center gap-2 text-muted-foreground">
                <Archive size={18} />
                <span className="text-[14px] font-[500]">Archived Goals ({archivedGoals.length})</span>
              </div>
              {isArchivedExpanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
            </button>

            {isArchivedExpanded && (
              <div className="mt-4 space-y-3 opacity-70">
                {archivedGoals.map(goal => (
                  <div key={goal.id} className="bg-card border border-border rounded-[12px] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                        {React.createElement((ICONS as any)[(goal as any).icon || 'target'] || Target, { size: 16 })}
                      </div>
                      <div>
                        <h4 className="text-[16px] font-[600] text-foreground mb-0.5">{goal.title}</h4>
                        <span className="text-[12px] text-muted-foreground font-[500]">Ended • {goal.streak || (goal as any).done || 0} day streak</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleRestore(goal.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-secondary text-foreground active:opacity-70">
                        <ArchiveRestore size={16} />
                      </button>
                      <button onClick={() => handleDelete(goal.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-destructive/10 text-destructive active:opacity-70">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <BottomNav />

      <BottomSheet isOpen={isContextMenuOpen} onClose={() => setIsContextMenuOpen(false)} title="Options">
        <div className="px-2 pb-2">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-secondary rounded-[12px] transition-colors">
            <Play size={18} className="text-primary" />
            <span className="text-[16px] font-[600] text-foreground">Log Session</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-secondary rounded-[12px] transition-colors">
            <Edit2 size={18} className="text-foreground" />
            <span className="text-[16px] font-[600] text-foreground">Edit Goal</span>
          </button>
          <div className="h-px bg-border my-1 mx-2" />
          <button
            onClick={() => selectedGoalId && handleArchive(selectedGoalId)}
            className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-destructive/10 rounded-[12px] transition-colors text-destructive"
          >
            <Archive size={18} />
            <span className="text-[16px] font-[600]">Archive Goal</span>
          </button>
        </div>
      </BottomSheet>

      {isAddSheetOpen && (
        <AddGoalSheet
          onClose={() => setIsAddSheetOpen(false)}
          onAdd={(newGoal: any) => {
            addGoal(newGoal);
            setIsAddSheetOpen(false);
          }}
        />
      )}
    </div>
  );
}

function GoalCard({ goal, onLongPress, onClick }: { goal: any, onLongPress: () => void, onClick?: () => void }) {
  const IconCmp = (ICONS as any)[goal.icon] || Target;

  const end = new Date(goal.end).getTime();
  const now = Date.now();

  const remainingMs = end - now;
  let remainingText = '';
  if (remainingMs < 0) {
    remainingText = 'Ended';
  } else {
    const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    remainingText = `${remainingDays}d left`;
  }

  let pressTimer: any;
  const startPress = () => { pressTimer = setTimeout(onLongPress, 500); };
  const cancelPress = () => { clearTimeout(pressTimer); };

  const streak = goal.streak || 0;
  const category = goal.category || 'General';
  const priority = goal.priority || 'Medium';

  // Use task-completion progress when linked series exist, otherwise fall back to time-based
  const hasLinkedTasks = (goal.linkedSeries?.length ?? 0) > 0 || (goal.linkedRecurringNames?.length ?? 0) > 0;
  const taskDone: number = goal.done ?? 0;
  const taskTotal: number = goal.total ?? 0;
  const progressPercent: number = hasLinkedTasks
    ? (goal.pct ?? 0)
    : Math.max(0, Math.min(100, ((now - new Date(goal.start).getTime()) / ((end - new Date(goal.start).getTime()) || 1)) * 100));

  return (
    <div
      className="relative bg-card border border-border rounded-[16px] p-4 flex flex-col shadow-sm overflow-hidden active:scale-[0.98] transition-transform select-none"
      onClick={onClick}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${CATEGORY_COLORS[category] || 'bg-primary'}`} />

      <div className="flex items-start justify-between mb-3 ml-2">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${CATEGORY_BG_COLORS[category] || 'bg-primary/10'} ${CATEGORY_TEXT_COLORS[category] || 'text-primary'}`}>
            <IconCmp size={20} />
          </div>
          <div>
            <h3 className="text-[18px] font-[700] text-foreground tracking-[-0.4px] leading-tight mb-1.5">{goal.title}</h3>
            <div className="flex items-center gap-2 text-[12px] font-[600]">
              <span className="px-2 py-0.5 rounded-[4px] bg-secondary text-secondary-foreground">{category}</span>
              <span className={`px-2 py-0.5 rounded-[4px] ${PRIORITY_COLORS[priority] || PRIORITY_COLORS.Medium}`}>{priority}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="ml-2 mt-2">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-1.5 text-[14px] font-[600]">
            <Flame size={16} className={streak > 0 ? "text-orange-500" : "text-muted-foreground"} />
            <span className={streak > 0 ? "text-foreground" : "text-muted-foreground"}>
              {streak} day streak
            </span>
          </div>
          <span className="text-[12px] text-muted-foreground font-[500]">
            Ends {new Date(goal.end || Date.now()).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[12px] font-[700] text-foreground">
            {hasLinkedTasks
              ? `${taskDone} / ${taskTotal} days`
              : `${Math.round(progressPercent)}% complete`}
          </span>
          <span className={`text-[12px] font-[700] ${remainingMs < (7 * 24 * 60 * 60 * 1000) && remainingMs > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
            {remainingText}
          </span>
        </div>

        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full ${CATEGORY_COLORS[category] || 'bg-primary'} transition-all duration-700`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {hasLinkedTasks ? (
          <div className="text-[12px] font-[600] text-muted-foreground text-right mt-1">
            {progressPercent}% achieved
          </div>
        ) : (
          <div className="text-[12px] font-[600] text-muted-foreground text-right mt-1">
            Target: {goal.targetFrequency || 0} / week
          </div>
        )}
      </div>
    </div>
  );
}

function AddGoalSheet({ onClose, onAdd }: { onClose: () => void, onAdd: (goal: any) => void }) {
  const todayStr = toLocalDateString(new Date());
  const ninetyDaysStr = toLocalDateString(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000));

  const [name, setName] = useState('My New Goal');
  const [category, setCategory] = useState<string>('Health');
  const [priority, setPriority] = useState<string>('Medium');
  const [icon, setIcon] = useState('target');
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(ninetyDaysStr);

  const mockPreviewGoal = {
    id: 'preview',
    title: name || 'Goal Name',
    category,
    priority,
    done: 0,
    streak: 0,
    icon,
    start: startDate || todayStr,
    end: endDate || ninetyDaysStr,
    archived: false,
  };

  const durationDays = startDate && endDate
    ? Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1)
    : 90;

  return (
    <BottomSheet isOpen={true} onClose={onClose} title="New Goal" footer={
      <button
        onClick={() => {
          onAdd({
            title: name,
            category,
            priority,
            targetFrequency: 3,
            startDate,
            deadline: endDate,
            iconName: icon,
          });
        }}
        className="w-full h-[48px] rounded-[12px] bg-primary text-primary-foreground text-[16px] font-[600] active:scale-[0.98] transition-all"
      >
        Create Goal
      </button>
    }>
      <div className="px-0 py-2 shrink-0 bg-secondary/30 border border-border rounded-[12px] mb-4">
        <p className="text-[12px] font-[700] text-muted-foreground uppercase tracking-[0.8px] mb-2 px-4 pt-2">Live Preview</p>
        <div className="pointer-events-none px-4 pb-2">
          <GoalCard goal={mockPreviewGoal} onLongPress={() => { }} />
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[14px] font-[600] mb-2 text-foreground">Goal Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Run 5k"
            className="w-full h-[48px] border border-input rounded-[12px] px-4 bg-background text-[16px] font-[400] text-foreground outline-none focus:border-primary transition-all"
          />
        </div>

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

        <div>
          <label className="block text-[14px] font-[600] mb-2 text-foreground">Priority</label>
          <div className="flex p-1 bg-secondary rounded-[12px]">
            {['High', 'Medium', 'Low'].map(p => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`flex-1 py-2 rounded-[10px] text-[14px] font-[600] transition-all ${priority === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* ── Date Range ── */}
        <div>
          <label className="block text-[14px] font-[600] mb-2 text-foreground">Timeframe</label>
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-[12px] font-[500] text-muted-foreground mb-1.5">Start date</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  // if end is now before start, push end forward
                  if (endDate && e.target.value && e.target.value > endDate) {
                    setEndDate(e.target.value);
                  }
                }}
                className="w-full h-[44px] border border-input rounded-[12px] px-3 bg-background text-[14px] font-[500] text-foreground outline-none focus:border-primary transition-all appearance-none"
              />
            </div>
            <div className="flex-1">
              <p className="text-[12px] font-[500] text-muted-foreground mb-1.5">End date</p>
              <input
                type="date"
                value={endDate}
                min={startDate}
                onChange={(e) => setEndDate(e.target.value)}
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

        <div>
          <label className="block text-[14px] font-[600] mb-2 text-foreground">Icon</label>
          <div className="grid grid-cols-6 gap-2">
            {Object.keys(ICONS).map(key => {
              const Ic = (ICONS as any)[key];
              return (
                <button
                  key={key}
                  onClick={() => setIcon(key)}
                  className={`aspect-square rounded-[12px] flex items-center justify-center border transition-all ${icon === key ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-sm' : 'bg-card text-muted-foreground border-border active:bg-secondary'}`}
                >
                  <Ic size={20} />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </BottomSheet>
  );
}
