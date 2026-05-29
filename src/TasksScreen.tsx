import React, { useState, useRef } from 'react';
import { 
  BarChart2, Check, ChevronDown, Flame, Home, Plus, Target, User, 
  RefreshCw, AlertCircle, X, Calendar, MoreVertical, Archive, 
  Trash2, Edit2, Play, Square, CheckSquare, Repeat
} from 'lucide-react';

// --- Types ---
type ViewMode = 'Today' | 'All';
type Goal = { id: string; name: string; category: string; color: string; bg: string; text: string };
type TaskStatus = 'Overdue' | 'Today' | 'Upcoming' | 'Recurring' | 'Completed';
type Task = {
  id: string;
  name: string;
  minVersion?: string;
  goalId?: string;
  tags: string[];
  dueDateStr: string;
  status: TaskStatus;
  isRecurring: boolean;
  frequency?: string;
  streak?: number;
  completed: boolean;
};

// --- Mock Data ---
const GOALS: Record<string, Goal> = {
  g1: { id: 'g1', name: 'Morning Run', category: 'Health', color: 'bg-emerald-500', bg: 'bg-emerald-500/10', text: 'text-emerald-600 dark:text-emerald-400' },
  g2: { id: 'g2', name: 'Read 20 Pages', category: 'Learning', color: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  g3: { id: 'g3', name: 'Deep Work Block', category: 'Career', color: 'bg-blue-500', bg: 'bg-blue-500/10', text: 'text-blue-600 dark:text-blue-400' },
  g4: { id: 'g4', name: 'Save This Month', category: 'Finance', color: 'bg-amber-500', bg: 'bg-amber-500/10', text: 'text-amber-600 dark:text-amber-400' },
  g5: { id: 'g5', name: 'Learn Spanish', category: 'Learning', color: 'bg-purple-500', bg: 'bg-purple-500/10', text: 'text-purple-600 dark:text-purple-400' },
  g6: { id: 'g6', name: 'Meditate', category: 'Wellness', color: 'bg-pink-500', bg: 'bg-pink-500/10', text: 'text-pink-600 dark:text-pink-400' },
};

const INITIAL_TASKS: Task[] = [
  // Today
  { id: 't1', name: '30 min run', minVersion: '10 min jog', goalId: 'g1', tags: ['fitness'], dueDateStr: 'Today', status: 'Today', isRecurring: false, completed: false },
  { id: 't2', name: 'Read chapter 5', minVersion: 'read 5 pages', goalId: 'g2', tags: ['reading'], dueDateStr: 'Today', status: 'Today', isRecurring: false, completed: false },
  { id: 't3', name: 'Deep work: feature spec', goalId: 'g3', tags: ['focus'], dueDateStr: 'Today', status: 'Today', isRecurring: false, completed: false },
  { id: 't4', name: 'Log expenses', goalId: 'g4', tags: ['finance'], dueDateStr: 'Today', status: 'Today', isRecurring: false, completed: false },
  // Upcoming
  { id: 't5', name: 'Sign up for 5K event', goalId: 'g1', tags: ['fitness'], dueDateStr: 'In 3 days', status: 'Upcoming', isRecurring: false, completed: false },
  { id: 't6', name: 'Spanish lesson session', goalId: 'g5', tags: [], dueDateStr: 'Tomorrow', status: 'Upcoming', isRecurring: false, completed: false },
  { id: 't7', name: 'Weekly review', tags: ['focus'], dueDateStr: 'Friday', status: 'Upcoming', isRecurring: false, completed: false },
  // Recurring
  { id: 't8', name: 'Morning Run', goalId: 'g1', tags: ['fitness'], dueDateStr: 'Today', status: 'Recurring', isRecurring: true, frequency: 'daily', streak: 14, completed: false },
  { id: 't9', name: 'Meditate 10 mins', goalId: 'g6', tags: [], dueDateStr: 'Today', status: 'Recurring', isRecurring: true, frequency: 'daily', streak: 0, completed: false },
  { id: 't10', name: 'Read before bed', goalId: 'g2', tags: ['reading'], dueDateStr: 'Today', status: 'Recurring', isRecurring: true, frequency: 'daily', streak: 5, completed: false },
  { id: 't11', name: 'Spanish flashcards', goalId: 'g5', tags: [], dueDateStr: 'Today', status: 'Recurring', isRecurring: true, frequency: 'daily', streak: 8, completed: false },
  { id: 't12', name: 'Weekly budget check', goalId: 'g4', tags: ['finance'], dueDateStr: 'Sunday', status: 'Recurring', isRecurring: true, frequency: 'weekly', streak: 4, completed: false },
  // Overdue
  { id: 't13', name: 'Evening stretch', tags: ['fitness'], dueDateStr: 'Yesterday', status: 'Overdue', isRecurring: false, completed: false },
  { id: 't14', name: 'Vocabulary practice', goalId: 'g5', tags: [], dueDateStr: 'Yesterday', status: 'Overdue', isRecurring: false, completed: false },
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [viewMode, setViewMode] = useState<ViewMode>('Today');
  const [showSyncBanner, setShowSyncBanner] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('All');
  
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [sheetY, setSheetY] = useState(0);

  // Gather unique tags
  const allTags = Array.from(new Set(tasks.flatMap(t => t.tags)));
  const allGoalIds = Array.from(new Set(tasks.map(t => t.goalId).filter(Boolean))) as string[];

  // Filter logic
  let displayedTasks = tasks.filter(t => {
    if (activeFilter === 'All') return true;
    if (activeFilter.startsWith('tag:')) return t.tags.includes(activeFilter.replace('tag:', ''));
    if (activeFilter.startsWith('goal:')) return t.goalId === activeFilter.replace('goal:', '');
    return true;
  });

  // View logic
  if (viewMode === 'Today') {
    displayedTasks = displayedTasks.filter(t => 
      t.status === 'Overdue' || t.status === 'Today' || t.completed || (t.status === 'Recurring' && t.dueDateStr === 'Today')
    );
  }

  const overdue = displayedTasks.filter(t => !t.completed && t.status === 'Overdue');
  const today = displayedTasks.filter(t => !t.completed && t.status === 'Today');
  const upcoming = displayedTasks.filter(t => !t.completed && t.status === 'Upcoming');
  const recurring = displayedTasks.filter(t => !t.completed && t.status === 'Recurring');
  const completed = displayedTasks.filter(t => t.completed);

  const handleToggle = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDismissSync = () => setShowSyncBanner(false);

  // Touch handlers for add sheet
  const handleTouchStart = (e: React.TouchEvent) => {};
  const handleTouchMove = (e: React.TouchEvent) => {};
  const handleTouchEnd = () => {
    if (sheetY > 150) setIsAddSheetOpen(false);
    setSheetY(0);
  };

  return (
    <div className="app-container bg-secondary/30 text-foreground h-full overflow-hidden flex flex-col">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-12 pb-3 px-4 border-b border-border shadow-sm">
        <div className="flex items-center justify-between mb-4 px-2">
          <h1 className="text-[24px] font-[700] tracking-[-0.4px]">Tasks</h1>
          
          {/* View Toggle */}
          <div className="flex p-1 bg-secondary rounded-[8px]">
            {(['Today', 'All'] as ViewMode[]).map(v => (
              <button 
                key={v} 
                onClick={() => setViewMode(v)}
                className={`px-4 py-1 rounded-[6px] text-[13px] font-[600] transition-colors ${viewMode === v ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 -mx-4 px-6 pb-1">
          <FilterChip active={activeFilter === 'All'} onClick={() => setActiveFilter('All')} label="All" />
          {allGoalIds.map(gId => (
            <FilterChip 
              key={gId} 
              active={activeFilter === `goal:${gId}`} 
              onClick={() => setActiveFilter(`goal:${gId}`)} 
              label={GOALS[gId].name}
              colorDot={GOALS[gId].color}
            />
          ))}
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

      {/* Sync Status Banner */}
      {showSyncBanner && (
        <div className="bg-destructive/10 border-b border-destructive/20 px-6 py-3 flex items-start justify-between shrink-0">
          <div className="flex items-start gap-2">
            <AlertCircle size={16} className="text-destructive mt-0.5 shrink-0" />
            <div>
              <p className="text-[13px] font-[600] text-destructive mb-0.5">TickTick sync failed</p>
              <p className="text-[12px] text-destructive/80 font-[500]">Last successful sync was 7 hours ago.</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[12px] font-[600] text-destructive active:opacity-70 flex items-center gap-1">
              <RefreshCw size={12} /> Retry
            </button>
            <button onClick={handleDismissSync} className="text-destructive/50 active:opacity-70"><X size={16}/></button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 space-y-6">
        
        {overdue.length > 0 && (
          <TaskGroup title="Overdue" titleColor="text-destructive" tasks={overdue} onToggle={handleToggle} />
        )}
        
        {today.length > 0 && (
          <TaskGroup title="Today" tasks={today} onToggle={handleToggle} />
        )}
        
        {viewMode === 'All' && upcoming.length > 0 && (
          <TaskGroup title="Upcoming" tasks={upcoming} onToggle={handleToggle} />
        )}

        {recurring.length > 0 && (
          <TaskGroup title="Recurring" tasks={recurring} onToggle={handleToggle} isRecurring />
        )}

        {completed.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h3 className="text-[14px] font-[600] text-muted-foreground mb-3 px-2">Completed</h3>
            <div className="bg-card border border-border rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06)] opacity-60">
              {completed.map((task, i) => (
                <TaskRow key={task.id} task={task} isLast={i === completed.length - 1} onToggle={() => handleToggle(task.id)} />
              ))}
            </div>
          </div>
        )}

        {displayedTasks.length === 0 && (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
              <Check size={32} />
            </div>
            <h3 className="text-[18px] font-[600] text-foreground mb-1 tracking-[-0.4px]">All caught up!</h3>
            <p className="text-[14px] text-muted-foreground font-[500]">Enjoy your free time.</p>
          </div>
        )}
      </div>

      {/* FAB */}
      <button 
        onClick={() => setIsAddSheetOpen(true)}
        className="absolute right-6 bottom-[100px] w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_4px_6px_-2px_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)] active:scale-95 transition-transform z-40"
      >
        <Plus size={24} />
      </button>

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 w-full h-[80px] bg-card border-t border-border flex items-center justify-between px-6 pb-safe z-40">
        <NavItem icon={Home} label="Today" />
        <NavItem icon={Target} label="Goals" />
        <NavItem icon={Check} label="Tasks" active />
        <NavItem icon={BarChart2} label="Analytics" />
        <NavItem icon={User} label="Profile" />
      </nav>

      {/* Add Task Bottom Sheet */}
      {isAddSheetOpen && (
        <AddTaskSheet 
          onClose={() => setIsAddSheetOpen(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sheetY={sheetY}
        />
      )}
    </div>
  );
}

// --- Subcomponents ---

function FilterChip({ active, onClick, label, colorDot }: { active: boolean, onClick: () => void, label: string, colorDot?: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-[500] border transition-colors ${
        active 
          ? 'bg-primary text-primary-foreground border-primary' 
          : 'bg-card text-muted-foreground border-border active:bg-secondary'
      }`}
    >
      {colorDot && <div className={`w-2 h-2 rounded-full ${colorDot}`} />}
      {label}
    </button>
  );
}

function TaskGroup({ title, titleColor = "text-foreground", tasks, onToggle, isRecurring }: any) {
  return (
    <div>
      <h3 className={`text-[18px] font-[700] mb-3 px-2 tracking-[-0.4px] ${titleColor}`}>{title}</h3>
      <div className="bg-card border border-border rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06)] relative">
        {tasks.map((task: Task, i: number) => (
          <TaskRow 
            key={task.id} 
            task={task} 
            isLast={i === tasks.length - 1} 
            onToggle={() => onToggle(task.id)}
          />
        ))}
      </div>
    </div>
  );
}

function TaskRow({ task, isLast, onToggle }: { task: Task, isLast: boolean, onToggle: () => void }) {
  const goal = task.goalId ? GOALS[task.goalId] : null;
  // Swipe mock logic
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const startSwipe = (e: React.TouchEvent | React.MouseEvent) => {
    // Basic mock swipe start
  };
  
  return (
    <div className={`relative bg-card flex items-stretch ${!isLast ? 'border-b border-border' : ''} overflow-hidden`}>
      {/* Hidden Swipe Actions (Left & Right) */}
      <div className="absolute inset-0 flex justify-between items-center z-0 px-4">
        <div className="flex gap-2 opacity-50"><Edit2 size={18}/></div>
        <div className="flex gap-2 text-destructive opacity-50"><Trash2 size={18}/></div>
      </div>
      
      {/* Main Task Row */}
      <div 
        className={`relative z-10 w-full bg-card p-4 flex gap-3 transition-transform duration-200 active:bg-secondary/50`}
        style={{ transform: `translateX(${swipeOffset}px)` }}
        onTouchStart={startSwipe}
      >
        <button onClick={onToggle} className={`mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full border-[1.5px] transition-colors ${task.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 text-transparent'}`}>
          <Check size={12} strokeWidth={3} />
        </button>
        
        <div className={`flex-1 min-w-0 ${task.completed ? 'opacity-50 line-through' : ''}`}>
          <div className="text-[15px] font-[500] text-foreground leading-snug mb-1">{task.name}</div>
          {task.minVersion && (
            <div className="text-[13px] italic text-muted-foreground mb-1.5">Min: {task.minVersion}</div>
          )}
          
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-2">
            {goal && (
              <span className={`inline-flex flex-shrink-0 items-center px-2 py-0.5 rounded-[4px] text-[11px] font-[600] ${goal.bg} ${goal.text}`}>
                {goal.name}
              </span>
            )}
            {task.dueDateStr && (
              <span className={`text-[12px] font-[500] ${task.status === 'Overdue' ? 'text-destructive font-[600]' : 'text-muted-foreground'}`}>
                {task.status === 'Overdue' ? `${task.dueDateStr} (Overdue)` : task.dueDateStr}
              </span>
            )}
            {task.isRecurring && (
              <span className="flex items-center gap-0.5 text-[11px] font-[600] text-muted-foreground">
                <Repeat size={10} />
                {task.frequency}
                {task.streak !== undefined && <span className="ml-1 text-orange-500 flex items-center gap-0.5"><Flame size={10}/>{task.streak}</span>}
              </span>
            )}
            {task.tags.map(tag => (
              <span key={tag} className="text-[11px] font-[500] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-[4px]">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTaskSheet({ onClose, onTouchStart, onTouchMove, onTouchEnd, sheetY }: any) {
  const [name, setName] = useState('');
  return (
    <div className="absolute inset-0 z-50 overflow-hidden flex flex-col justify-end">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div 
        className="relative bg-card rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col h-[90dvh]"
        style={{ 
          animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: `translateY(${sheetY}px)`
        }}
      >
        <div 
          className="p-4 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing shrink-0"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>
        
        <div className="px-6 pb-2 shrink-0 flex justify-between items-center">
          <h2 className="text-[20px] font-[700] tracking-[-0.4px]">New Task</h2>
          <button onClick={onClose} className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-muted-foreground active:opacity-70"><X size={18}/></button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-24">
          <div>
            <label className="block text-[14px] font-[500] mb-2 text-foreground">Task Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              {Object.values(GOALS).map(g => (
                <button key={g.id} className="flex-shrink-0 px-4 py-2 rounded-[8px] text-[14px] font-[500] border bg-card text-muted-foreground border-border transition-colors">
                  {g.name}
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
              <button className="w-full h-[40px] border border-input rounded-[8px] px-3 bg-background text-[15px] font-[500] text-foreground flex items-center justify-between">
                <span>Today</span>
                <Calendar size={16} className="text-muted-foreground" />
              </button>
            </div>
            <div className="flex-1">
              <label className="block text-[14px] font-[500] mb-2 text-foreground">Tags</label>
              <button className="w-full h-[40px] border border-input rounded-[8px] px-3 bg-background text-[15px] font-[400] text-muted-foreground text-left">
                Add tags...
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 bg-card border-t border-border pb-safe shrink-0">
          <button className="w-full h-[48px] rounded-[12px] bg-primary text-primary-foreground text-[16px] font-[600] active:opacity-90 transition-opacity">
            Add Task
          </button>
        </div>
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
