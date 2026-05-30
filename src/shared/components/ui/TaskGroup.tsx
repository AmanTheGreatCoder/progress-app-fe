import React from 'react';
import { TaskRow } from '@/shared/components/ui/TaskRow';
import type { Task, Goal } from '@/shared/types';

interface TaskGroupProps {
  title: string;
  titleColor?: string;
  tasks: Task[];
  goals?: Goal[];
  onToggle: (id: string) => void;
  isRecurring?: boolean;
}

export const TaskGroup: React.FC<TaskGroupProps> = ({ title, titleColor = 'text-foreground', tasks, goals, onToggle }) => {
  if (tasks.length === 0) return null;
  
  return (
    <div>
      <h3 className={`text-[18px] font-[700] mb-3 px-2 tracking-[-0.4px] ${titleColor}`}>{title}</h3>
      <div className="bg-card border border-border rounded-[16px] overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.06)] relative">
        {tasks.map((task, i) => (
          <TaskRow
            key={task.id}
            task={task}
            goals={goals}
            isLast={i === tasks.length - 1}
            onToggle={() => onToggle(task.id)}
          />
        ))}
      </div>
    </div>
  );
};
