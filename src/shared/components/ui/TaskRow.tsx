import React from 'react';
import { Icon } from './Icon';
import type { Task } from '@shared/types';

interface TaskRowProps {
  task: Task;
  onToggle?: () => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({ task, onToggle }) => {
  const isDone = task.done;
  const isMin = task.completedMin && !isDone;

  return (
    <div className={`flex items-center gap-3.5 py-3.5 px-4 border-b border-c-border ${isDone ? 'opacity-70' : ''}`}>
      <button
        onClick={onToggle}
        aria-label={isDone ? 'Mark task incomplete' : 'Mark task complete'}
        className="w-6 h-6 rounded-lg shrink-0 grid place-items-center p-0"
        style={{
          background: isDone ? 'var(--success)' : isMin ? 'color-mix(in srgb, var(--warning) 20%, transparent)' : 'transparent',
          border: `1.7px solid ${isDone ? 'var(--success)' : isMin ? 'var(--warning)' : 'var(--border)'}`,
          cursor: onToggle ? 'pointer' : 'default',
        }}
      >
        {isDone && <Icon name="check" size={14} color="var(--bg)" stroke={2.8} />}
        {isMin && <Icon name="arrow-down" size={14} color="var(--warning)" stroke={2.8} />}
      </button>

      <div className="flex-1 min-w-0">
        <div
          className={`text-base font-medium truncate ${isMin ? 'opacity-80' : ''}`}
          style={{
            color: isDone ? 'var(--text-secondary)' : isMin ? 'var(--warning)' : 'var(--text-primary)',
            textDecoration: (isDone || isMin) ? 'line-through' : 'none',
          }}
        >
          {task.title}
        </div>

        <div className="flex flex-col items-start gap-0.5 mt-1">
          {isMin ? (
            <span className="text-2xs text-c-warning font-semibold py-0.5 px-1.5 rounded bg-warning-soft">
              showed up ↓
            </span>
          ) : (
            <span className="text-c-text2 text-2xs">{task.due}</span>
          )}
          <div className="flex flex-wrap gap-1 mt-0.5">
            {task.tags.map(tg => (
              <span key={tg} className="text-2xs font-semibold py-0.5 px-1.5 rounded bg-c-surface2 lowercase text-c-text2">
                #{tg}
              </span>
            ))}
          </div>
          {task.minVersion && !isDone && !isMin && (
            <div className="flex items-center gap-1 mt-0.5 text-c-warning text-2xs font-medium">
              <Icon name="arrow-down" size={12} color="var(--warning)" stroke={2.5} />
              {task.minVersion}
            </div>
          )}
        </div>
      </div>

      {task.points > 0 && (() => {
        const effectivePts = task.completedMin ? Math.round(task.points / 2) : task.points;
        const ptColor = isMin ? 'var(--warning)' : 'var(--primary)';
        return (
          <span
            className="inline-flex items-center gap-1 text-sm font-bold py-1.5 px-2.5 rounded-lg shrink-0"
            style={{
              color: ptColor,
              background: `color-mix(in srgb, ${ptColor} 15%, transparent)`,
            }}
          >
            <Icon name="star" size={12} color={ptColor} stroke={2.5} />
            {isMin && (
              <span className="line-through opacity-40 text-2xs font-semibold">
                {task.points}
              </span>
            )}
            {effectivePts}
          </span>
        );
      })()}
    </div>
  );
};
