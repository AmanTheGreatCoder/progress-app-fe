import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft,
  MoreVertical,
  Flame,
  Trophy,
  Clock,
  Footprints,
  Play,
  Check,
  CheckSquare,
  Square,
  Plus,
  X,
  Edit2,
  Archive
} from 'lucide-react';

// --- Types ---
type Session = { id: string; date: string; duration: number; note: string };
type Task = { id: string; name: string; completed: boolean; dueDate?: string };

// --- Mock Data ---
const TODAY = new Date('2026-05-29'); // Aligning with the current mocked date
const START_DATE = new Date(TODAY.getTime() - 21 * 24 * 60 * 60 * 1000); // 3 weeks ago
const END_DATE = new Date(TODAY.getTime() + 90 * 24 * 60 * 60 * 1000); // 90 days from now

const MOCK_SESSIONS: Session[] = [
  // 14 days streak up to today
  ...Array.from({ length: 14 }).map((_, i) => {
    const d = new Date(TODAY);
    d.setDate(d.getDate() - i);
    return {
      id: `s-${i}`,
      date: d.toISOString().split('T')[0],
      duration: Math.floor(Math.random() * 25) + 20, // 20-45 mins
      note: i === 0 ? 'Pushed to 5km today' : i === 2 ? 'Rainy but did it' : i === 10 ? 'Easy 3km' : ''
    };
  }),
  // Sporadic ones before the streak
  { id: 's-14', date: new Date(TODAY.getTime() - 16 * 86400000).toISOString().split('T')[0], duration: 30, note: 'Felt sluggish' },
  { id: 's-15', date: new Date(TODAY.getTime() - 17 * 86400000).toISOString().split('T')[0], duration: 25, note: '' },
  { id: 's-16', date: new Date(TODAY.getTime() - 19 * 86400000).toISOString().split('T')[0], duration: 40, note: 'Good pace' },
  { id: 's-17', date: new Date(TODAY.getTime() - 20 * 86400000).toISOString().split('T')[0], duration: 20, note: '' },
  { id: 's-18', date: new Date(TODAY.getTime() - 21 * 86400000).toISOString().split('T')[0], duration: 35, note: 'First run!' },
];

const MOCK_TASKS: Task[] = [
  { id: 't-1', name: 'Buy running shoes', completed: true },
  { id: 't-2', name: 'Plan route for week', completed: true },
  { id: 't-3', name: 'Sign up for 5K event', completed: false, dueDate: '2026-06-15' },
];

// Calculate derived totals from mock
const TOTAL_MINUTES = MOCK_SESSIONS.reduce((acc, s) => acc + s.duration, 0);
const INIT_TOTAL_TIME = `${Math.floor(TOTAL_MINUTES / 60)}h ${TOTAL_MINUTES % 60}m`;

// Helper for formatting dates nicely
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const now = new Date(TODAY);
  if (d.toDateString() === now.toDateString()) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
};

// Generates the past 90 days for the heatmap
const HEATMAP_DAYS = Array.from({ length: 90 }).map((_, i) => {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - (89 - i));
  return d.toISOString().split('T')[0];
});

export default function GoalDetailScreen() {
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  
  const [isLogSheetOpen, setIsLogSheetOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAllSessions, setShowAllSessions] = useState(false);
  const [tooltipData, setTooltipData] = useState<{ date: string, x: number, y: number, info: string } | null>(null);
  const [sheetY, setSheetY] = useState(0);

  // Derived metrics
  const sessionMap = sessions.reduce((acc, s) => {
    acc[s.date] = (acc[s.date] || 0) + s.duration;
    return acc;
  }, {} as Record<string, number>);

  const hasLoggedToday = !!sessionMap[TODAY.toISOString().split('T')[0]];
  const streak = hasLoggedToday ? 14 : 13; // Just mocking the logic closely for the visual
  const longestStreak = 14;

  const totalMin = sessions.reduce((acc, s) => acc + s.duration, 0);
  const totalTimeStr = `${Math.floor(totalMin / 60)}h ${totalMin % 60}m`;

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleAddSession = (duration: number, note: string) => {
    const newSession: Session = {
      id: `s-new-${Date.now()}`,
      date: TODAY.toISOString().split('T')[0],
      duration,
      note
    };
    setSessions([newSession, ...sessions]);
    setIsLogSheetOpen(false);
  };

  // Drag handlers for log sheet
  const handleTouchStart = (e: React.TouchEvent) => {};
  const handleTouchMove = (e: React.TouchEvent) => {};
  const handleTouchEnd = () => {
    if (sheetY > 150) setIsLogSheetOpen(false);
    setSheetY(0);
  };

  return (
    <div className="app-container bg-background text-foreground h-full overflow-hidden flex flex-col">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/90 backdrop-blur-md pt-12 pb-4 px-4 flex items-center justify-between border-b border-border">
        <button className="w-10 h-10 flex items-center justify-center rounded-full active:bg-secondary transition-colors text-foreground">
          <ArrowLeft size={24} />
        </button>
        <div className="flex items-center gap-2 font-[600] text-[16px]">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Morning Run
        </div>
        <button 
          onClick={() => setIsMenuOpen(true)}
          className="w-10 h-10 flex items-center justify-center rounded-full active:bg-secondary transition-colors text-foreground"
        >
          <MoreVertical size={24} />
        </button>
      </div>

      <div className="scroll-area flex-1 overflow-y-auto px-6 pt-6 pb-32" onClick={() => setTooltipData(null)}>
        
        {/* Goal Hero Details */}
        <div className="flex flex-col items-center mb-8 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-4">
            <Footprints size={40} />
          </div>
          <h1 className="text-[30px] font-[700] tracking-[-0.4px] mb-2 leading-tight">Morning Run</h1>
          
          <div className="flex items-center justify-center gap-2 text-[14px] font-[600] mb-6">
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Health</span>
            <span className="px-3 py-1 rounded-full bg-destructive/10 text-destructive">High Priority</span>
            <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground">Daily</span>
          </div>

          {/* Key Stats Row */}
          <div className="flex justify-between w-full bg-card border border-border shadow-[0_1px_2px_rgba(0,0,0,0.06)] rounded-[16px] p-5">
            <div className="flex flex-col items-center flex-1">
              <Flame size={24} className="text-orange-500 mb-1" />
              <span className="text-[20px] font-[700] text-foreground leading-none mb-1">{streak}</span>
              <span className="text-[12px] font-[500] text-muted-foreground">Current</span>
            </div>
            <div className="w-px bg-border my-2" />
            <div className="flex flex-col items-center flex-1">
              <Trophy size={24} className="text-amber-500 mb-1" />
              <span className="text-[20px] font-[700] text-foreground leading-none mb-1">{longestStreak}</span>
              <span className="text-[12px] font-[500] text-muted-foreground">Longest</span>
            </div>
            <div className="w-px bg-border my-2" />
            <div className="flex flex-col items-center flex-1">
              <Clock size={24} className="text-blue-500 mb-1" />
              <span className="text-[20px] font-[700] text-foreground leading-none mb-1">{totalTimeStr}</span>
              <span className="text-[12px] font-[500] text-muted-foreground">Total Time</span>
            </div>
          </div>
        </div>

        {/* Timeframe Progress Bar */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-2">
            <span className="text-[14px] font-[600] text-foreground">Timeframe Progress</span>
            <span className="text-[12px] font-[600] text-muted-foreground">19% complete</span>
          </div>
          <div className="w-full h-2.5 bg-secondary rounded-full overflow-hidden mb-2">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: '19%' }} />
          </div>
          <div className="flex justify-between items-center text-[11px] font-[500] text-muted-foreground">
            <span>Started May 8</span>
            <span>Ends Aug 26</span>
          </div>
        </div>

        {/* Streak Contribution Heatmap */}
        <div className="mb-8">
          <h2 className="text-[18px] font-[700] tracking-[-0.4px] mb-4">Activity Heatmap</h2>
          <div className="bg-card border border-border rounded-[16px] p-4 shadow-[0_1px_2px_rgba(0,0,0,0.06)] relative overflow-x-auto hide-scrollbar">
            <div className="flex gap-1.5" style={{ width: 'max-content' }}>
              {/* Split the 90 days into columns of 7 */}
              {Array.from({ length: Math.ceil(90 / 7) }).map((_, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-1.5">
                  {Array.from({ length: 7 }).map((_, rowIndex) => {
                    const dayIndex = colIndex * 7 + rowIndex;
                    if (dayIndex >= 90) return null;
                    const dateStr = HEATMAP_DAYS[dayIndex];
                    const mins = sessionMap[dateStr] || 0;
                    const isBeforeStart = new Date(dateStr) < START_DATE;
                    const isToday = dateStr === TODAY.toISOString().split('T')[0];
                    
                    let bgClass = "bg-secondary/50 border border-transparent";
                    if (isBeforeStart) bgClass = "bg-transparent";
                    else if (mins > 40) bgClass = "bg-emerald-600";
                    else if (mins > 20) bgClass = "bg-emerald-500";
                    else if (mins > 0) bgClass = "bg-emerald-300 dark:bg-emerald-700";

                    return (
                      <div 
                        key={dateStr}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isBeforeStart) return;
                          const rect = e.currentTarget.getBoundingClientRect();
                          setTooltipData({
                            date: dateStr,
                            x: rect.left + rect.width / 2,
                            y: rect.top,
                            info: mins > 0 ? `${mins} mins logged` : `No activity`
                          });
                        }}
                        className={`w-3.5 h-3.5 rounded-[3px] transition-transform active:scale-125 ${bgClass} ${isToday ? 'border-foreground border-[1.5px]' : ''}`}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
            
            {/* Tooltip */}
            {tooltipData && (
              <div 
                className="fixed z-50 bg-foreground text-background px-3 py-1.5 rounded-[6px] text-[12px] font-[500] whitespace-nowrap shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-8px]"
                style={{ left: tooltipData.x, top: tooltipData.y }}
              >
                <div className="font-[600] mb-0.5">{formatDate(tooltipData.date)}</div>
                <div className="opacity-80">{tooltipData.info}</div>
                <div className="absolute w-2 h-2 bg-foreground transform rotate-45 left-1/2 -ml-1 -bottom-1" />
              </div>
            )}
          </div>
        </div>

        {/* Log Session Button */}
        <button 
          onClick={() => setIsLogSheetOpen(true)}
          className={`w-full py-4 rounded-[12px] flex items-center justify-center gap-2 text-[16px] font-[600] shadow-[0_4px_6px_-2px_rgba(0,0,0,0.05)] transition-all active:scale-[0.98] mb-10 ${
            hasLoggedToday 
              ? 'bg-secondary text-foreground border border-border' 
              : 'bg-primary text-primary-foreground'
          }`}
        >
          {hasLoggedToday ? (
            <>
              <Check size={20} />
              Add Another Session
            </>
          ) : (
            <>
              <Play size={20} className="fill-current" />
              Log Today's Session
            </>
          )}
        </button>

        {/* Weekly Time Chart */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-[18px] font-[700] tracking-[-0.4px]">This Week</h2>
            <span className="text-[14px] font-[600] text-emerald-600 dark:text-emerald-400">3h 15m total</span>
          </div>
          
          <div className="h-32 flex items-end justify-between gap-2 px-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              // Mock weekly heights
              const heights = [20, 35, 30, 45, 60, 0, 0];
              const isToday = i === 4; // Friday in mock
              
              return (
                <div key={day} className="flex flex-col items-center flex-1 gap-2">
                  <div className="w-full bg-secondary rounded-t-[4px] relative flex items-end justify-center group" style={{ height: '100px' }}>
                    <div 
                      className={`w-full rounded-t-[4px] transition-all duration-1000 ${isToday ? 'bg-emerald-500' : 'bg-emerald-500/50 dark:bg-emerald-500/30'} ${heights[i] === 0 ? 'bg-transparent' : ''}`}
                      style={{ height: `${heights[i]}%` }}
                    />
                  </div>
                  <span className={`text-[12px] font-[500] ${isToday ? 'text-foreground font-[700]' : 'text-muted-foreground'}`}>{day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Session History */}
        <div className="mb-10">
          <div className="flex justify-between items-end mb-4">
            <h2 className="text-[18px] font-[700] tracking-[-0.4px]">Session History</h2>
          </div>
          <div className="bg-card border border-border rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            {(showAllSessions ? sessions : sessions.slice(0, 5)).map((session, i) => (
              <div key={session.id} className={`p-4 flex items-center justify-between ${i !== 0 ? 'border-t border-border' : ''}`}>
                <div>
                  <div className="text-[14px] font-[600] text-foreground mb-1">{formatDate(session.date)}</div>
                  {session.note && <div className="text-[13px] text-muted-foreground">{session.note}</div>}
                </div>
                <div className="text-[14px] font-[700] text-emerald-600 dark:text-emerald-400">
                  {session.duration} min
                </div>
              </div>
            ))}
            {sessions.length > 5 && (
              <button 
                onClick={() => setShowAllSessions(!showAllSessions)}
                className="w-full p-3 text-center text-[13px] font-[600] text-muted-foreground bg-secondary/50 active:bg-secondary transition-colors border-t border-border"
              >
                {showAllSessions ? 'Show Less' : `Show all ${sessions.length} sessions`}
              </button>
            )}
          </div>
        </div>

        {/* Linked Tasks */}
        <div className="mb-6">
          <h2 className="text-[18px] font-[700] tracking-[-0.4px] mb-4">Linked Tasks</h2>
          <div className="bg-card border border-border rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06)]">
            {tasks.map((task, i) => (
              <div 
                key={task.id} 
                onClick={() => handleToggleTask(task.id)}
                className={`p-4 flex items-center gap-3 active:bg-secondary/50 transition-colors ${i !== 0 ? 'border-t border-border' : ''}`}
              >
                <div className={task.completed ? 'text-primary' : 'text-muted-foreground'}>
                  {task.completed ? <CheckSquare size={20} /> : <Square size={20} />}
                </div>
                <div className={`flex-1 ${task.completed ? 'opacity-50 line-through' : ''}`}>
                  <div className="text-[15px] font-[500] text-foreground">{task.name}</div>
                  {task.dueDate && <div className="text-[12px] text-muted-foreground">Due {formatDate(task.dueDate)}</div>}
                </div>
              </div>
            ))}
            <button className="w-full p-4 flex items-center gap-2 text-[14px] font-[600] text-foreground bg-secondary/30 active:bg-secondary transition-colors border-t border-border">
              <Plus size={16} />
              Add Task
            </button>
          </div>
        </div>
      </div>

      {/* Log Session Bottom Sheet */}
      {isLogSheetOpen && (
        <LogSessionSheet 
          goalName="Morning Run"
          onClose={() => setIsLogSheetOpen(false)}
          onSubmit={handleAddSession}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          sheetY={sheetY}
        />
      )}

      {/* Header Menu Bottom Sheet */}
      {isMenuOpen && (
        <div className="absolute inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity" onClick={() => setIsMenuOpen(false)} />
          <div 
            className="absolute bottom-0 left-0 right-0 bg-card rounded-t-[24px] pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.1)] transform transition-transform"
            style={{ animation: 'slide-up 0.2s cubic-bezier(0.16, 1, 0.3, 1)' }}
          >
            <div className="p-4 pt-3 flex justify-center"><div className="w-12 h-1.5 bg-muted rounded-full" /></div>
            <div className="px-2 pb-4 pt-2 space-y-1">
              <button className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-secondary rounded-[12px] transition-colors">
                <Edit2 size={18} className="text-foreground" />
                <span className="text-[16px] font-[500] text-foreground">Edit Goal</span>
              </button>
              <button 
                className="w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-destructive/10 rounded-[12px] transition-colors text-destructive"
              >
                <Archive size={18} />
                <span className="text-[16px] font-[500]">Archive Goal</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Subcomponents ---

function LogSessionSheet({ goalName, onClose, onSubmit, onTouchStart, onTouchMove, onTouchEnd, sheetY }: any) {
  const [duration, setDuration] = useState(30);
  const [note, setNote] = useState('');

  const QUICK_MINS = [15, 20, 30, 45, 60];

  return (
    <div className="absolute inset-0 z-50 overflow-hidden flex flex-col justify-end">
      <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div 
        className="relative bg-card rounded-t-[24px] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col pb-safe"
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
        
        <div className="px-6 pb-4 shrink-0 flex justify-between items-center">
          <div>
            <h2 className="text-[20px] font-[700] tracking-[-0.4px]">Log Session</h2>
            <p className="text-[14px] text-muted-foreground font-[500]">{goalName}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-muted-foreground active:opacity-70"><X size={18}/></button>
        </div>

        <div className="px-6 py-4 space-y-6">
          <div>
            <label className="block text-[14px] font-[500] mb-3 text-foreground">Duration (minutes)</label>
            <div className="flex items-center gap-4 mb-4">
              <button 
                onClick={() => setDuration(Math.max(5, duration - 5))}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-[700] text-foreground text-[18px]"
              >-</button>
              <div className="flex-1 text-center text-[36px] font-[700] tracking-[-1px] text-foreground">{duration}</div>
              <button 
                onClick={() => setDuration(duration + 5)}
                className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-[700] text-foreground text-[18px]"
              >+</button>
            </div>
            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2 -mx-2 px-2">
              {QUICK_MINS.map(m => (
                <button
                  key={m}
                  onClick={() => setDuration(m)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[14px] font-[600] border transition-colors ${duration === m ? 'bg-primary text-primary-foreground border-primary' : 'bg-card text-muted-foreground border-border'}`}
                >
                  {m}m
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[14px] font-[500] mb-2 text-foreground">Note (Optional)</label>
            <textarea 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How did it go?"
              className="w-full h-[80px] p-3 border border-input rounded-[12px] bg-background text-[15px] font-[400] text-foreground outline-none focus:border-primary transition-colors resize-none placeholder:text-muted-foreground"
            />
          </div>

          <button 
            onClick={() => onSubmit(duration, note)}
            className="w-full h-[48px] rounded-[12px] bg-primary text-primary-foreground text-[16px] font-[600] active:scale-[0.98] transition-transform"
          >
            Save Session
          </button>
        </div>
      </div>
    </div>
  );
}
