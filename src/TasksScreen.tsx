import { useEffect, useState } from 'react';
import { AlertCircle, Check, Plus, RefreshCw, X, Calendar } from 'lucide-react';
import { BottomNav } from '@/shared/components/layout/BottomNav';
import { DateStrip } from '@/shared/components/ui/DateStrip';
import { useAppStore } from '@/shared/store/useAppStore';
import { TaskGroup } from '@/shared/components/ui/TaskGroup';
import { FilterChip } from '@/shared/components/ui/FilterChip';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { TaskRow } from '@/shared/components/ui/TaskRow';
import { Skeleton } from '@/shared/components/ui/Skeleton';

export default function TasksScreen() {
  const { tasks, goals, fetchTasks, fetchGoals, toggleTaskCompletion, activeFilter, setActiveFilter, selectedDate, setSelectedDate } = useAppStore();
  const [showSyncBanner, setShowSyncBanner] = useState(false);
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchTasks(selectedDate), fetchGoals()]).finally(() => setLoading(false));
  }, [selectedDate, fetchTasks, fetchGoals]);

  const normTags = (raw: unknown): string[] =>
    Array.isArray(raw) ? raw : (raw ? String(raw).split(',').filter(Boolean) : []);
  const allTags = Array.from(new Set(tasks.flatMap(t => normTags(t.tags)))) as string[];
  const allGoalIds = Array.from(new Set(tasks.map(t => t.goalId).filter(Boolean))) as string[];

  let displayedTasks = tasks.filter(t => {
    if (activeFilter === 'All') return true;
    if (activeFilter.startsWith('tag:')) return normTags(t.tags).includes(activeFilter.replace('tag:', ''));
    if (activeFilter.startsWith('goal:')) return t.goalId === activeFilter.replace('goal:', '');
    return true;
  });

  const todayDateStr = new Date().toISOString().split('T')[0];
  
  const overdue = displayedTasks.filter(t => !t.completed && t.date < todayDateStr && !t.isRecurring);
  const today = displayedTasks.filter(t => !t.completed && t.date >= todayDateStr && !t.isRecurring);
  const upcoming = displayedTasks.filter(() => false); // We currently only fetch one date
  const recurring = displayedTasks.filter(t => !t.completed && t.isRecurring);
  const completed = displayedTasks.filter(t => t.completed);

  return (
    <div className="app-container bg-background text-foreground h-[100dvh] w-full overflow-hidden flex flex-col">
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-6 pb-3 px-4 border-b border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-[24px] font-[700] tracking-[-0.4px]">Tasks</h1>
        </div>

        <p className="text-[13px] font-[500] text-muted-foreground">
          {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>

        <DateStrip selected={selectedDate} onSelect={setSelectedDate} />

        <div className="flex overflow-x-auto hide-scrollbar gap-2 -mx-4 pb-1 px-4">
          <FilterChip active={activeFilter === 'All'} onClick={() => setActiveFilter('All')} label="All" />
          {allGoalIds.map(gId => {
            const goal = goals.find(g => g.id === gId);
            if (!goal) return null;
            return (
              <FilterChip
                key={gId}
                active={activeFilter === `goal:${gId}`}
                onClick={() => setActiveFilter(`goal:${gId}`)}
                label={goal.title}
                colorDot="bg-primary"
              />
            );
          })}
          {allTags.map(tag => (
            <FilterChip
              key={tag}
              active={activeFilter === `tag:${tag}`}
              onClick={() => setActiveFilter(`tag:${tag}`)}
              label={`#${tag}`}
            />
          ))}
        </div>
      </div>

      {showSyncBanner && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-[600] text-destructive mb-0.5">Sync failed</p>
              <p className="text-[12px] text-destructive/80 font-[500]">Last successful sync was 7 hours ago.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[12px] font-[600] text-destructive active:opacity-70 flex items-center gap-1">
              <RefreshCw size={12} /> Retry
            </button>
            <button onClick={() => setShowSyncBanner(false)} className="text-destructive/50 active:opacity-70"><X size={16} /></button>
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto pt-4 pb-6 space-y-6 flex flex-col px-4">
        {loading ? (
          <>
            <Skeleton className="w-full h-[80px]" />
            <Skeleton className="w-full h-[80px]" />
            <Skeleton className="w-full h-[80px]" />
          </>
        ) : (
          <>
            <TaskGroup title="Overdue" titleColor="text-destructive" tasks={overdue} goals={goals} onToggle={toggleTaskCompletion} />
            <TaskGroup title="Today" tasks={today} goals={goals} onToggle={toggleTaskCompletion} />
            <TaskGroup title="Upcoming" tasks={upcoming} goals={goals} onToggle={toggleTaskCompletion} />
            <TaskGroup title="Recurring" tasks={recurring} goals={goals} onToggle={toggleTaskCompletion} isRecurring />

            {completed.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-[14px] font-[600] text-muted-foreground mb-3 px-2">Completed</h3>
                <div className="bg-card border border-border rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06)] opacity-60">
                  {completed.map((task, i) => (
                    <TaskRow key={task.id} task={task} goals={goals} isLast={i === completed.length - 1} onToggle={() => toggleTaskCompletion(task.id)} />
                  ))}
                </div>
              </div>
            )}

            {displayedTasks.length === 0 && (
              <div className="flex flex-col items-center justify-center flex-1 text-center opacity-80 pb-12 mt-12">
                <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mb-4">
                  <Check size={32} className="text-foreground" />
                </div>
                <h3 className="text-[18px] font-[600] text-foreground mb-1">All caught up!</h3>
                <p className="text-[14px] text-muted-foreground font-[500]">Enjoy your free time.</p>
              </div>
            )}
          </>
        )}
      </div>

      <button
        onClick={() => setIsAddSheetOpen(true)}
        className="absolute right-6 bottom-[100px] w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <Plus size={24} />
      </button>

      <BottomNav />

      <BottomSheet
        isOpen={isAddSheetOpen}
        onClose={() => setIsAddSheetOpen(false)}
        title="New Task"
        footer={
          <button className="w-full h-[48px] rounded-[12px] bg-primary text-primary-foreground text-[16px] font-[600] hover:bg-primary/90 active:scale-[0.98] transition-all">
            Add Task
          </button>
        }
      >
        <div>
          <label className="block text-[14px] font-[500] mb-2 text-foreground">Task Name</label>
          <input
            type="text"
            placeholder="e.g. Read chapter 5"
            autoFocus
            className="w-full h-[40px] border border-input rounded-[8px] px-3 bg-background text-[16px] font-[400] text-foreground outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block text-[14px] font-[500] mb-2 text-foreground">Minimum Version (Optional)</label>
          <input
            type="text"
            placeholder="e.g. read 5 pages"
            className="w-full h-[40px] border border-input rounded-[8px] px-3 bg-background text-[15px] font-[400] italic text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground placeholder:not-italic"
          />
        </div>

        <div>
          <label className="block text-[14px] font-[500] mb-2 text-foreground">Link to Goal (Optional)</label>
          <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-2 -mr-6 pr-6">
            <button className="flex-shrink-0 px-4 py-2 rounded-[8px] text-[14px] font-[500] border bg-primary text-primary-foreground border-primary transition-colors">
              None
            </button>
            {goals.map(g => (
              <button key={g.id} className="flex-shrink-0 px-4 py-2 rounded-[8px] text-[14px] font-[500] border bg-card text-muted-foreground border-border hover:bg-secondary transition-colors">
                {g.title}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-[12px] border border-border">
          <div>
            <div className="text-[15px] font-[600] text-foreground">Recurring Task</div>
            <div className="text-[13px] text-muted-foreground mt-0.5">Repeat daily or weekly</div>
          </div>
          <div className="w-12 h-6 bg-border rounded-full relative cursor-pointer">
            <div className="absolute left-1 top-1 w-4 h-4 bg-background rounded-full shadow-sm" />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-[14px] font-[500] mb-2 text-foreground">Due Date</label>
            <button className="w-full h-[40px] border border-input rounded-[8px] px-3 bg-background text-[15px] font-[500] text-foreground flex items-center justify-between hover:border-primary transition-colors">
              <span>Today</span>
              <Calendar size={16} className="text-muted-foreground" />
            </button>
          </div>
          <div className="flex-1">
            <label className="block text-[14px] font-[500] mb-2 text-foreground">Tags</label>
            <button className="w-full h-[40px] border border-input rounded-[8px] px-3 bg-background text-[15px] font-[400] text-muted-foreground text-left hover:border-primary transition-colors">
              Add tags...
            </button>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}
