import { useState, useEffect } from 'react';
import { Target, Play, Calendar, Check, ChevronDown, Plus, Flame } from 'lucide-react';
import { useAppStore } from '@/shared/store/useAppStore';
import { BottomNav } from '@/shared/components/layout/BottomNav';
import { BottomSheet } from '@/shared/components/ui/BottomSheet';
import { TaskRow } from '@/shared/components/ui/TaskRow';

export default function TodayScreen() {
  const { tasks, goals, points, targetPoints, fetchTasks, fetchGoals, fetchDashboard, toggleTaskCompletion } = useAppStore();
  const [showConfetti, setShowConfetti] = useState(false);
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);

  useEffect(() => {
    fetchTasks('today');
    fetchGoals();
    fetchDashboard();
  }, [fetchTasks, fetchGoals, fetchDashboard]);

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const handleToggleTask = (taskId: string) => {
    const isCompleting = !tasks.find(t => t.id === taskId)?.completed;
    toggleTaskCompletion(taskId).then(() => {
      if (isCompleting) {
        const remaining = tasks.filter(t => !t.completed && t.id !== taskId);
        if (remaining.length === 0) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
      }
    });
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const isTuesday = new Date().getDay() === 2;
  const dateStr = isTuesday ? 'Tuesday' : new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="app-container text-foreground h-[100dvh] w-full overflow-hidden flex flex-col relative bg-background">
      <div className="flex-1 min-h-0 flex flex-col gap-4 overflow-y-auto overflow-x-hidden px-4 pt-8">
        <header className="mb-2">
          <h1 className="text-[30px] font-[600] tracking-[-0.4px] leading-tight text-foreground">{greeting},</h1>
          <p className="text-muted-foreground text-[16px] font-[400] mt-1">{dateStr}, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
        </header>

        <section className="flex flex-col items-center">
          <div className="relative w-48 h-48 mb-4 drop-shadow-xl">
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

        <section>
          <h2 className="text-[20px] font-[700] tracking-[-0.4px] mb-2 text-foreground">Active Streaks</h2>
          <div className="flex overflow-x-auto hide-scrollbar gap-4 pb-2 -mx-4 px-4">
            {goals.map(goal => {
              const Icon = goal.category === 'Health' ? Play : goal.category === 'Learning' ? Calendar : Target;
              const streak = goal.streak || 0;
              return (
                <div
                  key={goal.id}
                  className="flex-shrink-0 w-32 bg-card rounded-[16px] p-4 flex flex-col items-center text-center border border-border shadow-sm transition-transform active:scale-95"
                >
                  <div className="w-10 h-10 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mb-3">
                    <Icon size={16} />
                  </div>
                  <h3 className="text-[14px] font-[600] text-foreground leading-tight mb-2 line-clamp-2">{goal.title}</h3>
                  <div className="mt-auto flex items-center gap-1.5 text-[14px] font-[500]">
                    <Flame size={16} className={streak > 0 ? "text-orange-500" : "text-muted-foreground"} />
                    <span className={streak > 0 ? "text-foreground" : "text-muted-foreground"}>
                      {streak} {streak === 1 ? 'day' : 'days'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-[20px] font-[700] tracking-[-0.4px] mb-2 text-foreground">Today's Tasks</h2>

          {incompleteTasks.length === 0 && completedTasks.length > 0 && (
            <div className="py-8 flex flex-col items-center justify-center text-center bg-card border border-border rounded-[16px] shadow-sm p-6 mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
                <Check size={32} />
              </div>
              <h3 className="text-[20px] font-[700] mb-2 text-foreground tracking-[-0.4px]">All done for today!</h3>
              <p className="text-muted-foreground text-[16px] font-[400]">You've completed all your scheduled tasks.</p>
            </div>
          )}

          {incompleteTasks.length > 0 && (
            <div className="bg-card border border-border rounded-[16px] overflow-hidden shadow-sm mb-6">
              {incompleteTasks.map((task, i) => (
                <TaskRow key={task.id} task={task} goals={goals} isLast={i === incompleteTasks.length - 1} onToggle={() => handleToggleTask(task.id)} />
              ))}
            </div>
          )}

          {completedTasks.length > 0 && (
            <div>
              <div className="flex items-center gap-4 mb-4 mt-6">
                <div className="h-px bg-border flex-1"></div>
                <span className="text-muted-foreground text-[14px] font-[600]">Completed</span>
                <div className="h-px bg-border flex-1"></div>
              </div>
              <div className="bg-card border border-border rounded-[16px] overflow-hidden shadow-sm opacity-60">
                {completedTasks.map((task, i) => (
                  <TaskRow key={task.id} task={task} goals={goals} isLast={i === completedTasks.length - 1} onToggle={() => handleToggleTask(task.id)} />
                ))}
              </div>
            </div>
          )}


          <section className="bg-card border border-border rounded-[16px] p-4 shadow-sm mb-8">
            <h3 className="text-[16px] font-[700] mb-4 text-foreground tracking-[-0.4px]">Daily Summary</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-[24px] font-[700] mb-1 text-foreground tracking-[-0.4px]">{completedTasks.length}/{tasks.length}</div>
                <div className="text-muted-foreground text-[14px] font-[500]">Tasks</div>
              </div>
              <div>
                <div className="text-[24px] font-[700] mb-1 text-foreground tracking-[-0.4px]">{goals.length}</div>
                <div className="text-muted-foreground text-[14px] font-[500]">Goals</div>
              </div>
              <div>
                <div className="text-[24px] font-[700] mb-1 text-foreground tracking-[-0.4px]">1h 15m</div>
                <div className="text-muted-foreground text-[14px] font-[500]">Logged</div>
              </div>
            </div>
          </section>
        </section>

      </div>

      <button
        onClick={() => setIsLogSheetOpen(true)}
        className="absolute right-6 bottom-[100px] w-14 h-14 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform z-40"
      >
        <Plus size={24} />
      </button>

      <BottomNav />

      <BottomSheet
        isOpen={isLogSheetOpen}
        onClose={() => setIsLogSheetOpen(false)}
        title="Log Session"
        footer={
          <button onClick={() => setIsLogSheetOpen(false)} className="w-full h-[48px] bg-primary text-primary-foreground rounded-[12px] font-[600] text-[16px] hover:bg-primary/90 active:scale-[0.98] transition-all">
            Save Session
          </button>
        }
      >
        <div>
          <label className="block text-[14px] font-[500] mb-2 text-foreground">Select Goal</label>
          <div className="w-full h-[40px] border border-input rounded-[8px] px-3 flex items-center justify-between bg-background cursor-pointer hover:border-primary transition-colors">
            <span className="text-[16px] text-foreground font-[400]">Deep Work Block</span>
            <ChevronDown size={16} className="text-muted-foreground" />
          </div>
        </div>

        <div>
          <label className="block text-[14px] font-[500] mb-2 text-foreground">Duration (minutes)</label>
          <input
            type="number"
            defaultValue="30"
            className="w-full h-[40px] border border-input rounded-[8px] px-3 bg-background text-[16px] font-[400] text-foreground outline-none focus:border-primary transition-colors"
          />
          <div className="flex flex-wrap gap-2 mt-4">
            {[5, 10, 15, 20, 30, 45, 60].map(m => (
              <button key={m} className="h-[36px] px-4 rounded-full bg-secondary text-secondary-foreground text-[14px] font-[600] transition-colors hover:bg-secondary/80 active:bg-muted">
                {m}m
              </button>
            ))}
          </div>
        </div>
      </BottomSheet>

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
  );
}
