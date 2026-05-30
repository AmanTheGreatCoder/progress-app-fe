import React from 'react';
import { Check, Edit2, Trash2, Repeat, Flame } from 'lucide-react';
import type { Task, Goal } from '@/shared/types';

interface TaskRowProps {
  task: Task;
  goals?: Goal[];
  isLast?: boolean;
  onToggle: () => void;
}

const normTags = (raw: unknown): string[] =>
  Array.isArray(raw) ? raw : (raw ? String(raw).split(',').filter(Boolean) : []);

export const TaskRow: React.FC<TaskRowProps> = ({ task, goals, isLast = false, onToggle }) => {
  const goal = goals?.find(g => g.id === task.goalId) || (task.goalId ? { title: 'Goal', category: 'General' } : null);

  return (
    <div className={`relative bg-card flex items-stretch ${!isLast ? 'border-b border-border' : ''} overflow-hidden transition-all ${!task.completed ? 'hover:bg-secondary/20' : ''}`}>
      {/* Hidden Swipe Actions (Left & Right) */}
      <div className="absolute inset-0 flex justify-between items-center z-0 px-4">
        <div className="flex gap-2 opacity-50"><Edit2 size={18} /></div>
        <div className="flex gap-2 text-destructive opacity-50"><Trash2 size={18} /></div>
      </div>

      {/* Main Task Row */}
      <div
        className="relative z-10 w-full bg-card p-4 flex gap-3 transition-transform duration-200 active:bg-secondary/50"
      >
        <button 
          onClick={onToggle} 
          className={`mt-0.5 shrink-0 flex items-center justify-center w-5 h-5 rounded-full border-[1.5px] transition-colors ${task.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 text-transparent hover:border-primary/50'}`}
        >
          <Check size={12} strokeWidth={3} />
        </button>

        <div className={`flex-1 min-w-0 ${task.completed ? 'opacity-50 line-through' : ''}`}>
          {goal && (
             <div className="flex items-center gap-2 mb-1.5">
               <span className="text-[11px] font-[600] px-2 py-0.5 rounded-[4px] bg-primary/10 text-primary whitespace-nowrap leading-none">
                 {goal.title || 'Goal'}
               </span>
             </div>
          )}
          <div className="text-[15px] font-[500] text-foreground leading-snug mb-1">{task.name}</div>
          {task.minVersion && (
            <div className="text-[13px] italic text-muted-foreground mb-1.5">Min: {task.minVersion}</div>
          )}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mt-2">
            {task.dueDateStr && (
              <span className={`text-[12px] font-[500] ${task.status === 'Overdue' ? 'text-destructive font-[600]' : 'text-muted-foreground'}`}>
                {task.status === 'Overdue' ? `${task.dueDateStr} (Overdue)` : task.dueDateStr}
              </span>
            )}
            {task.isRecurring && (
              <span className="flex items-center gap-0.5 text-[11px] font-[600] text-muted-foreground">
                <Repeat size={10} />
                {task.frequency}
                {task.streak !== undefined && <span className="ml-1 text-orange-500 flex items-center gap-0.5"><Flame size={10} />{task.streak}</span>}
              </span>
            )}
            {normTags(task.tags).map((tag: string) => (
              <span key={tag} className="text-[11px] font-[500] text-muted-foreground bg-secondary px-1.5 py-0.5 rounded-[4px]">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
