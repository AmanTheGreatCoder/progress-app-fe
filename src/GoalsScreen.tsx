import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart2,
  Book,
  Briefcase,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  Flame,
  Footprints,
  Globe,
  Heart,
  Home,
  MoreVertical,
  PiggyBank,
  Play,
  Plus,
  Target,
  User,
  ArrowUpDown,
  Archive,
  ArchiveRestore,
  Trash2,
  Edit2,
  X,
  Search
} from 'lucide-react';

// Mock Data
type Priority = 'High' | 'Medium' | 'Low';
type Category = 'Health' | 'Learning' | 'Career' | 'Wellness' | 'Finance';
type Goal = {
  id: string;
  name: string;
  category: Category;
  priority: Priority;
  streak: number;
  iconName: string;
  startDate: string;
  endDate: string;
  lastLogged: string;
  isArchived: boolean;
};

const INITIAL_GOALS: Goal[] = [
  { id: '1', name: 'Morning Run', category: 'Health', priority: 'High', streak: 14, iconName: 'footprints', startDate: '2026-05-08', endDate: '2026-08-27', lastLogged: '2 hours ago', isArchived: false },
  { id: '2', name: 'Read 20 Pages', category: 'Learning', priority: 'Medium', streak: 5, iconName: 'book', startDate: '2026-01-01', endDate: '2026-12-31', lastLogged: 'Yesterday', isArchived: false },
  { id: '3', name: 'Deep Work Block', category: 'Career', priority: 'High', streak: 3, iconName: 'briefcase', startDate: '2026-05-01', endDate: '2026-06-30', lastLogged: '4 hours ago', isArchived: false },
  { id: '4', name: 'Meditate', category: 'Wellness', priority: 'Low', streak: 0, iconName: 'heart', startDate: '2026-05-20', endDate: '2026-07-20', lastLogged: '3 days ago', isArchived: false },
  { id: '5', name: 'Learn Spanish', category: 'Learning', priority: 'Medium', streak: 8, iconName: 'globe', startDate: '2026-04-01', endDate: '2026-10-01', lastLogged: 'Yesterday', isArchived: false },
  { id: '6', name: 'Save This Month', category: 'Finance', priority: 'High', streak: 1, iconName: 'piggy-bank', startDate: '2026-05-01', endDate: '2026-05-31', lastLogged: 'Today', isArchived: false },
  { id: '7', name: 'Evening Walk', category: 'Health', priority: 'Medium', streak: 12, iconName: 'footprints', startDate: '2026-01-01', endDate: '2026-03-01', lastLogged: '2 months ago', isArchived: true },
  { id: '8', name: 'No Sugar Week', category: 'Wellness', priority: 'High', streak: 7, iconName: 'heart', startDate: '2026-04-10', endDate: '2026-04-17', lastLogged: '1 month ago', isArchived: true },
];

const CATEGORIES: Category[] = ['Health', 'Career', 'Finance', 'Learning', 'Wellness'];
const ICONS = { footprints: Footprints, book: Book, briefcase: Briefcase, heart: Heart, globe: Globe, 'piggy-bank': PiggyBank, target: Target, play: Play };
const CATEGORY_COLORS: Record<Category, string> = { Health: 'bg-emerald-500', Career: 'bg-blue-500', Finance: 'bg-amber-500', Learning: 'bg-purple-500', Wellness: 'bg-pink-500' };
const CATEGORY_TEXT_COLORS: Record<Category, string> = { Health: 'text-emerald-600 dark:text-emerald-400', Career: 'text-blue-600 dark:text-blue-400', Finance: 'text-amber-600 dark:text-amber-400', Learning: 'text-purple-600 dark:text-purple-400', Wellness: 'text-pink-600 dark:text-pink-400' };
const CATEGORY_BG_COLORS: Record<Category, string> = { Health: 'bg-emerald-500/10', Career: 'bg-blue-500/10', Finance: 'bg-amber-500/10', Learning: 'bg-purple-500/10', Wellness: 'bg-pink-500/10' };
const PRIORITY_COLORS: Record<Priority, string> = { High: 'text-destructive bg-destructive/10', Medium: 'text-amber-600 bg-amber-500/10', Low: 'text-muted-foreground bg-muted' };
const PRIORITY_WEIGHT = { High: 3, Medium: 2, Low: 1 };

export default function GoalsScreen({ onNavigate, onGoalClick }: any) {
  const [goals, setGoals] = useState<Goal[]>(INITIAL_GOALS);
  const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');
  const [activeSort, setActiveSort] = useState<'Default' | 'Streak' | 'Recent'>('Default');

  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isArchivedExpanded, setIsArchivedExpanded] = useState(false);
  const [addSheetY, setAddSheetY] = useState(0);
  const [contextSheetY, setContextSheetY] = useState(0);

  // Derived State
  const activeGoals = goals.filter(g => !g.isArchived);
  const archivedGoals = goals.filter(g => g.isArchived);

  let displayedGoals = activeGoals.filter(g => activeFilter === 'All' || g.category === activeFilter);
  displayedGoals = displayedGoals.sort((a, b) => {
    if (activeSort === 'Default') return PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
    if (activeSort === 'Streak') return b.streak - a.streak;
    // For 'Recent' mock string comparison just for demo
    if (activeSort === 'Recent') return a.lastLogged.localeCompare(b.lastLogged);
    return 0;
  });

  // Handlers
  const handleArchive = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, isArchived: true } : g));
    setIsContextMenuOpen(false);
  };
  const handleRestore = (id: string) => {
    setGoals(prev => prev.map(g => g.id === id ? { ...g, isArchived: false } : g));
  };
  const handleDelete = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleLongPress = (id: string) => {
    setSelectedGoalId(id);
    setIsContextMenuOpen(true);
  };

  // Drag handlers for sheets
  const handleAddTouchStart = (e: React.TouchEvent) => { };
  const handleAddTouchMove = (e: React.TouchEvent) => { };
  const handleAddTouchEnd = () => {
    if (addSheetY > 150) setIsAddSheetOpen(false);
    setAddSheetY(0);
  };

  return (
    <div className="app-container text-foreground bg-secondary/30">

      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border pt-12 pb-3 px-6 flex items-center justify-between">
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

      <div className="scroll-area pt-4 px-6">

        {/* Category Filter Strip */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-6 -mx-6 px-6 pb-2">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat as any)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[14px] font-[500] transition-colors border ${activeFilter === cat
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-muted-foreground border-border active:bg-secondary'
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Goal Cards */}
        <div className="space-y-4 mb-8">
          {displayedGoals.map(goal => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onLongPress={() => handleLongPress(goal.id)}
              onClick={onGoalClick}
            />
          ))}
          {displayedGoals.length === 0 && (
            <div className="text-center py-10 text-muted-foreground text-[14px] font-[500]">
              No active goals found.
            </div>
          )}
        </div>

        {/* Archived Section */}
        {archivedGoals.length > 0 && (
          <div className="mb-8">
            <button
              className="w-full flex items-center justify-between p-4 bg-card border border-border rounded-[8px] active:bg-secondary transition-colors"
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
                  <div key={goal.id} className="bg-card border border-border rounded-[8px] p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                        {React.createElement((ICONS as any)[goal.iconName] || Target, { size: 16 })}
                      </div>
                      <div>
                        <h4 className="text-[16px] font-[500] text-foreground mb-0.5">{goal.name}</h4>
                        <span className="text-[12px] text-muted-foreground">Ended • {goal.streak} day streak</span>
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

      {/* Bottom Nav */}
      <nav className="absolute bottom-0 w-full h-[80px] bg-card border-t border-border flex items-center justify-between px-6 pb-safe z-40">
        <NavItem icon={Home} label="Today" onClick={() => onNavigate('Today')} />
        <NavItem icon={Target} label="Goals" active onClick={() => onNavigate('Goals')} />
        <NavItem icon={Check} label="Tasks" onClick={() => onNavigate('Tasks')} />
        <NavItem icon={BarChart2} label="Analytics" onClick={() => onNavigate('Analytics')} />
        <NavItem icon={User} label="Profile" onClick={() => onNavigate('Profile')} />
      </nav>

      {/* Context Menu Bottom Sheet */}
      {isContextMenuOpen && (
        <div className="absolute inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity"
            onClick={() => setIsContextMenuOpen(false)}
          />
          <div
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[16px] shadow-[0_4px_6px_-2px_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)] pb-safe transform transition-transform duration-300"
            style={{ animation: 'slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="p-4 pt-3 flex justify-center">
              <div className="w-12 h-1.5 bg-muted rounded-full" />
            </div>
            <div className="px-2 pb-2">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-secondary rounded-[8px] transition-colors">
                <Play size={18} className="text-primary" />
                <span className="text-[16px] font-[500] text-foreground">Log Session</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-secondary rounded-[8px] transition-colors">
                <Edit2 size={18} className="text-foreground" />
                <span className="text-[16px] font-[500] text-foreground">Edit Goal</span>
              </button>
              <div className="h-px bg-border my-1 mx-2" />
              <button
                onClick={() => selectedGoalId && handleArchive(selectedGoalId)}
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-destructive/10 rounded-[8px] transition-colors text-destructive"
              >
                <Archive size={18} />
                <span className="text-[16px] font-[500]">Archive Goal</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Goal Bottom Sheet */}
      {isAddSheetOpen && (
        <AddGoalSheet
          onClose={() => setIsAddSheetOpen(false)}
          onTouchStart={handleAddTouchStart}
          onTouchMove={handleAddTouchMove}
          onTouchEnd={handleAddTouchEnd}
          sheetY={addSheetY}
        />
      )}

    </div>
  );
}

// Subcomponents

function GoalCard({ goal, onLongPress, onClick }: { goal: Goal, onLongPress: () => void, onClick?: () => void }) {
  const IconCmp = (ICONS as any)[goal.iconName] || Target;

  // Fake progress calculation
  const start = new Date(goal.startDate).getTime();
  const end = new Date(goal.endDate).getTime();
  const now = Date.now();
  const progressPercent = Math.max(0, Math.min(100, ((now - start) / (end - start)) * 100));

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

  return (
    <div
      className="relative bg-card border border-border rounded-[12px] p-4 flex flex-col shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.1)] overflow-hidden active:scale-[0.98] transition-transform select-none"
      onClick={onClick}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
      onTouchMove={cancelPress}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
    >
      {/* Accent Bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${CATEGORY_COLORS[goal.category]}`} />

      <div className="flex items-start justify-between mb-3 ml-2">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${CATEGORY_BG_COLORS[goal.category]} ${CATEGORY_TEXT_COLORS[goal.category]}`}>
            <IconCmp size={20} />
          </div>
          <div>
            <h3 className="text-[18px] font-[600] text-foreground tracking-[-0.4px] leading-tight mb-1.5">{goal.name}</h3>
            <div className="flex items-center gap-2 text-[12px] font-[600]">
              <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">{goal.category}</span>
              <span className={`px-2 py-0.5 rounded-full ${PRIORITY_COLORS[goal.priority]}`}>{goal.priority}</span>
            </div>
          </div>
        </div>
      </div >

      <div className="ml-2 mt-2">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-1.5 text-[14px] font-[600]">
            <Flame size={16} className={goal.streak > 0 ? "text-orange-500" : "text-muted-foreground"} />
            <span className={goal.streak > 0 ? "text-foreground" : "text-muted-foreground"}>
              {goal.streak} day streak
            </span>
          </div>
          <span className="text-[12px] text-muted-foreground font-[500]">
            Ends {new Date(goal.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>
        </div>

        {/* Progress Details */}
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[12px] font-[600] text-foreground">
            {Math.round(progressPercent)}% complete
          </span>
          <span className={`text-[12px] font-[600] ${remainingMs < (7 * 24 * 60 * 60 * 1000) && remainingMs > 0 ? 'text-orange-500' : 'text-muted-foreground'}`}>
            {remainingText}
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full ${CATEGORY_COLORS[goal.category]}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="text-[11px] font-[500] text-muted-foreground text-right mt-1">
          Last logged: {goal.lastLogged}
        </div>
      </div>
    </div >
  );
}

function AddGoalSheet({ onClose, onTouchStart, onTouchMove, onTouchEnd, sheetY }: any) {
  const [name, setName] = useState('My New Goal');
  const [category, setCategory] = useState<Category>('Health');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [icon, setIcon] = useState('target');

  const mockPreviewGoal: Goal = {
    id: 'preview', name: name || 'Goal Name', category, priority, streak: 0, iconName: icon, startDate: new Date().toISOString(), endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), lastLogged: 'Never', isArchived: false
  };

  return (
    <div className="absolute inset-0 z-50 overflow-hidden flex flex-col justify-end">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div
        className="relative bg-card rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col"
        style={{
          animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          transform: `translateY(${sheetY}px)`,
          height: '92dvh'
        }}
      >
        <div
          className="p-4 pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing shrink-0"
          onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
        >
          <div className="w-12 h-1.5 bg-muted rounded-full" />
        </div>

        <div className="px-6 pb-2 shrink-0 flex justify-between items-center">
          <h2 className="text-[20px] font-[700] tracking-[-0.4px]">New Goal</h2>
          <button onClick={onClose} className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-muted-foreground active:opacity-70"><X size={18} /></button>
        </div>

        {/* Live Preview area (sticky top) */}
        <div className="px-6 py-4 shrink-0 bg-secondary/30 border-b border-border">
          <p className="text-[12px] font-[600] text-muted-foreground uppercase tracking-[0.8px] mb-2">Live Preview</p>
          <div className="pointer-events-none">
            <GoalCard goal={mockPreviewGoal} onLongPress={() => { }} />
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-24">

          <div>
            <label className="block text-[14px] font-[500] mb-2 text-foreground">Goal Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Run 5k"
              className="w-full h-[40px] border border-input rounded-[8px] px-3 bg-background text-[16px] font-[400] text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring transition-all"
            />
          </div>

          <div>
            <label className="block text-[14px] font-[500] mb-2 text-foreground">Category</label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat} onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-[14px] font-[500] border transition-colors ${category === cat ? `${CATEGORY_BG_COLORS[cat]} ${CATEGORY_TEXT_COLORS[cat]} border-transparent` : 'bg-card text-muted-foreground border-border'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-[500] mb-2 text-foreground">Priority</label>
            <div className="flex p-1 bg-secondary rounded-[8px]">
              {(['High', 'Medium', 'Low'] as Priority[]).map(p => (
                <button
                  key={p} onClick={() => setPriority(p)}
                  className={`flex-1 py-1.5 rounded-[6px] text-[14px] font-[500] transition-colors ${priority === p ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-[500] mb-2 text-foreground">Icon</label>
            <div className="grid grid-cols-6 gap-2">
              {Object.keys(ICONS).map(key => {
                const Ic = (ICONS as any)[key];
                return (
                  <button
                    key={key} onClick={() => setIcon(key)}
                    className={`aspect-square rounded-[8px] flex items-center justify-center border transition-all ${icon === key ? 'bg-primary text-primary-foreground border-primary scale-110 shadow-sm' : 'bg-card text-muted-foreground border-border active:bg-secondary'}`}
                  >
                    <Ic size={20} />
                  </button>
                )
              })}
            </div>
          </div >

        </div >

        {/* Fixed Bottom Action */}
        < div className="p-6 bg-card border-t border-border pb-safe shrink-0" >
          <button className="w-full h-[44px] rounded-[8px] bg-primary text-primary-foreground text-[16px] font-[600] active:opacity-90 transition-opacity">
            Create Goal
          </button>
        </div >
      </div >
    </div >
  );
}

function NavItem({ icon: Icon, label, active, onClick }: any) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 min-w-[64px] h-full ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
      <Icon size={20} className={active ? 'text-foreground' : 'text-muted-foreground'} />
      <span className="text-[11px] font-[500] leading-none">{label}</span>
    </button>
  );
}
