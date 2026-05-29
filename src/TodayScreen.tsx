import {
  BarChart2,
  Calendar,
  Check,
  ChevronDown,
  Flame,
  Home,
  Play,
  Plus,
  Target,
  Trophy,
  User
} from 'lucide-react';
import React, { useState } from 'react';


const GOALS = [
  { id: '1', name: 'Morning Run', category: 'Health', streak: 14, icon: Play, atRisk: false },
  { id: '2', name: 'Read 20 Pages', category: 'Learning', streak: 5, icon: Calendar, atRisk: false },
  { id: '3', name: 'Deep Work Block', category: 'Career', streak: 3, icon: Trophy, atRisk: true },
  { id: '4', name: 'Meditate', category: 'Wellness', streak: 0, icon: Target, atRisk: false },
];

const INITIAL_TASKS = [
  { id: 't1', goalId: '1', title: '5km jog', minVersion: '1km walk', completed: true },
  { id: 't2', goalId: '2', title: 'Read Chapter 4', minVersion: 'Read 1 page', completed: true },
  { id: 't3', goalId: '3', title: 'Write PRD', minVersion: 'Outline PRD', completed: false },
  { id: 't4', goalId: '4', title: '10 min meditation', minVersion: '3 deep breaths', completed: false },
  { id: 't5', goalId: '3', title: 'Review PRs', minVersion: 'Review 1 PR', completed: false },
  { id: 't6', goalId: '2', title: 'Take notes', minVersion: 'Highlight key points', completed: false },
];

export default function TodayScreen({ onNavigate }: any) {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [points, setPoints] = useState(47);
  const targetPoints = 100;
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const [sheetY, setSheetY] = useState(0);

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const handleToggleTask = (taskId: string) => {
    setTasks(prev => {
      const idx = prev.findIndex(t => t.id === taskId);
      if (idx === -1) return prev;

      const isCompleting = !prev[idx].completed;
      const next = [...prev];
      next[idx] = { ...next[idx], completed: isCompleting };

      if (isCompleting) {
        setPoints(p => Math.min(p + 15, 200));
        const remaining = next.filter(t => !t.completed);
        if (remaining.length === 0 && prev.filter(t => !t.completed).length === 1) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      } else {
        setPoints(p => Math.max(0, p - 15));
      }

      return next;
    });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const isTuesday = new Date().getDay() === 2;
  const dateStr = isTuesday ? 'Tuesday' : new Date().toLocaleDateString('en-US', { weekday: 'long' });

  // Handle Sheet Drag
  const handleTouchStart = (e: React.TouchEvent) => {
    // simplified drag handling
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    // simplified drag handling
  };
  const handleTouchEnd = () => {
    if (sheetY > 100) {
      setIsLogSheetOpen(false);
    }
    setSheetY(0);
  };

  return (
    <>
      <div className="app-container text-foreground">
        <div className="scroll-area px-6 pt-12">

          <header className="mb-8">
            <h1 className="text-[30px] font-[600] tracking-[-0.4px] leading-tight text-foreground">{greeting},</h1>
            <p className="text-muted-foreground text-[16px] font-[400] mt-1">{dateStr}, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
          </header>

          <section className="mb-10 flex flex-col items-center">
            <div className="relative w-48 h-48 mb-4">
              <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                <circle cx="50" cy="50" r="45" fill="none" className="stroke-muted" strokeWidth="8" />
                <circle
                  cx="50" cy="50" r="45"
                  fill="none"
                  className="stroke-primary transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={`${(points / targetPoints) * 283} 283`}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[48px] font-[800] leading-none tracking-[-0.4px] text-foreground">{points}</span>
                <span className="text-muted-foreground text-[14px] font-[500] mt-1">/ {targetPoints} pts</span>
              </div>
            </div>
            <p className="text-muted-foreground text-[14px] font-[500] text-center">
              {points === 0 ? "Ready to crush it today?" :
                points < targetPoints / 2 ? "Keep the momentum going!" :
                  points < targetPoints ? "Almost there, push through!" :
                    "Target hit! Outstanding work."}
            </p>
          </section>

          <section className="mb-10 -mx-6 px-6">
            <h2 className="text-[20px] font-[600] mb-4 tracking-[-0.4px] text-foreground">Active Streaks</h2>
            <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2 -mr-6 pr-6">
              {GOALS.map(goal => (
                <div
                  key={goal.id}
                  className={`flex-shrink-0 w-32 bg-card rounded-[8px] p-4 flex flex-col items-center text-center border ${goal.atRisk ? 'at-risk-pulse' : 'border-border'} shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.1)]`}
                >
                  <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mb-3">
                    <goal.icon size={16} />
                  </div>
                  <h3 className="text-[14px] font-[500] text-foreground leading-tight mb-2 line-clamp-2">{goal.name}</h3>
                  <div className="mt-auto flex items-center gap-1.5 text-[14px] font-[500]">
                    <Flame size={16} className={goal.streak > 0 ? "text-orange-500" : "text-muted-foreground"} />
                    <span className={goal.streak > 0 ? "text-foreground" : "text-muted-foreground"}>
                      {goal.streak} {goal.streak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-10">
            <h2 className="text-[20px] font-[600] mb-4 tracking-[-0.4px] text-foreground">Today's Tasks</h2>

            {incompleteTasks.length === 0 && completedTasks.length > 0 && (
              <div className="py-8 flex flex-col items-center justify-center text-center bg-card border border-border rounded-[8px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.1)] p-6">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                  <Check size={32} />
                </div>
                <h3 className="text-[20px] font-[600] mb-2 text-foreground tracking-[-0.4px]">All done for today!</h3>
                <p className="text-muted-foreground text-[16px] font-[400]">You've completed all your scheduled tasks.</p>
              </div>
            )}

            {incompleteTasks.length > 0 && (
              <div className="space-y-3 mb-6">
                {incompleteTasks.map(task => (
                  <TaskRow key={task.id} task={task} onToggle={() => handleToggleTask(task.id)} goals={GOALS} />
                ))}
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-4 mt-6">
                  <div className="h-px bg-border flex-1"></div>
                  <span className="text-muted-foreground text-[14px] font-[500]">Completed</span>
                  <div className="h-px bg-border flex-1"></div>
                </div>
                <div className="space-y-3 opacity-60">
                  {completedTasks.map(task => (
                    <TaskRow key={task.id} task={task} onToggle={() => handleToggleTask(task.id)} goals={GOALS} />
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="bg-card border border-border rounded-[8px] p-[24px] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.1)] mb-8">
            <h3 className="text-[16px] font-[600] mb-4 text-foreground">Daily Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[24px] font-[600] mb-1 text-foreground tracking-[-0.4px]">{completedTasks.length}/{tasks.length}</div>
                <div className="text-muted-foreground text-[14px] font-[500]">Tasks</div>
              </div>
              <div>
                <div className="text-[24px] font-[600] mb-1 text-foreground tracking-[-0.4px]">2</div>
                <div className="text-muted-foreground text-[14px] font-[500]">Goals</div>
              </div>
              <div>
                <div className="text-[24px] font-[600] mb-1 text-foreground tracking-[-0.4px]">1h 15m</div>
                <div className="text-muted-foreground text-[14px] font-[500]">Logged</div>
              </div>
            </div>
          </section>

        </div>

        <button
          onClick={() => setIsLogSheetOpen(true)}
          className="absolute right-6 bottom-24 w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_4px_6px_-2px_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)] transform transition active:scale-95 z-40"
        >
          <Plus size={24} />
        </button>

        <nav className="absolute bottom-0 w-full h-[80px] bg-card border-t border-border flex items-center justify-between px-6 pb-safe z-40">
          <NavItem icon={Home} label="Today" active onClick={() => onNavigate('Today')} />
          <NavItem icon={Target} label="Goals" onClick={() => onNavigate('Goals')} />
          <NavItem icon={Check} label="Tasks" onClick={() => onNavigate('Tasks')} />
          <NavItem icon={BarChart2} label="Analytics" onClick={() => onNavigate('Analytics')} />
          <NavItem icon={User} label="Profile" onClick={() => onNavigate('Profile')} />
        </nav>

        {isLogSheetOpen && (
          <div className="absolute inset-0 z-50 overflow-hidden">
            <div
              className="absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity"
              onClick={() => setIsLogSheetOpen(false)}
            />
            <div
              className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[8px] shadow-[0_4px_6px_-2px_rgba(0,0,0,0.05),0_10px_15px_-3px_rgba(0,0,0,0.1)] transform transition-transform duration-300"
              style={{
                animation: 'slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: `translateY(${sheetY}px)`
              }}
            >
              <div
                className="p-6 pt-4 cursor-grab active:cursor-grabbing"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6" />
                <h3 className="text-[24px] font-[600] mb-6 tracking-[-0.4px] text-foreground">Log Session</h3>

                <div className="space-y-6">
                  <div>
                    <label className="block text-[14px] font-[500] mb-2 text-foreground">Select Goal</label>
                    <div className="w-full h-[36px] border border-input rounded-[6px] px-3 flex items-center justify-between bg-background">
                      <span className="text-[16px] text-foreground font-[400]">Deep Work Block</span>
                      <ChevronDown size={16} className="text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[14px] font-[500] mb-2 text-foreground">Duration (minutes)</label>
                    <input
                      type="number"
                      defaultValue="30"
                      className="w-full h-[36px] border border-input rounded-[6px] px-3 bg-background text-[16px] font-[400] text-foreground outline-none focus:border-ring focus:ring-1 focus:ring-ring"
                    />
                    <div className="flex flex-wrap gap-2 mt-3">
                      {[5, 10, 15, 20, 30, 45, 60].map(m => (
                        <button key={m} className="h-[32px] px-4 rounded-full bg-secondary text-secondary-foreground text-[14px] font-[500] transition-colors active:bg-muted">
                          {m}m
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setIsLogSheetOpen(false)}
                    className="w-full h-[36px] bg-primary text-primary-foreground rounded-[6px] font-[500] text-[14px] mt-4 transition-colors active:bg-primary/90"
                  >
                    Save Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showConfetti && (
          <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
            {Array.from({ length: 40 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: '-5%',
                  backgroundColor: ['#dc2626', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][Math.floor(Math.random() * 5)],
                  animation: `confetti-fall ${1 + Math.random() * 2}s linear forwards`,
                  animationDelay: `${Math.random() * 0.3}s`
                }}
              />
            ))}
          </div>
        )}

      </div>
    </>
  );
}

function TaskRow({ task, onToggle, goals }: any) {
  const goal = goals.find((g: any) => g.id === task.goalId);
  return (
    <div
      className={`bg-card border border-border rounded-[8px] p-4 flex items-start gap-3 transition-all active:scale-[0.98] ${task.completed ? '' : 'shadow-[0_1px_2px_rgba(0,0,0,0.06),0_1px_3px_rgba(0,0,0,0.1)]'}`}
      onClick={onToggle}
    >
      <button
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-[1.5px] flex items-center justify-center transition-colors ${task.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 text-transparent'}`}
      >
        <Check size={12} strokeWidth={3} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[12px] font-[500] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground whitespace-nowrap leading-none">
            {goal?.name}
          </span>
        </div>
        <h4 className={`text-[16px] font-[500] mb-1 ${task.completed ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
          {task.title}
        </h4>
        {task.minVersion && (
          <p className="text-[14px] text-muted-foreground flex items-center gap-1 font-[500]">
            <span className="opacity-70">Min:</span> {task.minVersion}
          </p>
        )}
      </div>
    </div>
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
